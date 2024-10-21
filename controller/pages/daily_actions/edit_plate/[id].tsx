import { Box, Input, VStack, Text, Button, Spinner, Alert, Select } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import {
  Plate,
  inventoryApiClient,
  Inventory,
  Well,
  Reagent,
} from "@/server/utils/InventoryClient";
//import PlateVisualizer from "@/components/inventory/PlateVisualizer";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";

export default function Page() {
  const router = useRouter();
  const { id } = router.query;

  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [selectedPlate, setSelectedPlate] = useState<Plate>();
  const [selectedWells, setSelectedWells] = useState<Well[]>([]);
  const [selectedReagents, setSelectedReagents] = useState<Reagent[]>([]);
  const [refreshFlag, setRefreshFlag] = useState<boolean>(false);

  const workcellStuff = trpc.tool.getWorkcellName.useQuery();
  const workcellName = workcellStuff.data;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!workcellName) {
          return;
        }
        if (String(id).length != 12) {
          throw new Error("Invalid plate barcode");
        }
        const inventoryData = await inventoryApiClient.getInventory(workcellName);
        setInventory(inventoryData);

        const plate = inventoryData.plates.filter((plate) => plate.barcode === String(id))[0];
        setSelectedPlate(plate);

        const plate_wells = inventoryData.wells.filter((well) => well.plate_id === plate.id) || [];
        setSelectedWells(plate_wells);

        const well_ids: number[] = plate_wells.map((well) => well.id) || [];
        setSelectedReagents(
          inventoryData.reagents.filter((reagent) => well_ids.includes(reagent.well_id)) || []
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [workcellName, id, refreshFlag]);

  if (workcellStuff.isLoading) {
    return <Spinner size="lg" />;
  }

  if (workcellStuff.isError || !workcellStuff) {
    return <Alert status="error">Could not load workcell info</Alert>;
  }

  return (
    <Box p={12} maxWidth="1800px" margin="auto">
      <VStack>
        <Box>
          <Text fontSize="xl" fontWeight="normal">
            {selectedPlate?.name}
          </Text>
        </Box>
        <Box>Edit Plate</Box>
        {/* {selectedPlate && (
          // <PlateVisualizer
          //   plate={selectedPlate}
          //   wells={selectedWells}
          //   reagents={selectedReagents}
          //   refreshOnChange={() => setRefreshFlag(!refreshFlag)}></PlateVisualizer>
        )} */}
      </VStack>
    </Box>
  );
}
