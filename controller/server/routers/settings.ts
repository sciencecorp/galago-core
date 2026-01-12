import { procedure, router } from "@/server/trpc";
import { db } from "@/db/client";
import { appSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export interface AppSettingRow {
  id: number;
  name: string;
  value: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const settingsRouter = router({
  getAll: procedure.query(async () => {
    const rows = await db.select().from(appSettings);
    return rows.map(
      (r): AppSettingRow => ({
        id: r.id,
        name: r.name,
        value: r.value,
        is_active: Boolean(r.isActive),
        created_at: r.createdAt,
        updated_at: r.updatedAt,
      }),
    );
  }),

  set: procedure
    .input(
      z.object({
        name: z.string().min(1),
        value: z.string().default(""),
        is_active: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const existing = await db
        .select()
        .from(appSettings)
        .where(eq(appSettings.name, input.name))
        .limit(1);

      if (existing.length > 0) {
        const updated = await db
          .update(appSettings)
          .set({
            value: input.value,
            isActive: input.is_active ?? true,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(appSettings.name, input.name))
          .returning();

        const r = updated[0];
        return {
          id: r.id,
          name: r.name,
          value: r.value,
          is_active: Boolean(r.isActive),
          created_at: r.createdAt,
          updated_at: r.updatedAt,
        } satisfies AppSettingRow;
      }

      const created = await db
        .insert(appSettings)
        .values({
          name: input.name,
          value: input.value,
          isActive: input.is_active ?? true,
        })
        .returning();

      const r = created[0];
      return {
        id: r.id,
        name: r.name,
        value: r.value,
        is_active: Boolean(r.isActive),
        created_at: r.createdAt,
        updated_at: r.updatedAt,
      } satisfies AppSettingRow;
    }),
});
