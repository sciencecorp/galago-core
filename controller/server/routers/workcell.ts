import { procedure, router } from "@/server/trpc";
import { get, post, put, del } from "@/server/utils/api";
import { Workcell , AppSettings} from "@/types/api";
import { z } from "zod";

export const zWorkcell = z.object({
  id: z.number().optional(),
  name: z.string(),
  location: z.string().optional(),
  description:z.string().optional()
});

export const workcellRouter = router({
  
  getAll: procedure.query(async () => {
    const response = await get<Workcell[]>(`/workcells`);
    return response;
  }),

  get: procedure.input(z.string()).mutation(async ({ input }) => {
    const response = await get<Workcell>(`/workcells/${input}`);
    return response;
  }),

  // Add a new variable
  add: procedure
  .input(zWorkcell.omit({ id: true })) // Input does not require `id`
  .mutation(async ({ input }) => {
    const response = await post<Workcell>(`/workcells`, input);
    return response;
  }),

  // Edit an existing variable
  edit: procedure
    .input(zWorkcell) // Editing by name, only `value` and `type` are editable
    .mutation(async ({ input }) => {
      const { id } = input;
      const response = await put<Workcell>(`/workcells/${id}`, input);
      return response;
    }),

  // Delete a variable
  delete: procedure.input(z.number()).mutation(async ({ input }) => {
    await del(`/workcells/${input}`);
    return { message: "Workcell deleted successfully" };
  }),

  setSelectedWorkcell: procedure.input(z.string()).mutation(async ({ input }) => {
    return await put<AppSettings>(`/settings/workcell`, {value:input});
  }),

  getSelectedWorkcell: procedure.query(async () => {
    const response = await get<AppSettings>(`/settings/workcell`);
    return response.value;
  }),
});
