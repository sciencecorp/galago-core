import { trpc } from "@/utils/trpc";
import {
  Button,
  HStack,
  Switch,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import { ToolConfig } from "gen-interfaces/controller";
import { ToolStatus } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import { useState, useEffect } from "react";
import { successToast, errorToast, infoToast } from "../ui/Toast";

function toolSpecificConfig(
  toolConfig: ToolConfig,
): Record<string, any> | undefined {
  const toolType = toolConfig.type;
  const config = toolConfig.config;
  if (!config) return;
  if (!(toolType in config)) return;
  return (config as any)[toolType];
}

export function ToolConfigEditor({
  toolId,
  defaultConfig,
  onConfiguring,
}: {
  toolId: string;
  defaultConfig: ToolConfig;
  onConfiguring?: (isConfiguring: boolean) => void;
}): JSX.Element {
  // Get the tRPC context once at component level
  const context = trpc.useContext();

  // Force refresh tool info on each render
  const toolInfoQuery = trpc.tool.info.useQuery(
    { toolId: toolId },
    {
      refetchInterval: 2000, // Refetch every 2 seconds
      staleTime: 0, // Consider data stale immediately
    },
  );

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
      toolInfoQuery.refetch(); // Also refetch the tool info
      if (onConfiguring) onConfiguring(false);

      // Force invalidate all related queries
      context.tool.info.invalidate();
      context.tool.status.invalidate();
      context.tool.availableIDs.invalidate();
    },
    onError: (data: any) => {
      if (data.message) {
        error_description = data.message;
      }
      errorToast("Failed to connect to instrument", `${error_description}`);
      if (onConfiguring) onConfiguring(false);
    },
  });

  const { isLoading } = configureMutation;
  const [isSimulated, setSimulated] = useState(false);

  // Get the latest config from the query instead of defaultConfig
  const latestConfig = toolInfoQuery.data || defaultConfig;

  // Get tool type and config from the latest data
  const toolType = latestConfig.type;
  const config = toolSpecificConfig(latestConfig);

  const [configString, setConfigString] = useState("");
  const [toolConfiguring, setToolConfiguring] = useState(false);

  // Update configString whenever config changes
  useEffect(() => {
    if (config) {
      setConfigString(JSON.stringify(config, null, 2));
    }
  }, [config]);

  const isReachable =
    statusQuery.isSuccess &&
    statusQuery.data &&
    statusQuery.data.status !== ToolStatus.OFFLINE &&
    toolId != "tool_box";

  const saveConfig = async (simulated: boolean) => {
    setToolConfiguring(true);
    if (onConfiguring) onConfiguring(true);
    const config = {
      toolId: toolId,
      simulated: simulated,
      [toolType]: JSON.parse(configString),
    };

    try {
      await configureMutation.mutateAsync({
        toolId: toolId,
        config: config,
      });

      // Show success toast
      successToast("Tool configuration updated", "");

      // Force refetch all related queries
      toolInfoQuery.refetch();
      statusQuery.refetch();

      // Force invalidate tool info cache - use the context from component level
      context.tool.info.invalidate();
    } catch (error) {
      // Error is handled by onError in mutation
    } finally {
      setToolConfiguring(false);
    }
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
        disabled={isLoading || toolConfiguring}
        onClick={async () => saveConfig(false)}
        isDisabled={!isReachable || isSimulated}
        isLoading={toolConfiguring}
      >
        Connect
      </Button>
    </VStack>
  );
}
