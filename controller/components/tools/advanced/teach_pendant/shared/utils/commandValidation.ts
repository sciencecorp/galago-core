import { useToast } from "@chakra-ui/react";
import { GripParams, MotionProfile, Sequence } from "../../types";
import { errorToast } from "@/components/ui/Toast";

/**
 * Utility functions to validate if prerequisites exist before executing commands
 */

/**
 * Check if motion profiles exist before allowing move or jog commands
 * @param motionProfiles Array of motion profiles
 * @param commandName Name of the command being validated
 * @returns Boolean indicating if operation can proceed
 */
export const validateMotionProfileExists = (
  motionProfiles: MotionProfile[],
  commandName: string = "move",
): boolean => {
  if (!motionProfiles || motionProfiles.length === 0) {
    errorToast(
      "No Motion Profiles",
      `Cannot ${commandName} robot without a motion profile. Please create a motion profile first.`,
    );
    return false;
  }
  return true;
};

/**
 * Check if grip parameters exist before allowing gripper commands
 * @param gripParams Array of grip parameters
 * @param actionType Open or close action
 * @returns Boolean indicating if operation can proceed
 */
export const validateGripParamsExists = (
  gripParams: GripParams[],
  actionType: "open" | "close" = "close",
): boolean => {
  if (!gripParams || gripParams.length === 0) {
    errorToast(
      "No Grip Parameters",
      `Cannot ${actionType} gripper without grip parameters. Please create grip parameters first.`,
    );
    return false;
  }
  return true;
};

/**
 * Check if sequences exist before allowing run sequence commands
 * @param sequences Array of sequences
 * @returns Boolean indicating if operation can proceed
 */
export const validateSequenceExists = (sequences: Sequence[]): boolean => {
  if (!sequences || sequences.length === 0) {
    errorToast(
      "No Sequences",
      "Cannot run sequence without any sequences defined. Please create a sequence first.",
    );
    return false;
  }
  return true;
};
