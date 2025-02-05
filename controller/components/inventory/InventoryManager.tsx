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
} from "@chakra-ui/react";
import { Inventory, Plate, Reagent, Nest, Tool } from "@/types/api";
import { PageHeader } from "@/components/ui/PageHeader";
import InventorySearch from "./InventorySearch";
import { InventoryToolCard } from "./InventoryToolCard";
import AlertComponent from "@/components/ui/AlertComponent";
import { useColorMode } from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { BsBoxSeam } from "react-icons/bs";

export const InventoryManager = () => {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<(Plate | Reagent)[]>([]);
  const [selectedPlate, setSelectedPlate] = useState<Plate | null>(null);
  const [selectedReagent, setSelectedReagent] = useState<Reagent | null>(null);
  const [selectedNest, setSelectedNest] = useState<Nest | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertStatus, setAlertStatus] = useState<"success" | "error" | "warning" | "info">("info");
  const [alertDescription, setAlertDescription] = useState("");

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
  const createReagentMutation = trpc.inventory.createReagent.useMutation();

  const workcellTools = selectedWorkcell?.tools || [];

  const headerBg = useColorModeValue("white", "gray.700");
  const containerBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Calculate stats with proper typing
  const totalPlates = (plates as Plate[]).length;
  const totalReagents = (reagents as Reagent[]).length;
  const totalNests = (nests as Nest[]).length;
  const occupiedNests = (plates as Plate[]).filter((plate: Plate) => plate.nest_id !== null).length;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearch(searchTerm);
  };

  const handlePlateSelect = (plate: Plate) => {
    setSelectedPlate(plate);
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
      toast({
        title: "Nest created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
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
      toast({
        title: "Nest deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
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
      toast({
        title: "Plate created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
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
      toast({
        title: "Reagent created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error creating reagent:", error);
      throw error;
    }
  };

  return (
    <Box maxW="100%">
      <VStack spacing={4} align="stretch">
        <Card bg={headerBg} shadow="md">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <PageHeader
                title="Inventory"
                subTitle="Manage plates, reagents, and nests across your workcells"
                titleIcon={<Icon as={BsBoxSeam} boxSize={8} color="teal.500" />}
                mainButton={null}
              />

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
                    nests={(nests as Nest[]).filter((n: Nest) => n.tool_id === tool.id)}
                    plates={plates as Plate[]}
                    onCreateNest={handleCreateNest}
                    onDeleteNest={handleDeleteNest}
                    onCreatePlate={handleCreatePlate}
                    onCreateReagent={handleCreateReagent}
                    onNestClick={handleNestSelect}
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
    </Box>
  );
};
