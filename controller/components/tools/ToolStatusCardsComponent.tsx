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
} from "@chakra-ui/react";
import styled from "@emotion/styled";
import { NewToolModal } from "./NewToolModal";
import { PageHeader } from "@/components/ui/PageHeader";
import { BsTools } from "react-icons/bs";
import { SearchIcon } from "@chakra-ui/icons";

interface ToolStatusCardsProps {
  showAsGrid?: boolean;
}

export const ToolStatusCardsComponent: React.FC<ToolStatusCardsProps> = (props) => {
  const { data: fetchedIds, refetch } = trpc.tool.availableIDs.useQuery();
  const [toolIds, setToolIds] = useState<string[]>([]);
  const { data: selectedWorkcellData, refetch: refetchWorkcell } =
    trpc.workcell.getSelectedWorkcell.useQuery();
  const [selectedWorkcell, setSelectedWorkcell] = useState<string | null>(null);

  const headerBg = useColorModeValue("white", "gray.700");
  const tableBgColor = useColorModeValue("white", "gray.700");

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
