import React from "react";
import { VStack, useColorModeValue, Text, Icon, Heading } from "@chakra-ui/react";
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
    <Icon as={BsInbox} boxSize={8} color="gray.400" />
    <VStack spacing={3} textAlign="center">
      <Heading size="md" color="gray.400" fontWeight="medium">
        {title}
      </Heading>
      {description && (
        <Text color="gray.500" fontSize="sm">
          {description}
        </Text>
      )}
    </VStack>
  </VStack>
);
