import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  HStack,
  Text,
  Input,
  FormControl,
  FormLabel,
  useColorModeValue,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  SimpleGrid,
  Tooltip,
} from "@chakra-ui/react";
import { RiPaletteLine } from "react-icons/ri";

const COLOR_PALETTE = [
  // Light colors
  "#ffffff",
  "#f7fafc",
  "#edf2f7",
  "#e2e8f0",
  "#cbd5e0",
  // Dark colors
  "#1a202c",
  "#2d3748",
  "#4a5568",
  "#718096",
  "#a0aec0",
  // Red variants
  "#fed7d7",
  "#feb2b2",
  "#fc8181",
  "#f56565",
  "#e53e3e",
  // Orange variants
  "#feebc8",
  "#fbd38d",
  "#f6ad55",
  "#ed8936",
  "#dd6b20",
  // Yellow variants
  "#faf089",
  "#f6e05e",
  "#ecc94b",
  "#d69e2e",
  "#b7791f",
  // Green variants
  "#c6f6d5",
  "#9ae6b4",
  "#68d391",
  "#48bb78",
  "#38a169",
  // Blue variants
  "#bee3f8",
  "#90cdf4",
  "#63b3ed",
  "#4299e1",
  "#3182ce",
  // Purple variants
  "#d6bcfa",
  "#b794f6",
  "#9f7aea",
  "#805ad5",
  "#6b46c1",
  // Pink variants
  "#fed7e2",
  "#fbb6ce",
  "#f687b3",
  "#ed64a6",
  "#d53f8c",
];

export const ColorPicker: React.FC<{
  color: string | null;
  onChange: (color: string | null) => void;
  label?: string;
  isSimple?: boolean;
}> = ({ color, onChange, label = "Background Color", isSimple = false }) => {
  const [customColor, setCustomColor] = useState(color || "#ffffff");
  const defaultLightColor = useColorModeValue("#ffffff", "#2d3748");
  const borderColor = useColorModeValue("gray.300", "gray.600");
  const textColor = useColorModeValue("gray.600", "gray.300");

  const displayColor = color || defaultLightColor;

  useEffect(() => {
    if (color) {
      setCustomColor(color);
    } else {
      setCustomColor(defaultLightColor);
    }
  }, [color, defaultLightColor]);

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    onChange(newColor);
  };

  const handleReset = () => {
    onChange(null);
    setCustomColor(defaultLightColor);
  };

  if (isSimple) {
    return (
      <FormControl>
        <FormLabel color={useColorModeValue("gray.700", "gray.200")}>{label}</FormLabel>
        <HStack spacing={2}>
          <Button
            size="sm"
            variant={color === "#000000" ? "solid" : "outline"}
            colorScheme={color === "#000000" ? "blackAlpha" : "gray"}
            onClick={() => onChange("#000000")}
            leftIcon={
              <Box
                w="16px"
                h="16px"
                bg="#000000"
                border="1px solid"
                borderColor={borderColor}
                borderRadius="sm"
              />
            }>
            Black
          </Button>

          <Button
            size="sm"
            variant={color === "#ffffff" ? "solid" : "outline"}
            colorScheme={color === "#ffffff" ? "gray" : "gray"}
            onClick={() => onChange("#ffffff")}
            leftIcon={
              <Box
                w="16px"
                h="16px"
                bg="#ffffff"
                border="1px solid"
                borderColor={borderColor}
                borderRadius="sm"
              />
            }>
            White
          </Button>

          <Button
            size="sm"
            variant="outline"
            colorScheme={useColorModeValue("gray", "whiteAlpha")}
            onClick={handleReset}>
            Auto
          </Button>
        </HStack>
        <Text fontSize="xs" color={textColor} mt={1}>
          Current:{" "}
          {color === "#000000"
            ? "Black"
            : color === "#ffffff"
              ? "White"
              : `Auto (${defaultLightColor === "#ffffff" ? "White" : "Black"})`}
        </Text>
      </FormControl>
    );
  }

  return (
    <FormControl>
      <FormLabel color={useColorModeValue("gray.700", "gray.200")}>{label}</FormLabel>
      <HStack spacing={2}>
        <Popover>
          <PopoverTrigger>
            <Button
              size="sm"
              leftIcon={<RiPaletteLine />}
              rightIcon={
                <Box
                  w="20px"
                  h="20px"
                  bg={displayColor}
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="md"
                />
              }
              variant={useColorModeValue("outline", "solid")}
              colorScheme={useColorModeValue("gray", "whiteAlpha")}>
              Palette
            </Button>
          </PopoverTrigger>
          <PopoverContent
            w="300px"
            bg={useColorModeValue("white", "gray.700")}
            borderColor={borderColor}>
            <PopoverBody>
              <SimpleGrid columns={5} spacing={2}>
                {COLOR_PALETTE.map((paletteColor) => (
                  <Tooltip key={paletteColor} label={paletteColor}>
                    <Box
                      w="40px"
                      h="40px"
                      bg={paletteColor}
                      border="2px solid"
                      borderColor={color === paletteColor ? "blue.500" : borderColor}
                      borderRadius="md"
                      cursor="pointer"
                      onClick={() => {
                        onChange(paletteColor);
                        setCustomColor(paletteColor);
                      }}
                      _hover={{
                        transform: "scale(1.1)",
                        borderColor: "blue.400",
                      }}
                      transition="all 0.2s"
                    />
                  </Tooltip>
                ))}
              </SimpleGrid>
            </PopoverBody>
          </PopoverContent>
        </Popover>

        <HStack>
          <Text fontSize="sm" color={textColor}>
            Custom:
          </Text>
          <Input
            type="color"
            value={customColor}
            onChange={handleCustomColorChange}
            w="60px"
            h="40px"
            p={1}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="md"
          />
        </HStack>

        <Button
          size="sm"
          variant="outline"
          colorScheme={useColorModeValue("gray", "whiteAlpha")}
          onClick={handleReset}>
          Reset
        </Button>
      </HStack>
      <Text fontSize="xs" color={textColor} mt={1}>
        Current: {color || `Auto (${defaultLightColor})`}
      </Text>
    </FormControl>
  );
};
