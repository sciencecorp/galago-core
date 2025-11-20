import {
  VStack,
  Box,
  Button,
  HStack,
  Heading,
  Select,
  Center,
  Flex,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import React from "react";
import { LogView } from "@/components/logs/LogView";

export default function ToolLogs() {
  return (
    <Flex>
      <Box width="100%" mr="10%">
        <LogView />
      </Box>
    </Flex>
  );
}
