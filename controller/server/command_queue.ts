import { Run, RunQueue } from "@/types";
import { ToolStatus } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import RunStore from "./runs";
import Tool from "./tools";
import SqliteQueue, { StoredRunCommand } from "./utils/SqliteQueue";
import path from "path";
import fs from "fs";
import { ToolType } from "gen-interfaces/controller";
import { logger } from "@/logger";
import { logAction } from "./logger";
import { db } from "@/db/client";
import { appSettings, variables, workcells } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { sendEmailMessage, sendSlackMessage } from "@/server/utils/integrationsLocal";

export type CommandQueueState = ToolStatus;

export enum QueueState {
  PAUSED = "PAUSED",
  MESSAGE = "MESSAGE",
  TIMER = "TIMER",
}

// UI message type for differentiating between pause and show_message
export interface UIMessage {
  type: "pause" | "message" | "timer" | "stop_run" | "user_form";
  message: string;
  title?: string;
  pausedAt?: number;
  timerDuration?: number;
  timerEndTime?: number;
  formName?: string; // Add this for user_form
}

export class CommandQueue {
  private _state: CommandQueueState = ToolStatus.OFFLINE;
  private _runningPromise?: Promise<any>;
  error?: Error;
  private _lastAlertKey?: string;
  private _lastAlertAtMs?: number;

  // Message handling state variables
  private _isWaitingForInput: boolean = false;
  private _currentMessage: UIMessage = {
    type: "pause",
    message: "Run is paused. Click Continue to resume.",
    pausedAt: undefined,
  };
  private _messageResolve?: () => void;
  private _timerTimeout?: NodeJS.Timeout;

  commands: SqliteQueue;

  constructor(public runStore: RunStore) {
    const dbPath = process.env.SQLITE_DB_PATH || path.join(process.cwd(), "data", "queue.db");

    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.commands = new SqliteQueue(dbPath, "command_queue_2");
  }

  fail(error: any) {
    if (!(error instanceof Error)) {
      error = new Error(error);
    }
    this._setState(ToolStatus.FAILED);
    this.error = error;
    logger.error("CommandQueue failed:", error);
  }

  private async _getAppSettingValue(name: string): Promise<string | null> {
    const rows = await db.select().from(appSettings).where(eq(appSettings.name, name)).limit(1);
    const s = rows[0];
    if (!s || s.isActive === false) return null;
    return (s.value ?? "").toString();
  }

  private async _getSelectedWorkcellId(): Promise<number> {
    const selectedWorkcellName = await this._getAppSettingValue("workcell");
    if (!selectedWorkcellName) {
      throw new Error("No workcell selected");
    }
    const wc = await db
      .select()
      .from(workcells)
      .where(eq(workcells.name, selectedWorkcellName))
      .limit(1);
    const id = wc[0]?.id;
    if (!id) {
      throw new Error(`Selected workcell '${selectedWorkcellName}' not found`);
    }
    return id;
  }

  private async _getVariableByName(varName: string) {
    const workcellId = await this._getSelectedWorkcellId();
    const rows = await db
      .select()
      .from(variables)
      .where(and(eq(variables.name, varName), eq(variables.workcellId, workcellId)))
      .limit(1);
    return rows[0] || null;
  }

  private async _getSettingBool(name: string, fallback: boolean): Promise<boolean> {
    try {
      const raw = await this._getAppSettingValue(name);
      if (!raw) return fallback;
      const v = String(raw).trim().toLowerCase();
      if (["true", "1", "yes", "on"].includes(v)) return true;
      if (["false", "0", "no", "off"].includes(v)) return false;
      return fallback;
    } catch {
      return fallback;
    }
  }

