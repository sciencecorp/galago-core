import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Button,
  Grid,
  GridItem,
  Text,
  Heading,
  Badge,
  FormControl,
  FormLabel,
  Select,
  useToast,
  Card,
  CardHeader,
  CardBody,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Spinner,
  Divider,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  Icon,
} from "@chakra-ui/react";
import { FaEyeDropper, FaVial, FaSave, FaTrash } from "react-icons/fa";
import { trpc } from "@/utils/trpc";
import { Tool, Plate, Nest } from "@/types/api";
import { loadingToast } from "@/components/ui/Toast";
import ToolStatusCard from "@/components/tools/ToolStatusCard";
import { BsGearFill } from "react-icons/bs";
import { BravoDeckConfigSelector } from "./BravoDeckSelector";
import { CreateDeckConfigModal } from "./CreateDeckConfigModal";
import { useCommonColors, useTextColors } from "@/components/ui/Theme";
import { successToast } from "@/components/ui/Toast";
import { RiDeleteBin5Line, RiEdit2Line } from "react-icons/ri";
import { PageHeader } from "@/components/ui/PageHeader";
import { FaRegListAlt } from "react-icons/fa";

interface BravoAdvancedProps {
  tool: Tool;
}

type DeckPosition = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

interface LabwarePosition {
  position: DeckPosition;
  labwareType: string;
  nestId?: number;
  plateId?: number;
}

const DEFAULT_LABWARE_TYPES = [
  "Empty",
  "Empty",
  "Empty",
  "Empty",
  "Empty",
  "Empty",
  "Empty",
  "Empty",
  "Empty",
];

