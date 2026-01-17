import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, VStack, Text, Tooltip, Flex, Spinner, Image } from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import moment from "moment";
import { TimelineControls } from "./TimelineControls";
import { CurrentTimeLine } from "./CurrentTimeLine";
import "@/styles/Home.module.css";
import { useColorModeValue } from "@chakra-ui/react";
import { ToolType } from "gen-interfaces/controller";
import { RunCommand } from "@/types";
import { ToolCase } from "lucide-react";
import { getToolColor } from "@/utils/colorUtils";

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
  const [startTime, setStartTime] = useState(moment().subtract(1, "minute"));
  const [endTime, setEndTime] = useState(moment().add(1, "hour").add(59, "minutes"));
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [timeScale, setTimeScale] = useState<TimeScale>(TimeScale.MINUTES);

  const commandsAll = trpc.commandQueue.getAll.useQuery(undefined, { refetchInterval: 1000 });
  const runsQuery = trpc.commandQueue.getAllRuns.useQuery(undefined, { refetchInterval: 1000 });
  const toolInfoQuery = trpc.tool.getAll.useQuery();

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const toolLabelsInnerRef = useRef<HTMLDivElement | null>(null);

  const LABEL_COLUMN_WIDTH_PX = 200;
  const ROW_HEIGHT_PX = 60;
  const BLOCK_HEIGHT_PX = 45;

  const borderColor = useColorModeValue("gray.300", "whiteAlpha.200");
  const gridLineColor = useColorModeValue("blackAlpha.200", "whiteAlpha.200");
  const mainBgColor = useColorModeValue("white", "surface.section");
  const toolLabelsBgColor = useColorModeValue("gray.50", "#15171c");
  const toolLabelHoverBg = useColorModeValue("gray.100", "surface.hover");
  const toolIconBg = useColorModeValue("white", "surface.panel");
  const commandBorderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const rowStripeA = useColorModeValue("blackAlpha.50", "whiteAlpha.50");
  const rowStripeB = useColorModeValue("transparent", "transparent");
  const selectedRingColor = useColorModeValue("teal.500", "teal.300");
  const commandTextShadow = useColorModeValue(
    "0 1px 2px rgba(0,0,0,0.35)",
    "0 1px 2px rgba(0,0,0,0.55)",
  );
  const commandCoolFilter = useColorModeValue(
    "saturate(1.05) brightness(0.98) hue-rotate(-10deg)",
    "saturate(1.05) brightness(0.82) contrast(1.05) hue-rotate(-8deg)",
  );
  const commandGloss = useColorModeValue(
    "linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 45%, rgba(0,0,0,0.08) 100%)",
    "linear-gradient(135deg, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0.24) 55%, rgba(255,255,255,0.03) 100%)",
  );

  const toolTypes = useMemo(
    () =>
      commandsAll.data
        ? Array.from(new Set(commandsAll.data.map((cmd) => cmd.commandInfo.toolType)))
        : [],
    [commandsAll.data],
  );

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

  useEffect(() => {
    const el = scrollContainerRef.current;
    const labelsInner = toolLabelsInnerRef.current;
    if (!el || !labelsInner) return;

    let rafId: number | null = null;
    const sync = () => {
      rafId = null;
      // Keep the left labels visually aligned with the scrolled rows.
      labelsInner.style.transform = `translateY(-${el.scrollTop}px)`;
    };

    const onScroll = () => {
      if (rafId != null) return;
      rafId = window.requestAnimationFrame(sync);
    };

    // Initial sync in case we render mid-scroll.
    sync();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (rafId != null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  if (!commandsAll.data || !runsQuery.data) {
    return (
      <Box width="100%" height="400px" display="flex" justifyContent="center" alignItems="center">
        <Spinner />
      </Box>
    );
  }

  const totalDuration = endTime.diff(startTime, "seconds");
  const timeIntervals = 12;

  // const getTimeFormat = (scale: TimeScale) => {
  //   switch (scale) {
  //     case TimeScale.SECONDS:
  //       return "mm:ss";
  //     case TimeScale.HOURS:
  //       return "HH:mm";
  //     default:
  //       return "h:mm A";
  //   }
  // };

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

  // const resetToAutoScroll = () => {
  //   setIsAutoScrolling(true);
  // };

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
          borderLeft="1px solid"
          borderColor={gridLineColor}
          zIndex={1}
        />,
      );
    }
    return lines;
  };

  const renderRowStripes = () => {
    if (!toolTypes.length) return null;
    return toolTypes.map((toolType, index) => (
      <Box
        key={toolType}
        position="absolute"
        left={0}
        right={0}
        top={`${index * ROW_HEIGHT_PX}px`}
        height={`${ROW_HEIGHT_PX}px`}
        bg={index % 2 === 0 ? rowStripeA : rowStripeB}
        borderBottom="1px solid"
        borderColor={borderColor}
        zIndex={0}
        pointerEvents="none"
      />
    ));
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
    const verticalPadding = 8;

    let lastEndTime = moment(0);

    return sortedCommands
      .map((command) => {
        const toolType = command.commandInfo.toolType;
        const toolIndex = toolTypes.indexOf(toolType);

        // Calculate start and end times
        const startMoment = moment.max(moment(command.createdAt), lastEndTime);
        let endMoment;

        // For skipped commands, truncate at current time
        if (command.status === "SKIPPED") {
          endMoment = command.completedAt ? moment(command.completedAt) : startMoment.clone(); // End right where it started if no completedAt time
        } else {
          endMoment = moment(
            command.completedAt ||
              startMoment.clone().add(command.estimatedDuration || 600, "seconds"),
          );
        }

        lastEndTime = endMoment.clone().add(2, "seconds");

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

        // Determine opacity and style based on command status
        let opacity = 0.9;
        let pattern = "none";
        let borderStyle = "solid";

        if (command.status === "COMPLETED") {
          opacity = 0.7;
        } else if (command.status === "SKIPPED") {
          opacity = 0.5;
          pattern =
            "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.3) 5px, rgba(255,255,255,0.3) 10px)";
          borderStyle = "dashed";
        }

        if (isSelected) {
          opacity = 1;
        }

        return (
          <Tooltip
            key={command.queueId}
            label={`Tool: ${command.commandInfo.toolType} | Command: ${command.commandInfo.command} | Status: ${command.status}`}>
            <Box
              position="absolute"
              height={`${BLOCK_HEIGHT_PX}px`}
              top={`${toolIndex * ROW_HEIGHT_PX + verticalPadding}px`}
              left={left}
              width={`calc(${width} - 4px)`}
              marginLeft="2px"
              onClick={() => onRunClick(command.runId)}
              cursor="pointer"
              border="1px"
              borderStyle={borderStyle}
              borderColor={commandBorderColor}
              borderRadius="md"
              bg={bgColor}
              opacity={opacity}
              _hover={{ opacity: 1, transform: "translateY(-1px)" }}
              transition="all 0.2s"
              zIndex={3}
              boxShadow={
                isSelected
                  ? `0 0 0 2px ${selectedRingColor}, 0 10px 25px rgba(0,0,0,0.20)`
                  : "0 6px 16px rgba(0,0,0,0.12)"
              }
              backgroundImage={pattern === "none" ? commandGloss : `${pattern}, ${commandGloss}`}
              backgroundBlendMode={pattern === "none" ? "normal" : "overlay, normal"}
              filter={commandCoolFilter}
              animation={command.status === "STARTED" ? "pulse 2s infinite" : undefined}
              sx={{
                "@keyframes pulse": {
                  "0%": {
                    boxShadow: "0 0 0 0 rgba(49, 151, 149, 0.4)",
                  },
                  "70%": {
                    boxShadow: "0 0 0 10px rgba(49, 151, 149, 0)",
                  },
                  "100%": {
                    boxShadow: "0 0 0 0 rgba(49, 151, 149, 0)",
                  },
                },
              }}>
              {command.status === "STARTED" && (
                <Box
                  position="absolute"
                  top="2px"
                  right="2px"
                  width="8px"
                  height="8px"
                  borderRadius="full"
                  bg="teal.400"
                  animation="blink 1s infinite"
                  sx={{
                    "@keyframes blink": {
                      "0%": { opacity: 1 },
                      "50%": { opacity: 0.4 },
                      "100%": { opacity: 1 },
                    },
                  }}
                />
              )}
              <Text
                position="absolute"
                left="5px"
                top="50%"
                transform="translateY(-50%)"
                fontSize="sm"
                fontWeight="semibold"
                letterSpacing="0.02em"
                color="white"
                textShadow={commandTextShadow}
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

    if (toolInfoQuery.isLoading) return null;

    return (
      <Box
        position="absolute"
        left="0"
        top="0"
        width={`${LABEL_COLUMN_WIDTH_PX}px`}
        height="100%"
        borderRight="1px solid"
        borderColor={borderColor}
        bg={toolLabelsBgColor}
        zIndex={2}
        overflow="hidden">
        <Box ref={toolLabelsInnerRef} position="relative" willChange="transform">
          {toolTypes.map((toolType, index) => {
            const toolInfo = toolInfoQuery.data?.find((t) => t.type === toolType);
            const imageUrl = toolInfo?.imageUrl;
            const isToolbox = toolType.toLowerCase() === "toolbox";

            return (
              <Box
                key={toolType}
                position="absolute"
                top={`${index * ROW_HEIGHT_PX}px`}
                left="0"
                width="100%"
                height={`${ROW_HEIGHT_PX}px`}
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
                      <ToolCase style={{ width: "100%", height: "100%" }} />
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
                <VStack align="start" spacing="0" flex="1" justify="center">
                  <Text fontSize="sm" fontWeight="bold" isTruncated>
                    {toolType}
                  </Text>
                </VStack>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  const currentTimePosition = (() => {
    const totalDuration = endTime.diff(startTime, "seconds");
    const currentDuration = currentTime.diff(startTime, "seconds");
    return (currentDuration / totalDuration) * 100;
  })();
  const totalHeight = toolTypes.length * ROW_HEIGHT_PX;

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
            marginLeft={`${LABEL_COLUMN_WIDTH_PX}px`}
            overflowY="auto"
            overflowX="hidden"
            bg={mainBgColor}
            border="1px solid"
            borderColor={borderColor}
            ref={scrollContainerRef}
            sx={{
              "&::-webkit-scrollbar": { width: "10px" },
              "&::-webkit-scrollbar-thumb": { background: "rgba(0,0,0,0.25)", borderRadius: "8px" },
              "&::-webkit-scrollbar-track": { background: "transparent" },
            }}>
            <Box position="relative" minHeight="100%" height={`${totalHeight}px`}>
              {renderRowStripes()}
              {renderGridLines()}
              <Box position="relative" zIndex={3}>
                {renderCommands()}
              </Box>
            </Box>
          </Box>
          {/* Render above the scroll container so the marker can overflow (no clipping). */}
          <Box
            position="absolute"
            top={-1}
            bottom={0}
            left={`${LABEL_COLUMN_WIDTH_PX}px`}
            right={0}
            pointerEvents="none"
            overflow="visible"
            zIndex={5}>
            <CurrentTimeLine position={currentTimePosition} />
          </Box>
          {renderToolLabels()}
        </Box>
      </VStack>
    </Box>
  );
};

export default RunQueueGanttChart;
