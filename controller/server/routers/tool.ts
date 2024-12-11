import { z } from "zod";
import Tool from "@/server/tools";
import { Tool as ToolResponse } from "@/types/api";
import { Config } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import { procedure, router } from "@/server/trpc";
import { ToolType } from "gen-interfaces/controller";
import { get, post, put, del } from "@/server/utils/api";
import * as controller_protos from "gen-interfaces/controller";
import { TRPCError } from "@trpc/server";

const zToolType = z.enum(Object.values(ToolType) as [ToolType, ...ToolType[]]);

export const zTool = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  type: zToolType.optional(),
  description: z.string().optional(),
  workcell_id: z.number().optional(),
  ip: z.string().optional(),
  port: z.number().optional(),
  image_url: z.string().optional(),
  config: z.record(z.any()).optional(),
});

export const toolRouter = router({
  get: procedure.input(z.string()).query(async ({ input }) => {
    const response = await get<ToolResponse>(`/tools/${input}`);
    return response;
  }),

  getAll: procedure.query(async () => {
    const response = await get<ToolResponse[]>(`/tools`, {
      timeout: 1000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    return response;
  }),

  add: procedure.input(zTool.omit({ id: true, port: true })).mutation(async ({ input }) => {
    const response = post<ToolResponse>(`/tools`, input);
    return response;
  }),

  //Edit an existing tool
  edit: procedure
    .input(
      z.object({
        id: z.string(),
        config: zTool,
      }),
    )
    .mutation(async ({ input }) => {
      const { id, config } = input;
      const response = await put<ToolResponse>(`/tools/${id}`, config);
      const tool = await Tool.forId(response.name);

      tool.info = {
        ...tool.info,
        name: config.name ?? tool.info.name,
        description: config.description ?? tool.info.description,
        config: (config.config as Config) ?? tool.info.config,
      };

      return response;
    }),

  delete: procedure.input(z.string()).mutation(async ({ input }) => {
    await del(`/tools/${input}`);
    Tool.removeTool(input);
    return { message: "Tool deleted successfully" };
  }),

  getProtoConfigDefinitions: procedure.input(zToolType).query(async ({ input }) => {
    const configDefinition = await Tool.getToolConfigDefinition(input);
    return configDefinition;
  }),

  availableIDs: procedure.query(async () => {
    const allTools = await get<ToolResponse[]>(`/tools`);
    Tool.reloadWorkcellConfig(allTools as controller_protos.ToolConfig[]);
    const toolIds = allTools.map((tool) => tool.name);
    toolIds.push("Tool Box");
    return toolIds;
  }),

  status: procedure
    .input(
      z.object({
        toolId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const tool = Tool.forId(input.toolId);
      return await tool.fetchStatus();
    }),

  info: procedure
    .input(
      z.object({
        toolId: z.string(),
      }),
    )
    .query(({ input }) => {
      const tool = Tool.forId(input.toolId);
      return tool.info;
    }),

  clearToolStore: procedure.mutation(async () => {
    Tool.clearToolStore();
    return { message: "Tool store cleared successfully" };
  }),

  configure: procedure
    .input(
      z.object({
        toolId: z.string(),
        config: z.custom<Config>(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const { toolId, config } = input;
        const tool = Tool.forId(toolId);
        
        // Initialize waypoints array for PF400
        if (tool.type === ToolType.pf400) {
          if (!config.pf400) {
            config.pf400 = {
              host: '',
              port: 0,
              joints: 0,
              waypoints: [],
            };
          }
          config.pf400.waypoints = [];
        }
        
        const response = await tool.grpc.configure(config);
        
        if (response.response !== 'SUCCESS') {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: response.error_message || 'Failed to configure tool',
          });
        }
        
        return response;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to configure tool',
        });
      }
    }),

  runCommand: procedure
    .input(
      z.object({
        toolId: z.string(),
        toolType: zToolType,
        command: z.string(),
        params: z.record(z.any()),
      }),
    )
    .mutation(async ({ input }) => {
      return await Tool.executeCommand(input);
    }),
});
