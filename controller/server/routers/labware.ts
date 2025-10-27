import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { Labware } from "@/types/api";
import { get, post, put, del, uploadFile } from "../utils/api";
import Tool from "../tools";
import { logAction } from "@/server/logger";
import { Tool as ToolResponse } from "@/types/api";

export const zLabware = z.object({
  id: z.number().optional(),
  name: z.string(),
  description: z.string(),
  number_of_rows: z.number(),
  number_of_columns: z.number(),
  z_offset: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  plate_lid_offset: z.number().optional(),
  lid_offset: z.number().optional(),
  stack_height: z.number().optional(),
  has_lid: z.boolean().optional(),
  image_url: z.string().optional(),
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
      try {
        await Promise.all(
          allToolswithLabware.map(async (tool) => {
            await Tool.loadLabwareToPF400(tool.name);
          }),
        );
      } catch (error) {
        console.error("Error loading labware to PF400 tools:", error);
      }
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
      try {
        await Promise.all(
          allToolswithLabware.map(async (tool) => {
            await Tool.loadLabwareToPF400(tool.name);
          }),
        );
      } catch (error) {
        console.error("Error loading labware to PF400 tools:", error);
      }
    }
    return response;
  }),

  // Delete labware
  delete: procedure.input(z.number()).mutation(async ({ input }) => {
    await del(`/labware/${input}`);
    const allTools = await get<ToolResponse[]>(`/tools`);
    const allToolswithLabware = allTools.filter((tool) => tool.type === "pf400");
    if (allToolswithLabware.length > 0) {
      try {
        await Promise.all(
          allToolswithLabware.map(async (tool) => {
            await Tool.loadLabwareToPF400(tool.name);
          }),
        );
      } catch (error) {
        console.error("Error loading labware to PF400 tools:", error);
      }
    }
    return { message: "Labware deleted successfully" };
  }),

  // Export labware config - returns the labware data for download
  exportConfig: procedure.input(z.number()).mutation(async ({ input }) => {
    try {
      const labwareId = input;
      const response = await get<Labware>(`/labware/${labwareId}/export`);
      return response;
    } catch (error) {
      console.error("Export failed:", error);
      throw error;
    }
  }),

  // Export all labware configs
  exportAllConfig: procedure.mutation(async () => {
    try {
      const response = await get<Labware[]>(`/labware/export-all`);
      return response;
    } catch (error) {
      console.error("Export all failed:", error);
      throw error;
    }
  }),

  // Import labware config using file upload via api utility
  importConfig: procedure
    .input(
      z.object({
        file: z.any(), // File object from form data
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const { file } = input;
        // Use the uploadFile utility
        const response = await uploadFile<Labware>("/labware/import", file);

        // Reload labware in all PF400 tools
        const allTools = await get<ToolResponse[]>(`/tools`);
        const allToolswithLabware = allTools.filter((tool) => tool.type === "pf400");
        if (allToolswithLabware.length > 0) {
          await Promise.all(
            allToolswithLabware.map(async (tool) => {
              await Tool.loadLabwareToPF400(tool.name);
            }),
          );
        }

        return response;
      } catch (error) {
        console.error("Import failed:", error);
        throw error;
      }
    }),
});
