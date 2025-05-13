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
    cardBg: useColorModeValue("white", "gray.900"),
    textColor: useColorModeValue("gray.800", "white"),
    bgColor: useColorModeValue("gray.50", "gray.900"),
    selectedBg: useColorModeValue("teal.50", "teal.900"),
    headerBg: useColorModeValue("white", "gray.700"),
    tabBg: useColorModeValue("gray.50", "gray.700"),
    activeTabBg: useColorModeValue("white", "gray.800"),
    hoverBg: useColorModeValue("gray.100", "gray.600"),
    accentColor: useColorModeValue("teal.600", "teal.200"),
    borderColor: useColorModeValue("gray.200", "gray.900"),
    inputBg: useColorModeValue("white", "gray.800"),
    sectionBg: useColorModeValue("gray.50", "gray.800"),
    alternateBg: useColorModeValue("gray.100", "gray.800"),
    selectedBorder: useColorModeValue("teal.500", "teal.400"),
    arrowColor: useColorModeValue("gray.500", "gray.400"),
  };
};

// Text colors
export const useTextColors = () => {
  return {
    primary: useColorModeValue("gray.800", "white"),
    secondary: useColorModeValue("gray.600", "gray.400"),
    accent: useColorModeValue("teal.600", "teal.200"),
    headingColor: useColorModeValue("teal.600", "teal.300"),
  };
};

// Robot command colors
export const commandColors = {
  move: "blue",
  grasp_plate: "green",
  release_plate: "red",
  retrieve_plate: "purple",
  dropoff_plate: "orange",
  engage: "red",
  release: "teal",
  unwind: "pink",
  default: "gray",
};

// Get command color by command name
export const getCommandColor = (commandName: string): string => {
  return commandColors[commandName as keyof typeof commandColors] || commandColors.default;
};

// Command color hex values (for direct use with icons)
export const commandColorHex = {
  move: "#4299E1", // blue.400
  grasp_plate: "#48BB78", // green.400
  release_plate: "#F56565", // red.400
  retrieve_plate: "#9F7AEA", // purple.400
  dropoff_plate: "#ED8936", // orange.400
  engage: "#F56565", // teal.400
  release: "#38B2AC", // red.400
  unwind: "#F55656", // pink.400
  default: "#718096", // gray.500
};

// Get command color hex by command name
export const getCommandColorHex = (commandName: string): string => {
  return commandColorHex[commandName as keyof typeof commandColorHex] || commandColorHex.default;
};

// Add sidebar theme configuration
export const useSidebarTheme = () => {
  return {
    bg: useColorModeValue("white", "gray.900"),
    textColor: useColorModeValue("gray.800", "white"),
    hoverBg: useColorModeValue("gray.100", "gray.700"),
    activeBg: useColorModeValue("teal.50", "gray.700"),
    borderColor: useColorModeValue("gray.200", "gray.700"),
    shadow: useColorModeValue("0 0 10px rgba(0, 0, 0, 0.1)", "none"),
    activeTextColor: "teal.500",
    activeIconColor: "teal",
  };
};
