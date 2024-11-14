import React from "react";
import { VStack, Text, Button, Spinner } from "@chakra-ui/react";

type InventoryActionsProps = {
  mode: "checkin" | "checkout" | "create" | "move" | "delete";
  setMode: (mode: "checkin" | "checkout" | "create" | "move" | "delete") => void;
  isLoading: boolean;
};

const InventoryActions: React.FC<InventoryActionsProps> = ({ mode, setMode, isLoading }) => {
  return (
    <VStack align="center" spacing="4">
      <Text fontSize="xl">Plates</Text>
      <Button
        colorScheme="gray"
        variant={mode === "checkin" ? "solid" : "outline"}
        width="100%"
        onClick={() => setMode("checkin")}>
        Check In Plate
      </Button>
      <Button
        colorScheme="gray"
        variant={mode === "checkout" ? "solid" : "outline"}
        width="100%"
        onClick={() => setMode("checkout")}>
        Check Out Plate
      </Button>
      <Button
        colorScheme="gray"
        variant={mode === "move" ? "solid" : "outline"}
        width="100%"
        onClick={() => setMode("move")}>
        Move Plate
      </Button>
      {isLoading && <Spinner ml={2} />}
      <Button
        colorScheme="gray"
        variant={mode === "create" ? "solid" : "outline"}
        width="100%"
        onClick={() => setMode("create")}>
        Create Plate
      </Button>
      <Button
        colorScheme="gray"
        variant={mode === "delete" ? "solid" : "outline"}
        width="100%"
        onClick={() => setMode("delete")}>
        Delete Plate
      </Button>
    </VStack>
  );
};

export default InventoryActions;