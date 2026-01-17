import React from "react";
import {
  Box,
  Text,
  VStack,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { ArrowLeftIcon, ArrowRightIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Clock } from "lucide-react";
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
  windowDuration: _windowDuration = 60,
  timeScale,
  onZoomChange,
}) => {
  const timeIntervals = 12;
  const totalDuration = endTime.diff(startTime, "seconds");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const labelColor = useColorModeValue("gray.600", "gray.300");
  const menuBg = useColorModeValue("white", "surface.section");
  const menuHoverBg = useColorModeValue("gray.100", "surface.hover");
  const selectedBg = useColorModeValue("blue.50", "blue.900");
  const textBg = useColorModeValue("whiteAlpha.900", "blackAlpha.400");
  const hoverBg = useColorModeValue("white", "surface.panel");
  const hoverBorderColor = useColorModeValue("gray.300", "gray.500");
  const LABEL_COLUMN_WIDTH_PX = 200;
  const axisBg = useColorModeValue("gray.50", "surface.panel");

  const handleShift = (direction: "forward" | "backward") => {
    const shiftAmount = totalDuration / 4;
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
    const format =
      timeScale === TimeScale.SECONDS
        ? "h:mm:ss"
        : timeScale === TimeScale.HOURS
          ? "MMM D, h A"
          : "h:mm A";

    // Render labels for grid lines (excluding the first and last)
    for (let i = 1; i < timeIntervals; i++) {
      const intervalTime = moment(startTime).add((totalDuration / timeIntervals) * i, "seconds");
      // Adjust the left position to match grid lines
      const left = `calc(${(i / timeIntervals) * 100}% - 2px)`;

      labels.push(
        <Text
          key={i}
          position="absolute"
          left={left}
          transform="translateX(-50%)"
          fontSize="xs"
          fontWeight="medium"
          color={labelColor}
          bg={textBg}
          px={1}
          rounded="full"
          borderWidth="1px"
          borderColor={borderColor}
          _hover={{
            bg: hoverBg,
            borderColor: hoverBorderColor,
          }}
          maxW="100px"
          isTruncated>
          {intervalTime.format(format)}
        </Text>,
      );
    }
    return labels;
  };

  const getScaleLabel = (scale: TimeScale) => {
    switch (scale) {
      case TimeScale.SECONDS:
        return "Seconds View";
      case TimeScale.MINUTES:
        return "Minutes View";
      case TimeScale.HOURS:
        return "Hours View";
    }
  };

  return (
    <VStack spacing={3} width="100%" align="stretch">
      <Flex justify="space-between" align="center" gap={4}>
        <HStack>
          <IconButton
            aria-label="Move backward"
            icon={<ArrowLeftIcon />}
            onClick={() => handleShift("backward")}
            size="sm"
            variant="outline"
            colorScheme="gray"
          />
          <IconButton
            aria-label="Move forward"
            icon={<ArrowRightIcon />}
            onClick={() => handleShift("forward")}
            size="sm"
            variant="outline"
            colorScheme="gray"
          />
        </HStack>

        <Box marginLeft={`${LABEL_COLUMN_WIDTH_PX}px`} flex={1}>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              leftIcon={<Clock size={14} />}
              size="sm"
              variant="outline"
              colorScheme="blue"
              float="right"
              marginRight={4}>
              {getScaleLabel(timeScale)}
            </MenuButton>
            <MenuList
              bg={menuBg}
              borderColor={borderColor}
              boxShadow="md"
              zIndex={100}
              sx={{
                "& > button": {
                  bg: "inherit",
                  width: "100%",
                },
                backgroundColor: menuBg,
                position: "relative",
              }}>
              <MenuItem
                onClick={() => onZoomChange(TimeScale.SECONDS)}
                sx={{
                  backgroundColor: timeScale === TimeScale.SECONDS ? selectedBg : menuBg,
                  "&:hover": {
                    backgroundColor: menuHoverBg,
                  },
                  position: "relative",
                  zIndex: 101,
                }}>
                Seconds View
              </MenuItem>
              <MenuItem
                onClick={() => onZoomChange(TimeScale.MINUTES)}
                sx={{
                  backgroundColor: timeScale === TimeScale.MINUTES ? selectedBg : menuBg,
                  "&:hover": {
                    backgroundColor: menuHoverBg,
                  },
                  position: "relative",
                  zIndex: 101,
                }}>
                Minutes View
              </MenuItem>
              <MenuItem
                onClick={() => onZoomChange(TimeScale.HOURS)}
                sx={{
                  backgroundColor: timeScale === TimeScale.HOURS ? selectedBg : menuBg,
                  "&:hover": {
                    backgroundColor: menuHoverBg,
                  },
                  position: "relative",
                  zIndex: 101,
                }}>
                Hours View
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Flex>

      <Box
        position="relative"
        width="calc(100% - 200px)"
        height="28px"
        mt={1}
        marginLeft={`${LABEL_COLUMN_WIDTH_PX}px`}
        paddingX={4}
        bg={axisBg}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="md"
        display="flex"
        alignItems="center">
        {renderTimeLabels()}
      </Box>
    </VStack>
  );
};
