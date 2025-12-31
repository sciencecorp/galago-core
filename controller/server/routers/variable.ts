import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { db } from "@/db/client";
import { findOne, findMany } from "@/db/helpers";
import { variables, workcells, appSettings, logs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const zVariable = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  value: z.string(),
  type: z.enum(["string", "number", "boolean", "array", "json"]),
  workcellId: z.number().optional(),
});

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

export const variableRouter = router({
  getAll: procedure.query(async () => {
    const workcellId = await getSelectedWorkcellId();
    const allVariables = await findMany(variables, eq(variables.workcellId, workcellId));
    return allVariables;
  }),

  get: procedure.input(z.string()).query(async ({ input }) => {
    const numericId = parseInt(input);

    if (!isNaN(numericId)) {
      const variable = await findOne(variables, eq(variables.id, numericId));

      if (!variable) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Variable not found",
        });
      }

      return variable;
    } else {
      const workcellId = await getSelectedWorkcellId();
      const variable = await findOne(
        variables,
        and(eq(variables.name, input), eq(variables.workcellId, workcellId)),
      );

      if (!variable) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Variable not found",
        });
      }

      return variable;
    }
  }),

  add: procedure.input(zVariable.omit({ id: true })).mutation(async ({ input }) => {
    const workcellId = input.workcellId || (await getSelectedWorkcellId());

    const existing = await findOne(
      variables,
      and(eq(variables.name, input.name), eq(variables.workcellId, workcellId)),
    );

    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Variable with that name already exists in this workcell",
      });
    }

    try {
      const result = await db
        .insert(variables)
        .values({
          ...input,
          workcellId,
        })
        .returning();

      await db.insert(logs).values({
        level: "info",
        action: "New Variable Added",
        details: `Variable ${input.name} of type ${input.type} added successfully.`,
      });

      return result[0];
    } catch (error: any) {
      if (error.message?.includes("UNIQUE constraint failed")) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Variable with that name already exists in this workcell",
        });
      }
      throw error;
    }
  }),

  edit: procedure.input(zVariable).mutation(async ({ input }) => {
    const { id, ...updateData } = input;

    if (!id) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Variable ID is required",
      });
    }

    const existing = await findOne(variables, eq(variables.id, id));

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Variable not found",
      });
    }

    try {
      const updated = await db
        .update(variables)
        .set({
          ...updateData,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(variables.id, id))
        .returning();

      await db.insert(logs).values({
        level: "info",
        action: "Variable Edited",
        details: `Variable ${input.name} value updated to ${input.value}.`,
      });

      return updated[0];
    } catch (error: any) {
      if (error.message?.includes("UNIQUE constraint failed")) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Variable with that name already exists in this workcell",
        });
      }
      throw error;
    }
  }),

  delete: procedure.input(z.number()).mutation(async ({ input }) => {
    const deleted = await db.delete(variables).where(eq(variables.id, input)).returning();

    if (!deleted || deleted.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Variable not found",
      });
    }

    await db.insert(logs).values({
      level: "info",
      action: "Variable Deleted",
      details: `Variable deleted successfully.`,
    });

    return { message: "Variable deleted successfully" };
  }),
});
