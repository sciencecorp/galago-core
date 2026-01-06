import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { db } from "@/db/client";
import { findOne, findMany, getSelectedWorkcellId } from "@/db/helpers";
import {
  robotArmLocations,
  robotArmSequences,
  robotArmMotionProfiles,
  robotArmGripParams,
  tools,
  logs,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import Tool from "../tools";

// ==================== SCHEMAS ====================

// Robot Arm Location schemas
const zRobotArmLocationBase = z.object({
  name: z.string().min(1),
  locationType: z.enum(["j", "c"]),
  coordinates: z.string(),
  orientation: z.string(),
  toolId: z.number(),
});

export const zRobotArmLocationCreate = zRobotArmLocationBase;

export const zRobotArmLocationUpdate = zRobotArmLocationBase
  .extend({
    id: z.number(),
  })
  .partial()
  .required({ id: true });

// Robot Arm Sequence schemas
const zRobotArmSequenceBase = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  commands: z.array(
    z.object({
      command: z.string(),
      params: z.record(z.any()),
      order: z.number(),
    }),
  ),
  toolId: z.number(),
  labware: z.string().nullable().optional(),
});

export const zRobotArmSequenceCreate = zRobotArmSequenceBase;

export const zRobotArmSequenceUpdate = zRobotArmSequenceBase
  .extend({
    id: z.number(),
  })
  .partial()
  .required({ id: true });

// Robot Arm Motion Profile schemas
const zRobotArmMotionProfileBase = z.object({
  name: z.string().min(1),
  speed: z.number(),
  speed2: z.number(),
  acceleration: z.number(),
  deceleration: z.number(),
  accelRamp: z.number(),
  decelRamp: z.number(),
  inrange: z.number(),
  straight: z.number(),
  toolId: z.number(),
});

export const zRobotArmMotionProfileCreate = zRobotArmMotionProfileBase;

export const zRobotArmMotionProfileUpdate = zRobotArmMotionProfileBase
  .extend({
    id: z.number(),
  })
  .partial()
  .required({ id: true });

// Robot Arm Grip Params schemas
const zRobotArmGripParamsBase = z.object({
  name: z.string().min(1),
  width: z.number(),
  speed: z.number(),
  force: z.number(),
  toolId: z.number(),
});

export const zRobotArmGripParamsCreate = zRobotArmGripParamsBase;

export const zRobotArmGripParamsUpdate = zRobotArmGripParamsBase
  .extend({
    id: z.number(),
  })
  .partial()
  .required({ id: true });

// ==================== TYPES ====================

export type RobotArmLocation = z.infer<typeof zRobotArmLocationCreate> & { id: number };
export type RobotArmSequence = z.infer<typeof zRobotArmSequenceCreate> & { id: number };
export type RobotArmMotionProfile = z.infer<typeof zRobotArmMotionProfileCreate> & { id: number };
export type RobotArmGripParams = z.infer<typeof zRobotArmGripParamsCreate> & { id: number };

// ==================== ROUTER ====================

