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
  useColorModeValue,
  Tag,
} from "@chakra-ui/react";
import { FaHome, FaPlay, FaStop, FaEyeDropper, FaVial } from "react-icons/fa";
import { trpc } from "@/utils/trpc";
import { Tool } from "@/types/api";
import { loadingToast } from "@/components/ui/Toast";
import ToolStatusCard from "@/components/tools/ToolStatusCard";
import { RiArrowDownDoubleFill } from "react-icons/ri";
import { RiArrowUpDoubleFill } from "react-icons/ri";

interface BravoAdvancedProps {
  tool: Tool;
}

type DeckPosition = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

interface LabwarePosition {
  position: DeckPosition;
  labwareType: string;
}

const DECK_POSITIONS: LabwarePosition[] = [
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

        {/* Main Layout */}
        <HStack spacing={6} align="stretch">
          {/* Left Sidebar - Controls */}
          <VStack width="320px" flexShrink={0} spacing={4} align="stretch">
            <ToolStatusCard toolId={tool.name} customWidth="100%"/>

            {/* System Controls */}
            <Card>
              <CardHeader pb={2}>
                <Heading size="sm" color="gray.700">System Controls</Heading>
              </CardHeader>
              <CardBody pt={3}>
                <VStack spacing={3}>
                  <HStack spacing={2} width="100%">
                    <Button
                      leftIcon={<FaHome />}
                      onClick={handleHomeW}
                      flex={1}
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                      isLoading={homeWMutation.isLoading}>
                      Home W
                    </Button>
                    <Button
                      leftIcon={<FaHome />}
                      onClick={handleHomeXYZ}
                      flex={1}
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                      isLoading={homeXYZMutation.isLoading}>
                      Home XYZ
                    </Button>
                  </HStack>
                  
                  <Divider />
                  
                  <Button
                    onClick={() =>
                      selectedPosition && handleMoveToPosition(selectedPosition)
                    }
                    width="100%"
                    size="md"
                    colorScheme="purple"
                    isDisabled={!selectedPosition}
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
                <Heading size="sm" color="gray.700">Tip Management</Heading>
              </CardHeader>
              <CardBody pt={3}>
                <HStack spacing={2}>
                  <Button
                    leftIcon={<RiArrowUpDoubleFill fontSize="20px" />}
                    onClick={handleTipsOn}
                    flex={1}
                    colorScheme="green"
                    isDisabled={hasTips || !selectedPosition}
                    isLoading={tipsOnMutation.isLoading}>
                    Pick Up
                  </Button>
                  <Button
                    leftIcon={<RiArrowDownDoubleFill fontSize="20px" />}
                    onClick={handleTipsOff}
                    flex={1}
                    colorScheme="red"
                    isDisabled={!hasTips || !selectedPosition}
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
                      isDisabled={!hasTips || !selectedPosition}
                      isLoading={aspirateMutation.isLoading}>
                      Aspirate {volume}µL
                    </Button>
                    <Button
                      leftIcon={<FaVial />}
                      onClick={handleDispense}
                      width="100%"
                      size="lg"
                      colorScheme="orange"
                      isDisabled={!hasTips || !selectedPosition}
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
                    ? `Position ${selectedPosition} selected - ${DECK_POSITIONS.find(p => p.position === selectedPosition)?.labwareType}`
                    : "Click a position to select it"}
                </Text>
              </VStack>
            </CardHeader>
            <CardBody display="flex" alignItems="start" justifyContent="center" flex={1} pt={20}>
              <Grid 
                border="1px solid"
                borderColor="gray.200"
                borderRadius="lg"
                p={8}
                templateColumns="repeat(3, 1fr)" 
                gap={6} 
                maxWidth="800px"
              >
                {DECK_POSITIONS.map((labware) => {
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
                      onClick={() => setSelectedPosition(labware.position)}
                      _hover={{ 
                        transform: "translateY(-4px)", 
                        shadow: "lg",
                        borderColor: isSelected ? "blue.600" : "blue.300",
                        transition: "all 0.2s" 
                      }}
                      transition="all 0.2s"
                      position="relative"
                      height="160px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <VStack spacing={3}>
                        <Text 
                          fontWeight="bold" 
                          fontSize="4xl" 
                          color={isSelected ? "blue.600" : "gray.600"}
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
    </Box>
  );
};