import { ConsumableRequirementMapType, helixClient, Routine } from "@/server/utils/HelixClient";
import { Inventory, inventoryApiClient, Reagent } from "@/server/utils/InventoryClient";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  CloseButton,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { trpc } from "@/utils/trpc";
import RoutineTable from "@/components/daily_actions/RoutineTable";


export interface missingConsumablesType {
  missingReagents: ConsumableRequirementMapType;
  missingTips: ConsumableRequirementMapType;
}

export default function Page() {
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertStatus, setAlertStatus] = useState<
    "error" | "info" | "warning" | "success" | "loading"
  >("success");
  const [alertDescription, setAlertDescription] = useState<string>("");

  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [tipRequirements, setTipRequirements] = useState<ConsumableRequirementMapType>({});
  const [reagentRequirements, setReagentRequirements] = useState<ConsumableRequirementMapType>({});
  const [missingConsumables, setMissingConsumables] = useState<missingConsumablesType>({
    missingReagents: {},
    missingTips: {},
  });
  const [mediaTypes, setMediaTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const workcellData = trpc.tool.getWorkcellName.useQuery();
  const workcellName = workcellData.data;

  const launchAlert = (
    status: "error" | "info" | "warning" | "success" | "loading",
    description: string
  ) => {
    setAlertStatus(status);
    setAlertDescription(description);
    setShowAlert(true);
  };

  function calculateMissingConsumables(
    reagentRequirements: ConsumableRequirementMapType,
    tipRequirements: ConsumableRequirementMapType,
    reagents: Reagent[]
  ): missingConsumablesType {
    const inventoryCounts: ConsumableRequirementMapType = {};
    const missingReagents: ConsumableRequirementMapType = {};
    const missingTips: ConsumableRequirementMapType = {};
    for (const reagent of reagents) {
      if (inventoryCounts[reagent.name]) {
        inventoryCounts[reagent.name] += reagent.volume;
      } else {
        inventoryCounts[reagent.name] = reagent.volume;
      }
    }
    for (const reagentRequirement in reagentRequirements) {
      if (
        !inventoryCounts[reagentRequirement] ||
        inventoryCounts[reagentRequirement] <= reagentRequirements[reagentRequirement]
      ) {
        missingReagents[reagentRequirement] =
          reagentRequirements[reagentRequirement] - (inventoryCounts[reagentRequirement] || 0);
      }
    }
    for (const tipRequirement in tipRequirements) {
      if (
        !inventoryCounts["1000 ul tip"] ||
        inventoryCounts["1000 ul tip"] <= tipRequirements[tipRequirement]
      ) {
        missingTips[tipRequirement] =
          tipRequirements[tipRequirement] - (inventoryCounts["1000 ul tip"] || 0);
      }
    }
    return { missingReagents: missingReagents, missingTips: missingTips };
  }

  const fetchData = async () => {
    try {
      if (workcellName === undefined) {
        return;
      }
      // Query Inventory

      const inventoryData = await inventoryApiClient.getInventory(workcellName);
      setInventory(inventoryData);
      console.log("Inventory data is"+inventoryData);


      // Query Helix
      const routines = await helixClient.getRoutines(workcellName);
      setRoutines(routines);

      // Calculate consumable requirements
      const consumableRequirements = helixClient.checkConsumableRequirements(routines);
      const tipRequirements = consumableRequirements.tiprackRequirements;
      setTipRequirements(tipRequirements);
      const reagentRequirements = consumableRequirements.consumableRequirements;
      setReagentRequirements(reagentRequirements);

      // Calculate missing consumables
      const missingConsumables = calculateMissingConsumables(
        reagentRequirements,
        tipRequirements,
        inventoryData.reagents
      );
      setMissingConsumables(missingConsumables);

      // Make list of all reagent types for visualization
      const mediaTypes = Array.from(
        new Set([
          ...Object.keys(tipRequirements),
          ...Object.keys(reagentRequirements),
          ...Object.keys(missingConsumables.missingReagents),
          ...Object.keys(missingConsumables.missingTips),
        ])
      );
      setMediaTypes(mediaTypes);

      setIsLoading(false);
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };


  useEffect(() => {
    fetchData();
  }, [workcellName]);



return(
    <VStack spacing={4} align="stretch">
      {showAlert && (
        <Alert status={alertStatus}>
          <AlertIcon />
          <AlertTitle mr={2}>
            {alertStatus.charAt(0).toUpperCase() + alertStatus.slice(1)}!
          </AlertTitle>
          <AlertDescription>{alertDescription}</AlertDescription>
          <CloseButton
            position="absolute"
            right="8px"
            top="8px"
            onClick={() => setShowAlert(false)}
          />
        </Alert>
      )}
      <Text fontSize="xl" fontWeight="bold" textAlign="left">
        1. Consumable Requirements
      </Text>
      {isLoading && (
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <Spinner size="xl" />
        </Box>
      )}
      {!isLoading && (
        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>Media Type</Th>
              <Th>Reagent Requirement (mL)</Th>
              <Th>Tip Requirement</Th>
              <Th>Missing Reagents (mL)</Th>
              <Th>Missing Tips</Th>
            </Tr>
          </Thead>
          <Tbody>
            {mediaTypes.map((media) => (
              <Tr key={media}>
                <Td>{media}</Td>
                <Td>{reagentRequirements[media] / 1000 || "❓"}</Td>
                <Td>{tipRequirements[media] || "❓"}</Td>
                <Td>{missingConsumables.missingReagents[media] / 1000 || "✅"}</Td>
                <Td>{missingConsumables.missingTips[media] || "✅"}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      <Text fontSize="xl" fontWeight="bold" textAlign="left">
        2. Pre-warm media plates
      </Text>
      {isLoading && (
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <Spinner size="xl" />
        </Box>
      )}
      {!isLoading && <Text>Make sure reagents are in hotel prior to scheduling workflows</Text>}
      <Text fontSize="xl" fontWeight="bold" textAlign="left">
        3. Schedule workflows
      </Text>
      {isLoading && (
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <Spinner size="xl" />
        </Box>
      )}
      {!isLoading && inventory != null && workcellName && (
        <RoutineTable
          workcellName={workcellName}
          routines={routines}
          real_inventory={inventory}
          onAlert={(status, description) => launchAlert(status, description)}
        />
      )}
    </VStack>
  );
}
