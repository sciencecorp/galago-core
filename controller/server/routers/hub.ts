import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { del, get, post } from "../utils/api";

export const zHubItemType = z.enum([
  "workcells",
  "protocols",
  "variables",
  "scripts",
  "labware",
  "forms",
  "inventory",
]);

export const zHubItemSummary = z.object({
  id: z.string(),
  type: zHubItemType,
  name: z.string(),
  description: z.string().optional().default(""),
  tags: z.array(z.string()).optional().default([]),
  created_at: z.string(),
  updated_at: z.string(),
});

export type HubItemSummary = z.infer<typeof zHubItemSummary>;

export const zHubItem = zHubItemSummary.extend({
  payload: z.any(),
});

export type HubItem = z.infer<typeof zHubItem>;

export const hubRouter = router({
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
      const params: any = {};
      if (input?.type) params.item_type = input.type;
      if (input?.q) params.q = input.q;
      return await get<HubItemSummary[]>(`/hub/items`, { params });
    }),

  get: procedure
    .input(
      z.object({
        id: z.string(),
        type: zHubItemType.optional(),
      }),
    )
    .query(async ({ input }) => {
      const params: any = {};
      if (input.type) params.item_type = input.type;
      return await get<HubItem>(`/hub/items/${input.id}`, { params });
    }),

  create: procedure
    .input(
      z.object({
        type: zHubItemType,
        name: z.string().min(1),
        description: z.string().optional(),
        tags: z.array(z.string()).optional(),
        payload: z.any(),
      }),
    )
    .mutation(async ({ input }) => {
      return await post<HubItemSummary>(`/hub/items`, input);
    }),

  delete: procedure
    .input(
      z.object({
        id: z.string(),
        type: zHubItemType,
      }),
    )
    .mutation(async ({ input }) => {
      await del(`/hub/items/${input.id}?item_type=${encodeURIComponent(input.type)}`);
      return { success: true };
    }),
});
