import { procedure, router } from "@/server/trpc";
import { get, post, put } from "@/server/utils/api";
import { AppSettings } from "@/types/api";
import { zAppSettings } from "./types";
import { z } from "zod";

/**
 * FastAPI routes:
 * - GET  /settings
 * - GET  /settings/{name}
 * - POST /settings
 * - PUT  /settings/{name}   (upsert)
 */
export const settingsRouter = router({
  getAll: procedure.query(async () => {
    return await get<AppSettings[]>(`/settings`);
  }),

  getByName: procedure.input(z.string()).query(async ({ input }) => {
    return await get<AppSettings>(`/settings/${input}`);
  }),

  /**
   * Upsert a setting by name.
   */
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
      return await put<AppSettings>(`/settings/${name}`, { value, is_active: is_active ?? true });
    }),

  /**
   * Create a setting (rarely needed since `set` is an upsert).
   */
  create: procedure.input(zAppSettings.omit({ id: true })).mutation(async ({ input }) => {
    return await post<AppSettings>(`/settings`, input);
  }),
});
