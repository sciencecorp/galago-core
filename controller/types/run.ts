import { ToolType } from "gen-interfaces/controller";

export type RunStatus = "CREATED" | "STARTED" | "FAILED" | "COMPLETED" | "SKIPPED";

export interface HasRunStatus {
  status: RunStatus;
  createdAt?: Date;
  startedAt?: Date;
  failedAt?: Date;
  completedAt?: Date;
  skippedAt?: Date;
}

export interface RunCommand extends HasRunStatus {
  runId: string;
  queueId?: number;
  commandInfo: ToolCommandInfo;
  estimatedDuration?: number;
  durationActual?: number;
  error?: unknown;
}

export interface SkipExecution {
  variable: string | null;
  value: string;
}

export interface HasRunStatus {
  status: RunStatus;
  createdAt?: Date;
  startedAt?: Date;
  failedAt?: Date;
  completedAt?: Date;
  skippedAt?: Date;
}

export interface AdvancedParameters {
  skipExecutionVariable: SkipExecution;
  runAsynchronously?: boolean;
}

export interface ToolCommandInfo {
  label?: string;
  toolId: string;
  toolType: ToolType;
  command: string;
  params: Record<string, any>;
  advancedParameters?: AdvancedParameters;
}

export interface RunRequest {
  protocolId: string;
}

export interface Run extends HasRunStatus {
  id: string;
  protocolId: string;
  commands: RunCommand[];
}

export interface RunQueue extends HasRunStatus {
  id: string;
  run_type: string;
  commands_count: number;
}

export interface RunStatusList {
  count: number;
  data: Run[];
}

export interface GroupedCommand {
  Id: string;
  Commands: RunCommand[];
}

export interface RunError {}

export interface RunSubmissionStatus {
  id: string;
  status: RunStatus;
}
