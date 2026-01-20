import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { db } from "@/db/client";
import { findOne, findMany, getSelectedWorkcellId } from "@/db/helpers";
import {
  nests,
  plates,
  wells,
  reagents,
  hotels,
  tools,
  workcells,
  robotArmLocations,
} from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import Tool from "../tools";

const zNest = z.object({
  id: z.number().optional(),
  name: z.string(),
  row: z.number(),
  column: z.number(),
  toolId: z.number().nullable().optional(),
  hotelId: z.number().nullable().optional(),
});

const zNestUpdate = z.object({
  id: z.number(),
  name: z.string().optional(),
  row: z.number().optional(),
  column: z.number().optional(),
  toolId: z.number().nullable().optional(),
  hotelId: z.number().nullable().optional(),
  nestType: z.string().optional(),
});

const zPlate = z.object({
  id: z.number().optional(),
  name: z.string().nullable().optional(),
  barcode: z.string().optional(),
  plateType: z.string().optional(),
  nestId: z.number().nullable().optional(),
});

const zPlateCreate = z.object({
  name: z.string().nullable(),
  barcode: z.string(),
  plateType: z.string(),
  nestId: z.number().nullable().optional(),
});
const zReagent = z.object({
  id: z.number().optional(),
  name: z.string(),
  expirationDate: z.string(),
  volume: z.number(),
  wellId: z.number(),
});

const zHotel = z.object({
  id: z.number().optional(),
  name: z.string(),
  rows: z.number(),
  columns: z.number(),
});

// Helper function to safely reload PF400 waypoints
async function safeReloadWaypoints(toolId: number | null | undefined): Promise<void> {
  if (!toolId) return;

  try {
    const tool = await findOne(tools, eq(tools.id, toolId));
    if (tool) {
      await Tool.loadPF400Waypoints(tool.name);
    }
  } catch (error) {
    // Log the error but don't fail the request - the database operation already succeeded
    console.warn(`Failed to reload waypoints for tool ${toolId}:`, error);
  }
}

// Helper function to get workcell by name
async function getWorkcellByName(workcellName: string) {
  const workcell = await findOne(workcells, eq(workcells.name, workcellName));
  if (!workcell) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Workcell not found",
    });
  }
  return workcell;
}

// Helper function to get plate configuration
function getPlateWellConfig(plateType: string): { columns: number[]; rows: string[] } {
  const configs: Record<string, { columns: number[]; rows: string[] }> = {
    "6 well": { columns: [1, 2, 3], rows: ["A", "B"] },
    "12 well": { columns: [1, 2, 3, 4], rows: ["A", "B", "C"] },
    "24 well": { columns: [1, 2, 3, 4, 5, 6], rows: ["A", "B", "C", "D"] },
    "96 well": {
      columns: Array.from({ length: 12 }, (_, i) => i + 1),
      rows: ["A", "B", "C", "D", "E", "F", "G", "H"],
    },
    "384 well": {
      columns: Array.from({ length: 24 }, (_, i) => i + 1),
      rows: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"],
    },
  };

  return configs[plateType] || { columns: [], rows: [] };
}

