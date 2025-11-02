export interface ProtocolCommandGroup {
  created_at: Date;
  updated_at: Date;
  id: number;
  name: string;
  description: string;
  process_id: number;
  commands: Command[];
}
export interface ProtocolCommand {
  id: number;
  label: string;
  tool_type: string;
  tool_id: string;
  command: string;
  params: Record<string, any>;
  process_id: number;
  command_group_id: number;
  position: number;
}
export interface ProtocolProcess {
  id: number;
  position: number;
  created_at: Date;
  updated_at: Date;
  name: string;
  description: string;
  protocol_id: number;
  commands: ProtocolCommand[];
  command_groups: ProtocolCommandGroup[];
}
// Interface for swimlane structure
export interface Swimlane {
  id: string;
  name: string;
  description?: string;
  position: number;
  commands: ProtocolCommand[];
  processId?: number; // To track the actual process ID in the database
}

export interface Protocol {
  id: number;
  name: string;
  category: string;
  workcell_id: number;
  description?: string;
  icon?: string;
  params: Record<string, ParameterSchema>;
  processes: ProtocolProcess[];
  version?: number;
  is_active?: boolean;
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