  private async _notifyFailure(opts: {
    error: Error;
    runId?: string;
    toolId?: string;
    toolType?: ToolType;
    command?: string;
    label?: string;
  }) {
    try {
      const errMsg = opts.error?.message || "Unknown error";
      const runId = opts.runId || "unknown";
      const toolId = opts.toolId || "unknown";
      const cmd = opts.command || "unknown";

      const key = `${runId}|${toolId}|${cmd}|${errMsg}`;
      const now = Date.now();
      if (this._lastAlertKey === key && this._lastAlertAtMs && now - this._lastAlertAtMs < 60_000) {
        return;
      }
      this._lastAlertKey = key;
      this._lastAlertAtMs = now;

      const slackEnabled = this.slackNotificationsEnabled
        ? await this._getSettingBool("enable_slack_alerts_on_failure", true)
        : false;
      const emailEnabled = await this._getSettingBool("enable_email_alerts_on_failure", false);

      if (!slackEnabled && !emailEnabled) return;

      const workcellName = (await this._getAppSettingValue("workcell")) || "unknown";

      const header = `Galago alert: run failure`;
      const lines = [
        `Workcell: ${workcellName}`,
        `Run: ${runId}`,
        `Tool: ${opts.toolType != null ? ToolType[opts.toolType] : "unknown"} (${toolId})`,
        `Command: ${cmd}${opts.label ? ` (${opts.label})` : ""}`,
        `Error: ${errMsg}`,
      ];
      const body = `${header}\n\n${lines.join("\n")}`;

      if (slackEnabled) {
        try {
          await sendSlackMessage({ message: body, auditAction: "integrations.slack.send" });
        } catch (e: any) {
          logger.warn("Slack alert failed:", e?.message || e);
        }
      }

      if (emailEnabled) {
        try {
          await sendEmailMessage({
            subject: header,
            message: body,
            auditAction: "integrations.email.send",
          });
        } catch (e: any) {
          logger.warn("Email alert failed:", e?.message || e);
        }
      }
    } catch (e: any) {
      logger.warn("Failure notification handler failed:", e?.message || e);
    }
  }

  get state(): CommandQueueState {
    return this._state;
  }

  // Check if queue is waiting for user input (either pause or message)
  get isWaitingForInput(): boolean {
    return this._isWaitingForInput;
  }

  // Get current message details
  get currentMessage(): UIMessage {
    return this._currentMessage;
  }

  // State management
  private _setState(newState: CommandQueueState) {
    logger.info(`CommandQueue state: ${newState} (was ${this._state})`);
    this._state = newState;
  }

