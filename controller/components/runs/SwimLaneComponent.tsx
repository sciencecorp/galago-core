import {
  VStack,
  Box,
  HStack,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  Divider,
  DrawerBody,
  DrawerCloseButton,
  useDisclosure,
  Text,
} from "@chakra-ui/react";
import SwimLaneCommandComponent from "@/components/runs/SwimLaneCommandComponent";
import { RunCommand } from "@/types";
import React, { useState } from "react";
import { capitalizeFirst } from "@/utils/parser";
import { trpc } from "@/utils/trpc";

interface SwimLaneProps {
  runCommands: RunCommand[];
}

export const SwimLaneComponent: React.FC<SwimLaneProps> = ({ runCommands }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCommand, setSelectedCommand] = useState<RunCommand | null>(null);
  const infoQuery = trpc.tool.info.useQuery(
    { toolId: selectedCommand?.commandInfo.toolId || "" },
    { enabled: !!selectedCommand },
  );
  let toolName = infoQuery.data?.name || "undefined";

  return (
    <Box width="100%" overflowX="auto" whiteSpace="nowrap" p={2}>
      <Drawer isOpen={isOpen} onClose={onClose} placement="right" size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Command Details</DrawerHeader>
          <DrawerBody>
            {selectedCommand ? (
              <VStack spacing={4} align="self-start">
                <Divider />
                <Text as="b">Tool:</Text>
                <Text>{capitalizeFirst(toolName)}</Text>
                <Divider />
                <Text as="b">Name:</Text>
                <Text>
                  {capitalizeFirst(selectedCommand.commandInfo.command.replaceAll("_", " "))}
                </Text>
                <Divider />
                <Text as="b" fontSize="18px">
                  Parameters
                </Text>
                <VStack align="stretch" spacing={2} w="100%">
                  {Object.entries(selectedCommand.commandInfo.params).map(([key, value], index) => (
                    <>
                      <Text as="b" flex="1">
                        {capitalizeFirst(key).replaceAll("_", " ")}:
                      </Text>
                      <Box flex="3">
                        <input
                          type="text"
                          defaultValue={value}
                          style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid lightgray",
                            borderRadius: "4px",
                          }}
                          onChange={(e) => console.log(`Updated ${key}: ${e.target.value}`)}
                        />
                      </Box>
                    </>
                  ))}
                </VStack>
              </VStack>
            ) : (
              <Text>No command selected.</Text>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      
      <HStack spacing={0} width="900px">
        {runCommands.map((command, i) => {
          return (
            <SwimLaneCommandComponent
              key={i}
              command={command}
              onCommandClick={(command) => {
                setSelectedCommand(command);
                onOpen();
              }}
            />
          );
        })}
      </HStack>
    </Box>
  );
};
