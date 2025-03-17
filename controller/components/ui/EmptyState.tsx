import React from "react";
import { VStack, useColorModeValue, Text } from "@chakra-ui/react";
import { Search2Icon } from "@chakra-ui/icons";

export interface EmptyStateProps {
  title?: string;
  size?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No results found",
  size = "sm",
}) => (
  <VStack
    width="100%"
    minHeight={size}
    justify="center"
    borderRadius="md"
    bg={useColorModeValue("gray.50", "gray.700")}
    opacity="0.7"
    spacing={5}>
    <Search2Icon boxSize={6} />
    <VStack spacing={0}>
      <Text fontWeight="semibold" fontSize="sm">
        It's empty here.
      </Text>
      <Text fontWeight="medium" fontSize="xs">
        {title}
      </Text>
    </VStack>
  </VStack>
);
