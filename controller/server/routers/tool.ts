import { z } from "zod";

import Tool from "@/server/tools";
import { Config } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import { procedure, router } from "@/server/trpc";
import { ToolType } from "gen-interfaces/controller";

const zToolType = z.enum(Object.values(ToolType) as [ToolType, ...ToolType[]]);

export const toolRouter = router({
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
