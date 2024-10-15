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

export type CommandQueueState = ToolStatus;

interface GroupedCommand {
    Id: string;
    Commands: RunCommand[];
  }

  
export class CommandQueue {
    private _state: CommandQueueState = ToolStatus.OFFLINE;
    private _runningPromise?: Promise<any>;
    error?: Error;
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
  
    private _setState(newState: CommandQueueState) {
      logger.info(`CommandQueue state: ${newState} (was ${this._state})`);
      this._state = newState;
    }
  
    async _start() {
      this._setState(ToolStatus.READY);
      this.error = undefined;
      try {
        this._runningPromise = this._processQueue();
        await this._runningPromise;
        logger.info("Command Queue is running!");
      } catch (e) {
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
      if (this._runningPromise) {
        await this._runningPromise;
      }
    }
  
    // Process the queue by executing commands in parallel but ensure commands in the same run are executed in order
    private async _processQueue() {
      this._setState(ToolStatus.BUSY);
  
      while (this.state === ToolStatus.BUSY) {
        const nextCommandGroups = await this.getNextCommandsByRun();
        if (!nextCommandGroups) {
          this.stop();
          return;
        }
  
        try {
          logger.info("Executing command batch for multiple runs");
          // Execute commands for each run in parallel but ensure each run's commands execute in order
          await Promise.all(
            nextCommandGroups.map(async (runCommands) => {
              for (const command of runCommands.Commands) {
                await this.executeCommand(command); // Executes commands in sequence per run
              }
            })
          );
          logger.info("Command batch executed successfully");
        } catch (e) {
          this.fail(e);
        }
      }
    }
  
    // Group commands by runId and execute them in parallel for different runs, but ensure sequential execution within a run
    private async getNextCommandsByRun(): Promise<GroupedCommand[] | null> {
      const allCommands = await this.commands.all();
      if (!allCommands || allCommands.length === 0) return null;
  
      const groupedCommands: { [runId: string]: RunCommand[] } = {};
      allCommands.forEach((cmd) => {
        const runId = cmd.runId;
        if (!groupedCommands[runId]) {
          groupedCommands[runId] = [];
        }
        groupedCommands[runId].push(cmd);
      });
  
      // Return the grouped commands by runId for parallel execution
      const commandGroups = Object.keys(groupedCommands).map((runId) => ({
        Id: runId,
        Commands: groupedCommands[runId],
      }));
  
      return commandGroups.length > 0 ? commandGroups : null;
    }
  
    async executeCommand(command: StoredRunCommand) {
      try {
        await Tool.executeCommand(command.commandInfo);
        await this.commands.complete(command.queueId);
      } catch (error) {
        await this.commands.fail(command.queueId, error as Error);
        throw error;
      }
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
  
        for (const c of run.commands) {
          await this.commands.push(c);
        }
  
        if (this.state === ToolStatus.READY) {
          this._start();
        }
      } catch (e) {
        console.warn("Error to push run", e);
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
  