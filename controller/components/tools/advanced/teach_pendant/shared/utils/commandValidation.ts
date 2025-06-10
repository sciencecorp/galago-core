import { GripParams, MotionProfile, Sequence } from "../../types";
import { errorToast } from "@/components/ui/Toast";


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
