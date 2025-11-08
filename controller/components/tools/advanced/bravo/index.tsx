import React, { useState } from "react";
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
  SimpleGrid,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { FaHome, FaPlay, FaStop, FaEyeDropper, FaVial } from "react-icons/fa";
import { trpc } from "@/utils/trpc";
import { Tool } from "@/types/api";
import { loadingToast } from "@/components/ui/Toast";

interface BravoAdvancedProps {
  tool: Tool;
}

type DeckPosition = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

interface LabwarePosition {
  position: DeckPosition;
  labwareType: string;
  hasHeater: boolean;
}

const DECK_POSITIONS: LabwarePosition[] = [
  { position: 1, labwareType: "96-well plate", hasHeater: false },
  { position: 2, labwareType: "96-well plate", hasHeater: false },
  { position: 3, labwareType: "96-well plate", hasHeater: false },
  { position: 4, labwareType: "96-well plate", hasHeater: true },
  { position: 5, labwareType: "96-well plate", hasHeater: false },
  { position: 6, labwareType: "96-well plate", hasHeater: true },
  { position: 7, labwareType: "Tip rack", hasHeater: false },
  { position: 8, labwareType: "Reagent trough", hasHeater: false },
  { position: 9, labwareType: "Tip rack", hasHeater: false },
];

