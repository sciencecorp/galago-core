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

export type { Labware, Variable, Log, Tool } from "@/db/schema";
import type { Workcell, Tool, Hotel } from "@/db/schema";

export interface WorkcellResponse extends Workcell {
  tools: Tool[];
}
