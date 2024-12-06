import React from "react";
import { RunsComponent } from "@/components/runs/RunsComponent";
import { ToolStatusCardsComponent } from "@/components/tools/ToolStatusCardsComponent";
import { QueueStatusComponent } from "@/components/runs/QueueStatuscomponent";
import { VStack, Box } from "@chakra-ui/react";

export default function Page() {
  return (
    <Box maxW="100%">
      <RunsComponent />
    </Box>
  );
}
