import React from "react";
import { VStack, Text, Button, Spinner } from "@chakra-ui/react";

type IncubatorActionsProps = {
  mode: "checkin" | "checkout" | "create" | "move" | "delete" | "";
  setMode: (mode: "checkin" | "checkout" | "create" | "move" | "delete" | "") => void;
  isLoading: boolean;
};

const IncubatorActions: React.FC<IncubatorActionsProps> = ({ mode, setMode, isLoading }) => {
  return (
    <VStack align="center" spacing="4">
      <Text fontSize="xl">Incubator</Text>
      <Button
        colorScheme="gray"
        variant={mode === "checkin" ? "solid" : "outline"}
        width="100%"
        onClick={() => setMode("checkin")}>
        Load Plate
      </Button>
      <Button
        colorScheme="gray"
        variant={mode === "checkout" ? "solid" : "outline"}
        width="100%"
        onClick={() => setMode("checkout")}>
        Unload Plate
      </Button>
      {isLoading && <Spinner ml={2} />}
      <Button
        colorScheme="gray"
        variant={mode === "create" ? "solid" : "outline"}
        width="100%"
        onClick={() => setMode("create")}>
        Add Plate
      </Button>
      <Button
        colorScheme="gray"
        variant={mode === "delete" ? "solid" : "outline"}
        width="100%"
        onClick={() => setMode("delete")}>
        Remove Plate
      </Button>
    </VStack>
  );
};

export default IncubatorActions;