export const robotArmRouter = router({
  // ==================== LOCATIONS ====================
  location: router({
    getAll: procedure
      .input(z.object({ toolId: z.union([z.number(), z.string()]).optional() }))
      .query(async ({ input }) => {
        if (input.toolId) {
          // Handle both numeric and string IDs
          const toolId = typeof input.toolId === "string" ? parseInt(input.toolId) : input.toolId;

          if (isNaN(toolId)) {
            // If it's a string that's not a number, try to find tool by name
            const tool = await findOne(tools, eq(tools.name, String(input.toolId)));
            if (!tool) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: "Tool not found",
              });
            }
            return await findMany(robotArmLocations, eq(robotArmLocations.toolId, tool.id));
          }

          return await findMany(robotArmLocations, eq(robotArmLocations.toolId, toolId));
        }

        return await db.select().from(robotArmLocations);
      }),

    create: procedure.input(zRobotArmLocationCreate).mutation(async ({ input }) => {
      try {
        const result = await db.insert(robotArmLocations).values(input).returning();

        await db.insert(logs).values({
          level: "info",
          action: "Robot Arm Location Created",
          details: `Location ${input.name} created successfully.`,
        });

        // Reload waypoints for the tool
        const tool = await findOne(tools, eq(tools.id, input.toolId));
        if (tool) {
          await Tool.loadPF400Waypoints(tool.name);
        }

        return result[0];
      } catch (error: any) {
        if (error.message?.includes("UNIQUE constraint failed")) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Location with name '${input.name}' already exists for this tool`,
          });
        }
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Failed to create location",
        });
      }
    }),

    update: procedure.input(zRobotArmLocationUpdate).mutation(async ({ input }) => {
      const { id, ...updateData } = input;

      const existing = await findOne(robotArmLocations, eq(robotArmLocations.id, id));

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Location not found",
        });
      }

      try {
        const cleanUpdateData = Object.fromEntries(
          Object.entries(updateData).filter(([_, value]) => value !== undefined),
        );

        const updated = await db
          .update(robotArmLocations)
          .set({
            ...cleanUpdateData,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(robotArmLocations.id, id))
          .returning();

        await db.insert(logs).values({
          level: "info",
          action: "Robot Arm Location Updated",
          details: `Location ${input.name || existing.name} updated successfully.`,
        });

        // Reload waypoints for the tool
        const tool = await findOne(tools, eq(tools.id, existing.toolId));
        if (tool) {
          await Tool.loadPF400Waypoints(tool.name);
        }

        return updated[0];
      } catch (error: any) {
        if (error.message?.includes("UNIQUE constraint failed")) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Location with name '${input.name}' already exists for this tool`,
          });
        }
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Failed to update location",
        });
      }
    }),

    delete: procedure
      .input(z.object({ id: z.number(), toolId: z.number().optional() }))
      .mutation(async ({ input }) => {
        const location = await findOne(robotArmLocations, eq(robotArmLocations.id, input.id));

        if (!location) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Location not found",
          });
        }

        await db.delete(robotArmLocations).where(eq(robotArmLocations.id, input.id));

        await db.insert(logs).values({
          level: "info",
          action: "Robot Arm Location Deleted",
          details: `Location deleted successfully.`,
        });

        // Reload waypoints for the tool
        const toolId = input.toolId || location.toolId;
        const tool = await findOne(tools, eq(tools.id, toolId));
        if (tool) {
          await Tool.loadPF400Waypoints(tool.name);
        }

        return { message: "Location deleted successfully" };
      }),
  }),

  // ==================== SEQUENCES ====================
  sequence: router({
    getAll: procedure
      .input(z.object({ toolId: z.number().optional() }))
      .query(async ({ input }) => {
        if (input.toolId) {
          return await findMany(robotArmSequences, eq(robotArmSequences.toolId, input.toolId));
        }
        return await db.select().from(robotArmSequences);
      }),

    create: procedure.input(zRobotArmSequenceCreate).mutation(async ({ input }) => {
      try {
        const result = await db.insert(robotArmSequences).values(input).returning();

        await db.insert(logs).values({
          level: "info",
          action: "Robot Arm Sequence Created",
          details: `Sequence ${input.name} created successfully.`,
        });

        // Reload waypoints for the tool
        const tool = await findOne(tools, eq(tools.id, input.toolId));
        if (tool) {
          await Tool.loadPF400Waypoints(tool.name);
        }

        return result[0];
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Failed to create sequence",
        });
      }
    }),

    update: procedure.input(zRobotArmSequenceUpdate).mutation(async ({ input }) => {
      const { id, ...updateData } = input;

      const existing = await findOne(robotArmSequences, eq(robotArmSequences.id, id));

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sequence not found",
        });
      }

      try {
        const cleanUpdateData = Object.fromEntries(
          Object.entries(updateData).filter(([_, value]) => value !== undefined),
        );

        const updated = await db
          .update(robotArmSequences)
          .set({
            ...cleanUpdateData,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(robotArmSequences.id, id))
          .returning();

        await db.insert(logs).values({
          level: "info",
          action: "Robot Arm Sequence Updated",
          details: `Sequence ${input.name || existing.name} updated successfully.`,
        });

        // Reload waypoints for the tool
        const tool = await findOne(tools, eq(tools.id, existing.toolId));
        if (tool) {
          await Tool.loadPF400Waypoints(tool.name);
        }

        return updated[0];
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Failed to update sequence",
        });
      }
    }),

    delete: procedure
      .input(z.object({ id: z.number(), toolId: z.number().optional() }))
      .mutation(async ({ input }) => {
        const sequence = await findOne(robotArmSequences, eq(robotArmSequences.id, input.id));

        if (!sequence) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Sequence not found",
          });
        }

        await db.delete(robotArmSequences).where(eq(robotArmSequences.id, input.id));

        await db.insert(logs).values({
          level: "info",
          action: "Robot Arm Sequence Deleted",
          details: `Sequence deleted successfully.`,
        });

        // Reload waypoints for the tool
        const toolId = input.toolId || sequence.toolId;
        const tool = await findOne(tools, eq(tools.id, toolId));
        if (tool) {
          await Tool.loadPF400Waypoints(tool.name);
        }

        return { message: "Sequence deleted successfully" };
      }),
  }),

  // ==================== MOTION PROFILES ====================
  motionProfile: router({
    getAll: procedure
      .input(z.object({ toolId: z.number().optional() }))
      .query(async ({ input }) => {
        if (input.toolId) {
          return await findMany(
            robotArmMotionProfiles,
            eq(robotArmMotionProfiles.toolId, input.toolId),
          );
        }
        return await db.select().from(robotArmMotionProfiles);
      }),

    create: procedure.input(zRobotArmMotionProfileCreate).mutation(async ({ input }) => {
      try {
        const result = await db.insert(robotArmMotionProfiles).values(input).returning();

        await db.insert(logs).values({
          level: "info",
          action: "Robot Arm Motion Profile Created",
          details: `Motion profile ${input.name} created successfully.`,
        });

        // Reload waypoints for the tool
        const tool = await findOne(tools, eq(tools.id, input.toolId));
        if (tool) {
          await Tool.loadPF400Waypoints(tool.name);
        }

        return result[0];
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Failed to create motion profile",
        });
      }
    }),

    update: procedure.input(zRobotArmMotionProfileUpdate).mutation(async ({ input }) => {
      const { id, ...updateData } = input;

      const existing = await findOne(robotArmMotionProfiles, eq(robotArmMotionProfiles.id, id));

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Motion profile not found",
        });
      }

      try {
        const cleanUpdateData = Object.fromEntries(
          Object.entries(updateData).filter(([_, value]) => value !== undefined),
        );

        const updated = await db
          .update(robotArmMotionProfiles)
          .set({
            ...cleanUpdateData,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(robotArmMotionProfiles.id, id))
          .returning();

        await db.insert(logs).values({
          level: "info",
          action: "Robot Arm Motion Profile Updated",
          details: `Motion profile ${input.name || existing.name} updated successfully.`,
        });

        // Reload waypoints for the tool
        const tool = await findOne(tools, eq(tools.id, existing.toolId));
        if (tool) {
          await Tool.loadPF400Waypoints(tool.name);
        }

        return updated[0];
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Failed to update motion profile",
        });
      }
    }),

    delete: procedure
      .input(z.object({ id: z.number(), toolId: z.number().optional() }))
      .mutation(async ({ input }) => {
        const profile = await findOne(
          robotArmMotionProfiles,
          eq(robotArmMotionProfiles.id, input.id),
        );

        if (!profile) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Motion profile not found",
          });
        }

        await db.delete(robotArmMotionProfiles).where(eq(robotArmMotionProfiles.id, input.id));

        await db.insert(logs).values({
          level: "info",
          action: "Robot Arm Motion Profile Deleted",
          details: `Motion profile deleted successfully.`,
        });

        // Reload waypoints for the tool
        const toolId = input.toolId || profile.toolId;
        const tool = await findOne(tools, eq(tools.id, toolId));
        if (tool) {
          await Tool.loadPF400Waypoints(tool.name);
        }

        return { message: "Motion profile deleted successfully" };
      }),
  }),

  // ==================== GRIP PARAMS ====================
  gripParams: router({
    getAll: procedure
      .input(z.object({ toolId: z.number().optional() }))
      .query(async ({ input }) => {
        if (input.toolId) {
          return await findMany(robotArmGripParams, eq(robotArmGripParams.toolId, input.toolId));
        }
        return await db.select().from(robotArmGripParams);
      }),

    create: procedure.input(zRobotArmGripParamsCreate).mutation(async ({ input }) => {
      try {
        const result = await db.insert(robotArmGripParams).values(input).returning();

        await db.insert(logs).values({
          level: "info",
          action: "Robot Arm Grip Params Created",
          details: `Grip params ${input.name} created successfully.`,
        });

        // Reload waypoints for the tool
        const tool = await findOne(tools, eq(tools.id, input.toolId));
        if (tool) {
          await Tool.loadPF400Waypoints(tool.name);
        }

        return result[0];
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Failed to create grip params",
        });
      }
    }),

    update: procedure.input(zRobotArmGripParamsUpdate).mutation(async ({ input }) => {
      const { id, ...updateData } = input;

      const existing = await findOne(robotArmGripParams, eq(robotArmGripParams.id, id));

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Grip params not found",
        });
      }

      try {
        const cleanUpdateData = Object.fromEntries(
          Object.entries(updateData).filter(([_, value]) => value !== undefined),
        );

        const updated = await db
          .update(robotArmGripParams)
          .set({
            ...cleanUpdateData,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(robotArmGripParams.id, id))
          .returning();

        await db.insert(logs).values({
          level: "info",
          action: "Robot Arm Grip Params Updated",
          details: `Grip params ${input.name || existing.name} updated successfully.`,
        });

        // Reload waypoints for the tool
        const tool = await findOne(tools, eq(tools.id, existing.toolId));
        if (tool) {
          await Tool.loadPF400Waypoints(tool.name);
        }

        return updated[0];
      } catch (error: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message || "Failed to update grip params",
        });
      }
    }),

    delete: procedure
      .input(z.object({ id: z.number(), toolId: z.number().optional() }))
      .mutation(async ({ input }) => {
        const params = await findOne(robotArmGripParams, eq(robotArmGripParams.id, input.id));

        if (!params) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Grip params not found",
          });
        }

        await db.delete(robotArmGripParams).where(eq(robotArmGripParams.id, input.id));

        await db.insert(logs).values({
          level: "info",
          action: "Robot Arm Grip Params Deleted",
          details: `Grip params deleted successfully.`,
        });

        // Reload waypoints for the tool
        const toolId = input.toolId || params.toolId;
        const tool = await findOne(tools, eq(tools.id, toolId));
        if (tool) {
          await Tool.loadPF400Waypoints(tool.name);
        }

        return { message: "Grip params deleted successfully" };
      }),
  }),

  // ==================== WAYPOINTS ====================
  waypoints: router({
    getAll: procedure
      .input(z.object({ toolId: z.union([z.number(), z.string()]) }))
      .query(async ({ input }) => {
        let tool;

        // Handle both numeric and string tool IDs
        if (typeof input.toolId === "string") {
          const numericId = parseInt(input.toolId);
          if (!isNaN(numericId)) {
            tool = await findOne(tools, eq(tools.id, numericId));
          } else {
            tool = await findOne(tools, eq(tools.name, input.toolId));
          }
        } else {
          tool = await findOne(tools, eq(tools.id, input.toolId));
        }

        if (!tool) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Tool not found",
          });
        }

        const [locations, sequences, motionProfiles, gripParams] = await Promise.all([
          findMany(robotArmLocations, eq(robotArmLocations.toolId, tool.id)),
          findMany(robotArmSequences, eq(robotArmSequences.toolId, tool.id)),
          findMany(robotArmMotionProfiles, eq(robotArmMotionProfiles.toolId, tool.id)),
          findMany(robotArmGripParams, eq(robotArmGripParams.toolId, tool.id)),
        ]);

        return {
          toolName: tool.name,
          name: `Waypoints for Tool ${input.toolId}`,
          locations,
          sequences,
          motionProfiles,
          gripParams,
        };
      }),
  }),
});
