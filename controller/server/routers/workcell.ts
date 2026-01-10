import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { db } from "@/db/client";
import {
  workcells,
  appSettings,
  tools,
  protocols,
  hotels,
  nests,
  robotArmLocations,
  robotArmSequences,
  robotArmMotionProfiles,
  robotArmGripParams,
  forms,
  scripts,
  scriptFolders,
  variables,
  labware,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const zWorkcell = z.object({
  id: z.number().optional(),
  name: z.string(),
  location: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export const workcellRouter = router({
  getAll: procedure.query(async () => {
    const allWorkcells = await db.select().from(workcells);

    const workcellsWithRelations = await Promise.all(
      allWorkcells.map(async (workcell) => {
        const workcellTools = await db
          .select()
          .from(tools)
          .where(eq(tools.workcellId, workcell.id));

        const workcellProtocols = await db
          .select()
          .from(protocols)
          .where(eq(protocols.workcellId, workcell.id));

        const workcellHotels = await db
          .select()
          .from(hotels)
          .where(eq(hotels.workcellId, workcell.id));

        return {
          ...workcell,
          tools: workcellTools,
          protocols: workcellProtocols,
          hotels: workcellHotels,
        };
      }),
    );

    return workcellsWithRelations;
  }),

  get: procedure.input(z.string()).mutation(async ({ input }) => {
    const id = parseInt(input);
    if (isNaN(id)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid workcell ID",
      });
    }

    const workcell = await db.select().from(workcells).where(eq(workcells.id, id)).limit(1);

    if (!workcell || workcell.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Workcell not found",
      });
    }

    return workcell[0];
  }),

  add: procedure.input(zWorkcell.omit({ id: true })).mutation(async ({ input }) => {
    try {
      const result = await db.insert(workcells).values(input).returning();
      return result[0];
    } catch (error: any) {
      if (error.message?.includes("UNIQUE constraint failed")) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A workcell with this name already exists",
        });
      }
      throw error;
    }
  }),

  edit: procedure.input(zWorkcell).mutation(async ({ input }) => {
    const { id, ...updateData } = input;

    if (!id) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Workcell ID is required",
      });
    }

    try {
      const updated = await db
        .update(workcells)
        .set({
          ...updateData,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(workcells.id, id))
        .returning();

      if (!updated || updated.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workcell not found",
        });
      }

      return updated[0];
    } catch (error: any) {
      if (error.message?.includes("UNIQUE constraint failed")) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A workcell with this name already exists",
        });
      }
      throw error;
    }
  }),

  delete: procedure.input(z.number()).mutation(async ({ input }) => {
    const deleted = await db.delete(workcells).where(eq(workcells.id, input)).returning();

    if (!deleted || deleted.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Workcell not found",
      });
    }

    return { message: "Workcell deleted successfully" };
  }),

  setSelectedWorkcell: procedure.input(z.string()).mutation(async ({ input }) => {
    const existing = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.name, "workcell"))
      .limit(1);

    if (existing && existing.length > 0) {
      const updated = await db
        .update(appSettings)
        .set({
          value: input,
          isActive: true,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(appSettings.name, "workcell"))
        .returning();

      return updated[0];
    } else {
      const created = await db
        .insert(appSettings)
        .values({
          name: "workcell",
          value: input,
          isActive: true,
        })
        .returning();

      return created[0];
    }
  }),

  getSelectedWorkcell: procedure.query(async () => {
    const setting = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.name, "workcell"))
      .limit(1);

    if (!setting || setting.length === 0 || !setting[0].isActive) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No workcell is currently selected. Please select a workcell in settings.",
      });
    }

    return setting[0].value;
  }),

  exportConfig: procedure.input(z.number()).mutation(async ({ input }) => {
    // Get the workcell
    const workcell = await db.select().from(workcells).where(eq(workcells.id, input)).limit(1);

    if (!workcell || workcell.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Workcell not found",
      });
    }

    // Get all related data for this workcell
    const workcellTools = await db.select().from(tools).where(eq(tools.workcellId, input));
    const workcellHotels = await db.select().from(hotels).where(eq(hotels.workcellId, input));
    const workcellLabware = await db.select().from(labware).where(eq(labware.workcellId, input));
    const workcellForms = await db.select().from(forms).where(eq(forms.workcellId, input));
    const workcellVariables = await db.select().from(variables).where(eq(variables.workcellId, input));
    const workcellProtocols = await db.select().from(protocols).where(eq(protocols.workcellId, input));
    const workcellScriptFolders = await db.select().from(scriptFolders).where(eq(scriptFolders.workcellId, input));
    const workcellScripts = await db.select().from(scripts).where(eq(scripts.workcellId, input));

    // Build folder name lookup for scripts (to use names instead of IDs)
    const folderIdToName = new Map<number, string>();
    workcellScriptFolders.forEach((f) => folderIdToName.set(f.id, f.name));

    // Get nests for each hotel
    const hotelsWithNests = await Promise.all(
      workcellHotels.map(async (hotel) => {
        const hotelNests = await db.select().from(nests).where(eq(nests.hotelId, hotel.id));
        return {
          name: hotel.name,
          rows: hotel.rows,
          columns: hotel.columns,
          nests: hotelNests.map(({ name, row, column }) => ({ name, row, column })),
        };
      }),
    );

    // For each tool, get robot arm data and tool nests
    const toolsWithData = await Promise.all(
      workcellTools.map(async (tool) => {
        const locations = await db.select().from(robotArmLocations).where(eq(robotArmLocations.toolId, tool.id));
        const sequences = await db.select().from(robotArmSequences).where(eq(robotArmSequences.toolId, tool.id));
        const motionProfiles = await db.select().from(robotArmMotionProfiles).where(eq(robotArmMotionProfiles.toolId, tool.id));
        const gripParams = await db.select().from(robotArmGripParams).where(eq(robotArmGripParams.toolId, tool.id));
        const toolNests = await db.select().from(nests).where(eq(nests.toolId, tool.id));

        return {
          type: tool.type,
          name: tool.name,
          description: tool.description,
          imageUrl: tool.imageUrl,
          ip: tool.ip,
          port: tool.port,
          config: tool.config,
          nests: toolNests.map(({ name, row, column }) => ({ name, row, column })),
          robotArm: {
            locations: locations.map(({ name, locationType, coordinates, orientation }) => ({
              name, locationType, coordinates, orientation,
            })),
            sequences: sequences.map(({ name, description, commands, labware }) => ({
              name, description, commands, labware,
            })),
            motionProfiles: motionProfiles.map(({ name, speed, speed2, acceleration, deceleration, accelRamp, decelRamp, inrange, straight }) => ({
              name, speed, speed2, acceleration, deceleration, accelRamp, decelRamp, inrange, straight,
            })),
            gripParams: gripParams.map(({ name, width, speed, force }) => ({ name, width, speed, force })),
          },
        };
      }),
    );

    return {
      version: 2,
      exportedAt: new Date().toISOString(),
      workcell: {
        name: workcell[0].name,
        location: workcell[0].location,
        description: workcell[0].description,
      },
      tools: toolsWithData,
      hotels: hotelsWithNests,
      labware: workcellLabware.map(({ name, description, numberOfRows, numberOfColumns, zOffset, width, height, plateLidOffset, lidOffset, stackHeight, hasLid }) => ({
        name, description, numberOfRows, numberOfColumns, zOffset, width, height, plateLidOffset, lidOffset, stackHeight, hasLid,
      })),
      forms: workcellForms.map(({ name, fields, backgroundColor, fontColor }) => ({
        name, fields, backgroundColor, fontColor,
      })),
      variables: workcellVariables.map(({ name, type }) => ({
        name, type, value: "", // Empty value on export for security
      })),
      protocols: workcellProtocols.map(({ name, category, description, commands }) => ({
        name, category, description, commands,
      })),
      scriptFolders: workcellScriptFolders.map((folder) => ({
        name: folder.name,
        parentFolderName: folder.parentId ? folderIdToName.get(folder.parentId) || null : null,
      })),
      scripts: workcellScripts.map((script) => ({
        name: script.name,
        content: script.content,
        language: script.language,
        folderName: script.folderId ? folderIdToName.get(script.folderId) || null : null,
      })),
    };
  }),

  importConfig: procedure
    .input(
      z.object({
        version: z.number().optional(),
        workcell: z.object({
          name: z.string(),
          location: z.string().nullable().optional(),
          description: z.string().nullable().optional(),
        }),
        tools: z
          .array(
            z.object({
              type: z.string(),
              name: z.string(),
              description: z.string().nullable().optional(),
              imageUrl: z.string().nullable().optional(),
              ip: z.string(),
              port: z.number(),
              config: z.any().optional(),
              nests: z
                .array(
                  z.object({
                    name: z.string().nullable().optional(),
                    row: z.number(),
                    column: z.number(),
                  }),
                )
                .optional(),
              robotArm: z
                .object({
                  locations: z
                    .array(
                      z.object({
                        name: z.string(),
                        locationType: z.string(),
                        coordinates: z.string(),
                        orientation: z.string(),
                      }),
                    )
                    .optional(),
                  sequences: z
                    .array(
                      z.object({
                        name: z.string(),
                        description: z.string().nullable().optional(),
                        commands: z.any(),
                        labware: z.string().nullable().optional(),
                      }),
                    )
                    .optional(),
                  motionProfiles: z
                    .array(
                      z.object({
                        name: z.string(),
                        speed: z.number(),
                        speed2: z.number(),
                        acceleration: z.number(),
                        deceleration: z.number(),
                        accelRamp: z.number(),
                        decelRamp: z.number(),
                        inrange: z.number(),
                        straight: z.number(),
                      }),
                    )
                    .optional(),
                  gripParams: z
                    .array(
                      z.object({
                        name: z.string(),
                        width: z.number(),
                        speed: z.number(),
                        force: z.number(),
                      }),
                    )
                    .optional(),
                })
                .optional(),
            }),
          )
          .optional(),
        hotels: z
          .array(
            z.object({
              name: z.string(),
              rows: z.number(),
              columns: z.number(),
              nests: z
                .array(
                  z.object({
                    name: z.string().nullable().optional(),
                    row: z.number(),
                    column: z.number(),
                  }),
                )
                .optional(),
            }),
          )
          .optional(),
        labware: z
          .array(
            z.object({
              name: z.string(),
              description: z.string().nullable().optional(),
              numberOfRows: z.number().nullable().optional(),
              numberOfColumns: z.number().nullable().optional(),
              zOffset: z.number().nullable().optional(),
              width: z.number().nullable().optional(),
              height: z.number().nullable().optional(),
              plateLidOffset: z.number().nullable().optional(),
              lidOffset: z.number().nullable().optional(),
              stackHeight: z.number().nullable().optional(),
              hasLid: z.boolean().nullable().optional(),
            }),
          )
          .optional(),
        forms: z
          .array(
            z.object({
              name: z.string(),
              fields: z.any().optional(),
              backgroundColor: z.string().nullable().optional(),
              fontColor: z.string().nullable().optional(),
            }),
          )
          .optional(),
        variables: z
          .array(
            z.object({
              name: z.string(),
              type: z.string(),
              value: z.string().optional(),
            }),
          )
          .optional(),
        protocols: z
          .array(
            z.object({
              name: z.string(),
              category: z.string().nullable().optional(),
              description: z.string().nullable().optional(),
              commands: z.any().optional(),
            }),
          )
          .optional(),
        scriptFolders: z
          .array(
            z.object({
              name: z.string(),
              parentFolderName: z.string().nullable().optional(),
            }),
          )
          .optional(),
        scripts: z
          .array(
            z.object({
              name: z.string(),
              content: z.string().nullable().optional(),
              language: z.string().nullable().optional(),
              folderName: z.string().nullable().optional(),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ input }) => {
      // Check if workcell name already exists
      const existing = await db
        .select()
        .from(workcells)
        .where(eq(workcells.name, input.workcell.name))
        .limit(1);

      if (existing && existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `A workcell named "${input.workcell.name}" already exists. Please rename it or delete the existing one.`,
        });
      }

      // Create the workcell
      const [newWorkcell] = await db
        .insert(workcells)
        .values({
          name: input.workcell.name,
          location: input.workcell.location,
          description: input.workcell.description,
        })
        .returning();

      // Create tools and their robot arm data
      if (input.tools && input.tools.length > 0) {
        for (const tool of input.tools) {
          const [newTool] = await db
            .insert(tools)
            .values({
              type: tool.type,
              name: tool.name,
              description: tool.description,
              imageUrl: tool.imageUrl,
              ip: tool.ip,
              port: tool.port,
              config: tool.config,
              workcellId: newWorkcell.id,
            })
            .returning();

          // Create robot arm data if present
          if (tool.robotArm) {
            // Locations
            if (tool.robotArm.locations && tool.robotArm.locations.length > 0) {
              await db.insert(robotArmLocations).values(
                tool.robotArm.locations.map((loc) => ({
                  name: loc.name,
                  locationType: loc.locationType,
                  coordinates: loc.coordinates,
                  orientation: loc.orientation,
                  toolId: newTool.id,
                })),
              );
            }

            // Sequences
            if (tool.robotArm.sequences && tool.robotArm.sequences.length > 0) {
              await db.insert(robotArmSequences).values(
                tool.robotArm.sequences.map((seq) => ({
                  name: seq.name,
                  description: seq.description,
                  commands: seq.commands,
                  labware: seq.labware,
                  toolId: newTool.id,
                })),
              );
            }

            // Motion Profiles
            if (tool.robotArm.motionProfiles && tool.robotArm.motionProfiles.length > 0) {
              await db.insert(robotArmMotionProfiles).values(
                tool.robotArm.motionProfiles.map((mp) => ({
                  name: mp.name,
                  speed: mp.speed,
                  speed2: mp.speed2,
                  acceleration: mp.acceleration,
                  deceleration: mp.deceleration,
                  accelRamp: mp.accelRamp,
                  decelRamp: mp.decelRamp,
                  inrange: mp.inrange,
                  straight: mp.straight,
                  toolId: newTool.id,
                })),
              );
            }

            // Grip Params
            if (tool.robotArm.gripParams && tool.robotArm.gripParams.length > 0) {
              await db.insert(robotArmGripParams).values(
                tool.robotArm.gripParams.map((gp) => ({
                  name: gp.name,
                  width: gp.width,
                  speed: gp.speed,
                  force: gp.force,
                  toolId: newTool.id,
                })),
              );
            }
          }

          // Create tool nests if present
          if (tool.nests && tool.nests.length > 0) {
            await db.insert(nests).values(
              tool.nests.map((nest) => ({
                name: nest.name,
                row: nest.row,
                column: nest.column,
                toolId: newTool.id,
              })),
            );
          }
        }
      }

      // Create hotels and their nests
      if (input.hotels && input.hotels.length > 0) {
        for (const hotel of input.hotels) {
          const [newHotel] = await db
            .insert(hotels)
            .values({
              name: hotel.name,
              rows: hotel.rows,
              columns: hotel.columns,
              workcellId: newWorkcell.id,
            })
            .returning();

          // Create nests if present
          if (hotel.nests && hotel.nests.length > 0) {
            await db.insert(nests).values(
              hotel.nests.map((nest) => ({
                name: nest.name,
                row: nest.row,
                column: nest.column,
                hotelId: newHotel.id,
              })),
            );
          }
        }
      }

      // Create labware
      if (input.labware && input.labware.length > 0) {
        await db.insert(labware).values(
          input.labware.map((lw) => ({
            name: lw.name,
            description: lw.description,
            numberOfRows: lw.numberOfRows,
            numberOfColumns: lw.numberOfColumns,
            zOffset: lw.zOffset,
            width: lw.width,
            height: lw.height,
            plateLidOffset: lw.plateLidOffset,
            lidOffset: lw.lidOffset,
            stackHeight: lw.stackHeight,
            hasLid: lw.hasLid,
            workcellId: newWorkcell.id,
          })),
        );
      }

      // Create forms
      if (input.forms && input.forms.length > 0) {
        await db.insert(forms).values(
          input.forms.map((form) => ({
            name: form.name,
            fields: form.fields,
            backgroundColor: form.backgroundColor,
            fontColor: form.fontColor,
            workcellId: newWorkcell.id,
          })),
        );
      }

      // Create variables (with empty values)
      if (input.variables && input.variables.length > 0) {
        await db.insert(variables).values(
          input.variables.map((v) => ({
            name: v.name,
            type: v.type,
            value: "", // Always empty on import
            workcellId: newWorkcell.id,
          })),
        );
      }

      // Create protocols
      if (input.protocols && input.protocols.length > 0) {
        await db.insert(protocols).values(
          input.protocols.map((p) => ({
            name: p.name,
            category: p.category,
            description: p.description,
            commands: p.commands,
            workcellId: newWorkcell.id,
          })),
        );
      }

      // Create script folders (need to handle parent folder relationships)
      const folderNameToId = new Map<string, number>();
      if (input.scriptFolders && input.scriptFolders.length > 0) {
        // First pass: create folders without parents
        const foldersWithoutParent = input.scriptFolders.filter((f) => !f.parentFolderName);
        const foldersWithParent = input.scriptFolders.filter((f) => f.parentFolderName);

        for (const folder of foldersWithoutParent) {
          const [newFolder] = await db
            .insert(scriptFolders)
            .values({
              name: folder.name,
              workcellId: newWorkcell.id,
            })
            .returning();
          folderNameToId.set(folder.name, newFolder.id);
        }

        // Second pass: create folders with parents (may need multiple passes for deeply nested)
        let remaining = [...foldersWithParent];
        let maxIterations = 10; // Prevent infinite loops
        while (remaining.length > 0 && maxIterations > 0) {
          const stillRemaining: typeof remaining = [];
          for (const folder of remaining) {
            const parentId = folder.parentFolderName ? folderNameToId.get(folder.parentFolderName) : undefined;
            if (parentId !== undefined || !folder.parentFolderName) {
              const [newFolder] = await db
                .insert(scriptFolders)
                .values({
                  name: folder.name,
                  parentId: parentId,
                  workcellId: newWorkcell.id,
                })
                .returning();
              folderNameToId.set(folder.name, newFolder.id);
            } else {
              stillRemaining.push(folder);
            }
          }
          remaining = stillRemaining;
          maxIterations--;
        }
      }

      // Create scripts
      if (input.scripts && input.scripts.length > 0) {
        await db.insert(scripts).values(
          input.scripts.map((s) => ({
            name: s.name,
            content: s.content,
            language: s.language,
            folderId: s.folderName ? folderNameToId.get(s.folderName) : undefined,
            workcellId: newWorkcell.id,
          })),
        );
      }

      return {
        message: `Workcell "${newWorkcell.name}" imported successfully`,
        workcellId: newWorkcell.id,
      };
    }),
});
