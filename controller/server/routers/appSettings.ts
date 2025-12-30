import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { db } from "@/db/client";
import { app_settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Validation schema matching your existing pattern
const zAppSettings = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  value: z.string().min(1),
  is_active: z.boolean().default(true),
});

export const appSettingsRouter = router({
  // Get all settings
  getAll: procedure.query(async () => {
    const settings = await db.select().from(app_settings);
    return settings;
  }),

  // Get setting by name (using mutation to match your pattern)
  get: procedure.input(z.string()).mutation(async ({ input }) => {
    const setting = await db
      .select()
      .from(app_settings)
      .where(eq(app_settings.name, input))
      .limit(1);

    if (!setting || setting.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Setting not found",
      });
    }

    return setting[0];
  }),

  // Create setting
  add: procedure.input(zAppSettings.omit({ id: true })).mutation(async ({ input }) => {
    const result = await db.insert(app_settings).values(input).returning();

    return result[0];
  }),

  // Update setting
  edit: procedure.input(zAppSettings).mutation(async ({ input }) => {
    const { id, ...updateData } = input;

    if (!id) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Setting ID is required",
      });
    }

    const updated = await db
      .update(app_settings)
      .set({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .where(eq(app_settings.id, id))
      .returning();

    if (!updated || updated.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Setting not found",
      });
    }

    return updated[0];
  }),

  // Delete setting
  delete: procedure.input(z.number()).mutation(async ({ input }) => {
    const deleted = await db.delete(app_settings).where(eq(app_settings.id, input)).returning();

    if (!deleted || deleted.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Setting not found",
      });
    }

    return { message: "Setting deleted successfully" };
  }),
});
