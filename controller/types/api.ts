import { DateTime } from "luxon";
import { Config } from "gen-interfaces/tools/grpc_interfaces/tool_base";

export interface Workcell {
  id: number;
  name: string;
  location:string;
  description: string;
  tools: Tool[];
  last_updated: Date;
  created_at: Date;
}

export interface Variable {
  id: number;
  name: string;
  value: string;
  type: string;
  created_at: Date;
  updated_at: Date;
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
  config:Config;
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