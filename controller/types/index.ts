// types/index.ts - Central export
export * from "./form";
export * from "./run";

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
} from "@/db/schema";

import type { Workcell, Tool, ScriptFolder, Script } from "@/db/schema";

export interface WorkcellResponse extends Workcell {
  tools: Tool[];
}

export interface FolderResponse extends ScriptFolder {
  scripts: Script[];
  subFolders: FolderResponse[];
}
