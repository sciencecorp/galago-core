import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  Switch,
  HStack,
  Box,
  Badge,
  Icon,
} from "@chakra-ui/react";
import { Nest, Plate, PlateStatus } from "@/types/api";
import { Tool } from "@/types";
import { Package, Grid3x3 } from "lucide-react";
import NestModal from "./NestModal";
import { errorToast } from "@/components/ui/Toast";
import { useCommonColors, useTextColors } from "@/components/ui/Theme";

type StorageContainer = Tool | { id: number; name: string; type: string };

type InventoryModalProps = {
  mode: "check-in" | "check-out";
  isOpen: boolean;
  onClose: () => void;
  tools: Tool[];
  staticHotels?: Array<{ id: number; name: string }>;
  availableNests: Nest[];
  selectedPlate: Plate | null;
  plates: Plate[];
  triggerToolCommand?: boolean;
  initialSelectedNestIds?: number[];
  initialContainerId?: number | null;
  initialContainerType?: "tool" | "hotel" | "";
  onCheckIn?: (params: {
    nestId: number;
    plates: Array<{ barcode: string; name: string; plate_type: string; status: PlateStatus }>;
    triggerToolCommand: boolean;
    isStatic?: boolean;
    containerId?: number;
    containerType?: "tool" | "hotel" | "";
  }) => Promise<void>;
  onCheckOut?: (params: {
    plateId?: number;
    barcode?: string;
    triggerToolCommand: boolean;
    isStatic?: boolean;
  }) => Promise<void>;
  onPlateClick?: (plate: Plate) => void;
};

