/**
 * GitHub Hub Utilities
 *
 * Fetches Hub content directly from the public GitHub repository
 * with TTL-based caching to minimize API calls.
 */

const GITHUB_RAW_BASE_URL = "https://raw.githubusercontent.com/sciencecorp/galago-core/main/hub";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export interface HubIndexItem {
  id: string;
  type: "workcells" | "protocols" | "variables" | "scripts" | "labware" | "forms" | "inventory";
  name: string;
  description?: string;
  tags?: string[];
  updated_at: string;
}

export interface HubIndex {
  version: string;
  updated_at: string;
  items: HubIndexItem[];
}

export interface HubItemMeta {
  type: string;
  name: string;
  description?: string;
  tags?: string[];
  payload?: string;
}

export interface HubItem {
  id: string;
  type: "workcells" | "protocols" | "variables" | "scripts" | "labware" | "forms" | "inventory";
  name: string;
  description: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  payload: unknown;
  source: "github";
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

/**
 * Fetches the Hub index from GitHub with caching.
 * Returns cached data if available and not expired.
 */
export async function fetchHubIndex(): Promise<HubIndex> {
  const cacheKey = "hub-index";
  const cached = getCached<HubIndex>(cacheKey);
  if (cached) return cached;

  const url = `${GITHUB_RAW_BASE_URL}/index.json`;
  const data = await fetchJson<HubIndex>(url);
  setCache(cacheKey, data);
  return data;
}

/**
 * Fetches a specific Hub item's meta and payload from GitHub.
 * The item ID is the path relative to hub/ (e.g., "variables/example")
 */
export async function fetchHubItem(id: string): Promise<HubItem> {
  const cacheKey = `hub-item:${id}`;
  const cached = getCached<HubItem>(cacheKey);
  if (cached) return cached;

  // Sanitize ID to prevent path traversal
  const safeId = id.replace(/^\/+/, "").replace(/\.\.(\/|\\)/g, "");

  // Fetch meta.json first
  const metaUrl = `${GITHUB_RAW_BASE_URL}/${safeId}/meta.json`;
  const meta = await fetchJson<HubItemMeta>(metaUrl);

  // Fetch payload.json (or custom payload path from meta)
  const payloadFilename = meta.payload || "payload.json";
  const payloadUrl = `${GITHUB_RAW_BASE_URL}/${safeId}/${payloadFilename}`;
  const payload = await fetchJson<unknown>(payloadUrl);

  // Get updated_at from index if available, otherwise use current time
  let updatedAt = new Date().toISOString();
  try {
    const index = await fetchHubIndex();
    const indexItem = index.items.find((item) => item.id === safeId);
    if (indexItem?.updated_at) {
      updatedAt = indexItem.updated_at;
    }
  } catch {
    // Ignore - use default timestamp
  }

  const item: HubItem = {
    id: safeId,
    type: meta.type as HubItem["type"],
    name: meta.name,
    description: meta.description || "",
    tags: meta.tags || [],
    created_at: updatedAt,
    updated_at: updatedAt,
    payload,
    source: "github",
  };

  setCache(cacheKey, item);
  return item;
}

/**
 * Clears the Hub cache (useful for forcing refresh)
 */
export function clearHubCache(): void {
  cache.clear();
}
