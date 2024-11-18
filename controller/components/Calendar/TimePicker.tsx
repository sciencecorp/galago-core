import React, { useState, useEffect } from "react";
import { Box, HStack, Select, Text } from "@chakra-ui/react";


interface CustomTimePickerProps {
  onTimeSelect?: (time: string) => void;
}


export const TimePicker : React.FC<CustomTimePickerProps> = ({ onTimeSelect }) => {
  const [hour, setHour] = useState<string>("12");
  const [minute, setMinute] = useState<string>("00");
  const [period, setPeriod] = useState<string>("AM");

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
  const periods = ["AM", "PM"];

  const handleTimeChange = () => {
    const selectedTime = `${hour}:${minute} ${period}`;
    onTimeSelect && onTimeSelect(selectedTime);
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHour(e.target.value);
    handleTimeChange();
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMinute(e.target.value);
    handleTimeChange();
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriod(e.target.value);
    handleTimeChange();
  };


  return (
    <HStack spacing={2}>
      <Select
        value={hour}
        onChange={handleHourChange}
        fontSize="30px"
        height="60px"
        width="100px"
        borderRadius="10px"
        boxShadow="md"
      >
        {hours.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </Select>
      <Text fontSize="30px">:</Text>
      <Select
        value={minute}
        onChange={handleMinuteChange}
        fontSize="30px"
        height="60px"
        width="100px"
        borderRadius="10px"
        boxShadow="md"
      >
        {minutes.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </Select>
      <Select
        value={period}
        onChange={handlePeriodChange}
        fontSize="30px"
        height="60px"
        width="100px"
        borderRadius="10px"
        boxShadow="md"
      >
        {periods.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </Select>
    </HStack>
  );
};