const InventoryModal: React.FC<InventoryModalProps> = ({
  mode,
  isOpen,
  onClose,
  tools,
  staticHotels = [],
  availableNests,
  selectedPlate,
  plates,
  triggerToolCommand: nestTriggerToolCommand = false,
  initialSelectedNestIds = [],
  initialContainerId = null,
  initialContainerType = "",
  onCheckIn,
  onCheckOut,
  onPlateClick,
}) => {
  // State for controlled form
  const [selectedContainerId, setSelectedContainerId] = useState<number | string>("");
  const [selectedContainerType, setSelectedContainerType] = useState<"tool" | "hotel" | "">("");
  const [nestSelections, setNestSelections] = useState<number[]>([]);
  const [triggerToolCommand, setTriggerToolCommand] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNestModalOpen, setIsNestModalOpen] = useState(false);

  // Check-in specific state
  const [manualBarcode, setManualBarcode] = useState("");
  const [manualPlateName, setManualPlateName] = useState("");
  const [manualPlateType, setManualPlateType] = useState("");
  const [useAutoBarcode, setUseAutoBarcode] = useState(true);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [numberOfPlates, setNumberOfPlates] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check-out specific state
  const [plateId, setPlateId] = useState("");
  const [barcode, setBarcode] = useState("");
  const [selectionMode, setSelectionMode] = useState<"manual" | "nest">("manual");

  // Save the initial container settings
  const [initialSettings, setInitialSettings] = useState<{
    containerId: number | null;
    containerType: "tool" | "hotel" | "";
  }>({
    containerId: null,
    containerType: "",
  });

  // Update triggerToolCommand when nestTriggerToolCommand changes
  useEffect(() => {
    setTriggerToolCommand(nestTriggerToolCommand);
  }, [nestTriggerToolCommand]);

  // Reset state when modal opens or mode changes
  useEffect(() => {
    if (isOpen) {
      // Initialize the nest selections from props if available
      setNestSelections(initialSelectedNestIds);

      // Initialize container selection from props if available
      if (initialContainerId && initialContainerType) {
        setSelectedContainerId(initialContainerId);
        setSelectedContainerType(initialContainerType);

        // Save initial settings for later reference
        setInitialSettings({
          containerId: initialContainerId,
          containerType: initialContainerType,
        });
      }

      // If there are initial nests, get container info from them, but don't override explicit container settings
      if (initialSelectedNestIds.length > 0 && (!initialContainerId || !initialContainerType)) {
        const selectedNest = availableNests.find((n) => n.id === initialSelectedNestIds[0]);
        if (selectedNest) {
          if (selectedNest.tool_id) {
            setSelectedContainerId(selectedNest.tool_id);
            setSelectedContainerType("tool");
          } else if (selectedNest.hotel_id) {
            setSelectedContainerId(selectedNest.hotel_id);
            setSelectedContainerType("hotel");
          }
        }
      }

      // If a plate is selected, populate form with its data
      if (selectedPlate) {
        if (mode === "check-in") {
          setManualBarcode(selectedPlate.barcode || "");
          setManualPlateName(selectedPlate.name || "");
          setManualPlateType(selectedPlate.plate_type || "");
        } else {
          // check-out mode
          if (selectedPlate.id) {
            setPlateId(selectedPlate.id.toString());
          }
          if (selectedPlate.barcode) {
            setBarcode(selectedPlate.barcode);
            setSelectionMode("manual");
          }
        }

        // For check-out mode, also check if the plate is in a nest and no container is explicitly set
        if (
          mode === "check-out" &&
          selectedPlate?.nest_id &&
          (!initialContainerId || !initialContainerType)
        ) {
          const plateNest = availableNests.find((n) => n.id === selectedPlate.nest_id);
          if (plateNest) {
            if (plateNest.tool_id) {
              setSelectedContainerType("tool");
              setSelectedContainerId(plateNest.tool_id);
            } else if (plateNest.hotel_id) {
              setSelectedContainerType("hotel");
              setSelectedContainerId(plateNest.hotel_id);
            }
            setNestSelections([plateNest.id]);
          }
        }
      }
    }
  }, [
    isOpen,
    selectedPlate,
    initialSelectedNestIds,
    initialContainerId,
    initialContainerType,
    availableNests,
    mode,
    tools,
    staticHotels,
  ]);

  // Combine tools and hotels into a single list of containers
  const storageContainers: StorageContainer[] = [
    ...tools
      .filter((tool) => tool.type.toLowerCase() === "liconic")
      .map((tool) => ({
        ...tool,
        type: "tool",
      })),
    ...staticHotels.map((hotel) => ({
      id: hotel.id,
      name: hotel.name,
      type: "hotel",
    })),
  ];

  // Auto-select first available container when none is selected (but don't override explicit settings)
  useEffect(() => {
    if (isOpen && !selectedContainerId && storageContainers.length > 0 && !initialContainerId) {
      const firstContainer = storageContainers[0];
      setSelectedContainerId(firstContainer.id);
      setSelectedContainerType(firstContainer.type as "tool" | "hotel");
    }
  }, [isOpen, selectedContainerId, storageContainers, initialContainerId]);

  const isSelectedContainerStatic = selectedContainerType === "hotel";

  const filteredNests = availableNests.filter((nest) => {
    if (selectedContainerId === "") return false;

    // Use tool_id for tools and hotel_id for hotels
    if (selectedContainerType === "tool") {
      return nest.tool_id === selectedContainerId;
    } else if (selectedContainerType === "hotel") {
      return nest.hotel_id === selectedContainerId;
    }
    return false;
  });

  const { borderColor, inputBg, selectedBg, sectionBg } = useCommonColors();
  const { secondary: textColor, primary: labelColor } = useTextColors();

  const handleContainerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    if (value === "") {
      setSelectedContainerId("");
      setSelectedContainerType("");
      return;
    }

    const [type, id] = value.split(":");
    setSelectedContainerId(Number(id));
    setSelectedContainerType(type as "tool" | "hotel");
    setNestSelections([]);

    // Disable tool command for hotels
    if (type === "hotel") {
      setTriggerToolCommand(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        errorToast("Invalid file type", "Please upload a CSV file");
        return;
      }
      setUploadedFile(file);
    }
  };

  const generateBarcode = (index?: number) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const baseBarcode = `PLT-${timestamp}-${random}`;
    return index !== undefined ? `${baseBarcode}-${index + 1}` : baseBarcode;
  };

  const handleNestSelection = (nestId: number) => {
    if (mode === "check-out") {
      setNestSelections([nestId]);
      // Find the plate residing in the selected nest
      const plateInNest = plates.find((p) => p.nest_id === nestId);
      if (plateInNest) {
        setPlateId(String(plateInNest.id));
      } else {
        // Clear plateId if the selected nest is empty or plate not found
        setPlateId("");
      }
    }
  };

  const handleCheckOut = async () => {
    if (!onCheckOut) return;

    try {
      setIsSubmitting(true);

      if (selectionMode === "manual") {
        // Use barcode for manual mode
        if (!barcode && (!selectedPlate || !selectedPlate.barcode)) {
          throw new Error("Please enter a barcode or select a plate");
        }

        await onCheckOut({
          barcode: barcode || selectedPlate?.barcode,
          triggerToolCommand:
            selectedContainerType === "tool" &&
            tools.find((t) => t.id === selectedContainerId)?.type?.toLowerCase() === "liconic" &&
            triggerToolCommand,
          isStatic: selectedContainerType === "hotel",
        });
      } else if (selectionMode === "nest") {
        // Use plateId for nest mode
        if (!plateId) {
          throw new Error("Please select a plate from a nest");
        }

        await onCheckOut({
          plateId: Number(plateId),
          triggerToolCommand:
            selectedContainerType === "tool" &&
            tools.find((t) => t.id === selectedContainerId)?.type?.toLowerCase() === "liconic" &&
            triggerToolCommand,
          isStatic: selectedContainerType === "hotel",
        });
      }

      // Reset state
      resetState();
      onClose();
    } catch (error) {
      errorToast("Error", error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetState = () => {
    // Reset shared state
    setSelectedContainerId("");
    setSelectedContainerType("");
    setNestSelections([]);
    setTriggerToolCommand(false);

    // Reset check-in specific state
    setManualBarcode("");
    setManualPlateName("");
    setManualPlateType("");
    setUploadedFile(null);
    setNumberOfPlates(1);
    setUseAutoBarcode(true);

    // Reset check-out specific state
    setBarcode("");
    setPlateId("");
    setSelectionMode("manual");
  };

  // Simplified InventoryModal - Replace the check-in related parts

  const renderCheckInContent = () => (
    <VStack spacing={4} align="stretch">
      {/* Plate Information Section */}
      <Box>
        <Text fontWeight="medium" mb={3} color={textColor}>
          Enter Plate Information
        </Text>
        <VStack spacing={4} bg={sectionBg} p={4} borderRadius="md" borderColor={borderColor}>
          <FormControl isRequired>
            <FormLabel color={labelColor}>Plate Name</FormLabel>
            <Input
              value={manualPlateName}
              onChange={(e) => setManualPlateName(e.target.value)}
              placeholder="Enter plate name"
              bg={inputBg}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel color={labelColor}>Barcode</FormLabel>
            <Input
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              placeholder="Enter plate barcode"
              bg={inputBg}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel color={labelColor}>Plate Type</FormLabel>
            <Select
              value={manualPlateType}
              onChange={(e) => setManualPlateType(e.target.value)}
              placeholder="Select plate type"
              bg={inputBg}>
              <option value="6 well">6 Well</option>
              <option value="24 well">24 Well</option>
              <option value="96 well">96 Well</option>
              <option value="384 well">384 Well</option>
            </Select>
          </FormControl>
        </VStack>
      </Box>

      {/* Nest Selection Section */}
      <Box>
        <Text fontWeight="medium" mb={3} color={textColor}>
          Select Nest Location
        </Text>
        <VStack spacing={4} bg={sectionBg} p={4} borderRadius="md" borderColor={borderColor}>
          <FormControl isRequired>
            <FormLabel color={labelColor}>Container</FormLabel>
            <Select
              value={
                selectedContainerId !== "" ? `${selectedContainerType}:${selectedContainerId}` : ""
              }
              onChange={handleContainerSelect}
              placeholder="Select tool or hotel"
              bg={inputBg}>
              {storageContainers.map((container) => (
                <option
                  key={`${container.type}:${container.id}`}
                  value={`${container.type}:${container.id}`}>
                  {container.name} ({container.type === "tool" ? "Tool" : "Hotel"})
                </option>
              ))}
            </Select>
          </FormControl>

          {selectedContainerId && (
            <FormControl isRequired>
              <FormLabel color={labelColor}>Select Nest</FormLabel>
              <Button
                leftIcon={<Icon as={Grid3x3} />}
                colorScheme="teal"
                variant="outline"
                size="md"
                width="100%"
                onClick={() => setIsNestModalOpen(true)}>
                {nestSelections.length > 0
                  ? `Selected: ${filteredNests.find((n) => n.id === nestSelections[0])?.name || "Unknown"}`
                  : "Open Inventory Grid"}
              </Button>
            </FormControl>
          )}

          {/* Tool Command Toggle - only for Liconic tools */}
          {selectedContainerType === "tool" &&
            tools.find((t) => t.id === selectedContainerId)?.type?.toLowerCase() === "liconic" && (
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="trigger-command" mb="0" color={labelColor}>
                  Trigger Physical Check-in
                </FormLabel>
                <Switch
                  id="trigger-command"
                  isChecked={triggerToolCommand}
                  onChange={(e) => setTriggerToolCommand(e.target.checked)}
                  colorScheme="teal"
                />
              </FormControl>
            )}
        </VStack>
      </Box>

      {/* Submit Button */}
      <Button
        colorScheme="teal"
        width="100%"
        onClick={handleCheckIn}
        isLoading={isSubmitting}
        loadingText="Checking In..."
        size="lg"
        mt={2}
        isDisabled={
          !manualPlateName || !manualBarcode || !manualPlateType || nestSelections.length === 0
        }>
        Check In Plate
      </Button>
    </VStack>
  );

  // Simplified handleCheckIn function
  const handleCheckIn = async () => {
    if (!onCheckIn) return;

    try {
      setIsSubmitting(true);

      // Validate inputs
      if (!manualPlateName || !manualBarcode || !manualPlateType) {
        throw new Error("Please fill in all plate information");
      }

      if (nestSelections.length === 0) {
        throw new Error("Please select a nest");
      }

      const nestId = nestSelections[0];

      // Create the plate data
      const plateData = {
        name: manualPlateName,
        barcode: manualBarcode,
        plateType: manualPlateType,
      };

      // Call the onCheckIn handler from parent
      await onCheckIn({
        nestId,
        plates: [plateData],
        triggerToolCommand:
          selectedContainerType === "tool" &&
          tools.find((t) => t.id === selectedContainerId)?.type?.toLowerCase() === "liconic" &&
          triggerToolCommand,
        isStatic: selectedContainerType === "hotel",
        containerId: Number(selectedContainerId),
        containerType: selectedContainerType,
      });

      // Reset form and close
      resetState();
      onClose();
    } catch (error) {
      errorToast("Error", error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCheckOutContent = () => (
    <VStack spacing={4} align="stretch">
      {/* Plate Selection Section */}
      <Box>
        <Text fontWeight="medium" mb={3} color={textColor}>
          1. Select Plate
        </Text>
        <Box bg={sectionBg} p={4} borderRadius="md">
          {selectedPlate ? (
            <VStack spacing={4}>
              <FormControl>
                <FormLabel color={labelColor}>Selected Plate</FormLabel>
                <Input value={selectedPlate?.name || ""} isReadOnly bg={inputBg} />
              </FormControl>
              <FormControl>
                <FormLabel color={labelColor}>Current Nest</FormLabel>
                <Input
                  value={
                    selectedPlate?.nest_id
                      ? availableNests.find((n) => n.id === selectedPlate.nest_id)?.name ||
                        selectedPlate.nest_id
                      : "Not checked in"
                  }
                  isReadOnly
                  bg={inputBg}
                />
              </FormControl>
              <FormControl>
                <FormLabel color={labelColor}>Status</FormLabel>
                <Badge
                  colorScheme={
                    selectedPlate?.status === "stored"
                      ? "green"
                      : selectedPlate?.status === "checked_out"
                        ? "blue"
                        : selectedPlate?.status === "completed"
                          ? "purple"
                          : "red"
                  }>
                  {selectedPlate?.status || "Unknown"}
                </Badge>
              </FormControl>
            </VStack>
          ) : (
            <Tabs isFitted variant="enclosed">
              <TabList mb="1em">
                <Tab
                  onClick={() => setSelectionMode("manual")}
                  _selected={{ bg: selectedBg, borderColor: borderColor }}>
                  Barcode Entry
                </Tab>
                <Tab
                  onClick={() => setSelectionMode("nest")}
                  _selected={{ bg: selectedBg, borderColor: borderColor }}>
                  Nest Selection
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel p={0}>
                  <FormControl isRequired>
                    <FormLabel color={labelColor}>Plate Barcode</FormLabel>
                    <Input
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder="Enter plate barcode"
                      bg={inputBg}
                    />
                  </FormControl>
                </TabPanel>
                <TabPanel p={0}>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel color={labelColor}>Select from Inventory</FormLabel>
                      <Button
                        leftIcon={<Icon as={Grid3x3} />}
                        colorScheme="teal"
                        variant="outline"
                        size="md"
                        onClick={() => setIsNestModalOpen(true)}>
                        Open Inventory
                      </Button>
                    </FormControl>
                    {nestSelections.length > 0 && (
                      <FormControl>
                        <FormLabel color={labelColor}>Selected Nest</FormLabel>
                        <Input
                          value={
                            nestSelections[0]
                              ? availableNests.find((n) => n.id === nestSelections[0])?.name ||
                                nestSelections[0]
                              : "None"
                          }
                          isReadOnly
                          bg={inputBg}
                        />
                      </FormControl>
                    )}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}
        </Box>
      </Box>

      {/* Submit Button */}
      <Button
        colorScheme="teal"
        width="100%"
        onClick={handleCheckOut}
        isLoading={isSubmitting}
        loadingText="Checking Out..."
        size="lg"
        mt={2}
        isDisabled={
          (selectionMode === "manual" && !barcode && (!selectedPlate || !selectedPlate.barcode)) ||
          (selectionMode === "nest" && !plateId && nestSelections.length === 0)
        }>
        Check Out
      </Button>
    </VStack>
  );

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader borderBottomWidth="1px" py={4}>
            <HStack spacing={3}>
              <Icon as={Package} boxSize={5} color="teal.500" />
              <Text>{mode === "check-in" ? "Check In Plate(s)" : "Check Out Plate"}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            {mode === "check-in" ? renderCheckInContent() : renderCheckOutContent()}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Nest Selection Modal */}
      {isNestModalOpen && (
        <NestModal
          isOpen={isNestModalOpen}
          onClose={() => setIsNestModalOpen(false)}
          toolName={
            selectedContainerType === "tool"
              ? tools.find((t) => t.id === selectedContainerId)?.name || ""
              : staticHotels.find((h) => h.id === selectedContainerId)?.name || ""
          }
          toolType={
            selectedContainerType === "tool"
              ? tools.find((t) => t.id === selectedContainerId)?.type
              : undefined
          }
          nests={filteredNests}
          plates={plates.filter((plate) =>
            availableNests.some((n) => {
              if (selectedContainerType === "tool") {
                return n.tool_id === selectedContainerId && plate.nest_id === n.id;
              } else if (selectedContainerType === "hotel") {
                return n.hotel_id === selectedContainerId && plate.nest_id === n.id;
              }
              return false;
            }),
          )}
          selectedNests={
            mode === "check-in"
              ? numberOfPlates === 1
                ? nestSelections.slice(0, 1)
                : nestSelections
              : nestSelections
          }
          isMultiSelect={mode === "check-in" && numberOfPlates > 1}
          maxSelections={mode === "check-in" ? numberOfPlates : undefined}
          onNestSelect={(nestIds) => {
            if (mode === "check-in") {
              setNestSelections(nestIds);
            } else if (mode === "check-out" && nestIds.length > 0) {
              handleNestSelection(nestIds[0]);
            }
          }}
          onTriggerToolCommandChange={(value) => setTriggerToolCommand(value)}
          onCreateNest={async () => {}}
          onDeleteNest={async () => {}}
          onPlateClick={onPlateClick}
          onCheckIn={
            mode === "check-in"
              ? (nestId, triggerCmd) => {
                  setNestSelections([nestId]);
                  setTriggerToolCommand(triggerCmd || false);
                }
              : undefined
          }
          containerType={selectedContainerType as "tool" | "hotel"}
          containerId={Number(selectedContainerId)}
        />
      )}
    </>
  );
};

export default InventoryModal;
