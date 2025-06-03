import { Protocol, ProtocolProcess, ProtocolCommand, ProtocolCommandGroup } from "@/types/api";
import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import axios from "axios";
import { TRPCError } from "@trpc/server";
import { logAction } from "@/server/logger";
import { get, post, put, del } from "../utils/api";

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

// Schema Definitions
const protocolSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  workcell_id: z.number(),
  description: z.string().optional(),
  icon: z.string().optional(),
  params: z.record(z.any()),
  version: z.number().optional(),
  is_active: z.boolean().optional(),
});

const processSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  position: z.number(),
  advanced_parameters: z.record(z.any()).optional(),
  protocol_id: z.number(),
});

const commandSchema = z.object({
  name: z.string().min(1),
  tool_type: z.string(),
  tool_id: z.string(),
  label: z.string(),
  command: z.string(),
  params: z.record(z.any()),
  process_id: z.number().optional(),
  command_group_id: z.number().optional(),
  position: z.number(),
  protocol_id: z.number().optional(),
  advanced_parameters: z.record(z.any()).optional(),
});

const commandGroupSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  process_id: z.number(),
});

export const protocolRouter = router({
  // Protocol Routes
  all: procedure.input(z.object({})).query(async () => {
    const response = await get<Protocol[]>("/protocols");
    return response;
  }),

  allNames: procedure.input(z.object({ workcellName: z.string() })).query(async ({ input }) => {
    const { workcellName } = input;
    const response = await get<Protocol[]>(`protocols`, {
      params: { workcell_name: workcellName },
    });
    return response;
  }),

  get: procedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const { id } = input;
    const response = await get<Protocol>(`/protocols/${id}`);
    return response;
  }),

  create: procedure.input(protocolSchema).mutation(async ({ input }) => {
    const protocolData = {
      ...input,
      version: input.version || 1,
      is_active: input.is_active ?? true,
      params: input.params || {},
    };
    const response = await post<Protocol>(`${API_BASE_URL}/protocols`, protocolData);
    logAction({
      level: "info",
      action: "New Protocol Added",
      details: `Protocol ${input.name} added successfully.`,
    });
    return response;
  }),

  update: procedure
    .input(
      z.object({
        id: z.number(),
        data: protocolSchema.partial(),
      }),
    )
    .mutation(async ({ input }) => {
      const response = await put(`${API_BASE_URL}/protocols/${input.id}`, input.data);
      logAction({
        level: "info",
        action: "Protocol Updated",
        details: `Protocol ${input.data.name} updated successfully.`,
      });
      return response;
    }),

  delete: procedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await del(`${API_BASE_URL}/protocols/${input.id}`);
    logAction({
      level: "info",
      action: "Protocol Deleted",
      details: `Protocol ${input.id} deleted successfully.`,
    });
    return { success: true };
  }),

  getById: procedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const response = await get<Protocol>(`${API_BASE_URL}/protocols/${input.id}`);
    return response;
  }),

  // Process Routes
  getAllProcesses: procedure
    .input(z.object({ protocol_id: z.number().optional() }))
    .query(async ({ input }) => {
      const params = input.protocol_id ? { protocol_id: input.protocol_id } : {};
      const response = await get<ProtocolProcess[]>(`${API_BASE_URL}/protocol-processes`, {
        params,
      });
      return response;
    }),

  getProcess: procedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const response = await get<ProtocolProcess>(`${API_BASE_URL}/protocol-processes/${input.id}`);
    return response;
  }),

  createProcess: procedure.input(processSchema).mutation(async ({ input }) => {
    const response = await post<ProtocolProcess>(`${API_BASE_URL}/protocol-processes`, input);
    logAction({
      level: "info",
      action: "New Process Added",
      details: `Process ${input.name} added to protocol ${input.protocol_id}.`,
    });
    return response;
  }),

  updateProcess: procedure
    .input(
      z.object({
        id: z.number(),
        data: processSchema.partial(),
      }),
    )
    .mutation(async ({ input }) => {
      const response = await put(`${API_BASE_URL}/protocol-processes/${input.id}`, input.data);
      logAction({
        level: "info",
        action: "Process Updated",
        details: `Process ${input.id} updated successfully.`,
      });
      return response;
    }),

  deleteProcess: procedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await del(`${API_BASE_URL}/protocol-processes/${input.id}`);
    logAction({
      level: "info",
      action: "Process Deleted",
      details: `Process ${input.id} deleted successfully.`,
    });
    return { success: true };
  }),

  // Command Routes
  getAllCommands: procedure
    .input(
      z.object({
        process_id: z.number().optional(),
        protocol_id: z.number().optional(),
      }),
    )
    .query(async ({ input }) => {
      const params: any = {};
      if (input.process_id) params.process_id = input.process_id;
      if (input.protocol_id) params.protocol_id = input.protocol_id;

      const response = await get<ProtocolCommand[]>(`${API_BASE_URL}/protocol-commands`, {
        params,
      });
      return response;
    }),

  getCommand: procedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const response = await get<ProtocolCommand>(`${API_BASE_URL}/protocol-commands/${input.id}`);
    return response;
  }),

  createCommand: procedure.input(commandSchema).mutation(async ({ input }) => {
    const response = await post<ProtocolCommand>(`${API_BASE_URL}/protocol-commands`, input);
    logAction({
      level: "info",
      action: "New Command Added",
      details: `Command ${input.name} added successfully.`,
    });
    return response;
  }),

  updateCommand: procedure
    .input(
      z.object({
        id: z.number(),
        data: commandSchema.partial(),
      }),
    )
    .mutation(async ({ input }) => {
      const response = await put(`${API_BASE_URL}/protocol-commands/${input.id}`, input.data);
      logAction({
        level: "info",
        action: "Command Updated",
        details: `Command ${input.id} updated successfully.`,
      });
      return response;
    }),

  deleteCommand: procedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await del(`${API_BASE_URL}/protocol-commands/${input.id}`);
    logAction({
      level: "info",
      action: "Command Deleted",
      details: `Command ${input.id} deleted successfully.`,
    });
    return { success: true };
  }),

  // Command Group Routes
  getAllCommandGroups: procedure
    .input(z.object({ process_id: z.number().optional() }))
    .query(async ({ input }) => {
      const params = input.process_id ? { process_id: input.process_id } : {};
      const response = await get<ProtocolCommandGroup[]>(
        `${API_BASE_URL}/protocol-command-groups`,
        { params },
      );
      return response;
    }),

  getCommandGroup: procedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const response = await get<ProtocolCommandGroup>(
      `${API_BASE_URL}/protocol-command-groups/${input.id}`,
    );
    return response;
  }),

  createCommandGroup: procedure.input(commandGroupSchema).mutation(async ({ input }) => {
    const response = await post<ProtocolCommandGroup>(
      `${API_BASE_URL}/protocol-command-groups`,
      input,
    );
    logAction({
      level: "info",
      action: "New Command Group Added",
      details: `Command group ${input.name} added successfully.`,
    });
    return response;
  }),

  updateCommandGroup: procedure
    .input(
      z.object({
        id: z.number(),
        data: commandGroupSchema.partial(),
      }),
    )
    .mutation(async ({ input }) => {
      const response = await put(`${API_BASE_URL}/protocol-command-groups/${input.id}`, input.data);
      logAction({
        level: "info",
        action: "Command Group Updated",
        details: `Command group ${input.id} updated successfully.`,
      });
      return response;
    }),

  deleteCommandGroup: procedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await del(`${API_BASE_URL}/protocol-command-groups/${input.id}`);
    logAction({
      level: "info",
      action: "Command Group Deleted",
      details: `Command group ${input.id} deleted successfully.`,
    });
    return { success: true };
  }),

  reorderProcesses: procedure
    .input(
      z.object({
        protocol_id: z.number(),
        process_ids: z.array(z.number()),
      }),
    )
    .mutation(async ({ input }) => {
      const response = await post(`${API_BASE_URL}/protocol-processes/reorder`, {
        protocol_id: input.protocol_id,
        process_ids: input.process_ids,
      });
      return response;
    }),

  reorderCommands: procedure
    .input(
      z.object({
        process_id: z.number(),
        command_ids: z.array(z.number()),
      }),
    )
    .mutation(async ({ input }) => {
      const response = await post(`${API_BASE_URL}/protocol-commands/reorder`, {
        process_id: input.process_id,
        command_ids: input.command_ids,
      });
      logAction({
        level: "info",
        action: "Commands Reordered",
        details: `Commands for process ${input.process_id} have been reordered.`,
      });
      return response;
    }),
});
