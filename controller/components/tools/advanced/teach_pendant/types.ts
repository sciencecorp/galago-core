import { Tool } from "@/types/api";
import { ToolConfig } from "gen-interfaces/controller";

export interface TeachPendantProps {
  toolId: string | undefined;
  config: Tool;
}

export type TeachPoint = {
  id: number;
  name: string;
  coordinate: string;
  type: "nest" | "location";
  locType: "j";
  orientation?: "portrait" | "landscape";
  safe_loc?: number;
};

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
  id: number;
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
