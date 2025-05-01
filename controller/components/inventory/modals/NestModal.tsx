import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Grid,
  Box,
  Button,
  IconButton,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Badge,
  Tooltip,
  Icon,
  Flex,
  Divider,
  Switch,
} from "@chakra-ui/react";
import { Nest, Plate, NestStatus, PlateStatus } from "@/types/api";
import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import { WellPlateIcon } from "@/components/ui/Icons";
import { RiCheckFill } from "react-icons/ri";
import { BsGrid3X3, BsBoxSeam, BsLightningCharge } from "react-icons/bs";
import { warningToast, errorToast } from "@/components/ui/Toast";
import { useCommonColors, useTextColors } from "@/components/ui/Theme";

interface NestModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolName: string;
  toolType?: string;
  nests: Nest[];
  plates: Plate[];
  selectedNests?: number[];
  isMultiSelect?: boolean;
  maxSelections?: number;
  onNestSelect: (nestIds: number[]) => void;
  onCreateNest?: (row: number, column: number) => Promise<void>;
  onDeleteNest?: (nestId: number) => Promise<void>;
  onPlateClick?: (plate: Plate) => void;
  onCheckIn?: (nestId: number, triggerToolCommand?: boolean) => void;
  onTriggerToolCommandChange?: (value: boolean) => void;
  containerType: "tool" | "hotel";
  containerId: number;
}

