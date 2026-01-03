import { DateTime } from "luxon";
import { Config } from "gen-interfaces/tools/grpc_interfaces/tool_base";

export interface Workcell {
  id: number;
  name: string;
  location: string;
  description: string;
  tools: Tool[];
  hotels?: Hotel[];
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

export type NestStatus = "empty" | "occupied" | "reserved" | "error";
export type PlateStatus = "stored" | "checked_out" | "completed" | "disposed";
export type PlateNestAction = "check_in" | "check_out" | "transfer";

export interface NestCreate {
  name: string;
  row: number;
  column: number;
  tool_id?: number;
  hotel_id?: number;
  status?: NestStatus;
  current_plate_id?: number | null;
}

export interface NestUpdate {
  name?: string;
  row?: number;
  column?: number;
  tool_id?: number;
  hotel_id?: number;
  status?: NestStatus;
  current_plate_id?: number | null;
}

export interface Nest extends Omit<NestCreate, "tool_id" | "hotel_id"> {
  id: number;
  tool_id?: number;
  hotel_id?: number;
  status: NestStatus;
  current_plate_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface PlateCreate {
  name: string | null;
  barcode: string;
  plate_type: string;
  nest_id?: number | null;
  status?: PlateStatus;
}

export interface PlateUpdate {
  id?: number;
  name?: string | null;
  barcode?: string;
  plate_type?: string;
  nest_id?: number | null;
  status?: PlateStatus;
}

export interface Plate {
  id: number;
  name: string | null;
  barcode: string;
  plate_type: string;
  nest_id: number | null;
  status: PlateStatus;
  created_at: string;
  updated_at: string;
}

export interface PlateNestHistory {
  id: number;
  plate_id: number;
  nest_id: number;
  action: PlateNestAction;
  timestamp: string;
  created_at: string;
  updated_at: string;
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
  hotels?: Hotel[];
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

export interface AppSettings {
  id: number;
  name: string;
  value: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface HotelCreate {
  name: string;
  description?: string;
  image_url?: string;
  workcell_id: number;
  rows: number;
  columns: number;
}

export interface HotelUpdate {
  name?: string;
  description?: string;
  image_url?: string;
  rows?: number;
  columns?: number;
}

export interface Hotel extends HotelCreate {
  id: number;
  nests?: Nest[];
  created_at: string;
  updated_at: string;
}
