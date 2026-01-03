import { Run, RunCommand } from "@/types";
import snowflakeIdGenerator from "@/utils/snowflake";
import { ZodError } from "zod";
import CommandQueue from "./command_queue";
import { Protocols } from "./protocols";
import Tool from "./tools";
import Protocol from "@/protocols/protocol";
import { db } from "@/db/client";
import { tools, workcells, appSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

// Helper function to get tool from database
async function getToolFromDB(toolId: string) {
  // Get selected workcell
  const setting = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.name, "workcell"))
    .limit(1);

  if (!setting || setting.length === 0 || !setting[0].isActive) {
    throw new Error("No workcell selected");
  }

  const workcell = await db
    .select()
    .from(workcells)
    .where(eq(workcells.name, setting[0].value))
    .limit(1);

  if (!workcell || workcell.length === 0) {
    throw new Error("Selected workcell not found");
  }

  // Find tool by name
  const searchName = toolId.replace(/_/g, " ");
  const allTools = await db.select().from(tools).where(eq(tools.workcellId, workcell[0].id));

  const tool = allTools.find((t) => t.name.toLowerCase() === searchName.toLowerCase());

  if (!tool) {
    throw new Error(`Tool '${toolId}' not found`);
  }

  return tool;
}

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
      // Get tool info from database first
      const toolRecord = await getToolFromDB(c.commandInfo.toolId);
      const normalizedId = Tool.normalizeToolId(toolRecord.name);

      // Create Tool instance with all required parameters
      const tool = Tool.forId(normalizedId, toolRecord.ip, toolRecord.port, toolRecord.type as any);

      // Estimate duration
      durationEstimates.push(
        tool.estimateDuration(c.commandInfo).then((duration) => {
          c.estimatedDuration = duration;
        }),
      );
    }

    // Wait for all the duration estimates to be done
    await Promise.all(durationEstimates);
  }

  async createFromProtocol(protocolId: string): Promise<Run> {
    const protocol = await Protocol.loadFromDatabase(protocolId);
    if (!protocol) {
      throw new ProtocolNotFoundError(protocolId);
    }

    const commands = protocol._generateCommands();
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
      protocolId,
      commands: runCommands,
      status: "CREATED",
      createdAt: new Date(),
    };

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
