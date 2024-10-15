import { z } from "zod";
import axios from "axios";
import { procedure, router } from "@/server/trpc";
import { Variable } from "@/types";

const domain = 'http://db:8000';

export const zVariable = z.object({
    id: z.number().optional(),
    name: z.string(),
    value: z.string(),
    type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
  });

export const variableRouter = router({
  // Get all variables
  getAll: procedure.query(async () => {
    const response = await axios.get<Variable[]>(`${domain}/variables`, {
      timeout: 1000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  }),
  get: procedure.
    input(z.string()).
    mutation(async ({ input }) => {
        const response = await axios.get<Variable>(`${domain}/variables/${input}`, {
        timeout: 1000,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        });
        return response.data;
  }),
  // Add a new variable
  add: procedure
    .input(zVariable.omit({ id: true }))  // Input does not require `id`
    .mutation(async ({ input }) => {
      const response = await axios.post<Variable>(`${domain}/variables`, input, {
        timeout: 1000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      return response.data;
    }),

  // Edit an existing variable
  edit: procedure
    .input(zVariable)  // Editing by name, only `value` and `type` are editable
    .mutation(async ({ input }) => {
      const { id } = input;
      const response = await axios.put<Variable>(`${domain}/variables/${id}`, input, {
        timeout: 1000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      return response.data;
    }),

  // Delete a variable
  delete: procedure
    .input(z.number())
    .mutation(async ({ input }) => {
      await axios.delete(`${domain}/variables/${input}`, {
        timeout: 1000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      return { message: 'Variable deleted successfully' };
    }),
});
