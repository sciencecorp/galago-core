import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { get, post, put, del } from "../utils/api";
import { Script, ScriptFolder } from "@/types/api";
import Tool from "@/server/tools";
import { ToolType } from "gen-interfaces/controller";
import { logAction } from "@/server/logger";

export const zScriptEnvironment = z.enum(["global", "opentrons", "pyhamilton", "pylabrobot"]);

export const zScript = z.object({
  id: z.number().optional(),
  name: z.string(),
  content: z.string(),
  description: z.string().optional(),
  language: z.string(),
  script_environment: zScriptEnvironment.default("global"),
  folder_id: z.number().nullable().optional(),
});

export const zScriptFolder = z.object({
  id: z.number().optional(),
  name: z.string(),
  description: z.string().optional(),
  parent_id: z.number().optional(),
  workcell_id: z.number(),
});

export const zScriptFolderUpdate = z.object({
  id: z.number(),
  name: z.string().optional(),
  description: z.string().optional(),
  parent_id: z.number().optional(),
  workcell_id: z.number().optional(),
});

export const scriptRouter = router({

getAll: procedure
  .input(
    z.object({
      script_environment: zScriptEnvironment.optional(),
    }).optional()
  )
  .query(async ({ input }) => {
    const params = new URLSearchParams();
    if (input?.script_environment) {
      params.append("script_environment", input.script_environment);
    }
    const queryString = params.toString();
    const url = `/scripts${queryString ? `?${queryString}` : ""}`;
    const response = await get<Script[]>(url);
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
      logAction({
        level: "info",
        action: "New Script Added",
        details: `Script ${input.name} added successfully.`,
      });
      return response;
    }),

  run: procedure.input(z.object({ toolId: z.string(), toolType: z.string(), name: z.string(),  script_environment: zScriptEnvironment.optional() })).mutation(async ({ input }) => {
    const command = input.toolType === ToolType.opentrons2 ? "run_program" : "run_script";
    let params = {};
    if(input.toolType === ToolType.opentrons2){
      params = { script_name: input.name, simulate: true };
    }
    else{
      params = { name: input.name, blocking: true};
    }

    const commandInfo = {
      toolId: input.toolId,
      toolType: input.toolType as ToolType,
      environment: input.script_environment || "global",
      command,
      params,
    };
    return await Tool.executeCommand(commandInfo);
  }),

  edit: procedure.input(zScript).mutation(async ({ input }) => {
    // Ensure folder_id is handled properly - if it's null or undefined, we'll set it to null explicitly
    const data = {
      ...input,
      folder_id: input.folder_id === undefined ? null : input.folder_id,
    };

    const { id } = data;
    const response = await put<Script>(`/scripts/${id}`, data);
    logAction({
      level: "info",
      action: "Script Edited",
      details: `Script ${input.name} updated successfully.`,
    });
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

  editFolder: procedure.input(zScriptFolderUpdate).mutation(async ({ input }) => {
    const { id } = input;
    const response = await put<ScriptFolder>(`/script-folders/${id}`, input);
    return response;
  }),

  deleteFolder: procedure.input(z.number()).mutation(async ({ input }) => {
    await del(`/script-folders/${input}`);
    return { message: "Folder deleted successfully" };
  }),
});
