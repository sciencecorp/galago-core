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
    const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      dates.push(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthLastDay - i));
    }

    // Fill in the dates for the current month
    for (let i = 1; i <= totalDays; i++) {
      dates.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }

    // Fill in the dates for the next month
    const nextMonthDays = 35 - dates.length; // Fill the remaining slots in a 6-row grid
    for (let i = 1; i <= nextMonthDays; i++) {
      dates.push(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i));
    }

    setDaysInMonth(dates);
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
    <VStack spacing={4} p={4} border="1px solid lightgray" borderRadius="md" boxShadow="mf">
      <Heading size="lg">
        {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
      </Heading>
      <Box display="flex" justifyContent="space-between" width="100%">
        <Button left={-4} color={bgColor} onClick={handlePrevMonth} variant="ghost">
          <FiChevronLeft /> Previous
        </Button>
        <Button left={4} onClick={handleNextMonth} colorScheme="teal" color={bgColor} variant="ghost">
          <FiChevronRight /> Next
        </Button>
      </Box>
      <Grid templateColumns="repeat(7, 1fr)" gap={1} mt={4} width="100%">
        {daysOfWeek.map((day) => (
          <Text key={day} fontWeight="bold" textAlign="center">
            {day}
          </Text>
        ))}
        {daysInMonth.map((day, index) => {
          const isOutsideMonth = day.getMonth() !== currentDate.getMonth();

          return (
            <Grid
              width="100%"
              height="100%"
              display="flex"
              alignItems="center"
              justifyContent="space-around"
              key={index}
              textAlign="center"
              color={isOutsideMonth ? "gray.500" : "teal.800"}
              p={paddingSize}
              borderRadius="sm"
              bg={
                isCurrentDay(day)
                  ? "teal.500"
                  : selectedDate?.toDateString() === day.toDateString()
                  ? "teal.200"
                  : isOutsideMonth
                  ? "gray.300" 
                  : "gray.100"
              }
              _hover={{ bg: isOutsideMonth ? "gray.300" : hoverColor }}
              onClick={() => handleDateClick(day)}
              cursor="pointer">
              <Flex direction="column" justifyContent="center" alignItems="center">
                <Text fontSize="large">{day.getDate()}</Text>
              </Flex>
            </Grid>
          );
        })}
      </Grid>

      <HStack spacing={4} width="100%" mt={4}>
        <Text as="b" fontStyle="italic" fontSize="large">
          Time:
        </Text>
        <Box width="90%">
          <Input
            fontSize="20px"
            height="40px"
            type="time"
            value={selectedTime}
            onChange={handleTimeChange}
            width="100%"
            placeholder="Select Time"
            padding="10px"
            borderRadius="sm"
            boxShadow="sm"
          />
        </Box>
      </HStack>
    </VStack>
  );
};