const NestModal: React.FC<NestModalProps> = ({
  isOpen,
  onClose,
  toolName,
  toolType,
  nests,
  plates,
  selectedNests = [],
  isMultiSelect = false,
  maxSelections,
  onNestSelect,
  onCreateNest,
  onDeleteNest,
  onPlateClick,
  onCheckIn,
  onTriggerToolCommandChange,
  containerType,
  containerId,
}) => {
  const [localSelectedNests, setLocalSelectedNests] = useState<number[]>(selectedNests || []);
  const [dimensionMode, setDimensionMode] = useState<"row" | "column">("column");
  const [triggerToolCommand, setTriggerToolCommand] = useState(false);
  const isLiconic = toolType?.toLowerCase() === "liconic";

  // Calculate max dimensions properly, ensuring we count from 1 for hotels
  const maxRows =
    nests.length > 0
      ? Math.max(...nests.map((nest) => nest.row)) + 1 // +1 because we need to count row 0 as row 1
      : 1;

  const maxColumns =
    nests.length > 0
      ? Math.max(...nests.map((nest) => nest.column)) + 1 // +1 because we need to count column 0 as column 1
      : 1;

  // Use color hooks
  const {
    cardBg: nestBg,
    borderColor: nestBorderColor,
    selectedBg: selectedNestBg,
    selectedBorder: selectedNestBorder,
    sectionBg: ghostNestBg, // Use sectionBg for ghost
  } = useCommonColors();
  const { primary: textColor } = useTextColors();
  // Specific overrides not in common theme
  const ghostNestBorder = useColorModeValue("gray.300", "gray.600");
  const labelBg = useColorModeValue("gray.100", "gray.600");

  // Reset local selection when modal opens
  useEffect(() => {
    setLocalSelectedNests(selectedNests || []);
  }, [isOpen]);

  // Add logging to help with debugging
  useEffect(() => {
    if (isOpen) {
      console.log("NestModal opened with:", {
        containerType,
        containerId,
        toolName,
        toolType,
        nestCount: nests.length,
        selectedNests
      });
    }
  }, [isOpen, containerType, containerId, toolName, toolType, nests.length, selectedNests]);

  const handleNestClick = (nest: Nest) => {
    let newSelection: number[];

    if (isMultiSelect) {
      if (localSelectedNests.includes(nest.id)) {
        // Always allow deselection
        newSelection = localSelectedNests.filter((id) => id !== nest.id);
      } else {
        // Check if we can add more selections
        if (maxSelections && localSelectedNests.length >= maxSelections) {
          warningToast(
            "Selection limit reached",
            `You can only select up to ${maxSelections} nest${maxSelections > 1 ? "s" : ""}`,
          );
          return;
        }
        newSelection = [...localSelectedNests, nest.id];
      }
      console.log(`Multi-select nest selection: ${newSelection.join(", ")}`);
    } else {
      newSelection = [nest.id];
      console.log(`Single nest selected: ${nest.id}, container: ${containerType} ${containerId}`);
    }

    setLocalSelectedNests(newSelection);
    onNestSelect(newSelection);
  };

  const handleConfirmSelection = () => {
    onNestSelect(localSelectedNests);
    onClose();
  };

  const getPlateTypeInfo = (plateType: string) => {
    const rows = plateType.includes("384")
      ? 16
      : plateType.includes("96")
        ? 8
        : plateType.includes("24")
          ? 4
          : 2;
    const cols = plateType.includes("384")
      ? 24
      : plateType.includes("96")
        ? 12
        : plateType.includes("24")
          ? 6
          : 3;
    return { rows, cols };
  };

  const handleDimensionChange = async (type: "row" | "column", operation: "add" | "remove") => {
    try {
      // Get current max dimensions (these are 1-based for UI display)
      const currentMax = type === "row" ? maxRows : maxColumns;

      // For adding, we want the new index to be equal to currentMax (which is the next 0-based index)
      // For removing, we want the last index (currentMax - 1)
      const targetIndex = operation === "add" ? currentMax : currentMax - 1;

      if (operation === "remove" && onDeleteNest) {
        // Log existing nests for debugging
        // Find nests to delete at the last row/column
        // Since targetIndex is already currentMax - 1, we don't need to subtract 1 again
        const nestsToDelete = nests.filter((nest) =>
          type === "row" ? nest.row === targetIndex : nest.column === targetIndex,
        );

        if (nestsToDelete.length === 0) {
          warningToast("No nests to remove", `No nests found in the last ${type}`);
          return;
        }

        for (const nest of nestsToDelete) {
          await onDeleteNest(nest.id);
        }
      } else if (operation === "add" && onCreateNest) {
        // If inventory is empty, create first nest at (0,0)
        if (nests.length === 0) {
          await onCreateNest(0, 0);
          return;
        }

        // Add new nests in the new row/column
        if (type === "row") {
          // Add a new row - create a nest at the new row for each existing column
          for (let col = 0; col < maxColumns; col++) {
            await onCreateNest(targetIndex, col);
          }
        } else {
          // Add a new column - create a nest at the new column for each existing row
          for (let row = 0; row < maxRows; row++) {
            await onCreateNest(row, targetIndex);
          }
        }
      }
    } catch (error) {
      errorToast("Error modifying grid", "Failed to modify the grid dimensions");
    }
  };

  const handleCheckIn = (nestId: number) => {
    if (onCheckIn) {
      onCheckIn(nestId, triggerToolCommand);
    }
  };

  const renderNestContent = (nest: Nest) => {
    const plate = plates.find((p) => p.nest_id === nest.id);
    const isSelected = localSelectedNests.includes(nest.id);

    return (
      <Box
        key={nest.id}
        p={2}
        bg={isSelected ? selectedNestBg : nestBg}
        borderWidth="1px"
        borderColor={isSelected ? selectedNestBorder : nestBorderColor}
        borderRadius="md"
        cursor="pointer"
        onClick={() => handleNestClick(nest)}
        position="relative"
        height="60px"
        width="60px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        transition="all 0.2s"
        _hover={{
          transform: "scale(1.02)",
          shadow: "sm",
          borderColor: selectedNestBorder,
          bg: isSelected ? selectedNestBg : "transparent",
        }}>
        {plate && (
          <Tooltip label={`${plate.name || "Unnamed Plate"} - Click to view details or check out`}>
            <Box
              onClick={(e) => {
                e.stopPropagation(); // Prevent nest selection when clicking the plate
                if (onPlateClick) {
                  onPlateClick(plate);
                }
              }}
              cursor="pointer"
              _hover={{
                transform: "scale(1.1)",
              }}
              transition="all 0.2s">
              <WellPlateIcon
                rows={getPlateTypeInfo(plate.plate_type).rows}
                columns={getPlateTypeInfo(plate.plate_type).cols}
                size="40px"
              />
            </Box>
          </Tooltip>
        )}
        {!plate && (
          <Badge
            position="absolute"
            top="-2"
            left="-2"
            colorScheme={
              nest.status === "empty" ? "gray" : nest.status === "reserved" ? "yellow" : "red"
            }
            borderRadius="full"
            px="1.5"
            fontSize="xs">
            {nest.status}
          </Badge>
        )}
        {isSelected && (
          <Badge
            position="absolute"
            top="-2"
            right="-2"
            colorScheme="teal"
            borderRadius="full"
            p="0.5"
            fontSize="xs">
            <Icon as={RiCheckFill} boxSize={3} />
          </Badge>
        )}
      </Box>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent maxW="fit-content" minW="min-content">
        <ModalHeader borderBottomWidth="1px" py={4}>
          <VStack spacing={2} align="stretch">
            <HStack spacing={3} justify="space-between">
              <HStack spacing={3}>
                <Icon as={BsGrid3X3} boxSize={5} color="teal.500" />
                <VStack align="start" spacing={0}>
                  <Text>{toolName}</Text>
                  <Text fontSize="sm" color="gray.500">
                    Select nest{isMultiSelect ? "s" : ""}
                  </Text>
                </VStack>
              </HStack>
              
              {/* Check-in button in the top right */}
              {onCheckIn && (
                <Button 
                  leftIcon={<Icon as={BsBoxSeam} />} 
                  colorScheme="teal" 
                  size="sm"
                  onClick={() => {
                    if (localSelectedNests.length > 0) {
                      // If a nest is selected, use that specific nest
                      handleCheckIn(localSelectedNests[0]);
                    } else {
                      // Otherwise, still open the check-in modal
                      // which has automatic placement
                      handleCheckIn(-1); // Use -1 to indicate auto-placement
                    }
                  }}>
                  {localSelectedNests.length > 0 ? "Check In Here" : "Check In"}
                </Button>
              )}
            </HStack>
            
            {/* Grid dimension controls */}
            {onCreateNest && onDeleteNest && (
              <HStack spacing={2} justify="flex-end">
                <Button
                  size="sm"
                  variant="ghost"
                  rightIcon={
                    dimensionMode === "column" ? (
                      <Icon as={BsGrid3X3} />
                    ) : (
                      <Icon as={BsGrid3X3} transform="rotate(90deg)" />
                    )
                  }
                  onClick={() => setDimensionMode((prev) => (prev === "column" ? "row" : "column"))}
                  color={textColor}
                  fontWeight="medium">
                  {dimensionMode === "column" ? "Adding Columns" : "Adding Rows"}
                </Button>
                <Tooltip label={`Add ${dimensionMode}`}>
                  <IconButton
                    aria-label={`Add ${dimensionMode}`}
                    icon={<AddIcon />}
                    size="sm"
                    onClick={() => handleDimensionChange(dimensionMode, "add")}
                    colorScheme="teal"
                  />
                </Tooltip>
                {(dimensionMode === "row" ? maxRows : maxColumns) > 1 && (
                  <Tooltip label={`Remove ${dimensionMode}`}>
                    <IconButton
                      aria-label={`Remove ${dimensionMode}`}
                      icon={<MinusIcon />}
                      size="sm"
                      onClick={() => handleDimensionChange(dimensionMode, "remove")}
                      colorScheme="teal"
                    />
                  </Tooltip>
                )}
              </HStack>
            )}
            
            {/* Only show the trigger tool command option for Liconic tools */}
            {isLiconic && containerType === "tool" && (
              <HStack spacing={2} justify="flex-end">
                <HStack spacing={2}>
                  <Icon as={BsLightningCharge} color="orange.400" />
                  <Text fontSize="sm" color={textColor}>
                    Trigger Tool Command
                  </Text>
                </HStack>
                <Switch
                  isChecked={triggerToolCommand}
                  onChange={(e) => {
                    setTriggerToolCommand(e.target.checked);
                    if (onTriggerToolCommandChange) {
                      onTriggerToolCommandChange(e.target.checked);
                    }
                  }}
                  colorScheme="teal"
                  size="sm"
                />
              </HStack>
            )}
          </VStack>
        </ModalHeader>
        <ModalBody py={6}>
          <Flex>
            {/* Row labels column */}
            <VStack spacing={0} pt={14} pr={3} minW="40px">
              {Array.from({ length: maxRows }, (_, i) => (
                <Box
                  key={`row-${i}`}
                  h="60px"
                  mb={i < maxRows - 1 ? "12px" : 0}
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-end">
                  <Box
                    bg={labelBg}
                    px={2}
                    py={1}
                    borderRadius="md"
                    fontSize="sm"
                    fontWeight="medium">
                    {i + 1}
                  </Box>
                </Box>
              ))}
            </VStack>

            <VStack spacing={0} align="stretch">
              {/* Column labels row */}
              <HStack spacing={3} px={4} pb={3} minH="40px" align="flex-end">
                {Array.from({ length: maxColumns }, (_, i) => (
                  <Flex key={`col-${i}`} w="60px" justify="center">
                    <Box
                      bg={labelBg}
                      px={2}
                      py={1}
                      borderRadius="md"
                      fontSize="sm"
                      fontWeight="medium">
                      {i + 1}
                    </Box>
                  </Flex>
                ))}
              </HStack>

              {/* Grid */}
              <Grid
                templateColumns={`repeat(${maxColumns}, 60px)`}
                gap={3}
                p={4}
                bg={ghostNestBg}
                borderRadius="lg"
                key={`grid-${maxRows}-${maxColumns}`}>
                {Array.from({ length: maxRows }, (_, rowIndex) =>
                  Array.from({ length: maxColumns }, (_, colIndex) => {
                    // For UI we're using 1-based indexing (rowIndex and colIndex are 0-based)
                    // But database stores 0-based indexes, so look for nests at rowIndex and colIndex
                    const nest = nests.find((n) => n.row === rowIndex && n.column === colIndex);

                    if (!nest) {
                      // No longer render ghost nests
                      return (
                        <Box
                          key={`empty-${rowIndex}-${colIndex}`}
                          height="60px"
                          width="60px"
                          borderWidth="1px"
                          borderStyle="dashed"
                          borderColor={ghostNestBorder}
                          borderRadius="md"
                          opacity={0.5}
                        />
                      );
                    }

                    return renderNestContent(nest);
                  }),
                )}
              </Grid>
            </VStack>
          </Flex>
        </ModalBody>

        {isMultiSelect && (
          <ModalFooter borderBottomWidth="1px" py={4}>
            <HStack width="100%" justify="space-between">
              <Text color="gray.500" fontSize="sm">
                {localSelectedNests.length} nest{localSelectedNests.length !== 1 ? "s" : ""}{" "}
                selected
              </Text>
              <Button
                colorScheme="teal"
                onClick={handleConfirmSelection}
                isDisabled={localSelectedNests.length === 0}>
                Confirm Selection
              </Button>
            </HStack>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

export default NestModal;
