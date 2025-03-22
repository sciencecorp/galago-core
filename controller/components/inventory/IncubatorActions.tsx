import React from "react";
import { VStack, Text, Button, Spinner, useColorModeValue } from "@chakra-ui/react";
import { semantic } from "../../themes/colors";
import tokens from "../../themes/tokens";

type IncubatorActionsProps = {
  mode: "checkin" | "checkout" | "create" | "move" | "delete" | "";
  setMode: (mode: "checkin" | "checkout" | "create" | "move" | "delete" | "") => void;
  isLoading: boolean;
};

const IncubatorActions: React.FC<IncubatorActionsProps> = ({ mode, setMode, isLoading }) => {
  const textColor = useColorModeValue(semantic.text.primary.light, semantic.text.primary.dark);
  const buttonBg = useColorModeValue(
    semantic.background.secondary.light,
    semantic.background.secondary.dark,
  );
  const buttonActiveBg = useColorModeValue(
    semantic.background.card.light,
    semantic.background.card.dark,
  );
  const buttonHoverBg = useColorModeValue(
    semantic.background.hover.light,
    semantic.background.hover.dark,
  );
  const borderColor = useColorModeValue(
    semantic.border.secondary.light,
    semantic.border.secondary.dark,
  );
  const accentColor = useColorModeValue(semantic.text.accent.light, semantic.text.accent.dark);

  return (
    <VStack align="center" spacing={tokens.spacing.md}>
      <Text fontSize={tokens.typography.fontSizes.xl} color={textColor}>
        Incubator
      </Text>
      <Button
        bg={mode === "checkin" ? buttonActiveBg : buttonBg}
        color={textColor}
        borderWidth={tokens.borders.widths.thin}
        borderColor={borderColor}
        _hover={{ bg: buttonHoverBg }}
        width="100%"
        onClick={() => setMode("checkin")}
        borderRadius={tokens.borders.radii.md}>
        Load Plate
      </Button>
      <Button
        bg={mode === "checkout" ? buttonActiveBg : buttonBg}
        color={textColor}
        borderWidth={tokens.borders.widths.thin}
        borderColor={borderColor}
        _hover={{ bg: buttonHoverBg }}
        width="100%"
        onClick={() => setMode("checkout")}
        borderRadius={tokens.borders.radii.md}>
        Unload Plate
      </Button>
      {isLoading && <Spinner color={accentColor} />}
      <Button
        bg={mode === "create" ? buttonActiveBg : buttonBg}
        color={textColor}
        borderWidth={tokens.borders.widths.thin}
        borderColor={borderColor}
        _hover={{ bg: buttonHoverBg }}
        width="100%"
        onClick={() => setMode("create")}
        borderRadius={tokens.borders.radii.md}>
        Add Plate
      </Button>
      <Button
        bg={mode === "delete" ? buttonActiveBg : buttonBg}
        color={textColor}
        borderWidth={tokens.borders.widths.thin}
        borderColor={borderColor}
        _hover={{ bg: buttonHoverBg }}
        width="100%"
        onClick={() => setMode("delete")}
        borderRadius={tokens.borders.radii.md}>
        Remove Plate
      </Button>
    </VStack>
  );
};

export default IncubatorActions;
