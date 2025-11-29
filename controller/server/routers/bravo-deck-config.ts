import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { get, post, put, del } from "../utils/api";
import { logAction } from "@/server/logger";

// Zod schema for deck layout - exactly 9 locations with optional labware
const zDeckLayout = z.object({
  "1": z.string().nullish(),
  "2": z.string().nullish(),
  "3": z.string().nullish(),
  "4": z.string().nullish(),
  "5": z.string().nullish(),
  "6": z.string().nullish(),
  "7": z.string().nullish(),
  "8": z.string().nullish(),
  "9": z.string().nullish(),
});

// Zod schema for Bravo deck config
const zBravoDeckConfig = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  deck_layout: zDeckLayout,
  workcell_id: z.number(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Input schemas for mutations
const zBravoDeckConfigCreate = zBravoDeckConfig.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

const zBravoDeckConfigUpdate = zBravoDeckConfig
  .partial()
  .omit({ created_at: true, updated_at: true });

// Export types
export type BravoDeckConfig = z.infer<typeof zBravoDeckConfig>;
export type BravoDeckConfigCreate = z.infer<typeof zBravoDeckConfigCreate>;
export type BravoDeckConfigUpdate = z.infer<typeof zBravoDeckConfigUpdate>;
export type DeckLayout = z.infer<typeof zDeckLayout>;

export const bravoDeckConfigRouter = router({
  // Get all deck configs
  getAll: procedure
    .input(
      z
        .object({
          workcellId: z.number().optional(),
          workcellName: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      let url = "/bravo-deck-configs";
      const params = new URLSearchParams();

      if (input?.workcellId) {
        params.append("workcell_id", input.workcellId.toString());
      } else if (input?.workcellName) {
        params.append("workcell_name", input.workcellName);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await get<BravoDeckConfig[]>(url);
      return response;
    }),

  // Get a specific deck config by ID
  get: procedure.input(z.number()).query(async ({ input }) => {
    const response = await get<BravoDeckConfig>(`/bravo-deck-configs/${input}`);
    return response;
  }),

  // Create new deck config
  create: procedure.input(zBravoDeckConfigCreate).mutation(async ({ input }) => {
    const response = await post<BravoDeckConfig>("/bravo-deck-configs", input);
    logAction({
      level: "info",
      action: "Bravo Deck Config Created",
      details: `Bravo deck configuration "${input.name}" created successfully for workcell ID ${input.workcell_id}.`,
    });
    return response;
  }),

  // Update deck config
  update: procedure
    .input(
      z.object({
        id: z.number(),
        data: zBravoDeckConfigUpdate,
      }),
    )
    .mutation(async ({ input }) => {
      const { id, data } = input;
      const response = await put<BravoDeckConfig>(`/bravo-deck-configs/${id}`, data);
      logAction({
        level: "info",
        action: "Bravo Deck Config Updated",
        details: `Bravo deck configuration "${data.name || "ID:" + id}" updated successfully.`,
      });
      return response;
    }),

  // Delete deck config
  delete: procedure.input(z.number()).mutation(async ({ input }) => {
    // Get config details before deletion for logging
    let configName = `ID: ${input}`;
    try {
      const config = await get<BravoDeckConfig>(`/bravo-deck-configs/${input}`);
      configName = config.name;
    } catch (error) {
      console.warn("Could not fetch deck config name for logging:", error);
    }

    await del(`/bravo-deck-configs/${input}`);
    logAction({
      level: "info",
      action: "Bravo Deck Config Deleted",
      details: `Bravo deck configuration "${configName}" deleted successfully.`,
    });
    return { message: "Bravo deck config deleted successfully" };
  }),
});
