import { procedure, router } from "@/server/trpc";
import { db } from "@/db/client";
import { appSecrets, appSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { logAuditEvent } from "@/server/utils/auditLog";

export interface BackupSetting {
  name: string;
  value: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
  id?: number;
}

export interface SecretMeta {
  name: string;
  is_active: boolean;
  is_set: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export const backupRouter = router({
  exportSettings: procedure.query(async () => {
    const rows = await db.select().from(appSettings);
    return rows.map(
      (r): BackupSetting => ({
        id: r.id,
        name: r.name,
        value: r.value,
        is_active: Boolean(r.isActive),
        created_at: r.createdAt ? new Date(r.createdAt) : undefined,
        updated_at: r.updatedAt ? new Date(r.updatedAt) : undefined,
      }),
    );
  }),

  importSettings: procedure
    .input(
      z.object({
        settings: z.array(
          z.object({
            name: z.string(),
            value: z.string().default(""),
            is_active: z.boolean().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      let upserted = 0;
      for (const s of input.settings) {
        const name = String(s.name || "").trim();
        if (!name) continue;
        const value = String(s.value ?? "");
        const isActive = s.is_active ?? true;

        const existing = await db
          .select()
          .from(appSettings)
          .where(eq(appSettings.name, name))
          .limit(1);
        if (existing.length > 0) {
          await db.update(appSettings).set({ value, isActive }).where(eq(appSettings.name, name));
        } else {
          await db.insert(appSettings).values({ name, value, isActive });
        }
        upserted++;
      }

      await logAuditEvent({
        action: "backup.settings.import",
        targetType: "backup",
        targetName: "settings",
        details: { count: upserted },
      });

      return { ok: true, count: upserted };
    }),

  exportSecretsMeta: procedure.query(async () => {
    const rows = await db.select().from(appSecrets);
    return rows.map(
      (r): SecretMeta => ({
        name: r.name,
        is_active: Boolean(r.isActive),
        is_set: true,
        created_at: r.createdAt ? new Date(r.createdAt) : undefined,
        updated_at: r.updatedAt ? new Date(r.updatedAt) : undefined,
      }),
    );
  }),
});
