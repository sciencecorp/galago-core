import React, { useState, useRef } from "react";
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
  useToast,
  FormHelperText,
  HStack,
  IconButton,
  Box,
  Divider,
  useColorModeValue,
  Badge,
  Flex,
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
import { AttachmentIcon } from "@chakra-ui/icons";
import { BsBoxSeam, BsGrid3X3, BsLightningCharge } from "react-icons/bs";
import NestModal from "./NestModal";

type CheckInModalProps = {
  isOpen: boolean;
  onClose: () => void;
  tools: Tool[];
  availableNests: Nest[];
  selectedPlate: Plate | null;
  plates: Plate[];
  onSubmit: (params: {
    nestId: number;
    plates: Array<{ barcode: string; name: string; plate_type: string; status: PlateStatus }>;
    triggerToolCommand: boolean;
  }) => Promise<void>;
  onPlateClick?: (plate: Plate) => void;
};

const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  onClose,
  tools,
  availableNests,
  selectedPlate,
  plates,
  onSubmit,
  onPlateClick,
}) => {
  const [selectedToolId, setSelectedToolId] = useState<number | "">("");
  const [selectedNestIds, setSelectedNestIds] = useState<number[]>([]);
  const [manualBarcode, setManualBarcode] = useState("");
  const [manualPlateName, setManualPlateName] = useState("");
  const [manualPlateType, setManualPlateType] = useState("");
  const [useAutoBarcode, setUseAutoBarcode] = useState(false);
  const [triggerToolCommand, setTriggerToolCommand] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [nestSelectionMode, setNestSelectionMode] = useState<"automatic" | "manual">("automatic");
  const [isNestModalOpen, setIsNestModalOpen] = useState(false);
  const [numberOfPlates, setNumberOfPlates] = useState(1);
  const toast = useToast();

  const filteredNests = availableNests.filter((nest) =>
    selectedToolId ? nest.tool_id === selectedToolId : true,
  );
  console.log("Filtered Nests:", filteredNests);

  const bgColor = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const selectedBg = useColorModeValue("blue.50", "blue.900");
  const inputBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.200");
  const labelColor = useColorModeValue("gray.700", "gray.200");
  const sectionBg = useColorModeValue("gray.50", "whiteAlpha.50");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV file",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      setUploadedFile(file);
    }
  };

  const getNextAvailableNest = (): number | "" => {
    // Find nests that belong to the selected tool and are empty
    const availableEmptyNests = filteredNests.filter((nest) => {
      // Check if the nest has no plate assigned to it
      const hasPlate = plates.some((plate) => plate.nest_id === nest.id);
      return !hasPlate && nest.status === "empty";
    });
    console.log("availableEmptyNests", availableEmptyNests);

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

  const handleNestSelection = (nestId: number) => {
    setSelectedNestIds([nestId]);
    setIsNestModalOpen(false);
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

      let plates: Array<{
        barcode: string;
        name: string;
        plate_type: string;
        status: PlateStatus;
      }> = [];

      if (uploadedFile) {
        // Process CSV file
        const text = await uploadedFile.text();
        const rows = text.split("\n").slice(1); // Skip header row
        plates = rows.map((row) => {
          const [barcode, name, plate_type] = row.split(",").map((cell) => cell.trim());
          return { barcode, name, plate_type, status: "stored" as PlateStatus };
        });
      } else {
        if (!manualPlateName || !manualPlateType) {
          throw new Error("Please fill in plate name and type");
        }

        if (numberOfPlates > 1) {
          // Generate plates for batch entry
          plates = Array.from({ length: numberOfPlates }, (_, index) => ({
            barcode: manualBarcode || generateBarcode(index),
            name: `${manualPlateName}-${index + 1}`,
            plate_type: manualPlateType,
            status: "stored" as PlateStatus,
          }));
        } else {
          // Single plate entry
          plates = [
            {
              barcode: manualBarcode || generateBarcode(),
              name: manualPlateName,
              plate_type: manualPlateType,
              status: "stored" as PlateStatus,
            },
          ];
        }
      }

      await onSubmit({
        nestId: Number(targetNestId),
        plates,
        triggerToolCommand,
      });

      // Reset form
      setSelectedToolId("");
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
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
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
              {/* Tool Selection and Additional Options Section */}
              <HStack spacing={4} align="start">
                <Box flex="2">
                  <Text fontWeight="medium" mb={3} color={textColor}>
                    1. Select Tool
                  </Text>
                  <Box bg={sectionBg} p={4} borderRadius="md">
                    <FormControl isRequired>
                      <FormLabel color={labelColor}>Tool</FormLabel>
                      <Select
                        placeholder="Select tool"
                        value={selectedToolId}
                        onChange={(e) => {
                          setSelectedToolId(Number(e.target.value));
                          setSelectedNestIds([]);
                        }}
                        bg={inputBg}>
                        {tools.map((tool) => (
                          <option key={tool.id} value={tool.id}>
                            {tool.name}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                <Box flex="1">
                  <Text fontWeight="medium" mb={3} color={textColor}>
                    Options
                  </Text>
                  <Box bg={sectionBg} p={4} borderRadius="md" h="100%">
                    <FormControl display="flex" alignItems="center" justifyContent="space-between">
                      <HStack spacing={2}>
                        <Icon as={BsLightningCharge} color="orange.400" />
                        <FormLabel mb="0" color={labelColor}>
                          Tool Command
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
                    {(uploadedFile !== null || numberOfPlates > 1) && triggerToolCommand && (
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
                              icon={<AttachmentIcon />}
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
                        isDisabled={!selectedToolId}
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
                  !selectedToolId ||
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
          {console.log("Selected Tool ID:", selectedToolId)}
          {console.log("Filtered Nests:", filteredNests)}
          {console.log("Available Nests:", availableNests)}
          {console.log("Plates:", plates)}
          <NestModal
            isOpen={isNestModalOpen}
            onClose={() => setIsNestModalOpen(false)}
            toolName={tools.find((t) => t.id === selectedToolId)?.name || ""}
            nests={filteredNests}
            plates={plates.filter((plate) =>
              availableNests.some(
                (n) => (!selectedToolId || n.tool_id === selectedToolId) && plate.nest_id === n.id,
              ),
            )}
            selectedNests={numberOfPlates === 1 ? selectedNestIds.slice(0, 1) : selectedNestIds}
            isMultiSelect={numberOfPlates > 1}
            maxSelections={numberOfPlates}
            onNestSelect={(nestIds) => {
              console.log("Nests selected:", nestIds);
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
