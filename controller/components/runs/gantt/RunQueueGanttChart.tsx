import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  Tooltip,
  Flex,
  Spinner,
  Image,
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import moment from "moment";
import {
  getRunAttributes,
  calculateRunTimes,
  groupCommandsByRun,
  calculateRunCompletion,
} from "@/utils/runUtils";
import { TimelineControls } from "./TimelineControls";
import "@/styles/Home.module.css";
import { useColorModeValue } from "@chakra-ui/react";
import { ToolType } from "gen-interfaces/controller";
import { RunCommand } from "@/types";
import { PiToolbox } from "react-icons/pi";

interface GanttChartProps {
  onRunClick: (runId: string) => void;
  selectedRunId: string | null;
}

enum TimeScale {
  SECONDS = "seconds",
  MINUTES = "minutes",
  HOURS = "hours",
}

const RunQueueGanttChart: React.FC<GanttChartProps> = ({ onRunClick, selectedRunId }) => {
  const [currentTime, setCurrentTime] = useState(moment());
  const [startTime, setStartTime] = useState(moment());
  const [endTime, setEndTime] = useState(moment().add(2, "hours"));
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [timeScale, setTimeScale] = useState<TimeScale>(TimeScale.MINUTES);

  const commandsAll = trpc.commandQueue.getAll.useQuery(undefined, { refetchInterval: 1000 });
  const runsQuery = trpc.commandQueue.getAllRuns.useQuery(undefined, { refetchInterval: 1000 });
  const toolInfoQuery = trpc.tool.getAll.useQuery();

  const borderColor = useColorModeValue("gray.300", "gray.700");
  const borderColorAlpha = useColorModeValue("gray.300", "gray.600");
  const mainBgColor = useColorModeValue("white", "gray.800");
  const toolLabelsBgColor = useColorModeValue("gray.50", "gray.900");
  const toolLabelHoverBg = useColorModeValue("gray.100", "gray.700");
  const toolIconBg = useColorModeValue("white", "gray.800");
  const commandBorderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment());
    }, 100);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isAutoScrolling || !commandsAll.data || commandsAll.data.length === 0) return;

    const allCommands = commandsAll.data;
    const firstCommandTime = moment(allCommands[0].createdAt);
    const lastCommandTime = allCommands.reduce((latest, cmd) => {
      const cmdEndTime = moment(
        cmd.completedAt || moment(cmd.createdAt).add(cmd.estimatedDuration || 600, "seconds"),
      );
      return cmdEndTime.isAfter(latest) ? cmdEndTime : latest;
    }, firstCommandTime);

    const allCompleted = allCommands.every((cmd) => cmd.status === "COMPLETED");

    if (allCompleted) {
      setStartTime(firstCommandTime.subtract(15, "minutes"));
      setEndTime(lastCommandTime.add(15, "minutes"));
    } else {
      setStartTime(firstCommandTime);
      setEndTime(lastCommandTime.add(1, "hour"));
    }
  }, [commandsAll.data, isAutoScrolling]);

  if (!commandsAll.data || !runsQuery.data) {
    return (
      <Box width="100%" height="400px" display="flex" justifyContent="center" alignItems="center">
        <Spinner />
      </Box>
    );
  }

  const totalDuration = endTime.diff(startTime, "seconds");
  const timeIntervals = 12;

  const getTimeFormat = (scale: TimeScale) => {
    switch (scale) {
      case TimeScale.SECONDS:
        return "mm:ss";
      case TimeScale.HOURS:
        return "HH:mm";
      default:
        return "h:mm A";
    }
  };

  const getIntervalDuration = (scale: TimeScale) => {
    switch (scale) {
      case TimeScale.SECONDS:
        return moment.duration(5, "seconds");
      case TimeScale.HOURS:
        return moment.duration(1, "hour");
      default:
        return moment.duration(5, "minutes");
    }
  };

  const handleTimeWindowChange = (newStart: moment.Moment, newEnd: moment.Moment) => {
    setIsAutoScrolling(false);
    setStartTime(newStart);
    setEndTime(newEnd);
  };

  const resetToAutoScroll = () => {
    setIsAutoScrolling(true);
  };

  const handleZoomChange = (newScale: TimeScale) => {
    setTimeScale(newScale);
    const intervalDuration = getIntervalDuration(newScale).asSeconds();
    const totalWindowDuration = intervalDuration * 12;
    const halfWindow = totalWindowDuration / 2;

    setStartTime(moment().subtract(halfWindow, "seconds"));
    setEndTime(moment().add(halfWindow, "seconds"));
    setIsAutoScrolling(false);
  };

  const renderGridLines = () => {
    const lines = [];
    for (let i = 1; i <= timeIntervals; i++) {
      const left = `${(i / timeIntervals) * 100}%`;
      lines.push(
        <Box
          key={i}
          position="absolute"
          left={left}
          top={0}
          bottom={0}
          width="1px"
          borderLeft="1px dashed"
          borderColor={borderColorAlpha}
          zIndex={1}
        />,
      );
    }
    return lines;
  };

  const getToolColor = (toolType: ToolType): string => {
    const colors: Record<string, string> = {
      pf400: "#4299E1",
      cytation: "#48BB78",
      liconic: "#F6AD55",
      opentrons2: "#9F7AEA",
      toolbox: "#FC8181",
    };
    return colors[toolType.toLowerCase()] || "#CBD5E0";
  };

  const renderCommands = () => {
    if (!commandsAll.data) return null;

    // Sort commands by queueId to maintain execution order
    const sortedCommands = [...commandsAll.data].sort(
      (a, b) => (a.queueId || 0) - (b.queueId || 0),
    );

    // Group commands by tool type
    const commandsByTool = sortedCommands.reduce(
      (acc, cmd) => {
        const toolType = cmd.commandInfo.toolType;
        if (!acc[toolType]) {
          acc[toolType] = [];
        }
        acc[toolType].push(cmd);
        return acc;
      },
      {} as Record<string, RunCommand[]>,
    );

    const toolTypes = Object.keys(commandsByTool);
    const rowHeight = 60;
    const blockHeight = 45; // Reduced block height to allow for padding
    const verticalPadding = 0; // Calculate padding to center block

    // Calculate start times based on previous commands
    let lastEndTime = moment(0);

    return sortedCommands
      .map((command) => {
        const toolType = command.commandInfo.toolType;
        const toolIndex = toolTypes.indexOf(toolType);

        // Calculate start and end times
        const startMoment = moment.max(moment(command.createdAt), lastEndTime);
        const endMoment = moment(
          command.completedAt ||
            startMoment.clone().add(command.estimatedDuration || 600, "seconds"),
        );
        lastEndTime = endMoment.clone().add(2, "seconds"); // Add 2 second gap between blocks

        // Skip if outside visible window
        if (endMoment.isBefore(startTime) || startMoment.isAfter(endTime)) {
          return null;
        }

        const visibleStartTime = moment.max(startMoment, startTime);
        const visibleEndTime = moment.min(endMoment, endTime);
        const left = `${(visibleStartTime.diff(startTime, "seconds") / totalDuration) * 100}%`;
        const width = `${(visibleEndTime.diff(visibleStartTime, "seconds") / totalDuration) * 100}%`;
        const isSelected = selectedRunId === command.runId;
        const bgColor = getToolColor(command.commandInfo.toolType as ToolType);

        return (
          <Tooltip
            key={command.queueId}
            label={`Tool: ${command.commandInfo.toolType} | Command:${command.commandInfo.command} | Status: ${command.status}`}>
            <Box
              position="absolute"
              height={`${blockHeight}px`}
              top={`${toolIndex * rowHeight + verticalPadding}px`}
              left={left}
              width={`calc(${width} - 4px)`}
              marginLeft="2px"
              onClick={() => onRunClick(command.runId)}
              cursor="pointer"
              border="1px solid"
              borderColor={commandBorderColor}
              borderRadius="md"
              bg={bgColor}
              opacity={command.status === "COMPLETED" ? 0.7 : isSelected ? 1 : 0.9}
              _hover={{ opacity: 1, transform: "translateY(-1px)" }}
              transition="all 0.2s"
              zIndex={2}
              boxShadow={isSelected ? "md" : "none"}>
              <Text
                position="absolute"
                left="5px"
                top="50%"
                transform="translateY(-50%)"
                fontSize="md"
                fontWeight="bold"
                letterSpacing="wide"
                color="white"
                isTruncated
                maxWidth="90%">
                {command.commandInfo.command
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(" ")}
              </Text>
            </Box>
          </Tooltip>
        );
      })
      .filter(Boolean);
  };

  const renderToolLabels = () => {
    if (!commandsAll.data) return null;

    const toolTypes = Array.from(new Set(commandsAll.data.map((cmd) => cmd.commandInfo.toolType)));
    const rowHeight = 60;

    if (toolInfoQuery.isLoading) return null;

    return (
      <Box
        position="absolute"
        left="0"
        top="0"
        width="200px"
        height="100%"
        borderRight="1px solid"
        borderColor={borderColor}
        bg={toolLabelsBgColor}>
        {toolTypes.map((toolType, index) => {
          const toolInfo = toolInfoQuery.data?.find((t) => t.type === toolType);
          const imageUrl = toolInfo?.image_url;
          const isToolbox = toolType.toLowerCase() === "toolbox";

          return (
            <Box
              key={toolType}
              position="absolute"
              top={`${index * rowHeight}px`}
              left="0"
              width="100%"
              height={`${rowHeight}px`}
              padding="10px"
              borderBottom="1px solid"
              borderColor={borderColor}
              display="flex"
              alignItems="center"
              gap="3"
              _hover={{ bg: toolLabelHoverBg }}
              transition="background 0.2s">
              <Flex
                width="40px"
                height="40px"
                bg={toolIconBg}
                borderRadius="md"
                justifyContent="center"
                alignItems="center"
                boxShadow="sm">
                {isToolbox ? (
                  <Box width="30px" height="30px" color={getToolColor("toolbox" as ToolType)}>
                    <PiToolbox style={{ width: "100%", height: "100%" }} />
                  </Box>
                ) : imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={toolType}
                    width="30px"
                    height="30px"
                    objectFit="contain"
                  />
                ) : (
                  <Box
                    width="30px"
                    height="30px"
                    bg={getToolColor(toolType as ToolType)}
                    borderRadius="md"
                  />
                )}
              </Flex>
              <VStack align="start" spacing="0" flex="1">
                <Text fontSize="md" fontWeight="bold" isTruncated>
                  {toolType}
                </Text>
                <Text fontSize="xs" color="gray.500" isTruncated>
                  {toolInfo?.description || "Tool"}
                </Text>
              </VStack>
            </Box>
          );
        })}
      </Box>
    );
  };

  const currentTimePosition = (() => {
    const totalDuration = endTime.diff(startTime, "seconds");
    const currentDuration = currentTime.diff(startTime, "seconds");
    return (currentDuration / totalDuration) * 100;
  })();

  const CurrentTimeLine = ({ position }: { position: number }) => (
    <Box
      position="absolute"
      left={`${position}%`}
      top="0"
      bottom="0"
      width="2px"
      bg="red.500"
      opacity={0.8}
      zIndex={4}
      pointerEvents="none"
      transition="left 0.1s linear"
      mt="10px"
      _before={{
        content: '""',
        position: "absolute",
        top: "-8px",
        left: "-5px",
        width: "12px",
        height: "12px",
        borderRadius: "50%",
        backgroundColor: "red.500",
        boxShadow: "0 0 0 2px white",
        transition: "left 0.1s linear",
        zIndex: 10,
      }}
    />
  );

  const toolTypes = commandsAll.data
    ? Array.from(new Set(commandsAll.data.map((cmd) => cmd.commandInfo.toolType)))
    : [];
  const totalHeight = toolTypes.length * 60;

  return (
    <Box width="100%" p={4}>
      <VStack spacing={4} align="stretch">
        <TimelineControls
          onTimeWindowChange={handleTimeWindowChange}
          startTime={startTime}
          endTime={endTime}
          timeScale={timeScale}
          onZoomChange={handleZoomChange}
        />
        <Box position="relative" height="400px">
          <Box
            position="relative"
            height="100%"
            marginLeft="200px"
            overflowY="auto"
            overflowX="hidden"
            bg={mainBgColor}
            border="1px solid"
            borderColor={borderColor}>
            <Box position="relative" minHeight="100%" height={`${totalHeight}px`} pt="10px">
              {renderGridLines()}
              <Box position="relative" zIndex={2}>
                {renderCommands()}
              </Box>
              <CurrentTimeLine position={currentTimePosition} />
            </Box>
          </Box>
          {renderToolLabels()}
        </Box>
      </VStack>
    </Box>
  );
};

export default RunQueueGanttChart;
