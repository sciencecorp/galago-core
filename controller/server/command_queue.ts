import { Run, RunQueue } from "@/types";
import { ToolStatus } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import RunStore from "./runs";
import Tool from "./tools";
import redis from "./utils/redis";
import RedisQueue, { StoredRunCommand } from "./utils/RedisQueue";
import { Console, log } from "console";
import { logger } from "@/logger"; // our logger import
import { ToolType } from "gen-interfaces/controller";
import { logAction } from "./logger";
import { get, put } from "@/server/utils/api";
import { Variable } from "@/types/api";

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

  // Message handling state variables
  private _isWaitingForInput: boolean = false;
  private _currentMessage: UIMessage = {
    type: "pause",
    message: "Run is paused. Click Continue to resume.",
    pausedAt: undefined,
  };
  private _messageResolve?: () => void;
  private _timerTimeout?: NodeJS.Timeout;

  commands: RedisQueue;

  constructor(public runStore: RunStore) {
    this.commands = new RedisQueue(redis, "command_queue_2");
  }

  fail(error: any) {
    if (!(error instanceof Error)) {
      error = new Error(error);
    }
    this._setState(ToolStatus.FAILED);
    this.error = error;
    logger.error("CommandQueue failed:", error);
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
    let variables: Record<string, any> = {};

    // Find all variable references in the expression
    const variablePromises: Promise<void>[] = [];
    const variableMatches: { fullMatch: string; varName: string }[] = [];

    // First, collect all variable references
    while ((match = variablePattern.exec(expression)) !== null) {
      const fullMatch = match[0];
      const varName = match[1].trim();
      variableMatches.push({ fullMatch, varName });

      // Create a promise to fetch each variable
      const promise = get<Variable>(`/variables/${varName}`)
        .then((varResponse) => {
          // Convert value based on type
          let value: any = varResponse.value;

          // Store both the value and type for later use
          variables[varName] = {
            value,
            type: varResponse.type || typeof value,
          };
        })
        .catch((e) => {
          throw new Error(`Failed to fetch variable ${varName}: ${e}`);
        });

      variablePromises.push(promise);
    }

    // Wait for all variable fetches to complete
    await Promise.all(variablePromises);

    // Now replace each variable reference with its value, handling types appropriately
    for (const { fullMatch, varName } of variableMatches) {
      if (!variables[varName]) {
        throw new Error(`Variable ${varName} not found`);
      }

      const varInfo = variables[varName];

      // For direct assignment (the expression is just a variable reference)
      if (expression.trim() === fullMatch) {
        return varInfo.value; // Return the raw value for direct assignment
      }

      // For expressions, replace the variable reference with a value that works in the expression
      if (varInfo.type === "string") {
        // Wrap strings in quotes for the expression evaluator
        resolvedExpression = resolvedExpression.replace(
          fullMatch,
          `"${varInfo.value}"`
        );
      } else if (varInfo.type === "number") {
        resolvedExpression = resolvedExpression.replace(
          fullMatch,
          varInfo.value
        );
      } else if (varInfo.type === "boolean") {
        resolvedExpression = resolvedExpression.replace(
          fullMatch,
          varInfo.value
        );
      } else {
        // For other types, convert to string and wrap in quotes
        resolvedExpression = resolvedExpression.replace(
          fullMatch,
          `"${varInfo.value}"`
        );
      }
    }

    try {
      // For security, we're using a restricted approach to evaluate the expression
      // This is safer than using eval() directly
      const result = Function(
        '"use strict"; return (' + resolvedExpression + ")"
      )();
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
  resume(autoResume = false) {
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

  async getPaginated(
    offset: number = 0,
    limit: number = 20
  ): Promise<StoredRunCommand[]> {
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
    logAction({
      level: "info",
      action: "Queue stopped",
      details: "Queue stopped.",
    });

    this._setState(ToolStatus.OFFLINE);
  }

  private async _runBusyLoopWhileQueueNotEmpty(timeout = 120) {
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
        if (
          nextCommand.commandInfo.advancedParameters?.skipExecutionVariable
            ?.variable
        ) {
          try {
            // Get the variable name and expected value for skipping
            const varName =
              nextCommand.commandInfo.advancedParameters.skipExecutionVariable
                .variable;
            let expectedValue =
              nextCommand.commandInfo.advancedParameters.skipExecutionVariable
                .value;
            if (
              expectedValue.startsWith("{{") &&
              expectedValue.endsWith("}}")
            ) {
              expectedValue = (
                await get<Variable>(
                  `/variables/${expectedValue.slice(2, -2).trim()}`
                )
              ).value;
            }

            // Fetch the variable from the database
            const varResponse = await get<Variable>(`/variables/${varName}`);
            // If variable value matches expected value, skip this command
            if (varResponse.value === expectedValue) {
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

        const dateString = String(nextCommand.createdAt);
        const dateObject = new Date(dateString);

        // Format timestamp logic...
        const year = dateObject.getFullYear();
        const month = dateObject.getMonth() + 1;
        const day = dateObject.getDate();
        const hours = dateObject.getHours();
        const minutes = dateObject.getMinutes();
        const seconds = dateObject.getSeconds();

        const amOrPm = hours >= 12 ? "PM" : "AM";
        const formattedHours = (hours % 12 || 12).toString();

        const formattedDateTime = `${year}-${String(month).padStart(2, "0")}-${String(
          day
        ).padStart(
          2,
          "0"
        )} ${formattedHours.padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
          seconds
        ).padStart(2, "0")} ${amOrPm}`;

        // Handle special tool_box commands
        if (nextCommand.commandInfo.toolId === "tool_box") {
          if (nextCommand.commandInfo.command === "pause") {
            const message =
              nextCommand.commandInfo.params?.message ||
              "Run is paused. Click Continue to resume.";
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
                const variableResponse = await get<Variable>(
                  `/variables/${message.slice(2, -2).trim()}`
                );
                // Use just the value property of the variable
                message = variableResponse.value;
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
            const minutes = Number(
              nextCommand.commandInfo.params?.minutes || 0
            );
            const seconds = Number(
              nextCommand.commandInfo.params?.seconds || 30
            );
            const message =
              nextCommand.commandInfo.params?.message || "Timer in progress...";
            await this.commands.complete(nextCommand.queueId);
            await this.startTimer(minutes, seconds, message);
            continue;
          } else if (nextCommand.commandInfo.command === "note") {
            await this.commands.complete(nextCommand.queueId); //This marks the command as complete
            continue;
          } else if (nextCommand.commandInfo.command === "stop_run") {
            const message =
              nextCommand.commandInfo.params?.message || "Stopping run...";
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
            const targetIndex = Number(
              nextCommand.commandInfo.params?.targetIndex
            );
            const runId =
              nextCommand.commandInfo.params?.runId || nextCommand.runId;

            await this.commands.complete(nextCommand.queueId);
            if (targetIndex !== undefined && runId) {
              await this.gotoCommandByRunIndex(runId, targetIndex);
            } else {
              throw new Error(
                "Goto command requires either targetId or both targetIndex and runId"
              );
            }
            continue;
          } else if (
            nextCommand.commandInfo.command === "variable_assignment"
          ) {
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
              const targetVariable = await get<Variable>(
                `/variables/${variableName}`
              );

              if (!targetVariable) {
                throw new Error(`Target variable ${variableName} not found`);
              }

              // Evaluate the expression with variable substitution
              const evaluatedValue =
                await this.evaluateExpression(expressionValue);

              // Convert result to match the target variable type if needed
              let finalValue = evaluatedValue;

              if (
                targetVariable.type === "number" &&
                typeof evaluatedValue !== "number"
              ) {
                // Try to convert to number if target is number type
                const numValue = Number(evaluatedValue);
                if (!isNaN(numValue)) {
                  finalValue = numValue;
                }
              } else if (
                targetVariable.type === "boolean" &&
                typeof evaluatedValue !== "boolean"
              ) {
                // For boolean targets, convert truthy/falsy values properly
                finalValue = Boolean(evaluatedValue);
              } else if (
                targetVariable.type === "string" &&
                typeof evaluatedValue !== "string"
              ) {
                // Convert to string for string targets
                finalValue = String(evaluatedValue);
              }

              // Update the variable in the database
              await put<Variable>(`/variables/${targetVariable.id}`, {
                ...targetVariable,
                value: String(finalValue),
              });

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
          e instanceof Error ? e : new Error("Unknown error")
        );

        // Set error state for UI to display
        this.error = e instanceof Error ? e : new Error("Execution failed");
        this._setState(ToolStatus.FAILED);

        logAction({
          level: "error",
          action: "Command Failed",
          details: `Command failed: ${e instanceof Error ? e.message : e}`,
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
        run_type: run.protocolId,
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
