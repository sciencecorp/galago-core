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
  plateNestHistory,
} from "@/db/schema";
import { eq, and, inArray, isNull } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Zod schemas - using camelCase
const zNest = z.object({
  id: z.number().optional(),
  name: z.string(),
  row: z.number(),
  column: z.number(),
  toolId: z.number().nullable().optional(),
  hotelId: z.number().nullable().optional(),
  status: z.enum(["empty", "occupied", "reserved", "error"]).optional(),
});

const zPlate = z.object({
  id: z.number().optional(),
  name: z.string().nullable(),
  barcode: z.string(),
  plateType: z.string(),
  nestId: z.number().nullable().optional(),
  status: z.enum(["stored", "checked_out", "completed", "disposed"]).optional(),
});

const zWell = z.object({
  id: z.number().optional(),
  row: z.string(),
  column: z.number(),
  plateId: z.number(),
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
  description: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  rows: z.number(),
  columns: z.number(),
});

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
    "6 well with organoid inserts": { columns: [1, 2, 3], rows: ["A", "B"] },
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
  // ============================================================================
  // NEST OPERATIONS
  // ============================================================================

  getNests: procedure.input(z.string().optional()).query(async ({ input: workcellName }) => {
    let workcell;

    if (workcellName) {
      workcell = await getWorkcellByName(workcellName);
    } else {
      const workcellId = await getSelectedWorkcellId();
      workcell = await findOne(workcells, eq(workcells.id, workcellId));
      if (!workcell) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workcell not found",
        });
      }
    }

    // Get all tool IDs for this workcell
    const workcellTools = await db
      .select({ id: tools.id })
      .from(tools)
      .where(eq(tools.workcellId, workcell.id));

    const toolIds = workcellTools.map((t) => t.id);

    // Get all hotel IDs for this workcell
    const workcellHotels = await db
      .select({ id: hotels.id })
      .from(hotels)
      .where(eq(hotels.workcellId, workcell.id));

    const hotelIds = workcellHotels.map((h) => h.id);

    // Get nests from tools
    const toolNests =
      toolIds.length > 0 ? await db.select().from(nests).where(inArray(nests.toolId, toolIds)) : [];

    // Get nests from hotels
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
        status: input.status || "empty",
      })
      .returning();

    return result[0];
  }),

  updateNest: procedure.input(zNest).mutation(async ({ input }) => {
    const { id, ...updateData } = input;

    if (!id) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Nest ID is required",
      });
    }

    const updated = await db
      .update(nests)
      .set({
        name: updateData.name,
        row: updateData.row,
        column: updateData.column,
        toolId: updateData.toolId || null,
        hotelId: updateData.hotelId || null,
        status: updateData.status || "empty",
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

  // ============================================================================
  // PLATE OPERATIONS
  // ============================================================================

  getPlates: procedure.input(z.string().optional()).query(async ({ input: workcellName }) => {
    let workcell;

    if (workcellName) {
      workcell = await getWorkcellByName(workcellName);
    } else {
      const workcellId = await getSelectedWorkcellId();
      workcell = await findOne(workcells, eq(workcells.id, workcellId));
      if (!workcell) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workcell not found",
        });
      }
    }

    // Get all tool IDs for this workcell
    const workcellTools = await db
      .select({ id: tools.id })
      .from(tools)
      .where(eq(tools.workcellId, workcell.id));

    const toolIds = workcellTools.map((t) => t.id);

    // Get all hotel IDs for this workcell
    const workcellHotels = await db
      .select({ id: hotels.id })
      .from(hotels)
      .where(eq(hotels.workcellId, workcell.id));

    const hotelIds = workcellHotels.map((h) => h.id);

    // Get nest IDs from tools and hotels
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

    // Get plates in these nests
    const workcellPlates =
      nestIds.length > 0
        ? await db.select().from(plates).where(inArray(plates.nestId, nestIds))
        : [];

    // Get unassigned plates
    const unassignedPlates = await db.select().from(plates).where(isNull(plates.nestId));

    return [...workcellPlates, ...unassignedPlates];
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

  createPlate: procedure.input(zPlate.omit({ id: true })).mutation(async ({ input }) => {
    // Check for existing plate
    if (input.name) {
      const existing = await findOne(plates, eq(plates.name, input.name));
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Plate with that name already exists",
        });
      }
    }

    // Create plate
    const newPlate = await db
      .insert(plates)
      .values({
        name: input.name,
        barcode: input.barcode,
        plateType: input.plateType,
        nestId: input.nestId || null,
        status: input.status || "stored",
      })
      .returning();

    const plate = newPlate[0];

    // Update nest status if assigned
    if (plate.nestId !== null) {
      await db.update(nests).set({ status: "occupied" }).where(eq(nests.id, plate.nestId));

      // Create history record
      await db.insert(plateNestHistory).values({
        plateId: plate.id,
        nestId: plate.nestId,
        action: "check_in",
      });
    }

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

    // Check if this is a checkout operation
    const isCheckout = plate.nestId !== null && updateData.nestId === null;

    // Check if this is a check-in operation
    const isCheckin =
      plate.nestId === null && updateData.nestId !== null && updateData.nestId !== undefined;

    if (isCheckout) {
      // Update plate status to checked_out
      const updated = await db
        .update(plates)
        .set({
          nestId: null,
          status: "checked_out",
          updatedAt: new Date().toISOString(),
        })
        .where(eq(plates.id, id))
        .returning();

      // Update old nest status
      if (plate.nestId) {
        await db.update(nests).set({ status: "empty" }).where(eq(nests.id, plate.nestId));

        // Create history record
        await db.insert(plateNestHistory).values({
          plateId: id,
          nestId: plate.nestId,
          action: "check_out",
        });
      }

      return updated[0];
    }

    if (isCheckin && updateData.nestId !== null) {
      // Check if nest is available
      const nest = await findOne(nests, eq(nests.id, updateData.nestId));
      if (!nest) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Nest not found",
        });
      }

      if (nest.status !== "empty") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Nest is already occupied",
        });
      }

      // Update plate
      const updated = await db
        .update(plates)
        .set({
          nestId: updateData.nestId,
          status: "stored",
          updatedAt: new Date().toISOString(),
        })
        .where(eq(plates.id, id))
        .returning();

      // Update nest status
      await db.update(nests).set({ status: "occupied" }).where(eq(nests.id, updateData.nestId));

      // Create history record
      await db.insert(plateNestHistory).values({
        plateId: id,
        nestId: updateData.nestId,
        action: "check_in",
      });

      return updated[0];
    }

    // Regular update
    const updated = await db
      .update(plates)
      .set({
        name: updateData.name,
        barcode: updateData.barcode,
        plateType: updateData.plateType,
        nestId: updateData.nestId,
        status: updateData.status || "stored",
        updatedAt: new Date().toISOString(),
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

  // ============================================================================
  // WELL OPERATIONS
  // ============================================================================

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
      let workcell;
      if (input?.workcellName) {
        workcell = await getWorkcellByName(input.workcellName);
      } else {
        const workcellId = await getSelectedWorkcellId();
        workcell = await findOne(workcells, eq(workcells.id, workcellId));
        if (!workcell) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Workcell not found",
          });
        }
      }

      // Get all plates in workcell, then their wells
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

  // ============================================================================
  // REAGENT OPERATIONS
  // ============================================================================

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
      let workcell;
      if (input?.workcellName) {
        workcell = await getWorkcellByName(input.workcellName);
      } else {
        const workcellId = await getSelectedWorkcellId();
        workcell = await findOne(workcells, eq(workcells.id, workcellId));
        if (!workcell) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Workcell not found",
          });
        }
      }

      // Get all nests -> plates -> wells -> reagents
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

  // ============================================================================
  // HOTEL OPERATIONS
  // ============================================================================

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
        description: input.description || null,
        imageUrl: input.imageUrl || null,
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
        description: updateData.description || null,
        imageUrl: updateData.imageUrl || null,
        workcellId: updateData.workcellId,
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
});
