import { useColorModeValue } from "@chakra-ui/react";
import { palette, semantic } from "../../themes/colors";

// Script editor colors
export const useScriptColors = () => {
  return {
    selectedBg: useColorModeValue(semantic.background.accent.light, semantic.background.accent.dark),
    hoverBg: useColorModeValue(semantic.background.hover.light, semantic.background.hover.dark),
    selectedColor: useColorModeValue(semantic.text.accent.light, semantic.text.accent.dark),
    bgColor: useColorModeValue(semantic.background.secondary.light, semantic.background.secondary.dark),
    borderColor: useColorModeValue(semantic.border.primary.light, semantic.border.primary.dark),
    consoleHeaderBg: useColorModeValue(palette.gray[100], palette.gray[800]),
    consoleBg: useColorModeValue(palette.white, palette.custom.consoleDark),
  };
};

// Common UI colors
export const useCommonColors = () => {
  return {
    cardBg: useColorModeValue(semantic.background.card.light, semantic.background.card.dark),
    headerBg: useColorModeValue(semantic.background.card.light, semantic.background.card.dark),
    tabBg: useColorModeValue(semantic.background.secondary.light, semantic.background.secondary.dark),
    activeTabBg: useColorModeValue(semantic.background.primary.light, semantic.background.secondary.dark),
    hoverBg: useColorModeValue(semantic.background.hover.light, semantic.background.hover.dark),
    accentColor: useColorModeValue(semantic.text.accent.light, semantic.text.accent.dark),
  };
};

// Text colors
export const useTextColors = () => {
  return {
    primary: useColorModeValue(semantic.text.primary.light, semantic.text.primary.dark),
    secondary: useColorModeValue(semantic.text.secondary.light, semantic.text.secondary.dark),
    accent: useColorModeValue(semantic.text.accent.light, semantic.text.accent.dark),
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
  retract: "pink",
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
  retract: "#F55656", // pink.400
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
