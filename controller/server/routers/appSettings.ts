import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { db } from "@/db/client";
import { appSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const zAppSettings = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  value: z.string().min(1),
  isActive: z.boolean().default(true),
});

export const appSettingsRouter = router({
  getAll: procedure.query(async () => {
    const settings = await db.select().from(appSettings);
    return settings;
  }),

  get: procedure.input(z.string()).mutation(async ({ input }) => {
    const setting = await db.select().from(appSettings).where(eq(appSettings.name, input)).limit(1);

    if (!setting || setting.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Setting not found",
      });
    }

    return setting[0];
  }),

  add: procedure.input(zAppSettings.omit({ id: true })).mutation(async ({ input }) => {
    const result = await db.insert(appSettings).values(input).returning();
    return result[0];
  }),

  edit: procedure.input(zAppSettings).mutation(async ({ input }) => {
    const { id, ...updateData } = input;

    if (!id) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Setting ID is required",
      });
    }

    const updated = await db
      .update(appSettings)
      .set({
        ...updateData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(appSettings.id, id))
      .returning();

    if (!updated || updated.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Setting not found",
      });
    }

    return updated[0];
  }),

  delete: procedure.input(z.number()).mutation(async ({ input }) => {
    const deleted = await db.delete(appSettings).where(eq(appSettings.id, input)).returning();

    if (!deleted || deleted.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Setting not found",
      });
    }

    return { message: "Setting deleted successfully" };
  }),
});
