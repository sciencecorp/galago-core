import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { Variable } from "@/types/api";
import { get, getOrEmptyArray, post, put, del } from "../utils/api";
import { logAction } from "@/server/logger";

export const zVariable = z.object({
  id: z.number().optional(),
  name: z.string(),
  value: z.string(),
  type: z.enum(["string", "number", "boolean", "array", "json"]),
});

export const variableRouter = router({
  // Get all variables
  getAll: procedure.query(async () => {
    return await getOrEmptyArray<Variable>(`/variables`);
  }),

  // Get a specific variable
  get: procedure.input(z.string()).query(async ({ input }) => {
    const response = await get<Variable>(`/variables/${input}`);
    return response;
  }),

  // Add a new variable
  add: procedure
    .input(zVariable.omit({ id: true })) // Input does not require `id`
    .mutation(async ({ input }) => {
      const response = await post<Variable>(`/variables`, input);
      logAction({
        level: "info",
        action: "New Variable Added",
        details: `Variable ${input.name} of type ${input.type} added successfully.`,
      });
      return response;
    }),

  // Edit an existing variable
  edit: procedure.input(zVariable).mutation(async ({ input }) => {
    const { id } = input;
    const response = await put<Variable>(`/variables/${id}`, input);
    logAction({
      level: "info",
      action: "Variable Edited",
      details: `Variable ${input.name} value updated to ${input.value}.`,
    });
    return response;
  }),

  // Delete a variable
  delete: procedure.input(z.number()).mutation(async ({ input }) => {
    await del(`/variables/${input}`);
    logAction({
      level: "info",
      action: "New Variable Added",
      details: `Variable deleted successfully.`,
    });
    return { message: "Variable deleted successfully" };
  }),
});
