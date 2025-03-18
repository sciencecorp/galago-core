import { useToast } from "@chakra-ui/react";
import { TeachPoint, MotionProfile, GripParams } from "../components/types";
import { ToolCommandInfo } from "@/types";
import { ToolType } from "gen-interfaces/controller";
import { UseMutationResult } from "@tanstack/react-query";
import { Tool } from "@/types/api";
import { coordinateToJoints } from "../components/utils/robotArmUtils";

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
  const toast = useToast();

  const handleJog = (
    mutation: UseMutationResult<any, unknown, any, unknown>,
    axis: string,
    distance: number,
  ) => {
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
  ) => {
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

  const handleGripperCommand = async (
    commandMutation: UseMutationResult<any, unknown, ToolCommandInfo>,
    action: "open" | "close",
    params: GripParams,
  ) => {
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
      toast({
        title: "Success",
        description: `Gripper ${action} command executed`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error(`Error executing gripper ${action} command:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} gripper`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSimpleCommand = async (
    commandMutation: UseMutationResult<any, unknown, ToolCommandInfo>,
    command: "release" | "engage" | "retract",
  ) => {
    const simpleCommand: ToolCommandInfo = {
      toolId: config.name,
      toolType: config.type as ToolType,
      command,
      params: {},
    };

    try {
      await commandMutation.mutateAsync(simpleCommand);
      toast({
        title: "Success",
        description: `${command} command executed successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error(`Error executing ${command} command:`, error);
      toast({
        title: "Error",
        description: `Failed to execute ${command} command`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRegisterMotionProfile = async (
    commandMutation: UseMutationResult<any, any, any>,
    profile: RobotMotionProfile,
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
      toast({
        title: "Success",
        description: `Motion profile ${profile.id} registered with robot`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register motion profile",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return {
    handleJog,
    handleMoveCommand,
    handleGripperCommand,
    handleSimpleCommand,
    handleRegisterMotionProfile,
  };
}
