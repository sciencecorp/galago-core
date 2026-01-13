import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import path from "path";
import { promises as fs } from "fs";
import crypto from "crypto";

function hubRootDirAbs(): string {
  // Next.js server runs from `controller/` → hub data lives in repo `db/data/hub`
  return path.join(process.cwd(), "..", "db", "data", "hub");
}

async function ensureHubDirs(): Promise<void> {
  const root = hubRootDirAbs();
  await fs.mkdir(root, { recursive: true });
  for (const tdir of [
    "workcells",
    "protocols",
    "variables",
    "scripts",
    "labware",
    "forms",
    "inventory",
  ]) {
    await fs.mkdir(path.join(root, tdir), { recursive: true });
  }
}

function itemPathAbs(itemType: string, id: string): string {
  const safeId = id.replace(/^\/+/, "").replace(/\.\.(\/|\\)/g, "");
  return path.join(hubRootDirAbs(), itemType, `${safeId}.json`);
}

function nowIso(): string {
  return new Date().toISOString();
}

function stableId(): string {
  return crypto.randomBytes(16).toString("hex");
}

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
  source: z.enum(["hub", "library"]).optional(),
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
      await ensureHubDirs();

      const types = input?.type ? [input.type] : [...zHubItemType.options];
      const needle = (input?.q || "").trim().toLowerCase();
      const summaries: HubItemSummary[] = [];

      for (const t of types) {
        const dirAbs = path.join(hubRootDirAbs(), t);
        let entries: string[] = [];
        try {
          entries = await fs.readdir(dirAbs);
        } catch {
          entries = [];
        }
        for (const ent of entries) {
          if (!ent.endsWith(".json")) continue;
          const p = path.join(dirAbs, ent);
          let raw = "";
          try {
            raw = await fs.readFile(p, "utf8");
          } catch {
            continue;
          }
          let data: any;
          try {
            data = JSON.parse(raw);
          } catch {
            continue;
          }

          const summary = zHubItemSummary.parse({
            id: String(data.id || ent.replace(/\.json$/, "")),
            type: data.type || t,
            name: String(data.name || ent.replace(/\.json$/, "")),
            description: String(data.description || ""),
            tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
            created_at: String(data.created_at || ""),
            updated_at: String(data.updated_at || ""),
            source: "hub",
          });

          if (needle) {
            const hay = `${summary.name} ${summary.description || ""} ${(summary.tags || []).join(" ")}`.toLowerCase();
            if (!hay.includes(needle)) continue;
          }

          summaries.push(summary);
        }
      }

      // Newest first (fallback stable)
      summaries.sort((a, b) => (a.updated_at < b.updated_at ? 1 : a.updated_at > b.updated_at ? -1 : 0));
      return summaries;
    }),

  get: procedure
    .input(
      z.object({
        id: z.string(),
        type: zHubItemType.optional(),
      }),
    )
    .query(async ({ input }) => {
      await ensureHubDirs();

      const tryTypes = input.type ? [input.type] : [...zHubItemType.options];
      for (const t of tryTypes) {
        const p = itemPathAbs(t, input.id);
        try {
          const raw = await fs.readFile(p, "utf8");
          const data = JSON.parse(raw);
          return zHubItem.parse({ ...data, source: "hub" });
        } catch {
          // continue
        }
      }

      // Match prior behavior: tRPC NOT_FOUND
      throw new TRPCError({ code: "NOT_FOUND", message: "Hub item not found" });
    }),

  create: procedure
    .input(
      z.object({
        type: zHubItemType,
        name: z.string().min(1),
        description: z.string().optional(),
        tags: z.array(z.string()).optional(),
        payload: z.any(),
        id: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      await ensureHubDirs();

      const id = input.id || stableId();
      const p = itemPathAbs(input.type, id);

      // Preserve created_at if overwriting
      let createdAt = nowIso();
      try {
        const existingRaw = await fs.readFile(p, "utf8");
        const existing = JSON.parse(existingRaw);
        if (existing?.created_at) createdAt = String(existing.created_at);
      } catch {
        // ignore
      }

      const data = {
        id,
        type: input.type,
        name: input.name,
        description: input.description || "",
        tags: input.tags || [],
        created_at: createdAt,
        updated_at: nowIso(),
        payload: input.payload,
      };

      await fs.mkdir(path.dirname(p), { recursive: true });
      await fs.writeFile(p, JSON.stringify(data, null, 2), "utf8");

      return zHubItemSummary.parse({ ...data, source: "hub" });
    }),

  delete: procedure
    .input(
      z.object({
        id: z.string(),
        type: zHubItemType,
      }),
    )
    .mutation(async ({ input }) => {
      await ensureHubDirs();
      const p = itemPathAbs(input.type, input.id);
      try {
        await fs.unlink(p);
      } catch (e: any) {
        if (e?.code === "ENOENT") {
          throw new TRPCError({ code: "NOT_FOUND", message: "Hub item not found" });
        }
        throw e;
      }
      return { success: true };
    }),
});
