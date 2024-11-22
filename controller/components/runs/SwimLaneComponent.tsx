import { Box, HStack } from "@chakra-ui/react";
import SwimLaneCommandComponent from "@/components/runs/SwimLaneCommandComponent";
import { RunCommand } from "@/types";
import React from "react";

interface SwimLaneProps {
  runCommands: RunCommand[];
}

export const SwimLaneComponent: React.FC<SwimLaneProps> = ({ runCommands }) => {
  return (
    <Box
      width="auto"
      id="container"
      flex={1}
      display="flex"
      position="relative"
      maxWidth="100%"
      overflowX="auto"
      overflowY="visible"
      pb={1}
      minHeight="500px"
      zIndex={1}
    >
      <HStack spacing={4} align="flex-start" position="absolute" top="10px">
        {runCommands.map((command, i) => {
          const queued = command.queueId && 
            (command.status === "CREATED" || 
             command.status === "FAILED" || 
             command.status === "STARTED");

          return (
            <SwimLaneCommandComponent
              key={i}
              command={command}
            />
          );
        })}
      </HStack>
    </Box>
  );
};
