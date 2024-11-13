import moment from 'moment';
import { RunQueue, RunCommand, GroupedCommand } from '@/types';

export function getRunAttributes(runInfo: any, commandInfo: any): {
  runId: string;
  runName: string;
  commandsCount: number;
  params: any;
  status: string;
  createdAt: string;
  completedAt: string;
  startedAt: string;
} {
  if (!runInfo) {
    return {
      runId: '',
      runName: '',
      commandsCount: 0,
      params: {},
      status: 'UNKNOWN',
      createdAt: '',
      completedAt: '',
      startedAt: ''
    };
  }

  let runName = runInfo.run_type.replaceAll("_", " ").toUpperCase();
  if (runInfo.params.wellPlateID !== undefined) {
    runName = `WP-${runInfo.params.wellPlateID} | ${runName}`;
  }
  if (runInfo.params.culturePlateType !== undefined) {
    runName += ` | ${runInfo.params.culturePlateType}`;
  }

  let status = 'CREATED';
  let startedAt = '';
  let completedAt = '';
  let createdAt = '';

  if (commandInfo) {
    const commandStatuses = Object.values(commandInfo).map((cmd: any) => cmd.status);
    createdAt = commandInfo[Object.keys(commandInfo)[0]]?.createdAt;
    if (commandStatuses.every(status => status === 'COMPLETED')) {
      status = 'COMPLETED';
      completedAt = commandInfo[Object.keys(commandInfo)[commandStatuses.length - 1]]?.completedAt || '';
    } else if (commandStatuses.some(status => status === 'FAILED')) {
      status = 'FAILED';
    } else if (commandInfo[Object.keys(commandInfo)[0]]?.startedAt) {
      status = 'STARTED';
      startedAt = commandInfo[Object.keys(commandInfo)[0]]?.startedAt;
    } else if (commandStatuses.every(status => status === 'CREATED')) {
      status = 'QUEUED';
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
    startedAt
  };
}

export function calculateRunTimes(runAttributes: any, currentTime: moment.Moment) {
  let runStart = moment(runAttributes.createdAt); 
  let runEnd: moment.Moment;
  let isActive = false;

  if (runAttributes.status === "COMPLETED") {
    runEnd = moment(runAttributes.completedAt);
  } else if (runAttributes.status === "STARTED") {
    isActive = true;
    runStart = moment(runAttributes.startedAt);
    runEnd = currentTime.clone().add(10, 'minutes');
  } else if (runAttributes.status === "CREATED") {
    runEnd = runStart.clone().add(10, 'minutes');
  } else if (runAttributes.status === "FAILED") {
    runEnd = runStart.clone().add(1, 'minutes');
  } else if (runAttributes.status === "QUEUED") {
    runStart = currentTime;
    runEnd = runStart.clone().add(10, 'minutes');
  } else {
    runEnd = runStart.clone().add(1, 'minutes');
  }

  const expectedDuration = runEnd.diff(runStart, 'seconds');
  return { runStart, runEnd, expectedDuration, isActive };
}

export function groupCommandsByRun(commands: RunCommand[]): GroupedCommand[] {
  const groupedCommands: GroupedCommand[] = [];
  const runIds: string[] = [];

  commands.forEach(command => {
    if (!runIds.includes(command.runId)) {
      runIds.push(command.runId);
      groupedCommands.push({
        Id: command.runId,
        Commands: []
      });
    }
    groupedCommands[runIds.indexOf(command.runId)].Commands.push(command);
  });

  return groupedCommands;
}

export function calculateRunCompletion(commands: RunCommand[]): number {
  if (!commands.length) return 0;
  
  const completedCommands = commands.filter(
    cmd => cmd.status === "COMPLETED" || cmd.status === "FAILED"
  ).length;
  
  return (completedCommands / commands.length) * 100;
}
