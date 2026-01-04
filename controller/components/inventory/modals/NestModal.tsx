import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Grid,
  Box,
  Button,
  IconButton,
  Input,
  Text,
  VStack,
  HStack,
  Badge,
  Tooltip,
  Icon,
  Flex,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  FormControl,
  FormLabel,
  useDisclosure,
  Divider,
} from "@chakra-ui/react";
import { Nest, Plate } from "@/types/api";
import { AddIcon, MinusIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { WellPlateIcon } from "@/components/ui/Icons";
import { Check, Grid3x3, X } from "lucide-react";
import { successToast, errorToast, warningToast } from "@/components/ui/Toast";
import { useCommonColors, useTextColors } from "@/components/ui/Theme";

interface NestModalProps {
  isOpen: boolean;
  onClose: () => void;
  containerName: string;
  containerType: "tool" | "hotel";
  containerId: number;
  nests: Nest[];
  plates: Plate[];
  onCreateNest?: (row: number, column: number) => Promise<void>;
  onDeleteNest?: (nestId: number) => Promise<void>;
  onCreatePlate?: (params: {
    barcode: string;
    name: string;
    plateType: string;
    nestId: number;
  }) => Promise<void>;
  onUpdatePlate?: (
    plateId: number,
    params: {
      barcode?: string;
      name?: string;
      plateType?: string;
    },
  ) => Promise<void>;
  onDeletePlate?: (plateId: number) => Promise<void>;
}

const NestModal: React.FC<NestModalProps> = ({
  isOpen,
  onClose,
  containerName,
  containerType,
  containerId,
  nests,
  plates,
  onCreateNest,
  onDeleteNest,
  onCreatePlate,
  onUpdatePlate,
  onDeletePlate,
}) => {
  const [selectedNest, setSelectedNest] = useState<Nest | null>(null);
  const [dimensionMode, setDimensionMode] = useState<"row" | "column">("column");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Plate form state
  const [plateBarcode, setPlateBarcode] = useState("");
  const [plateName, setPlateName] = useState("");
  const [plateType, setPlateType] = useState("96 well");

  // Edit state
  const [editingPlateId, setEditingPlateId] = useState<number | null>(null);
  const [editBarcode, setEditBarcode] = useState("");
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");

  const maxRows = nests.length > 0 ? Math.max(...nests.map((n) => n.row)) + 1 : 1;
  const maxColumns = nests.length > 0 ? Math.max(...nests.map((n) => n.column)) + 1 : 1;

  const {
    cardBg: nestBg,
    borderColor: nestBorderColor,
    selectedBg: selectedNestBg,
    selectedBorder: selectedNestBorder,
    sectionBg: ghostNestBg,
    inputBg,
  } = useCommonColors();
  const { primary: textColor } = useTextColors();
  const ghostNestBorder = nestBorderColor;
  const labelBg = nestBg;

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedNest(null);
      setPlateBarcode("");
      setPlateName("");
      setPlateType("96 well");
      setEditingPlateId(null);
    }
  }, [isOpen]);

  const calculateCellSize = () => {
    if (maxRows <= 3 && maxColumns <= 3) return "80px";
    if (maxRows <= 5 && maxColumns <= 5) return "70px";
    if (maxRows <= 8 && maxColumns <= 8) return "60px";
    if (maxRows <= 12 && maxColumns <= 12) return "50px";
    return "40px";
  };

  const cellSize = calculateCellSize();
  const labelWidth = maxRows >= 10 ? "45px" : "40px";

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
        successToast("Success", `Removed ${type}`);
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
        successToast("Success", `Added ${type}`);
      }
    } catch (error) {
      errorToast("Error", "Failed to modify grid dimensions");
    }
  };

  const handleAddPlate = async () => {
    if (!selectedNest) {
      warningToast("No nest selected", "Please select a nest first");
      return;
    }

    if (!plateBarcode || !plateName) {
      warningToast("Missing information", "Please fill in barcode and name");
      return;
    }

    if (!onCreatePlate) {
      errorToast("Error", "Plate creation not configured");
      return;
    }

    try {
      await onCreatePlate({
        barcode: plateBarcode,
        name: plateName,
        plateType: plateType,
        nestId: selectedNest.id,
      });

      successToast("Success", "Plate added successfully");
      setPlateBarcode("");
      setPlateName("");
      setPlateType("96 well");
      setSelectedNest(null);
    } catch (error) {
      errorToast("Error", error instanceof Error ? error.message : "Failed to add plate");
    }
  };

  const handleStartEdit = (plate: Plate) => {
    setEditingPlateId(plate.id);
    setEditBarcode(plate.barcode || "");
    setEditName(plate.name || "");
    setEditType(plate.plate_type || "");
  };

  const handleSaveEdit = async (plateId: number) => {
    if (!onUpdatePlate) {
      errorToast("Error", "Plate update not configured");
      return;
    }

    try {
      await onUpdatePlate(plateId, {
        barcode: editBarcode,
        name: editName,
        plateType: editType,
      });
      successToast("Success", "Plate updated successfully");
      setEditingPlateId(null);
    } catch (error) {
      errorToast("Error", error instanceof Error ? error.message : "Failed to update plate");
    }
  };

  const handleCancelEdit = () => {
    setEditingPlateId(null);
    setEditBarcode("");
    setEditName("");
    setEditType("");
  };

  const handleDeletePlate = async (plateId: number) => {
    if (!onDeletePlate) {
      errorToast("Error", "Plate deletion not configured");
      return;
    }

    if (window.confirm("Are you sure you want to delete this plate?")) {
      try {
        await onDeletePlate(plateId);
        successToast("Success", "Plate deleted successfully");
      } catch (error) {
        errorToast("Error", error instanceof Error ? error.message : "Failed to delete plate");
      }
    }
  };

  const renderNestContent = (nest: Nest) => {
    const plate = plates.find((p) => p.nest_id === nest.id);
    const isSelected = selectedNest?.id === nest.id;

    return (
      <Box
        key={nest.id}
        p={2}
        bg={isSelected ? selectedNestBg : nestBg}
        borderWidth="2px"
        borderColor={isSelected ? selectedNestBorder : nestBorderColor}
        borderRadius="md"
        cursor="pointer"
        onClick={() => setSelectedNest(nest)}
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
        }}>
        {plate && (
          <Tooltip label={`${plate.name || "Unnamed Plate"}`}>
            <Box>
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

  const getModalSize = () => {
    const totalCells = maxRows * maxColumns;
    if (totalCells > 144) return "full";
    if (totalCells > 100) return "6xl";
    if (totalCells > 64) return "5xl";
    if (totalCells > 36) return "4xl";
    return "3xl";
  };

  const renderGridView = () => (
    <Flex gap={6} height="100%">
      {/* Left side - Add Plate Form */}
      <Box flex="1" minW="300px">
        <Box
          bg={nestBg}
          p={4}
          borderRadius="md"
          borderWidth="1px"
          borderColor={nestBorderColor}
          position="sticky"
          top="0"
          height="fit-content">
          <VStack spacing={4} align="stretch">
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold" fontSize="lg">
                Add Plate to Nest
              </Text>
              {selectedNest ? (
                <Badge colorScheme="teal" fontSize="sm">
                  Nest {selectedNest.row + 1}-{selectedNest.column + 1}
                </Badge>
              ) : (
                <Text fontSize="sm" color="gray.500">
                  Select a nest from the grid
                </Text>
              )}
            </VStack>

            <Divider />

            <FormControl isRequired isDisabled={!selectedNest}>
              <FormLabel>Barcode</FormLabel>
              <Input
                value={plateBarcode}
                onChange={(e) => setPlateBarcode(e.target.value)}
                placeholder="Scan or enter barcode"
                bg={inputBg}
                isDisabled={!selectedNest}
              />
            </FormControl>

            <FormControl isRequired isDisabled={!selectedNest}>
              <FormLabel>Plate Name</FormLabel>
              <Input
                value={plateName}
                onChange={(e) => setPlateName(e.target.value)}
                placeholder="Enter plate name"
                bg={inputBg}
                isDisabled={!selectedNest}
              />
            </FormControl>

            <FormControl isRequired isDisabled={!selectedNest}>
              <FormLabel>Plate Type</FormLabel>
              <Select
                value={plateType}
                onChange={(e) => setPlateType(e.target.value)}
                bg={inputBg}
                isDisabled={!selectedNest}>
                <option value="6 well">6 Well</option>
                <option value="24 well">24 Well</option>
                <option value="96 well">96 Well</option>
                <option value="384 well">384 Well</option>
              </Select>
            </FormControl>

            <Button
              colorScheme="teal"
              onClick={handleAddPlate}
              isDisabled={!selectedNest || !plateBarcode || !plateName}
              width="100%"
              size="lg">
              Add Plate
            </Button>

            {selectedNest && (
              <Button variant="ghost" onClick={() => setSelectedNest(null)} width="100%" size="sm">
                Clear Selection
              </Button>
            )}
          </VStack>
        </Box>
      </Box>

      {/* Right side - Grid */}
      <Box flex="2">
        <VStack spacing={4} align="stretch">
          {/* Grid Controls */}
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
                onClick={() => setDimensionMode((prev) => (prev === "column" ? "row" : "column"))}>
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

          {/* Grid Display */}
          <Flex justify="center" align="center" w="100%">
            <Flex>
              {/* Row labels */}
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
                {/* Column labels */}
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
                  borderRadius="lg">
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
        </VStack>
      </Box>
    </Flex>
  );

  const renderTableView = () => (
    <Box overflowX="auto">
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Row</Th>
            <Th>Column</Th>
            <Th>Barcode</Th>
            <Th>Plate Name</Th>
            <Th>Plate Type</Th>
            <Th>Status</Th>
            <Th width="120px">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {nests.map((nest) => {
            const plate = plates.find((p) => p.nest_id === nest.id);
            const isEditing = editingPlateId === plate?.id;

            return (
              <Tr key={nest.id} _hover={{ bg: nestBg }}>
                <Td fontWeight="medium">{nest.row + 1}</Td>
                <Td fontWeight="medium">{nest.column + 1}</Td>
                <Td minW="200px">
                  {plate && isEditing ? (
                    <Input
                      size="sm"
                      value={editBarcode}
                      onChange={(e) => setEditBarcode(e.target.value)}
                      bg={inputBg}
                      placeholder="Enter barcode"
                    />
                  ) : (
                    <Text>{plate?.barcode || "-"}</Text>
                  )}
                </Td>
                <Td minW="200px">
                  {plate && isEditing ? (
                    <Input
                      size="sm"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      bg={inputBg}
                      placeholder="Enter name"
                    />
                  ) : (
                    <Text>{plate?.name || "-"}</Text>
                  )}
                </Td>
                <Td minW="120px">{plate ? <Text>{plate.plate_type}</Text> : <Text>-</Text>}</Td>
                <Td>
                  <Badge colorScheme={nest.status === "empty" ? "gray" : "green"}>
                    {nest.status}
                  </Badge>
                </Td>
                <Td>
                  {plate && (
                    <HStack spacing={1}>
                      {isEditing ? (
                        <>
                          <Tooltip label="Save changes">
                            <IconButton
                              aria-label="Save"
                              icon={<Icon as={Check} boxSize={4} />}
                              size="sm"
                              colorScheme="teal"
                              onClick={() => handleSaveEdit(plate.id)}
                            />
                          </Tooltip>
                          <Tooltip label="Cancel">
                            <IconButton
                              aria-label="Cancel"
                              icon={<Icon as={X} boxSize={4} />}
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                            />
                          </Tooltip>
                        </>
                      ) : (
                        <>
                          <Tooltip label="Edit plate">
                            <IconButton
                              aria-label="Edit"
                              icon={<EditIcon />}
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStartEdit(plate)}
                            />
                          </Tooltip>
                          <Tooltip label="Delete plate">
                            <IconButton
                              aria-label="Delete"
                              icon={<DeleteIcon />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleDeletePlate(plate.id)}
                            />
                          </Tooltip>
                        </>
                      )}
                    </HStack>
                  )}
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={getModalSize()}>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent maxW="95vw" maxH="95vh">
        <ModalHeader borderBottomWidth="1px" py={4}>
          <HStack spacing={3} justify="space-between">
            <HStack spacing={3}>
              <Icon as={Grid3x3} boxSize={5} color="teal.500" />
              <VStack align="start" spacing={0}>
                <Text>{containerName}</Text>
                <Text fontSize="sm" color="gray.500">
                  {maxRows} × {maxColumns} Grid • {plates.length} plates
                </Text>
              </VStack>
            </HStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={6} overflow="auto">
          <Tabs>
            <TabList>
              <Tab>Grid View</Tab>
              <Tab>Table View</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>{renderGridView()}</TabPanel>
              <TabPanel>{renderTableView()}</TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default NestModal;
