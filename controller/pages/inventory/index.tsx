import React, { useEffect, useState } from "react";
import { Box, useDisclosure, HStack, VStack } from "@chakra-ui/react";
import { useColorMode } from "@chakra-ui/react";
import { Inventory, Plate, Nest, Reagent } from"@/types/api";
import { trpc } from "@/utils/trpc";
import { PageHeader } from "@/components/UI/PageHeader";
import InventoryVisualizer from "@/components/inventory/InventoryVisualizer";
import InventorySearch from "@/components/inventory/InventorySearch";
import InventoryActions from "@/components/inventory/InventoryActions";
import AlertComponent from "@/components/UI/AlertComponent";
import LoadingProgress from "@/components/UI/LoadingProgress";
import CheckInModal from "@/components/inventory/CheckInModal";
import CheckOutModal from "@/components/inventory/CheckOutModal";
import MovePlateModal from "@/components/inventory/MovePlateModal";
import Fuse from "fuse.js";
import { PlatesTable } from "@/components/inventory/PlatesTable";

export default function Page() {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === "dark";
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [mode, setMode] = useState<"checkin" | "checkout" | "move" | "delete" | "create" | "">("");
  const [selectedPlate, setSelectedPlate] = useState<Plate | null>(null);
  const [selectedNest, setSelectedNest] = useState<string | null>(null);

  // Modal controls
  const checkInModal = useDisclosure();
  const checkOutModal = useDisclosure();
  const movePlateModal = useDisclosure();

  // Alert state
  const [showAlert, setShowAlert] = useState(false);
  const [alertStatus, setAlertStatus] = useState<"error" | "success" | "info" | "warning">(
    "success",
  );
  const [alertDescription, setAlertDescription] = useState("");

  // Search state
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<(Plate | Reagent)[]>([]);

  // TRPC queries
  const workcellData = trpc.workcell.getAll.useQuery().data?.[0];
  const workcellName = workcellData?.name;
  const utils = trpc.useContext();

  // Fetch inventory data using TRPC
  const { data: inventoryData, refetch: refetchInventory } = trpc.inventory.getPlates.useQuery(
    workcellName || "",
    {
      enabled: !!workcellName,
      onSuccess: (data: Inventory) => {
        setInventory(data);
      },
    },
  );

  // TRPC mutations
  const createPlateMutation = trpc.inventory.createPlate.useMutation({
    onSuccess: () => {
      utils.inventory.getPlates.invalidate();
    },
  });

  const updatePlateMutation = trpc.inventory.updatePlate.useMutation({
    onSuccess: () => {
      utils.inventory.getPlates.invalidate();
    },
  });

  // Alert handlers
  const showSuccessAlert = (message: string) => {
    setAlertStatus("success");
    setAlertDescription(message);
    setShowAlert(true);
  };

  const showErrorAlert = (message: string) => {
    setAlertStatus("error");
    setAlertDescription(message);
    setShowAlert(true);
  };

  // Plate action handlers
  const handleCheckIn = async (nestId: number) => {
    if (!selectedPlate) return;

    setLoading(true);
    try {
      await createPlateMutation.mutateAsync({
        name: selectedPlate.name,
        plate_type: selectedPlate.plate_type,
        barcode: selectedPlate.barcode,
        nest_id: nestId,
      });

      showSuccessAlert(`Successfully checked in plate ${selectedPlate.name}`);
      checkInModal.onClose();
      handleModalClose();
    } catch (error) {
      showErrorAlert(
        `Failed to check in plate: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!selectedPlate) return;

    setLoading(true);
    try {
      await updatePlateMutation.mutateAsync({
        id: selectedPlate.id,
        name: selectedPlate.name,
        barcode: selectedPlate.barcode,
        plate_type: selectedPlate.plate_type,
        nest_id: null,
      });

      showSuccessAlert(`Successfully checked out plate ${selectedPlate.name}`);
      checkOutModal.onClose();
      handleModalClose();
    } catch (error) {
      showErrorAlert(
        `Failed to check out plate: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async (newNestId: number) => {
    if (!selectedPlate) return;

    setLoading(true);
    try {
      await updatePlateMutation.mutateAsync({
        ...selectedPlate,
        nest_id: newNestId,
      });

      showSuccessAlert(`Successfully moved plate ${selectedPlate.name}`);
      movePlateModal.onClose();
      handleModalClose();
    } catch (error) {
      showErrorAlert(
        `Failed to move plate: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  // Search functionality
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    setSearch(searchTerm);

    if (!searchTerm) {
      setSearchResults([]);
      return;
    }

    if (!inventory) return;

    const fuseOptions = {
      keys: ["name", "barcode", "plate_type"],
      threshold: 0.3,
    };
    console.log("Inventory plates:", inventory.plates);
    const platesFuse = new Fuse(inventory.plates, fuseOptions);
    const reagentsFuse = new Fuse(inventory.reagents, {
      keys: ["name", "expiration_date"],
      threshold: 0.3,
    });

    const plateResults = platesFuse.search(searchTerm).map((result) => result.item);
    const reagentResults = reagentsFuse.search(searchTerm).map((result) => result.item);

    setSearchResults([...plateResults, ...reagentResults]);
  };

  // Effect to refresh inventory data periodically
  useEffect(() => {
    const intervalId = setInterval(() => {
      refetchInventory();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId);
  }, [refetchInventory]);

  // Handle mode changes
  useEffect(() => {
    if (mode === "checkin") checkInModal.onOpen();
    if (mode === "checkout") checkOutModal.onOpen();
    if (mode === "move") movePlateModal.onOpen();
  }, [mode]);

  // Handle modal closes
  const handleModalClose = () => {
    setMode("");
    setSelectedPlate(null);
  };

  const handleReagentResultClick = (reagent: Reagent) => {
    // Add your reagent selection logic here
    console.log("Selected reagent:", reagent);
  };

  return (
    <Box flex={1}>
      <PageHeader title="Inventory" mainButton={null} />

      <VStack align="stretch" spacing={6} width="100%">
        {/* Search Bar */}
        <Box>
          <InventorySearch
            search={search}
            searchResults={searchResults}
            isDarkMode={isDarkMode}
            onSearchChange={handleSearch}
            onClearSearch={() => {
              setSearch("");
              setSearchResults([]);
            }}
            onPlateSelect={setSelectedPlate}
            onReagentSelect={handleReagentResultClick}
          />
        </Box>

        {/* Main Content Area */}
        <HStack align="start" spacing={8}>
          {/* Left Side - Actions */}
          <Box width="200px">
            <InventoryActions 
              mode={mode} 
              setMode={setMode} 
              isLoading={loading} 
            />
          </Box>

          {/* Right Side - Main Content */}
          <VStack flex={1} align="stretch" spacing={6}>
            {/* Plates Table */}
            {inventory && (
              <PlatesTable
                plates={inventory.plates}
                onUpdate={async (plate) => {
                  try {
                    await updatePlateMutation.mutateAsync(plate);
                    showSuccessAlert(`Successfully updated plate ${plate.name}`);
                  } catch (error) {
                    showErrorAlert(
                      `Failed to update plate: ${error instanceof Error ? error.message : "Unknown error"}`,
                    );
                  }
                }}
                onDelete={async (plate) => {
                  console.log("Delete plate:", plate);
                }}
              />
            )}

            {/* Inventory Visualizer */}
            {inventory && (
              <Box borderWidth="0px" borderRadius="lg" p={4}>
                <InventoryVisualizer
                  inventory={inventory}
                  onSelectedNestChange={(nest: Nest | null) =>
                    setSelectedNest(nest?.id?.toString() || null)
                  }
                  onSelectedPlateChange={setSelectedPlate}
                />
              </Box>
            )}
          </VStack>
        </HStack>
      </VStack>

      {/* Modals */}
      <CheckInModal
        isOpen={checkInModal.isOpen}
        onClose={() => {
          checkInModal.onClose();
          handleModalClose();
        }}
        availableNests={inventory?.nests || []}
        selectedPlate={selectedPlate}
        onSubmit={handleCheckIn}
      />

      <CheckOutModal
        isOpen={checkOutModal.isOpen}
        onClose={() => {
          checkOutModal.onClose();
          handleModalClose();
        }}
        selectedPlate={selectedPlate}
        onSubmit={handleCheckOut}
      />

      <MovePlateModal
        isOpen={movePlateModal.isOpen}
        onClose={() => {
          movePlateModal.onClose();
          handleModalClose();
        }}
        availableNests={inventory?.nests || []}
        selectedPlate={selectedPlate}
        onSubmit={handleMove}
      />

      {/* Alerts and Loading */}
      <AlertComponent
        showAlert={showAlert}
        status={alertStatus}
        title={alertStatus.charAt(0).toUpperCase() + alertStatus.slice(1)}
        description={alertDescription}
        onClose={() => setShowAlert(false)}
      />

      <LoadingProgress isLoading={loading} />
    </Box>
  );
}
