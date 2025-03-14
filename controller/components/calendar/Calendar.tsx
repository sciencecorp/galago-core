import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Grid,
  Heading,
  VStack,
  Text,
  useBreakpointValue,
  useColorModeValue,
  Flex,
  HStack,
  Input,
} from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface CalendarProps {
  onDateSelect?: (date: Date) => void;
  onTimeSelect?: (time: string) => void;
  size?: "sm" | "md" | "lg";
}

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const paddingMap = { sm: 5, md: 5, lg: 5, xl: 5, "2xl": 7 };

export const Calendar: React.FC<CalendarProps> = ({ onDateSelect, onTimeSelect, size = "md" }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [daysInMonth, setDaysInMonth] = useState<Date[]>([]);
  const bgColor = useColorModeValue("gray.500", "gray.200");
  const hoverColor = useColorModeValue("teal.300", "teal.100");
  const paddingSize = useBreakpointValue(paddingMap);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const fontColor = useColorModeValue("black", "white");

  const generateCalendarDays = useCallback(() => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const dates: Date[] = [];
    const startDay = startOfMonth.getDay();
    const totalDays = endOfMonth.getDate();

    // Fill in the dates for the previous month
    const prevMonthLastDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0,
    ).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      dates.push(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthLastDay - i),
      );
    }

    // Fill in the dates for the current month
    for (let i = 1; i <= totalDays; i++) {
      dates.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }

    // Fill in the dates for the next month to complete a 6-row grid
    const nextMonthDays = 35 - dates.length;
    for (let i = 1; i <= nextMonthDays; i++) {
      dates.push(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i));
    }

    setDaysInMonth(dates);
  }, [currentDate]);

  useEffect(() => {
    generateCalendarDays();
  }, [generateCalendarDays]);

  useEffect(() => {
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect && onDateSelect(date);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isCurrentDay = (date: Date) =>
    date.getDate() === new Date().getDate() &&
    date.getMonth() === new Date().getMonth() &&
    date.getFullYear() === new Date().getFullYear();

  const updateTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    setSelectedTime(`${hours}:${minutes}`);
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const time = event.target.value;
    setSelectedTime(time);
    onTimeSelect && onTimeSelect(time);
  };

  return (
    <VStack spacing={2} p={2}>
      <HStack justifyContent="space-between" width="100%">
        <Button size="sm" color={bgColor} onClick={handlePrevMonth} variant="ghost">
          <FiChevronLeft color="gray" />
        </Button>
        <Heading size="sm">
          {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
        </Heading>
        <Button size="sm" onClick={handleNextMonth} color={bgColor} variant="ghost">
          <FiChevronRight color="gray" />
        </Button>
      </HStack>
      <Grid templateColumns="repeat(7, minmax(35px, 1fr))" gap={0.5} width="fit-content">
        {daysOfWeek.map((day) => (
          <Text key={day} fontWeight="bold" textAlign="center" fontSize="xs" p={0}>
            {day}
          </Text>
        ))}
        {daysInMonth.map((day, index) => (
          <Grid
            width="35px"
            height="35px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            key={index}
            textAlign="center"
            color="blue.800"
            p={0}
            borderRadius="sm"
            bg={isCurrentDay(day) ? useColorModeValue("gray.100", "gray.800") : "transparent"}
            _hover={{ bg: hoverColor }}
            onClick={() => handleDateClick(day)}
            cursor="pointer">
            <Text fontSize="xs" color={fontColor}>
              {day.getDate()}
            </Text>
          </Grid>
        ))}
      </Grid>

      <HStack spacing={2} width="100%">
        <Text as="b" fontStyle="italic" fontSize="sm">
          Time:
        </Text>
        <Box width="90%">
          <Input
            size="sm"
            type="time"
            value={selectedTime}
            onChange={handleTimeChange}
            width="100%"
            placeholder="Select Time"
            borderRadius="md"
          />
        </Box>
      </HStack>
    </VStack>
  );
};
