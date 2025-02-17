import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { get, post, put, del } from "../utils/api";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { Script } from "@/types/api";
import { run } from "node:test";
import Tool from "@/server/tools";
import { ToolType } from "gen-interfaces/controller";

const zToolType = z.enum(Object.values(ToolType) as [ToolType, ...ToolType[]]);

export const zScript = z.object({
  id: z.number().optional(),
  name: z.string(),
  content: z.string(),
  description: z.string().optional(),
  language: z.string(),
  folder: z.string().default("/"),
});

export const scriptRouter = router({
  getAll: procedure.query(async () => {
    const response = await get<Script[]>(`/scripts`);
    return response;
  }),

  get: procedure.input(z.string()).query(async ({ input }) => {
    const response = await get<Script>(`/scripts/${input}`);
    return response;
  }),

  add: procedure
    .input(zScript.omit({ id: true })) // Input does not require `id`
    .mutation(async ({ input }) => {
      const response = await post<Script>(`/scripts`, input);
      return response;
    }),

  run: procedure.input(z.string()).mutation(async ({ input }) => {
    const commandInfo = {
      toolId: "tool_box",
      toolType: ToolType.toolbox,
      command: "run_python_script",
      params: {
        script_content: input,
        blocking: true,
      },
    };
    return await Tool.executeCommand(commandInfo);
  }),

  edit: procedure.input(zScript).mutation(async ({ input }) => {
    const { id } = input;
    const response = await put<Script>(`/scripts/${id}`, input);
    return response;
  }),

  delete: procedure.input(z.number()).mutation(async ({ input }) => {
    await del(`/scripts/${input}`);
    return { message: "Variable deleted successfully" };
  }),
});
