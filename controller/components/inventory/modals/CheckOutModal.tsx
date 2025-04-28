import { useState } from "react";
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
  Switch,
  Text,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  HStack,
  Box,
  Select,
  Badge,
  Icon,
  useColorModeValue,
  Radio,
  RadioGroup,
  Divider,
  FormHelperText,
} from "@chakra-ui/react";
import { Nest, Plate, Tool } from "@/types/api";
import { BsBoxSeam, BsGrid3X3, BsLightningCharge } from "react-icons/bs";
import NestModal from "./NestModal";
import { errorToast } from "@/components/ui/Toast";
import { useCommonColors, useTextColors } from "@/components/ui/Theme";

type StorageContainer = Tool | { id: number; name: string; type: string };

type CheckOutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedPlate: Plate | null;
  tools: Tool[];
  staticHotels?: Array<{ id: number; name: string }>;
  availableNests: Nest[];
  plates: Plate[];
  onSubmit: (params: {
    plateId?: number;
    barcode?: string;
    triggerToolCommand: boolean;
    isStatic?: boolean;
  }) => Promise<void>;
  onPlateClick?: (plate: Plate) => void;
};

const CheckOutModal: React.FC<CheckOutModalProps> = ({
  isOpen,
  onClose,
  selectedPlate,
  tools,
  staticHotels = [],
  availableNests,
  plates,
  onSubmit,
  onPlateClick,
}) => {
  const [selectedContainerId, setSelectedContainerId] = useState<number | "">("");
  const [selectedContainerType, setSelectedContainerType] = useState<"tool" | "hotel" | "">("");
  const [barcode, setBarcode] = useState("");
  const [plateId, setPlateId] = useState("");
  const [triggerToolCommand, setTriggerToolCommand] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectionMode, setSelectionMode] = useState<"manual" | "nest">("manual");
  const [isNestModalOpen, setIsNestModalOpen] = useState(false);
  const [selectedNestId, setSelectedNestId] = useState<number | null>(null);
  const { borderColor, inputBg, selectedBg, sectionBg } = useCommonColors();
  const { secondary: textColor, primary: labelColor } = useTextColors();

  const isSelectedContainerStatic = selectedContainerType === "hotel";

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

  const handleContainerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    if (value === "") {
      setSelectedContainerId("");
      setSelectedContainerType("");
      setSelectedNestId(null);
      return;
    }

    const [type, id] = value.split(":");
    setSelectedContainerId(Number(id));
    setSelectedContainerType(type as "tool" | "hotel");
    setSelectedNestId(null);

    // Disable tool command for hotels
    if (type === "hotel") {
      setTriggerToolCommand(false);
    }
  };

  const handleNestSelection = (nestId: number) => {
    setSelectedNestId(nestId);
    // Find the plate residing in the selected nest using the plates prop
    const plateInNest = plates.find((p) => p.nest_id === nestId);
    if (plateInNest) {
      setPlateId(String(plateInNest.id));
    } else {
      // Clear plateId if the selected nest is empty or plate not found
      setPlateId("");
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (selectionMode === "manual") {
        // Use barcode for manual mode
        if (!barcode && (!selectedPlate || !selectedPlate.barcode)) {
          throw new Error("Please enter a barcode or select a plate");
        }

        await onSubmit({
          barcode: barcode || selectedPlate?.barcode,
          triggerToolCommand: !isSelectedContainerStatic && triggerToolCommand,
          isStatic: isSelectedContainerStatic,
        });
      } else if (selectionMode === "nest") {
        // Use plateId for nest mode
        if (!plateId) {
          throw new Error("Please select a plate from a nest");
        }

        await onSubmit({
          plateId: Number(plateId),
          triggerToolCommand: !isSelectedContainerStatic && triggerToolCommand,
          isStatic: isSelectedContainerStatic,
        });
      }

      // Reset state
      setBarcode("");
      setPlateId("");
      setSelectedContainerId("");
      setSelectedContainerType("");
      setSelectedNestId(null);
      setTriggerToolCommand(false);
      onClose();
    } catch (error) {
      console.error("Error checking out plate:", error);
      errorToast("Error", error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader borderBottomWidth="1px" py={4}>
            <HStack spacing={3}>
              <Icon as={BsBoxSeam} boxSize={5} color="teal.500" />
              <Text>Check Out Plate</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={4} align="stretch">
              {/* Storage Selection and Options Section */}
              <HStack spacing={4} align="start">
                <Box flex="2">
                  <Text fontWeight="medium" mb={3} color={textColor}>
                    1. Select Storage
                  </Text>
                  <Box bg={sectionBg} p={4} borderRadius="md">
                    <FormControl isRequired>
                      <FormLabel color={labelColor}>Storage Location</FormLabel>
                      <Select
                        placeholder="Select storage location"
                        value={
                          selectedContainerType && selectedContainerId
                            ? `${selectedContainerType}:${selectedContainerId}`
                            : ""
                        }
                        onChange={handleContainerSelect}
                        bg={inputBg}>
                        {tools
                          .filter((tool) => tool.type.toLowerCase() === "liconic")
                          .map((tool) => (
                            <option key={`tool:${tool.id}`} value={`tool:${tool.id}`}>
                              {tool.name} (Automated Storage)
                            </option>
                          ))}
                        {staticHotels && staticHotels.length > 0 && (
                          <>
                            {staticHotels.map((hotel) => (
                              <option key={`hotel:${hotel.id}`} value={`hotel:${hotel.id}`}>
                                {hotel.name} (Hotel)
                              </option>
                            ))}
                          </>
                        )}
                      </Select>
                      {(!staticHotels || staticHotels.length === 0) && (
                        <FormHelperText color="orange.300">
                          No static hotels available. Create hotels to see them here.
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Box>
                </Box>

                {/* Options Section */}
                <Box flex="1">
                  <Text fontWeight="medium" mb={3} color={textColor}>
                    Options
                  </Text>
                  <Box
                    bg={sectionBg}
                    p={4}
                    borderRadius="md"
                    minHeight="100px"
                    display="flex"
                    flexDirection="column"
                    justifyContent="center">
                    {!isSelectedContainerStatic ? (
                      <FormControl
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between">
                        <HStack spacing={2}>
                          <Icon as={BsLightningCharge} color="orange.400" />
                          <FormLabel mb="0" color={labelColor}>
                            Trigger Tool Command
                          </FormLabel>
                        </HStack>
                        <Switch
                          isChecked={triggerToolCommand}
                          onChange={(e) => setTriggerToolCommand(e.target.checked)}
                          colorScheme="teal"
                          size="md"
                        />
                      </FormControl>
                    ) : (
                      <Text fontSize="sm" color={textColor}>
                        No additional options available for static storage.
                      </Text>
                    )}
                  </Box>
                </Box>
              </HStack>

              {/* Plate Selection Section */}
              <Box>
                <Text fontWeight="medium" mb={3} color={textColor}>
                  2. Select Plate
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
                          value={selectedPlate?.nest_id || "Not checked in"}
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
                              : selectedPlate?.status === "in_use"
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
                                leftIcon={<Icon as={BsGrid3X3} />}
                                isDisabled={!selectedContainerId}
                                colorScheme="teal"
                                variant="outline"
                                size="md"
                                onClick={() => setIsNestModalOpen(true)}>
                                Open Inventory
                              </Button>
                            </FormControl>
                            {selectedNestId && (
                              <FormControl>
                                <FormLabel color={labelColor}>Selected Nest</FormLabel>
                                <Input value={selectedNestId || "None"} isReadOnly bg={inputBg} />
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
                onClick={handleSubmit}
                isLoading={isSubmitting}
                loadingText="Checking Out..."
                isDisabled={
                  !selectedContainerId ||
                  (selectionMode === "manual" &&
                    !barcode &&
                    (!selectedPlate || !selectedPlate.barcode)) ||
                  (selectionMode === "nest" && !plateId)
                }>
                Check Out
              </Button>
            </VStack>
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
          selectedNests={selectedNestId ? [selectedNestId] : []}
          isMultiSelect={false}
          onNestSelect={(nestIds) => {
            if (nestIds.length > 0) {
              handleNestSelection(nestIds[0]);
            }
          }}
          onCreateNest={async () => {}}
          onDeleteNest={async () => {}}
          onPlateClick={onPlateClick}
        />
      )}
    </>
  );
};

export default CheckOutModal;
