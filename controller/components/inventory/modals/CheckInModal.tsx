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
  FormHelperText,
  HStack,
  IconButton,
  Box,
  Divider,
  Badge,
  Icon,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Radio,
  RadioGroup,
} from "@chakra-ui/react";
import { Nest, Plate, Tool, PlateStatus } from "@/types/api";
import { BsBoxSeam, BsGrid3X3, BsLightningCharge } from "react-icons/bs";
import NestModal from "./NestModal";
import { FileAddIcon } from "@/components/ui/Icons";
import { errorToast } from "@/components/ui/Toast";
import { useCommonColors, useTextColors } from "@/components/ui/Theme";

type StorageContainer = Tool | { id: number; name: string; type: string };

type CheckInModalProps = {
  isOpen: boolean;
  onClose: () => void;
  tools: Tool[];
  staticHotels?: Array<{ id: number; name: string }>;
  availableNests: Nest[];
  selectedPlate: Plate | null;
  plates: Plate[];
  onSubmit: (params: {
    nestId: number;
    plates: Array<{ barcode: string; name: string; plate_type: string; status: PlateStatus }>;
    triggerToolCommand: boolean;
    isStatic?: boolean;
  }) => Promise<void>;
  onPlateClick?: (plate: Plate) => void;
};

const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  onClose,
  tools,
  staticHotels = [],
  availableNests,
  selectedPlate,
  plates,
  onSubmit,
  onPlateClick,
}) => {
  const [selectedContainerId, setSelectedContainerId] = useState<number | "">("");
  const [selectedContainerType, setSelectedContainerType] = useState<"tool" | "hotel" | "">("");
  const [selectedNestIds, setSelectedNestIds] = useState<number[]>([]);
  const [manualBarcode, setManualBarcode] = useState("");
  const [manualPlateName, setManualPlateName] = useState("");
  const [manualPlateType, setManualPlateType] = useState("");
  const [useAutoBarcode, setUseAutoBarcode] = useState(true);
  const [triggerToolCommand, setTriggerToolCommand] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [nestSelectionMode, setNestSelectionMode] = useState<"automatic" | "manual">("automatic");
  const [isNestModalOpen, setIsNestModalOpen] = useState(false);
  const [numberOfPlates, setNumberOfPlates] = useState(1);

  // Log the tools and hotels for debugging
  useEffect(() => {}, [tools, staticHotels]);

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
    setSelectedNestIds([]);

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

  const getNextAvailableNest = (): number | "" => {
    // Find nests that belong to the selected container and are empty
    const availableEmptyNests = filteredNests.filter((nest) => {
      // Check if the nest has no plate assigned to it
      const hasPlate = plates.some((plate) => "nest_id" in plate && plate.nest_id === nest.id);
      return !hasPlate && nest.status === "empty";
    });

    if (availableEmptyNests.length > 0) {
      // Sort by row and column to get the first available nest in reading order
      const sortedNests = [...availableEmptyNests].sort((a, b) => {
        if (a.row === b.row) {
          return a.column - b.column;
        }
        return a.row - b.row;
      });
      return sortedNests[0].id;
    }
    return "";
  };

  const generateBarcode = (index?: number) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const baseBarcode = `PLT-${timestamp}-${random}`;
    return index !== undefined ? `${baseBarcode}-${index + 1}` : baseBarcode;
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // For batch check-in with multiple plates
      if (numberOfPlates > 1 || uploadedFile) {
        // Prepare plates to check in
        let platesToCheckIn: Array<{
          barcode: string;
          name: string;
          plate_type: string;
          status: PlateStatus;
        }> = [];

        if (uploadedFile) {
          // Process CSV file
          const text = await uploadedFile.text();
          const rows = text
            .split("\n")
            .slice(1)
            .filter((row) => row.trim()); // Skip header row
          platesToCheckIn = rows.map((row) => {
            const [barcode, name, plate_type] = row.split(",").map((cell) => cell.trim());
            return { barcode, name, plate_type, status: "stored" as PlateStatus };
          });
        } else {
          if (!manualPlateName || !manualPlateType) {
            throw new Error("Please fill in plate name and type");
          }

          // Generate plates for batch entry with unique names
          platesToCheckIn = Array.from({ length: numberOfPlates }, (_, index) => ({
            barcode: manualBarcode ? `${manualBarcode}-${index + 1}` : generateBarcode(index),
            name: `${manualPlateName}-${index + 1}`,
            plate_type: manualPlateType,
            status: "stored" as PlateStatus,
          }));
        }

        // Validate selection mode
        if (nestSelectionMode === "automatic") {
          // Find enough empty nests
          const availableEmptyNests = filteredNests.filter((nest) => {
            // Check if the nest has no plate assigned to it
            const hasPlate = plates.some(
              (plate) => "nest_id" in plate && plate.nest_id === nest.id,
            );
            return !hasPlate && nest.status === "empty";
          });

          // Sort by row and column to get them in reading order
          const sortedEmptyNests = [...availableEmptyNests].sort((a, b) => {
            if (a.row === b.row) {
              return a.column - b.column;
            }
            return a.row - b.row;
          });

          // Check if we have enough empty nests
          const platesCount = platesToCheckIn.length;

          if (sortedEmptyNests.length < platesCount) {
            throw new Error(
              `Not enough empty nests available. Need ${platesCount} but only found ${sortedEmptyNests.length}.`,
            );
          }

          // Check in each plate to its own nest
          for (let i = 0; i < platesToCheckIn.length; i++) {
            if (i < sortedEmptyNests.length) {
              const nestId = sortedEmptyNests[i].id;
              const plateData = platesToCheckIn[i];

              // Submit one plate at a time
              await onSubmit({
                nestId: Number(nestId),
                plates: [plateData],
                triggerToolCommand: false, // Never trigger commands for batch operations
                isStatic: isSelectedContainerStatic,
              });
            }
          }

          // Success, now close and reset
          setSelectedContainerId("");
          setSelectedContainerType("");
          setSelectedNestIds([]);
          setManualBarcode("");
          setManualPlateName("");
          setManualPlateType("");
          setUploadedFile(null);
          setTriggerToolCommand(false);
          setNumberOfPlates(1);
          setUseAutoBarcode(false);
          onClose();
          return;
        } else if (nestSelectionMode === "manual" && selectedNestIds.length < numberOfPlates) {
          // For manual selection, we need enough nests selected
          throw new Error(
            `Not enough nests selected. Need ${numberOfPlates} but only selected ${selectedNestIds.length}.`,
          );
        } else if (
          nestSelectionMode === "manual" &&
          selectedNestIds.length >= platesToCheckIn.length
        ) {
          // For manual nest selection with multiple plates, we need to submit them one by one
          for (let i = 0; i < platesToCheckIn.length; i++) {
            await onSubmit({
              nestId: Number(selectedNestIds[i]),
              plates: [platesToCheckIn[i]],
              triggerToolCommand: false, // Never trigger commands for batch operations
              isStatic: isSelectedContainerStatic,
            });
          }

          // Reset form after all submissions
          setSelectedContainerId("");
          setSelectedContainerType("");
          setSelectedNestIds([]);
          setManualBarcode("");
          setManualPlateName("");
          setManualPlateType("");
          setUploadedFile(null);
          setTriggerToolCommand(false);
          setNumberOfPlates(1);
          setUseAutoBarcode(false);
          onClose();
          return;
        }
      }

      // Regular processing for single plate
      let targetNestId = selectedNestIds[0];
      if (nestSelectionMode === "automatic") {
        const nextNest = getNextAvailableNest();
        if (nextNest === "") {
          throw new Error(
            "No empty nests available. Please select a nest manually or create new nests.",
          );
        }
        targetNestId = nextNest;
      }

      if (!targetNestId) {
        throw new Error("Please select a nest");
      }

      // Create single plate
      if (!manualPlateName || !manualPlateType) {
        throw new Error("Please fill in plate name and type");
      }

      const singlePlate = {
        barcode: manualBarcode || generateBarcode(),
        name: manualPlateName,
        plate_type: manualPlateType,
        status: "stored" as PlateStatus,
      };

      // Submit for single plate
      await onSubmit({
        nestId: Number(targetNestId),
        plates: [singlePlate],
        triggerToolCommand: !isSelectedContainerStatic && triggerToolCommand,
        isStatic: isSelectedContainerStatic,
      });

      // Reset form
      setSelectedContainerId("");
      setSelectedContainerType("");
      setSelectedNestIds([]);
      setManualBarcode("");
      setManualPlateName("");
      setManualPlateType("");
      setUploadedFile(null);
      setTriggerToolCommand(false);
      setNumberOfPlates(1);
      setUseAutoBarcode(false);
      onClose();
    } catch (error) {
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
              <Text>Check In Plate(s)</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={4} align="stretch">
              {/* Storage Selection and Additional Options Section */}
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
                          isDisabled={uploadedFile !== null || numberOfPlates > 1}
                          colorScheme="teal"
                          size="md"
                        />
                      </FormControl>
                    ) : (
                      <Text fontSize="sm" color={textColor}>
                        No additional options available for static storage.
                      </Text>
                    )}
                    {!isSelectedContainerStatic && uploadedFile !== null && triggerToolCommand && (
                      <Text
                        color="orange.300"
                        fontSize="sm"
                        mt={2}
                        display="flex"
                        alignItems="center">
                        <Icon as={BsLightningCharge} mr={1} /> Only for single plate
                      </Text>
                    )}
                  </Box>
                </Box>
              </HStack>

              {/* Plate Information Section */}
              <Box>
                <Text fontWeight="medium" mb={3} color={textColor}>
                  2. Enter Plate Information
                </Text>
                <Tabs
                  isFitted
                  variant="enclosed"
                  bg={sectionBg}
                  p={4}
                  borderRadius="md"
                  borderColor={borderColor}>
                  <TabList mb="1em">
                    <Tab _selected={{ bg: selectedBg, borderColor: borderColor }} color={textColor}>
                      <HStack>
                        <Text>Single Entry</Text>
                        <Badge colorScheme="blue">1 Plate</Badge>
                      </HStack>
                    </Tab>
                    <Tab _selected={{ bg: selectedBg, borderColor: borderColor }} color={textColor}>
                      <HStack>
                        <Text>Batch Entry</Text>
                        <Badge colorScheme="purple">Multiple</Badge>
                      </HStack>
                    </Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel p={0}>
                      <HStack spacing={4} align="start">
                        <VStack spacing={4} flex="1">
                          <FormControl isRequired>
                            <HStack justify="space-between" align="center" mb={2}>
                              <FormLabel color={labelColor} mb={0}>
                                Barcode
                              </FormLabel>
                              <HStack spacing={2} align="center">
                                <Text fontSize="sm" color={textColor}>
                                  Auto
                                </Text>
                                <Switch
                                  id="auto-barcode"
                                  isChecked={useAutoBarcode}
                                  onChange={(e) => {
                                    setUseAutoBarcode(e.target.checked);
                                    if (e.target.checked) {
                                      setManualBarcode("");
                                    }
                                  }}
                                  colorScheme="teal"
                                  size="sm"
                                />
                              </HStack>
                            </HStack>
                            <Input
                              value={manualBarcode}
                              onChange={(e) => setManualBarcode(e.target.value)}
                              placeholder={
                                useAutoBarcode ? "Will be auto-generated" : "Enter plate barcode"
                              }
                              bg={inputBg}
                              isDisabled={useAutoBarcode}
                            />
                            <FormHelperText color={textColor}>
                              {useAutoBarcode ? "Auto-generate barcode" : "Enter barcode manually"}
                            </FormHelperText>
                          </FormControl>
                          <FormControl isRequired>
                            <FormLabel color={labelColor}>Plate Name</FormLabel>
                            <Input
                              value={manualPlateName}
                              onChange={(e) => setManualPlateName(e.target.value)}
                              placeholder="Enter plate name"
                              bg={inputBg}
                            />
                          </FormControl>
                        </VStack>
                        <FormControl isRequired flex="1">
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
                      </HStack>
                    </TabPanel>
                    <TabPanel p={0}>
                      <VStack spacing={4}>
                        <HStack spacing={4} width="100%">
                          <FormControl isRequired flex="1">
                            <FormLabel color={labelColor}>Number of Plates</FormLabel>
                            <NumberInput
                              min={1}
                              value={numberOfPlates}
                              onChange={(_, value) => setNumberOfPlates(value)}
                              bg={inputBg}>
                              <NumberInputField />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                          </FormControl>
                          <FormControl isRequired flex="2">
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
                        </HStack>

                        <HStack spacing={4} width="100%">
                          <FormControl isRequired flex="1">
                            <HStack justify="space-between" align="center" mb={2}>
                              <FormLabel color={labelColor} mb={0}>
                                Base Barcode
                              </FormLabel>
                              <HStack spacing={2} align="center">
                                <Text fontSize="sm" color={textColor}>
                                  Auto
                                </Text>
                                <Switch
                                  id="auto-barcode-batch"
                                  isChecked={useAutoBarcode}
                                  onChange={(e) => {
                                    setUseAutoBarcode(e.target.checked);
                                    if (e.target.checked) {
                                      setManualBarcode("");
                                    }
                                  }}
                                  colorScheme="teal"
                                  size="sm"
                                />
                              </HStack>
                            </HStack>
                            <Input
                              value={manualBarcode}
                              onChange={(e) => setManualBarcode(e.target.value)}
                              placeholder={
                                useAutoBarcode
                                  ? "Will be auto-generated"
                                  : "Will be suffixed (-1, -2, etc.)"
                              }
                              bg={inputBg}
                              isDisabled={useAutoBarcode}
                            />
                            <FormHelperText color={textColor}>
                              {useAutoBarcode
                                ? "Auto-generate barcodes"
                                : "Enter base barcode manually"}
                            </FormHelperText>
                          </FormControl>
                          <FormControl isRequired flex="1">
                            <FormLabel color={labelColor}>Base Plate Name</FormLabel>
                            <Input
                              value={manualPlateName}
                              onChange={(e) => setManualPlateName(e.target.value)}
                              placeholder="Will be suffixed (-1, -2, etc.)"
                              bg={inputBg}
                            />
                          </FormControl>
                        </HStack>

                        <Divider />

                        <FormControl>
                          <FormLabel color={labelColor}>Or Upload CSV File</FormLabel>
                          <HStack width="100%">
                            <Input
                              type="text"
                              readOnly
                              value={uploadedFile?.name || ""}
                              placeholder="No file selected"
                              bg={inputBg}
                            />
                            <IconButton
                              aria-label="Upload file"
                              icon={<FileAddIcon />}
                              onClick={() => fileInputRef.current?.click()}
                              colorScheme="teal"
                            />
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileUpload}
                              style={{ display: "none" }}
                              accept=".csv"
                            />
                          </HStack>
                          <FormHelperText color={textColor}>
                            CSV format: barcode,name,plate_type
                          </FormHelperText>
                        </FormControl>
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>

              {/* Nest Selection Section */}
              <Box>
                <Text fontWeight="medium" mb={3} color={textColor}>
                  3. Select Nest Location
                </Text>
                <Box bg={sectionBg} p={4} borderRadius="md">
                  <HStack spacing={8} align="start">
                    <FormControl flex="1">
                      <FormLabel color={labelColor}>Selection Mode</FormLabel>
                      <RadioGroup
                        value={nestSelectionMode}
                        onChange={(value: "automatic" | "manual") => setNestSelectionMode(value)}>
                        <VStack align="start" spacing={2}>
                          <Radio value="automatic">
                            <HStack>
                              <Text>Automatic</Text>
                              <Badge colorScheme="green">Next Available</Badge>
                            </HStack>
                          </Radio>
                          <Radio value="manual">
                            <HStack>
                              <Text>Manual</Text>
                              <Badge colorScheme="blue">Select Location</Badge>
                            </HStack>
                          </Radio>
                        </VStack>
                      </RadioGroup>
                    </FormControl>

                    {nestSelectionMode === "manual" && (
                      <Button
                        onClick={() => setIsNestModalOpen(true)}
                        colorScheme="teal"
                        variant="outline"
                        isDisabled={!selectedContainerId}
                        leftIcon={<Icon as={BsGrid3X3} />}
                        height="40px"
                        flex="1">
                        Open Inventory
                      </Button>
                    )}
                  </HStack>
                </Box>
              </Box>

              {/* Submit Button */}
              <Button
                colorScheme="teal"
                width="100%"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                loadingText="Checking In..."
                size="lg"
                mt={2}
                isDisabled={
                  !selectedContainerId ||
                  (nestSelectionMode === "manual" && selectedNestIds.length === 0) ||
                  (!uploadedFile &&
                    ((!useAutoBarcode && !manualBarcode) || !manualPlateName || !manualPlateType))
                }>
                Check In
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Nest Selection Modal */}
      {isNestModalOpen && (
        <>
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
            selectedNests={numberOfPlates === 1 ? selectedNestIds.slice(0, 1) : selectedNestIds}
            isMultiSelect={numberOfPlates > 1}
            maxSelections={numberOfPlates}
            onNestSelect={(nestIds) => {
              const newSelectedNests = numberOfPlates === 1 ? nestIds.slice(0, 1) : nestIds;
              setSelectedNestIds(newSelectedNests);
            }}
            onCreateNest={async () => {}}
            onDeleteNest={async () => {}}
            onPlateClick={onPlateClick}
          />
        </>
      )}
    </>
  );
};

export default CheckInModal;
