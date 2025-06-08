import { Run, RunCommand, ToolCommandInfo } from "@/types";
import snowflakeIdGenerator from "@/utils/snowflake";
import { ZodError } from "zod";
import CommandQueue from "./command_queue";
import { Protocols } from "./protocols";
import Tool from "./tools";
import Protocol from "@/protocols/protocol";

// Right now, just an in-memory store wrapping a Map.
export default class RunStore {
  nextRunId = 1;
  runs = new Map<string, Run>();

  static get global(): RunStore {
    const global_key = "__global_run_store_key";
    const me = global as any;
    if (!me[global_key]) {
      me[global_key] = new RunStore();
    }
    return me[global_key];
  }

  get(id: string): Run | undefined {
    return this.runs.get(id);
  }

  all(): Run[] {
    return Array.from(this.runs.values());
  }

  set(id: string, run: Run): this {
    this.runs.set(id, run);
    return this;
  }

  async estimateCommandDurations(run: Run) {
    const durationEstimates: Promise<void>[] = [];
    for (const c of run.commands) {
      // estimate the duration for each command and then update the command when
      // it's known, this will run them all in parallel because we are not
      // awaiting in the loop
      const tool = Tool.forId(c.commandInfo.tool_id);
      // This doesn't need to be awaited because it will update the command
      durationEstimates.push(
        tool.estimateDuration(c.commandInfo).then((duration) => {
          c.estimatedDuration = duration;
        }),
      );
    }
    // Wait for all the duration estimates to be done
    await Promise.all(durationEstimates);
  }

  /**
   * Flattens the protocol's process structure into a linear array of commands
   * while preserving the execution order (processes by position, then commands within each process)
   */
  private flattenProtocolCommands(protocol: Protocol): ToolCommandInfo[] {
    if (!protocol.processes || protocol.processes.length === 0) {
      return [];
    }

    const allCommands: ToolCommandInfo[] = [];

    // Sort processes by position
    const sortedProcesses = [...protocol.processes].sort((a, b) => a.position - b.position);
    
    for (const process of sortedProcesses) {
      if (process.commands && process.commands.length > 0) {
        // Sort commands within each process by position
        const sortedCommands = [...process.commands].sort((a, b) => a.position - b.position);
        allCommands.push(...sortedCommands);
      }
    }
    
    return allCommands;
  }

  async createFromProtocol(
    protocolId: number,
    params: Record<string, any>,
  ): Promise<Run> {
    const protocol = await Protocol.loadFromDatabase(protocolId);
    if (!protocol) {
      throw new ProtocolNotFoundError(protocolId);
    }

    const validationErrors = protocol.validationErrors(params);
    if (validationErrors) {
      throw validationErrors;
    }

    // Instead of calling protocol.generate(), we now need to flatten the process structure
    // and create ToolCommandInfo objects from the database commands
    const flattenedCommands = this.flattenProtocolCommands(protocol);
    
    if (!flattenedCommands || flattenedCommands.length === 0) {
      throw new ProtocolGenerationFailedError(protocolId);
    }

    // Generate a unique run ID using the snowflake ID generator
    const runId = snowflakeIdGenerator.nextId();
    
    // Convert database commands to ToolCommandInfo format and then to RunCommands
    const runCommands: RunCommand[] = flattenedCommands.map((dbCommand) => {
      // Convert database command structure to ToolCommandInfo
      const toolCommandInfo = {
        id: dbCommand.id,
        name: dbCommand.name,
        tool_type: dbCommand.tool_type,
        tool_id: dbCommand.tool_id,
        label: dbCommand.label || "",
        command: dbCommand.command,
        params: this.replaceParameterPlaceholders(dbCommand.params, params),
        advanced_parameters: dbCommand.advanced_parameters,
        command_group_id: dbCommand.command_group_id,
        position: dbCommand.position,
      };

      return {
        runId: runId,
        commandInfo: toolCommandInfo,
        status: "CREATED",
        createdAt: new Date(),
      };
    });

    const run: Run = {
      id: runId,
      params: params,
      protocolId,
      commands: runCommands,
      status: "CREATED",
      createdAt: new Date(),
    };

    RunStore.global.set(runId, run);
    await CommandQueue.global.enqueueRun(run);
    return run;
  }

  /**
   * Replace parameter placeholders in command params with actual values
   * Handles ${paramName} syntax from the protocol parameters
   */
  private replaceParameterPlaceholders(obj: any, params: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.replaceParameterPlaceholders(item, params));
    } else if (typeof obj === "object" && obj !== null) {
      const newObj: any = {};
      for (const [key, value] of Object.entries(obj)) {
        newObj[key] = this.replaceParameterPlaceholders(value, params);
      }
      return newObj;
    } else if (typeof obj === "string") {
      return obj.replace(/\${([^}]+)}/g, (_, param) => {
        return params[param] !== undefined ? params[param] : `\${${param}}`;
      });
    }
    return obj;
  }
}

export class ProtocolParamsInvalidError extends Error {
  constructor(
    public protocolId: number,
    public cause: ZodError,
  ) {
    super(`Protocol params invalid: ${cause.message}`);
    this.name = "ProtocolParamsInvalidError";
  }
}

export class ProtocolNotFoundError extends Error {
  constructor(public protocolId: number) {
    super(`No protocol found for ID '${protocolId}'.`);
    this.name = "ProtocolNotFoundError";
  }
}

export class ProtocolGenerationFailedError extends Error {
  constructor(public protocolId: number) {
    super(`Could not generate commands for protocol ID '${protocolId}'.`);
    this.name = "ProtocolGenerationFailedError";
  }
}