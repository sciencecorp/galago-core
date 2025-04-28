import { trpc } from "@/utils/trpc";
import { Button, HStack, Switch, Text, Tooltip, VStack } from "@chakra-ui/react";
import { ToolConfig } from "gen-interfaces/controller";
import { ToolStatus } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import { useState } from "react";
import { successToast, errorToast, infoToast } from "../ui/Toast";
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

  var error_description = "Error connecting to instrument";
  const configureMutation = trpc.tool.configure.useMutation({
    onSuccess: () => {
      statusQuery.refetch();
    },
    onError: (data: any) => {
      if (data.message) {
        error_description = data.message;
      }
      errorToast("Failed to connect to instrument", `${error_description}`);
    },
  });
  const { isLoading } = configureMutation;
  const [isSimulated, setSimulated] = useState(false);
  const isReachable =
    statusQuery.isSuccess &&
    statusQuery.data &&
    statusQuery.data.status !== ToolStatus.OFFLINE &&
    toolId != "tool_box";
  const toolType = defaultConfig.type;
  const config = toolSpecificConfig(defaultConfig);
  const [configString, setConfigString] = useState(JSON.stringify(config, null, 2));
  const [toolConfiguring, setToolConfiguring] = useState(false);

  const saveConfig = async (simulated: boolean) => {
    setToolConfiguring(true);
    const config = {
      toolId: toolId,
      simulated: simulated,
      [toolType]: JSON.parse(configString),
    };
    await configureMutation.mutate({
      toolId: toolId,
      config: config,
    });
    setToolConfiguring(false);
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
      <Button
        isLoading={isLoading}
        disabled={isLoading}
        onClick={async () => saveConfig(false)}
        isDisabled={!isReachable || isSimulated}>
        Connect
      </Button>
    </VStack>
  );
}
