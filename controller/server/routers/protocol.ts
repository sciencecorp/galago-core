import Protocol from "@/protocols/protocol";
import { Protocols, reloadProtocols } from "@/server/protocols";
import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import axios from "axios";
import { TRPCError } from "@trpc/server";

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
  parameters_schema: z.record(z.any()),
  commands_template: z.array(z.any()),
  version: z.number().optional(),
  is_active: z.boolean().optional(),
});

export const protocolRouter = router({
  all: procedure.input(z.object({})).query(async () => {
    const tsProtocols = Protocols.map((protocol: Protocol) => ({
      name: protocol.name,
      id: protocol.protocolId,
      category: protocol.category,
      workcell: protocol.workcell,
      commands: protocol.preview(),
      uiParams: protocol.uiParams(),
    }));

    try {
      const response = await axios.get(`${API_BASE_URL}/protocols`);
      const dbProtocols = response.data.map((protocol: any) => ({
        name: protocol.name,
        id: protocol.id.toString(),
        category: protocol.category,
        workcell: protocol.workcell_id.toString(),
        commands: protocol.commands_template,
        uiParams: protocol.parameters_schema,
      }));

      return [...tsProtocols, ...dbProtocols];
    } catch (error) {
      console.error("Failed to fetch database protocols:", error);
      return tsProtocols;
    }
  }),
  allNames: procedure
    .input(z.object({ workcellName: z.string() }))
    .query<AllNamesOutput>(async ({ input }): Promise<AllNamesOutput> => {
      const { workcellName } = input;
      
      const tsProtocols = Protocols
        .filter((protocol: Protocol) => protocol.workcell === workcellName)
        .map((protocol: Protocol) => ({
          name: protocol.name,
          id: protocol.protocolId,
          category: protocol.category,
          workcell: protocol.workcell,
          number_of_commands: protocol.preview().length,
          description: protocol.description,
          icon: protocol.icon,
        }));

      try {
        const response = await axios.get(`${API_BASE_URL}/protocols`, {
          params: { workcell_name: workcellName }
        });
        const dbProtocols = response.data.map((protocol: any) => ({
          name: protocol.name,
          id: protocol.id.toString(),
          category: protocol.category,
          workcell: protocol.workcell_id.toString(),
          number_of_commands: protocol.commands_template.length,
          description: protocol.description,
          icon: protocol.icon,
        }));

        return [...tsProtocols, ...dbProtocols];
      } catch (error) {
        console.error("Failed to fetch database protocols:", error);
        return tsProtocols;
      }
    }),
  get: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const { id } = input;
      
      const tsProtocol = Protocols.find((p: Protocol) => p.protocolId === id);
      if (tsProtocol) {
        return {
          name: tsProtocol.name,
          id: tsProtocol.protocolId,
          category: tsProtocol.category,
          workcell: tsProtocol.workcell,
          commands: tsProtocol.preview(),
          uiParams: tsProtocol.uiParams(),
          icon: tsProtocol.icon,
          description: tsProtocol.description,
        };
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/protocols/${id}`);
        const dbProtocol = response.data;
        return {
          name: dbProtocol.name,
          id: dbProtocol.id,
          category: dbProtocol.category,
          workcell: dbProtocol.workcell_id.toString(),
          commands: dbProtocol.commands_template,
          uiParams: dbProtocol.parameters_schema,
          icon: dbProtocol.icon,
          description: dbProtocol.description,
        };
      } catch (error) {
        return null;
      }
    }),
  create: procedure
    .input(protocolSchema)
    .mutation(async ({ input }) => {
      try {
        console.log('Creating protocol with data:', JSON.stringify(input, null, 2));
        
        const protocolData = {
          ...input,
          version: input.version || 1,
          is_active: input.is_active ?? true,
          parameters_schema: input.parameters_schema || {},
          commands_template: input.commands_template || []
        };

        console.log('Sending request to:', `${API_BASE_URL}/protocols`);
        console.log('Request payload:', JSON.stringify(protocolData, null, 2));
        
        const response = await axios.post(`${API_BASE_URL}/protocols`, protocolData);
        
        console.log('Response:', response.data);
        await reloadProtocols();
        return response.data;
      } catch (error: any) {
        console.error('Protocol creation error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          stack: error.stack
        });
        
        if (error.response?.status === 400) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.response.data?.detail || 'Invalid protocol data',
          });
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create protocol: ${error.message}`,
          cause: error,
        });
      }
    }),
  update: procedure
    .input(z.object({
      id: z.number(),
      data: protocolSchema.partial(),
    }))
    .mutation(async ({ input }) => {
      const response = await axios.put(`${API_BASE_URL}/protocols/${input.id}`, input.data);
      await reloadProtocols();
      return response.data;
    }),
  delete: procedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await axios.delete(`${API_BASE_URL}/protocols/${input.id}`);
      await reloadProtocols();
      return { success: true };
    }),
  getById: procedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
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
