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
const paddingMap = { sm: 3, md: 3, lg: 3, xl: 12, "2xl": 14 };

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
    <VStack spacing={4} p={4} border="1px solid lightgray" borderRadius="15px" boxShadow="lg">
      <Heading size="lg">
        {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
      </Heading>
      <Box display="flex" justifyContent="space-between" width="100%">
        <Button color={bgColor} onClick={handlePrevMonth} variant="ghost">
          <FiChevronLeft /> Previous
        </Button>
        <Button onClick={handleNextMonth} colorScheme="teal" color={bgColor} variant="ghost">
          <FiChevronRight /> Next
        </Button>
      </Box>
      <Grid templateColumns="repeat(7, 1fr)" gap={2} mt={4} width="100%">
        {daysOfWeek.map((day) => (
          <Text key={day} fontWeight="bold" textAlign="center">
            {day}
          </Text>
        ))}
        {daysInMonth.map((day, index) => (
          <Grid
            width="100%"
            height="100%"
            display="flex"
            alignItems="center"
            justifyContent="space-around"
            key={index}
            textAlign="center"
            color="teal.800"
            p={paddingSize}
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
            <Flex direction="column" justifyContent="center" alignItems="center">
              <Text fontSize="larger">{day.getDate()}</Text>
            </Flex>
          </Grid>
        ))}
      </Grid>

      <HStack spacing={4} width="100%" mt={4}>
        <Text as="b" fontStyle="italic" fontSize="large">
          Time:
        </Text>
        <Box width="90%">
          <Input
            fontSize="25px"
            height="60px"
            type="time"
            value={selectedTime}
            onChange={handleTimeChange}
            width="100%"
            placeholder="Select Time"
            padding="10px"
            borderRadius="10px"
            boxShadow="md"
          />
        </Box>
      </HStack>
    </VStack>
  );
};
