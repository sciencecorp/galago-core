import { TeachPoint, MotionProfile, GripParams } from "../../types/";
import { ToolCommandInfo } from "@/types";
import { ToolType } from "gen-interfaces/controller";
import { UseMutationResult } from "@tanstack/react-query";
import { Tool } from "@/types/api";
import { coordinateToJoints } from "./robotArmUtils";
import { successToast, errorToast } from "@/components/ui/Toast";
import { createBatchHandler } from "./batchUtils";
import { validateMotionProfileExists, validateGripParamsExists } from "./commandValidation";

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
    motion_profile_id: number,
    silent: boolean = false,
    motionProfiles: MotionProfile[] = [],
  ) => {
    // Validate that motion profiles exist
    if (!validateMotionProfileExists(motionProfiles)) {
      return;
    }

    const command = "move";
    const params = {
      name,
      motion_profile_id,
    };

    mutation.mutate({
      toolId: config.name,
      toolType: config.type,
      command,
      params,
    });
  };

  /**
   * Moves robot to multiple teach points in batch
   * @param commandMutation The command mutation to use
   * @param points Array of teach points to move to
   * @param motion_profile_id Motion profile ID to use
   * @returns Object containing success and error counts
   */
  const handleBatchMoveCommand = async (
    commandMutation: UseMutationResult<any, unknown, ToolCommandInfo>,
    points: TeachPoint[],
    motion_profile_id: number,
    motionProfiles: MotionProfile[] = [],
  ) => {
    // Validate that motion profiles exist
    if (!validateMotionProfileExists(motionProfiles, "batch move")) {
      return { successCount: 0, errorCount: 0 };
    }

    const moveToPoint = async (point: TeachPoint) => {
      await commandMutation.mutateAsync({
        toolId: config.name,
        toolType: config.type as ToolType,
        command: "move",
        params: {
          name: point.name,
          motion_profile_id,
        },
      });
    };

    const batchMovePoints = createBatchHandler(moveToPoint, "move", "teach points");

    return await batchMovePoints(points);
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

  /**
   * Executes gripper commands on multiple grip parameters in batch
   * @param commandMutation The command mutation to use
   * @param action Open or close action
   * @param paramsArray Array of grip parameters to use
   * @returns Object containing success and error counts
   */
  const handleBatchGripperCommand = async (
    commandMutation: UseMutationResult<any, unknown, ToolCommandInfo>,
    action: "open" | "close",
    paramsArray: GripParams[],
    allGripParams: GripParams[] = [],
  ) => {
    // Validate that grip parameters exist
    if (!validateGripParamsExists(allGripParams, action)) {
      return { successCount: 0, errorCount: 0 };
    }

    const executeGripperCommand = async (params: GripParams) => {
      await handleGripperCommand(commandMutation, action, params, true);
    };

    const batchGripperCommands = createBatchHandler(executeGripperCommand, action, "grip commands");

    return await batchGripperCommands(paramsArray);
  };

  const handleSimpleCommand = async (
    commandMutation: UseMutationResult<any, unknown, ToolCommandInfo>,
    command: "release" | "engage" | "unwind",
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

  const handleRegisterMotionProfile = async (
    commandMutation: UseMutationResult<any, any, any>,
    profile: RobotMotionProfile,
    silent: boolean = false,
  ) => {
    try {
      await commandMutation.mutateAsync({
        toolId: config.name,
        toolType: config.type as ToolType,
        command: "register_motion_profile",
        params: {
          id: profile.id,
          profile_id: profile.id,
          speed: profile.speed,
          speed2: profile.speed2,
          acceleration: profile.acceleration,
          deceleration: profile.deceleration,
          accel_ramp: profile.accel_ramp || 0,
          decel_ramp: profile.decel_ramp || 0,
          inrange: profile.inrange || 0,
          straight: profile.straight || false,
        },
      });
      if (!silent) {
        successToast("Success", `Motion profile ${profile.id} registered with robot`);
      }
    } catch (error) {
      if (!silent) {
        errorToast("Error", "Failed to register motion profile");
      }
      throw error;
    }
  };

  /**
   * Registers multiple motion profiles with the robot in batch
   * @param commandMutation The command mutation to use
   * @param profiles Array of motion profiles to register
   * @returns Object containing success and error counts
   */
  const handleBatchRegisterMotionProfile = async (
    commandMutation: UseMutationResult<any, any, any>,
    profiles: RobotMotionProfile[],
  ) => {
    const registerProfile = async (profile: RobotMotionProfile) => {
      await handleRegisterMotionProfile(commandMutation, profile, true);
    };

    const batchRegisterProfiles = createBatchHandler(
      registerProfile,
      "register",
      "motion profiles",
    );

    return await batchRegisterProfiles(profiles);
  };

  return {
    handleJog,
    handleMoveCommand,
    handleGripperCommand,
    handleSimpleCommand,
    handleRegisterMotionProfile,
    // Add batch handlers
    handleBatchMoveCommand,
    handleBatchGripperCommand,
    handleBatchRegisterMotionProfile,
  };
}
