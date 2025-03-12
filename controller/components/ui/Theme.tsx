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
