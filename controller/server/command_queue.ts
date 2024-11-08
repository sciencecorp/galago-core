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


// Using protobufs for any enums that might be serialized, and using numeric
// serialization, is one way to ensure that the enum values are stable across
// versions.
// Unfortunately we still have to use e.g. ToolStatus.OFFLINE for the values
export type CommandQueueState = ToolStatus;

// The CommandQueue is responsible for managing and running commands. This may
// morph into a scheduler-executor in time, but keeping it simple and concrete
// for now.

export class CommandQueue {
  private _state: CommandQueueState = ToolStatus.OFFLINE;
  // There should only be one running promise to avoid race conditions
  private _runningPromise?: Promise<any>;
  error?: Error;

  commands: RedisQueue;
  //runRequest: RunStore;

  constructor(public runStore: RunStore) {
    this.commands = new RedisQueue(redis, "command_queue_2");
    //this.run = runStore;
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

  // TODO: Use a proper state machine?
  private _setState(newState: CommandQueueState) {
    logger.info(`CommandQueue state: ${newState} (was ${this._state})`);
    this._state = newState;
  }

  // Used to start or restart the command queue from the main event loop.
  // Idempotent if already running.
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

  // Initialize the run state and start the command queue
  async _start() {
    logAction({level: "info", action:"Command Queue started", details:"Command Queue started by user."});
    this._setState(ToolStatus.READY);
    this.error = undefined;
    logAction({level: "info", action:"Queue Ready", details:"Command Queue is Ready."});
    try {
      this._runningPromise = this._runBusyLoopWhileQueueNotEmpty(120);
      await this._runningPromise;
    } catch (e) {
      logAction({level: "error", action:"Queue failed to start", details:"Error while starting the queue.: " + e});
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
    logger.info("Command Queue is stopped!");
    logAction({level: "info", action:"Queue was stopped", details:"Queue stopped."});
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

      const year = dateObject.getFullYear();
      const month = dateObject.getMonth() + 1;
      const day = dateObject.getDate();
      const hours = dateObject.getHours();
      const minutes = dateObject.getMinutes();
      const seconds = dateObject.getSeconds();

      const amOrPm = hours >= 12 ? "PM" : "AM";
      const formattedHours = (hours % 12 || 12).toString(); // Convert to 12-hour format

      const formattedDateTime = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
        2,
        "0",
      )} ${formattedHours.padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
        seconds,
      ).padStart(2, "0")} ${amOrPm}`;

      try {
        logger.info("Executing command", nextCommand.commandInfo);
        logAction({level: "info", action:"Executing Command", details:"Executing command: " + JSON.stringify(nextCommand.commandInfo.command)});
        await this.executeCommand(nextCommand);
        logAction({level: "info", action:"Command Executed", details:"Command executed successfully."});
        logger.info("Command executed successfully");
      } catch (e) {
        let errorMessage = null;
        if (e instanceof Error) {
          errorMessage = e.message;
          logAction({level: "error", action:"Command Error", details:"Error while running command: " + errorMessage});
          console.log("Error message is" + errorMessage);
        } else {
          logAction({level: "error", action:"Command Error", details:"Unknown error while trying to execute tool command"+nextCommand.commandInfo.command});
          errorMessage = new Error("Unknown error while trying to execute tool command");
        }
        logger.error("Failed to execute command", e);

        const slackAlertCommand: ToolCommandInfo = {
          toolId: "toolbox",
          toolType: "toolbox" as ToolType,
          command: "send_slack_alert",
          params: {
            workcell: Tool.workcellName(),
            tool: `${nextCommand.commandInfo.toolId}`,
            protocol: "",
            error_message: errorMessage,
          },
        };
        console.log("Sending slack command " + JSON.stringify(slackAlertCommand));
        // // logger.error(`Slack command is` + JSON.stringify(slackAlertCommand));
        await Tool.executeCommand(slackAlertCommand);
        await this.commands.fail(
          nextCommand.queueId,
          e instanceof Error ? e : new Error("Unknown error"),
        );
        throw e;
      }
    }
  }

  // Run a command immediately by sending it to the tool
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

  //Queues all commands passed in run object
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

  // We use global singletons because next.js reloads script files, and we want
  // to preserve the state between reloads. Once we have persistence, we can
  // remove this.
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
