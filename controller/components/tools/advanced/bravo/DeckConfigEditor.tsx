import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Button,
  Grid,
  GridItem,
  Text,
  Badge,
  FormControl,
  FormLabel,
  Select,
  useToast,
  Card,
  CardBody,
  useColorModeValue,
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
  Spacer,
  ButtonGroup,
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { successToast, errorToast } from "@/components/ui/Toast";
import { CreateDeckConfigModal } from "./CreateDeckConfigModal";
import { RiEdit2Line, RiSaveLine } from "react-icons/ri";
import { DeleteWithConfirmation } from "@/components/ui/Delete";
import { BiSolidEraser } from "react-icons/bi";

type DeckPosition = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

interface LabwarePosition {
  position: DeckPosition;
  labwareType: string;
}

const EMPTY_DECK_LAYOUT: Record<string, string | null> = {
  "1": null,
  "2": null,
  "3": null,
  "4": null,
  "5": null,
  "6": null,
  "7": null,
  "8": null,
  "9": null,
};

interface DeckConfigEditorProps {
  onDeckPositionsChange?: (positions: LabwarePosition[]) => void;
}

export const DeckConfigEditor: React.FC<DeckConfigEditorProps> = ({ onDeckPositionsChange }) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [selectedPosition, setSelectedPosition] = useState<DeckPosition | null>(null);
  const [deckPositions, setDeckPositions] = useState<LabwarePosition[]>([]);
  const [editingPosition, setEditingPosition] = useState<DeckPosition | null>(null);
  const [selectedLabware, setSelectedLabware] = useState<string>("");
  const [selectedConfigId, setSelectedConfigId] = useState<number | null>(null);

  const deckBgColor = useColorModeValue("gray.100", "gray.800");

  const {
    data: configs,
    refetch: refetchConfigs,
    isLoading: configsLoading,
  } = trpc.bravoDeckConfig.getAll.useQuery();

  const { data: allLabware, isLoading: labwareLoading } = trpc.labware.getAll.useQuery();

  const updateConfig = trpc.bravoDeckConfig.update.useMutation();
  const deleteConfig = trpc.bravoDeckConfig.delete.useMutation();

  // Initialize with empty deck on mount
  useEffect(() => {
    const emptyDeck: LabwarePosition[] = Array.from({ length: 9 }, (_, i) => ({
      position: (i + 1) as DeckPosition,
      labwareType: "Empty",
    }));
    setDeckPositions(emptyDeck);
    onDeckPositionsChange?.(emptyDeck);
  }, []);

  // Load selected config when it changes
  useEffect(() => {
    if (selectedConfigId && configs) {
      const selectedConfig = configs.find((c) => c.id === selectedConfigId);
      if (selectedConfig) {
        loadConfigToDeck(selectedConfig);
      }
    }
  }, [selectedConfigId, configs]);

  const loadConfigToDeck = (config: any) => {
    const newDeckPositions: LabwarePosition[] = Array.from({ length: 9 }, (_, i) => {
      const position = (i + 1) as DeckPosition;
      const labware = config.deck_layout[position.toString()];
      return {
        position,
        labwareType: labware || "Empty",
      };
    });
    setDeckPositions(newDeckPositions);
    onDeckPositionsChange?.(newDeckPositions);
  };

  const handleSaveCurrentConfig = async () => {
    if (!selectedConfigId) {
      errorToast("No config selected", "Please select a configuration to update");
      return;
    }

    const deckLayout: Record<string, string | null> = {};
    for (let i = 1; i <= 9; i++) {
      const position = deckPositions.find((p) => p.position === i);
      deckLayout[i.toString()] =
        position?.labwareType && position.labwareType !== "Empty" ? position.labwareType : null;
    }
    await updateConfig.mutateAsync({
      id: selectedConfigId,
      data: {
        deck_layout: deckLayout,
      },
    });
    successToast("Config saved", "Deck configuration has been updated");
    refetchConfigs();
  };

  const handleDeleteConfig = async () => {
    if (!selectedConfigId) return;
    await deleteConfig.mutateAsync(selectedConfigId);
    successToast("Config deleted", "Deck configuration has been deleted");
    setSelectedConfigId(null);
    setDeckPositions(
      Array.from({ length: 9 }, (_, i) => ({
        position: (i + 1) as DeckPosition,
        labwareType: "Empty",
      })),
    );
    refetchConfigs();
  };

  const handleEditLabware = (position: DeckPosition) => {
    setEditingPosition(position);
    const currentLabware = deckPositions.find((p) => p.position === position);
    setSelectedLabware(currentLabware?.labwareType || "");
    onOpen();
  };

  const handleSaveLabware = () => {
    if (!editingPosition || !selectedLabware) return;

    const updatedPositions = deckPositions.map((pos) =>
      pos.position === editingPosition ? { ...pos, labwareType: selectedLabware } : pos,
    );

    setDeckPositions(updatedPositions);
    onDeckPositionsChange?.(updatedPositions);

    toast({
      title: "Labware updated",
      description: `Position ${editingPosition} now has ${selectedLabware}`,
      status: "success",
      duration: 3000,
    });

    onClose();
  };

  const handleClearAllLabware = () => {
    const emptyDeck: LabwarePosition[] = Array.from({ length: 9 }, (_, i) => ({
      position: (i + 1) as DeckPosition,
      labwareType: "Empty",
    }));
    setDeckPositions(emptyDeck);
    onDeckPositionsChange?.(emptyDeck);
    toast({
      title: "Deck cleared",
      description: "All labware has been removed from the deck",
      status: "success",
      duration: 3000,
    });
  };

  if (configsLoading || labwareLoading) {
    return (
      <Box p={6} display="flex" alignItems="center" justifyContent="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading Bravo configuration...</Text>
        </VStack>
      </Box>
    );
  }

  const selectedConfig = configs?.find((c) => c.id === selectedConfigId);

  return (
    <VStack spacing={6} align="stretch">
      <Card>
        <CardBody>
          <VStack spacing={6} width="100%">
            <HStack spacing={2} justifyContent="space-between" width="100%">
              <HStack>
                <Text whiteSpace="nowrap" fontWeight="bold" fontSize="lg">
                  Select Deck Config:
                </Text>
                <Select
                  width="300px"
                  fontSize="lg"
                  placeholder="Select a configuration"
                  value={selectedConfigId || ""}
                  onChange={(e) => {
                    const configId = e.target.value ? Number(e.target.value) : null;
                    setSelectedConfigId(configId);
                  }}>
                  {configs?.map((config) => (
                    <option key={config.id} value={config.id}>
                      {config.name} ({Object.values(config.deck_layout).filter(Boolean).length}{" "}
                      positions)
                    </option>
                  ))}
                </Select>
              </HStack>
              <Spacer />
              <ButtonGroup spacing={2}>
                <Button
                  leftIcon={<RiSaveLine />}
                  colorScheme="teal"
                  onClick={handleSaveCurrentConfig}
                  isLoading={updateConfig.isLoading}
                  loadingText="Saving..."
                  isDisabled={!selectedConfigId}
                  flex={1}>
                  Save
                </Button>
                <Button
                  leftIcon={<BiSolidEraser />}
                  colorScheme="yellow"
                  onClick={handleClearAllLabware}>
                  Clear
                </Button>
                {selectedConfigId && (
                  <DeleteWithConfirmation
                    label={selectedConfig?.name || "Config"}
                    onDelete={handleDeleteConfig}
                    variant="button"
                  />
                )}
              </ButtonGroup>
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
                const hasLabware = labware.labwareType !== "Empty";
                const borderColor = isSelected ? "blue.500" : hasLabware ? "green.400" : "gray.300";

                return (
                  <GridItem
                    key={labware.position}
                    border="3px solid"
                    borderColor={borderColor}
                    borderRadius="lg"
                    p={4}
                    cursor="pointer"
                    onClick={() => setSelectedPosition(labware.position)}
                    _hover={{
                      transform: "translateY(-4px)",
                      shadow: "lg",
                      borderColor: isSelected ? "blue.600" : "blue.300",
                      transition: "all 0.2s",
                    }}
                    transition="all 0.2s"
                    position="relative"
                    height="140px"
                    width="220px"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center">
                    <VStack spacing={3} flex={1} justify="center">
                      <Text
                        fontWeight="bold"
                        fontSize="4xl"
                        color={isSelected ? "blue.600" : "gray.500"}>
                        {labware.position}
                      </Text>
                      <Badge
                        colorScheme={hasLabware ? "green" : "gray"}
                        fontSize="sm"
                        px={3}
                        py={1}
                        borderRadius="md">
                        <Text isTruncated maxW="150px">
                          {labware.labwareType}
                        </Text>
                      </Badge>
                    </VStack>

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
                      {hasLabware ? "Edit" : "Set"} Labware
                    </Button>

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
          </VStack>
        </CardBody>
      </Card>

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
                <option value="Empty">Empty</option>
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
            <Button colorScheme="blue" onClick={handleSaveLabware} isDisabled={!selectedLabware}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};
