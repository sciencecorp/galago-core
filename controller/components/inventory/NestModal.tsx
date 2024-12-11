import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Grid,
  Box,
  Button,
  Flex,
  IconButton,
  Text,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  VStack,
  HStack,
  FormLabel,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Input,
  Select,
} from "@chakra-ui/react";
import { Nest, Plate, Well, Reagent } from "@/types/api";
import { HamburgerIcon, AddIcon, CloseIcon } from "@chakra-ui/icons";
import PlateModal from "./PlateModal";
import { WellPlateIcon } from "../UI/Icons";

interface NestModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolName: string;
  nests: Nest[];
  plates: Plate[];
  onCreatePlate: (
    nestId: number,
    plateData: {
      name: string;
      plateType: string;
      barcode: string;
    },
  ) => void;
  onCreateReagent: (nestId: number, reagentData: Omit<Reagent, "id" | "well_id">) => void;
  onNestClick: (nest: Nest) => void;
  onCreateNest: (row: number, column: number) => Promise<void>;
  onDeleteNest: (nestId: number) => Promise<void>;
}

interface PlateFormData {
  name: string;
  plateType: string;
  barcode: string;
}

const NestModal: React.FC<NestModalProps> = ({
  isOpen,
  onClose,
  toolName,
  nests,
  plates,
  onCreatePlate,
  onCreateReagent,
  onDeleteNest,
  onNestClick,
  onCreateNest,
}) => {
  const [addingNests, setAddingNests] = useState(false);
  const [deletingNests, setDeletingNests] = useState(false);
  const [dimensions, setDimensions] = useState({ rows: 0, cols: 0 });
  const toast = useToast();
  const [selectedNestId, setSelectedNestId] = useState<number | null>(null);
  const [plateFormData, setPlateFormData] = useState<PlateFormData>({
    name: "",
    plateType: "",
    barcode: "",
  });
  const [selectedPlate, setSelectedPlate] = useState<Plate | null>(null);
  const [isPlateModalOpen, setIsPlateModalOpen] = useState(false);

  const maxRows = Math.max(...nests.map((nest) => nest.row), 1);
  const maxColumns = Math.max(...nests.map((nest) => nest.column), 1);

  // Updated modal size calculation
  const getModalSize = () => {
    // Calculate grid width (80px per nest + gaps)
    const gridWidth = maxColumns * 80 + (maxColumns - 1) * 4;
    // Add padding for the modal content
    const totalWidth = gridWidth + 48; // 24px padding on each side

    // Modal sizes in pixels
    const sizes = {
      xs: 350,
      sm: 450,
      md: 550,
      lg: 650,
      xl: 750,
      "2xl": 850,
      "3xl": 950,
      "4xl": 1050,
      full: "100%",
    };
    // Find the smallest size that can fit the grid
    if (totalWidth <= sizes.xs) return "sm";
    if (totalWidth <= sizes.sm) return "md";
    if (totalWidth <= sizes.md) return "lg";
    if (totalWidth <= sizes.lg) return "xl";
    if (totalWidth <= sizes.xl) return "2xl";
    if (totalWidth <= sizes["2xl"]) return "3xl";
    if (totalWidth <= sizes["3xl"]) return "4xl";
    if (totalWidth <= sizes["4xl"]) return "full";
    return "full";
  };

  const modalSize = getModalSize();

  // Function to determine potential nest locations based on existing nests
  const getPotentialNests = () => {
    const potentialNests = new Set<string>();
    nests.forEach((n) => {
      const directions = [
        { row: n.row - 1, col: n.column }, // Above
        { row: n.row, col: n.column - 1 }, // Left
        { row: n.row + 1, col: n.column }, // Below
        { row: n.row, col: n.column + 1 }, // Right
        { row: n.row - 1, col: n.column - 1 }, // Top-left
        { row: n.row - 1, col: n.column + 1 }, // Top-right
        { row: n.row + 1, col: n.column - 1 }, // Bottom-left
        { row: n.row + 1, col: n.column + 1 }, // Bottom-right
      ];
      directions.forEach((dir) => {
        // Check if the position is valid (not zero or negative)
        if (
          dir.row > 0 &&
          dir.col > 0 &&
          !nests.some(
            (existingNest) => existingNest.row === dir.row && existingNest.column === dir.col,
          )
        ) {
          potentialNests.add(`${dir.row},${dir.col}`); // Add potential nest location
        }
      });
    });
    return Array.from(potentialNests).map((pos) => {
      const [row, col] = pos.split(",").map(Number);
      return { row, col };
    });
  };

  // In the render method, use getPotentialNests to determine potential nests
  const potentialNests = getPotentialNests();

  // Function to handle dimension changes
  const handleDimensionChange = async (type: "rows" | "cols", value: number) => {
    const newValue = Math.max(1, Math.floor(value)); // Ensure value is at least 1 and an integer

    if (isNaN(newValue)) return; // Guard against invalid input

    setDimensions((prev) => ({ ...prev, [type]: newValue }));

    try {
      if (type === "rows") {
        if (newValue < maxRows) {
          // Delete nests in rows that are being removed
          const nestsToDelete = nests.filter((nest) => nest.row > newValue);
          for (const nest of nestsToDelete) {
            await onDeleteNest(nest.id);
          }
        } else if (newValue > maxRows) {
          // Add new nests in the new rows
          for (let row = maxRows + 1; row <= newValue; row++) {
            for (let col = 1; col <= maxColumns; col++) {
              // Check if nest already exists at this position
              const existingNest = nests.find((n) => n.row === row && n.column === col);
              if (!existingNest) {
                await onCreateNest(row, col);
              }
            }
          }
        }
      } else {
        if (newValue < maxColumns) {
          // Delete nests in columns that are being removed
          const nestsToDelete = nests.filter((nest) => nest.column > newValue);
          for (const nest of nestsToDelete) {
            await onDeleteNest(nest.id);
          }
        } else if (newValue > maxColumns) {
          // Add new nests in the new columns
          for (let row = 1; row <= maxRows; row++) {
            for (let col = maxColumns + 1; col <= newValue; col++) {
              // Check if nest already exists at this position
              const existingNest = nests.find((n) => n.row === row && n.column === col);
              if (!existingNest) {
                await onCreateNest(row, col);
              }
            }
          }
        }
      }

      // Create initial nest at (1,1) if no nests exist
      if (nests.length === 0) {
        await onCreateNest(1, 1);
      }
    } catch (error) {
      console.error("Error updating dimensions:", error);
      toast({
        title: "Error updating dimensions",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Update dimensions state when nests change
  useEffect(() => {
    if (nests.length > 0) {
      setDimensions({
        rows: maxRows,
        cols: maxColumns,
      });
    }
  }, [maxRows, maxColumns, nests.length]);
  const handleCreatePlate = async (nestId: number) => {
    if (!plateFormData.name || !plateFormData.plateType) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await onCreatePlate(nestId, plateFormData);

      // Reset form
      setPlateFormData({ name: "", plateType: "", barcode: "" });
      setSelectedNestId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create plate",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  const renderPlateButton = (nest: Nest) => {
    // Check if the nest has a plate
    const hasPlate = plates.some((plate) => plate.nest_id === nest.id);

    // If the nest already has a plate, don't render the Add Plate button
    if (hasPlate) {
      return null;
    }

    return (
      <Popover isOpen={selectedNestId === nest.id} onClose={() => setSelectedNestId(null)}>
        <PopoverTrigger>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedNestId(nest.id);
            }}
            size="sm">
            <AddIcon mr={2} /> Plate
          </Button>
        </PopoverTrigger>
        <PopoverContent p={2}>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverBody>
            <VStack spacing={3}>
              <Input
                placeholder="Plate Name"
                value={plateFormData.name}
                onChange={(e) =>
                  setPlateFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
              <Select
                placeholder="Select Plate Type"
                value={plateFormData.plateType}
                onChange={(e) =>
                  setPlateFormData((prev) => ({
                    ...prev,
                    plateType: e.target.value,
                  }))
                }>
                <option value="6 well">6 Well</option>
                <option value="24 well">24 Well</option>
                <option value="96 well">96 Well</option>
                <option value="384 well">384 Well</option>
              </Select>
              <Button colorScheme="blue" width="100%" onClick={() => handleCreatePlate(nest.id)}>
                Create Plate
              </Button>
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    );
  };

  // Modify the existing nest click handler
  const handleNestClick = (nest: Nest) => {
    const plate = plates.find((p) => p.nest_id === nest.id);
    if (plate) {
      setSelectedPlate(plate);
      setIsPlateModalOpen(true);
    } else {
      onNestClick(nest);
    }
  };

  const getPlateRows = (plateType: string): number => {
    if (plateType.includes("384")) return 16;
    if (plateType.includes("96")) return 8;
    if (plateType.includes("24")) return 4;
    if (plateType.includes("6")) return 2;
    return 8; // default to 96-well plate dimensions
  };

  const getPlateColumns = (plateType: string): number => {
    if (plateType.includes("384")) return 24;
    if (plateType.includes("96")) return 12;
    if (plateType.includes("24")) return 6;
    if (plateType.includes("6")) return 3;
    return 12; // default to 96-well plate dimensions
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size={modalSize} scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent maxW={modalSize === "full" ? "95vw" : undefined}>
          <ModalHeader>
            <Flex justifyContent="space-between" alignItems="center">
              <Text>{toolName}</Text>
              <Menu>
                <MenuButton as={IconButton} icon={<HamburgerIcon />} aria-label="Edit Inventory" />
                <MenuList>
                  <MenuItem
                    onClick={() => {
                      setAddingNests((prev) => !prev);
                      setDeletingNests(false); // Ensure deleting is off when toggling adding
                    }}>
                    {addingNests ? "Stop Adding Nests" : "Add Nests"}
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setDeletingNests((prev) => !prev);
                      setAddingNests(false); // Ensure adding is off when toggling deleting
                    }}>
                    {deletingNests ? "Stop Deleting Nests" : "Delete Nests"}
                  </MenuItem>
                </MenuList>
              </Menu>
            </Flex>
          </ModalHeader>
          <ModalBody maxHeight="70vh" overflowY="auto">
            {addingNests && (
              <VStack spacing={2} align="left" mb={4}>
                <HStack spacing={2} justify="start" minW="400px">
                  <FormLabel htmlFor="rows" mb="0" minWidth="50px" flexShrink={0}>
                    Rows:
                  </FormLabel>
                  <NumberInput
                    id="rows"
                    min={1}
                    value={dimensions.rows}
                    onChange={(valueString) => handleDimensionChange("rows", parseInt(valueString))}
                    size="sm"
                    width="70px"
                    flexShrink={0}>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormLabel htmlFor="cols" mb="0" minWidth="50px" flexShrink={0}>
                    Cols:
                  </FormLabel>
                  <NumberInput
                    id="cols"
                    min={1}
                    value={dimensions.cols}
                    onChange={(valueString) => handleDimensionChange("cols", parseInt(valueString))}
                    size="sm"
                    width="70px"
                    flexShrink={0}>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </HStack>
              </VStack>
            )}

            <Grid
              templateColumns={`repeat(${maxColumns}, 60px)`}
              templateRows={`repeat(${maxRows}, 50px)`}
              gap={1}
              justifyContent="center">
              {Array.from({ length: maxRows }, (_, rowIndex) =>
                Array.from({ length: maxColumns }, (_, colIndex) => {
                  const nest = nests.find(
                    (n) => n.row === rowIndex + 1 && n.column === colIndex + 1,
                  );
                  const hasPlate = plates.some(
                    (plate) => plate.nest_id === (nest ? nest.id : null),
                  );
                  const nestColor = hasPlate ? "blue.700" : "gray.400";
                  const isGhostNest = !nest;
                  // Check if this position is a potential nest
                  const isPotentialNest = potentialNests.some(
                    (p) => p.row === rowIndex + 1 && p.col === colIndex + 1,
                  );

                  if (addingNests && isGhostNest && !isPotentialNest) {
                    return null;
                  }

                  return (
                    <Box
                      key={`nest-${rowIndex}-${colIndex}`}
                      gridColumn={colIndex + 1}
                      gridRow={rowIndex + 1}
                      p={2}
                      borderWidth="1px"
                      borderRadius="md"
                      cursor="pointer"
                      onClick={() => {
                        if (deletingNests && nest) {
                          onDeleteNest(nest.id);
                        } else if (addingNests && isPotentialNest) {
                          onCreateNest(rowIndex + 1, colIndex + 1);
                        } else {
                          nest && handleNestClick(nest);
                        }
                      }}
                      bg={
                        deletingNests && nest ? "red.500" : isGhostNest ? "transparent" : nestColor
                      }
                      borderColor={
                        deletingNests && nest ? "red.500" : isGhostNest ? "blue.300" : nestColor
                      }
                      borderStyle={isGhostNest ? "dashed" : "solid"}
                      height="50px"
                      maxHeight="50px"
                      minHeight="50px"
                      maxWidth="60px"
                      minWidth="60px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center">
                      {deletingNests ? (
                        nest ? (
                          <Text color="white" fontSize="xl">
                            X
                          </Text>
                        ) : null
                      ) : isGhostNest ? (
                        <Text color="blue.500"> </Text>
                      ) : hasPlate ? (
                        <Box>
                          <WellPlateIcon
                            rows={getPlateRows(
                              plates.find((p) => p.nest_id === nest?.id)?.plate_type || "",
                            )}
                            columns={getPlateColumns(
                              plates.find((p) => p.nest_id === nest?.id)?.plate_type || "",
                            )}
                            size="40px"
                          />
                        </Box>
                      ) : (
                        renderPlateButton(nest)
                      )}
                    </Box>
                  );
                }),
              )}
              {/* Render potential nests around existing nests or initial nest if none exist */}
              {addingNests &&
                (nests.length === 0 ? (
                  <Box
                    key="initial-nest"
                    p={2}
                    borderWidth="1px"
                    borderRadius="md"
                    cursor="pointer"
                    onClick={() => onCreateNest(1, 1)} // Create first nest at position 1,1
                    bg="transparent"
                    borderColor="blue.300"
                    borderStyle="dashed"
                    height="50px"
                    maxHeight="50px"
                    minHeight="50px"
                    maxWidth="60px"
                    minWidth="60px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    style={{
                      gridColumnStart: 1,
                      gridRowStart: 1,
                    }}
                    boxSizing="border-box">
                    <Text color="blue.500">Add First Nest</Text>
                  </Box>
                ) : (
                  potentialNests.map(({ row, col }) => (
                    <Box
                      key={`potential-nest-${row}-${col}`}
                      p={2}
                      borderWidth="1px"
                      borderRadius="md"
                      cursor="pointer"
                      onClick={() => onCreateNest(row, col)}
                      bg="transparent"
                      borderColor="blue.300"
                      borderStyle="dashed"
                      height="50px"
                      maxHeight="50px"
                      minHeight="50px"
                      maxWidth="60px"
                      minWidth="60px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      style={{
                        gridColumnStart: col,
                        gridRowStart: row,
                      }}
                      boxSizing="border-box">
                      <Text color="blue.500">Add Nest</Text>
                    </Box>
                  ))
                ))}
            </Grid>
          </ModalBody>
        </ModalContent>
      </Modal>

      {isPlateModalOpen && selectedPlate && (
        <PlateModal
          isOpen={isPlateModalOpen}
          onClose={() => setIsPlateModalOpen(false)}
          plate={selectedPlate}
          onCreateReagent={onCreateReagent}
        />
      )}
    </>
  );
};

export default NestModal;