  async evaluateExpression(expression: string): Promise<any> {
    // Regular expression to find variable references like {{varName}}
    // Arithmetic with numbers
    // ${counter} + 1            // Adds 1 to counter's value
    // ${price} * ${quantity}    // Multiplies two variables
    // (${num1} + ${num2}) / 2   // Average of two numbers

    // // String operations
    // "Hello, " + ${name}       // String concatenation
    // ${firstName} + " " + ${lastName}  // Multiple concatenation

    // // Boolean values (direct assignment)
    // ${isActive}               // Direct assignment for booleans

    // // Mixed operations (with automatic type conversion)
    // "Total: " + (${price} * ${quantity})  // Converts number result to string
    const variablePattern = /\${([^{}]+)}/g;
    let match;
    let resolvedExpression = expression;
    let resolvedVars: Record<string, any> = {};

    // Find all variable references in the expression
    const variablePromises: Promise<void>[] = [];
    const variableMatches: { fullMatch: string; varName: string }[] = [];
    const selectedWorkcellName = (await this._getAppSettingValue("workcell")) || "";
    let selectedWorkcellId: number | null = null;
    if (selectedWorkcellName) {
      const wc = await db
        .select()
        .from(workcells)
        .where(eq(workcells.name, selectedWorkcellName))
        .limit(1);
      selectedWorkcellId = wc[0]?.id ?? null;
    }

    // First, collect all variable references
    while ((match = variablePattern.exec(expression)) !== null) {
      const fullMatch = match[0];
      const varName = match[1].trim();
      variableMatches.push({ fullMatch, varName });

      // Create a promise to fetch each variable
      const promise = (async () => {
        if (!selectedWorkcellId) {
          throw new Error("No workcell selected (required to resolve variables)");
        }
        const rows = await db
          .select()
          .from(variables)
          .where(and(eq(variables.name, varName), eq(variables.workcellId, selectedWorkcellId)))
          .limit(1);
        const varResponse = rows[0];
        if (!varResponse) {
          throw new Error(`Variable ${varName} not found`);
        }
        const value: any = varResponse.value;
        resolvedVars[varName] = {
          value,
          type: (varResponse.type as any) || typeof value,
        };
      })();

      variablePromises.push(promise);
    }

    // Wait for all variable fetches to complete
    await Promise.all(variablePromises);

    // Now replace each variable reference with its value, handling types appropriately
    for (const { fullMatch, varName } of variableMatches) {
      if (!resolvedVars[varName]) {
        throw new Error(`Variable ${varName} not found`);
      }

      const varInfo = resolvedVars[varName];

      // For direct assignment (the expression is just a variable reference)
      if (expression.trim() === fullMatch) {
        return varInfo.value; // Return the raw value for direct assignment
      }

      // For expressions, replace the variable reference with a value that works in the expression
      if (varInfo.type === "string") {
        // Wrap strings in quotes for the expression evaluator
        resolvedExpression = resolvedExpression.replace(fullMatch, `"${varInfo.value}"`);
      } else if (varInfo.type === "number") {
        resolvedExpression = resolvedExpression.replace(fullMatch, varInfo.value);
      } else if (varInfo.type === "boolean") {
        resolvedExpression = resolvedExpression.replace(fullMatch, varInfo.value);
      } else {
        // For other types, convert to string and wrap in quotes
        resolvedExpression = resolvedExpression.replace(fullMatch, `"${varInfo.value}"`);
      }
    }

    try {
      // For security, we're using a restricted approach to evaluate the expression
      // This is safer than using eval() directly
      const result = Function('"use strict"; return (' + resolvedExpression + ")")();
      return result;
    } catch (e) {
      throw new Error(`Failed to evaluate expression "${expression}": ${e}`);
    }
  }

  getError() {
    return this.error || null;
  }

