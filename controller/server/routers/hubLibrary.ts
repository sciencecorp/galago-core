import { z } from "zod";
import path from "path";
import { promises as fs } from "fs";
import { procedure, router } from "@/server/trpc";
import { zHubItemType, zHubItem, zHubItemSummary } from "./hub";

const LIBRARY_ROOT = path.join(process.cwd(), "public", "hub-library");

const zLibraryMeta = z.object({
  type: zHubItemType,
  name: z.string().min(1),
  description: z.string().optional().default(""),
  tags: z.array(z.string()).optional().default([]),
  payload: z.string().optional().default("payload.json"),
});

async function walkForMetaJson(dirAbs: string): Promise<string[]> {
  let entries: Awaited<ReturnType<typeof fs.readdir>>;
  try {
    entries = await fs.readdir(dirAbs, { withFileTypes: true });
  } catch {
    return [];
  }

  const out: string[] = [];
  for (const ent of entries) {
    const p = path.join(dirAbs, ent.name);
    if (ent.isDirectory()) {
      out.push(...(await walkForMetaJson(p)));
      continue;
    }
    if (ent.isFile() && ent.name === "meta.json") out.push(p);
  }
  return out;
}

function toIsoOrNow(d: Date | undefined): string {
  const dt = d instanceof Date && !Number.isNaN(d.getTime()) ? d : new Date();
  return dt.toISOString();
}

async function readLibraryItemById(id: string) {
  const safeId = id.replace(/^\/+/, "").replace(/\.\.(\/|\\)/g, "");
  const itemDirAbs = path.join(LIBRARY_ROOT, safeId);
  const metaPath = path.join(itemDirAbs, "meta.json");

  const metaRaw = await fs.readFile(metaPath, "utf8");
  const meta = zLibraryMeta.parse(JSON.parse(metaRaw));

  const payloadPathAbs = path.join(itemDirAbs, meta.payload || "payload.json");
  const payloadRaw = await fs.readFile(payloadPathAbs, "utf8");
  const payload = JSON.parse(payloadRaw);

  const [metaStat, payloadStat] = await Promise.all([
    fs.stat(metaPath).catch(() => null),
    fs.stat(payloadPathAbs).catch(() => null),
  ]);

  const createdAt = toIsoOrNow(metaStat?.birthtime || payloadStat?.birthtime);
  const updatedAt = toIsoOrNow(payloadStat?.mtime || metaStat?.mtime);

  const full = zHubItem.parse({
    id: safeId,
    type: meta.type,
    name: meta.name,
    description: meta.description || "",
    tags: meta.tags || [],
    created_at: createdAt,
    updated_at: updatedAt,
    payload,
    source: "library",
  });

  return full;
}

export const hubLibraryRouter = router({
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
      const metaFiles = await walkForMetaJson(LIBRARY_ROOT);

      const items = await Promise.all(
        metaFiles.map(async (metaAbs) => {
          const itemDirAbs = path.dirname(metaAbs);
          const id = path.relative(LIBRARY_ROOT, itemDirAbs).replace(/\\/g, "/");
          const metaRaw = await fs.readFile(metaAbs, "utf8");
          const meta = zLibraryMeta.parse(JSON.parse(metaRaw));
          const metaStat = await fs.stat(metaAbs).catch(() => null);

          const summary = zHubItemSummary.parse({
            id,
            type: meta.type,
            name: meta.name,
            description: meta.description || "",
            tags: meta.tags || [],
            created_at: toIsoOrNow(metaStat?.birthtime),
            updated_at: toIsoOrNow(metaStat?.mtime),
            source: "library",
          });

          return summary;
        }),
      );

      const q = (input?.q || "").trim().toLowerCase();
      const filtered = items.filter((it) => {
        if (input?.type && it.type !== input.type) return false;
        if (!q) return true;
        const hay = `${it.name} ${it.description || ""} ${(it.tags || []).join(" ")}`.toLowerCase();
        return hay.includes(q);
      });

      // Stable ordering: newest first
      filtered.sort((a, b) =>
        a.updated_at < b.updated_at ? 1 : a.updated_at > b.updated_at ? -1 : 0,
      );
      return filtered;
    }),

  get: procedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .query(async ({ input }) => {
      return await readLibraryItemById(input.id);
    }),
});
