import {Protocol} from "@/types/api";
import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import axios from "axios";
import { TRPCError } from "@trpc/server";
import { logAction } from "@/server/logger";
import { get} from "../utils/api";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";

export type AllNamesOutput = {
  name: string;
  id: string;
  category: string;
  workcell: string;
  number_of_commands: number;
  description?: string;
  icon?: any;
}[];

const protocolSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  workcell_id: z.number(),
  description: z.string().optional(),
  icon: z.string().optional(),
  params: z.record(z.any()),
  commands: z.array(z.any()),
  version: z.number().optional(),
  is_active: z.boolean().optional(),
});

export const protocolRouter = router({
  all: procedure.input(z.object({})).query(async () => {
      const response = await get<Protocol[]>('/protocols');
      return response;
  }),
  allNames: procedure
    .input(z.object({ workcellName: z.string() }))
    .query(async ({ input }) => {
      const { workcellName } = input;
      const response =  await get<Protocol[]>(`protocols`, {
        params: { workcell_name: workcellName }
      });
      return response;
    }),
  get: procedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const { id } = input;
    const response = await get<Protocol>(`/protocols/${id}`);
    return response;
  }),
  create: procedure.input(protocolSchema).mutation(async ({ input }) => {
    try {
      const protocolData = {
        ...input,
        version: input.version || 1,
        is_active: input.is_active ?? true,
        params: input.params || {},
        commands: input.commands || [],
      };

      const response = await axios.post(`${API_BASE_URL}/protocols`, protocolData);

      return response.data;
    } catch (error: any) {
      console.error("Protocol creation error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
      });

      if (error.response?.status === 400) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.response.data?.detail || "Invalid protocol data",
        });
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to create protocol: ${error.message}`,
        cause: error,
      });
    }
  }),
  update: procedure
    .input(
      z.object({
        id: z.number(),
        data: protocolSchema.partial(),
      }),
    )
    .mutation(async ({ input }) => {
      const response = await axios.put(`${API_BASE_URL}/protocols/${input.id}`, input.data);
      return response.data;
    }),
  delete: procedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await axios.delete(`${API_BASE_URL}/protocols/${input.id}`);
    return { success: true };
  }),
  getById: procedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const response = await axios.get(`${API_BASE_URL}/protocols/${input.id}`);
    return response.data;
  }),
  listByWorkcell: procedure
    .input(z.object({ workcell_id: z.number() }))
    .query(async ({ input }) => {
      const response = await axios.get(`${API_BASE_URL}/protocols`, {
        params: {
          workcell_id: input.workcell_id,
          is_active: true,
        },
      });
      return response.data;
    }),
});
