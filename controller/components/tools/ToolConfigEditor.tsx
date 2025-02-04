import { trpc } from "@/utils/trpc";
import {
  Box,
  Button,
  HStack,
  Spinner,
  Switch,
  Text,
  Textarea,
  Tooltip,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { Any } from "@grpc/grpc-js/build/src/generated/google/protobuf/Any";
import { ToolConfig, ToolType } from "gen-interfaces/controller";
import { ToolStatus } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import { useCallback, useEffect, useState } from "react";

function toolSpecificConfig(toolConfig: ToolConfig): Record<string, any> | undefined {
  const toolType = toolConfig.type;
  const config = toolConfig.config;
  if (!config) return;
  if (!(toolType in config)) return;
  return (config as any)[toolType];
}

export function ToolConfigEditor({
  toolId,
  defaultConfig,
}: {
  toolId: string;
  defaultConfig: ToolConfig;
}): JSX.Element {

  const statusQuery = trpc.tool.status.useQuery(
    { toolId: toolId },
    {
      refetchInterval: 1000,
      onSuccess: (data) => {
        if (data) {
          setSimulated(data.status === "SIMULATED");
        }
      },
    },
  );
  const toast = useToast();

  const cytation_error =
    "There are multiple instances of Gen5 software. Please delete them in task manager and try to connect again";
  var error_description = "";
  const configureMutation = trpc.tool.configure.useMutation({
    onSuccess: () => {
      statusQuery.refetch();
    },
    onError: (data) => {
      error_description = data.message;
      toast.closeAll(),
        toast({
          title: "Failed to connect to instrument",
          description: `${error_description}`,
          status: "error",
          duration: 10000,
          isClosable: true,
          position: "top",
        });
    },
  });
  const { isLoading } = configureMutation;
  const [isSimulated, setSimulated] = useState(false);
  const isReachable =
    statusQuery.isSuccess &&
    statusQuery.data &&
    statusQuery.data.status !== ToolStatus.OFFLINE &&
    toolId != "1206";
  const toolType = defaultConfig.type;
  const config = toolSpecificConfig(defaultConfig);
  const [configString, setConfigString] = useState(JSON.stringify(config, null, 2));

  const saveConfig = async (simulated:boolean) => {
    const config = {
      simulated: simulated,
      [toolType]: JSON.parse(configString),
    };
    configureMutation.mutate({
      toolId: toolId,
      config: config,
    });
  };

  return (
    <VStack spacing={2} align="start">
      <HStack spacing={2}>
        <Tooltip label="Send commands to the tool server, and have them simulated">
          <Text>Simulate:</Text>
        </Tooltip>
        <Switch
          isChecked={isSimulated}
          isDisabled={!isReachable}
          colorScheme="orange"
          onChange={async (e) => {
            setSimulated(e.target.checked);
            await saveConfig(e.target.checked);
          }}
        />
      </HStack>

      <Button onClick={async()=> saveConfig(false)} isDisabled={!isReachable || isSimulated}>
        Connect
      </Button>
      {isLoading && <Spinner ml={2} />} {/* Spinner appears next to the button when loading */}
    </VStack>
  );
}