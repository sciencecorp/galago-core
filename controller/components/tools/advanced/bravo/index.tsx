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
  NumberInput,
  NumberInputField,
  FormControl,
  FormLabel,
  Select,
  Divider,
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
} from "@chakra-ui/react";
import {  FaEyeDropper, FaVial, FaSave } from "react-icons/fa";
import { trpc } from "@/utils/trpc";
import { loadingToast } from "@/components/ui/Toast";
import ToolStatusCard from "@/components/tools/ToolStatusCard";
import { RiArrowDownDoubleFill, RiArrowUpDoubleFill } from "react-icons/ri";
import { BsGearFill } from "react-icons/bs";
import { Nest, Tool } from "@/types/api";

interface BravoAdvancedProps {
  tool: Tool;
}

type DeckPosition = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

interface LabwarePosition {
  position: DeckPosition;
  labwareType: string;
  nestId?: number;
}

const DEFAULT_DECK_POSITIONS: LabwarePosition[] = [
  { position: 1, labwareType: "96-well plate" },
  { position: 2, labwareType: "96-well plate" },
  { position: 3, labwareType: "96-well plate" },
  { position: 4, labwareType: "96-well plate" },
  { position: 5, labwareType: "96-well plate" },
  { position: 6, labwareType: "96-well plate" },
  { position: 7, labwareType: "Tip rack" },
  { position: 8, labwareType: "Reagent trough" },
  { position: 9, labwareType: "Tip rack" },
];

