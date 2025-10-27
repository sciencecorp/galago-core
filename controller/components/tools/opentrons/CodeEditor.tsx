import React from "react";
import { Box, HStack, VStack } from "@chakra-ui/react";
import { ScriptsEditor } from "@/components/scripts/CodeEditor";
import { OpentronsControlPanel } from "@/components/tools/opentrons/OpentronsControlPanel";
import ToolStatusCard from "@/components/tools/ToolStatusCard";
import { Tool } from "@/types/api";
import { ToolConfig } from "gen-interfaces/controller";

interface CodeEditorProps {
  toolConfig: ToolConfig;
}
export const OT2CodeEditor: React.FC<CodeEditorProps> = ({ toolConfig }) => {
  const [isSimulated, setIsSimulated] = React.useState(false);

  return (
    <HStack spacing={4} align="start" width="100%">
      <VStack width="280px" flexShrink={0} spacing={4} align="stretch">
        <Box>
          <ToolStatusCard toolId={toolConfig?.name} />
        </Box>
        <OpentronsControlPanel
          toolId={toolConfig?.name}
          onSimulate={(simulated) => setIsSimulated(simulated)}
        />
      </VStack>

      <Box flex={1} width="100%">
        <ScriptsEditor
          scriptsEnvironment="opentrons"
          toolId={toolConfig?.name}
          isSimulated={isSimulated}
        />
      </Box>
    </HStack>
  );
};
