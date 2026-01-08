import type { HubItem, HubItemType } from "./hubTypes";
import { DateTime } from "luxon";

export const HUB_TYPES: { type: HubItemType; label: string; description: string }[] = [
  { type: "workcells", label: "Workcells", description: "Complete workcell configurations" },
  { type: "protocols", label: "Protocols", description: "Runnable protocols and command sets" },
  {
    type: "variables",
    label: "Variables",
    description: "Parameter sets and environment variables",
  },
  { type: "scripts", label: "Scripts", description: "Automation scripts and helpers" },
  { type: "labware", label: "Labware", description: "Labware definitions and geometry" },
  { type: "forms", label: "Forms", description: "UI forms and inputs" },
  { type: "inventory", label: "Inventory", description: "Snapshots and inventory data" },
];

export function itemTypeLabel(type: HubItemType): string {
  return HUB_TYPES.find((t) => t.type === type)?.label ?? type;
}

export function normalizeTags(tags?: string[]): string[] {
  return (tags || [])
    .map((t) => (t || "").trim())
    .filter(Boolean)
    .slice(0, 20);
}

export function safePrettyJson(value: any): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function hubItemToJsonFile(item: HubItem): File {
  const json = safePrettyJson(item.payload);
  const blob = new Blob([json], { type: "application/json" });
  const filename = `${item.name.replace(/\s+/g, "_") || item.id}.json`;
  return new File([blob], filename, { type: "application/json" });
}

export function formatHubTimestamp(iso: string): string {
  if (!iso) return "";
  const dt = DateTime.fromISO(iso);
  if (!dt.isValid) return iso;
  // Local, human-friendly
  return dt.toLocal().toFormat("MMM d, yyyy • h:mm a");
}
