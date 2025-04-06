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
}

// UI message type for differentiating between pause and show_message
export interface UIMessage {
  type: "pause" | "message";
  message: string;
  title?: string;
  pausedAt?: number; // Timestamp when paused or message shown
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
    this._isWaitingForInput = true;
    this._currentMessage = {
      type: "pause",
      message: message || "Run is paused. Click Continue to resume.",
      pausedAt: Date.now(), // Record the timestamp when paused
    };

    logAction({
      level: "info",
      action: "Queue Paused",
      details: `Queue paused with message: ${this._currentMessage.message} at ${new Date(this._currentMessage.pausedAt).toISOString()}`,
    });

    // Return a promise that resolves when resume is called
    return new Promise<void>((resolve) => {
      this._messageResolve = resolve;
    });
  }

  // Show info message and wait for user acknowledgment
  async showMessage(message: string, title?: string) {
    this._isWaitingForInput = true;
    this._currentMessage = {
      type: "message",
      message: message || "Please review and click Continue to proceed.",
      title: title || "Message",
      pausedAt: Date.now(), // Record the timestamp when message shown
    };

    logAction({
      level: "info",
      action: "Queue Showing Message",
      details: `Queue showing message: ${this._currentMessage.message} at ${new Date().toISOString()}`,
    });

    // Return a promise that resolves when resume is called
    return new Promise<void>((resolve) => {
      this._messageResolve = resolve;
    });
  }

  // Resume execution after pause or message
  resume() {
    if (!this._isWaitingForInput) return;

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

  async stop() {
    this._setState(ToolStatus.OFFLINE);
    logger.info("Command Queue stopped!");
    logAction({ level: "info", action: "Queue stopped", details: "Queue stopped." });
    if (this._runningPromise) {
      await this._runningPromise;
    }
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
