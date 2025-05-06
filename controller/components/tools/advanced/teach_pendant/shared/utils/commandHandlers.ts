import { TeachPoint, MotionProfile, GripParams } from "../../types/";
import { ToolCommandInfo } from "@/types";
import { ToolType } from "gen-interfaces/controller";
import { UseMutationResult } from "@tanstack/react-query";
import { Tool } from "@/types/api";
import { coordinateToJoints } from "./robotArmUtils";
import { successToast, errorToast } from "@/components/ui/Toast";
import { createBatchHandler } from "./batchUtils";
import { validateMotionProfileExists, validateGripParamsExists } from "./commandValidation";
import { motion } from "framer-motion";

// Add a new interface for the robot motion profile format
interface RobotMotionProfile {
  id: number;
  speed: number;
  speed2: number;
  acceleration: number;
  deceleration: number;
  accel_ramp: number;
  decel_ramp: number;
  inrange: number;
  straight: number;
}

export function useCommandHandlers(config: Tool) {
  const handleJog = (
    mutation: UseMutationResult<any, unknown, any, unknown>,
    axis: string,
    distance: number,
    motionProfiles: MotionProfile[] = [],
  ) => {
    // Validate that motion profiles exist
    if (!validateMotionProfileExists(motionProfiles, "jog")) {
      return;
    }

    mutation.mutate({
      toolId: config.name,
      toolType: config.type,
      command: "jog",
      params: {
        axis,
        distance,
      },
    });
  };

  const handleMoveCommand = (
    mutation: UseMutationResult<any, unknown, any, unknown>,
    name: string,
    motion_profile: string,
  ) => {
    const command = "move";
    const params = {
      name,
      motion_profile,
    };

    mutation.mutate({
      toolId: config.name,
      toolType: config.type,
      command,
      params,
    });
  };

  const handleGripperCommand = async (
    commandMutation: UseMutationResult<any, unknown, ToolCommandInfo>,
    action: "open" | "close",
    params: GripParams,
    silent: boolean = false,
    allGripParams: GripParams[] = [],
  ) => {
    // Validate that grip parameters exist
    if (!validateGripParamsExists(allGripParams, action)) {
      return;
    }

    const width = action === "open" ? params.width + 10 : params.width;
    const gripperCommand: ToolCommandInfo = {
      toolId: config.name,
      toolType: config.type as ToolType,
      command: action === "open" ? "release_plate" : "grasp_plate",
      params: {
        width: width,
        speed: Number(params.speed),
        force: Number(params.force),
      },
    };

    try {
      await commandMutation.mutateAsync(gripperCommand);
      if (!silent) {
        successToast("Success", `Gripper ${action} command executed`);
      }
    } catch (error) {
      console.error(`Error executing gripper ${action} command:`, error);
      if (!silent) {
        errorToast("Error", `Failed to ${action} gripper`);
      }
      throw error;
    }
  };

  const handleSimpleCommand = async (
    commandMutation: UseMutationResult<any, unknown, ToolCommandInfo>,
    command: "release" | "engage" | "retract",
    silent: boolean = false,
  ) => {
    const simpleCommand: ToolCommandInfo = {
      toolId: config.name,
      toolType: config.type as ToolType,
      command,
      params: {},
    };

    try {
      await commandMutation.mutateAsync(simpleCommand);
      if (!silent) {
        successToast("Success", `${command} command executed successfully`);
      }
    } catch (error) {
      console.error(`Error executing ${command} command:`, error);
      if (!silent) {
        errorToast("Error", `Failed to execute ${command} command`);
      }
      throw error;
    }
  };

  return {
    handleJog,
    handleMoveCommand,
    handleGripperCommand,
    handleSimpleCommand,
  };
}
