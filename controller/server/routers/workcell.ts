import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { db } from "@/db/client";
import { workcells, appSettings, tools, protocols, hotels } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const zWorkcell = z.object({
  id: z.number().optional(),
  name: z.string(),
  location: z.string().optional(),
  description: z.string().optional(),
});

export const workcellRouter = router({
  getAll: procedure.query(async () => {
    const allWorkcells = await db.select().from(workcells);

    const workcellsWithRelations = await Promise.all(
      allWorkcells.map(async (workcell) => {
        const workcellTools = await db
          .select()
          .from(tools)
          .where(eq(tools.workcellId, workcell.id));

        const workcellProtocols = await db
          .select()
          .from(protocols)
          .where(eq(protocols.workcellId, workcell.id));

        const workcellHotels = await db
          .select()
          .from(hotels)
          .where(eq(hotels.workcellId, workcell.id));

        return {
          ...workcell,
          tools: workcellTools,
          protocols: workcellProtocols,
          hotels: workcellHotels,
        };
      }),
    );

    return workcellsWithRelations;
  }),

  get: procedure.input(z.string()).mutation(async ({ input }) => {
    const id = parseInt(input);
    if (isNaN(id)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid workcell ID",
      });
    }

    const workcell = await db.select().from(workcells).where(eq(workcells.id, id)).limit(1);

    if (!workcell || workcell.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Workcell not found",
      });
    }

    return workcell[0];
  }),

  add: procedure.input(zWorkcell.omit({ id: true })).mutation(async ({ input }) => {
    try {
      const result = await db.insert(workcells).values(input).returning();
      return result[0];
    } catch (error: any) {
      if (error.message?.includes("UNIQUE constraint failed")) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A workcell with this name already exists",
        });
      }
      throw error;
    }
  }),

  edit: procedure.input(zWorkcell).mutation(async ({ input }) => {
    const { id, ...updateData } = input;

    if (!id) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Workcell ID is required",
      });
    }

    try {
      const updated = await db
        .update(workcells)
        .set({
          ...updateData,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(workcells.id, id))
        .returning();

      if (!updated || updated.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workcell not found",
        });
      }

      return updated[0];
    } catch (error: any) {
      if (error.message?.includes("UNIQUE constraint failed")) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A workcell with this name already exists",
        });
      }
      throw error;
    }
  }),

  delete: procedure.input(z.number()).mutation(async ({ input }) => {
    const deleted = await db.delete(workcells).where(eq(workcells.id, input)).returning();

    if (!deleted || deleted.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Workcell not found",
      });
    }

    return { message: "Workcell deleted successfully" };
  }),

  setSelectedWorkcell: procedure.input(z.string()).mutation(async ({ input }) => {
    const existing = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.name, "workcell"))
      .limit(1);

    if (existing && existing.length > 0) {
      const updated = await db
        .update(appSettings)
        .set({
          value: input,
          isActive: true,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(appSettings.name, "workcell"))
        .returning();

      return updated[0];
    } else {
      const created = await db
        .insert(appSettings)
        .values({
          name: "workcell",
          value: input,
          isActive: true,
        })
        .returning();

      return created[0];
    }
  }),

  getSelectedWorkcell: procedure.query(async () => {
    const setting = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.name, "workcell"))
      .limit(1);

    if (!setting || setting.length === 0 || !setting[0].isActive) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No workcell is currently selected. Please select a workcell in settings.",
      });
    }

    return setting[0].value;
  }),

  exportConfig: procedure.input(z.number()).mutation(async ({ input }) => {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Export functionality to be implemented",
    });
  }),

  importConfig: procedure.input(z.object({ file: z.any() })).mutation(async ({ input }) => {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Import functionality to be implemented",
    });
  }),
});
