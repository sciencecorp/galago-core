import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { get, post, put, del } from "../utils/api";
import { logAction } from "@/server/logger";
import { BravoDeckConfig, zBravoDeckConfigCreate, zBravoDeckConfigUpdate } from "@/server/schemas";
// Export types

export const bravoDeckConfigRouter = router({
  getAll: procedure.query(async () => {
    const response = await get<BravoDeckConfig[]>("/bravo-deck-configs");
    return response;
  }),

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
      details: `Bravo deck configuration "${input.name}" created successfully.`,
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
