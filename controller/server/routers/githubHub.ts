import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { fetchHubIndex, fetchHubItem, clearHubCache } from "@/utils/githubHub";
import { zHubItemType, zHubItemSummary, zHubItem } from "./hub";

export const githubHubRouter = router({
  /**
   * List all Hub items from GitHub with optional filtering
   */
  list: procedure
    .input(
      z
        .object({
          type: zHubItemType.optional(),
          q: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      try {
        const index = await fetchHubIndex();
        let items = index.items;

        // Filter by type if specified
        if (input?.type) {
          items = items.filter((item) => item.type === input.type);
        }

        // Filter by search query
        const needle = (input?.q || "").trim().toLowerCase();
        if (needle) {
          items = items.filter((item) => {
            const hay =
              `${item.name} ${item.description || ""} ${(item.tags || []).join(" ")}`.toLowerCase();
            return hay.includes(needle);
          });
        }

        // Map to HubItemSummary format
        const summaries = items.map((item) =>
          zHubItemSummary.parse({
            id: item.id,
            type: item.type,
            name: item.name,
            description: item.description || "",
            tags: item.tags || [],
            created_at: item.updated_at,
            updated_at: item.updated_at,
            source: "library", // Use "library" for compatibility with existing UI
          }),
        );

        // Sort by updated_at descending (newest first)
        summaries.sort((a, b) =>
          a.updated_at < b.updated_at ? 1 : a.updated_at > b.updated_at ? -1 : 0,
        );

        return summaries;
      } catch (error) {
        // Return empty list on error (fail gracefully like version check)
        console.warn("Failed to fetch Hub index from GitHub:", error);
        return [];
      }
    }),

  /**
   * Get a specific Hub item with full payload from GitHub
   */
  get: procedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .query(async ({ input }) => {
      try {
        const item = await fetchHubItem(input.id);

        return zHubItem.parse({
          id: item.id,
          type: item.type,
          name: item.name,
          description: item.description,
          tags: item.tags,
          created_at: item.created_at,
          updated_at: item.updated_at,
          payload: item.payload,
          source: "library", // Use "library" for compatibility with existing UI
        });
      } catch (error) {
        console.warn(`Failed to fetch Hub item ${input.id} from GitHub:`, error);
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Hub item not found: ${input.id}`,
        });
      }
    }),

  /**
   * Clear the Hub cache (forces refresh on next request)
   */
  clearCache: procedure.mutation(async () => {
    clearHubCache();
    return { success: true };
  }),
});
