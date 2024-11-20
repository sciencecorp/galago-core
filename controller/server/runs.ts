import { Run, RunCommand } from "@/types";
import snowflakeIdGenerator from "@/utils/snowflake";
import { ZodError } from "zod";
import CommandQueue from "./command_queue";
import { Protocols } from "./protocols";
import Tool from "./tools";

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
      const tool = Tool.forId(c.commandInfo.toolId);
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

  async createFromProtocol(
    workcellName: string,
    protocolId: string,
    params: Record<string, any>,
  ): Promise<Run> {
    const protocol = Protocols.find(
      (p) => p.protocolId === protocolId && p.workcell === workcellName,
    );

    if (!protocol) {
      throw new ProtocolNotFoundError(protocolId);
    }

    const validationErrors = protocol.validationErrors(params);
    if (validationErrors) {
      throw validationErrors;
    }
    const commands = protocol.generate({
      protocolId,
      params,
    });

    if (!commands) {
      throw new ProtocolGenerationFailedError(protocolId);
    }

    const runId = snowflakeIdGenerator.nextId();

    const runCommands: RunCommand[] = commands.map((c) => ({
      runId: runId,
      commandInfo: c,
      status: "CREATED",
      createdAt: new Date(),
    }));

    const run: Run = {
      id: runId,
      params: params,
      protocolId,
      commands: runCommands,
      status: "CREATED",
      createdAt: new Date(),
    };

    // await this.estimateCommandDurations(run);

    RunStore.global.set(runId, run);

    await CommandQueue.global.enqueueRun(run);
    return run;
  }
}

export class ProtocolParamsInvalidError extends Error {
  constructor(
    public protocolId: string,
    public cause: ZodError,
  ) {
    super(`Protocol params invalid: ${cause.message}`);
    this.name = "ProtocolParamsInvalidError";
  }
}

export class ProtocolNotFoundError extends Error {
  constructor(public protocolId: string) {
    super(`No protocol found for ID '${protocolId}'.`);
    this.name = "ProtocolNotFoundError";
  }
}

export class ProtocolGenerationFailedError extends Error {
  constructor(public protocolId: string) {
    super(`Could not generate commands for protocol ID '${protocolId}'.`);
    this.name = "ProtocolGenerationFailedError";
  }
}
