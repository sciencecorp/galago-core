import React, { useState, useEffect } from "react";
import { Box, HStack, Select, Text, useColorModeValue } from "@chakra-ui/react";
import { semantic } from "../../themes/colors";
import tokens from "../../themes/tokens";

interface CustomTimePickerProps {
  onTimeSelect?: (time: string) => void;
  size?: "sm" | "md" | "lg";
}

export const TimePicker: React.FC<CustomTimePickerProps> = ({ onTimeSelect, size = "md" }) => {
  const [hour, setHour] = useState<string>("12");
  const [minute, setMinute] = useState<string>("00");
  const [period, setPeriod] = useState<string>("AM");

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
  const periods = ["AM", "PM"];

  const textColor = useColorModeValue(semantic.text.primary.light, semantic.text.primary.dark);
  const borderColor = useColorModeValue(
    semantic.border.primary.light,
    semantic.border.primary.dark,
  );

  // Map size prop to component dimensions
  const sizeMap = {
    sm: {
      fontSize: tokens.typography.fontSizes.sm,
      height: "40px",
      width: "80px",
    },
    md: {
      fontSize: tokens.typography.fontSizes.md,
      height: "50px",
      width: "90px",
    },
    lg: {
      fontSize: tokens.typography.fontSizes.lg,
      height: "60px",
      width: "100px",
    },
  };

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
    <HStack spacing={tokens.spacing.sm}>
      <Select
        value={hour}
        onChange={handleHourChange}
        fontSize={sizeMap[size].fontSize}
        height={sizeMap[size].height}
        width={sizeMap[size].width}
        borderRadius={tokens.borders.radii.md}
        boxShadow={tokens.shadows.sm}
        borderColor={borderColor}
        color={textColor}>
        {hours.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </Select>
      <Text fontSize={sizeMap[size].fontSize} color={textColor}>
        :
      </Text>
      <Select
        value={minute}
        onChange={handleMinuteChange}
        fontSize={sizeMap[size].fontSize}
        height={sizeMap[size].height}
        width={sizeMap[size].width}
        borderRadius={tokens.borders.radii.md}
        boxShadow={tokens.shadows.sm}
        borderColor={borderColor}
        color={textColor}>
        {minutes.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </Select>
      <Select
        value={period}
        onChange={handlePeriodChange}
        fontSize={sizeMap[size].fontSize}
        height={sizeMap[size].height}
        width={sizeMap[size].width}
        borderRadius={tokens.borders.radii.md}
        boxShadow={tokens.shadows.sm}
        borderColor={borderColor}
        color={textColor}>
        {periods.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </Select>
    </HStack>
  );
};
