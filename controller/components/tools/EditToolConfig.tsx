import React from "react";
import { Box } from "@chakra-ui/react";
import { ToolType } from "gen-interfaces/controller";
import { ToolStatus } from "gen-interfaces/tools/grpc_interfaces/tool_base";

export const EditToolConfig: React.FC = () => {
  const availableTools = Object.values(ToolType);

  const getToolClassInstance = (toolType: ToolType) => {
    const toolClass = availableTools.find((tool) => tool === toolType);
  };

  return (
    <Box>
      <Box>EditToolConfig</Box>
    </Box>
  );
};
