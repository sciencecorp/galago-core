import moment from "moment";
import { RunQueue, RunCommand, GroupedCommand } from "@/types";
import { Protocols } from "@/server/protocols";
import { DatabaseProtocol } from "@/protocols/database_protocol";

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

  // Try to find protocol in TypeScript protocols first
  let protocolName = runInfo.run_type;
  const tsProtocol = Protocols.find((p) => p.protocolId === runInfo.run_type);
  if (tsProtocol) {
    protocolName = tsProtocol.name;
  } else {
    // If not found in TypeScript protocols, try to load from database
    try {
      const dbProtocol = await DatabaseProtocol.loadFromDatabase(runInfo.run_type);
      if (dbProtocol) {
        protocolName = dbProtocol.name;
      }
    } catch (error) {
      console.warn("Failed to load protocol name:", error);
      // Fallback to using run_type if protocol not found
    }
  }

  let runName = protocolName;
  if (runInfo.params.wellPlateID !== undefined) {
    runName = `WP-${runInfo.params.wellPlateID} | ${runName}`;
  }
  if (runInfo.params.culturePlateType !== undefined) {
    runName += ` | ${runInfo.params.culturePlateType}`;
  }

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

export function calculateRunTimes(
  runAttributes: any,
  currentTime: moment.Moment,
  runCommands: RunCommand[] = [],
) {
  let runStart = moment(runAttributes.createdAt);
  let runEnd: moment.Moment;
  let isActive = false;

  // Check if all commands are completed
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

export function groupCommandsByRun(commands: RunCommand[]): GroupedCommand[] {
  const groupedCommands: GroupedCommand[] = [];
  const runIds: string[] = [];

  commands.forEach((command) => {
    if (!runIds.includes(command.runId)) {
      runIds.push(command.runId);
      groupedCommands.push({
        Id: command.runId,
        Commands: [],
      });
    }
    groupedCommands[runIds.indexOf(command.runId)].Commands.push(command);
  });

  return groupedCommands;
}

export function calculateRunCompletion(commands: RunCommand[]): number {
  if (!commands.length) return 0;

  const completedCommands = commands.filter(
    (cmd) => cmd.status === "COMPLETED" || cmd.status === "FAILED",
  ).length;

  return (completedCommands / commands.length) * 100;
}
