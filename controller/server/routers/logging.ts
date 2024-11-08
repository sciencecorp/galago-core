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
import { Log } from "@/types/api";

export const loggingRouter = router({
  getAll: procedure.query(async () => {
    const response = await get<Log[]>(`/logs`);
    console.log("Response from getAll logs: ", response);
    return response;
  }),

  getPaginated: procedure
    .input(z.object({ skip: z.number(), limit: z.number(), descending: z.boolean() }))
    .query(async ({ input }) => {
      const { skip, limit, descending } = input;
      const response = await get<Log[]>(
        `/logs?skip=${skip}&limit=${limit}&descending=${descending}`,
      );
      return response;
    }),

  clearAll: procedure.mutation(async () => {
    await del(`/logs`);
    return { message: "Logs cleared successfully" };
  }),

  add: procedure.mutation(async ({ input }) => {
    const response = await post<Log>(`/logs`, input);
    return response;
  }),
});
