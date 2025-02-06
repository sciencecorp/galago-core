import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import ToolStatusCard from "@/components/tools/ToolStatusCard";
import {
  Box,
  Spinner,
  Alert,
  Heading,
  VStack,
  useToast,
  IconButton,
  Flex,
  SimpleGrid,
  Switch,
  FormControl,
  FormLabel,
  useColorModeValue,
  HStack,
  Text,
  ButtonGroup,
  Container,
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
  Select,
  Spacer,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { ToolConfig, ToolType } from "gen-interfaces/controller";
import styled from "@emotion/styled";
import { NewToolModal } from "./NewToolModal";
import { PageHeader } from "@/components/ui/PageHeader";
import { load } from "@grpc/grpc-js";
import { Tool } from "@/types/api";
import { BsTools } from "react-icons/bs";
import { SearchIcon } from "@chakra-ui/icons";

const CarouselContainer = styled.div`
  display: flex;
  overflow: hidden;
  position: relative;
  flex-direction: column;
  width: 100%;
  max-width: 1200px;
  margin: auto;
`;

const CardsContainer = styled.div`
  display: flex;
  transition: transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
`;

interface ToolStatusCardsProps {
  showAsGrid?: boolean;
}
export const ToolStatusCardsComponent: React.FC<ToolStatusCardsProps> = (props) => {
  const { showAsGrid } = props;
  const utils = trpc.useContext();
  const toast = useToast();
  const { data: fetchedIds, refetch } = trpc.tool.availableIDs.useQuery();
  const [toolIds, setToolIds] = useState<string[]>([]);
  const { data: selectedWorkcellData, refetch: refetchWorkcell } =
    trpc.workcell.getSelectedWorkcell.useQuery();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const [selectedWorkcell, setSelectedWorkcell] = useState<string | null>(null);

  const containerBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.700");
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
