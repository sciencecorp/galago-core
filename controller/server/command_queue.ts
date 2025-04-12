import { Run, RunCommand, RunQueue, RunStatus, ToolCommandInfo } from "@/types";
import { ToolStatus } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import RunStore from "./runs";
import Tool from "./tools";
import redis from "./utils/redis";
import RedisQueue, { StoredRunCommand } from "./utils/RedisQueue";
import { WebClient, WebAPICallResult } from "@slack/web-api";
import { Console } from "console";
import { logger } from "@/logger"; // our logger import
import dotenv from "dotenv";
import { ToolType } from "gen-interfaces/controller";
import { unknown } from "zod";
import { logAction } from "./logger";

export type CommandQueueState = ToolStatus;

export enum QueueState {
  PAUSED = "PAUSED",
  MESSAGE = "MESSAGE",
  TIMER = "TIMER",
}

// UI message type for differentiating between pause and show_message
export interface UIMessage {
  type: "pause" | "message" | "timer" | "stop_run";
  message: string;
  title?: string;
  pausedAt?: number; // Timestamp when paused or message shown
  timerDuration?: number; //Total duration of the timer
  timerEndTime?: number; // Timestamp when timer ends
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
    throw error;
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

  getError() {
    return this.error || null;
  }

  // Show pause message and wait for user input
  async pause(message?: string) {
    const pausedAt = Date.now();
    this._isWaitingForInput = true;
    this._currentMessage = {
      type: "pause",
      message: message || "Run is paused. Click Continue to resume.",
      pausedAt: pausedAt, // Record the timestamp when paused
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

  // Show info message and wait for user acknowledgment
  async showMessage(message: string, title?: string) {
    const pausedAt = Date.now();
    this._isWaitingForInput = true;
    this._currentMessage = {
      type: "message",
      message: message || "Please review and click Continue to proceed.",
      title: title || "Message",
      pausedAt: pausedAt, // Record the timestamp when message shown
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
    if (!this._isWaitingForInput) return;

    if (this._timerTimeout) {
      clearTimeout(this._timerTimeout);
      this._timerTimeout = undefined;
    }

    const messageType = this._currentMessage.type;
    const pausedAt = this._currentMessage.pausedAt || Date.now();
    const elapsedMs = Date.now() - (this._currentMessage.pausedAt || Date.now());
    const elapsedSec = Math.floor(elapsedMs / 1000);

    this._isWaitingForInput = false;
    if (this._messageResolve) {
      this._messageResolve();
      this._messageResolve = undefined;
    }

    logAction({
      level: "info",
      action: "Queue Resumed",
      details: `Queue execution resumed after ${elapsedSec} seconds of pause/message.`,
    });
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
      this.fail(e);
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

  private async _runBusyLoopWhileQueueNotEmpty(timeout = 120) {
    this._setState(ToolStatus.BUSY);
    let threadTs: string | undefined;
    const startedAt = Date.now();

    while (this.state === ToolStatus.BUSY) {
      const nextCommand = await this.commands.startNext();
      if (!nextCommand) {
        this.stop(); //stop the queue when there are no more commands available!!
        return;
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

      const formattedDateTime = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
        2,
        "0",
      )} ${formattedHours.padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
        seconds,
      ).padStart(2, "0")} ${amOrPm}`;

      try {
        logger.info("Executing command", nextCommand.commandInfo);

        if (nextCommand.commandInfo.toolId === "tool_box") {
          if (nextCommand.commandInfo.command === "pause") {
            const message =
              nextCommand.commandInfo.params?.message || "Run is paused. Click Continue to resume.";
            await this.commands.complete(nextCommand.queueId);
            await this.pause(message);
            continue;
          } else if (nextCommand.commandInfo.command === "show_message") {
            // Handle show_message command
            const message =
              nextCommand.commandInfo.params?.message ||
              "Please review and click Continue to proceed.";
            const title = nextCommand.commandInfo.params?.title || "Message";
            await this.commands.complete(nextCommand.queueId);
            await this.showMessage(message, title);
            continue;
          } else if (nextCommand.commandInfo.command === "timer") {
            // Handle timer command
            const minutes = Number(nextCommand.commandInfo.params?.minutes || 0);
            const seconds = Number(nextCommand.commandInfo.params?.seconds || 30);
            const message = nextCommand.commandInfo.params?.message || "Timer in progress...";
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
        let errorMessage = null;
        if (e instanceof Error) {
          errorMessage = e.message;
        } else {
          errorMessage = new Error("Unknown error while trying to execute tool command");
        }
        logger.error("Failed to execute command", e);
        await this.commands.fail(
          nextCommand.queueId,
          e instanceof Error ? e : new Error("Unknown error"),
        );
        this.error = e instanceof Error ? e : new Error("Execution failed");
        throw e;
      }
    }
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

  async enqueueRun(run: Run) {
    try {
      const runQueue: RunQueue = {
        id: run.id,
        params: run.params,
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