export const BravoAdvanced: React.FC<BravoAdvancedProps> = ({ tool }) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPosition, setSelectedPosition] = useState<DeckPosition | null>(null);
  const [volume, setVolume] = useState<number>(100);
  const [liquidClass, setLiquidClass] = useState<string>("Water");
  const [hasTips, setHasTips] = useState<boolean>(false);
  const [deckPositions, setDeckPositions] = useState<LabwarePosition[]>(DEFAULT_DECK_POSITIONS);
  const [editingPosition, setEditingPosition] = useState<DeckPosition | null>(null);
  const [selectedLabware, setSelectedLabware] = useState<string>("");
  const [nestsInitialized, setNestsInitialized] = useState<boolean>(false);
  const SelectedWorkcellName = trpc.workcell.getSelectedWorkcell.useQuery();

  const { data: nests = [], refetch: refetchNests, isLoading: nestsLoading } = trpc.inventory.getNests.useQuery<Nest[]>(
    SelectedWorkcellName.data ?? "",
    {
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    },
  );
  
  const { data: allLabware, isLoading: labwareLoading } = trpc.labware.getAll.useQuery();
  
  const updateNestMutation = trpc.inventory.updateNest.useMutation();

  const homeWMutation = trpc.bravo.homeW.useMutation();
  const homeXYZMutation = trpc.bravo.homeXYZ.useMutation();
  const moveToLocationMutation = trpc.bravo.moveToLocation.useMutation();
  const aspirateMutation = trpc.bravo.aspirate.useMutation();
  const dispenseMutation = trpc.bravo.dispense.useMutation();
  const tipsOnMutation = trpc.bravo.tipsOn.useMutation();
  const tipsOffMutation = trpc.bravo.tipsOff.useMutation();
  const setLiquidClassMutation = trpc.bravo.setLiquidClass.useMutation();
  const showDiagnosticsMutation = trpc.bravo.showDiagnostics.useMutation();

  useEffect(() => {
    if (nests && tool.id) {
      const bravoNests = (nests as Nest[]).filter(nest => nest.tool_id === tool.id);
      if (bravoNests.length === 9) {
        setNestsInitialized(true);
        
        // Map nests to deck positions (sorted by row, then column)
        const sortedNests = [...bravoNests].sort((a, b) => {
          if (a.row !== b.row) return a.row - b.row;
          return a.column - b.column;
        });
        
        const updatedPositions = DEFAULT_DECK_POSITIONS.map((pos, index) => ({
          ...pos,
          nestId: sortedNests[index]?.id,
          labwareType: sortedNests[index]?.name?.split('_').pop() || pos.labwareType,
        }));
        
        setDeckPositions(updatedPositions);
      } else {
        setNestsInitialized(false);
      }
    }
  }, [nests, tool.id]);

  const executeWithToast = async (
    mutationFn: () => Promise<any>,
    actionName: string
  ) => {
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
      "Show Diagnostics"
    );
  };

  const handleHomeW = () => {
    executeWithToast(
      () => homeWMutation.mutateAsync({ toolId: tool.name }),
      "Home W"
    );
  };

  const handleHomeXYZ = () => {
    executeWithToast(
      () => homeXYZMutation.mutateAsync({ toolId: tool.name }),
      "Home XYZ"
    );
  };

  const handleMoveToPosition = (position: DeckPosition) => {
    executeWithToast(
      () =>
        moveToLocationMutation.mutateAsync({
          toolId: tool.name,
          params: { plate_location: position },
        }),
      `Move to Position ${position}`
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
      `Aspirate ${volume}µL from Position ${selectedPosition}`
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
      `Dispense ${volume}µL to Position ${selectedPosition}`
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
      `Pick up tips from Position ${selectedPosition}`
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
      `Eject tips to Position ${selectedPosition}`
    ).then(() => setHasTips(false));
  };

  const handleSetLiquidClass = () => {
    executeWithToast(
      () =>
        setLiquidClassMutation.mutateAsync({
          toolId: tool.name,
          params: { liquid_class: liquidClass },
        }),
      `Set Liquid Class to ${liquidClass}`
    );
  };

  const handleEditLabware = (position: DeckPosition) => {
    setEditingPosition(position);
    const currentLabware = deckPositions.find(p => p.position === position);
    setSelectedLabware(currentLabware?.labwareType || "");
    onOpen();
  };

  const handleSaveLabware = async () => {
    if (!editingPosition || !selectedLabware) return;

    const positionData = deckPositions.find(p => p.position === editingPosition);
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
      await updateNestMutation.mutateAsync({
        id: positionData.nestId,
        name: `${tool.name}_R${Math.floor((editingPosition - 1) / 3)}C${(editingPosition - 1) % 3}_${selectedLabware}`,
        row: Math.floor((editingPosition - 1) / 3),
        column: (editingPosition - 1) % 3,
        tool_id: tool.id,
      });

      // Update local state
      setDeckPositions(prev =>
        prev.map(p =>
          p.position === editingPosition
            ? { ...p, labwareType: selectedLabware }
            : p
        )
      );

      toast({
        title: "Labware updated",
        description: `Position ${editingPosition} now has ${selectedLabware}`,
        status: "success",
        duration: 3000,
      });

      onClose();
      refetchNests();
    } catch (error) {
      toast({
        title: "Error updating labware",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  if (nestsLoading || labwareLoading) {
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
        {/* Header with Status */}
        <HStack justify="space-between" align="center" pb={2}>
          <VStack align="start" spacing={1}>
            <Heading size="lg">Bravo Advanced Control</Heading>
            <Text fontSize="sm" color="gray.500">
              Select a deck position and perform operations
            </Text>
          </VStack>
          <Badge 
            colorScheme={hasTips ? "green" : "gray"} 
            fontSize="lg" 
            px={4} 
            py={2}
            borderRadius="full"
          >
            {hasTips ? "✓ Tips Loaded" : "No Tips"}
          </Badge>
        </HStack>

        {/* Warning for missing nests */}
        {!nestsInitialized && (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>Nests Not Initialized</AlertTitle>
              <AlertDescription>
                This Bravo tool requires 9 inventory nests (3x3 grid) to be created. 
                Please contact an administrator to initialize the inventory nests for this tool.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Main Layout */}
        <HStack spacing={6} align="stretch">
          {/* Left Sidebar - Controls */}
          <VStack width="320px" flexShrink={0} spacing={4} align="stretch">
            <ToolStatusCard toolId={tool.name} customWidth="100%"/>

            {/* System Controls */}
            <Card>
              <CardHeader pb={2}>
                <Heading size="sm">System Controls</Heading>
              </CardHeader>
              <CardBody pt={3}>
                <VStack spacing={3}>
                  <Button
                    leftIcon={<BsGearFill />}
                    onClick={handleShowDiagnostics}
                    width="100%"
                    size="md"
                    colorScheme="blue"
                    isLoading={showDiagnosticsMutation.isLoading}>
                    Show Diagnostics
                  </Button> 
                  <Divider />
                  <Button
                    onClick={() =>
                      selectedPosition && handleMoveToPosition(selectedPosition)
                    }
                    width="100%"
                    size="md"
                    colorScheme="purple"
                    isDisabled={!selectedPosition || !nestsInitialized}
                    isLoading={moveToLocationMutation.isLoading}>
                    {selectedPosition 
                      ? `Move to Position ${selectedPosition}` 
                      : "Select Position to Move"}
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            {/* Tip Management */}
            <Card>
              <CardHeader pb={2}>
                <Heading size="sm">Tip Management</Heading>
              </CardHeader>
              <CardBody pt={3}>
                <HStack spacing={2}>
                  <Button
                    leftIcon={<RiArrowUpDoubleFill fontSize="20px" />}
                    onClick={handleTipsOn}
                    flex={1}
                    colorScheme="green"
                    isDisabled={hasTips || !selectedPosition || !nestsInitialized}
                    isLoading={tipsOnMutation.isLoading}>
                    Pick Up
                  </Button>
                  <Button
                    leftIcon={<RiArrowDownDoubleFill fontSize="20px" />}
                    onClick={handleTipsOff}
                    flex={1}
                    colorScheme="red"
                    isDisabled={!hasTips || !selectedPosition || !nestsInitialized}
                    isLoading={tipsOffMutation.isLoading}>
                    Eject
                  </Button>
                </HStack>
                {!selectedPosition && (
                  <Text fontSize="xs" color="gray.500" mt={2} textAlign="center">
                    Select a position first
                  </Text>
                )}
              </CardBody>
            </Card>

            {/* Liquid Handling */}
            <Card>
              <CardHeader pb={2}>
                <Heading size="sm" color="gray.700">Liquid Handling</Heading>
              </CardHeader>
              <CardBody pt={3}>
                <VStack spacing={4}>
                  {/* Volume Input */}
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold">
                      Volume (µL)
                    </FormLabel>
                    <NumberInput
                      value={volume}
                      onChange={(_, val) => setVolume(val)}
                      min={1}
                      max={1000}
                      size="md">
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>

                  {/* Liquid Class */}
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold">
                      Liquid Class
                    </FormLabel>
                    <Select
                      value={liquidClass}
                      onChange={(e) => setLiquidClass(e.target.value)}
                      size="md">
                      <option value="Water">Water</option>
                      <option value="DMSO">DMSO</option>
                      <option value="Serum">Serum</option>
                      <option value="Ethanol">Ethanol</option>
                    </Select>
                    <Button
                      size="sm"
                      mt={2}
                      width="100%"
                      variant="outline"
                      onClick={handleSetLiquidClass}
                      isLoading={setLiquidClassMutation.isLoading}>
                      Apply Liquid Class
                    </Button>
                  </FormControl>

                  <Divider />

                  {/* Action Buttons */}
                  <VStack spacing={2} width="100%">
                    <Button
                      leftIcon={<FaEyeDropper />}
                      onClick={handleAspirate}
                      width="100%"
                      size="lg"
                      colorScheme="teal"
                      isDisabled={!hasTips || !selectedPosition || !nestsInitialized}
                      isLoading={aspirateMutation.isLoading}>
                      Aspirate {volume}µL
                    </Button>
                    <Button
                      leftIcon={<FaVial />}
                      onClick={handleDispense}
                      width="100%"
                      size="lg"
                      colorScheme="orange"
                      isDisabled={!hasTips || !selectedPosition || !nestsInitialized}
                      isLoading={dispenseMutation.isLoading}>
                      Dispense {volume}µL
                    </Button>
                  </VStack>

                  {(!hasTips || !selectedPosition) && (
                    <Text fontSize="xs" color="gray.500" textAlign="center">
                      {!hasTips && !selectedPosition
                        ? "Pick up tips and select position"
                        : !hasTips
                        ? "Pick up tips first"
                        : "Select a position"}
                    </Text>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </VStack>

          {/* Right Panel - Deck Grid */}
          <Card flex={1} display="flex" flexDirection="column">
            <CardHeader pb={4}>
              <VStack align="center" spacing={1}>
                <Heading size="lg">Bravo Deck Layout</Heading>
                <Text fontSize="sm" color="gray.500">
                  {selectedPosition 
                    ? `Position ${selectedPosition} selected - ${deckPositions.find(p => p.position === selectedPosition)?.labwareType}`
                    : "Click a position to select it"}
                </Text>
              </VStack>
            </CardHeader>
            <CardBody display="flex" flexDirection="column" alignItems="center" justifyContent="start" flex={1} pt={8}>
              <Grid 
                bg={useColorModeValue("gray.100", "gray.800")}
                border="1px solid"
                borderColor="gray.200"
                borderRadius="lg"
                p={8}
                templateColumns="repeat(3, 1fr)" 
                gap={6} 
              >
                {deckPositions.map((labware) => {
                  const isSelected = selectedPosition === labware.position;
                  const bgColor = isSelected 
                    ? useColorModeValue("blue.50", "blue.900")
                    : useColorModeValue("gray.50", "gray.700");
                  const borderColor = isSelected ? "blue.500" : "gray.300";
                  
                  return (
                    <GridItem
                      key={labware.position}
                      bg={bgColor}
                      border="3px solid"
                      borderColor={borderColor}
                      borderRadius="lg"
                      p={6}
                      cursor="pointer"
                      onClick={() => nestsInitialized && setSelectedPosition(labware.position)}
                      _hover={{ 
                        transform: nestsInitialized ? "translateY(-4px)" : "none", 
                        shadow: nestsInitialized ? "lg" : "none",
                        borderColor: nestsInitialized ? (isSelected ? "blue.600" : "blue.300") : borderColor,
                        transition: "all 0.2s" 
                      }}
                      transition="all 0.2s"
                      position="relative"
                      height="160px"
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      opacity={nestsInitialized ? 1 : 0.5}
                    >
                      <VStack spacing={3} flex={1} justify="center">
                        <Text 
                          fontWeight="bold" 
                          fontSize="4xl" 
                          color={isSelected ? "blue.600" : "gray.500"}
                        >
                          {labware.position}
                        </Text>
                        <Badge 
                          colorScheme={isSelected ? "blue" : "gray"}
                          fontSize="sm"
                          px={3}
                          py={1}
                          borderRadius="md"
                        >
                          {labware.labwareType}
                        </Badge>
                      </VStack>
                      
                      {nestsInitialized && (
                        <Button
                          size="xs"
                          leftIcon={<FaSave />}
                          colorScheme="purple"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditLabware(labware.position);
                          }}
                          width="100%"
                        >
                          Edit Labware
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
                placeholder="Select labware"
              >
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
              isLoading={updateNestMutation.isLoading}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};