export const inventoryRouter = router({
  getNests: procedure.query(async () => {
    const workcellId = await getSelectedWorkcellId();

    const workcellTools = await db
      .select({ id: tools.id })
      .from(tools)
      .where(eq(tools.workcellId, workcellId));

    const toolIds = workcellTools.map((t) => t.id);

    const workcellHotels = await db
      .select({ id: hotels.id })
      .from(hotels)
      .where(eq(hotels.workcellId, workcellId));

    const hotelIds = workcellHotels.map((h) => h.id);

    const toolNests =
      toolIds.length > 0 ? await db.select().from(nests).where(inArray(nests.toolId, toolIds)) : [];

    const hotelNests =
      hotelIds.length > 0
        ? await db.select().from(nests).where(inArray(nests.hotelId, hotelIds))
        : [];

    return [...toolNests, ...hotelNests];
  }),

  getNest: procedure.input(z.number()).query(async ({ input: nestId }) => {
    const nest = await findOne(nests, eq(nests.id, nestId));
    if (!nest) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Nest not found",
      });
    }
    return nest;
  }),

  createNest: procedure.input(zNest.omit({ id: true })).mutation(async ({ input }) => {
    const result = await db
      .insert(nests)
      .values({
        name: input.name,
        row: input.row,
        column: input.column,
        toolId: input.toolId || null,
        hotelId: input.hotelId || null,
      })
      .returning();

    return result[0];
  }),

  updateNest: procedure.input(zNestUpdate).mutation(async ({ input }) => {
    const { id, ...updateData } = input;

    if (!id) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Nest ID is required",
      });
    }

    const existingNest = await findOne(nests, eq(nests.id, id));
    if (!existingNest) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Nest not found",
      });
    }

    // Sync name change to robot_arm_location if exists
    if (updateData.name && existingNest.robotArmLocationId) {
      await db
        .update(robotArmLocations)
        .set({ name: updateData.name })
        .where(eq(robotArmLocations.id, existingNest.robotArmLocationId));
    }

    const updated = await db
      .update(nests)
      .set({
        name: updateData.name,
        row: updateData.row,
        column: updateData.column,
        toolId: updateData.toolId || null,
        hotelId: updateData.hotelId || null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(nests.id, id))
      .returning();

    if (!updated || updated.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Nest not found",
      });
    }

    if (existingNest.toolId) await safeReloadWaypoints(existingNest.toolId);

    return updated[0];
  }),

  deleteNest: procedure.input(z.number()).mutation(async ({ input }) => {
    const deleted = await db.delete(nests).where(eq(nests.id, input)).returning();

    if (!deleted || deleted.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Nest not found",
      });
    }

    return { message: "Nest deleted successfully" };
  }),

  getPlates: procedure.input(z.string().optional()).query(async ({ input: workcellName }) => {
    let workcellId: number;

    if (workcellName) {
      const workcell = await getWorkcellByName(workcellName);
      workcellId = workcell.id;
    } else {
      workcellId = await getSelectedWorkcellId();
    }

    // Plates now have direct workcellId, so query is simple
    const workcellPlates = await db.select().from(plates).where(eq(plates.workcellId, workcellId));

    return workcellPlates;
  }),

  getPlate: procedure.input(z.number()).query(async ({ input: plateId }) => {
    const plate = await findOne(plates, eq(plates.id, plateId));
    if (!plate) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Plate not found",
      });
    }
    return plate;
  }),

  getPlateInfo: procedure.input(z.number()).query(async ({ input: plateId }) => {
    const plate = await findOne(plates, eq(plates.id, plateId));
    if (!plate) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Plate not found",
      });
    }

    let nest = null;
    if (plate.nestId !== null) {
      nest = await findOne(nests, eq(nests.id, plate.nestId));
    }

    const plateWells = await findMany(wells, eq(wells.plateId, plate.id));

    return {
      ...plate,
      nest,
      wells: plateWells,
    };
  }),

  createPlate: procedure.input(zPlateCreate).mutation(async ({ input }) => {
    try {
      const workcellId = await getSelectedWorkcellId();

      // Create plate - database will enforce uniqueness per workcell
      const newPlate = await db
        .insert(plates)
        .values({
          name: input.name,
          barcode: input.barcode,
          plateType: input.plateType,
          nestId: input.nestId || null,
          workcellId,
        })
        .returning();

      const plate = newPlate[0];

      // Create wells based on plate type
      const config = getPlateWellConfig(plate.plateType);
      if (config.columns.length > 0 && config.rows.length > 0) {
        const wellsToCreate = [];
        for (const column of config.columns) {
          for (const row of config.rows) {
            wellsToCreate.push({
              plateId: plate.id,
              row,
              column,
            });
          }
        }

        if (wellsToCreate.length > 0) {
          await db.insert(wells).values(wellsToCreate);
        }
      }

      return plate;
    } catch (error: any) {
      // Check if it's a unique constraint violation
      if (
        error.code === "SQLITE_CONSTRAINT" ||
        error.message?.includes("UNIQUE constraint failed")
      ) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A plate with this barcode or name already exists in this workcell",
        });
      }
      throw error;
    }
  }),

  updatePlate: procedure.input(zPlate).mutation(async ({ input }) => {
    const { id, ...updateData } = input;

    if (!id) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Plate ID is required",
      });
    }

    const plate = await findOne(plates, eq(plates.id, id));
    if (!plate) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Plate not found",
      });
    }

    const updated = await db
      .update(plates)
      .set({
        name: updateData.name,
        barcode: updateData.barcode,
        plateType: updateData.plateType,
        nestId: updateData.nestId,
      })
      .where(eq(plates.id, id))
      .returning();

    return updated[0];
  }),

  deletePlate: procedure.input(z.number()).mutation(async ({ input }) => {
    const deleted = await db.delete(plates).where(eq(plates.id, input)).returning();

    if (!deleted || deleted.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Plate not found",
      });
    }

    return { message: "Plate deleted successfully" };
  }),

  getWells: procedure
    .input(
      z
        .object({
          plateId: z.number().optional(),
          workcellName: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      if (input?.plateId) {
        const plate = await findOne(plates, eq(plates.id, input.plateId));
        if (!plate) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Plate not found",
          });
        }
        return await findMany(wells, eq(wells.plateId, input.plateId));
      }

      // Get by workcell
      let workcellId: number;
      if (input?.workcellName) {
        const workcell = await getWorkcellByName(input.workcellName);
        workcellId = workcell.id;
      } else {
        workcellId = await getSelectedWorkcellId();
      }

      // Get all plates in workcell, then their wells
      const workcellTools = await db
        .select({ id: tools.id })
        .from(tools)
        .where(eq(tools.workcellId, workcellId));

      const workcellHotels = await db
        .select({ id: hotels.id })
        .from(hotels)
        .where(eq(hotels.workcellId, workcellId));

      const toolIds = workcellTools.map((t) => t.id);
      const hotelIds = workcellHotels.map((h) => h.id);

      const toolNestIds =
        toolIds.length > 0
          ? (
              await db.select({ id: nests.id }).from(nests).where(inArray(nests.toolId, toolIds))
            ).map((n) => n.id)
          : [];

      const hotelNestIds =
        hotelIds.length > 0
          ? (
              await db.select({ id: nests.id }).from(nests).where(inArray(nests.hotelId, hotelIds))
            ).map((n) => n.id)
          : [];

      const nestIds = [...toolNestIds, ...hotelNestIds];

      const workcellPlates =
        nestIds.length > 0
          ? await db.select().from(plates).where(inArray(plates.nestId, nestIds))
          : [];

      const plateIds = workcellPlates.map((p) => p.id);

      if (plateIds.length === 0) {
        return [];
      }

      return await db.select().from(wells).where(inArray(wells.plateId, plateIds));
    }),

  getReagents: procedure
    .input(
      z
        .object({
          plateId: z.number().optional(),
          workcellName: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      if (input?.plateId) {
        const plate = await findOne(plates, eq(plates.id, input.plateId));
        if (!plate) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Plate not found",
          });
        }

        const plateWells = await findMany(wells, eq(wells.plateId, input.plateId));
        const wellIds = plateWells.map((w) => w.id);

        if (wellIds.length === 0) {
          return [];
        }

        return await db.select().from(reagents).where(inArray(reagents.wellId, wellIds));
      }

      // Get by workcell
      let workcellId: number;
      if (input?.workcellName) {
        const workcell = await getWorkcellByName(input.workcellName);
        workcellId = workcell.id;
      } else {
        workcellId = await getSelectedWorkcellId();
      }

      // Get all nests -> plates -> wells -> reagents
      const workcellTools = await db
        .select({ id: tools.id })
        .from(tools)
        .where(eq(tools.workcellId, workcellId));

      const workcellHotels = await db
        .select({ id: hotels.id })
        .from(hotels)
        .where(eq(hotels.workcellId, workcellId));

      const toolIds = workcellTools.map((t) => t.id);
      const hotelIds = workcellHotels.map((h) => h.id);

      const toolNestIds =
        toolIds.length > 0
          ? (
              await db.select({ id: nests.id }).from(nests).where(inArray(nests.toolId, toolIds))
            ).map((n) => n.id)
          : [];

      const hotelNestIds =
        hotelIds.length > 0
          ? (
              await db.select({ id: nests.id }).from(nests).where(inArray(nests.hotelId, hotelIds))
            ).map((n) => n.id)
          : [];

      const nestIds = [...toolNestIds, ...hotelNestIds];

      if (nestIds.length === 0) {
        return [];
      }

      const workcellPlates = await db.select().from(plates).where(inArray(plates.nestId, nestIds));
      const plateIds = workcellPlates.map((p) => p.id);

      if (plateIds.length === 0) {
        return [];
      }

      const allWells = await db.select().from(wells).where(inArray(wells.plateId, plateIds));
      const wellIds = allWells.map((w) => w.id);

      if (wellIds.length === 0) {
        return [];
      }

      return await db.select().from(reagents).where(inArray(reagents.wellId, wellIds));
    }),

  getWorkcellReagents: procedure.input(z.string()).query(async ({ input: workcellName }) => {
    const workcell = await getWorkcellByName(workcellName);

    // Same logic as getReagents with workcell
    const workcellTools = await db
      .select({ id: tools.id })
      .from(tools)
      .where(eq(tools.workcellId, workcell.id));

    const workcellHotels = await db
      .select({ id: hotels.id })
      .from(hotels)
      .where(eq(hotels.workcellId, workcell.id));

    const toolIds = workcellTools.map((t) => t.id);
    const hotelIds = workcellHotels.map((h) => h.id);

    const toolNestIds =
      toolIds.length > 0
        ? (await db.select({ id: nests.id }).from(nests).where(inArray(nests.toolId, toolIds))).map(
            (n) => n.id,
          )
        : [];

    const hotelNestIds =
      hotelIds.length > 0
        ? (
            await db.select({ id: nests.id }).from(nests).where(inArray(nests.hotelId, hotelIds))
          ).map((n) => n.id)
        : [];

    const nestIds = [...toolNestIds, ...hotelNestIds];

    if (nestIds.length === 0) {
      return [];
    }

    const workcellPlates = await db.select().from(plates).where(inArray(plates.nestId, nestIds));
    const plateIds = workcellPlates.map((p) => p.id);

    if (plateIds.length === 0) {
      return [];
    }

    const allWells = await db.select().from(wells).where(inArray(wells.plateId, plateIds));
    const wellIds = allWells.map((w) => w.id);

    if (wellIds.length === 0) {
      return [];
    }

    return await db.select().from(reagents).where(inArray(reagents.wellId, wellIds));
  }),

  createReagent: procedure.input(zReagent.omit({ id: true })).mutation(async ({ input }) => {
    // Check for existing reagent in the same well
    const existing = await db
      .select()
      .from(reagents)
      .where(and(eq(reagents.wellId, input.wellId), eq(reagents.name, input.name)))
      .limit(1);

    if (existing.length > 0) {
      // Update existing reagent by adding volumes
      const updated = await db
        .update(reagents)
        .set({
          volume: existing[0].volume + input.volume,
          expirationDate: input.expirationDate,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(reagents.id, existing[0].id))
        .returning();

      return updated[0];
    }

    // Create new reagent
    const result = await db
      .insert(reagents)
      .values({
        name: input.name,
        expirationDate: input.expirationDate,
        volume: input.volume,
        wellId: input.wellId,
      })
      .returning();

    return result[0];
  }),

  updateReagent: procedure.input(zReagent).mutation(async ({ input }) => {
    const { id, ...updateData } = input;

    if (!id) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Reagent ID is required",
      });
    }

    const updated = await db
      .update(reagents)
      .set({
        name: updateData.name,
        expirationDate: updateData.expirationDate,
        volume: updateData.volume,
        wellId: updateData.wellId,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(reagents.id, id))
      .returning();

    if (!updated || updated.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Reagent not found",
      });
    }

    return updated[0];
  }),

  deleteReagent: procedure.input(z.number()).mutation(async ({ input }) => {
    const deleted = await db.delete(reagents).where(eq(reagents.id, input)).returning();

    if (!deleted || deleted.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Reagent not found",
      });
    }

    return { message: "Reagent deleted successfully" };
  }),

  getHotels: procedure.input(z.string().optional()).query(async ({ input: workcellName }) => {
    const name =
      workcellName ||
      (await getSelectedWorkcellId().then(async (id) => {
        const wc = await findOne(workcells, eq(workcells.id, id));
        return wc?.name;
      }));

    if (!name) {
      return await db.select().from(hotels);
    }

    const workcell = await getWorkcellByName(name);
    return await findMany(hotels, eq(hotels.workcellId, workcell.id));
  }),

  getHotelById: procedure.input(z.number()).query(async ({ input }) => {
    const hotel = await findOne(hotels, eq(hotels.id, input));
    if (!hotel) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Hotel not found",
      });
    }
    return hotel;
  }),

  createHotel: procedure.input(zHotel.omit({ id: true })).mutation(async ({ input }) => {
    const workcellId = await getSelectedWorkcellId();
    const result = await db
      .insert(hotels)
      .values({
        name: input.name,
        workcellId: workcellId,
        rows: input.rows,
        columns: input.columns,
      })
      .returning();

    return result[0];
  }),

  updateHotel: procedure.input(zHotel).mutation(async ({ input }) => {
    const { id, ...updateData } = input;

    if (!id) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Hotel ID is required",
      });
    }

    const updated = await db
      .update(hotels)
      .set({
        name: updateData.name,
        rows: updateData.rows,
        columns: updateData.columns,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(hotels.id, id))
      .returning();

    if (!updated || updated.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Hotel not found",
      });
    }

    return updated[0];
  }),

  deleteHotel: procedure.input(z.number()).mutation(async ({ input }) => {
    const deleted = await db.delete(hotels).where(eq(hotels.id, input)).returning();

    if (!deleted || deleted.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Hotel not found",
      });
    }

    return { message: "Hotel deleted successfully" };
  }),

  // ==================== ROBOT INTEGRATION ====================

  toggleRobotAccessible: procedure
    .input(
      z.object({
        nestId: z.number(),
        accessible: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      const nest = await findOne(nests, eq(nests.id, input.nestId));
      if (!nest) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Nest not found" });
      }

      console.log(
        `Toggle request for nest ${nest.id}: accessible=${input.accessible}, current robotArmLocationId=${nest.robotArmLocationId}, current robotAccessible=${nest.robotAccessible}`,
      );

      if (input.accessible && !nest.robotArmLocationId) {
        // Create teachpoint with default zero coordinates
        const numJoints = 6; // Default for PF400
        const defaultCoords = Array(numJoints).fill(0).join(" ");

        const location = await db
          .insert(robotArmLocations)
          .values({
            name: nest.name || `Nest_${nest.id}`,
            locationType: "j",
            coordinates: defaultCoords,
            orientation: "landscape",
            toolId: nest.toolId || null, // Explicitly allow null for hotel nests
            sourceNestId: nest.id,
          })
          .returning();

        await db
          .update(nests)
          .set({
            robotAccessible: true,
            robotArmLocationId: location[0].id,
          })
          .where(eq(nests.id, input.nestId));

        if (nest.toolId) await safeReloadWaypoints(nest.toolId);

        console.log(
          `Created teachpoint ${location[0].id} for nest ${nest.id} (toolId: ${nest.toolId || "null"})`,
        );

        return { success: true, created: true, locationId: location[0].id };
      } else if (!input.accessible && nest.robotArmLocationId) {
        // Update nest first to remove foreign key reference
        await db
          .update(nests)
          .set({
            robotAccessible: false,
            robotArmLocationId: null,
          })
          .where(eq(nests.id, input.nestId));

        // Then delete teachpoint
        await db.delete(robotArmLocations).where(eq(robotArmLocations.id, nest.robotArmLocationId));

        if (nest.toolId) await safeReloadWaypoints(nest.toolId);

        return { success: true, created: false };
      } else if (input.accessible && nest.robotArmLocationId) {
        // Already has a teachpoint, just ensure it's marked as accessible
        await db
          .update(nests)
          .set({
            robotAccessible: true,
          })
          .where(eq(nests.id, input.nestId));

        console.log(
          `Nest ${nest.id} already has teachpoint ${nest.robotArmLocationId}, just updating accessibility`,
        );

        return { success: true, created: false, locationId: nest.robotArmLocationId };
      } else if (!input.accessible && !nest.robotArmLocationId) {
        // Already not accessible and no teachpoint
        await db
          .update(nests)
          .set({
            robotAccessible: false,
          })
          .where(eq(nests.id, input.nestId));

        return { success: true, created: false };
      }

      return { success: true, created: false };
    }),

  inferHotelPositions: procedure
    .input(
      z.object({
        hotelId: z.number(),
        referenceNestId: z.number(),
        zOffset: z.number(), // mm between vertical levels
      }),
    )
    .mutation(async ({ input }) => {
      const referenceNest = await findOne(nests, eq(nests.id, input.referenceNestId));
      if (!referenceNest?.robotArmLocationId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Reference nest must have a taught position",
        });
      }

      const referenceLocation = await findOne(
        robotArmLocations,
        eq(robotArmLocations.id, referenceNest.robotArmLocationId),
      );
      if (!referenceLocation) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Reference location not found" });
      }

      const hotelNests = await findMany(nests, eq(nests.hotelId, input.hotelId));
      const referenceCoords = referenceLocation.coordinates.split(" ").map(Number);

      let inferredCount = 0;

      for (const nest of hotelNests) {
        if (nest.id === input.referenceNestId) continue; // Skip reference itself

        // Calculate Z-offset based on row difference
        const rowDiff = nest.row - referenceNest.row;
        const inferredCoords = [...referenceCoords];
        inferredCoords[2] += rowDiff * input.zOffset; // Adjust Z-axis (index 2)

        const inferredCoordsStr = inferredCoords.join(" ");
        const calculatedZOffset = rowDiff * input.zOffset;

        // Create or update teachpoint
        if (nest.robotArmLocationId) {
          // Update existing
          await db
            .update(robotArmLocations)
            .set({ coordinates: inferredCoordsStr })
            .where(eq(robotArmLocations.id, nest.robotArmLocationId));

          await db
            .update(nests)
            .set({
              zOffset: calculatedZOffset,
              referenceNestId: input.referenceNestId,
            })
            .where(eq(nests.id, nest.id));
        } else {
          // Create new (auto-enable robot accessibility per user preference)
          const location = await db
            .insert(robotArmLocations)
            .values({
              name: nest.name || `Nest_${nest.id}`,
              locationType: "j",
              coordinates: inferredCoordsStr,
              orientation: referenceLocation.orientation,
              toolId: nest.toolId,
              sourceNestId: nest.id,
            })
            .returning();

          await db
            .update(nests)
            .set({
              robotAccessible: true, // Auto-enable per user preference
              robotArmLocationId: location[0].id,
              zOffset: calculatedZOffset,
              referenceNestId: input.referenceNestId,
            })
            .where(eq(nests.id, nest.id));
        }

        inferredCount++;
      }

      if (referenceNest.toolId) await safeReloadWaypoints(referenceNest.toolId);

      return { success: true, inferredCount };
    }),

  createTransferStation: procedure
    .input(
      z.object({
        toolId: z.number(),
        name: z.string(),
        row: z.number().default(0),
        column: z.number().default(0),
      }),
    )
    .mutation(async ({ input }) => {
      // Create nest with transfer_station type
      const nest = await db
        .insert(nests)
        .values({
          name: input.name,
          row: input.row,
          column: input.column,
          toolId: input.toolId,
          nestType: "transfer_station",
          robotAccessible: true, // Transfer stations are always accessible
        })
        .returning();

      // Auto-create teachpoint
      const location = await db
        .insert(robotArmLocations)
        .values({
          name: input.name,
          locationType: "j",
          coordinates: "0 0 0 0 0 0",
          orientation: "landscape",
          toolId: input.toolId,
          sourceNestId: nest[0].id,
        })
        .returning();

      await db
        .update(nests)
        .set({ robotArmLocationId: location[0].id })
        .where(eq(nests.id, nest[0].id));

      await safeReloadWaypoints(input.toolId);

      return { success: true, nest: nest[0], location: location[0] };
    }),

  getNestsWithTeachpoints: procedure
    .input(
      z.object({
        toolId: z.number().optional(),
        hotelId: z.number().optional(),
      }),
    )
    .query(async ({ input }) => {
      let query = db
        .select({
          nest: nests,
          location: robotArmLocations,
          tool: tools,
        })
        .from(nests)
        .leftJoin(robotArmLocations, eq(nests.robotArmLocationId, robotArmLocations.id))
        .leftJoin(tools, eq(nests.toolId, tools.id));

      if (input.toolId) {
        query = query.where(eq(nests.toolId, input.toolId)) as any;
      } else if (input.hotelId) {
        query = query.where(eq(nests.hotelId, input.hotelId)) as any;
      } else {
        // When no filter specified, only return robot-accessible nests
        query = query.where(eq(nests.robotAccessible, true)) as any;
      }

      return await query;
    }),
});
