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
  Divider,
} from "@chakra-ui/react";
import { Nest, Plate } from "@/types";
import { AddIcon, MinusIcon, DeleteIcon } from "@chakra-ui/icons";
import { WellPlateIcon, Icon } from "@/components/ui/Icons";
import { Check, Grid3x3 } from "lucide-react";
import { successToast, errorToast, warningToast } from "@/components/ui/Toast";
import { useCommonColors, useTextColors } from "@/components/ui/Theme";
import { EditableText, EditableSelect } from "@/components/ui/Form";

interface NestModalProps {
  isOpen: boolean;
  onClose: () => void;
  containerName: string;
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

const PLATE_TYPE_OPTIONS = [
  { label: "6 Well", value: "6 well" },
  { label: "24 Well", value: "24 well" },
  { label: "96 Well", value: "96 well" },
  { label: "384 Well", value: "384 well" },
];

const getPlateTypeInfo = (plateType: string) => {
  const rows = plateType?.includes("384")
    ? 16
    : plateType?.includes("96")
      ? 8
      : plateType?.includes("24")
        ? 4
        : 2;
  const cols = plateType?.includes("384")
    ? 24
    : plateType?.includes("96")
      ? 12
      : plateType?.includes("24")
        ? 6
        : 3;
  return { rows, cols };
};

const NestModal: React.FC<NestModalProps> = ({
  isOpen,
  onClose,
  containerName,
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
  const [plateForm, setPlateForm] = useState({
    barcode: "",
    name: "",
    plateType: "96 well",
  });
  // Separate state for table view - keyed by nest ID
  const [tablePlateInputs, setTablePlateInputs] = useState<
    Record<
      number,
      {
        barcode: string;
        name: string;
        plateType: string;
      }
    >
  >({});

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

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedNest(null);
      setPlateForm({ barcode: "", name: "", plateType: "96 well" });
      setTablePlateInputs({});
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

  const handleAddPlate = async (nestId?: number) => {
    const targetNest = nestId ? nests.find((n) => n.id === nestId) : selectedNest;

    if (!targetNest) {
      warningToast("No nest selected", "Please select a nest first");
      return;
    }

    // Get form data from table inputs or grid form
    const formData = nestId
      ? tablePlateInputs[nestId] || { barcode: "", name: "", plateType: "96 well" }
      : plateForm;

    if (!formData.barcode || !formData.name) {
      warningToast("Missing information", "Please fill in barcode and name");
      return;
    }

    if (!onCreatePlate) {
      errorToast("Error", "Plate creation not configured");
      return;
    }

    try {
      await onCreatePlate({
        barcode: formData.barcode,
        name: formData.name,
        plateType: formData.plateType,
        nestId: targetNest.id,
      });

      successToast("Success", "Plate added successfully");

      // Clear appropriate form
      if (nestId) {
        setTablePlateInputs((prev) => {
          const newInputs = { ...prev };
          delete newInputs[nestId];
          return newInputs;
        });
      } else {
        setPlateForm({ barcode: "", name: "", plateType: "96 well" });
        setSelectedNest(null);
      }
    } catch (error) {
      errorToast("Error", error instanceof Error ? error.message : "Failed to add plate");
    }
  };

  const handleUpdatePlateField = async (
    plateId: number,
    field: "barcode" | "name" | "plateType",
    value: string | null | undefined,
  ) => {
    if (!onUpdatePlate || !value) return;

    try {
      await onUpdatePlate(plateId, { [field]: value });
      successToast("Success", `Plate ${field} updated successfully`);
    } catch (error) {
      errorToast("Error", error instanceof Error ? error.message : `Failed to update ${field}`);
    }
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
        setSelectedNest(null);
      } catch (error) {
        errorToast("Error", error instanceof Error ? error.message : "Failed to delete plate");
      }
    }
  };

