import { procedure, router } from "@/server/trpc";
import { get, post } from "@/server/utils/api";
import { z } from "zod";

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
    return await get<BackupSetting[]>(`/backup/settings`);
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
      return await post<{ ok: boolean; count: number }>(`/backup/settings`, {
        settings: input.settings.map((s) => ({ ...s, is_active: s.is_active ?? true })),
      });
    }),

  exportSecretsMeta: procedure.query(async () => {
    return await get<SecretMeta[]>(`/backup/secrets/meta`);
  }),
});
