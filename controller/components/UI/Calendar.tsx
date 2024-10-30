// Calendar.tsx
import React, { useState, useEffect } from 'react';
import { Box, Button, Grid, Heading, VStack, Text, useColorModeValue } from '@chakra-ui/react';
import { text } from 'stream/consumers';

interface CalendarProps {
  onDateSelect?: (date: Date) => void;
}

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const Calendar: React.FC<CalendarProps> = ({ onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [daysInMonth, setDaysInMonth] = useState<Date[]>([]);

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate]);

  const generateCalendarDays = () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const dates: Date[] = [];
    const startDay = startOfMonth.getDay(); 
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
    <VStack spacing={4} p={4}>
      <Heading size="lg">
        {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
      </Heading>
      <Box display="flex" justifyContent="space-between" width="100%">
        <Button onClick={handlePrevMonth} colorScheme="teal">
          Previous
        </Button>
        <Button onClick={handleNextMonth} colorScheme="teal">
          Next
        </Button>
      </Box>
      <Grid templateColumns="repeat(7, 1fr)" gap={2} mt={4}>
        {daysOfWeek.map((day) => (
          <Text key={day} fontWeight="bold" textAlign="center">
            {day}
          </Text>
        ))}
        {daysInMonth.map((day, index) => (
          <Box
            key={index}
            textAlign="center"
            color="teal.800"
            p={5}
            width="70px"
            height="60px"
            borderRadius="md"
            bg={isCurrentDay(day) ? 'teal.300' : 'gray.100'}
            onClick={() => onDateSelect && onDateSelect(day)}
            cursor="pointer"
          >
            {day.getDate()}
          </Box>
        ))}
      </Grid>
    </VStack>
  );
};
