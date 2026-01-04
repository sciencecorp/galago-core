// types/index.ts - Central export
export * from "./form";
export * from "./run";

export type NestStatus = "empty" | "occupied" | "reserved" | "error";

export interface ParameterSchema {
  type: string;
  description?: string;
  variable?: string;
}

export interface PageProps {
  title: string;
  subtitle: string;
  link: string;
  icon: any;
  color: any;
  description: string;
}

export type {
  Labware,
  Variable,
  Log,
  Tool,
  Script,
  NewScript,
  ScriptFolder,
  NewScriptFolder,
  Workcell,
  Hotel,
  Plate,
  Reagent,
  Nest,
} from "@/db/schema";

import type { Workcell, Tool, ScriptFolder, Script, Hotel } from "@/db/schema";

export interface WorkcellResponse extends Workcell {
  tools: Tool[];
  hotels: Hotel[];
}

export interface FolderResponse extends ScriptFolder {
  scripts: Script[];
  subFolders: FolderResponse[];
}
