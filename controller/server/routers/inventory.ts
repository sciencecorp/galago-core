import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { db } from "@/db/client";
import { findOne, findMany, getSelectedWorkcellId } from "@/db/helpers";
import { nests, plates, wells, reagents, hotels, tools, workcells } from "@/db/schema";
import { eq, and, inArray, isNull } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const zNest = z.object({
  id: z.number().optional(),
  name: z.string(),
  row: z.number(),
  column: z.number(),
  toolId: z.number().nullable().optional(),
  hotelId: z.number().nullable().optional(),
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

  getPlates: procedure.input(z.string().optional()).query(async ({ input: workcellName }) => {
    let workcellId: number;

    if (workcellName) {
      const workcell = await getWorkcellByName(workcellName);
      workcellId = workcell.id;
    } else {
      workcellId = await getSelectedWorkcellId();
    }

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

    const workcellPlates =
      nestIds.length > 0
        ? await db.select().from(plates).where(inArray(plates.nestId, nestIds))
        : [];

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

  createPlate: procedure.input(zPlateCreate).mutation(async ({ input }) => {
    try {
      // Create plate - database will enforce uniqueness
      const newPlate = await db
        .insert(plates)
        .values({
          name: input.name,
          barcode: input.barcode,
          plateType: input.plateType,
          nestId: input.nestId || null,
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
          message: "A plate with this barcode or name already exists",
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
});
