import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { get, post, put, del } from "../utils/api";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { Script, ScriptFolder } from "@/types/api";
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
  folder_id: z.number().optional(),
});

export const zScriptFolder = z.object({
  id: z.number().optional(),
  name: z.string(),
  description: z.string().optional(),
  parent_id: z.number().optional(),
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
    return { message: "Script deleted successfully" };
  }),

  getAllFolders: procedure.query(async () => {
    const response = await get<ScriptFolder[]>(`/script-folders`);
    return response;
  }),

  getFolder: procedure.input(z.number()).query(async ({ input }) => {
    const response = await get<ScriptFolder>(`/script-folders/${input}`);
    return response;
  }),

  addFolder: procedure.input(zScriptFolder.omit({ id: true })).mutation(async ({ input }) => {
    const response = await post<ScriptFolder>(`/script-folders`, input);
    return response;
  }),

  editFolder: procedure.input(zScriptFolder).mutation(async ({ input }) => {
    const { id } = input;
    const response = await put<ScriptFolder>(`/script-folders/${id}`, input);
    return response;
  }),

  deleteFolder: procedure.input(z.number()).mutation(async ({ input }) => {
    await del(`/script-folders/${input}`);
    return { message: "Folder deleted successfully" };
  }),
});
