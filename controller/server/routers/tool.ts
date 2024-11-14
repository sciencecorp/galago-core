import { z } from "zod";

import Tool from "@/server/tools";
import {Tool as ToolResponse} from "@/types/api";
import { Config } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import { procedure, router } from "@/server/trpc";
import { ToolType } from "gen-interfaces/controller";
import axios from "axios";
import { add } from "winston";
import { get, post, put, del } from "@/server/utils/api";
import { idText } from "typescript";
import * as controller_protos from "gen-interfaces/controller";
import { Workcell, AppSettings} from "@/types/api";

const zToolType = z.enum(Object.values(ToolType) as [ToolType, ...ToolType[]]);

export const zTool = z.object({
  id: z.number().optional(),
  name: z.string(),
  type: zToolType,
  description: z.string().optional(), 
  workcell_id: z.number(),
  ip: z.string().optional(),
  port: z.number().optional(),
  image_url: z.string().optional(),
  config: z.record(z.any()).optional(),
});

export const toolRouter = router({
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

  //Add a new tool to the db
  add: procedure.input(zTool.omit({ id: true, port:true })).mutation(async ({ input }) => {
    const {type} = input;
    console.log("adding tool with type: ", type);
    const defaultConfig = await Tool.getToolConfigDefinition(type as ToolType);
    console.log("Default config is: ", defaultConfig);
    const response = post<ToolResponse>(`/tools`, input);
    return response;
  }),

  //Edit an existing tool
  edit: procedure
    .input(
      z.object({
        toolType: zToolType,
        toolId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const response = put<ToolResponse>(`/tools/${input.toolId}`, input);
      return response;
    }),
  
  
  delete : procedure.input(z.number()).mutation(async ({ input }) => {
    await del(`/tools/${input}`);
    return { message: "Tool deleted successfully"};
  }),

  getToolconfigDefinitions : procedure.input(zToolType).query(async ({input}) => {
    const configDefinition =  await Tool.getToolConfigDefinition(input);
    console.log("Config definition is: ", configDefinition);
    return configDefinition;
  }),

  availableIDs: procedure.query(async () => {
    const allTools = await get<ToolResponse[]>(`/tools`);
    Tool.reloadWorkcellConfig(allTools);
    const toolIds = allTools.map((tool) => tool.id);
    return toolIds;
  }),

  status: procedure
    .input(
      z.object({
        toolId: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const tool = Tool.forId(input.toolId);
      return await tool.fetchStatus();
    }),

  info: procedure
    .input(
      z.object({
        toolId: z.number(),
      }),
    )
    .query(({ input }) => {
      const tool = Tool.forId(input.toolId);
      return tool.info;
    }),

  configure: procedure
    .input(
      z.object({
        toolId: z.number(),
        config: z.custom<Config>().transform(Config.fromPartial),
      }),
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
        toolId: z.number(),
        toolType: zToolType,
        command: z.string(),
        params: z.record(z.any()),
      }),
    )
    .mutation(async ({ input }) => {
      return await Tool.executeCommand(input);
    }),

    getWorkcellName: procedure.query(async () => {
      return await Tool.workcellName();
    }),

});