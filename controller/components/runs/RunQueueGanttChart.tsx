import React, { useState, useEffect } from "react";
import { Box, VStack, HStack, Text, Progress, Tooltip, Flex, Spinner } from "@chakra-ui/react";
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
import RunBlock from "./RunBlock";
import { useColorModeValue } from "@chakra-ui/react";
// import { TimeScale } from '@/types';

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
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment());
    }, 100);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isAutoScrolling || !runsQuery.data || runsQuery.data.length === 0) return;

    const allRuns = runsQuery.data;
    const firstRunStartTime = moment(allRuns[0].createdAt);
    const lastRunEndTime = allRuns.reduce((latest, run) => {
      const runEndTime = moment(run.completedAt || moment(run.createdAt).add(600, "seconds"));
      return runEndTime.isAfter(latest) ? runEndTime : latest;
    }, firstRunStartTime);

    const allCompleted = allRuns.every(
      (run) => run.status === "COMPLETED" || run.status === "FAILED",
    );

    if (allCompleted) {
      setStartTime(firstRunStartTime.subtract(15, "minutes"));
      setEndTime(lastRunEndTime.add(15, "minutes"));
    } else {
      setStartTime(firstRunStartTime);
      setEndTime(lastRunEndTime.add(1, "hour"));
    }
  }, [runsQuery.data, isAutoScrolling]);

  if (!commandsAll.data || !runsQuery.data) {
    return (
      <Box width="100%" height="400px" display="flex" justifyContent="center" alignItems="center">
        <Spinner />
      </Box>
    );
  }

  const totalDuration = endTime.diff(startTime, "seconds");
  const timeIntervals = 12; // Number of time intervals to display

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
          borderStyle="dashed"
          borderWidth="0 2px 0 0"
          borderColor={borderColor}
        />,
      );
    }
    return lines;
  };

  const renderRuns = () => {
    if (!runsQuery.data) return null;

    const groupedCommands = commandsAll.data ? groupCommandsByRun(commandsAll.data) : [];

    // Match the order from RunsComponent
    const allRuns = groupedCommands
      .map((group) => runsQuery.data.find((run) => run.id === group.Id))
      .filter((run): run is NonNullable<typeof run> => run !== undefined);

    // Calculate all run blocks first without adjusting positions
    const runBlocks = allRuns.map((run, index) => {
      const runMetadata = getRunAttributes(
        runsQuery.data?.find((r) => r.id === run.id),
        commandsAll.data?.filter((r) => r.runId === run.id),
      );
      const runCommands = groupedCommands.find((group) => group.Id === run.id)?.Commands || [];

      const { runStart, runEnd, expectedDuration, isActive } = calculateRunTimes(
        runMetadata,
        currentTime,
      );
      const completionPercentage = calculateRunCompletion(runCommands);

      const blockEndTime =
        isActive || runMetadata.status === "CREATED"
          ? currentTime
              .clone()
              .add(expectedDuration * ((100 - completionPercentage) / 100), "seconds")
          : runEnd;

      return {
        run,
        index,
        runMetadata,
        runCommands,
        runStart,
        blockEndTime,
        completionPercentage,
        isActive,
      };
    });

    // Now adjust positions while maintaining order
    let previousRunEndTime = moment(0);

    return runBlocks
      .map((block) => {
        const blockStartTime = moment.max(block.runStart, previousRunEndTime);
        const blockTotalTime = blockStartTime.clone().add(block.blockEndTime.diff(block.runStart));
        previousRunEndTime = blockTotalTime;

        // Skip if outside visible window
        if (blockTotalTime.isBefore(startTime) || blockStartTime.isAfter(endTime)) {
          return null;
        }

        const visibleStartTime = moment.max(blockStartTime, startTime);
        const visibleEndTime = moment.min(blockTotalTime, endTime);
        const isSelected = selectedRunId === block.run.id;

        return (
          <RunBlock
            key={block.run.id}
            run={block.run}
            index={block.index}
            startTime={startTime}
            endTime={endTime}
            totalDuration={totalDuration}
            isSelected={isSelected}
            isActive={block.isActive}
            runAttributes={block.runMetadata}
            visibleStart={visibleStartTime}
            visibleEnd={visibleEndTime}
            runCommands={block.runCommands}
            completion={block.completionPercentage}
            onRunClick={onRunClick}
          />
        );
      })
      .filter(Boolean);
  };

  const currentTimePosition = (() => {
    const totalDuration = endTime.diff(startTime, "seconds");
    const currentDuration = currentTime.diff(startTime, "seconds");
    return (currentDuration / totalDuration) * 100;
  })();

  const CurrentTimeLine: React.FC<{ position: number }> = ({ position }) => {
    return (
      <Box
        position="absolute"
        left={`${position}%`}
        top={0}
        bottom={0}
        width="2px"
        bg="red.500"
        opacity={0.7}
        zIndex={4}
        pointerEvents="none"
        transition="left 0.1s linear"
        _before={{
          content: '""',
          position: "absolute",
          top: "-6px",
          left: "-4px",
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          backgroundColor: "red.500",
          transition: "left 0.1s linear",
        }}
      />
    );
  };

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
        <Box
          position="relative"
          height="400px"
          bg={borderColor}
          border="1px solid"
          borderColor={borderColor}
          pt={0}>
          <Box position="relative" height="100%" overflowY="auto" overflowX="hidden">
            <Box
              position="relative"
              minHeight="100%"
              height={`${(runsQuery.data?.length || 0) * 50}px`}
              pt={4}>
              {renderGridLines()}
              <CurrentTimeLine position={currentTimePosition} />
              <Box position="relative" zIndex={2}>
                {renderRuns()}
              </Box>
            </Box>
          </Box>
        </Box>
      </VStack>
    </Box>
  );
};

export default RunQueueGanttChart;
