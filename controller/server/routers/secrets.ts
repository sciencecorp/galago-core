import { procedure, router } from "@/server/trpc";
import { db } from "@/db/client";
import { appSecrets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { encryptSecret, secretsKeyStatus } from "@/server/utils/secretsCrypto";
import { logAuditEvent } from "@/server/utils/auditLog";

export interface AppSecretMeta {
  name: string;
  is_active: boolean;
  is_set: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface SecretsStatus {
  configured: boolean;
  message?: string | null;
}

export const secretsRouter = router({
  status: procedure.query(async () => {
    return secretsKeyStatus();
  }),

  getAll: procedure.query(async () => {
    const rows = await db.select().from(appSecrets);
    return rows.map(
      (r): AppSecretMeta => ({
        name: r.name,
        is_active: Boolean(r.isActive),
        is_set: true,
        created_at: r.createdAt ? new Date(r.createdAt) : undefined,
        updated_at: r.updatedAt ? new Date(r.updatedAt) : undefined,
      }),
    );
  }),

  set: procedure
    .input(
      z.object({
        name: z.string().min(1),
        value: z.string().min(1),
        is_active: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { name, value } = input;
      const isActive = input.is_active ?? true;
      const encrypted = encryptSecret(value);

      const existing = await db.select().from(appSecrets).where(eq(appSecrets.name, name)).limit(1);
      if (existing.length > 0) {
        const updated = await db
          .update(appSecrets)
          .set({ encryptedValue: encrypted, isActive })
          .where(eq(appSecrets.name, name))
          .returning();
        const r = updated[0];
        await logAuditEvent({
          action: "secrets.set",
          targetType: "secret",
          targetName: name,
          details: { is_active: isActive },
        });
        return {
          name: r.name,
          is_active: Boolean(r.isActive),
          is_set: true,
          created_at: r.createdAt ? new Date(r.createdAt) : undefined,
          updated_at: r.updatedAt ? new Date(r.updatedAt) : undefined,
        } satisfies AppSecretMeta;
      }

      const created = await db
        .insert(appSecrets)
        .values({ name, encryptedValue: encrypted, isActive })
        .returning();
      const r = created[0];
      await logAuditEvent({
        action: "secrets.set",
        targetType: "secret",
        targetName: name,
        details: { is_active: isActive },
      });
      return {
        name: r.name,
        is_active: Boolean(r.isActive),
        is_set: true,
        created_at: r.createdAt ? new Date(r.createdAt) : undefined,
        updated_at: r.updatedAt ? new Date(r.updatedAt) : undefined,
      } satisfies AppSecretMeta;
    }),

  clear: procedure.input(z.string()).mutation(async ({ input }) => {
    const name = input;
    await db.delete(appSecrets).where(eq(appSecrets.name, name));
    await logAuditEvent({
      action: "secrets.clear",
      targetType: "secret",
      targetName: name,
      details: null,
    });
    return { message: "Secret cleared" };
  }),
});
