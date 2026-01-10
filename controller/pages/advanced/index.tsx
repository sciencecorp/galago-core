import { Box, Flex } from "@chakra-ui/react";
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
