// Calendar.tsx
import React, { useState, useEffect } from 'react';
import { Box, Button, Grid, Heading, VStack, Text, useBreakpointValue, useColorModeValue, Flex} from '@chakra-ui/react';
import {CalendarCell} from './CalendarCell';
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface CalendarProps {
  onDateSelect?: (date: Date) => void;
  size?: 'sm' | 'md' | 'lg';
}

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const sizeMap = { sm: 40, md: 60, lg: 90, xl:120, '2xl':150}; // Use numeric values for calculations
const paddingMap = { sm: 4, md: 7, lg: 10, xl: 12, '2xl': 16 };

export const Calendar: React.FC<CalendarProps> = (props) => {
  const { onDateSelect, size = 'md' } = props;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [daysInMonth, setDaysInMonth] = useState<Date[]>([]);

  const paddingSize = useBreakpointValue({
    base: paddingMap.sm,
    md: paddingMap[size],
    lg: paddingMap[size],
    xl: paddingMap[size],
    '2xl': paddingMap[size],
  });

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate]);

  const generateCalendarDays = () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const dates: Date[] = [];
    const startDay = startOfMonth.getDay(); // Day of week (0-6)
    const totalDays = endOfMonth.getDate();

    for (let i = 0; i < startDay; i++) {
      dates.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), -i));
    }
    dates.reverse();

    for (let i = 1; i <= totalDays; i++) {
      dates.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
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

  return (
    <VStack spacing={4} p={4} border="1px solid lightgray" borderRadius="15px" boxShadow="lg">
      <Heading size="lg">
        {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
      </Heading>
      <Box display="flex" justifyContent="space-between" width="100%">
      <Button
          color={useColorModeValue("gray.500", "gray.200")}
          onClick={handlePrevMonth}
          variant="ghost">
          <FiChevronLeft /> Previous
      </Button>
      <Button 
        onClick={handleNextMonth} 
        colorScheme="teal"
        color={useColorModeValue("gray.500", "gray.200")}
        variant="ghost"
        >
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
            bg={isCurrentDay(day) ? 'teal.300' : 'gray.100'}
            _hover={{ bg: useColorModeValue("teal.300", "teal.100") }}
            onClick={() => onDateSelect && onDateSelect(day)}
            cursor="pointer"
          >
            <Flex
              direction="column"
              justifyContent="center"
              alignItems="center"
              position="relative"
            >
              {day.getDate()}
            </Flex>
          </Grid>
        ))}
      </Grid>
    </VStack>
  );
};
