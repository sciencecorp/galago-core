import React, { useState, useEffect } from "react";
import { Box, VStack, useToast } from "@chakra-ui/react";
import { Inventory, Plate, Reagent, Nest } from "@/types/api";
import { PageHeader } from "@/components/UI/PageHeader";
import InventorySearch from "./InventorySearch";
import { InventoryToolCard } from "./InventoryToolCard";
import { SimpleGrid } from "@chakra-ui/react";
import AlertComponent from "@/components/UI/AlertComponent";
import { useColorMode } from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { Tool } from "@/types/api";
export const InventoryManager: React.FC = () => {
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<(Plate | Reagent)[]>([]);
  const [mode, setMode] = useState<"checkin" | "checkout" | "create" | "move" | "delete" | "">("");
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
    (workcell) => workcell.name === SelectedWorkcellName.data
  );
  const workcellTools = selectedWorkcell?.tools;
  const { data: nests, isLoading: nestsLoading, refetch: refetchNests } = trpc.inventory.getNests.useQuery(
    SelectedWorkcellName.data ?? ""
  );
  console.log("Nests", nests)
  const { data: plates, isLoading: platesLoading, refetch: refetchPlates } = trpc.inventory.getPlates.useQuery(
    selectedWorkcell?.name || "",
    {
      enabled: !!selectedWorkcell?.id,
    }
  );
  const { data: reagents, isLoading: reagentsLoading, refetch: refetchReagents } = trpc.inventory.getReagents.useQuery(
    selectedWorkcell?.id ?? 0
  );
  
  const createNestMutation = trpc.inventory.createNest.useMutation({
    onSuccess: () => {
      toast({
        title: "Nest created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating nest",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const deleteNestMutation = trpc.inventory.deleteNest.useMutation({
    onSuccess: () => {
      toast({
        title: "Nest deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting nest",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const createPlateMutation = trpc.inventory.createPlate.useMutation({
    onSuccess: () => {
      toast({
        title: "Plate created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const createReagentMutation = trpc.inventory.createReagent.useMutation({
    onSuccess: () => {
      toast({
        title: "Reagent created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
  });

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

  const handleCreateNest = async (instrumentId: string, nestName: string, nestRow: number, nestColumn: number) => {
    try {
      await createNestMutation.mutateAsync({
        name: nestName,
        row: nestRow,
        column: nestColumn,
        tool_id: 1,
      });
      refetchNests();
    } catch (error) {
      console.error("Error creating nest:", error);
    }
  };

  const handleDeleteNest = async (nestId: number) => {
    console.log("Deleting nest:", nestId);
    try {
      await deleteNestMutation.mutateAsync(nestId);
      refetchNests();
    } catch (error) {
      console.error("Error deleting nest:", error);
    }
  };

  const handleCreatePlate = async (nestId: number) => {
    console.log("Creating plate for nest:", nestId);
    try {
      await createPlateMutation.mutateAsync({ name: null, barcode: "", plate_type: "", nest_id: nestId });
      refetchPlates();
    } catch (error) {
      console.error("Error creating plate:", error);
    }
  };

  const handleCreateReagent = async (nestId: number) => {
    console.log("Creating reagent for nest:", nestId);
    try {
      await createReagentMutation.mutateAsync({ name: "", expiration_date: "", volume: 0, well_id: nestId });
      refetchReagents();
    } catch (error) {
      console.error("Error creating reagent:", error);
    }
  };

  const { data: wells } = trpc.inventory.getWells.useQuery(
    (plates && Array.isArray(plates) && plates[0]?.id) ?? 0
  );

  return (
    <Box flex={1}>
      <PageHeader title="Inventory" mainButton={null} />
      <VStack spacing={6} align="stretch" p={4}>
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

        <SimpleGrid columns={[1, 2, 3]} spacing={6}>
        {workcellTools?.map((instrument) => (
            <InventoryToolCard
                key={instrument.name}
                tool={{
                ...instrument,
                id: instrument.name
                } as Tool}
                nests={Array.isArray(nests) ? nests : []}
                plates={Array.isArray(plates) ? plates : []}
                wells={Array.isArray(wells) ? wells : []}
                reagents={Array.isArray(reagents) ? reagents : []}
                onCreateNest={handleCreateNest}
                onCreatePlate={handleCreatePlate}
                onCreateReagent={handleCreateReagent}
                onNestClick={handleNestSelect}
                onDeleteNest={handleDeleteNest}
            />
            ))}
        </SimpleGrid>
      </VStack>

      <AlertComponent
        showAlert={showAlert}
        status={alertStatus}
        title={alertStatus.charAt(0).toUpperCase() + alertStatus.slice(1)}
        description={alertDescription}
        onClose={() => setShowAlert(false)}
      />
    </Box>
  );
};