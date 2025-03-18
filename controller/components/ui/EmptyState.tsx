import React from "react";
import { VStack, useColorModeValue, Text } from "@chakra-ui/react";
import { Search2Icon } from "@chakra-ui/icons";
import { BsInbox } from "react-icons/bs";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  size?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "It's empty here",
  description,
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
    <BsInbox fontSize={20} />
    <VStack spacing={0}>
      <Text fontWeight="semibold" fontSize="sm">
        {title}
      </Text>
      {description && (
        <Text fontWeight="medium" fontSize="xs">
          {description}
        </Text>
      )}
    </VStack>
  </VStack>
);
