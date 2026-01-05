import { Run, RunCommand, ToolCommandInfo } from "@/types";
import snowflakeIdGenerator from "@/utils/snowflake";
import { ZodError } from "zod";
import CommandQueue from "./command_queue";
import Tool from "./tools";
import { db } from "@/db/client";
import { tools, workcells, appSettings, protocols } from "@/db/schema";
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

// Helper function to load protocol from database
async function loadProtocolFromDatabase(protocolId: string) {
  const id = parseInt(protocolId);

  if (isNaN(id)) {
    throw new ProtocolNotFoundError(`Invalid protocol ID: ${protocolId}`);
  }

  const protocolResult = await db.select().from(protocols).where(eq(protocols.id, id)).limit(1);

  if (!protocolResult || protocolResult.length === 0) {
    throw new ProtocolNotFoundError(`Protocol with ID ${protocolId} not found`);
  }

  return protocolResult[0];
}

// Helper function to generate commands from protocol data
function generateCommandsFromProtocol(protocol: any): ToolCommandInfo[] {
  if (!protocol.commands || protocol.commands.length === 0) {
    throw new ProtocolGenerationFailedError(`Protocol ${protocol.id} has no commands`);
  }

  return protocol.commands.map((cmd: any) => ({
    toolId: cmd.toolId,
    toolType: cmd.toolType,
    command: cmd.command,
    params: cmd.params || {},
    label: cmd.label || "",
    tool_info: cmd.tool_info || {
      type: cmd.toolType,
      imageUrl: cmd.toolType === "toolbox" ? "/tool_icons/toolbox.png" : undefined,
    },
    advancedParameters: cmd.advancedParameters || {
      skipExecutionVariable: {
        variable: null,
        value: "",
      },
      runAsynchronously: false,
    },
  }));
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
    try {
      // Load protocol from database
      const protocol = await loadProtocolFromDatabase(protocolId);

      // Generate commands from protocol
      const commands = generateCommandsFromProtocol(protocol);

      // Create run ID
      const runId = snowflakeIdGenerator.nextId();

      // Create run commands
      const runCommands: RunCommand[] = commands.map((c) => ({
        runId: runId,
        commandInfo: c,
        status: "CREATED",
        createdAt: new Date(),
      }));

      // Create run object
      const run: Run = {
        id: runId,
        protocolId,
        commands: runCommands,
        status: "CREATED",
        createdAt: new Date(),
      };

      // Store run
      RunStore.global.set(runId, run);

      // Enqueue run
      await CommandQueue.global.enqueueRun(run);

      return run;
    } catch (error) {
      // Re-throw our custom errors
      if (
        error instanceof ProtocolNotFoundError ||
        error instanceof ProtocolGenerationFailedError ||
        error instanceof ProtocolParamsInvalidError
      ) {
        throw error;
      }

      // Wrap unexpected errors
      throw new ProtocolGenerationFailedError(
        `Failed to create run: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

// Error classes
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