export const BravoAdvanced: React.FC<BravoAdvancedProps> = ({ tool }) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isClearModalOpen,
    onOpen: onClearModalOpen,
    onClose: onClearModalClose,
  } = useDisclosure();

  const [selectedPosition, setSelectedPosition] = useState<DeckPosition | null>(null);
  const [volume, setVolume] = useState<number>(100);
  const [liquidClass, setLiquidClass] = useState<string>("Water");
  const [hasTips, setHasTips] = useState<boolean>(false);
  const [deckPositions, setDeckPositions] = useState<LabwarePosition[]>([]);
  const [editingPosition, setEditingPosition] = useState<DeckPosition | null>(null);
  const [selectedLabware, setSelectedLabware] = useState<string>("");
  const [nestsInitialized, setNestsInitialized] = useState<boolean>(false);
  const SelectedWorkcellName = trpc.workcell.getSelectedWorkcell.useQuery();
  const {
    data: nests = [],
    refetch: refetchNests,
    isLoading: nestsLoading,
  } = trpc.inventory.getNests.useQuery<Nest[]>(SelectedWorkcellName.data ?? "", {
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  const headerBg = useColorModeValue("white", "gray.700");
  const [selectedConfigId, setSelectedConfigId] = useState<number | null>(null);
  // Inside BravoAdvanced component, add this state:
  const [loadedConfig, setLoadedConfig] = useState<number | null>(null);
  const colors = useCommonColors();
  const deckBgColor = useColorModeValue("gray.100", "gray.800");
  const [selectedDeckConfig, setSelectedDeckConfig] = useState<string>("");

  const { data: configs, refetch: refetchConfigs } = trpc.bravoDeckConfig.getAll.useQuery({
    workcellId: 1,
  });
  const [selectedDeckConfigId, setSelectedDeckConfigId] = useState<number | null>(null);

  const handleConfigLoaded = (config: BravoDeckConfig) => {
    if (nests && plates) {
      const bravoNests = nests.filter((nest: Nest) => nest.tool_id === tool.id);

      if (bravoNests.length === 9) {
        const sortedNests = [...bravoNests].sort((a, b) => {
          if (a.row !== b.row) return a.row - b.row;
          return a.column - b.column;
        });

        const updatedPositions: LabwarePosition[] = sortedNests.map((nest, index) => {
          const position = (index + 1) as DeckPosition;
          const configuredLabware = config.deck_layout[position.toString()];

          return {
            position,
            nestId: nest.id,
            labwareType: configuredLabware || "Empty",
          };
        });

        setDeckPositions(updatedPositions);
        successToast("Config loaded", `Loaded configuration "${config.name}"`);
      }
    }
  };

  const {
    data: plates,
    isLoading: platesLoading,
    refetch: refetchPlates,
  } = trpc.inventory.getPlates.useQuery(SelectedWorkcellName.data ?? "", {
    enabled: !!SelectedWorkcellName.data,
  });

  const { data: allLabware, isLoading: labwareLoading } = trpc.labware.getAll.useQuery();

  const createPlateMutation = trpc.inventory.createPlate.useMutation();
  const updatePlateMutation = trpc.inventory.updatePlate.useMutation();
  const deletePlateMutation = trpc.inventory.deletePlate.useMutation();

  // Existing mutations
  const moveToLocationMutation = trpc.bravo.moveToLocation.useMutation();
  const aspirateMutation = trpc.bravo.aspirate.useMutation();
  const dispenseMutation = trpc.bravo.dispense.useMutation();
  const tipsOnMutation = trpc.bravo.tipsOn.useMutation();
  const tipsOffMutation = trpc.bravo.tipsOff.useMutation();
  const setLiquidClassMutation = trpc.bravo.setLiquidClass.useMutation();
  const showDiagnosticsMutation = trpc.bravo.showDiagnostics.useMutation();

  const { data: configToLoad, refetch: refetchConfigToLoad } = trpc.bravoDeckConfig.get.useQuery(
    loadedConfig!,
    {
      enabled: !!loadedConfig,
    },
  );
  // Effect to apply loaded config
  useEffect(() => {
    if (configToLoad && nests && plates) {
      // Apply the config to deck positions
      const bravoNests = nests.filter((nest: Nest) => nest.tool_id === tool.id);

      if (bravoNests.length === 9) {
        const sortedNests = [...bravoNests].sort((a, b) => {
          if (a.row !== b.row) return a.row - b.row;
          return a.column - b.column;
        });

        const updatedPositions: LabwarePosition[] = sortedNests.map((nest, index) => {
          const position = (index + 1) as DeckPosition;
          const configuredLabware = configToLoad.deck_layout[position.toString()];

          return {
            position,
            nestId: nest.id,
            labwareType: configuredLabware || "Empty",
          };
        });

        setDeckPositions(updatedPositions);
        setLoadedConfig(null); // Reset after loading
      }
    }
  }, [configToLoad, nests, plates, tool.id]);

  // Check if nests exist for this tool and map plates to deck positions
  useEffect(() => {
    if (nests && plates && tool.id) {
      const bravoNests = nests.filter((nest: Nest) => nest.tool_id === tool.id);

      if (bravoNests.length === 9) {
        setNestsInitialized(true);

        // Sort nests by row, then column (positions 1-9)
        const sortedNests = [...bravoNests].sort((a, b) => {
          if (a.row !== b.row) return a.row - b.row;
          return a.column - b.column;
        });

        // Map plates to positions
        const updatedPositions: LabwarePosition[] = sortedNests.map((nest, index) => {
          const position = (index + 1) as DeckPosition;

          // Find plate in this nest
          const plateInNest = plates.find((plate: Plate) => plate.nest_id === nest.id);

          return {
            position,
            nestId: nest.id,
            plateId: plateInNest?.id,
            labwareType: plateInNest?.plate_type || DEFAULT_LABWARE_TYPES[index],
          };
        });

        setDeckPositions(updatedPositions);
      } else {
        setNestsInitialized(false);
        // Set default positions without nest data
        setDeckPositions(
          DEFAULT_LABWARE_TYPES.map((type, index) => ({
            position: (index + 1) as DeckPosition,
            labwareType: type,
          })),
        );
      }
    }
  }, [nests, plates, tool.id]);

  const executeWithToast = async (mutationFn: () => Promise<any>, actionName: string) => {
    const promise = mutationFn();

    loadingToast(`Executing ${actionName}..`, "Please wait.", promise, {
      successTitle: `${actionName} completed!`,
      successDescription: () => "Operation completed successfully",
      errorTitle: `Failed to execute ${actionName}`,
      errorDescription: (error) => `Error: ${error.message}`,
    });

    return promise;
  };

  const handleShowDiagnostics = () => {
    executeWithToast(
      () => showDiagnosticsMutation.mutateAsync({ toolId: tool.name }),
      "Show Diagnostics",
    );
  };

  const handleMoveToPosition = (position: DeckPosition) => {
    executeWithToast(
      () =>
        moveToLocationMutation.mutateAsync({
          toolId: tool.name,
          params: { plate_location: position },
        }),
      `Move to Position ${position}`,
    );
  };

  const handleAspirate = () => {
    if (!selectedPosition) {
      toast({
        title: "No position selected",
        description: "Please select a deck position first",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    if (!hasTips) {
      toast({
        title: "No tips loaded",
        description: "Please pick up tips first",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    executeWithToast(
      () =>
        aspirateMutation.mutateAsync({
          toolId: tool.name,
          params: {
            volume,
            plate_location: selectedPosition,
            distance_from_well_bottom: 2.0,
          },
        }),
      `Aspirate ${volume}µL from Position ${selectedPosition}`,
    );
  };

  const handleDispense = () => {
    if (!selectedPosition) {
      toast({
        title: "No position selected",
        description: "Please select a deck position first",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    if (!hasTips) {
      toast({
        title: "No tips loaded",
        description: "Please pick up tips first",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    executeWithToast(
      () =>
        dispenseMutation.mutateAsync({
          toolId: tool.name,
          params: {
            volume,
            empty_tips: false,
            blow_out_volume: 0,
            plate_location: selectedPosition,
            distance_from_well_bottom: 2.0,
          },
        }),
      `Dispense ${volume}µL to Position ${selectedPosition}`,
    );
  };

  const handleTipsOn = () => {
    if (!selectedPosition) {
      toast({
        title: "No position selected",
        description: "Please select a tip rack position first",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    executeWithToast(
      () =>
        tipsOnMutation.mutateAsync({
          toolId: tool.name,
          params: { plate_location: selectedPosition },
        }),
      `Pick up tips from Position ${selectedPosition}`,
    ).then(() => setHasTips(true));
  };

  const handleTipsOff = () => {
    if (!selectedPosition) {
      toast({
        title: "No position selected",
        description: "Please select a position for tip disposal",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    executeWithToast(
      () =>
        tipsOffMutation.mutateAsync({
          toolId: tool.name,
          params: { plate_location: selectedPosition },
        }),
      `Eject tips to Position ${selectedPosition}`,
    ).then(() => setHasTips(false));
  };

  const handleSetLiquidClass = () => {
    executeWithToast(
      () =>
        setLiquidClassMutation.mutateAsync({
          toolId: tool.name,
          params: { liquid_class: liquidClass },
        }),
      `Set Liquid Class to ${liquidClass}`,
    );
  };

  const handleEditLabware = (position: DeckPosition) => {
    setEditingPosition(position);
    const currentLabware = deckPositions.find((p) => p.position === position);
    setSelectedLabware(currentLabware?.labwareType || "");
    onOpen();
  };

  const handleSaveLabware = async () => {
    if (!editingPosition || !selectedLabware) return;

    const positionData = deckPositions.find((p) => p.position === editingPosition);
    if (!positionData?.nestId) {
      toast({
        title: "Error",
        description: "Nest not initialized for this position",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      // Check if plate already exists for this nest
      if (positionData.plateId) {
        // Update existing plate
        await updatePlateMutation.mutateAsync({
          id: positionData.plateId,
          name: `${tool.name}_Pos${editingPosition}`,
          barcode: `${tool.name}_${editingPosition}_${Date.now()}`,
          plate_type: selectedLabware,
          nest_id: positionData.nestId,
        });
      } else {
        // Create new plate
        await createPlateMutation.mutateAsync({
          name: `${tool.name}_Pos${editingPosition}`,
          barcode: `${tool.name}_${editingPosition}_${Date.now()}`,
          plate_type: selectedLabware,
          nest_id: positionData.nestId,
        });
      }

      toast({
        title: "Labware updated",
        description: `Position ${editingPosition} now has ${selectedLabware}`,
        status: "success",
        duration: 3000,
      });

      onClose();
      refetchPlates();
    } catch (error) {
      toast({
        title: "Error updating labware",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleClearAllLabware = async () => {
    try {
      const platesToDelete = deckPositions.filter((pos) => pos.plateId).map((pos) => pos.plateId!);

      if (platesToDelete.length === 0) {
        toast({
          title: "No labware to clear",
          description: "All positions are already empty",
          status: "info",
          duration: 3000,
        });
        return;
      }

      // Delete all plates
      await Promise.all(platesToDelete.map((plateId) => deletePlateMutation.mutateAsync(plateId)));

      toast({
        title: "Labware cleared",
        description: `Removed ${platesToDelete.length} plate(s) from deck`,
        status: "success",
        duration: 3000,
      });

      onClearModalClose();
      refetchPlates();
    } catch (error) {
      toast({
        title: "Error clearing labware",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  if (nestsLoading || labwareLoading || platesLoading) {
    return (
      <Box p={6} minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading Bravo configuration...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={6} minH="100vh">
      <VStack spacing={6} align="stretch" maxW="1600px" mx="auto">
        <Card bg={headerBg} shadow="md" borderRadius="lg">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <PageHeader
                title="Bravo Advanced Controls"
                subTitle="Agilent Bravo Deck and Sequence Management"
                titleIcon={<Icon as={FaRegListAlt} boxSize={8} color="teal.500" />}
                mainButton={
                  <CreateDeckConfigModal
                    workcellId={1}
                    currentDeckPositions={deckPositions.map((p) => ({
                      position: p.position,
                      labwareType: p.labwareType,
                    }))}
                    onConfigCreated={() => {
                      refetchPlates();
                    }}
                  />
                }
              />
              <Divider />
              <StatGroup>
                <Stat>
                  <StatLabel>Total Deck Configs</StatLabel>
                  <StatNumber>{}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Total Sequences</StatLabel>
                  <StatNumber>{}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Selected Config</StatLabel>
                  <StatNumber fontSize="lg">{}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Selected Sequence</StatLabel>
                  <StatNumber fontSize="lg">{}</StatNumber>
                </Stat>
              </StatGroup>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={colors.sectionBg} shadow="md" borderRadius="lg">
          <CardBody>
            <VStack spacing={3} align="stretch">
              <BravoDeckConfigSelector
                workcellId={1}
                currentDeckPositions={deckPositions.map((p) => ({
                  position: p.position,
                  labwareType: p.labwareType,
                }))}
                onConfigLoaded={handleConfigLoaded}
              />
              <CreateDeckConfigModal
                workcellId={1}
                currentDeckPositions={deckPositions.map((p) => ({
                  position: p.position,
                  labwareType: p.labwareType,
                }))}
                onConfigCreated={() => {
                  // Optionally refetch configs or handle post-creation
                  refetchPlates();
                }}
              />
            </VStack>
          </CardBody>
        </Card>

        {/* Warning for missing nests */}
        {!nestsInitialized && (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>Nests Not Initialized</AlertTitle>
              <AlertDescription>
                This Bravo tool requires 9 inventory nests (3x3 grid) to be created. Please contact
                an administrator to initialize the inventory nests for this tool.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        <HStack spacing={6} align="stretch">
          <Card flex={1} display="flex" flexDirection="column">
            <CardBody
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="start"
              flex={1}
              pt={8}>
              <HStack spacing={2} justifyContent="space-between">
                <HStack>
                  <Text whiteSpace="nowrap" fontWeight="bold" fontSize="lg">
                    Select Deck Config:
                  </Text>
                  <Select
                    placeholder="Select a configuration"
                    value={selectedConfigId || ""}
                    onChange={(e) => {
                      const configId = e.target.value ? Number(e.target.value) : null;
                      setSelectedConfigId(configId);
                    }}
                    width="300px"
                    size="sm">
                    {configs?.map((config) => (
                      <option key={config.id} value={config.id}>
                        {config.name} ({Object.values(config.deck_layout).filter(Boolean).length}{" "}
                        positions)
                      </option>
                    ))}
                  </Select>
                </HStack>
              </HStack>
              <Grid
                bg={deckBgColor}
                border="1px solid"
                borderColor="gray.200"
                borderRadius="lg"
                p={8}
                templateColumns="repeat(3, 1fr)"
                gap={6}>
                {deckPositions.map((labware) => {
                  const isSelected = selectedPosition === labware.position;
                  const hasPlate = !!labware.plateId;
                  const bgColor = isSelected
                    ? useColorModeValue("blue.50", "blue.900")
                    : useColorModeValue("gray.50", "gray.700");
                  const borderColor = isSelected ? "blue.500" : hasPlate ? "green.400" : "gray.300";

                  return (
                    <GridItem
                      key={labware.position}
                      bg={bgColor}
                      border="3px solid"
                      borderColor={borderColor}
                      borderRadius="lg"
                      p={4}
                      cursor="pointer"
                      onClick={() => nestsInitialized && setSelectedPosition(labware.position)}
                      _hover={{
                        transform: nestsInitialized ? "translateY(-4px)" : "none",
                        shadow: nestsInitialized ? "lg" : "none",
                        borderColor: nestsInitialized
                          ? isSelected
                            ? "blue.600"
                            : "blue.300"
                          : borderColor,
                        transition: "all 0.2s",
                      }}
                      transition="all 0.2s"
                      position="relative"
                      height="140px"
                      width="220px"
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      opacity={nestsInitialized ? 1 : 0.5}>
                      <VStack spacing={3} flex={1} justify="center">
                        <Text
                          fontWeight="bold"
                          fontSize="4xl"
                          color={isSelected ? "blue.600" : "gray.500"}>
                          {labware.position}
                        </Text>
                        <Badge
                          colorScheme={isSelected ? "blue" : hasPlate ? "green" : "gray"}
                          fontSize="sm"
                          px={3}
                          py={1}
                          borderRadius="md">
                          <Text isTruncated maxW="150px">
                            {labware.labwareType}
                          </Text>
                        </Badge>
                      </VStack>

                      {nestsInitialized && (
                        <Button
                          size="xs"
                          leftIcon={<RiEdit2Line />}
                          colorScheme="purple"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditLabware(labware.position);
                          }}
                          width="100%">
                          {hasPlate ? "Edit" : "Set"} Labware
                        </Button>
                      )}

                      {isSelected && (
                        <Box
                          position="absolute"
                          top={2}
                          right={2}
                          w={3}
                          h={3}
                          bg="blue.500"
                          borderRadius="full"
                        />
                      )}
                    </GridItem>
                  );
                })}
              </Grid>
            </CardBody>
          </Card>
        </HStack>
      </VStack>

      {/* Labware Selection Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Labware - Position {editingPosition}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Select Labware Type</FormLabel>
              <Select
                value={selectedLabware}
                onChange={(e) => setSelectedLabware(e.target.value)}
                placeholder="Select labware">
                {allLabware?.map((labware) => (
                  <option key={labware.id} value={labware.name}>
                    {labware.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSaveLabware}
              isDisabled={!selectedLabware}
              isLoading={updatePlateMutation.isLoading || createPlateMutation.isLoading}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Clear All Confirmation Modal */}
      <Modal isOpen={isClearModalOpen} onClose={onClearModalClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Clear All Labware</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text>
              Are you sure you want to remove all labware from the Bravo deck? This will delete all
              plate records for this tool.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClearModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleClearAllLabware}
              isLoading={deletePlateMutation.isLoading}>
              Clear All
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
