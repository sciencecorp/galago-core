export interface WellCreate {
  row: string;
  column: number;
  plate_id: number;
}

export interface WellUpdate {
  row?: string;
  column?: number;
  plate_id?: number;
}

export interface Well extends WellCreate {
  id: number;
}

export interface ReagentCreate {
  name: string;
  expiration_date: string;
  volume: number;
  well_id: number;
}

export interface ReagentUpdate {
  name?: string;
  expiration_date?: string;
  volume?: number;
  well_id?: number;
}

export interface Reagent extends ReagentCreate {
  id: number;
}

export interface SlackAlert {
  messageId: string;
  messageChannel: string;
  workcell: string;
  tool: string;
  protocol: string;
  error: string;
  update: string;
}

export interface Protocol {
  id: number;
  name: string;
  category: string;
  workcellId: number;
  description?: string;
  commands: ToolCommand[];
  created_at?: string;
  updated_at?: string;
}

export interface ParameterSchema {
  type: "string" | "number" | "boolean" | "array" | "enum";
  description?: string;
  optional?: boolean;
  min?: number;
  max?: number;
  regex?: string;
  items?: ParameterSchema; // For array types
  values?: string[]; // For enum types
  default?: any;
}

export interface ToolCommand {
  toolId: string;
  command: string;
  label?: string;
  params: Record<string, any>;
}
