import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  useToast,
  Card,
  CardBody,
  Icon,
  Divider,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
  HStack,
  Text,
  SimpleGrid,
  Button,
  ButtonGroup,
} from "@chakra-ui/react";
import { Inventory, Plate, Reagent, Nest, Tool } from "@/types/api";
import { PageHeader } from "@/components/ui/PageHeader";
import InventorySearch from "./search/InventorySearch";
import { InventoryToolCard } from "./cards/InventoryToolCard";
import AlertComponent from "@/components/ui/AlertComponent";
import { useColorMode } from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { BsBoxSeam } from "react-icons/bs";
import CheckInModal from "./modals/CheckInModal";
import CheckOutModal from "./modals/CheckOutModal";
import PlateModal from "./modals/PlateModal";

export const InventoryManager = () => {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<(Plate | Reagent)[]>([]);
  const [selectedPlate, setSelectedPlate] = useState<Plate | null>(null);
  const [selectedReagent, setSelectedReagent] = useState<Reagent | null>(null);
  const [selectedNest, setSelectedNest] = useState<Nest | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertStatus, setAlertStatus] = useState<"success" | "error" | "warning" | "info">("info");
  const [alertDescription, setAlertDescription] = useState("");
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState(false);
  const [isPlateModalOpen, setIsPlateModalOpen] = useState(false);
  const [plateForModal, setPlateForModal] = useState<Plate | null>(null);

  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === "dark";
  const toast = useToast();

  const workcells = trpc.workcell.getAll.useQuery();
  const SelectedWorkcellName = trpc.workcell.getSelectedWorkcell.useQuery();
  const selectedWorkcell = workcells.data?.find(
    (workcell) => workcell.name === SelectedWorkcellName.data,
  );

  const { data: nests = [], refetch: refetchNests } = trpc.inventory.getNests.useQuery<Nest[]>(
    SelectedWorkcellName.data ?? "",
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

  const workcellTools = selectedWorkcell?.tools || [];

  const headerBg = useColorModeValue("white", "gray.700");
  const containerBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Calculate stats with proper typing
  const typedNests = nests as Nest[];
  const typedPlates = plates as Plate[];
  const typedReagents = reagents as Reagent[];

  const totalPlates = typedPlates.length;
  const totalReagents = typedReagents.length;
  const totalNests = typedNests.length;
  const occupiedNests = typedPlates.filter((plate) => plate.nest_id !== null).length;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearch(searchTerm);
  };

  const handlePlateSelect = (plate: Plate) => {
    setSelectedPlate(plate);
  };

  const handlePlateClick = (plate: Plate) => {
    setPlateForModal(plate);
    setIsPlateModalOpen(true);
  };

  const handleReagentSelect = (reagent: Reagent) => {
    setSelectedReagent(reagent);
  };

  const handleNestSelect = (nest: Nest) => {
    setSelectedNest(nest);
  };

  const handleCreateNest = async (
    toolId: number,
    nestName: string,
    nestRow: number,
    nestColumn: number,
  ) => {
    try {
      await createNestMutation.mutateAsync({
        name: nestName,
        row: nestRow,
        column: nestColumn,
        tool_id: toolId,
      });
      refetchNests();
    } catch (error) {
      console.error("Error creating nest:", error);
      toast({
        title: "Error creating nest",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteNest = async (nestId: number) => {
    try {
      await deleteNestMutation.mutateAsync(nestId);
      refetchNests();
    } catch (error) {
      console.error("Error deleting nest:", error);
      toast({
        title: "Error deleting nest",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
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
        plate_type: plateData.plate_type,
        nest_id: nestId,
      });
      refetchPlates();
    } catch (error) {
      console.error("Error creating plate:", error);
      toast({
        title: "Error creating plate",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCreateReagent = async (
    wellId: number,
    reagentData: Omit<Reagent, "id" | "well_id">,
  ) => {
    try {
      await createReagentMutation.mutateAsync({
        ...reagentData,
        well_id: wellId,
      });
      refetchReagents();
    } catch (error) {
      console.error("Error creating reagent:", error);
      throw error;
    }
  };

  const handleCheckIn = async ({
    nestId,
    plates: newPlates,
    triggerToolCommand,
  }: {
    nestId: number;
    plates: Array<{ barcode: string; name: string; plate_type: string }>;
    triggerToolCommand: boolean;
  }) => {
    try {
      // Get the nest to check capacity
      const targetNest = typedNests.find((n: Nest) => n.id === nestId);
      if (!targetNest) {
        throw new Error("Selected nest not found");
      }

      // Check if the nest already has a plate
      const nestHasPlate = typedPlates.some((p) => p.nest_id === nestId);
      if (nestHasPlate) {
        throw new Error("Selected nest is already occupied");
      }

      // Create all plates
      for (const plateData of newPlates) {
        await createPlateMutation.mutateAsync({
          ...plateData,
          nest_id: nestId,
        });
      }

      // If tool command is requested and it's a single plate
      if (triggerToolCommand && newPlates.length === 1) {
        // Here you would trigger the physical tool command
        // This is a placeholder for the actual implementation
        toast({
          title: "Tool command triggered",
          description: "Physical check-in command sent to the tool",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      }

      refetchPlates();
      setSelectedPlate(null);
      setIsCheckInModalOpen(false);

      toast({
        title: "Check-in successful",
        description: `${newPlates.length} plate(s) checked in successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error checking in plate(s):", error);
      toast({
        title: "Error checking in plate(s)",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCheckOut = async ({
    plateId,
    barcode,
    triggerToolCommand,
  }: {
    plateId?: number;
    barcode?: string;
    triggerToolCommand: boolean;
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

      if (!plateToCheckOut.nest_id) {
        throw new Error("Plate is not checked into any nest");
      }

      // Update the plate to remove it from the nest
      await updatePlateMutation.mutateAsync({
        ...plateToCheckOut,
        nest_id: null,
      });

      // If tool command is requested
      if (triggerToolCommand) {
        // Here you would trigger the physical tool command
        // This is a placeholder for the actual implementation
        toast({
          title: "Tool command triggered",
          description: "Physical check-out command sent to the tool",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      }

      refetchPlates();
      setSelectedPlate(null);
      setIsCheckOutModalOpen(false);

      toast({
        title: "Check-out successful",
        description: `Plate ${plateToCheckOut.name || plateToCheckOut.barcode} checked out successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error checking out plate:", error);
      toast({
        title: "Error checking out plate",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
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
                  titleIcon={<Icon as={BsBoxSeam} boxSize={8} color="teal.500" />}
                  mainButton={null}
                />
                <ButtonGroup>
                  <Button colorScheme="teal" onClick={() => setIsCheckInModalOpen(true)}>
                    Check In
                  </Button>
                  <Button
                    colorScheme="teal"
                    variant="outline"
                    onClick={() => setIsCheckOutModalOpen(true)}>
                    Check Out
                  </Button>
                </ButtonGroup>
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
          <CardBody>
            <SimpleGrid
              columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 4 }}
              spacing={6}
              w="100%"
              alignItems="start"
              px={2}
              py={2}>
              {workcellTools.map((tool: Tool) => (
                <Box key={tool.id}>
                  <InventoryToolCard
                    toolId={tool.id}
                    nests={typedNests.filter((n: Nest) => n.tool_id === tool.id)}
                    plates={typedPlates}
                    onCreateNest={handleCreateNest}
                    onDeleteNest={handleDeleteNest}
                    onCreatePlate={handleCreatePlate}
                    onCreateReagent={handleCreateReagent}
                    onNestClick={handleNestSelect}
                    onPlateClick={handlePlateClick}
                  />
                </Box>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>
      </VStack>

      {showAlert && (
        <AlertComponent
          showAlert={showAlert}
          status={alertStatus}
          title={alertStatus.charAt(0).toUpperCase() + alertStatus.slice(1)}
          description={alertDescription}
          onClose={() => setShowAlert(false)}
        />
      )}

      <CheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        tools={workcellTools}
        availableNests={typedNests}
        selectedPlate={selectedPlate}
        plates={typedPlates}
        onSubmit={handleCheckIn}
        onPlateClick={handlePlateClick}
      />

      <CheckOutModal
        isOpen={isCheckOutModalOpen}
        onClose={() => setIsCheckOutModalOpen(false)}
        selectedPlate={selectedPlate}
        tools={workcellTools}
        availableNests={typedNests}
        plates={typedPlates}
        onSubmit={handleCheckOut}
        onPlateClick={handlePlateClick}
      />

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
    </Box>
  );
};
