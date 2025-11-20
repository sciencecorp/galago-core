import { z } from "zod";
import Tool from "@/server/tools";
import { Tool as ToolResponse } from "@/types/api";
import { Config } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import { procedure, router } from "@/server/trpc";
import { ToolType } from "gen-interfaces/controller";
import { get, post, put, del } from "@/server/utils/api";
import * as controller_protos from "gen-interfaces/controller";

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

  getToolBox: procedure.query(() => {
    const toolbox = Tool.toolBoxConfig();
    return {
      id: -1,
      name: "tool_box",
      type: toolbox.type,
      ip: toolbox.ip,
      port: toolbox.port,
      description: toolbox.description,
      image_url: "/tool_icons/toolbox.png",
      status: "READY",
      last_updated: new Date(),
      created_at: new Date(),
      config: toolbox.config || { simulated: false, toolbox: {} },
      workcell_id: 1,
      joints: 0,
    } as ToolResponse;
  }),

  add: procedure
    .input(zTool.omit({ id: true, port: true }))
    .mutation(async ({ input }) => {
      const response = post<ToolResponse>(`/tools`, input);
      return response;
    }),

  //Edit an existing tool
  edit: procedure
    .input(
      z.object({
        id: z.string(),
        config: zTool,
      })
    )
    .mutation(async ({ input }) => {
      const { id, config } = input;
      const response = await put<ToolResponse>(`/tools/${id}`, config);
      await Tool.removeTool(id);
      const updatedToolConfig: controller_protos.ToolConfig = {
        name: response.name,
        type: response.type as ToolType,
        description: response.description || "",
        image_url: response.image_url || "",
        ip: response.ip || "localhost",
        port: response.port || 0,
        config: (response.config as Config) || {},
      };

      // Ensure these async operations complete
      await Tool.reloadSingleToolConfig(updatedToolConfig);
      await Tool.clearToolStore();

      // Explicitly create the tool again to ensure it's in the store with new config
      Tool.forId(Tool.normalizeToolId(response.name));

      return response;
    }),

  delete: procedure.input(z.string()).mutation(async ({ input }) => {
    await del(`/tools/${input}`);
    Tool.removeTool(input);
    return { message: "Tool deleted successfully" };
  }),

  getProtoConfigDefinitions: procedure
    .input(zToolType)
    .query(async ({ input }) => {
      const configDefinition = await Tool.getToolConfigDefinition(input);
      return configDefinition;
    }),

  availableIDs: procedure
    .input(
      z.object({
        workcellId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      let allTools = await get<ToolResponse[]>(`/tools`);
      Tool.reloadWorkcellConfig(allTools as controller_protos.ToolConfig[]);
      const toolIds = allTools.map((tool) =>
        tool.name.toLocaleLowerCase().replaceAll(" ", "_")
      );
      toolIds.push("tool_box");
      return toolIds;
    }),

  status: procedure
    .input(
      z.object({
        toolId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const tool = Tool.forId(
        input.toolId.toLocaleLowerCase().replaceAll(" ", "_")
      );
      return await tool.fetchStatus();
    }),

  info: procedure
    .input(
      z.object({
        toolId: z.string(),
      })
    )
    .query(({ input }) => {
      const tool = Tool.forId(
        input.toolId.toLocaleLowerCase().replaceAll(" ", "_")
      );
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
        config: z.custom<Config>().transform(Config.fromPartial),
      })
    )
    .mutation(async ({ input }) => {
      const { toolId, config } = input;
      const tool = Tool.forId(toolId);
      const resp = await tool.configure(config);
      return resp;
    }),

  runCommand: procedure
    .input(
      z.object({
        toolId: z.string(),
        toolType: zToolType,
        command: z.string(),
        params: z.record(z.any()),
      })
    )
    .mutation(async ({ input }) => {
      return await Tool.executeCommand(input);
    }),
});
