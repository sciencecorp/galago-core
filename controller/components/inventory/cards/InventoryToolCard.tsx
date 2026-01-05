import React from "react";
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
  Divider,
  Tooltip,
} from "@chakra-ui/react";
import { Nest, Plate } from "@/types";
import NestModal from "../modals/NestModal";
import { trpc } from "@/utils/trpc";
import { useColorModeValue } from "@chakra-ui/react";
import { Wrench, Grid3x3, Package, FlaskConical } from "lucide-react";
import { Icon } from "@/components/ui/Icons";
import { useCommonColors, useTextColors } from "@/components/ui/Theme";

interface InventoryToolCardProps {
  toolId: number;
  nests: Nest[];
  plates: Plate[];
}

export const InventoryToolCard: React.FC<InventoryToolCardProps> = ({ toolId, nests, plates }) => {
  const { cardBg, borderColor } = useCommonColors();
  const { secondary: iconColor } = useTextColors();
  const statBg = useColorModeValue("gray.50", "gray.800");

  const { isOpen, onOpen, onClose } = useDisclosure();

  // Query hooks
  const workcells = trpc.workcell.getAll.useQuery();
  const SelectedWorkcellName = trpc.workcell.getSelectedWorkcell.useQuery();
  const selectedWorkcell = workcells.data?.find(
    (workcell) => workcell.name === SelectedWorkcellName.data,
  );

  // Get reagent count
  const toolNests = nests.filter((nest) => nest.toolId === toolId);
  const toolPlates = plates.filter((plate) => toolNests.some((nest) => nest.id === plate.nestId));
  const { data: plateReagents = [] } = trpc.inventory.getReagents.useQuery(
    { plateId: toolPlates[0]?.id },
    { enabled: toolPlates.length > 0 },
  );

  // Mutation hooks
  const utils = trpc.useContext();
  const createNestMutation = trpc.inventory.createNest.useMutation({
    onSuccess: () => {
      utils.inventory.getNests.invalidate();
    },
  });
  const deleteNestMutation = trpc.inventory.deleteNest.useMutation({
    onSuccess: () => {
      utils.inventory.getNests.invalidate();
    },
  });
  const createPlateMutation = trpc.inventory.createPlate.useMutation({
    onSuccess: () => {
      utils.inventory.getPlates.invalidate();
    },
  });
  const updatePlateMutation = trpc.inventory.updatePlate.useMutation({
    onSuccess: () => {
      utils.inventory.getPlates.invalidate();
    },
  });
  const deletePlateMutation = trpc.inventory.deletePlate.useMutation({
    onSuccess: () => {
      utils.inventory.getPlates.invalidate();
    },
  });

  const workcellTools = selectedWorkcell?.tools;
  const toolData = workcellTools?.find((tool) => tool.id === toolId);
  const { name, type } = toolData || {};

  const reagentCount = plateReagents.length || 0;

  const renderToolImage = (config: any) => {
    if (!config?.imageUrl) {
      return <Box></Box>;
    } else if (config.name === "Tool Box") {
      return (
        <Box display="flex" justifyContent="center" alignItems="center">
          <IconButton
            aria-label="Tool Box"
            icon={<Wrench style={{ width: "100%", height: "100%" }} />}
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

  // Handler functions for modal
  const handleCreateNest = async (row: number, column: number) => {
    await createNestMutation.mutateAsync({
      name: `Nest ${row + 1}-${column + 1}`,
      row,
      column,
      toolId,
      hotelId: null,
      status: "empty",
    });
  };

  const handleDeleteNest = async (nestId: number) => {
    await deleteNestMutation.mutateAsync(nestId);
  };

  const handleCreatePlate = async (params: {
    barcode: string;
    name: string;
    plateType: string;
    nestId: number;
  }) => {
    await createPlateMutation.mutateAsync({
      barcode: params.barcode,
      name: params.name,
      plateType: params.plateType,
      nestId: params.nestId,
      status: "stored",
    });
  };

  const handleUpdatePlate = async (
    plateId: number,
    params: {
      barcode?: string;
      name?: string;
      plateType?: string;
    },
  ) => {
    await updatePlateMutation.mutateAsync({
      id: plateId,
      ...params,
    });
  };

  const handleDeletePlate = async (plateId: number) => {
    await deletePlateMutation.mutateAsync(plateId);
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
                  <Icon as={Grid3x3} color={iconColor} mb={1} />
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
                  <Icon as={Package} color={iconColor} mb={1} />
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
                  <Icon as={FlaskConical} color={iconColor} mb={1} />
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
        containerName={name || ""}
        nests={toolNests}
        plates={toolPlates}
        onCreateNest={handleCreateNest}
        onDeleteNest={handleDeleteNest}
        onCreatePlate={handleCreatePlate}
        onUpdatePlate={handleUpdatePlate}
        onDeletePlate={handleDeletePlate}
      />
    </>
  );
};
