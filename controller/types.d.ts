import { ToolType } from "gen-interfaces/controller";

declare module "*.jpg";
declare module "*.png";
declare module "*.svg";

export type RunStatus = "CREATED" | "STARTED" | "FAILED" | "COMPLETED" | "SKIPPED";

export interface ParameterSchema {
  type: string;
  description?: string;
  variable?: string;
}

export interface SkipExecution {
  variable: string | null;
  value: string;
}

export interface AdvancedParameters {
  skip_execution_variable: SkipExecution;
  run_asynchronously: boolean;
}

export interface ToolCommandInfo {
  label?: string;
  tool_id: string;
  tool_type: ToolType | string;
  command: string;
  params: Record<string, any>;
  advanced_parameters?: AdvancedParameters;

}

export interface PageProps {
  title: string;
  subtitle: string;
  link: string;
  icon: any;
  color: any;
  description: string;
}

export interface HasRunStatus {
  status: RunStatus;
  created_at?: Date;
  started_at?: Date;
  failed_at?: Date;
  completed_at?: Date;
  skipped_at?: Date;
}

export interface RunCommand extends HasRunStatus {
  run_id: string;
  queue_id?: number;
  command_info: ToolCommandInfo;
  estimated_duration?: number;
  duration_actual?: number;
  error?: unknown;
}

export interface RunRequest {
  protocol_id: string;
  params: Record<string, any>;vv
}

export interface Run extends HasRunStatus {
  id: string;
  params: Record<string, any>;
  commands: RunCommand[];
}

export interface RunQueue extends HasRunStatus {
  id: string;
  params: Record<string, any>;
  run_type: string;
  commands_count: number;
}

export interface RunError {}

export interface Protocol {
  id: number;
  name: string;
  description?: string;
  icon?: any;
  params: Record<string, string>;
}

export interface RunSubmissionStatus {
  id: string;
  status: RunStatus;
}

export interface RunStatusList {
  count: number;
  data: Run[];
}

export interface GroupedCommand {
  Id: string;
  Commands: RunCommand[];
}
