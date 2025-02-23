import { useColorModeValue } from "@chakra-ui/react";

// Script editor colors
export const useScriptColors = () => {
  return {
    selectedBg: useColorModeValue("teal.50", "teal.900"),
    hoverBg: useColorModeValue("gray.100", "gray.600"),
    selectedColor: useColorModeValue("teal.600", "teal.200"),
    bgColor: useColorModeValue("gray.50", "gray.700"),
    borderColor: useColorModeValue("gray.200", "gray.600"),
    consoleHeaderBg: useColorModeValue("gray.100", "gray.800"),
    consoleBg: useColorModeValue("white", "#222324"),
  };
};

// Common UI colors
export const useCommonColors = () => {
  return {
    cardBg: useColorModeValue("white", "gray.700"),
    headerBg: useColorModeValue("white", "gray.700"),
    tabBg: useColorModeValue("gray.50", "gray.700"),
    activeTabBg: useColorModeValue("white", "gray.800"),
    hoverBg: useColorModeValue("gray.100", "gray.600"),
    accentColor: useColorModeValue("teal.600", "teal.200"),
  };
};

// Text colors
export const useTextColors = () => {
  return {
    primary: useColorModeValue("gray.800", "white"),
    secondary: useColorModeValue("gray.600", "gray.400"),
    accent: useColorModeValue("teal.600", "teal.200"),
  };
};
