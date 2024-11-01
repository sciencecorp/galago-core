import CommandComponent from "@/components/protocols/CommandComponent";
import { useState } from "react";
import StatusTag from "@/components/tools/StatusTag";
import { ToolStatusCardsComponent } from "@/components/tools/ToolStatusCardsComponent";
import { trpc } from "@/utils/trpc";
import { Flex, Box } from "@chakra-ui/react";
import SwimLaneCommandComponent from "@/components/runs/SwimLaneCommandComponent";
import { RunCommand } from "@/types";
import React, { useEffect } from "react";

interface SwimLaneProps {
  runCommands: RunCommand[];
}

export const SwimLaneComponent: React.FC<SwimLaneProps> = ({ runCommands }) => {
  // Your component logic goes here
  return (
    <Box
      width="auto"
      id="container"
      flex={1}
      display="flex"
      left="0px"
      right="0px"
      position="absolute"
      border="1px solid #ccc"
      borderRadius="md"
      maxWidth="100%"
      p="2"
      borderTopLeftRadius="2"
      overflowX="auto">
      {runCommands.map((command, i) => (
        <SwimLaneCommandComponent key={i} command={command} />
      ))}
    </Box>
  );
};
