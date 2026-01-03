import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { db } from "@/db/client";
import { findOne, findMany } from "@/db/helpers";
import {
  tools,
  workcells,
  appSettings,
  logs,
  robotArmMotionProfiles,
  robotArmGripParams,
  nests,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import Tool from "@/server/tools";
import { Tool as ToolResponse } from "@/types/api";
import { Config } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import { ToolType } from "gen-interfaces/controller";
import { get } from "@/server/utils/api";
import * as controller_protos from "gen-interfaces/controller";

const zToolType = z.enum(Object.values(ToolType) as [ToolType, ...ToolType[]]);

// Tool validation schema for database operations
export const zToolBase = z.object({
  type: z.string().min(1, "Type is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  ip: z.string().min(1, "IP address is required"),
  port: z.number().int().positive("Port must be a positive integer"),
  config: z.any().nullable().optional(),
});

export const zToolCreate = zToolBase.omit({ port: true }).extend({
  port: z.number().int().positive().optional(),
});

export const zToolUpdate = zToolBase.extend({
  id: z.number(),
});

export const zTool = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  type: zToolType.optional(),
  description: z.string().optional(),
  workcell_id: z.number().optional(),
  ip: z.string().optional(),
  port: z.number().optional(),
  image_url: z.string().optional(),
  config: z.record(z.any()).optional(),
});

// Inventory configuration map (from Python)
const INVENTORY_TOOL_MAP: Record<string, { rows: number; columns: number }> = {
  alps: { rows: 1, columns: 1 },
  bioshake: { rows: 1, columns: 1 },
  bravo: { rows: 3, columns: 3 },
  cytation: { rows: 1, columns: 1 },
  hamilton: { rows: 5, columns: 11 },
  hig_centrifuge: { rows: 2, columns: 1 },
  liconic: { rows: 10, columns: 5 },
  microserve: { rows: 50, columns: 14 },
  opentrons2: { rows: 4, columns: 3 },
  plateloc: { rows: 1, columns: 1 },
  spectramax: { rows: 1, columns: 1 },
  vcode: { rows: 1, columns: 1 },
  vprep: { rows: 3, columns: 2 },
  xpeel: { rows: 1, columns: 1 },
};

