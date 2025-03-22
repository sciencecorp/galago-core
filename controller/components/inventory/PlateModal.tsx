import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  HStack,
  Text,
  useToast,
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
  useColorModeValue,
} from "@chakra-ui/react";
import { Plate, Well, Reagent } from "@/types/api";
import { PlateGrid } from "@/components/ui/PlateGrid";
import { trpc } from "@/utils/trpc";
import { semantic } from "../../themes/colors";
import tokens from "../../themes/tokens";
import { Icon, FormIcons } from "../ui/Icons";

interface PlateModalProps {
  isOpen: boolean;
  onClose: () => void;
  plate: Plate;
  onCreateReagent: (nestId: number, reagentData: Omit<Reagent, "id" | "well_id">) => void;
}

const PlateModal: React.FC<PlateModalProps> = ({ isOpen, onClose, plate, onCreateReagent }) => {
  const [selectedWells, setSelectedWells] = useState<number[]>([]);
  const [isReagentDrawerOpen, setIsReagentDrawerOpen] = useState(false);
  const [reagentData, setReagentData] = useState({
    name: "",
    expiration_date: "",
    volume: 0,
  });

  const toast = useToast();

  const textColor = useColorModeValue(semantic.text.primary.light, semantic.text.primary.dark);
  const textSecondary = useColorModeValue(
    semantic.text.secondary.light,
    semantic.text.secondary.dark,
  );
  const borderColor = useColorModeValue(
    semantic.border.secondary.light,
    semantic.border.secondary.dark,
  );
  const modalBg = useColorModeValue(
    semantic.background.primary.light,
    semantic.background.primary.dark,
  );
  const accentColor = useColorModeValue(semantic.text.accent.light, semantic.text.accent.dark);
  const buttonBg = useColorModeValue(
    semantic.background.secondary.light,
    semantic.background.secondary.dark,
  );
  const buttonHoverBg = useColorModeValue(
    semantic.background.hover.light,
    semantic.background.hover.dark,
  );

  const { data: wells = [] } = trpc.inventory.getWells.useQuery(plate.id, {
    enabled: !!plate.id,
  });

  const { data: reagents = [] } = trpc.inventory.getReagents.useQuery(plate.id, {
    enabled: !!plate.id,
  });

  const handleWellClick = (wellId: number) => {
    setSelectedWells((prev) =>
      prev.includes(wellId) ? prev.filter((id) => id !== wellId) : [...prev, wellId],
    );
  };

  const handleAddReagents = () => {
    if (selectedWells.length === 0) {
      toast({
        title: "No wells selected",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    setIsReagentDrawerOpen(true);
  };

  const handleReagentSubmit = async () => {
    if (!reagentData.name || !reagentData.expiration_date || reagentData.volume <= 0) {
      toast({
        title: "Invalid reagent data",
        description: "Please fill in all fields",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      // Create reagent for each selected well
      for (const wellId of selectedWells) {
        await onCreateReagent(wellId, reagentData);
      }

      setIsReagentDrawerOpen(false);
      setReagentData({ name: "", expiration_date: "", volume: 0 });
      setSelectedWells([]); // Clear selection after successful creation

      toast({
        title: "Reagents added successfully",
        status: "success",
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: "Error adding reagents",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const getWellTooltip = (wellId: number): string => {
    const wellReagents = (reagents as Reagent[]).filter((r: Reagent) => r.well_id === wellId);
    return wellReagents.length > 0 ? wellReagents.map((r: Reagent) => r.name).join(", ") : "Empty";
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
        <ModalContent
          bg={modalBg}
          borderColor={borderColor}
          borderWidth={tokens.borders.widths.thin}
          boxShadow={tokens.shadows.md}>
          <ModalHeader>
            <Text color={textColor}>{plate.name}</Text>
            <Text fontSize={tokens.typography.fontSizes.sm} color={textSecondary}>
              Type: {plate.plate_type}
            </Text>
          </ModalHeader>
          <ModalCloseButton color={textColor} />
          <ModalBody pb={tokens.spacing.md}>
            <Flex>
              <VStack spacing={tokens.spacing.md} mr={tokens.spacing.md} minW="150px">
                <Button
                  onClick={() => setSelectedWells((wells as Well[]).map((w: Well) => w.id))}
                  width="100%"
                  bg={buttonBg}
                  color={textColor}
                  _hover={{ bg: buttonHoverBg }}
                  borderRadius={tokens.borders.radii.md}>
                  Select All Wells
                </Button>
                <Button
                  onClick={() => setSelectedWells([])}
                  width="100%"
                  bg={buttonBg}
                  color={textColor}
                  _hover={{ bg: buttonHoverBg }}
                  borderRadius={tokens.borders.radii.md}>
                  Clear Selection
                </Button>
                <Button
                  bg={accentColor}
                  color="white"
                  _hover={{ bg: `${accentColor}90` }}
                  isDisabled={selectedWells.length === 0}
                  onClick={handleAddReagents}
                  width="100%"
                  borderRadius={tokens.borders.radii.md}>
                  Add Reagents
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
        <DrawerContent
          bg={modalBg}
          borderColor={borderColor}
          borderWidth={tokens.borders.widths.thin}
          boxShadow={tokens.shadows.md}>
          <DrawerCloseButton color={textColor} />
          <DrawerHeader color={textColor}>Add Reagents</DrawerHeader>
          <DrawerBody>
            <VStack spacing={tokens.spacing.md}>
              <FormControl>
                <FormLabel color={textColor}>Reagent Name</FormLabel>
                <Input
                  value={reagentData.name}
                  onChange={(e) => setReagentData((prev) => ({ ...prev, name: e.target.value }))}
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor }}
                />
              </FormControl>
              <FormControl>
                <FormLabel color={textColor}>Expiration Date</FormLabel>
                <Input
                  type="date"
                  value={reagentData.expiration_date}
                  onChange={(e) =>
                    setReagentData((prev) => ({ ...prev, expiration_date: e.target.value }))
                  }
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor }}
                />
              </FormControl>
              <FormControl>
                <FormLabel color={textColor}>Volume (µL)</FormLabel>
                <NumberInput
                  value={reagentData.volume}
                  onChange={(_, value) => setReagentData((prev) => ({ ...prev, volume: value }))}
                  min={0}>
                  <NumberInputField
                    borderColor={borderColor}
                    _focus={{ borderColor: accentColor }}
                  />
                </NumberInput>
              </FormControl>
              <Button
                bg={accentColor}
                color="white"
                _hover={{ bg: `${accentColor}90` }}
                width="100%"
                onClick={handleReagentSubmit}
                borderRadius={tokens.borders.radii.md}>
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
