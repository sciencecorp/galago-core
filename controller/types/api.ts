import { DateTime } from "luxon";
import { Config } from "gen-interfaces/tools/grpc_interfaces/tool_base";

export interface Workcell {
  id: number;
  name: string;
  location: string;
  description: string;
  tools: Tool[];
  last_updated: Date;
  created_at: Date;
}

export interface WorkcellCreate {
  name: string;
}

export interface WorkcellUpdate {
  name?: string;
}

export interface Workcell extends WorkcellCreate {
  id: number;
}

export interface InstrumentCreate {
  name: string;
  workcell_id: number;
}

export interface InstrumentUpdate {
  name?: string;
  workcell_id?: number;
}

export interface Instrument extends InstrumentCreate {
  id: number;
}

export interface NestCreate {
  name: string;
  row: number;
  column: number;
  tool_id: number;
}

export interface NestUpdate {
  name?: string;
  row?: number;
  column?: number;
  tool_id?: number;
}

export interface Nest extends NestCreate {
  id: number;
}

export interface PlateCreate {
  name: string | null;
  barcode: string;
  plate_type: string;
  nest_id: number | null;
}

export interface PlateUpdate {
  name?: string | null;
  barcode?: string;
  plate_type?: string;
  nest_id?: number | null;
}

export interface Plate extends PlateCreate {
  id: number;
}

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

export interface PlateInfo extends Plate {
  nest: Nest | null;
  wells: Well[];
}
export interface Inventory {
  workcell: Workcell;
  instruments: Instrument[];
  nests: Nest[];
  plates: Plate[];
  wells: Well[];
  reagents: Reagent[];
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
  workcell: string;
  number_of_commands: number;
  description: string;
  icon: string;
}

export interface Variable {
  id: number;
  name: string;
  value: string;
  type: VariableType;
  created_at: Date;
  updated_at: Date;
}

type VariableType = "string" | "number" | "boolean";

export interface Tool {
  id: number;
  name: string;
  ip: string;
  port: number;
  type: string;
  workcell_id: number;
  description: string;
  image_url: string;
  status: string;
  last_updated: Date;
  created_at: Date;
  config: Config;
  joints: number;
}

export interface LogType {
  id: number;
  name: string;
  created_at: DateTime;
  updated_at: DateTime;
}

export interface Log {
  id: number;
  level: string;
  action: string;
  details: string;
  created_at: Date;
  updated_at: Date;
}

export interface AppSettings {
  id: number;
  name: string;
  value: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Script {
  id: number;
  name: string;
  content: string;
  description: string;
  is_blocking: boolean;
  language: string;
  created_at: Date;
  updated_at: Date;
}

export interface Labware {
  id?: number;
  name: string;
  description: string;
  number_of_rows: number;
  number_of_columns: number;
  z_offset: number;
  width: number;
  height: number;
  plate_lid_offset: number;
  lid_offset: number;
  stack_height: number;
  has_lid: boolean;
  image_url: string;
  created_at?: string;
  updated_at?: string;
}
