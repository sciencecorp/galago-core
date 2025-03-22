import React from "react";
import {
  Box,
  Heading,
  VStack,
  Text,
  FormLabel,
  HStack,
  Input,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { semantic } from "../../themes/colors";
import tokens from "../../themes/tokens";
import { Icon, FormIcons } from "../ui/Icons";

export const Settings: React.FC = () => {
  const textColor = useColorModeValue(semantic.text.primary.light, semantic.text.primary.dark);
  const secondaryTextColor = useColorModeValue(
    semantic.text.secondary.light,
    semantic.text.secondary.dark,
  );
  const borderColor = useColorModeValue(
    semantic.border.secondary.light,
    semantic.border.secondary.dark,
  );
  const bgColor = useColorModeValue(
    semantic.background.primary.light,
    semantic.background.primary.dark,
  );
  const accentColor = useColorModeValue(semantic.text.accent.light, semantic.text.accent.dark);
  const inputBgColor = useColorModeValue(
    semantic.background.primary.light,
    semantic.background.primary.dark,
  );

  return (
    <Box
      mt={tokens.spacing.lg}
      p={tokens.spacing.md}
      bg={bgColor}
      borderRadius={tokens.borders.radii.md}
      boxShadow={tokens.shadows.sm}>
      <Heading color={textColor} mb={tokens.spacing.md} size="lg">
        Settings
      </Heading>
      <VStack width="100%" spacing={tokens.spacing.md} p={tokens.spacing.md} align="self-start">
        <HStack width="80%">
          <Text
            fontSize={tokens.typography.fontSizes.md}
            width="20%"
            color={textColor}
            fontWeight={tokens.typography.fontWeights.medium}>
            Workspace Folder
          </Text>
          <Input
            borderColor={borderColor}
            color={textColor}
            bg={inputBgColor}
            _focus={{ borderColor: accentColor }}
          />
        </HStack>
        <HStack width="80%">
          <Text
            fontSize={tokens.typography.fontSizes.md}
            width="20%"
            color={textColor}
            fontWeight={tokens.typography.fontWeights.medium}>
            Simulated
          </Text>
          <Input
            borderColor={borderColor}
            color={textColor}
            bg={inputBgColor}
            _focus={{ borderColor: accentColor }}
          />
        </HStack>
        <HStack width="80%">
          <Text
            fontSize={tokens.typography.fontSizes.md}
            width="20%"
            color={textColor}
            fontWeight={tokens.typography.fontWeights.medium}>
            Admin emails
          </Text>
          <Input
            borderColor={borderColor}
            color={textColor}
            bg={inputBgColor}
            _focus={{ borderColor: accentColor }}
          />
        </HStack>
        <HStack width="80%">
          <Text
            fontSize={tokens.typography.fontSizes.md}
            width="20%"
            color={textColor}
            fontWeight={tokens.typography.fontWeights.medium}>
            Workcell
          </Text>
          <Input
            borderColor={borderColor}
            color={textColor}
            bg={inputBgColor}
            _focus={{ borderColor: accentColor }}
          />
        </HStack>
        <HStack width="80%">
          <Text
            fontSize={tokens.typography.fontSizes.md}
            width="20%"
            color={textColor}
            fontWeight={tokens.typography.fontWeights.medium}>
            Workcell
          </Text>
          <Input
            borderColor={borderColor}
            color={textColor}
            bg={inputBgColor}
            _focus={{ borderColor: accentColor }}
          />
        </HStack>
        <HStack width="80%">
          <Text
            fontSize={tokens.typography.fontSizes.md}
            width="20%"
            color={textColor}
            fontWeight={tokens.typography.fontWeights.medium}>
            Workcell
          </Text>
          <Input
            borderColor={borderColor}
            color={textColor}
            bg={inputBgColor}
            _focus={{ borderColor: accentColor }}
          />
        </HStack>
        <Button
          size="md"
          leftIcon={<Icon as={FormIcons.Check} />}
          bg={accentColor}
          color="white"
          _hover={{ bg: `${accentColor}90` }}
          _active={{ bg: `${accentColor}70` }}
          borderRadius={tokens.borders.radii.md}
          mt={tokens.spacing.sm}>
          Save
        </Button>
      </VStack>
    </Box>
  );
};
