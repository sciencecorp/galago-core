import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  VStack,
  Button,
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from "@chakra-ui/react";
import { Plate, Well, Reagent } from "@/types/api";
import { PlateGrid } from "@/components/ui/PlateGrid";
import { trpc } from "@/utils/trpc";
import { successToast, errorToast, warningToast } from "@/components/ui/Toast";

interface PlateModalProps {
  isOpen: boolean;
  onClose: () => void;
  plate: Plate;
  onCreateReagent: (nestId: number, reagentData: Omit<Reagent, "id" | "well_id">) => void;
}

const PlateModal: React.FC<PlateModalProps> = ({ isOpen, onClose, plate, onCreateReagent }) => {
  const [selectedWells, setSelectedWells] = useState<number[]>([]);
  const [isReagentDrawerOpen, setIsReagentDrawerOpen] = useState(false);

  // Calculate a date one month from today for the default expiration
  const getDefaultExpirationDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().split("T")[0];
  };

  const [reagentData, setReagentData] = useState({
    name: "",
    expiration_date: getDefaultExpirationDate(),
    volume: 0,
  });

  const utils = trpc.useContext();

  const { data: wells = [] } = trpc.inventory.getWells.useQuery(plate.id, {
    enabled: !!plate.id,
  });

  const { data: reagents = [] } = trpc.inventory.getReagents.useQuery(plate.id, {
    enabled: !!plate.id,
  });

  // Mutation for deleting reagents
  const deleteReagentMutation = trpc.inventory.deleteReagent.useMutation({
    onSuccess: () => {
      // Refresh reagents data
      utils.inventory.getReagents.invalidate(plate.id);
    },
    onError: (error: any) => {
      errorToast("Error clearing reagents", error.message);
    },
  });

  const handleWellClick = (wellId: number) => {
    setSelectedWells((prev) =>
      prev.includes(wellId) ? prev.filter((id) => id !== wellId) : [...prev, wellId],
    );
  };

  const handleAddReagents = () => {
    if (selectedWells.length === 0) {
      warningToast("No wells selected", "Please select at least one well to add reagents to.");
      return;
    }
    setIsReagentDrawerOpen(true);
  };

  const handleReagentSubmit = async () => {
    if (!reagentData.name || !reagentData.expiration_date || reagentData.volume <= 0) {
      errorToast("Invalid reagent data", "Please fill in all fields");
      return;
    }

    try {
      // Create reagent for each selected well
      for (const wellId of selectedWells) {
        await onCreateReagent(wellId, reagentData);
      }

      setIsReagentDrawerOpen(false);
      setReagentData({ name: "", expiration_date: getDefaultExpirationDate(), volume: 0 });
      setSelectedWells([]); // Clear selection after successful creation

      successToast(
        "Reagents added successfully",
        "Reagents have been added to the selected wells.",
      );
    } catch (error: any) {
      errorToast("Error adding reagents", error.message);
    }
  };

  const handleClearReagents = async () => {
    if (selectedWells.length === 0) {
      warningToast("No wells selected", "Please select at least one well to clear reagents from.");
      return;
    }

    try {
      // Get reagents for the selected wells
      const wellReagents = (reagents as Reagent[]).filter((r) => selectedWells.includes(r.well_id));

      // Delete each reagent
      for (const reagent of wellReagents) {
        await deleteReagentMutation.mutateAsync(reagent.id);
      }

      // Clear selection after successful deletion
      setSelectedWells([]);

      successToast(
        "Reagents cleared successfully",
        "Reagents have been removed from the selected wells.",
      );
    } catch (error: any) {
      errorToast("Error clearing reagents", error.message);
    }
  };

  const getWellTooltip = (wellId: number): string => {
    const wellReagents = (reagents as Reagent[]).filter((r: Reagent) => r.well_id === wellId);
    if (wellReagents.length === 0) return "Empty";

    return wellReagents
      .map(
        (r: Reagent) =>
          `${r.name} - ${r.volume}µL - Expires: ${new Date(r.expiration_date).toLocaleDateString()}`,
      )
      .join("\n");
  };

  const getWellContent = (wellId: number): React.ReactNode => {
    const well = (wells as Well[]).find((w: Well) => w.id === wellId);
    return well ? `${String.fromCharCode(65 + Number(well.row))}${Number(well.column) + 1}` : "";
  };

  const getModalSize = () => {
    if (plate.plate_type.includes("384") || plate.plate_type.includes("96")) {
      return "4xl"; // Much larger size for 384-well plates
    } else if (plate.plate_type.includes("48")) {
      return "lg"; // Larger size for 48-well plates
    } else if (plate.plate_type.includes("24")) {
      return "lg"; // Larger size for other plates
    } else if (plate.plate_type.includes("6")) {
      return "sm"; // Larger size for other plates
    } else {
      return "md"; // Larger size for other plates
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size={getModalSize()}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Text>{plate.name}</Text>
            <Text fontSize="sm" color="gray.500">
              Type: {plate.plate_type}
            </Text>
            <Text fontSize="sm" color="gray.500">
              Barcode: {plate.barcode}
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex>
              <VStack spacing={4} mr={4} minW="150px">
                <Button
                  onClick={() => setSelectedWells((wells as Well[]).map((w: Well) => w.id))}
                  width="100%">
                  Select All Wells
                </Button>
                <Button onClick={() => setSelectedWells([])} width="100%">
                  Clear Selection
                </Button>
                <Button
                  colorScheme="blue"
                  isDisabled={selectedWells.length === 0}
                  onClick={handleAddReagents}
                  width="100%">
                  Add Reagents
                </Button>
                <Button
                  colorScheme="red"
                  isDisabled={selectedWells.length === 0}
                  onClick={handleClearReagents}
                  width="100%">
                  Clear Reagents
                </Button>
              </VStack>

              <Box flex="1">
                <PlateGrid
                  plateType={plate.plate_type}
                  wells={wells as Well[]}
                  selectedWells={selectedWells}
                  onWellClick={handleWellClick}
                  getWellTooltip={getWellTooltip}
                  getWellContent={getWellContent}
                  wellStyles={{
                    defaultColor: "transparent",
                    selectedColor: "blue.200",
                    hoverColor: "blue.100",
                  }}
                />
              </Box>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Drawer
        isOpen={isReagentDrawerOpen}
        placement="right"
        onClose={() => setIsReagentDrawerOpen(false)}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Add Reagents</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Reagent Name</FormLabel>
                <Input
                  value={reagentData.name}
                  onChange={(e) => setReagentData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Expiration Date</FormLabel>
                <Input
                  type="date"
                  defaultValue={getDefaultExpirationDate()}
                  value={reagentData.expiration_date}
                  onChange={(e) =>
                    setReagentData((prev) => ({ ...prev, expiration_date: e.target.value }))
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Volume (µL)</FormLabel>
                <NumberInput
                  value={reagentData.volume}
                  onChange={(_, value) => setReagentData((prev) => ({ ...prev, volume: value }))}
                  min={0}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              <Button colorScheme="blue" width="100%" onClick={handleReagentSubmit}>
                Add to Selected Wells
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default PlateModal;
