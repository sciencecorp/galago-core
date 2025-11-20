import { procedure, router } from "@/server/trpc";
import { get, post, put, del } from "@/server/utils/api";
import { AppSettings } from "@/types/api";
import { zAppSettings } from "./types";
import { z } from "zod";

export const workcellRouter = router({
  getAll: procedure.query(async () => {
    const response = await get<AppSettings[]>(`/settings`);
    return response;
  }),

  get: procedure.input(z.string()).mutation(async ({ input }) => {
    const response = await get<AppSettings>(`/settings/${input}`);
    return response;
  }),

  add: procedure
    .input(zAppSettings.omit({ id: true }))
    .mutation(async ({ input }) => {
      const response = await post<AppSettings>(`/settings`, input);
      return response;
    }),

  edit: procedure.input(zAppSettings).mutation(async ({ input }) => {
    const { id } = input;
    const response = await put<AppSettings>(`/settings/${id}`, input);
    return response;
  }),

  delete: procedure.input(z.number()).mutation(async ({ input }) => {
    await del(`/settings/${input}`);
    return { message: "Workcell deleted successfully" };
  }),
});