  const renderNestContent = (nest: Nest) => {
    const plate = plates.find((p) => p.nestId === nest.id);
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
        {plate ? (
          <>
            <Tooltip label={`${plate.name || "Unnamed Plate"}`}>
              <Box>
                <WellPlateIcon
                  rows={getPlateTypeInfo(plate.plateType).rows}
                  columns={getPlateTypeInfo(plate.plateType).cols}
                  size={`calc(${cellSize} - 20px)`}
                />
              </Box>
            </Tooltip>

            <Badge
              position="absolute"
              top="-2"
              right="-2"
              colorScheme="teal"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              w="6"
              h="6"
              p="0">
              <Icon as={Check} boxSize="3" />
            </Badge>
          </>
        ) : null}
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

  const renderPlateForm = (nestId?: number) => (
    <VStack spacing={4} align="stretch">
      <FormControl isRequired>
        <FormLabel>Barcode</FormLabel>
        <Input
          value={plateForm.barcode}
          onChange={(e) => setPlateForm({ ...plateForm, barcode: e.target.value })}
          placeholder="Scan or enter barcode"
          bg={inputBg}
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Plate Name</FormLabel>
        <Input
          value={plateForm.name}
          onChange={(e) => setPlateForm({ ...plateForm, name: e.target.value })}
          placeholder="Enter plate name"
          bg={inputBg}
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Plate Type</FormLabel>
        <Select
          value={plateForm.plateType}
          onChange={(e) => setPlateForm({ ...plateForm, plateType: e.target.value })}
          bg={inputBg}>
          {PLATE_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </FormControl>

      <Button
        colorScheme="teal"
        onClick={() => handleAddPlate(nestId)}
        isDisabled={!plateForm.barcode || !plateForm.name}
        width="100%"
        size="lg">
        Add Plate
      </Button>
    </VStack>
  );

  const renderGridView = () => {
    const selectedPlate = selectedNest ? plates.find((p) => p.nestId === selectedNest.id) : null;

    return (
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
                  {selectedPlate ? "Manage Plate" : "Add Plate to Nest"}
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
              {selectedNest && !selectedPlate && renderPlateForm()}
              {selectedPlate && (
                <VStack spacing={3} align="stretch">
                  <Box p={3} bg={ghostNestBg} borderRadius="md">
                    <VStack align="start" spacing={2}>
                      <Text fontSize="sm">
                        <strong>Name:</strong> {selectedPlate.name}
                      </Text>
                      <Text fontSize="sm">
                        <strong>Barcode:</strong> {selectedPlate.barcode}
                      </Text>
                      <Text fontSize="sm">
                        <strong>Type:</strong> {selectedPlate.plateType}
                      </Text>
                    </VStack>
                  </Box>
                  <Button
                    colorScheme="red"
                    variant="outline"
                    onClick={() => handleDeletePlate(selectedPlate.id)}
                    leftIcon={<DeleteIcon />}
                    width="100%">
                    Remove Plate
                  </Button>
                </VStack>
              )}

              {selectedNest && (
                <Button
                  variant="ghost"
                  onClick={() => setSelectedNest(null)}
                  width="100%"
                  size="sm">
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
                  onClick={() =>
                    setDimensionMode((prev) => (prev === "column" ? "row" : "column"))
                  }>
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
                        bg={nestBg}
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
                          bg={nestBg}
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
                              borderColor={nestBorderColor}
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
  };

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
            <Th width="80px">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {nests.map((nest) => {
            const plate = plates.find((p) => p.nestId === nest.id);
            const nestInput = tablePlateInputs[nest.id] || {
              barcode: "",
              name: "",
              plateType: "96 well",
            };

            return (
              <Tr key={nest.id} _hover={{ bg: nestBg }}>
                <Td fontWeight="medium">{nest.row + 1}</Td>
                <Td fontWeight="medium">{nest.column + 1}</Td>
                <Td minW="200px">
                  {plate ? (
                    <EditableText
                      defaultValue={plate.barcode || ""}
                      placeholder="Enter barcode"
                      onSubmit={(value) => handleUpdatePlateField(plate.id, "barcode", value)}
                      minWidth={150}
                    />
                  ) : (
                    <Input
                      placeholder="Enter barcode"
                      size="sm"
                      bg={inputBg}
                      value={nestInput.barcode}
                      onChange={(e) =>
                        setTablePlateInputs((prev) => ({
                          ...prev,
                          [nest.id]: { ...nestInput, barcode: e.target.value },
                        }))
                      }
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && nestInput.barcode && nestInput.name) {
                          handleAddPlate(nest.id);
                        }
                      }}
                    />
                  )}
                </Td>
                <Td minW="200px">
                  {plate ? (
                    <EditableText
                      defaultValue={plate.name || ""}
                      placeholder="Enter name"
                      onSubmit={(value) => handleUpdatePlateField(plate.id, "name", value)}
                      minWidth={150}
                    />
                  ) : (
                    <Input
                      placeholder="Enter name"
                      size="sm"
                      bg={inputBg}
                      value={nestInput.name}
                      onChange={(e) =>
                        setTablePlateInputs((prev) => ({
                          ...prev,
                          [nest.id]: { ...nestInput, name: e.target.value },
                        }))
                      }
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && nestInput.barcode && nestInput.name) {
                          handleAddPlate(nest.id);
                        }
                      }}
                    />
                  )}
                </Td>
                <Td minW="150px">
                  {plate ? (
                    <EditableSelect
                      options={PLATE_TYPE_OPTIONS}
                      preview={
                        <Text fontSize="sm" color={textColor}>
                          {plate.plateType}
                        </Text>
                      }
                      onSubmit={(value) => handleUpdatePlateField(plate.id, "plateType", value)}
                      dropDownWidth={150}
                    />
                  ) : (
                    <Select
                      size="sm"
                      bg={inputBg}
                      value={nestInput.plateType}
                      onChange={(e) =>
                        setTablePlateInputs((prev) => ({
                          ...prev,
                          [nest.id]: { ...nestInput, plateType: e.target.value },
                        }))
                      }>
                      {PLATE_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Select>
                  )}
                </Td>
                <Td>
                  <Badge colorScheme={plate ? "green" : "gray"}>
                    {plate ? "occupied" : "empty"}
                  </Badge>
                </Td>
                <Td>
                  {plate ? (
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
                  ) : (
                    <Tooltip label="Add plate">
                      <IconButton
                        aria-label="Add plate"
                        icon={<AddIcon />}
                        size="sm"
                        variant="ghost"
                        colorScheme="teal"
                        onClick={() => handleAddPlate(nest.id)}
                        isDisabled={!nestInput.barcode || !nestInput.name}
                      />
                    </Tooltip>
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
