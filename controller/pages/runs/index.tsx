import React from "react";
import { RunsComponent } from "@/components/runs/RunsComponent";
import { ToolStatusCardsComponent } from "@/components/tools/ToolStatusCardsComponent";
import { QueueStatusComponent } from "@/components/runs/QueueStatuscomponent";
import { VStack, Box } from "@chakra-ui/react";

export default function Page() {
  return (
    <VStack>
      <Box borderWidth="1px" borderRadius="lg" boxShadow="lg" p={4} width="100%" mb={6}>
        <RunsComponent />
      </Box>
    </VStack>
  );
}