// Helper function to get selected workcell ID
async function getSelectedWorkcellId(): Promise<number> {
  const setting = await findOne(appSettings, eq(appSettings.name, "workcell"));

  if (!setting || !setting.isActive) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No workcell is currently selected. Please select a workcell in settings.",
    });
  }

  const workcell = await findOne(workcells, eq(workcells.name, setting.value));

  if (!workcell) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Selected workcell '${setting.value}' not found`,
    });
  }

  return workcell.id;
}

// Helper function to get next available port
async function getNextAvailablePort(): Promise<number> {
  const PORT_RANGE_START = 40000;
  const PORT_RANGE_END = 40100;

  const allTools = await db.select({ port: tools.port }).from(tools);
  const existingPorts = new Set(allTools.map((t) => t.port));

  for (let port = PORT_RANGE_START; port < PORT_RANGE_END; port++) {
    if (!existingPorts.has(port)) {
      return port;
    }
  }

  throw new TRPCError({
    code: "BAD_REQUEST",
    message: "No available ports in the range 40000-40100",
  });
}

// Helper function to create default motion profile for PF400
async function createDefaultMotionProfile(toolId: number): Promise<void> {
  try {
    await db.insert(robotArmMotionProfiles).values({
      name: "Default",
      speed: 50.0,
      speed2: 50.0,
      acceleration: 100.0,
      deceleration: 100.0,
      accelRamp: 100.0,
      decelRamp: 100.0,
      inrange: 1.0,
      straight: 0,
      toolId: toolId,
    });
  } catch (error) {
    console.error(`Failed to create default motion profile for tool ${toolId}:`, error);
  }
}

// Helper function to create default grip params for PF400
async function createDefaultGripParams(toolId: number): Promise<void> {
  try {
    await db.insert(robotArmGripParams).values({
      name: "Default",
      width: 100,
      speed: 50,
      force: 50,
      toolId: toolId,
    });
  } catch (error) {
    console.error(`Failed to create default grip params for tool ${toolId}:`, error);
  }
}

// Helper function to create default inventory nests
async function createDefaultInventoryNests(toolId: number, toolType: string): Promise<void> {
  const config = INVENTORY_TOOL_MAP[toolType.toLowerCase()];
  if (!config) {
    console.log(`Tool type '${toolType}' is not in inventory map, skipping nest creation`);
    return;
  }

  try {
    // Check if nests already exist
    const existingNests = await findMany(nests, eq(nests.toolId, toolId));
    if (existingNests.length > 0) {
      console.warn(`Tool with id ${toolId} already has ${existingNests.length} nests`);
      return;
    }

    const tool = await findOne(tools, eq(tools.id, toolId));
    if (!tool) {
      throw new Error(`Tool with id ${toolId} not found`);
    }

    const nestsToCreate = [];
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.columns; col++) {
        nestsToCreate.push({
          name: `${tool.name}_R${row}C${col}`,
          row: row,
          column: col,
          toolId: toolId,
          hotelId: null,
          status: "empty" as const,
        });
      }
    }

    if (nestsToCreate.length > 0) {
      await db.insert(nests).values(nestsToCreate);
      console.log(
        `Created ${nestsToCreate.length} inventory nests for tool '${tool.name}' (${config.rows}x${config.columns})`,
      );
    }
  } catch (error) {
    console.error(`Failed to create inventory nests for tool ${toolId}:`, error);
  }
}

export const toolRouter = router({
  // ============================================================================
  // CRUD OPERATIONS (Drizzle)
  // ============================================================================

  getAll: procedure.query(async () => {
    const workcellId = await getSelectedWorkcellId();
    const allTools = await findMany(tools, eq(tools.workcellId, workcellId));
    return allTools;
  }),

  get: procedure.input(z.string()).query(async ({ input }) => {
    // Try parsing as numeric ID first
    const numericId = parseInt(input);

    if (!isNaN(numericId)) {
      const tool = await findOne(tools, eq(tools.id, numericId));

      if (!tool) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tool not found",
        });
      }

      return tool;
    } else {
      // Search by name (case-insensitive, handle underscores)
      const searchName = input.toLowerCase().replace(/_/g, " ");
      const workcellId = await getSelectedWorkcellId();

      const allTools = await findMany(tools, eq(tools.workcellId, workcellId));
      const tool = allTools.find((t) => t.name.toLowerCase() === searchName);

      if (!tool) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tool not found",
        });
      }

      return tool;
    }
  }),

  add: procedure.input(zToolCreate).mutation(async ({ input }) => {
    const workcellId = await getSelectedWorkcellId();

    try {
      // Get next available port if not provided
      const port = input.port ?? (await getNextAvailablePort());

      const result = await db
        .insert(tools)
        .values({
          ...input,
          port,
          workcellId,
        })
        .returning();

      const createdTool = result[0];

      // Create default profiles for PF400
      if (createdTool.type.toLowerCase() === "pf400") {
        await createDefaultMotionProfile(createdTool.id);
        await createDefaultGripParams(createdTool.id);

        await db.insert(logs).values({
          level: "info",
          action: "Default Profiles Created",
          details: `Created default profiles for new PF400 tool: ${createdTool.name}`,
        });
      }

      // Create default inventory nests if applicable
      await createDefaultInventoryNests(createdTool.id, createdTool.type);

      await db.insert(logs).values({
        level: "info",
        action: "New Tool Added",
        details: `Tool ${input.name} of type ${input.type} added successfully on port ${port}.`,
      });

      return createdTool;
    } catch (error: any) {
      if (error.message?.includes("UNIQUE constraint failed")) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Tool with that name already exists in this workcell",
        });
      }
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: error.message || "Invalid tool data",
      });
    }
  }),

  edit: procedure.input(zToolUpdate).mutation(async ({ input }) => {
    const { id, ...updateData } = input;

    if (!id) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Tool ID is required",
      });
    }

    const existing = await findOne(tools, eq(tools.id, id));

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tool not found",
      });
    }

    try {
      const updated = await db
        .update(tools)
        .set({
          ...updateData,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(tools.id, id))
        .returning();

      const updatedTool = updated[0];

      // Update Tool class cache
      const toolId = Tool.normalizeToolId(updatedTool.name);
      await Tool.removeTool(toolId);

      const updatedToolConfig: controller_protos.ToolConfig = {
        name: updatedTool.name,
        type: updatedTool.type as ToolType,
        description: updatedTool.description || "",
        image_url: updatedTool.imageUrl || "",
        ip: updatedTool.ip || "localhost",
        port: updatedTool.port || 0,
        config: (updatedTool.config as Config) || {},
      };

      await Tool.reloadSingleToolConfig(updatedToolConfig);
      await Tool.clearToolStore();
      Tool.forId(toolId);

      await db.insert(logs).values({
        level: "info",
        action: "Tool Edited",
        details: `Tool ${updatedTool.name} updated successfully.`,
      });

      return updatedTool;
    } catch (error: any) {
      if (error.message?.includes("UNIQUE constraint failed")) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Tool with that name already exists in this workcell",
        });
      }
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: error.message || "Invalid tool data",
      });
    }
  }),

  delete: procedure.input(z.number()).mutation(async ({ input }) => {
    const deleted = await db.delete(tools).where(eq(tools.id, input)).returning();

    if (!deleted || deleted.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tool not found",
      });
    }

    // Clean up Tool class cache
    const toolId = Tool.normalizeToolId(deleted[0].name);
    await Tool.removeTool(toolId);

    await db.insert(logs).values({
      level: "info",
      action: "Tool Deleted",
      details: `Tool deleted successfully.`,
    });

    return { message: "Tool deleted successfully" };
  }),

  // ============================================================================
  // EXISTING OPERATIONS (keep unchanged)
  // ============================================================================

  getToolBox: procedure.query(() => {
    const toolbox = Tool.toolBoxConfig();
    return {
      id: -1,
      name: "tool_box",
      type: toolbox.type,
      ip: toolbox.ip,
      port: toolbox.port,
      description: toolbox.description,
      image_url: "/tool_icons/toolbox.png",
      status: "READY",
      last_updated: new Date(),
      created_at: new Date(),
      config: toolbox.config || { simulated: false, toolbox: {} },
      workcell_id: 1,
      joints: 0,
    } as ToolResponse;
  }),

  getProtoConfigDefinitions: procedure.input(zToolType).query(async ({ input }) => {
    const configDefinition = await Tool.getToolConfigDefinition(input);
    return configDefinition;
  }),

  availableIDs: procedure
    .input(
      z.object({
        workcellId: z.number().optional(),
      }),
    )
    .query(async ({ input }) => {
      let workcellId = input.workcellId;

      // If no workcellId provided, get the selected one
      if (!workcellId) {
        workcellId = await getSelectedWorkcellId();
      }

      const workcellTools = await findMany(tools, eq(tools.workcellId, workcellId));

      // Convert to ToolConfig format for Tool class
      const toolConfigs: controller_protos.ToolConfig[] = workcellTools.map((tool) => ({
        name: tool.name,
        type: tool.type as ToolType,
        description: tool.description || "",
        image_url: tool.imageUrl || "",
        ip: tool.ip || "localhost",
        port: tool.port || 0,
        config: (tool.config as Config) || {},
      }));

      Tool.reloadWorkcellConfig(toolConfigs);

      // Return tool IDs as lowercase with underscores (matching the format used in components)
      const toolIds = workcellTools.map((tool) => tool.name.toLowerCase().replace(/\s+/g, "_"));
      toolIds.push("tool_box");

      return toolIds;
    }),

  status: procedure
    .input(
      z.object({
        toolId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const tool = Tool.forId(input.toolId.toLocaleLowerCase().replaceAll(" ", "_"));
      return await tool.fetchStatus();
    }),

  info: procedure
    .input(
      z.object({
        toolId: z.string(),
      }),
    )
    .query(({ input }) => {
      const tool = Tool.forId(input.toolId.toLocaleLowerCase().replaceAll(" ", "_"));
      return tool.info;
    }),

  clearToolStore: procedure.mutation(async () => {
    Tool.clearToolStore();
    return { message: "Tool store cleared successfully" };
  }),

  configure: procedure
    .input(
      z.object({
        toolId: z.string(),
        config: z.custom<Config>().transform(Config.fromPartial),
      }),
    )
    .mutation(async ({ input }) => {
      const { toolId, config } = input;
      const tool = Tool.forId(toolId);
      const resp = await tool.configure(config);
      return resp;
    }),

  runCommand: procedure
    .input(
      z.object({
        toolId: z.string(),
        toolType: zToolType,
        command: z.string(),
        params: z.record(z.any()),
      }),
    )
    .mutation(async ({ input }) => {
      return await Tool.executeCommand(input);
    }),
});
