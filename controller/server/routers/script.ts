import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { db } from "@/db/client";
import { findOne, findMany } from "@/db/helpers";
import { scripts, scriptFolders, workcells, appSettings, logs } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import Tool from "@/server/tools";
import { ToolType } from "gen-interfaces/controller";

// Script schemas
const zScriptBase = z.object({
  name: z.string().min(1),
  content: z.string().default(""),
  language: z.string().default("python"),
  folderId: z.number().nullable().optional(),
  workcellId: z.number().nullable().optional(),
});

export const zScriptCreate = zScriptBase;

export const zScriptUpdate = zScriptBase
  .extend({
    id: z.number(),
  })
  .partial()
  .required({ id: true });

// Script folder schemas
const zScriptFolderBase = z.object({
  name: z.string().min(1),
  parentId: z.number().nullable().optional(),
  workcellId: z.number().nullable().optional(),
});

export const zScriptFolderCreate = zScriptFolderBase;

export const zScriptFolderUpdate = zScriptFolderBase
  .extend({
    id: z.number(),
  })
  .partial()
  .required({ id: true });

// Helper to get selected workcell ID
async function getSelectedWorkcellId(): Promise<number> {
  const setting = await findOne(appSettings, eq(appSettings.name, "workcell"));

  if (!setting || !setting.isActive) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No workcell is currently selected. Please select a workcell in settings.",
    });
  }

  const workcell = await findOne(workcells, eq(workcells.name, setting.value));

  if (!workcell) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Selected workcell '${setting.value}' not found`,
    });
  }

  return workcell.id;
}

export const scriptRouter = router({
  getAll: procedure.query(async () => {
    const workcellId = await getSelectedWorkcellId();
    const allScripts = await findMany(scripts, eq(scripts.workcellId, workcellId));
    return allScripts;
  }),

  // Get script by ID or name
  get: procedure.input(z.string()).query(async ({ input }) => {
    const numericId = parseInt(input);
    if (!isNaN(numericId)) {
      const script = await findOne(scripts, eq(scripts.id, numericId));
      if (!script) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Script not found",
        });
      }
      return script;
    } else {
      const workcellId = await getSelectedWorkcellId();

      // Handle the case where workcellId might be undefined/null
      if (!workcellId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No workcell selected",
        });
      }

      const script = await findOne(
        scripts,
        and(eq(scripts.name, input), eq(scripts.workcellId, workcellId))!,
      );

      if (!script) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Script not found",
        });
      }
      return script;
    }
  }),

  add: procedure.input(zScriptCreate).mutation(async ({ input }) => {
    const workcellId = input.workcellId || (await getSelectedWorkcellId());

    //Validate script language.
    if (
      !input.language ||
      !["javascript", "python", "csharp"].includes(input.language.toLocaleLowerCase())
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid script type",
      });
    }

    try {
      const result = await db
        .insert(scripts)
        .values({
          ...input,
          workcellId,
        })
        .returning();

      await db.insert(logs).values({
        level: "info",
        action: "New Script Added",
        details: `Script ${input.name} added successfully.`,
      });

      return result[0];
    } catch (error: any) {
      if (error.message?.includes("UNIQUE constraint failed")) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Script with name '${input.name}' already exists in this workcell`,
        });
      }
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: error.message || "Failed to create script",
      });
    }
  }),

  run: procedure.input(z.string()).mutation(async ({ input }) => {
    const workcellId = await getSelectedWorkcellId();
    const whereClause = and(eq(scripts.name, input), eq(scripts.workcellId, workcellId));

    const script = await findOne(scripts, whereClause!);

    if (!script) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Script ${input} not found`,
      });
    }

    const commandInfo = {
      toolId: "Tool Box",
      toolType: ToolType.toolbox,
      command: "run_script",
      params: {
        name: input,
        script_content: script.content,
        language: script.language,
        blocking: true,
      },
    };

    return await Tool.executeCommand(commandInfo);
  }),

  // Update script
  edit: procedure.input(zScriptUpdate).mutation(async ({ input }) => {
    const { id, ...updateData } = input;

    const existing = await findOne(scripts, eq(scripts.id, id));

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Script not found",
      });
    }

    try {
      const updated = await db
        .update(scripts)
        .set({
          ...updateData,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(scripts.id, id))
        .returning();

      await db.insert(logs).values({
        level: "info",
        action: "Script Edited",
        details: `Script ${input.name || existing.name} updated successfully.`,
      });

      return updated[0];
    } catch (error: any) {
      if (error.message?.includes("UNIQUE constraint failed")) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Script with name '${input.name}' already exists in this workcell`,
        });
      }
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: error.message || "Failed to update script",
      });
    }
  }),

  // Delete script
  delete: procedure.input(z.number()).mutation(async ({ input }) => {
    const deleted = await db.delete(scripts).where(eq(scripts.id, input)).returning();

    if (!deleted || deleted.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Script not found",
      });
    }

    await db.insert(logs).values({
      level: "info",
      action: "Script Deleted",
      details: `Script deleted successfully.`,
    });

    return { message: "Script deleted successfully" };
  }),

  // Export script
  exportConfig: procedure.input(z.number()).mutation(async ({ input }) => {
    const script = await findOne(scripts, eq(scripts.id, input));
    if (!script) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Script not found",
      });
    }

    return script;
  }),

  importConfig: procedure.input(z.number()).mutation(async ({ input }) => {
    const script = await findOne(scripts, eq(scripts.id, input));
    if (!script) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Script not found",
      });
    }

    return script;
  }),

  getAllFolders: procedure.query(async () => {
    const workcellId = await getSelectedWorkcellId();

    // Recursive helper to build folder tree
    const buildFolderTree = async (parentId: number | null = null): Promise<any[]> => {
      const folders = await db
        .select()
        .from(scriptFolders)
        .where(
          and(
            eq(scriptFolders.workcellId, workcellId),
            parentId === null
              ? isNull(scriptFolders.parentId)
              : eq(scriptFolders.parentId, parentId),
          ),
        );

      return await Promise.all(
        folders.map(async (folder) => {
          const [folderScripts, subfolders] = await Promise.all([
            db.select().from(scripts).where(eq(scripts.folderId, folder.id)),
            buildFolderTree(folder.id), // Recursive call for subfolders
          ]);

          return {
            ...folder,
            scripts: folderScripts,
            subfolders: subfolders,
          };
        }),
      );
    };

    return await buildFolderTree();
  }),

  getFolder: procedure.input(z.number()).query(async ({ input }) => {
    const folder = await findOne(scriptFolders, eq(scriptFolders.id, input));

    if (!folder) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Folder not found",
      });
    }

    return folder;
  }),

  addFolder: procedure.input(zScriptFolderCreate).mutation(async ({ input }) => {
    const workcellId = input.workcellId || (await getSelectedWorkcellId());

    try {
      const result = await db
        .insert(scriptFolders)
        .values({
          ...input,
          workcellId,
        })
        .returning();

      await db.insert(logs).values({
        level: "info",
        action: "New Script Folder Added",
        details: `Folder ${input.name} added successfully.`,
      });

      return result[0];
    } catch (error: any) {
      if (error.message?.includes("UNIQUE constraint failed")) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Folder with name '${input.name}' already exists in this location`,
        });
      }
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: error.message || "Failed to create folder",
      });
    }
  }),

  // Update folder
  // Update folder
  editFolder: procedure.input(zScriptFolderUpdate).mutation(async ({ input }) => {
    const { id, ...updateData } = input;

    const existing = await findOne(scriptFolders, eq(scriptFolders.id, id));

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Folder not found",
      });
    }

    try {
      // Filter out undefined values from updateData
      const cleanUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined),
      );

      const updated = await db
        .update(scriptFolders)
        .set(cleanUpdateData)
        .where(eq(scriptFolders.id, id))
        .returning();

      await db.insert(logs).values({
        level: "info",
        action: "Script Folder Edited",
        details: `Folder ${input.name || existing.name} updated successfully.`,
      });

      return updated[0];
    } catch (error: any) {
      if (error.message?.includes("UNIQUE constraint failed")) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Folder with name '${input.name}' already exists in this location`,
        });
      }
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: error.message || "Failed to update folder",
      });
    }
  }),

  // Delete folder
  deleteFolder: procedure.input(z.number()).mutation(async ({ input }) => {
    const folder = await findOne(scriptFolders, eq(scriptFolders.id, input));

    if (!folder) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Folder not found",
      });
    }

    await db.delete(scriptFolders).where(eq(scriptFolders.id, input)).returning();
    await db.insert(logs).values({
      level: "info",
      action: "Script Folder Deleted",
      details: `Folder deleted successfully.`,
    });

    return { message: "Folder deleted successfully" };
  }),
});