  private async _ensureModalReady(): Promise<void> {
    // If we're already waiting for input, resolve the previous promise
    if (this._isWaitingForInput) {
      // Clear any active timer
      if (this._timerTimeout) {
        clearTimeout(this._timerTimeout);
        this._timerTimeout = undefined;
      }

      // If there's a pending promise, resolve it to prevent memory leaks
      if (this._messageResolve) {
        this._messageResolve();
        this._messageResolve = undefined;
      }

      // Reset the state
      this._isWaitingForInput = false;

      // Add a small delay to ensure all state updates have propagated
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  async showUserForm(formName: string) {
    await this._ensureModalReady();

    const pausedAt = Date.now();
    this._isWaitingForInput = true;
    this._currentMessage = {
      type: "user_form",
      message: `Please fill out the ${formName} form and click Submit to continue.`,
      formName: formName,
      pausedAt: pausedAt,
    };

    logAction({
      level: "info",
      action: "Queue Showing User Form",
      details: `Queue showing user form: ${formName} at ${new Date(pausedAt).toISOString()}`,
    });

    // Return a promise that resolves when resume is called
    return new Promise<void>((resolve) => {
      this._messageResolve = resolve;
    });
  }

  // Show pause message and wait for user input
  async pause(message?: string) {
    await this._ensureModalReady();

    const pausedAt = Date.now();
    this._isWaitingForInput = true;
    this._currentMessage = {
      type: "pause",
      message: message || "Run is paused. Click Continue to resume.",
      pausedAt: pausedAt,
    };

    logAction({
      level: "info",
      action: "Queue Paused",
      details: `Queue paused with message: ${this._currentMessage.message} at ${new Date(pausedAt).toISOString()}`,
    });

    // Return a promise that resolves when resume is called
    return new Promise<void>((resolve) => {
      this._messageResolve = resolve;
    });
  }

  async executeCommand(command: StoredRunCommand) {
    await Tool.executeCommand(command.commandInfo);
    await this.commands.complete(command.queueId);
  }

  async skipCommand(commandId: number) {
    await this.commands.skip(commandId);
  }

  async skipCommandsUntil(commandId: number) {
    await this.commands.skipUntil(commandId);
  }

  // Show info message and wait for user acknowledgment
  async showMessage(message: string, title?: string) {
    await this._ensureModalReady();

    const pausedAt = Date.now();
    this._isWaitingForInput = true;
    this._currentMessage = {
      type: "message",
      message: message || "Please review and click Continue to proceed.",
      title: title || "Message",
      pausedAt: pausedAt,
    };

    logAction({
      level: "info",
      action: "Queue Showing Message",
      details: `Queue showing message: ${this._currentMessage.message} at ${new Date(pausedAt).toISOString()}`,
    });

    // Return a promise that resolves when resume is called
    return new Promise<void>((resolve) => {
      this._messageResolve = resolve;
    });
  }

  async stopRunRequest(message: string) {
    await this._ensureModalReady();

    const pausedAt = Date.now();
    this._isWaitingForInput = true;
    this._currentMessage = {
      type: "stop_run",
      message: message || "Stopping run...",
      pausedAt: pausedAt,
    };

    logAction({
      level: "info",
      action: "Queue Stop Run Requested",
      details: `Queue stop run requested with message: ${this._currentMessage.message} at ${new Date(pausedAt).toISOString()}`,
    });

    // Return a promise that resolves when resume is called
    return new Promise<void>((resolve) => {
      this._messageResolve = resolve;
    });
  }

  async startTimer(minutes: number, seconds: number, message?: string) {
    await this._ensureModalReady();

    const pausedAt = Date.now();
    const durationMs = (minutes * 60 + seconds) * 1000;
    const endTime = pausedAt + durationMs;

    this._isWaitingForInput = true;
    this._currentMessage = {
      type: "timer",
      message: message || "Timer in progress...",
      pausedAt: pausedAt,
      timerDuration: durationMs,
      timerEndTime: endTime,
    };

    logAction({
      level: "info",
      action: "Queue Timer Started",
      details: `Queue timer started for ${minutes}m ${seconds}s with message: ${this._currentMessage.message}`,
    });

    // Return a promise that resolves when timer ends or when skipped
    return new Promise<void>((resolve) => {
      this._messageResolve = resolve;

      // Auto-resolve when timer ends
      this._timerTimeout = setTimeout(() => {
        if (this._isWaitingForInput && this._currentMessage.type === "timer") {
          this.resume(true);
        }
      }, durationMs);
    });
  }

  async gotoCommand(commandId: number) {
    try {
      await this.commands.gotoCommand(commandId);

      logAction({
        level: "info",
        action: "Queue Goto",
        details: `Queue jumped to command ID: ${commandId}`,
      });

      return true;
    } catch (error) {
      logAction({
        level: "error",
        action: "Queue Goto Failed",
        details: `Failed to goto command ID: ${commandId}. Error: ${error}`,
      });
      throw error;
    }
  }

  // Add this method to CommandQueue class
  async gotoCommandByRunIndex(runId: string, index: number): Promise<boolean> {
    try {
      await this.commands.gotoCommandByIndex(runId, index);

      logAction({
        level: "info",
        action: "Queue Goto By Index",
        details: `Queue jumped to index ${index} for run ${runId}`,
      });

      return true;
    } catch (error) {
      logAction({
        level: "error",
        action: "Queue Goto By Index Failed",
        details: `Failed to goto index ${index} for run ${runId}. Error: ${error}`,
      });
      throw error;
    }
  }

  // Resume execution after pause or message
  resume(_autoResume = false) {
    if (!this._isWaitingForInput) {
      return;
    }

    // Clear any active timer
    if (this._timerTimeout) {
      clearTimeout(this._timerTimeout);
      this._timerTimeout = undefined;
    }

    const messageType = this._currentMessage.type;
    const pausedAt = this._currentMessage.pausedAt || Date.now();
    const elapsedMs = Date.now() - pausedAt;
    const elapsedSec = Math.floor(elapsedMs / 1000);

    // Store the resolver before resetting state
    const resolver = this._messageResolve;

    // Reset state first to prevent race conditions
    this._isWaitingForInput = false;
    this._messageResolve = undefined;

    // Clear any previous errors when resuming
    if (this.error) {
      console.log("Clearing error on resume");
      this.clearError();
    }

    logAction({
      level: "info",
      action: "Queue Resumed",
      details: `Queue execution resumed after ${elapsedSec} seconds of ${messageType}`,
    });

    // Now call the resolver after state is reset
    if (resolver) {
      // Slight delay to ensure UI updates
      setTimeout(() => resolver(), 50);
    }
  }

  // Standard command queue methods
  async allCommands(): Promise<StoredRunCommand[]> {
    return this.commands.all();
  }

  async getPaginated(offset: number = 0, limit: number = 20): Promise<StoredRunCommand[]> {
    return this.commands.getPaginated(offset, limit);
  }
  async getAllRuns(): Promise<RunQueue[]> {
    return this.commands.getAllRuns();
  }
  async getRun(runId: string) {
    return this.commands.getRun(runId);
  }
  async clearAll() {
    await this.commands.clearAll();
    await this.clearError();
  }
  async clearByRunId(runId: string) {
    await this.commands.clearByRunId(runId);
  }

  async getRunsTotal(): Promise<number> {
    return this.commands.getTotalRuns();
  }

  async clearCompleted() {
    await this.commands.clearCompleted();
  }

  async clearError() {
    console.log("Clearing error and resetting state from:", this._state);
    this.error = undefined;

    // Only reset to READY if we're currently in FAILED state
    if (this._state === ToolStatus.FAILED) {
      this._setState(ToolStatus.READY);
    }
  }

  slackNotificationsEnabled: boolean = true;

  async _start() {
    logAction({
      level: "info",
      action: "Queue Started",
      details: "Command Queue started by user.",
    });
    this._setState(ToolStatus.READY);
    this.error = undefined;
    try {
      this._runningPromise = this._runBusyLoopWhileQueueNotEmpty(120);
      await this._runningPromise;
    } catch (e) {
      logAction({
        level: "error",
        action: "Queue failed to start",
        details: "Error while starting the queue.: " + e,
      });
      this.error = e instanceof Error ? e : new Error("Execution failed");
      this._setState(ToolStatus.FAILED);
      await this._notifyFailure({ error: this.error });
    } finally {
      this._runningPromise = undefined;
      if (this.state === ToolStatus.BUSY) {
        this._setState(ToolStatus.READY);
      }
    }
  }

  // Modify the stop method in CommandQueue.ts to reset _isWaitingForInput
  async stop() {
    this._setState(ToolStatus.OFFLINE);

    if (this._runningPromise) {
      await this._runningPromise;
    }

    // Clear any active timer
    if (this._timerTimeout) {
      clearTimeout(this._timerTimeout);
      this._timerTimeout = undefined;
    }

    // Reset the waiting flag
    this._isWaitingForInput = false;
    this._currentMessage = {
      type: "pause",
      message: "Run is paused. Click Continue to resume.",
      pausedAt: undefined,
    };

    // Clear any pending resolve function
    if (this._messageResolve) {
      this._messageResolve();
      this._messageResolve = undefined;
    }
    logger.info("Command Queue stopped!");
    logAction({ level: "info", action: "Queue stopped", details: "Queue stopped." });

    this._setState(ToolStatus.OFFLINE);
  }

  private async _runBusyLoopWhileQueueNotEmpty(_timeout = 120) {
    this._setState(ToolStatus.BUSY);

    while (this.state === ToolStatus.BUSY) {
      // Small delay between processing commands to avoid race conditions
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const nextCommand = await this.commands.startNext();
      if (!nextCommand) {
        this.stop(); // stop the queue when there are no more commands available!!
        return;
      }

      try {
        logger.info("Executing command:", nextCommand.commandInfo);

        // Handle advanced parameters for skip execution
        if (nextCommand.commandInfo.advancedParameters?.skipExecutionVariable?.variable) {
          try {
            // Get the variable name and expected value for skipping
            const varName =
              nextCommand.commandInfo.advancedParameters.skipExecutionVariable.variable;
            let expectedValue =
              nextCommand.commandInfo.advancedParameters.skipExecutionVariable.value;
            if (expectedValue.startsWith("{{") && expectedValue.endsWith("}}")) {
              const v = await this._getVariableByName(expectedValue.slice(2, -2).trim());
              expectedValue = v?.value ?? "";
            }

            // Fetch the variable from the database
            const varResponse = await this._getVariableByName(varName);
            // If variable value matches expected value, skip this command
            if (varResponse && varResponse.value === expectedValue) {
              logAction({
                level: "info",
                action: "Command Skipped",
                details: `Skipping command: ${nextCommand.commandInfo.command} for tool: ${nextCommand.commandInfo.toolId} because variable ${varName} = ${expectedValue}`,
              });

              await this.skipCommand(nextCommand.queueId);
              continue;
            }
          } catch (e) {
            logAction({
              level: "warning",
              action: "Skip Execution Variable Error",
              details: `Failed to fetch skip execution variable ${nextCommand.commandInfo.advancedParameters.skipExecutionVariable.variable}: ${e}`,
            });
            // Continue with command execution if we can't check the skip condition
          }
        }

        // Unused timestamp formatting logic - commented out
        // const dateString = String(nextCommand.createdAt);
        // const dateObject = new Date(dateString);
        // const year = dateObject.getFullYear();
        // const month = dateObject.getMonth() + 1;
        // const day = dateObject.getDate();
        // const hours = dateObject.getHours();
        // const minutes = dateObject.getMinutes();
        // const seconds = dateObject.getSeconds();

        // const amOrPm = hours >= 12 ? "PM" : "AM";
        // const formattedHours = (hours % 12 || 12).toString();

        // const _formattedDateTime = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
        //   2,
        //   "0",
        // )} ${formattedHours.padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
        //   seconds,
        // ).padStart(2, "0")} ${amOrPm}`;

        if (nextCommand.commandInfo.toolId === "Tool Box") {
          if (nextCommand.commandInfo.command === "pause") {
            const message =
              nextCommand.commandInfo.params?.message || "Run is paused. Click Continue to resume.";
            await this.commands.complete(nextCommand.queueId);
            await this.pause(message);
            continue;
          } else if (nextCommand.commandInfo.command === "user_form") {
            // Handle user_form command
            const formName = nextCommand.commandInfo.params?.name;
            if (!formName) {
              throw new Error("Form name is required for user_form command");
            }

            await this.commands.complete(nextCommand.queueId);
            await this.showUserForm(formName);
            continue;
          } else if (nextCommand.commandInfo.command === "show_message") {
            // Handle show_message command
            let message =
              nextCommand.commandInfo.params?.message ||
              "Please review and click Continue to proceed.";
            const title = nextCommand.commandInfo.params?.title || "Message";

            // Check if message is a variable reference
            if (message.startsWith("{{") && message.endsWith("}}")) {
              try {
                const variableResponse = await this._getVariableByName(message.slice(2, -2).trim());
                // Use just the value property of the variable
                message = variableResponse?.value ?? message;
              } catch (e) {
                logAction({
                  level: "warning",
                  action: "Variable Reference Error",
                  details: `Failed to fetch variable for message: ${message}. Using raw message instead.`,
                });
                // Keep the original message if the variable fetch fails
              }
            }

            await this.commands.complete(nextCommand.queueId);
            await this.showMessage(message, title);
            continue;
          } else if (nextCommand.commandInfo.command === "timer") {
            // Handle timer command
            let minutesValue = nextCommand.commandInfo.params?.minutes || 0;
            let secondsValue = nextCommand.commandInfo.params?.seconds || 30;
            let message = nextCommand.commandInfo.params?.message || "Timer in progress...";

            // Resolve variable references for minutes
            if (
              typeof minutesValue === "string" &&
              minutesValue.startsWith("{{") &&
              minutesValue.endsWith("}}")
            ) {
              try {
                const varResponse = await this._getVariableByName(
                  minutesValue.slice(2, -2).trim(),
                );
                minutesValue = varResponse?.value ?? minutesValue;
              } catch (e) {
                logAction({
                  level: "warning",
                  action: "Variable Reference Error",
                  details: `Failed to resolve variable for timer minutes: ${minutesValue}`,
                });
              }
            }

            // Resolve variable references for seconds
            if (
              typeof secondsValue === "string" &&
              secondsValue.startsWith("{{") &&
              secondsValue.endsWith("}}")
            ) {
              try {
                const varResponse = await this._getVariableByName(
                  secondsValue.slice(2, -2).trim(),
                );
                secondsValue = varResponse?.value ?? secondsValue;
              } catch (e) {
                logAction({
                  level: "warning",
                  action: "Variable Reference Error",
                  details: `Failed to resolve variable for timer seconds: ${secondsValue}`,
                });
              }
            }

            // Resolve variable references for message
            if (
              typeof message === "string" &&
              message.startsWith("{{") &&
              message.endsWith("}}")
            ) {
              try {
                const varResponse = await this._getVariableByName(message.slice(2, -2).trim());
                message = varResponse?.value ?? message;
              } catch (e) {
                logAction({
                  level: "warning",
                  action: "Variable Reference Error",
                  details: `Failed to resolve variable for timer message: ${message}`,
                });
              }
            }

            const minutes = Number(minutesValue);
            const seconds = Number(secondsValue);

            await this.commands.complete(nextCommand.queueId);
            await this.startTimer(minutes, seconds, message);
            continue;
          } else if (nextCommand.commandInfo.command === "note") {
            await this.commands.complete(nextCommand.queueId); //This marks the command as complete
            continue;
          } else if (nextCommand.commandInfo.command === "stop_run") {
            const message = nextCommand.commandInfo.params?.message || "Stopping run...";
            logAction({
              level: "info",
              action: "Run Stop Requested",
              details: `Queue stop requested by command: ${message}`,
            });

            // Complete this command before stopping
            await this.stopRunRequest(message);
            await this.commands.complete(nextCommand.queueId);
            return; // Exit the loop as we've stopped the queue
          } else if (nextCommand.commandInfo.command === "goto") {
            const targetIndex = Number(nextCommand.commandInfo.params?.targetIndex);
            const runId = nextCommand.commandInfo.params?.runId || nextCommand.runId;

            await this.commands.complete(nextCommand.queueId);
            if (targetIndex !== undefined && runId) {
              await this.gotoCommandByRunIndex(runId, targetIndex);
            } else {
              throw new Error(
                "Goto command requires either targetId or both targetIndex and runId",
              );
            }
            continue;
          } else if (nextCommand.commandInfo.command === "variable_assignment") {
            let variableName = nextCommand.commandInfo.params?.name;
            const expressionValue = nextCommand.commandInfo.params?.value;

            //Check if the variable exists
            if (!variableName) {
              throw new Error("Variable name is required for assignment");
            }

            if (variableName.startsWith("{{") && variableName.endsWith("}}")) {
              variableName = variableName.slice(2, -2).trim();
            }
            try {
              // First, fetch the target variable to get its type
              const targetVariable = await this._getVariableByName(variableName);

              if (!targetVariable) {
                throw new Error(`Target variable ${variableName} not found`);
              }

              // Evaluate the expression with variable substitution
              const evaluatedValue = await this.evaluateExpression(expressionValue);

              // Convert result to match the target variable type if needed
              let finalValue = evaluatedValue;

              if (targetVariable.type === "number" && typeof evaluatedValue !== "number") {
                // Try to convert to number if target is number type
                const numValue = Number(evaluatedValue);
                if (!isNaN(numValue)) {
                  finalValue = numValue;
                }
              } else if (targetVariable.type === "boolean" && typeof evaluatedValue !== "boolean") {
                // For boolean targets, convert truthy/falsy values properly
                finalValue = Boolean(evaluatedValue);
              } else if (targetVariable.type === "string" && typeof evaluatedValue !== "string") {
                // Convert to string for string targets
                finalValue = String(evaluatedValue);
              }

              // Update the variable in the database
              await db
                .update(variables)
                .set({ value: String(finalValue), updatedAt: new Date() })
                .where(eq(variables.id, targetVariable.id));

              logAction({
                level: "info",
                action: "Variable Assignment",
                details: `Variable ${variableName} assigned expression "${expressionValue}" resulting in value ${finalValue}`,
              });

              await this.commands.complete(nextCommand.queueId);
              continue;
            } catch (e) {
              logAction({
                level: "error",
                action: "Variable Assignment Error",
                details: `Failed to assign expression "${expressionValue}" to variable ${variableName}: ${e}`,
              });
              throw new Error(`Failed to assign variable: ${e}`);
            }
          }
        }

        // Regular command, send to Tool
        await this.executeCommand(nextCommand);

        logAction({
          level: "info",
          action: "Command Executed",
          details: "Command executed successfully.",
        });
        logger.info("Command executed successfully");
      } catch (e) {
        logger.error("Failed to execute command", e);

        // Mark command as failed in the queue
        await this.commands.fail(
          nextCommand.queueId,
          e instanceof Error ? e : new Error("Unknown error"),
        );

        // Set error state for UI to display
        this.error = e instanceof Error ? e : new Error("Execution failed");
        this._setState(ToolStatus.FAILED);

        logAction({
          level: "error",
          action: "Command Failed",
          details: `Command failed: ${e instanceof Error ? e.message : e}`,
        });

        await this._notifyFailure({
          error: this.error,
          runId: nextCommand.runId,
          toolId: nextCommand.commandInfo?.toolId,
          toolType: nextCommand.commandInfo?.toolType,
          command: nextCommand.commandInfo?.command,
          label: nextCommand.commandInfo?.label,
        });

        // Exit the busy loop but keep the error state
        break;
      }
    }

    // Only set to READY if we're not in FAILED state
    if (this.state === ToolStatus.BUSY) {
      this._setState(ToolStatus.READY);
    }
  }

  async enqueueRun(run: Run) {
    try {
      const runQueue: RunQueue = {
        id: run.id,
        run_type: run.protocolName || run.protocolId,
        commands_count: run.commands.length,
        status: "CREATED",
      };
      await this.commands.runPush(run.id, runQueue);
    } catch (e) {
      console.warn("Error to push run" + e);
    }
    //Queue all commands in the run.
    for (const c of run.commands) {
      await this.commands.push(c);
    }
    if (this.state === ToolStatus.READY) {
      this._start();
    }
  }

  static get global(): CommandQueue {
    const global_key = "__global_command_queue_key";
    const me = global as any;
    if (!me[global_key]) {
      me[global_key] = new CommandQueue(RunStore.global);
    }
    return me[global_key];
  }
}

export default CommandQueue;
