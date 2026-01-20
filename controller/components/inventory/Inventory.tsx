import React, { useState } from "react";
import {
  Box,
  VStack,
  Card,
  CardBody,
  Divider,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  HStack,
  Text,
  SimpleGrid,
  Button,
  useColorMode,
  CardHeader,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Heading,
  Tooltip,
} from "@chakra-ui/react";
import { Plate, Reagent, Nest, Hotel } from "@/types";
import { PageHeader } from "@/components/ui/PageHeader";
import InventorySearch from "./search/InventorySearch";
import { InventoryToolCard } from "./cards/InventoryToolCard";
import { InventoryHotelCard } from "./cards/InventoryHotelCard";
import { trpc } from "@/utils/trpc";
import { Package } from "lucide-react";
import PlateModal from "./modals/PlateModal";
import { Icon } from "@/components/ui/Icons";
import {
  errorToast,
  loadingToast,
  warningToast,
  progressToast,
  successToast,
} from "@/components/ui/Toast";
import { useCommonColors } from "@/components/ui/Theme";
import { AddIcon } from "@chakra-ui/icons";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { EmptyState } from "../ui/EmptyState";

export const InventoryManager = () => {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<(Plate | Reagent)[]>([]);

  const [isPlateModalOpen, setIsPlateModalOpen] = useState(false);
  const [plateForModal, setPlateForModal] = useState<Plate | null>(null);
  const [showAddHotelModal, setShowAddHotelModal] = useState(false);
  const [newHotelName, setNewHotelName] = useState("");
  const [newHotelDescription, setNewHotelDescription] = useState("");
  const [newHotelRows, setNewHotelRows] = useState(10);
  const [newHotelColumns, setNewHotelColumns] = useState(1);
  const [showDeleteHotelModal, setShowDeleteHotelModal] = useState(false);
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);
  const [_selectedReagent, setSelectedReagent] = useState<number | null>(null);
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === "dark";

  const workcells = trpc.workcell.getAll.useQuery();
  const selectedWorkcellName = trpc.workcell.getSelectedWorkcell.useQuery();
  const selectedWorkcell = workcells.data?.find(
    (workcell) => workcell.name === selectedWorkcellName.data,
  );

  const { data: hotels = [], refetch: refetchHotels } = trpc.inventory.getHotels.useQuery(
    selectedWorkcell?.name || "",
    {
      enabled: !!selectedWorkcell?.name,
    },
  );

  const { data: nests = [] } = trpc.inventory.getNests.useQuery(undefined, {
    enabled: !!selectedWorkcellName.data,
  });

  const { data: plates = [] } = trpc.inventory.getPlates.useQuery<Plate[]>(
    selectedWorkcell?.name || "",
    {
      enabled: !!selectedWorkcell?.id,
    },
  );

  const { data: reagents = [] } = trpc.inventory.getReagents.useQuery(
    { workcellName: selectedWorkcellName.data },
    {
      enabled: !!selectedWorkcellName.data,
    },
  );
  const utils = trpc.useContext();

  const createNestMutation = trpc.inventory.createNest.useMutation();
  const updateNestMutation = trpc.inventory.updateNest.useMutation({
    onSuccess: () => {
      utils.inventory.getNests.invalidate();
    },
  });
  const deleteNestMutation = trpc.inventory.deleteNest.useMutation();
  const createReagentMutation = trpc.inventory.createReagent.useMutation();
  const createHotelMutation = trpc.inventory.createHotel.useMutation();
  const deleteHotelMutation = trpc.inventory.deleteHotel.useMutation();

  // Robot integration mutations
  const toggleRobotAccessibleMutation = trpc.inventory.toggleRobotAccessible.useMutation({
    onSuccess: () => {
      utils.inventory.getNests.invalidate();
      utils.robotArm.location.getAll.invalidate();
      utils.inventory.getNestsWithTeachpoints.invalidate();
    },
  });
  const createTransferStationMutation = trpc.inventory.createTransferStation.useMutation({
    onSuccess: () => {
      utils.inventory.getNests.invalidate();
      utils.robotArm.location.getAll.invalidate();
      utils.inventory.getNestsWithTeachpoints.invalidate();
    },
  });
  const inferHotelPositionsMutation = trpc.inventory.inferHotelPositions.useMutation({
    onSuccess: () => {
      utils.inventory.getNests.invalidate();
      utils.robotArm.location.getAll.invalidate();
      utils.inventory.getNestsWithTeachpoints.invalidate();
    },
  });

  const workcellTools = selectedWorkcell?.tools || [];

  const { headerBg } = useCommonColors();

  // Calculate stats with proper typing
  const typedNests = nests as Nest[];
  const typedPlates = plates as Plate[];
  const typedReagents = reagents as Reagent[];

  const totalPlates = typedPlates.length;
  const totalReagents = typedReagents.length;
  const totalNests = typedNests.length;
  const occupiedNests = typedPlates.filter((plate) => plate.nestId !== null).length;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearch(searchTerm);
  };

  const handlePlateSelect = (_plate: Plate) => {};

  const handleCreateReagent = async (
    wellId: number,
    reagentData: { name: string; expirationDate: string; volume: number },
  ) => {
    await createReagentMutation.mutateAsync({
      name: reagentData.name,
      expirationDate: reagentData.expirationDate,
      volume: reagentData.volume,
      wellId: wellId,
    });
  };

  const handleCreateHotel = async (hotelData: { name: string; rows: number; columns: number }) => {
    try {
      // Step 1: Create the hotel first
      const result = (await createHotelMutation.mutateAsync({
        ...hotelData,
      })) as Hotel;

      const hotelId = result.id;
      const nestCreationPromise = (async () => {
        const totalNests = hotelData.rows * hotelData.columns;
        let createdNests = 0;
        for (let row = 0; row < hotelData.rows; row++) {
          for (let col = 0; col < hotelData.columns; col++) {
            try {
              await createNestMutation.mutateAsync({
                name: `${hotelData.name}-R${row + 1}C${col + 1}`,
                row: row,
                column: col,
                hotelId: hotelId,
              });
              createdNests++;
            } catch (nestError) {
              // Continue with other nests even if one fails
            }
          }
        }
        // Return success data that includes counts
        return {
          successCount: createdNests,
          errorCount: totalNests - createdNests,
          totalCount: totalNests,
        };
      })();

      // Use loadingToast to show progress and handle success/error
      loadingToast(
        "Creating Hotel",
        `Creating ${hotelData.rows * hotelData.columns} nests for ${hotelData.name}...`,
        nestCreationPromise,
        {
          successTitle: "Hotel Created Successfully",
          successDescription: (result) =>
            `Created ${result.successCount} of ${result.totalCount} nests for hotel "${hotelData.name}"`,
          errorTitle: "Hotel Creation Issue",
          errorDescription: (error) =>
            `Some nests could not be created: ${error.message || "Unknown error"}`,
        },
      );

      // Wait for all nests to be created
      await nestCreationPromise;

      // Step 3: Refresh the data
      await refetchHotels();
    } catch (error) {
      errorToast("Error creating hotel", error instanceof Error ? error.message : "Unknown error");
    }
  };

  const handleDeleteHotel = async (hotelId: number) => {
    try {
      // First, get all nests associated with this hotel
      const hotelNests = typedNests.filter((nest) => nest.hotelId === hotelId);
      const totalNests = hotelNests.length;

      // Create a progress toast to show deletion progress
      const progress = progressToast(`Deleting Hotel (0/${totalNests} nests)`, 0);

      // Delete all nests first
      let deletedCount = 0;
      for (const nest of hotelNests) {
        try {
          await deleteNestMutation.mutateAsync(nest.id);
          deletedCount++;

          // Update progress
          const percent = Math.round((deletedCount / totalNests) * 100);
          progress.updateProgress(percent, `Deleting nests (${deletedCount}/${totalNests})`);
        } catch (nestError) {
          // Continue with other nests even if one fails
        }
      }

      // Final step: delete the hotel itself
      progress.updateProgress(95, "Deleting hotel...");

      // Now try to delete the hotel
      try {
        await deleteHotelMutation.mutateAsync(hotelId);

        // Complete the progress
        progress.complete("Hotel Deleted", `Successfully deleted hotel and ${deletedCount} nests`);
      } catch (hotelError) {
        // Show warning if hotel deletion failed but nests were deleted
        if (deletedCount > 0) {
          progress.updateProgress(
            100,
            `Deleted ${deletedCount}/${totalNests} nests, but hotel deletion failed`,
          );

          warningToast(
            "Partial deletion",
            `Deleted ${deletedCount}/${totalNests} nests, but hotel record deletion failed`,
          );
        } else {
          progress.error(
            "Deletion Failed",
            `Failed to delete hotel: ${hotelError instanceof Error ? hotelError.message : "Unknown error"}`,
          );
        }
      }

      // Always refresh the data regardless of errors
      await refetchHotels();
    } catch (error) {
      errorToast("Error deleting hotel", error instanceof Error ? error.message : "Unknown error");

      // Still refresh data even after errors
      await refetchHotels();
    }
  };

  const handleReagentSelect = (reagent: Reagent) => {
    setSelectedReagent(reagent.id);
  };

  // Robot integration handlers
  const handleToggleRobotAccessible = async (
    nestId: number,
    accessible: boolean,
    suppressToast: boolean = false,
  ) => {
    try {
      const result = await toggleRobotAccessibleMutation.mutateAsync({
        nestId,
        accessible,
      });

      if (result.created && !suppressToast) {
        // Show notification per user preference (unless suppressed for batch operations)
        successToast(
          "Teachpoint Created",
          "Robot-accessible nest created with default coordinates. Please teach the actual position in the Teach Pendant.",
        );
      }
    } catch (error) {
      if (!suppressToast) {
        errorToast(
          "Error toggling robot accessibility",
          error instanceof Error ? error.message : "Unknown error",
        );
      }
      throw error; // Re-throw so batch operations can count failures
    }
  };

  const handleCreateTransferStation = async (toolId: number, name: string) => {
    try {
      await createTransferStationMutation.mutateAsync({
        toolId,
        name,
      });

      successToast("Transfer Station Created", "Please teach the position in the Teach Pendant.");
    } catch (error) {
      errorToast(
        "Error creating transfer station",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  };

  const handleUpdateNest = async (
    nestId: number,
    updates: { nestType?: string; name?: string },
  ) => {
    try {
      await updateNestMutation.mutateAsync({
        id: nestId,
        ...updates,
      });

      successToast("Nest Updated", "Nest type has been updated successfully.");
    } catch (error) {
      errorToast("Error updating nest", error instanceof Error ? error.message : "Unknown error");
    }
  };

  const handleInferHotelPositions = async (
    hotelId: number,
    referenceNestId: number,
    zOffset: number,
  ) => {
    try {
      const result = await inferHotelPositionsMutation.mutateAsync({
        hotelId,
        referenceNestId,
        zOffset,
      });

      successToast(
        "Positions Inferred",
        `Successfully calculated positions for ${result.inferredCount} nests.`,
      );
    } catch (error) {
      errorToast(
        "Error inferring positions",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  };

  return (
    <Box maxW="100%">
      <VStack spacing={4} align="stretch">
        <Card bg={headerBg} shadow="md">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between" align="center">
                <PageHeader
                  title="Inventory"
                  subTitle="Manage plates, reagents, and nests across your workcells"
                  titleIcon={<Icon as={Package} boxSize={8} color="teal.500" />}
                  mainButton={null}
                />
              </HStack>

              <Divider />

              <StatGroup>
                <Stat>
                  <StatLabel>Total Plates</StatLabel>
                  <StatNumber>{totalPlates}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Total Reagents</StatLabel>
                  <StatNumber>{totalReagents}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Nests</StatLabel>
                  <StatNumber>
                    {occupiedNests} / {totalNests}
                  </StatNumber>
                  <Text fontSize="sm" color="gray.500">
                    Occupied
                  </Text>
                </Stat>
              </StatGroup>

              <InventorySearch
                search={search}
                searchResults={searchResults}
                isDarkMode={isDarkMode}
                onSearchChange={handleSearch}
                onClearSearch={() => {
                  setSearch("");
                  setSearchResults([]);
                }}
                onPlateSelect={handlePlateSelect}
                onReagentSelect={handleReagentSelect}
              />
            </VStack>
          </CardBody>
        </Card>

        <Card bg={headerBg} shadow="md">
          <CardHeader pb={0}>
            <Heading size="md">Tools</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid
              columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 4 }}
              spacing={6}
              w="100%"
              alignItems="start"
              px={2}
              py={2}>
              {workcellTools.map((tool) => (
                <Box key={tool.id}>
                  <InventoryToolCard
                    toolId={tool.id}
                    nests={typedNests.filter((n: Nest) => n.toolId === tool.id)}
                    plates={typedPlates}
                    onToggleRobotAccessible={handleToggleRobotAccessible}
                    onCreateTransferStation={handleCreateTransferStation}
                    onUpdateNest={handleUpdateNest}
                  />
                </Box>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>

        <Card bg={headerBg} shadow="md">
          <CardHeader pb={0}>
            <Flex justifyContent="space-between" alignItems="center">
              <Heading size="md">Hotels</Heading>
              <Tooltip
                label={!selectedWorkcell ? "Create or Select a Workcell to add new hotel" : ""}
                placement="top"
                hasArrow>
                <Button
                  isDisabled={!selectedWorkcell}
                  leftIcon={<AddIcon />}
                  colorScheme="teal"
                  size="sm"
                  onClick={() => setShowAddHotelModal(true)}>
                  Add Hotel
                </Button>
              </Tooltip>
            </Flex>
          </CardHeader>
          <CardBody>
            {hotels.length > 0 ? (
              <SimpleGrid
                columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 4 }}
                spacing={6}
                w="100%"
                alignItems="start"
                px={2}
                py={2}>
                {hotels.map((hotel) => (
                  <Box key={hotel.id}>
                    <InventoryHotelCard
                      hotelId={hotel.id}
                      nests={typedNests.filter((n: Nest) => n.hotelId === hotel.id)}
                      plates={typedPlates}
                      onDeleteHotel={() => {
                        setSelectedHotelId(hotel.id);
                        setShowDeleteHotelModal(true);
                      }}
                      onToggleRobotAccessible={handleToggleRobotAccessible}
                      onInferPositions={handleInferHotelPositions}
                      onUpdateNest={handleUpdateNest}
                    />
                  </Box>
                ))}
              </SimpleGrid>
            ) : (
              <Box width="100%">
                <EmptyState
                  size="lg"
                  title="No hotels found"
                  description="Add a hotel to get started."
                />
              </Box>
            )}
          </CardBody>
        </Card>
      </VStack>

      <Modal isOpen={showAddHotelModal} onClose={() => setShowAddHotelModal(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Hotel</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl isRequired>
              <FormLabel>Hotel Name</FormLabel>
              <Input
                placeholder="Hotel name"
                value={newHotelName}
                onChange={(e) => setNewHotelName(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Description</FormLabel>
              <Input
                placeholder="Hotel description"
                value={newHotelDescription}
                onChange={(e) => setNewHotelDescription(e.target.value)}
              />
            </FormControl>
            <HStack mt={4} spacing={4}>
              <FormControl isRequired>
                <FormLabel>Rows</FormLabel>
                <NumberInput
                  min={1}
                  value={newHotelRows}
                  onChange={(value) => setNewHotelRows(Number(value))}>
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Columns</FormLabel>
                <NumberInput
                  min={1}
                  value={newHotelColumns}
                  onChange={(value) => setNewHotelColumns(Number(value))}>
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </HStack>
          </ModalBody>
          <ModalFooter>
            <Button
              isDisabled={newHotelName === "" || newHotelRows === 0 || newHotelColumns === 0}
              colorScheme="teal"
              mr={3}
              onClick={async () => {
                await handleCreateHotel({
                  name: newHotelName,
                  rows: newHotelRows,
                  columns: newHotelColumns,
                });
                setShowAddHotelModal(false);
                setNewHotelName("");
                setNewHotelDescription("");
                setNewHotelRows(10);
                setNewHotelColumns(1);
              }}>
              Create
            </Button>
            <Button onClick={() => setShowAddHotelModal(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {plateForModal && (
        <PlateModal
          isOpen={isPlateModalOpen}
          onClose={() => {
            setIsPlateModalOpen(false);
            setPlateForModal(null);
          }}
          plate={plateForModal}
          onCreateReagent={handleCreateReagent}
        />
      )}

      <ConfirmationModal
        isOpen={showDeleteHotelModal}
        onClose={() => setShowDeleteHotelModal(false)}
        onClick={() => {
          if (selectedHotelId !== null) {
            handleDeleteHotel(selectedHotelId);
          }
          setShowDeleteHotelModal(false);
          setSelectedHotelId(null);
        }}
        header="Delete Hotel"
        confirmText="Delete"
        colorScheme="red">
        Are you sure you want to delete this hotel? This will also delete all nests associated with
        this hotel. This action cannot be undone.
      </ConfirmationModal>
    </Box>
  );
};
