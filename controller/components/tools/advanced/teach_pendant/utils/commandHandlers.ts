import { useToast } from "@chakra-ui/react";
import { TeachPoint, MotionProfile, GripParams } from "../components/types";
import { ToolCommandInfo } from "@/types";
import { ToolType } from "gen-interfaces/controller";

export const useCommandHandlers = (config: { name: string; type: string }) => {
  const toast = useToast();

  const handleJog = async (
    commandMutation: any,
    jogAxis: string,
    jogDistance: number
  ) => {
    if (!jogAxis || jogDistance === 0) {
      toast({
        title: "Jog Error",
        description: "Please select an axis and enter a distance",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const jogCommand: ToolCommandInfo = {
      toolId: config.name,
      toolType: config.type as ToolType,
      command: "jog",
      params: {
        axis: jogAxis,
        distance: jogDistance,
      },
    };

    try {
      await commandMutation.mutateAsync(jogCommand);
      toast({
        title: "Jog Successful",
        description: `Jogged ${jogAxis} axis by ${jogDistance}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error jogging:", error);
      toast({
        title: "Jog Error",
        description: "Failed to jog",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleMoveCommand = async (
    commandMutation: any,
    point: TeachPoint,
    profile: MotionProfile,
    action?: 'approach' | 'leave'
  ) => {
    let command: ToolCommandInfo;
    
    if (point.type === 'nest' && action) {
      command = {
        toolId: config.name,
        toolType: config.type as ToolType,
        command: action === 'approach' ? 'approach' : 'leave',
        params: {
          nest_id: point.id,
          motion_profile_id: profile.profile_id,
        },
      };
    } else {
      command = {
        toolId: config.name,
        toolType: config.type as ToolType,
        command: "move",
        params: {
          waypoint: point.coordinate,
          motion_profile_id: profile.profile_id,
        },
      };
    }

    try {
      await commandMutation.mutateAsync(command);
      toast({
        title: "Move Successful",
        description: action 
          ? `${action === 'approach' ? 'Approached' : 'Left'} nest ${point.name} with profile ${profile.name}`
          : `Moved to ${point.name} with profile ${profile.name}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error moving to location:", error);
      toast({
        title: "Move Error",
        description: `Failed to ${action || 'move to'} ${point.name}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleGripperCommand = async (
    commandMutation: any,
    action: "open" | "close",
    params: {
      width: number;
      speed: number;
      force: number;
    }
  ) => {
    const gripperCommand: ToolCommandInfo = {
      toolId: config.name,
      toolType: config.type as ToolType,
      command: action === "open" ? "release_plate" : "grasp_plate",
      params: {
        width: Number(params.width),
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
    commandMutation: any,
    command: "free" | "unfree" | "unwind"
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
    commandMutation: any,
    profile: MotionProfile
  ) => {
    try {
      await commandMutation.mutateAsync({
        toolId: config.name,
        toolType: config.type as ToolType,
        command: "load_waypoints",
        params: {
          waypoints: [{
            motion_profile: {
              id: profile.profile_id,
              profile_id: profile.profile_id,
              speed: profile.speed,
              speed2: profile.speed2,
              acceleration: profile.acceleration,
              deceleration: profile.deceleration,
              accel_ramp: profile.accel_ramp || 0,
              decel_ramp: profile.decel_ramp || 0,
              inrange: profile.inrange || 0,
              straight: profile.straight || false
            }
          }]
        },
      });
      toast({
        title: "Success",
        description: `Motion profile ${profile.name} registered with robot`,
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

  const handleRunSequence = async (
    commandMutation: any,
    sequence: any
  ) => {
    const command: ToolCommandInfo = {
      toolId: config.name,
      toolType: config.type as ToolType,
      command: "run_sequence",
      params: {
        sequence_id: sequence.id,
      },
    };

    try {
      await commandMutation.mutateAsync(command);
      toast({
        title: "Success",
        description: `Running sequence ${sequence.name}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error running sequence:", error);
      toast({
        title: "Error",
        description: "Failed to run sequence",
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
    handleRunSequence,
  };
}; 