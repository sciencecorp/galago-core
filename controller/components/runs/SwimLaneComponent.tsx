import { Box, HStack } from "@chakra-ui/react";
import { SwimLaneCommandBox } from "@/components/UI/SwimLaneCommandBox";
import { RunCommand } from "@/types";
import React, { useEffect } from "react";
import { trpc } from "@/utils/trpc";

interface SwimLaneProps {
  runCommands: RunCommand[];
}

export const SwimLaneComponent: React.FC<SwimLaneProps> = ({ runCommands }) => {
  const skipMutation = trpc.commandQueue.skipCommand.useMutation();
  const skipUntilMutation = trpc.commandQueue.skipCommandsUntil.useMutation();
  const execMutation = trpc.tool.runCommand.useMutation();

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
            <SwimLaneCommandBox
              key={i}
              command={command}
              isLast={i === runCommands.length - 1}
              showActions={true}
              onSkip={queued ? () => skipMutation.mutate(command.queueId) : undefined}
              onSkipUntil={queued ? () => skipUntilMutation.mutate(command.queueId) : undefined}
              onSendToTool={() => execMutation.mutate(command.commandInfo)}
            />
          );
        })}
      </HStack>
    </Box>
  );
};
