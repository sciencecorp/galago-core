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
  useToast,
} from "@chakra-ui/react";
import { NewToolModal } from "./NewToolModal";
import { PageHeader } from "@/components/ui/PageHeader";
import { BsTools } from "react-icons/bs";
import { SearchIcon } from "@chakra-ui/icons";
import { FaPlugCircleCheck } from "react-icons/fa6";

interface ToolStatusCardsProps {
  showAsGrid?: boolean;
}

export const ToolStatusCardsComponent: React.FC<ToolStatusCardsProps> = (props) => {
  const { data: fetchedIds, refetch } = trpc.tool.availableIDs.useQuery();
  const [toolIds, setToolIds] = useState<string[]>([]);
  const { data: selectedWorkcellData, refetch: refetchWorkcell } =
    trpc.workcell.getSelectedWorkcell.useQuery();
  const [selectedWorkcell, setSelectedWorkcell] = useState<string | null>(null);
  const [connectingLoading, setConnectingLoading] = useState(false);
  const headerBg = useColorModeValue("white", "gray.700");
  const tableBgColor = useColorModeValue("white", "gray.700");
  const { data: allTools, refetch: refetchAllTools } = trpc.tool.getAll.useQuery();
  const configureMutation = trpc.tool.configure.useMutation();

  const toast = useToast();

  const connectAllTools = async () => {
    setConnectingLoading(true);

    // Track results for reporting
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
            toast({
              title: `Failed to connect ${tool.name}`,
              description: errorMessage,
              status: "warning",
              duration: 10000,
              isClosable: true,
              position: "bottom-right",
            });

            return { status: "rejected", toolId, error: errorMessage };
          }
        };

        // Process tools sequentially to ensure clear error reporting for each
        for (const tool of allTools) {
          await configureToolWithErrorHandling(tool);
        }

        // Show summary toast when complete
        if (results.failed.length > 0 && results.success.length > 0) {
          toast({
            title: "Connection Process Complete",
            description: `Connected ${results.success.length} tools, failed to connect ${results.failed.length} tools.`,
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
        } else if (results.failed.length > 0) {
          toast({
            title: "Connection Process Failed",
            description: `Failed to connect any tools. Check individual error messages.`,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
        } else if (results.success.length > 0) {
          toast({
            title: "Connection Process Successful",
            description: `Successfully connected all ${results.success.length} tools.`,
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
        }

        // Refresh all data
        await refetch();
        await refetchWorkcell();
        await refetchAllTools();
      }
    } catch (error) {
      console.error("Unexpected error in connect all process:", error);

      toast({
        title: "Connection Process Error",
        description: "An unexpected error occurred during the connection process.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
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
                titleIcon={<Icon as={BsTools} boxSize={8} color="teal.500" />}
                title="Tools"
                subTitle="Manage and monitor your connected tools"
                mainButton={
                  <Button
                    isLoading={connectingLoading}
                    disabled={toolIds.length === 0}
                    onClick={connectAllTools}
                    variant="outline"
                    leftIcon={<Icon as={FaPlugCircleCheck} />}>
                    Connect All
                  </Button>
                }
                secondaryButton={
                  <NewToolModal isDisabled={selectedWorkcell === "" || selectedWorkcell === null} />
                }
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
                    <SearchIcon color="gray.300" />
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
