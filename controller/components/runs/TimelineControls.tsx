import React from "react";
import { Box, Text, VStack, HStack, IconButton, Select } from "@chakra-ui/react";
import { ArrowLeftIcon, ArrowRightIcon } from "@chakra-ui/icons";
import moment from "moment";
// import { TimeScale } from '@/types';

enum TimeScale {
  SECONDS = "seconds",
  MINUTES = "minutes",
  HOURS = "hours",
}

interface TimelineControlsProps {
  onTimeWindowChange: (start: moment.Moment, end: moment.Moment) => void;
  startTime: moment.Moment;
  endTime: moment.Moment;
  windowDuration?: number;
  timeScale: TimeScale;
  onZoomChange: (scale: TimeScale) => void;
}

export const TimelineControls: React.FC<TimelineControlsProps> = ({
  onTimeWindowChange,
  startTime,
  endTime,
  windowDuration = 60,
  timeScale,
  onZoomChange,
}) => {
  const timeIntervals = 12;
  const totalDuration = endTime.diff(startTime, "seconds");

  const handleShift = (direction: "forward" | "backward") => {
    const shiftAmount = totalDuration / 10;
    const newStart =
      direction === "forward"
        ? startTime.clone().add(shiftAmount, "seconds")
        : startTime.clone().subtract(shiftAmount, "seconds");
    const newEnd =
      direction === "forward"
        ? endTime.clone().add(shiftAmount, "seconds")
        : endTime.clone().subtract(shiftAmount, "seconds");

    onTimeWindowChange(newStart, newEnd);
  };

  const renderTimeLabels = () => {
    const labels = [];

    for (let i = 0; i <= timeIntervals; i++) {
      const intervalTime = moment(startTime).add((totalDuration / timeIntervals) * i, "seconds");
      const left = `${(i / timeIntervals) * 100}%`;

      labels.push(
        <Text
          key={i}
          position="absolute"
          left={left}
          transform="translateX(-50%)"
          fontSize="sm"
          color="gray.600">
          {timeScale === TimeScale.SECONDS
            ? intervalTime.format("h:mm:ss")
            : intervalTime.format("h:mm A")}
        </Text>,
      );
    }
    return labels;
  };

  return (
    <VStack spacing={2} width="100%">
      <Select
        value={timeScale}
        onChange={(e) => onZoomChange(e.target.value as TimeScale)}
        width="150px"
        alignSelf="flex-end">
        <option value={TimeScale.SECONDS}>Seconds</option>
        <option value={TimeScale.MINUTES}>Minutes</option>
        <option value={TimeScale.HOURS}>Hours</option>
      </Select>
      <HStack width="100%" justify="space-between" spacing={4}>
        <IconButton
          aria-label="Move backward"
          icon={<ArrowLeftIcon />}
          onClick={() => handleShift("backward")}
          size="sm"
        />
        <IconButton
          aria-label="Move forward"
          icon={<ArrowRightIcon />}
          onClick={() => handleShift("forward")}
          size="sm"
        />
      </HStack>
      <Box position="relative" width="100%" height="30px">
        {renderTimeLabels()}
      </Box>
      <HStack spacing={4}></HStack>
    </VStack>
  );
};
