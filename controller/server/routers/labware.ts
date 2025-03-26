import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { Labware } from "@/types/api";
import { get, post, put, del } from "../utils/api";
import Tool from "../tools";
import { logAction } from "@/server/logger";
import { Tool as ToolResponse } from "@/types/api";

export const zLabware = z.object({
  id: z.number().optional(),
  name: z.string(),
  description: z.string(),
  number_of_rows: z.number(),
  number_of_columns: z.number(),
  z_offset: z.number(),
  width: z.number(),
  height: z.number(),
  plate_lid_offset: z.number(),
  lid_offset: z.number(),
  stack_height: z.number(),
  has_lid: z.boolean(),
  image_url: z.string(),
});

export const labwareRouter = router({
  getAll: procedure.query(async () => {
    const response = await get<Labware[]>(`/labware`);
    return response;
  }),

  // Get a specific labware
  get: procedure.input(z.string()).query(async ({ input }) => {
    const response = await get<Labware>(`/labware/${input}`);
    return response;
  }),

  // Add new labware
  add: procedure.input(zLabware.omit({ id: true })).mutation(async ({ input }) => {
    const response = await post<Labware>(`/labware`, input);
    logAction({
      level: "info",
      action: "New Labware Added",
      details: `Labware ${input.name} added successfully.`,
    });
    const allTools = await get<ToolResponse[]>(`/tools`);
    const allToolswithLabware = allTools.filter((tool) => tool.type === "pf400");
    if (allToolswithLabware.length > 0) {
      allToolswithLabware.forEach((tool) => {
        const toolInstance = Tool.forId(tool.name);
        toolInstance.loadPF400Waypoints();
      });
    }
    return response;
  }),

  // Edit existing labware
  edit: procedure.input(zLabware).mutation(async ({ input }) => {
    const { id } = input;
    const response = await put<Labware>(`/labware/${id}`, input);
    logAction({
      level: "info",
      action: "Labware Edited",
      details: `Labware ${input.name} updated successfully.`,
    });
    const allTools = await get<ToolResponse[]>(`/tools`);
    const allToolswithLabware = allTools.filter((tool) => tool.type === "pf400");
    if (allToolswithLabware.length > 0) {
      allToolswithLabware.forEach((tool) => {
        const toolInstance = Tool.forId(tool.name);
        toolInstance.loadPF400Waypoints();
      });
    }
    return response;
  }),

  // Delete labware
  delete: procedure.input(z.number()).mutation(async ({ input }) => {
    await del(`/labware/${input}`);
    return { message: "Labware deleted successfully" };
  }),
});
