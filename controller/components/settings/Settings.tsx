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
} from "@chakra-ui/react";

export const Settings: React.FC = () => {
  return (
    <Box mt={12} p={8}>
      <Heading>Settings</Heading>
      <VStack width="100%" spacing={5} p={5} align="self-start">
        <HStack width="80%">
          <Text fontSize="x-large" width="20%">
            Workspace Folder
          </Text>
          <Input></Input>
        </HStack>
        <HStack width="80%">
          <Text as="b" fontSize="x-large" width="20%">
            Simulated
          </Text>
          <Input></Input>
        </HStack>
        <HStack width="80%">
          <Text as="b" fontSize="x-large" width="20%">
            Admin emails
          </Text>
          <Input></Input>
        </HStack>
        <HStack width="80%">
          <Text as="b" fontSize="x-large" width="20%">
            Workcell
          </Text>
          <Input></Input>
        </HStack>
        <HStack width="80%">
          <Text as="b" fontSize="x-large" width="20%">
            Workcell
          </Text>
          <Input></Input>
        </HStack>
        <HStack width="80%">
          <Text as="b" fontSize="x-large" width="20%">
            Workcell
          </Text>
          <Input></Input>
        </HStack>
        <Button colorScheme="teal" size="lg">
          Save
        </Button>
      </VStack>
    </Box>
  );
};
