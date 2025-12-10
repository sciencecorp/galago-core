import { Box, HStack, useDisclosure, Text, Center } from "@chakra-ui/react";
import SwimLaneCommandComponent from "./SwimLaneCommandComponent";
import { RunCommand } from "@/types";
import React, { useState } from "react";
import { CommandDetailsDrawer } from "@/components/protocols/CommandDetailsDrawer"; // Import the CommandDetailsDrawer component

interface SwimLaneProps {
  runCommands: RunCommand[];
  showAllCommands: boolean;
}

export const SwimLaneComponent: React.FC<SwimLaneProps> = ({ runCommands, showAllCommands }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCommand, setSelectedCommand] = useState<RunCommand | null>(null);

  const displayedCommands = showAllCommands
    ? runCommands
    : runCommands.filter((cmd) => cmd.status !== "COMPLETED");

  const handleSave = (updatedCommand: any) => {
    // Will be implemented later when save functionality is needed
  };

  return (
    <>
      {displayedCommands.length > 0 ? (
        <Box width="100%" overflowX="auto" whiteSpace="nowrap" p={2}>
          {/* Use the imported CommandDetailsDrawer component */}
          <CommandDetailsDrawer
            isOpen={isOpen}
            onClose={onClose}
            selectedCommand={selectedCommand}
            onSave={handleSave}
            isEditing={false} // Set to false to disable editing
          />

          <HStack spacing={0} width="900px">
            {displayedCommands.map((command, i) => {
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
      ) : (
        <Center height="50px"> No pending commands to display ...</Center>
      )}
    </>
  );
};
