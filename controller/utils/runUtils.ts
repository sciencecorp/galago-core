import moment from "moment";
import { RunQueue, RunCommand, GroupedCommand } from "@/types";
import { Protocols, findProtocol, getProtocolById } from "@/server/protocols";

// Helper function to load protocol name
async function getProtocolName(protocolId: string): Promise<string> {
  // Try to find in loaded protocols first
  const protocol = findProtocol(protocolId);
  if (protocol) {
    return protocol.name;
  }

  // If not found in cache, try to load from database
  try {
    const id = parseInt(protocolId);
    if (!isNaN(id)) {
      const dbProtocol = await getProtocolById(id);
      if (dbProtocol) {
        return dbProtocol.name;
      }
    }
  } catch (error) {
    console.warn("Failed to load protocol name:", error);
  }

  return protocolId;
}

export async function getRunAttributes(
  runInfo: any,
  commandInfo: any,
): Promise<{
  runId: string;
  runName: string;
  commandsCount: number;
  params: any;
  status: string;
  createdAt: string;
  completedAt: string;
  startedAt: string;
}> {
  if (!runInfo) {
    return {
      runId: "",
      runName: "",
      commandsCount: 0,
      params: {},
      status: "UNKNOWN",
      createdAt: "",
      completedAt: "",
      startedAt: "",
    };
  }

  // Get protocol name
  const protocolName = await getProtocolName(runInfo.run_type);
  const runName = protocolName;

  let status = "CREATED";
  let startedAt = "";
  let completedAt = "";
  let createdAt = "";

  if (commandInfo && Array.isArray(commandInfo)) {
    createdAt = commandInfo[0]?.createdAt || "";
    const lastCommand = commandInfo[commandInfo.length - 1];
    if (commandInfo.length > 0 && lastCommand?.status === "COMPLETED") {
      status = "COMPLETED";
      completedAt = lastCommand.completedAt || "";
    } else if (commandInfo.some((cmd) => cmd.status === "FAILED")) {
      status = "FAILED";
    } else if (commandInfo.some((cmd) => cmd.status === "STARTED")) {
      status = "STARTED";
      startedAt = commandInfo.find((cmd) => cmd.status === "STARTED")?.startedAt || "";
    } else if (commandInfo.every((cmd) => cmd.status === "CREATED")) {
      status = "QUEUED";
    } else if (
      lastCommand?.status === "SKIPPED" &&
      !commandInfo.some((cmd) => cmd.status === "CREATED") &&
      !commandInfo.some((cmd) => cmd.status === "STARTED")
    ) {
      status = "COMPLETED";
      completedAt = lastCommand.completedAt || "";
    }
  }

  return {
    runId: runInfo.id,
    runName,
    commandsCount: runInfo.commands_count,
    params: runInfo.params,
    status,
    createdAt,
    completedAt,
    startedAt,
  };
}

// ... rest of your functions remain the same
export function calculateRunTimes(
  runAttributes: any,
  currentTime: moment.Moment,
  runCommands: RunCommand[] = [],
) {
  let runStart = moment(runAttributes.createdAt);
  let runEnd: moment.Moment;
  let isActive = false;

  const isCompleted =
    runCommands.length > 0 && runCommands[runCommands.length - 1].status === "COMPLETED";

  if (isCompleted) {
    runEnd = moment(runCommands[runCommands.length - 1].completedAt);
  } else if (runAttributes.status === "STARTED") {
    isActive = true;
    runStart = moment(runAttributes.startedAt);
    runEnd = currentTime.clone().add(10, "minutes");
  } else if (runAttributes.status === "CREATED") {
    runEnd = runStart.clone().add(10, "minutes");
  } else if (runAttributes.status === "FAILED") {
    runEnd = runStart.clone().add(1, "minutes");
  } else if (runAttributes.status === "QUEUED") {
    runStart = currentTime;
    runEnd = runStart.clone().add(10, "minutes");
  } else {
    runEnd = runStart.clone().add(1, "minutes");
  }

  const expectedDuration = runEnd.diff(runStart, "seconds");
  return { runStart, runEnd, expectedDuration, isActive, isCompleted };
}

export function calculateRunCompletion(commands: RunCommand[]): number {
  if (!commands.length) return 0;

  const completedCommands = commands.filter(
    (cmd) => cmd.status === "COMPLETED" || cmd.status === "FAILED",
  ).length;

  return (completedCommands / commands.length) * 100;
}
