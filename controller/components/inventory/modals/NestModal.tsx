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
import {
  Check, // replaces RiCheckFill
  Grid3x3, // replaces BsGrid3X3
  Package, // replaces BsBoxSeam
  Zap, // replaces BsLightningCharge
} from "lucide-react";
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
  const maxRows = nests.length > 0 ? Math.max(...nests.map((nest) => nest.row)) + 1 : 1;

  const maxColumns = nests.length > 0 ? Math.max(...nests.map((nest) => nest.column)) + 1 : 1;

  // Calculate dynamic cell size based on grid dimensions
  const calculateCellSize = () => {
    // Base sizes for different grid configurations
    if (maxRows <= 3 && maxColumns <= 3) return "80px";
    if (maxRows <= 5 && maxColumns <= 5) return "70px";
    if (maxRows <= 8 && maxColumns <= 8) return "60px";
    if (maxRows <= 12 && maxColumns <= 12) return "50px";
    return "40px"; // For very large grids
  };

  const cellSize = calculateCellSize();
  const labelWidth = maxRows >= 10 ? "45px" : "40px";

  // Use color hooks
  const {
    cardBg: nestBg,
    borderColor: nestBorderColor,
    selectedBg: selectedNestBg,
    selectedBorder: selectedNestBorder,
    sectionBg: ghostNestBg,
  } = useCommonColors();
  const { primary: textColor } = useTextColors();
  const ghostNestBorder = useColorModeValue("gray.300", "gray.600");
  const labelBg = useColorModeValue("gray.100", "gray.600");

  // Reset local selection when modal opens
  useEffect(() => {
    setLocalSelectedNests(selectedNests || []);
  }, [isOpen]);

  const handleNestClick = (nest: Nest) => {
    let newSelection: number[];

    if (isMultiSelect) {
      if (localSelectedNests.includes(nest.id)) {
        newSelection = localSelectedNests.filter((id) => id !== nest.id);
      } else {
        if (maxSelections && localSelectedNests.length >= maxSelections) {
          warningToast(
            "Selection limit reached",
            `You can only select up to ${maxSelections} nest${maxSelections > 1 ? "s" : ""}`,
          );
          return;
        }
        newSelection = [...localSelectedNests, nest.id];
      }
    } else {
      newSelection = [nest.id];
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
      const currentMax = type === "row" ? maxRows : maxColumns;
      const targetIndex = operation === "add" ? currentMax : currentMax - 1;

      if (operation === "remove" && onDeleteNest) {
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
        if (nests.length === 0) {
          await onCreateNest(0, 0);
          return;
        }

        if (type === "row") {
          for (let col = 0; col < maxColumns; col++) {
            await onCreateNest(targetIndex, col);
          }
        } else {
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
        height={cellSize}
        width={cellSize}
        display="flex"
        alignItems="center"
        justifyContent="center"
        transition="all 0.2s"
        _hover={{
          transform: "scale(1.05)",
          shadow: "md",
          borderColor: selectedNestBorder,
          bg: isSelected ? selectedNestBg : "transparent",
        }}>
        {plate && (
          <Tooltip label={`${plate.name || "Unnamed Plate"} - Click to view details or check out`}>
            <Box
              onClick={(e) => {
                e.stopPropagation();
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
                size={`calc(${cellSize} - 20px)`}
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
            fontSize="2xs">
            {nest.status.charAt(0).toUpperCase()}
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
            <Icon as={Check} boxSize={3} />
          </Badge>
        )}
      </Box>
    );
  };

  // Determine modal size based on grid dimensions
  const getModalSize = () => {
    const totalCells = maxRows * maxColumns;
    if (totalCells > 144) return "6xl"; // 12x12 or larger
    if (totalCells > 100) return "5xl"; // 10x10 to 12x12
    if (totalCells > 64) return "4xl"; // 8x8 to 10x10
    if (totalCells > 36) return "3xl"; // 6x6 to 8x8
    if (totalCells > 16) return "2xl"; // 4x4 to 6x6
    return "xl";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={getModalSize()}>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent maxW="95vw">
        <ModalHeader borderBottomWidth="1px" py={4}>
          <VStack spacing={2} align="stretch">
            <HStack spacing={3} justify="space-between">
              <HStack spacing={3}>
                <Icon as={Grid3x3} boxSize={5} color="teal.500" />
                <VStack align="start" spacing={0}>
                  <Text>{toolName}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {maxRows} × {maxColumns} Grid
                  </Text>
                </VStack>
              </HStack>

              {onCheckIn && (
                <Button
                  leftIcon={<Icon as={Package} />}
                  colorScheme="teal"
                  size="sm"
                  onClick={() => {
                    if (localSelectedNests.length > 0) {
                      handleCheckIn(localSelectedNests[0]);
                    } else {
                      handleCheckIn(-1);
                    }
                  }}>
                  {localSelectedNests.length > 0 ? "Check In Here" : "Check In"}
                </Button>
              )}
            </HStack>

            {onCreateNest && onDeleteNest && (
              <HStack spacing={2} justify="flex-end">
                <Button
                  size="sm"
                  variant="ghost"
                  rightIcon={
                    dimensionMode === "column" ? (
                      <Icon as={Grid3x3} />
                    ) : (
                      <Icon as={Grid3x3} transform="rotate(90deg)" />
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

            {isLiconic && containerType === "tool" && (
              <HStack spacing={2} justify="flex-end">
                <HStack spacing={2}>
                  <Icon as={Zap} color="orange.400" />
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
        <ModalBody py={6} overflow="auto" maxH="70vh">
          <Flex justify="center" align="center" w="100%">
            <Flex>
              {/* Row labels column */}
              <VStack spacing={0} pt={14} pr={2} minW={labelWidth} justify="flex-start">
                {Array.from({ length: maxRows }, (_, i) => (
                  <Box
                    key={`row-${i}`}
                    h={cellSize}
                    mb={i < maxRows - 1 ? "8px" : 0}
                    display="flex"
                    alignItems="center"
                    justifyContent="flex-end">
                    <Box
                      bg={labelBg}
                      px={2}
                      py={1}
                      borderRadius="md"
                      fontSize="xs"
                      fontWeight="bold"
                      minW="30px"
                      textAlign="center">
                      {i + 1}
                    </Box>
                  </Box>
                ))}
              </VStack>

              <VStack spacing={0} align="stretch">
                {/* Column labels row */}
                <HStack spacing={2} px={2} pb={2} minH="40px" align="flex-end" justify="center">
                  {Array.from({ length: maxColumns }, (_, i) => (
                    <Flex key={`col-${i}`} w={cellSize} justify="center">
                      <Box
                        bg={labelBg}
                        px={2}
                        py={1}
                        borderRadius="md"
                        fontSize="xs"
                        fontWeight="bold"
                        minW="30px"
                        textAlign="center">
                        {i + 1}
                      </Box>
                    </Flex>
                  ))}
                </HStack>

                {/* Grid */}
                <Grid
                  templateColumns={`repeat(${maxColumns}, ${cellSize})`}
                  gap={2}
                  p={3}
                  bg={ghostNestBg}
                  borderRadius="lg"
                  key={`grid-${maxRows}-${maxColumns}`}>
                  {Array.from({ length: maxRows }, (_, rowIndex) =>
                    Array.from({ length: maxColumns }, (_, colIndex) => {
                      const nest = nests.find((n) => n.row === rowIndex && n.column === colIndex);

                      if (!nest) {
                        return (
                          <Box
                            key={`empty-${rowIndex}-${colIndex}`}
                            height={cellSize}
                            width={cellSize}
                            borderWidth="1px"
                            borderStyle="dashed"
                            borderColor={ghostNestBorder}
                            borderRadius="md"
                            opacity={0.4}
                          />
                        );
                      }

                      return renderNestContent(nest);
                    }),
                  )}
                </Grid>
              </VStack>
            </Flex>
          </Flex>
        </ModalBody>

        {isMultiSelect && (
          <ModalFooter borderTopWidth="1px" py={4}>
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
