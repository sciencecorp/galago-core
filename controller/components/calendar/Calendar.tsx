import React, { useState, useEffect } from "react";
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
const paddingMap = { sm: 3, md: 3, lg: 3, xl: 5, "2xl": 7 };

export const Calendar: React.FC<CalendarProps> = ({ onDateSelect, onTimeSelect, size = "md" }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [daysInMonth, setDaysInMonth] = useState<Date[]>([]);
  const bgColor = useColorModeValue("gray.500", "gray.200");
  const hoverColor = useColorModeValue("teal.300", "teal.100");
  const paddingSize = useBreakpointValue(paddingMap);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate]);

  useEffect(() => {
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect && onDateSelect(date);
  };

  const generateCalendarDays = () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const dates: Date[] = [];
    const startDay = startOfMonth.getDay();
    const totalDays = endOfMonth.getDate();

    // Fill in the dates for the previous month
    for (let i = 0; i < startDay; i++) {
      dates.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), -i));
    }
    dates.reverse();

    // Fill in the dates for the current month
    for (let i = 1; i <= totalDays; i++) {
      dates.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }

    setDaysInMonth(dates);
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(newDate);
    generateCalendarDays();
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(newDate);
    generateCalendarDays();
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
    <VStack spacing={2} p={2} border="1px solid lightgray" borderRadius="15px" boxShadow="lg">
      <Heading size="md">
        {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
      </Heading>
      <Box display="flex" justifyContent="space-between" width="100%">
        <Button size="sm" color={bgColor} onClick={handlePrevMonth} variant="ghost">
          <FiChevronLeft />
        </Button>
        <Button
          size="sm"
          onClick={handleNextMonth}
          colorScheme="teal"
          color={bgColor}
          variant="ghost">
          <FiChevronRight />
        </Button>
      </Box>
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
            color="teal.800"
            p={0}
            borderRadius="md"
            bg={
              isCurrentDay(day)
                ? "teal.300"
                : selectedDate?.toDateString() === day.toDateString()
                  ? "teal.400"
                  : "gray.100"
            }
            _hover={{ bg: hoverColor }}
            onClick={() => handleDateClick(day)}
            cursor="pointer">
            <Text fontSize="xs">{day.getDate()}</Text>
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
