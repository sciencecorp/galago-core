import { TeachPoint, MotionProfile, GripParams, Sequence } from "../types";

export interface TeachPendantExport {
  version: string;
  timestamp: string;
  data: {
    teachPoints: TeachPoint[];
    motionProfiles: MotionProfile[];
    gripParams: GripParams[];
    sequences: Sequence[];
  };
}

export const exportTeachPendantData = (
  teachPoints: TeachPoint[],
  motionProfiles: MotionProfile[],
  gripParams: GripParams[],
  sequences: Sequence[],
): TeachPendantExport => {
  return {
    version: "1.0",
    timestamp: new Date().toISOString(),
    data: {
      teachPoints,
      motionProfiles,
      gripParams,
      sequences,
    },
  };
};

export const validateImportedData = (data: any): data is TeachPendantExport => {
  return (
    data &&
    typeof data === "object" &&
    typeof data.version === "string" &&
    typeof data.timestamp === "string" &&
    data.data &&
    Array.isArray(data.data.teachPoints) &&
    Array.isArray(data.data.motionProfiles) &&
    Array.isArray(data.data.gripParams) &&
    Array.isArray(data.data.sequences) &&
    // Validate teach points
    data.data.teachPoints.every(
      (point: any) =>
        typeof point.name === "string" &&
        typeof point.coordinates === "string" &&
        (point.type === "nest" || point.type === "location") &&
        point.locType === "j",
    ) &&
    // Validate motion profiles
    data.data.motionProfiles.every(
      (profile: any) =>
        typeof profile.name === "string" &&
        typeof profile.profile_id === "number" &&
        profile.profile_id >= 1 &&
        profile.profile_id <= 14 &&
        typeof profile.speed === "number" &&
        typeof profile.speed2 === "number" &&
        typeof profile.acceleration === "number" &&
        typeof profile.deceleration === "number" &&
        typeof profile.accel_ramp === "number" &&
        typeof profile.decel_ramp === "number" &&
        typeof profile.inrange === "number" &&
        typeof profile.straight === "number",
    ) &&
    // Validate grip params
    data.data.gripParams.every(
      (params: any) =>
        typeof params.name === "string" &&
        typeof params.width === "number" &&
        typeof params.speed === "number" &&
        typeof params.force === "number",
    ) &&
    // Validate sequences
    data.data.sequences.every(
      (sequence: any) =>
        typeof sequence.name === "string" &&
        Array.isArray(sequence.commands) &&
        sequence.commands.every(
          (cmd: any) => typeof cmd.command === "string" && typeof cmd.params === "object",
        ),
    )
  );
};

export const downloadJson = (data: any, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
