import React, { useState, useEffect } from "react";
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
import { Plate, Reagent, Nest, NestStatus, Hotel } from "@/types";
import { PageHeader } from "@/components/ui/PageHeader";
import InventorySearch from "./search/InventorySearch";
import { InventoryToolCard } from "./cards/InventoryToolCard";
import { InventoryHotelCard } from "./cards/InventoryHotelCard";
import { trpc } from "@/utils/trpc";
import { Package } from "lucide-react";
import InventoryModal from "./modals/InventoryModal";
import PlateModal from "./modals/PlateModal";
import { Icon } from "@/components/ui/Icons";
import {
  successToast,
  errorToast,
  loadingToast,
  warningToast,
  progressToast,
} from "@/components/ui/Toast";
import { useCommonColors } from "@/components/ui/Theme";
import { AddIcon } from "@chakra-ui/icons";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { ToolType } from "gen-interfaces/controller";
import { actionToast } from "@/components/ui/Toast";
import { EmptyState } from "../ui/EmptyState";

export const InventoryManager = () => {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<(Plate | Reagent)[]>([]);
  const [selectedPlate, setSelectedPlate] = useState<Plate | null>(null);
  const [selectedReagent, setSelectedReagent] = useState<Reagent | null>(null);
  const [selectedNest, setSelectedNest] = useState<Nest | null>(null);
  const [selectedNestIds, setSelectedNestIds] = useState<number[]>([]);
  const [selectedContainerId, setSelectedContainerId] = useState<number | null>(null);
  const [selectedContainerType, setSelectedContainerType] = useState<"tool" | "hotel" | "">("");
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState(false);
  const [isPlateModalOpen, setIsPlateModalOpen] = useState(false);
  const [plateForModal, setPlateForModal] = useState<Plate | null>(null);
  const [showAddHotelModal, setShowAddHotelModal] = useState(false);
  const [newHotelName, setNewHotelName] = useState("");
  const [newHotelDescription, setNewHotelDescription] = useState("");
  const [newHotelRows, setNewHotelRows] = useState(10);
  const [newHotelColumns, setNewHotelColumns] = useState(1);
  const [showDeleteHotelModal, setShowDeleteHotelModal] = useState(false);
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);
  const [nestTriggerToolCommand, setNestTriggerToolCommand] = useState(false);

  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === "dark";

  const workcells = trpc.workcell.getAll.useQuery();
  const selectedWorkcellName = trpc.workcell.getSelectedWorkcell.useQuery();
  const selectedWorkcell = workcells.data?.find(
    (workcell) => workcell.name === selectedWorkcellName.data,
  );

  // Add a specific query for hotels
  const { data: hotels = [], refetch: refetchHotels } = trpc.inventory.getHotels.useQuery(
    selectedWorkcell?.name || "",
    {
      enabled: !!selectedWorkcell?.name,
    },
  );

  const { data: nests = [], refetch: refetchNests } = trpc.inventory.getNests.useQuery<Nest[]>(
    selectedWorkcellName.data ?? "",
    {
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      staleTime: 0, // Always refetch data
      cacheTime: 0, // Don't cache results
    },
  );

  const { data: plates = [], refetch: refetchPlates } = trpc.inventory.getPlates.useQuery<Plate[]>(
    selectedWorkcell?.name || "",
    {
      enabled: !!selectedWorkcell?.id,
    },
  );

  const { data: reagents = [], refetch: refetchReagents } = trpc.inventory.getReagents.useQuery<
    Reagent[]
  >(selectedWorkcell?.id ?? 0, {
    enabled: !!plates && Array.isArray(plates) && plates.length > 0,
  });

  const createNestMutation = trpc.inventory.createNest.useMutation();
  const deleteNestMutation = trpc.inventory.deleteNest.useMutation();
  const createPlateMutation = trpc.inventory.createPlate.useMutation();
  const updatePlateMutation = trpc.inventory.updatePlate.useMutation();
  const createReagentMutation = trpc.inventory.createReagent.useMutation();
  const createHotelMutation = trpc.inventory.createHotel.useMutation();
  const deleteHotelMutation = trpc.inventory.deleteHotel.useMutation();
  const updateHotelMutation = trpc.inventory.updateHotel.useMutation();
  const updateNestMutation = trpc.inventory.updateNest.useMutation();

  const workcellTools = selectedWorkcell?.tools || [];

  const { headerBg, borderColor } = useCommonColors();

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

  const handlePlateSelect = (plate: Plate) => {
    setSelectedPlate(plate);
  };

  const handlePlateClick = (plate: Plate) => {
    // Check if the plate is already in a nest
    if (plate.nestId) {
      // Get the nest
      const nest = typedNests.find((n) => n.id === plate.nestId);
      const nestName = nest ? nest.name : "Unknown location";

      // Use action toast to provide quick actions for the selected plate
      actionToast(
        `Plate: ${plate.name || plate.barcode}`,
        `Currently in ${nestName}`,
        [
          {
            label: "View Details",
            onClick: () => {
              setPlateForModal(plate);
              setIsPlateModalOpen(true);
            },
            colorScheme: "blue",
          },
          {
            label: "Check Out",
            onClick: () => {
              setSelectedPlate(plate);
              setIsCheckOutModalOpen(true);
            },
            colorScheme: "orange",
          },
        ],
        "info",
      );
    } else {
      // Plate not in any nest, offer different actions
      actionToast(
        `Plate: ${plate.name || plate.barcode}`,
        "Not currently checked in",
        [
          {
            label: "View Details",
            onClick: () => {
              setPlateForModal(plate);
              setIsPlateModalOpen(true);
            },
            colorScheme: "blue",
          },
          {
            label: "Check In",
            onClick: () => {
              setSelectedPlate(plate);
              setIsCheckInModalOpen(true);
            },
            colorScheme: "green",
          },
        ],
        "info",
      );
    }
  };

  const handleReagentSelect = (reagent: Reagent) => {
    setSelectedReagent(reagent);
  };

  const handleNestSelect = (nest: Nest) => {
    setSelectedNest(nest);
  };

  const handleCreateNest = async (
    parentId: number,
    nestName: string,
    nestRow: number,
    nestColumn: number,
    isHotel: boolean = false,
  ) => {
    try {
      // Use tRPC for all nest creation
      await createNestMutation.mutateAsync({
        name: nestName,
        row: nestRow,
        column: nestColumn,
        // If it's a hotel, use hotelId instead of toolId
        ...(isHotel ? { hotelId: parentId } : { toolId: parentId }),
      });

      // If this is a hotel nest, immediately update hotel dimensions if needed
      if (isHotel) {
        // Find the hotel
        const hotel = hotels.find((h) => h.id === parentId);
        if (hotel) {
          const needsUpdate = nestRow + 1 > hotel.rows || nestColumn + 1 > hotel.columns;
          if (needsUpdate) {
            // Update hotel dimensions
            await updateHotelMutation.mutateAsync({
              id: parentId,
              name: hotel.name,
              description: hotel.description || "",
              rows: Math.max(hotel.rows, nestRow + 1),
              columns: Math.max(hotel.columns, nestColumn + 1),
              imageUrl: hotel.imageUrl,
            });
          }
        }
        // Refresh hotels
        await refetchHotels();
      }

      // Refresh nest data
      await refetchNests();
    } catch (error) {
      errorToast("Error creating nest", error instanceof Error ? error.message : "Unknown error");
    }
  };

  const handleDeleteNest = async (nestId: number) => {
    try {
      await deleteNestMutation.mutateAsync(nestId);
      refetchNests();
    } catch (error) {
      errorToast("Error deleting nest", error instanceof Error ? error.message : "Unknown error");
    }
  };

  const handleCreatePlate = async (
    nestId: number,
    plateData: { name: string; barcode: string; plate_type: string },
  ) => {
    try {
      await createPlateMutation.mutateAsync({
        name: plateData.name,
        barcode: plateData.barcode,
        plateType: plateData.plate_type,
        nestId: nestId,
      });
      refetchPlates();
    } catch (error) {
      errorToast("Error creating plate", error instanceof Error ? error.message : "Unknown error");
    }
  };

  const handleCreateReagent = async (
    wellId: number,
    reagentData: Omit<Reagent, "id" | "well_id">,
  ) => {
    try {
      await createReagentMutation.mutateAsync({
        ...reagentData,
        wellId: wellId,
      });
      refetchReagents();
    } catch (error) {
      errorToast(
        "Error creating reagent",
        error instanceof Error ? error.message : "Unknown error",
      );
      throw error;
    }
  };

  const handleCheckIn = async ({
    nestId,
    plates: newPlates,
    triggerToolCommand,
    isStatic,
    containerId,
    containerType,
  }: {
    nestId: number;
    plates: Array<{ barcode: string; name: string; plate_type: string }>;
    triggerToolCommand: boolean;
    isStatic?: boolean;
    containerId?: number;
    containerType?: "tool" | "hotel" | "";
  }) => {
    try {
      // Handle automatic placement (nestId = -1)
      if (nestId === -1) {
        // Find available empty nests for the selected container
        const emptyNests = typedNests.filter((nest) => {
          // First filter by container type and ID if specified
          if (containerType === "tool" && containerId) {
            if (nest.toolId !== containerId) return false;
          } else if (containerType === "hotel" && containerId) {
            if (nest.hotelId !== containerId) return false;
          }

          // Then check if the nest is empty
          return !typedPlates.some((p) => p.nestId === nest.id) && nest.status === "empty";
        });

        if (emptyNests.length === 0) {
          throw new Error(
            `No empty nests available for automatic placement${containerType ? ` in the selected ${containerType}` : ""}`,
          );
        }

        // Sort by row and column to get the first available nest in reading order
        const sortedNests = [...emptyNests].sort((a, b) => {
          if (a.row === b.row) {
            return a.column - b.column;
          }
          return a.row - b.row;
        });

        // Use the first available nest
        nestId = sortedNests[0].id;
      }

      // Get the nest to check capacity
      const targetNest = typedNests.find((n: Nest) => n.id === nestId);
      if (!targetNest) {
        throw new Error("Selected nest not found");
      }

      // Check if the nest already has a plate
      const nestHasPlate = typedPlates.some((p) => p.nestId === nestId);
      if (nestHasPlate) {
        throw new Error("Selected nest is already occupied");
      }

      // Create all plates, checking for existing plates by name
      for (const plateData of newPlates) {
        // Check if a plate with this name already exists
        const plateWithSameName = typedPlates.find((p) => p.name === plateData.name);
        if (plateWithSameName) {
          // Append a unique identifier if name already exists
          const timestamp = Date.now().toString().slice(-4);
          plateData.name = `${plateData.name}-${timestamp}`;
        }

        try {
          await createPlateMutation.mutateAsync({
            ...plateData,
            nestId: nestId,
          });
        } catch (error) {
          // If a specific error about duplicate barcode happens, try to generate a new one
          if (
            error instanceof Error &&
            error.message.includes("barcode") &&
            error.message.includes("already exists")
          ) {
            const newBarcode = `${plateData.barcode}-${Date.now().toString().slice(-6)}`;
            await createPlateMutation.mutateAsync({
              ...plateData,
              barcode: newBarcode,
              nestId: nestId,
            });
          } else {
            // Re-throw other errors
            throw error;
          }
        }
      }

      // If tool command is requested and it's a single plate for a Liconic tool
      if (triggerToolCommand && newPlates.length === 1 && !isStatic) {
        // Find the tool associated with this nest
        const tool = workcellTools.find((t) => t.id === targetNest.toolId);

        if (tool && tool.type.toLowerCase() === "liconic") {
          try {
            // Extract row and column (level) information from the nest
            const { row, column } = targetNest;

            // Call your tool API here
            const commandMutation = trpc.tool.runCommand.useMutation();

            await commandMutation.mutateAsync({
              toolId: tool.id.toString(),
              toolType: "liconic" as ToolType,
              command: "store_plate",
              params: {
                cassette: 1,
                level: row + 1,
              },
            });
            successToast(
              "Tool command triggered",
              `Physical check-in command sent to ${tool.name} for position R${row + 1}C${column + 1}`,
            );
          } catch (cmdError) {
            errorToast(
              "Warning: Plate stored but tool command failed",
              cmdError instanceof Error ? cmdError.message : "Unknown error",
            );
          }
        }
      }

      refetchPlates();
      setSelectedPlate(null);
      setIsCheckInModalOpen(false);

      successToast("Check-in successful", `${newPlates.length} plate(s) checked in successfully`);
    } catch (error) {
      errorToast(
        "Error checking in plate(s)",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  };

  const handleCheckOut = async ({
    plateId,
    barcode,
    triggerToolCommand,
    isStatic,
  }: {
    plateId?: number;
    barcode?: string;
    triggerToolCommand: boolean;
    isStatic?: boolean;
  }) => {
    try {
      let plateToCheckOut: Plate | undefined;

      if (plateId) {
        plateToCheckOut = typedPlates.find((p) => p.id === plateId);
      } else if (barcode) {
        plateToCheckOut = typedPlates.find((p) => p.barcode === barcode);
      }

      if (!plateToCheckOut) {
        throw new Error("Plate not found");
      }

      if (!plateToCheckOut.nestId) {
        throw new Error("Plate is not checked into any nest");
      }

      // Get the nest to determine if this is a tool or hotel
      const nestId = plateToCheckOut.nestId;
      const nest = typedNests.find((n) => n.id === nestId);
      if (!nest) {
        throw new Error("Nest not found for this plate");
      }

      // First update the nest status to empty
      // This ensures the UI shows the correct status right away
      const updatedNest = {
        id: nest.id,
        name: nest.name,
        row: nest.row,
        column: nest.column,
        status: "empty" as NestStatus,
        // Only include non-null IDs
        ...(nest.toolId ? { toolId: nest.toolId } : {}),
        ...(nest.hotelId ? { hotelId: nest.toolId } : {}),
      };
      await updateNestMutation.mutateAsync(updatedNest);

      // Then update the plate to remove it from the nest
      await updatePlateMutation.mutateAsync({
        id: plateToCheckOut.id,
        barcode: plateToCheckOut.barcode,
        name: plateToCheckOut.name,
        plate_type: plateToCheckOut.plateType,
        nestId: null,
      } as any); // Type assertion to bypass type checking for this update

      // If tool command is requested and it's not a static hotel
      if (triggerToolCommand && !isStatic) {
        // Find the tool associated with this nest
        const tool = workcellTools.find((t) => t.id === nest.toolId);

        if (tool && tool.type.toLowerCase() === "liconic") {
          try {
            // Extract row and column information from the nest
            const { row, column } = nest;

            // Prepare a fetch plate command with the appropriate parameters
            const fetchCommand = {
              toolId: tool.id.toString(),
              toolType: "liconic" as ToolType,
              command: "fetch_plate",
              params: {
                cassette: 1,
                level: row + 1, // Convert to 1-indexed
              },
            };

            // Send command to the tool API
            const commandMutation = trpc.tool.runCommand.useMutation();
            await commandMutation.mutateAsync(fetchCommand);

            successToast(
              "Tool command triggered",
              `Physical check-out command sent to ${tool.name} for position R${row + 1}C${column + 1}`,
            );
          } catch (cmdError) {
            errorToast(
              "Warning: Plate checked out but tool command failed",
              cmdError instanceof Error ? cmdError.message : "Unknown error",
            );
          }
        }
      }

      // Refresh the data
      refetchNests();
      refetchPlates();
      setSelectedPlate(null);
      setIsCheckOutModalOpen(false);

      successToast(
        "Check-out successful",
        `Plate ${plateToCheckOut.name || plateToCheckOut.barcode} checked out successfully`,
      );
    } catch (error) {
      errorToast(
        "Error checking out plate",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  };

  const handleCreateHotel = async (hotelData: {
    name: string;
    description?: string;
    rows: number;
    columns: number;
  }) => {
    try {
      if (!selectedWorkcell?.id) {
        throw new Error("No workcell selected");
      }

      // Step 1: Create the hotel first
      const result = (await createHotelMutation.mutateAsync({
        ...hotelData,
        description: hotelData.description || "",
        imageUrl: null,
      })) as Hotel;

      // Get the hotel ID from the response
      const hotelId = result.id;

      // Step 2: Generate all nests for the hotel using loadingToast with promise
      const nestCreationPromise = (async () => {
        const totalNests = hotelData.rows * hotelData.columns;
        let createdNests = 0;

        // Create nests sequentially to avoid race conditions
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
      await refetchNests();
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
      await refetchNests();
    } catch (error) {
      errorToast("Error deleting hotel", error instanceof Error ? error.message : "Unknown error");

      // Still refresh data even after errors
      await refetchHotels();
      await refetchNests();
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
                    onCreateNest={(toolId, name, row, col) =>
                      handleCreateNest(toolId, name, row, col, false)
                    }
                    onDeleteNest={handleDeleteNest}
                    onCreatePlate={handleCreatePlate}
                    onCreateReagent={handleCreateReagent}
                    onNestClick={handleNestSelect}
                    onPlateClick={handlePlateClick}
                    onCheckIn={(nestId, triggerCmd) => {
                      const nestToUse = typedNests.find((n: Nest) => n.id === nestId) || null;
                      setSelectedNest(nestToUse);
                      setSelectedNestIds([nestId]);
                      setNestTriggerToolCommand(triggerCmd || false);
                      setSelectedContainerId(tool.id);
                      setSelectedContainerType("tool");
                      setIsCheckInModalOpen(true);
                    }}
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
                      onCreateNest={(hotelId, name, row, col) =>
                        handleCreateNest(hotelId, name, row, col, true)
                      }
                      onDeleteNest={handleDeleteNest}
                      onCreatePlate={handleCreatePlate}
                      onCreateReagent={handleCreateReagent}
                      onNestClick={handleNestSelect}
                      onPlateClick={handlePlateClick}
                      onDeleteHotel={() => {
                        setSelectedHotelId(hotel.id);
                        setShowDeleteHotelModal(true);
                      }}
                      onCheckIn={(nestId, triggerCmd) => {
                        const nestToUse = typedNests.find((n: Nest) => n.id === nestId) || null;
                        setSelectedNest(nestToUse);
                        setSelectedNestIds([nestId]);
                        setNestTriggerToolCommand(triggerCmd || false);
                        setSelectedContainerId(hotel.id);
                        setSelectedContainerType("hotel");
                        setIsCheckInModalOpen(true);
                      }}
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

      <InventoryModal
        mode="check-in"
        isOpen={isCheckInModalOpen}
        onClose={() => {
          setIsCheckInModalOpen(false);
          setSelectedNestIds([]);
          setSelectedContainerId(null);
          setSelectedContainerType("");
        }}
        tools={workcellTools}
        staticHotels={hotels}
        availableNests={typedNests}
        selectedPlate={selectedPlate}
        plates={typedPlates}
        triggerToolCommand={nestTriggerToolCommand}
        onCheckIn={handleCheckIn}
        onPlateClick={handlePlateClick}
        initialSelectedNestIds={selectedNestIds}
        initialContainerId={selectedContainerId}
        initialContainerType={selectedContainerType}
      />

      <InventoryModal
        mode="check-out"
        isOpen={isCheckOutModalOpen}
        onClose={() => {
          setIsCheckOutModalOpen(false);
          setSelectedNestIds([]);
          setSelectedContainerId(null);
          setSelectedContainerType("");
        }}
        selectedPlate={selectedPlate}
        tools={workcellTools}
        staticHotels={hotels}
        availableNests={typedNests}
        plates={typedPlates}
        triggerToolCommand={nestTriggerToolCommand}
        onCheckOut={handleCheckOut}
        onPlateClick={handlePlateClick}
        initialSelectedNestIds={selectedNestIds}
        initialContainerId={selectedContainerId}
        initialContainerType={selectedContainerType}
      />

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
              isDisabled={
                newHotelName === "" ||
                newHotelDescription === "" ||
                newHotelRows === 0 ||
                newHotelColumns === 0
              }
              colorScheme="teal"
              mr={3}
              onClick={async () => {
                await handleCreateHotel({
                  name: newHotelName,
                  description: newHotelDescription,
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
