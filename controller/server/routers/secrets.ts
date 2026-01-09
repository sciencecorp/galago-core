import { procedure, router } from "@/server/trpc";
import { del, get, put } from "@/server/utils/api";
import { z } from "zod";

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
    return await get<SecretsStatus>(`/secrets/status`);
  }),

  getAll: procedure.query(async () => {
    return await get<AppSecretMeta[]>(`/secrets`);
  }),

  set: procedure
    .input(
      z.object({
        name: z.string(),
        value: z.string(),
        is_active: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { name, value, is_active } = input;
      return await put<AppSecretMeta>(`/secrets/${name}`, { value, is_active: is_active ?? true });
    }),

  clear: procedure.input(z.string()).mutation(async ({ input }) => {
    return await del<{ message: string }>(`/secrets/${input}`);
  }),
});
