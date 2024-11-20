import React from "react";
import { Box, Text, Flex, Tooltip } from "@chakra-ui/react";
import { RunQueue, RunCommand } from "@/types";
import { getColorForInstrument } from "@/utils/colorUtils";
import { calculateTimelinePosition, calculateBlockWidth } from "@/components/utils/timelineUtils";
import moment from "moment";
interface RunBlockProps {
  run: RunQueue;
  index: number;
  startTime: moment.Moment;
  endTime: moment.Moment;
  totalDuration: number;
  isSelected: boolean;
  isActive: boolean;
  runAttributes: {
    runName: string;
    commandsCount: number;
  };
  visibleStart: moment.Moment;
  visibleEnd: moment.Moment;
  runCommands: RunCommand[];
  completion: number;
  onRunClick: (runId: string) => void;
}

const RunBlock: React.FC<RunBlockProps> = ({
  run,
  index,
  startTime,
  endTime,
  totalDuration,
  isSelected,
  isActive,
  runAttributes,
  visibleStart,
  visibleEnd,
  runCommands,
  completion,
  onRunClick,
}) => {
  const calculateOffset = () => {
    if (run.status === "COMPLETED" || run.status === "FAILED") {
      return 0;
    }

    const progress =
      ((runAttributes.commandsCount - runCommands.length) / runAttributes.commandsCount) * 100;
    const baseOffsetMultiplier = -1.6;

    if (isActive || moment(run.createdAt).isAfter(visibleStart)) {
      return progress * baseOffsetMultiplier;
    }

    return 0;
  };

  const left = calculateTimelinePosition(visibleStart, startTime, totalDuration);
  const width = calculateBlockWidth(visibleStart, visibleEnd, totalDuration);
  const offset = calculateOffset();

  // Group commands by instrument
  const instrumentGroups = runCommands.reduce(
    (acc, command) => {
      const instrumentId = command.commandInfo.toolType;
      if (!acc[instrumentId]) {
        acc[instrumentId] = [];
      }
      acc[instrumentId].push(command);
      return acc;
    },
    {} as Record<string, RunCommand[]>,
  );

  const totalCommands = runCommands.length;

  return (
    <Tooltip label={`${runAttributes.runName} | Commands: ${runAttributes.commandsCount}`}>
      <Box
        position="absolute"
        height="35px"
        top={`${index * 45}px`}
        left={left}
        width={width}
        onClick={() => onRunClick(run.id)}
        cursor="pointer"
        border={isSelected ? "2px solid blue" : "1px solid gray.300"}
        borderRadius="2px"
        overflow="hidden"
        className="run-block-transition"
        bg={isActive ? "blue.100" : "gray.300"}
        sx={{
          transition: `
            width 0.8s cubic-bezier(0.4, 0, 0.2, 1),
            left 0.8s cubic-bezier(0.4, 0, 0.2, 1),
            transform 0.8s cubic-bezier(0.4, 0, 0.2, 1),
            opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1),
            background-color 0.3s ease
          `,
        }}
        zIndex={run.status === "COMPLETED" || run.status === "FAILED" ? 1 : 3}
        opacity={run.status === "COMPLETED" || run.status === "FAILED" ? 0.7 : 1}
        style={{
          transform: `translateX(${offset}px)`,
        }}>
        {/* Instrument colors */}
        <Flex
          height="100%"
          transition="all 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
          position="relative"
          zIndex={1}>
          {Object.entries(instrumentGroups).map(([instrumentId, commands]) => {
            const instrumentWidth = `${(commands.length / totalCommands) * 100}%`;
            return (
              <Box
                key={instrumentId}
                width={instrumentWidth}
                height="100%"
                bg={getColorForInstrument(instrumentId)}
                transition="width 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
              />
            );
          })}
        </Flex>

        {/* Run name */}
        <Text
          position="absolute"
          left="5px"
          top="5px"
          fontSize="sm"
          color="white"
          isTruncated
          maxWidth="90%"
          transition="all 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
          zIndex={3}>
          {runAttributes.runName}
        </Text>
      </Box>
    </Tooltip>
  );
};

export default React.memo(RunBlock);
