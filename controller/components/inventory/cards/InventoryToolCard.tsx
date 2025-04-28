import React, { useState } from "react";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Spinner,
  Text,
  Flex,
  Image,
  useDisclosure,
  IconButton,
  SimpleGrid,
  VStack,
  HStack,
  Badge,
  Divider,
  Tooltip,
} from "@chakra-ui/react";
import { Nest, Plate, Reagent } from "@/types/api";
import NestModal from "../modals/NestModal";
import styled from "@emotion/styled";
import { trpc } from "@/utils/trpc";
import { PiToolbox } from "react-icons/pi";
import { useColorModeValue } from "@chakra-ui/react";
import { BsGrid3X3, BsBoxSeam } from "react-icons/bs";
import { FaFlask } from "react-icons/fa";
import { Icon } from "@/components/ui/Icons";
import { useCommonColors, useTextColors } from "@/components/ui/Theme";

const StyledCard = styled(Card)`
  display: flex;
  flex-direction: column;
  height: 280px;
  width: 280px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: 0.3s ease-out;
  margin: 0 15px;
  margin-top: 10px;
  margin-bottom: 20px;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

interface InventoryToolCardProps {
  toolId: number;
  nests: Nest[];
  plates: Plate[];
  onCreateNest: (
    toolId: number,
    nestName: string,
    nestRow: number,
    nestColumn: number,
  ) => Promise<void>;
  onCreatePlate: (
    nestId: number,
    plateData: { name: string; barcode: string; plate_type: string },
  ) => void;
  onCreateReagent: (nestId: number, reagentData: Omit<Reagent, "id" | "well_id">) => void;
  onNestClick: (nest: Nest) => void;
  onDeleteNest: (nestId: number) => Promise<void>;
  onPlateClick?: (plate: Plate) => void;
}

export const InventoryToolCard: React.FC<InventoryToolCardProps> = ({
  toolId,
  nests,
  plates,
  onCreateNest,
  onCreatePlate,
  onCreateReagent,
  onNestClick,
  onDeleteNest,
  onPlateClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { cardBg, borderColor, hoverBg } = useCommonColors();
  const { secondary: iconColor } = useTextColors();
  const statBg = useColorModeValue("gray.50", "gray.800");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const workcells = trpc.workcell.getAll.useQuery();
  const SelectedWorkcellName = trpc.workcell.getSelectedWorkcell.useQuery();
  const selectedWorkcell = workcells.data?.find(
    (workcell) => workcell.name === SelectedWorkcellName.data,
  );
  const workcellTools = selectedWorkcell?.tools;
  const toolData = workcellTools?.find((tool) => tool.id === toolId);
  const { name } = toolData || {};

  const toolNests = nests.filter((nest) => nest.name?.toString() === name?.toString());
  const toolPlates = plates.filter((plate) => toolNests.some((nest) => nest.id === plate.nest_id));

  // Get reagent count for this tool's plates
  const { data: plateReagents = [] } = trpc.inventory.getReagents.useQuery<Reagent[]>(
    toolPlates[0]?.id || 0,
    {
      enabled: toolPlates.length > 0,
    },
  );

  // Count reagents
  const reagentCount = (plateReagents as Reagent[]).length || 0;

  const renderToolImage = (config: any) => {
    if (!config?.image_url) {
      return <Box></Box>;
    } else if (config.name === "Tool Box") {
      return (
        <Box display="flex" justifyContent="center" alignItems="center">
          <IconButton
            aria-label="Tool Box"
            icon={<PiToolbox style={{ width: "100%", height: "100%" }} />}
            variant="ghost"
            colorScheme="teal"
            isRound
            boxSize="100px"
          />
        </Box>
      );
    } else {
      return (
        <Image
          src={`/tool_icons/${config.type}.png`}
          alt={name}
          objectFit="contain"
          height="80px"
          width="80px"
          opacity={0.9}
        />
      );
    }
  };

  return (
    <>
      <Card
        bg={cardBg}
        borderColor={borderColor}
        borderWidth="1px"
        borderRadius="lg"
        onClick={onOpen}
        transition="all 0.2s"
        cursor="pointer"
        _hover={{ transform: "translateY(-2px)", shadow: "lg" }}>
        <CardHeader pb={4}>
          <VStack align="stretch" spacing={2}>
            <Flex justify="space-between" align="center">
              <HStack spacing={3}>
                <Box boxSize="50px" display="flex" alignItems="center" justifyContent="center">
                  {toolData ? renderToolImage(toolData) : <Spinner size="md" />}
                </Box>
                <Box>
                  <Heading size="md">{name}</Heading>
                  <Text fontSize="sm" color="gray.500">
                    Inventory
                  </Text>
                </Box>
              </HStack>
            </Flex>
          </VStack>
        </CardHeader>

        <Divider />

        <CardBody pt={4}>
          <VStack align="stretch" spacing={4}>
            <SimpleGrid columns={3} spacing={2}>
              <Tooltip label="Total Nests" placement="top">
                <Box p={2} bg={statBg} borderRadius="md" textAlign="center">
                  <Icon as={BsGrid3X3} color={iconColor} mb={1} />
                  <Text fontWeight="bold" fontSize="md">
                    {toolNests.length}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Nests
                  </Text>
                </Box>
              </Tooltip>

              <Tooltip label="Total Plates" placement="top">
                <Box p={2} bg={statBg} borderRadius="md" textAlign="center">
                  <Icon as={BsBoxSeam} color={iconColor} mb={1} />
                  <Text fontWeight="bold" fontSize="md">
                    {toolPlates.length}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Plates
                  </Text>
                </Box>
              </Tooltip>

              <Tooltip label="Total Reagents" placement="top">
                <Box p={2} bg={statBg} borderRadius="md" textAlign="center">
                  <Icon as={FaFlask} color={iconColor} mb={1} />
                  <Text fontWeight="bold" fontSize="md">
                    {reagentCount}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Reagents
                  </Text>
                </Box>
              </Tooltip>
            </SimpleGrid>
          </VStack>
        </CardBody>
      </Card>

      <NestModal
        isOpen={isOpen}
        onClose={onClose}
        toolName={name || ""}
        nests={toolNests}
        plates={plates}
        selectedNests={[]}
        isMultiSelect={true}
        onNestSelect={(nestIds) => {
          nestIds.forEach((id) => {
            const nest = nests.find((n) => n.id === id);
            if (nest) onNestClick(nest);
          });
        }}
        onCreateNest={(row, column) => onCreateNest(toolId, `${name}`, row, column)}
        onDeleteNest={onDeleteNest}
        onPlateClick={onPlateClick}
      />
    </>
  );
};
