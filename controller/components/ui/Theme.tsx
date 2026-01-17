import { useColorModeValue } from "@chakra-ui/react";

// Theme hooks should return semantic tokens, not hardcoded hex.
// Tokens are defined in `themes/customTheme.ts`.
const SURFACE_CANVAS = "surface.canvas";
const SURFACE_PANEL = "surface.panel";
const SURFACE_SECTION = "surface.section";
const SURFACE_HOVER = "surface.hover";
const BORDER_SUBTLE = "border.subtle";

// Script editor colors
export const useScriptColors = () => {
  return {
    selectedBg: useColorModeValue("teal.50", "teal.900"),
    hoverBg: useColorModeValue("gray.100", SURFACE_HOVER),
    selectedColor: useColorModeValue("teal.600", "teal.200"),
    bgColor: useColorModeValue("gray.50", SURFACE_PANEL),
    borderColor: useColorModeValue("gray.200", BORDER_SUBTLE),
    consoleHeaderBg: useColorModeValue("gray.100", SURFACE_SECTION),
    consoleBg: useColorModeValue("white", "#222324"),
  };
};

// Common UI colors
export const useCommonColors = () => {
  return {
    cardBg: useColorModeValue("white", SURFACE_SECTION),
    textColor: useColorModeValue("gray.800", "white"),
    bgColor: useColorModeValue("gray.50", SURFACE_CANVAS),
    selectedBg: useColorModeValue("teal.50", "teal.900"),
    headerBg: useColorModeValue("white", SURFACE_SECTION),
    tabBg: useColorModeValue("gray.50", SURFACE_PANEL),
    activeTabBg: useColorModeValue("white", SURFACE_SECTION),
    hoverBg: useColorModeValue("gray.100", SURFACE_HOVER),
    accentColor: useColorModeValue("teal.600", "teal.200"),
    borderColor: useColorModeValue("gray.200", BORDER_SUBTLE),
    inputBg: useColorModeValue("white", SURFACE_PANEL),
    sectionBg: useColorModeValue("gray.50", SURFACE_PANEL),
    alternateBg: useColorModeValue("gray.100", SURFACE_PANEL),
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
    // Match app-level neutral dark surfaces (see `themes/customTheme.ts`).
    bg: useColorModeValue("white", SURFACE_PANEL),
    textColor: useColorModeValue("gray.800", "white"),
    hoverBg: useColorModeValue("gray.100", SURFACE_HOVER),
    activeBg: useColorModeValue("teal.50", SURFACE_HOVER),
    // Dark mode needs a higher-contrast separator (Edge renders subtle borders very softly).
    borderColor: useColorModeValue("gray.200", BORDER_SUBTLE),
    shadow: useColorModeValue(
      "0 0 10px rgba(0, 0, 0, 0.1)",
      "0 0 0 1px rgba(255, 255, 255, 0.06), 8px 0 24px rgba(0, 0, 0, 0.45)",
    ),
    activeTextColor: "teal.500",
    // Lucide icons need a real CSS color; use Chakra's CSS variable for teal.500.
    // This follows our custom `teal` palette (teal.500 = #44518e).
    activeIconColor: "var(--chakra-colors-teal-500)",
  };
};
