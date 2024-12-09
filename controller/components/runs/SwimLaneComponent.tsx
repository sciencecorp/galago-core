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
      width="100%" 
      overflowX="auto" 
      whiteSpace="nowrap" 
      p={4}
    >
      <HStack spacing={0} width="900px">
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
