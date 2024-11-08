import { procedure, router } from "@/server/trpc";
import { get, post, put, del } from "@/server/utils/api";
import { Workcell } from "@/types/api";
import { z } from "zod";

export const workcellRouter = router({
  getAll: procedure.query(async () => {
    const response = await get<Workcell[]>(`/workcells`);
  }),

  get: procedure.input(z.string()).mutation(async ({ input }) => {
    const response = await get<Workcell>(`/workcells/${input}`);
    return response;
  }),
});
