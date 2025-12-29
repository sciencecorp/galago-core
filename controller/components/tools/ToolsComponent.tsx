import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import ToolStatusCard from "@/components/tools/ToolStatusCard";
import {
  Box,
  VStack,
  Flex,
  useColorModeValue,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Divider,
  Icon,
  Card,
  CardBody,
  InputGroup,
  InputLeftElement,
  Input,
  Spacer,
  Button,
} from "@chakra-ui/react";
import { NewToolModal } from "./NewToolModal";
import { PageHeader } from "@/components/ui/PageHeader";
import { Search } from "lucide-react";
import { Power, Wrench } from "lucide-react";
import { successToast, errorToast, infoToast } from "../ui/Toast";
import { Tool } from "@/types/api";

interface ToolStatusCardsProps {
  showAsGrid?: boolean;
}

export const ToolStatusCardsComponent: React.FC<ToolStatusCardsProps> = (props) => {
  const [toolIds, setToolIds] = useState<string[]>([]);
  const { data: selectedWorkcellData, refetch: refetchWorkcell } =
    trpc.workcell.getSelectedWorkcell.useQuery();
  const [selectedWorkcell, setSelectedWorkcell] = useState<string | null>(null);
  const [connectingLoading, setConnectingLoading] = useState(false);
  const headerBg = useColorModeValue("white", "gray.700");
  const tableBgColor = useColorModeValue("white", "gray.700");
  const { data: allTools, refetch: refetchAllTools } = trpc.tool.getAll.useQuery();
  const configureMutation = trpc.tool.configure.useMutation();
  const { data: workcells } = trpc.workcell.getAll.useQuery();

  const [thisWorkcellTools, setThisWorkcellTools] = useState<Tool[]>([]);
  const { data: fetchedIds, refetch } = trpc.tool.availableIDs.useQuery({
    workcellId: workcells?.find((workcell) => workcell.name === selectedWorkcellData)?.id,
  });

  const connectAllTools = async () => {
    setConnectingLoading(true);
    const results: {
      success: string[];
      failed: Array<{ toolId: string; error: string }>;
    } = {
      success: [],
      failed: [],
    };

    try {
      if (allTools) {
        // Create a separate configuration instance for each tool to properly handle errors
        const configureToolWithErrorHandling = async (tool: (typeof allTools)[0]) => {
          const toolId = tool.name.toLocaleLowerCase().replaceAll(" ", "_");

          // Skip tool_box and tools without configs
          if (toolId === "tool_box" || !tool.config) {
            return { status: "skipped", toolId };
          }

          try {
            // Use mutateAsync to properly catch errors for this specific tool
            await configureMutation.mutateAsync({
              toolId: toolId,
              config: {
                toolId: toolId,
                simulated: tool.config.simulated,
                [tool.type]: tool.config,
              },
            });

            // Record successful configuration
            results.success.push(toolId);
            return { status: "fulfilled", toolId };
          } catch (error: any) {
            // Get detailed error message
            let errorMessage = "Unknown error occurred";

            if (error.message) {
              errorMessage = error.message;
            } else if (typeof error === "string") {
              errorMessage = error;
            }

            // Record the failure with detailed error
            results.failed.push({ toolId, error: errorMessage });

            // Show individual error toast for each failed tool
            errorToast(`Failed to connect ${tool.name}`, errorMessage);

            return { status: "rejected", toolId, error: errorMessage };
          }
        };

        // Process tools sequentially to ensure clear error reporting for each
        for (const tool of allTools) {
          await configureToolWithErrorHandling(tool);
        }

        // Show summary toast when complete
        if (results.failed.length > 0 && results.success.length > 0) {
          infoToast(
            "Connection Process Complete",
            `Connected ${results.success.length} tools, failed to connect ${results.failed.length} tools.`,
          );
        } else if (results.failed.length > 0) {
          errorToast(
            "Connection Process Failed",
            `Failed to connect any tools. Check individual error messages.`,
          );
        } else if (results.success.length > 0) {
          successToast(
            "Connection Process Successful",
            `Successfully connected all ${results.success.length} tools.`,
          );
        }

        // Refresh all data
        await refetch();
        await refetchWorkcell();
        await refetchAllTools();
      }
    } catch (error) {
      console.error("Unexpected error in connect all process:", error);

      errorToast(
        "Connection Process Error",
        "An unexpected error occurred during the connection process.",
      );
    } finally {
      setConnectingLoading(false);
    }
  };

  useEffect(() => {
    if (fetchedIds) {
      setToolIds(fetchedIds);
    }
  }, [fetchedIds]);

  useEffect(() => {
    if (selectedWorkcellData) {
      setSelectedWorkcell(selectedWorkcellData);
    }
  }, [selectedWorkcellData]);

  return (
    <Box maxW="100%">
      <VStack spacing={4} align="stretch">
        <Card bg={headerBg} shadow="md">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <PageHeader
                titleIcon={<Icon as={Wrench} boxSize={8} color="teal.500" />}
                title="Tools"
                subTitle="Manage and monitor your connected tools"
                mainButton={
                  <Button
                    size="sm"
                    isLoading={connectingLoading}
                    disabled={toolIds.length === 0}
                    onClick={connectAllTools}
                    variant="outline"
                    leftIcon={<Icon as={Power} size={14} />}>
                    Connect All
                  </Button>
                }
                secondaryButton={<NewToolModal isDisabled={!selectedWorkcell} />}
              />
              <Divider />
              <StatGroup>
                <Stat>
                  <StatLabel>Total Tools</StatLabel>
                  <StatNumber>{toolIds.length}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Selected Workcell</StatLabel>
                  <StatNumber fontSize="lg">{selectedWorkcell || "None"}</StatNumber>
                </Stat>
              </StatGroup>
              <Divider />
              <HStack spacing={4} width="100%">
                <InputGroup maxW="400px">
                  <InputLeftElement pointerEvents="none">
                    <Search size={14} />
                  </InputLeftElement>
                  <Input
                    placeholder="Search tools..."
                    onChange={(e) => {
                      const searchTerm = e.target.value.toLowerCase();
                      setToolIds(
                        fetchedIds?.filter((id) => id.toLowerCase().includes(searchTerm)) || [],
                      );
                    }}
                    bg={tableBgColor}
                  />
                </InputGroup>
                <Spacer />
              </HStack>
            </VStack>
          </CardBody>
        </Card>
        <Card bg={headerBg} shadow="md">
          <CardBody>
            <Flex wrap="wrap" justify="space-evenly" mt={4} align="stretch" gap={4}>
              {toolIds.map((toolId, index) => (
                <ToolStatusCard key={`${toolId}-${index}`} toolId={toolId} />
              ))}
            </Flex>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};
