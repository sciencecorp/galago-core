import { RunCommand, GroupedCommand } from "@/types";

export function getRunAttributes(runInfo: any, commandInfo: any) {
  if (!runInfo) {
    return {
      runId: "",
      runName: runInfo?.run_type || "Unknown Run",
      commandsCount: 0,
      params: {},
      status: "UNKNOWN",
      createdAt: "",
      completedAt: "",
      startedAt: "",
    };
  }

  // Use run_type as the name (it's the protocol ID)
  let runName = runInfo.run_type || "Unknown Run";

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
    } else if (commandInfo.some((cmd: any) => cmd.status === "FAILED")) {
      status = "FAILED";
    } else if (commandInfo.some((cmd: any) => cmd.status === "STARTED")) {
      status = "STARTED";
      startedAt = commandInfo.find((cmd: any) => cmd.status === "STARTED")?.startedAt || "";
    } else if (commandInfo.every((cmd: any) => cmd.status === "CREATED")) {
      status = "QUEUED";
    } else if (
      lastCommand?.status === "SKIPPED" &&
      !commandInfo.some((cmd: any) => cmd.status === "CREATED") &&
      !commandInfo.some((cmd: any) => cmd.status === "STARTED")
    ) {
      status = "COMPLETED";
      completedAt = lastCommand.completedAt || "";
    }
  }

  return {
    runId: runInfo.id,
    runName,
    commandsCount: runInfo.commands_count || 0,
    params: runInfo.params || {},
    status,
    createdAt,
    completedAt,
    startedAt,
  };
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