export const BravoAdvanced: React.FC<BravoAdvancedProps> = ({ tool }) => {
  const toast = useToast();
  const [selectedPosition, setSelectedPosition] = useState<DeckPosition | null>(null);
  const [volume, setVolume] = useState<number>(100);
  const [liquidClass, setLiquidClass] = useState<string>("Water");
  const [hasTips, setHasTips] = useState<boolean>(false);

  // TRPC mutations
  const homeWMutation = trpc.bravo.homeW.useMutation();
  const homeXYZMutation = trpc.bravo.homeXYZ.useMutation();
  const moveToLocationMutation = trpc.bravo.moveToLocation.useMutation();
  const aspirateMutation = trpc.bravo.aspirate.useMutation();
  const dispenseMutation = trpc.bravo.dispense.useMutation();
  const tipsOnMutation = trpc.bravo.tipsOn.useMutation();
  const tipsOffMutation = trpc.bravo.tipsOff.useMutation();
  const setLiquidClassMutation = trpc.bravo.setLiquidClass.useMutation();

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

  const getDeckPositionColor = (position: DeckPosition) => {
    if (selectedPosition === position) return "blue.400";
    const labware = DECK_POSITIONS.find((p) => p.position === position);
    if (labware?.hasHeater) return "orange.200";
    return "gray.100";
  };

  return (
    <Box p={4} maxW="1400px" mx="auto">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Heading size="lg">Bravo Advanced Control</Heading>
          <Badge colorScheme={hasTips ? "green" : "gray"} fontSize="md" p={2}>
            {hasTips ? "Tips Loaded" : "No Tips"}
          </Badge>
        </HStack>

        <HStack spacing={6} align="start">
          {/* Left Panel - Deck Grid */}
          <Card flex={2}>
            <CardHeader>
              <Heading size="md">Deck Layout (3x3)</Heading>
              <Text fontSize="sm" color="gray.600">
                Click a position to select it
              </Text>
            </CardHeader>
            <CardBody>
              <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                {DECK_POSITIONS.map((labware) => (
                  <GridItem
                    key={labware.position}
                    bg={getDeckPositionColor(labware.position)}
                    border="2px solid"
                    borderColor={
                      selectedPosition === labware.position ? "blue.600" : "gray.300"
                    }
                    borderRadius="md"
                    p={4}
                    cursor="pointer"
                    onClick={() => setSelectedPosition(labware.position)}
                    _hover={{ transform: "scale(1.02)", transition: "all 0.2s" }}
                    position="relative">
                    <VStack spacing={1} align="center">
                      <Text fontWeight="bold" fontSize="2xl">
                        {labware.position}
                      </Text>
                      <Text fontSize="xs" color="gray.600" textAlign="center">
                        {labware.labwareType}
                      </Text>
                      {labware.hasHeater && (
                        <Badge colorScheme="orange" fontSize="xs">
                          🔥 Heater
                        </Badge>
                      )}
                    </VStack>
                  </GridItem>
                ))}
              </Grid>

              {selectedPosition && (
                <Box mt={4} p={3} bg="blue.50" borderRadius="md">
                  <Text fontWeight="bold">
                    Selected Position: {selectedPosition}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {
                      DECK_POSITIONS.find((p) => p.position === selectedPosition)
                        ?.labwareType
                    }
                  </Text>
                </Box>
              )}
            </CardBody>
          </Card>

          {/* Right Panel - Controls */}
          <VStack flex={1} spacing={4}>
            {/* Homing Controls */}
            <Card width="100%">
              <CardHeader>
                <Heading size="sm">Homing</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={2}>
                  <Button
                    leftIcon={<FaHome />}
                    onClick={handleHomeW}
                    width="100%"
                    colorScheme="blue"
                    isLoading={homeWMutation.isLoading}>
                    Home W Axis
                  </Button>
                  <Button
                    leftIcon={<FaHome />}
                    onClick={handleHomeXYZ}
                    width="100%"
                    colorScheme="blue"
                    isLoading={homeXYZMutation.isLoading}>
                    Home XYZ Axes
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            {/* Movement Controls */}
            <Card width="100%">
              <CardHeader>
                <Heading size="sm">Movement</Heading>
              </CardHeader>
              <CardBody>
                <Button
                  onClick={() =>
                    selectedPosition && handleMoveToPosition(selectedPosition)
                  }
                  width="100%"
                  colorScheme="purple"
                  isDisabled={!selectedPosition}
                  isLoading={moveToLocationMutation.isLoading}>
                  Move to Selected Position
                </Button>
              </CardBody>
            </Card>

            {/* Tip Management */}
            <Card width="100%">
              <CardHeader>
                <Heading size="sm">Tip Management</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={2}>
                  <Button
                    leftIcon={<FaPlay />}
                    onClick={handleTipsOn}
                    width="100%"
                    colorScheme="green"
                    isDisabled={hasTips || !selectedPosition}
                    isLoading={tipsOnMutation.isLoading}>
                    Pick Up Tips
                  </Button>
                  <Button
                    leftIcon={<FaStop />}
                    onClick={handleTipsOff}
                    width="100%"
                    colorScheme="red"
                    isDisabled={!hasTips || !selectedPosition}
                    isLoading={tipsOffMutation.isLoading}>
                    Eject Tips
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            {/* Liquid Handling */}
            <Card width="100%">
              <CardHeader>
                <Heading size="sm">Liquid Handling</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={3}>
                  <FormControl>
                    <FormLabel fontSize="sm">Volume (µL)</FormLabel>
                    <NumberInput
                      value={volume}
                      onChange={(_, val) => setVolume(val)}
                      min={1}
                      max={1000}>
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">Liquid Class</FormLabel>
                    <Select
                      value={liquidClass}
                      onChange={(e) => setLiquidClass(e.target.value)}>
                      <option value="Water">Water</option>
                      <option value="DMSO">DMSO</option>
                      <option value="Serum">Serum</option>
                      <option value="Ethanol">Ethanol</option>
                    </Select>
                    <Button
                      size="sm"
                      mt={2}
                      width="100%"
                      onClick={handleSetLiquidClass}
                      isLoading={setLiquidClassMutation.isLoading}>
                      Apply Liquid Class
                    </Button>
                  </FormControl>

                  <Divider />

                  <Button
                    leftIcon={<FaEyeDropper />}
                    onClick={handleAspirate}
                    width="100%"
                    colorScheme="teal"
                    isDisabled={!hasTips || !selectedPosition}
                    isLoading={aspirateMutation.isLoading}>
                    Aspirate
                  </Button>
                  <Button
                    leftIcon={<FaVial />}
                    onClick={handleDispense}
                    width="100%"
                    colorScheme="orange"
                    isDisabled={!hasTips || !selectedPosition}
                    isLoading={dispenseMutation.isLoading}>
                    Dispense
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </HStack>
      </VStack>
    </Box>
  );
};