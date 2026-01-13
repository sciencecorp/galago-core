import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { db } from "@/db/client";
import { findOne, findMany, getSelectedWorkcellId } from "@/db/helpers";
import { labware, tools, logs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import Tool from "../tools";

export const zLabware = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  description: z.string(),
  numberOfRows: z.number(),
  numberOfColumns: z.number(),
  zOffset: z.number().default(0),
  width: z.number().nullable().default(127.8),
  height: z.number().nullable().default(14.5),
  plateLidOffset: z.number().nullable().default(0),
  lidOffset: z.number().nullable().default(0),
  stackHeight: z.number().nullable().default(0),
  hasLid: z.boolean().nullable().default(false),
  workcellId: z.number().nullable().optional(),
});

async function reloadLabwareInPF400Tools() {
  try {
    const allTools = await findMany(tools);
    const pf400Tools = allTools.filter((tool) => tool.type === "pf400");

    if (pf400Tools.length > 0) {
      await Promise.all(
        pf400Tools.map(async (tool) => {
          try {
            await Tool.loadLabwareToPF400(tool.name);
          } catch (error) {
            console.error(`Error loading labware to ${tool.name}:`, error);
          }
        }),
      );
    }
  } catch (error) {
    console.error("Error reloading labware in PF400 tools:", error);
  }
}

export const labwareRouter = router({
  getAll: procedure.query(async () => {
    const workcellId = await getSelectedWorkcellId();
    const allLabware = await findMany(labware, eq(labware.workcellId, workcellId));
    return allLabware;
  }),

  get: procedure.input(z.string()).query(async ({ input }) => {
    const id = parseInt(input);
    if (isNaN(id)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid labware ID",
      });
    }

    const labwareItem = await findOne(labware, eq(labware.id, id));

    if (!labwareItem) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Labware not found",
      });
    }

    return labwareItem;
  }),

  add: procedure.input(zLabware.omit({ id: true })).mutation(async ({ input }) => {
    const workcellId = input.workcellId || (await getSelectedWorkcellId());
    try {
      const result = await db
        .insert(labware)
        .values({
          ...input,
          workcellId,
        })
        .returning();

      await db.insert(logs).values({
        level: "info",
        action: "New Labware Added",
        details: `Labware ${input.name} added successfully.`,
      });

      await reloadLabwareInPF400Tools();

      return result[0];
    } catch (error: any) {
      if (error.message?.includes("UNIQUE constraint failed")) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Labware with name '${input.name}' already exists in this workcell`,
        });
      }
      throw error;
    }
  }),

  edit: procedure.input(zLabware).mutation(async ({ input }) => {
    const { id, ...updateData } = input;

    if (!id) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Labware ID is required",
      });
    }

    const existing = await findOne(labware, eq(labware.id, id));

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Labware not found",
      });
    }

    try {
      const updated = await db
        .update(labware)
        .set({
          ...updateData,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(labware.id, id))
        .returning();

      await db.insert(logs).values({
        level: "info",
        action: "Labware Edited",
        details: `Labware ${input.name} updated successfully.`,
      });

      await reloadLabwareInPF400Tools();

      return updated[0];
    } catch (error: any) {
      if (error.message?.includes("UNIQUE constraint failed")) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Labware with name '${input.name}' already exists in this workcell`,
        });
      }
      throw error;
    }
  }),

  delete: procedure.input(z.number()).mutation(async ({ input }) => {
    const deleted = await db.delete(labware).where(eq(labware.id, input)).returning();

    if (!deleted || deleted.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Labware not found",
      });
    }

    await reloadLabwareInPF400Tools();

    return { message: "Labware deleted successfully" };
  }),

  exportConfig: procedure.input(z.number()).mutation(async ({ input }) => {
    const labwareItem = await findOne(labware, eq(labware.id, input));

    if (!labwareItem) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Labware not found",
      });
    }

    return labwareItem;
  }),

  exportAllConfig: procedure.mutation(async () => {
    const workcellId = await getSelectedWorkcellId();
    const allLabware = await findMany(labware, eq(labware.workcellId, workcellId));
    return allLabware;
  }),

  importConfig: procedure
    .input(
      z
        .union([
          // Exported labware object (may include id/workcellId/timestamps/etc)
          zLabware.passthrough(),
          // Exported array of labware objects
          z.array(zLabware.passthrough()),
          // Wrapper formats (e.g. { labware: [...] })
          z.object({ labware: z.array(zLabware.passthrough()) }).passthrough(),
        ])
        .transform((v) => {
          if (Array.isArray(v)) return v;
          if (v && typeof v === "object" && "labware" in v && Array.isArray((v as any).labware)) {
            return (v as any).labware as any[];
          }
          return [v as any];
        }),
    )
    .mutation(async ({ input }) => {
      const workcellId = await getSelectedWorkcellId();

      const results: any[] = [];

      for (const raw of input) {
        // Re-parse each item to ensure we have defaults applied.
        const parsed = zLabware.parse(raw);
        const { id: _id, workcellId: _wc, ...data } = parsed;

        const existing = await findOne(
          labware,
          and(eq(labware.name, data.name), eq(labware.workcellId, workcellId))!,
        );

        if (existing?.id) {
          const updated = await db
            .update(labware)
            .set({
              ...data,
              workcellId,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(labware.id, existing.id))
            .returning();
          results.push(updated[0]);
        } else {
          try {
            const created = await db
              .insert(labware)
              .values({
                ...data,
                workcellId,
              })
              .returning();
            results.push(created[0]);
          } catch (error: any) {
            if (error.message?.includes("UNIQUE constraint failed")) {
    throw new TRPCError({
                code: "CONFLICT",
                message: `Labware with name '${data.name}' already exists in this workcell`,
              });
            }
            throw error;
          }
        }
      }

      await db.insert(logs).values({
        level: "info",
        action: "Labware Imported",
        details: `Imported ${results.length} labware item(s).`,
      });

      await reloadLabwareInPF400Tools();

      return results.length === 1 ? results[0] : { imported: results };
  }),
});
