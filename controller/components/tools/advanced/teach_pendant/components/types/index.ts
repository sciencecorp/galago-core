import { Tool } from "@/types/api";
import { ToolConfig } from "gen-interfaces/controller";
import { JointConfig } from "../utils/robotArmUtils";

export interface TeachPendantProps {
  toolId: string | undefined;
  config: Tool;
}

export interface TeachPoint {
  id: number;
  name: string;
  coordinates: string;
  type: "location" | "nest";
  locType: "j";
  joints?: JointConfig;
  orientation: "portrait" | "landscape";
  safe_loc?: number;
}

export interface MotionProfile {
  id: number;
  name: string;
  profile_id: number;
  speed: number;
  speed2: number;
  acceleration: number;
  deceleration: number;
  accel_ramp: number;
  decel_ramp: number;
  inrange: number;
  straight: number;
  tool_id: number;
}

export interface GripParams {
  id?: number;
  name: string;
  width: number;
  speed: number;
  force: number;
  tool_id: number;
}

export interface MoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  point: TeachPoint;
  onMove: (point: TeachPoint, profile: MotionProfile) => void;
}

export interface SequenceCommand {
  command: string;
  params: Record<string, any>;
  order: number;
}

export interface Sequence {
  id: number;
  name: string;
  description?: string;
  commands: SequenceCommand[];
  tool_id: number;
}

export type SearchableItem = TeachPoint | MotionProfile | GripParams | Sequence;
export type ItemType = "teachPoint" | "motionProfile" | "gripParams" | "sequence";

export interface TeachPointsPanelProps {
  teachPoints: TeachPoint[];
  motionProfiles: MotionProfile[];
  gripParams: GripParams[];
  sequences: Sequence[];
  expandedRows: Set<number>;
  toggleRow: (id: number) => void;
  onImport: (data: any) => void;
  onMove: (point: TeachPoint, action?: "approach" | "leave") => void;
  onEdit: (point: TeachPoint) => void;
  onDelete: (point: TeachPoint) => void;
  onAdd: () => void;
  onTeach: (point: TeachPoint) => void;
  isConnected: boolean;
  bgColor: string;
  bgColorAlpha: string;
  searchTerm?: string;
}

export interface MotionProfilesPanelProps {
  profiles: MotionProfile[];
  onEdit: (profile: MotionProfile) => void;
  onRegister: (profile: MotionProfile) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
  bgColor: string;
  bgColorAlpha: string;
  defaultProfileId: number | null;
  onSetDefault: (id: number | null) => void;
}

export interface GripParametersPanelProps {
  params: GripParams[];
  onEdit: (params: GripParams) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
  bgColor: string;
  bgColorAlpha: string;
  defaultParamsId: number | null;
  onSetDefault: (id: number | null) => void;
  onInlineEdit: (params: GripParams) => void;
}
