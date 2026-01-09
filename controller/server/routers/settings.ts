import { procedure, router } from "@/server/trpc";
import { db } from "@/db/client";
import { appSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

/**
 * Drizzle-backed app settings (local controller DB).
 *
 * This router intentionally preserves the older `trpc.settings.*` surface area used by the UI,
 * while storing data in the `app_settings` table.
 */
export const settingsRouter = router({
  getAll: procedure.query(async () => {
    return await db.select().from(appSettings);
  }),

  getByName: procedure.input(z.string()).query(async ({ input }) => {
    const rows = await db.select().from(appSettings).where(eq(appSettings.name, input)).limit(1);
    return rows[0] ?? null;
  }),

  /**
   * Upsert a setting by name.
   */
  set: procedure
    .input(
      z.object({
        name: z.string().min(1),
        value: z.string(), // allow empty values
        is_active: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { name, value, is_active } = input;
      const existing = await db.select().from(appSettings).where(eq(appSettings.name, name)).limit(1);

      if (!existing[0]) {
        const inserted = await db
          .insert(appSettings)
          .values({ name, value, isActive: is_active ?? true })
          .returning();
        return inserted[0];
      }

      const updated = await db
        .update(appSettings)
        .set({ value, isActive: is_active ?? true, updatedAt: new Date().toISOString() })
        .where(eq(appSettings.name, name))
        .returning();
      return updated[0];
    }),
});
