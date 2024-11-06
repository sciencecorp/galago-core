import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { Variable } from "@/components/variables/types";
import { get, post, put, del } from "../utils/api";
import { getHTTPStatusCodeFromError } from '@trpc/server/http';

const domain = "http://localhost:8000";

export const zVariable = z.object({
  id: z.number().optional(),
  name: z.string(),
  value: z.string(),
  type: z.enum(["string", "number", "boolean", "array", "object"]),
});

export const variableRouter = router({
  // Get all variables
  getAll: procedure.query(async () => {
    const response = await get<Variable[]>(`${domain}/variables`);
    return response;
  }),
  
  // Get a specific variable
  get: procedure
    .input(z.string())
    .query(async ({ input }) => {
      const response = await get<Variable>(`${domain}/variables/${input}`);
      return response;
    }),
  
  // Add a new variable
  add: procedure
    .input(zVariable.omit({ id: true })) // Input does not require `id`
    .mutation(async ({ input }) => {
      const response = await post<Variable>(`${domain}/variables`, input);
      return response;
    }),
  
  // Edit an existing variable
  edit: procedure
    .input(zVariable) // Editing by name, only `value` and `type` are editable
    .mutation(async ({ input }) => {
      const { id } = input;
      const response = await put<Variable>(`${domain}/variables/${id}`, input);
      return response;
    }),

  // Delete a variable
  delete: procedure.input(z.number()).mutation(async ({ input }) => {
    await del(`${domain}/variables/${input}`);
    return { message: "Variable deleted successfully" };
  }),
});
