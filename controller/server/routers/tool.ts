import { z } from "zod";

import Tool from "@/server/tools";
import { Config } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import { procedure, router } from "@/server/trpc";
import { ToolType } from "gen-interfaces/controller";
import axios from "axios";
import { add } from "winston";
import { get, post, put, del } from "@/server/utils/api";
import { idText } from "typescript";

const zToolType = z.enum(Object.values(ToolType) as [ToolType, ...ToolType[]]);

export const zTool = z.object({
  id: z.number().optional(),
  name: z.string(),
  type: z.string(),
  workcell_id: z.number(),
  ip: z.string(),
  port: z.number(),
});

export const toolRouter = router({
  getAll: procedure.query(async () => {
    const response = await get<Tool[]>(`/tools`, {
      timeout: 1000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    return response;
  }),

  //Add a new tool
  add: procedure.input(zTool.omit({ id: true })).mutation(async ({ input }) => {
    const response = post<Tool>(`/tools`, input);
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
      const response = put<Tool>(`/tools/${input.toolId}`, input);
      return response;
    }),

  availableIDs: procedure.query(async () => {
    return await Tool.availableIDs();
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

  configure: procedure
    .input(
      z.object({
        toolId: z.string(),
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
        toolId: z.string(),
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
