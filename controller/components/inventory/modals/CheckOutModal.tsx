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
  useToast,
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
} from "@chakra-ui/react";
import { Nest, Plate, Tool } from "@/types/api";
import { BsBoxSeam, BsGrid3X3, BsLightningCharge } from "react-icons/bs";
import NestModal from "./NestModal";
import { errorToast } from "@/components/ui/Toast";
import { useCommonColors, useTextColors } from "@/components/ui/Theme";

type CheckOutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedPlate: Plate | null;
  tools: Tool[];
  availableNests: Nest[];
  plates: Plate[];
  onSubmit: (params: {
    plateId?: number;
    barcode?: string;
    triggerToolCommand: boolean;
  }) => Promise<void>;
  onPlateClick?: (plate: Plate) => void;
};

const CheckOutModal: React.FC<CheckOutModalProps> = ({
  isOpen,
  onClose,
  selectedPlate,
  tools,
  availableNests,
  plates,
  onSubmit,
  onPlateClick,
}) => {
  const [selectedToolId, setSelectedToolId] = useState<number | "">("");
  const [barcode, setBarcode] = useState("");
  const [plateId, setPlateId] = useState("");
  const [triggerToolCommand, setTriggerToolCommand] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectionMode, setSelectionMode] = useState<"manual" | "nest">("manual");
  const [isNestModalOpen, setIsNestModalOpen] = useState(false);
  const [selectedNestId, setSelectedNestId] = useState<number | null>(null);
  const toast = useToast();

  const { borderColor, inputBg, selectedBg, sectionBg } = useCommonColors();
  const { secondary: textColor, primary: labelColor } = useTextColors();

  const filteredNests = availableNests.filter((nest) =>
    selectedToolId ? nest.tool_id === selectedToolId : true,
  );

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

      // Check if we have identified a plate either by pre-selection, barcode, or ID (from manual or nest selection)
      const isPlateIdentified =
        selectedPlate?.id || barcode || (plateId && !isNaN(Number(plateId)));
      if (!isPlateIdentified) {
        // Refined error message
        throw new Error("Please select a plate via barcode, ID, or nest selection.");
      }

      await onSubmit({
        plateId: selectedPlate?.id || (plateId ? Number(plateId) : undefined),
        barcode: barcode || undefined,
        triggerToolCommand,
      });

      // Reset form
      setBarcode("");
      setPlateId("");
      setTriggerToolCommand(false);
      setSelectedToolId("");
      setSelectedNestId(null);
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
              <Text>Check Out Plate</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={4} align="stretch">
              {/* Tool Selection and Options Section */}
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
                          setSelectedNestId(null);
                        }}
                        bg={inputBg}>
                        {tools
                          .filter((tool) => tool.type.toLowerCase() === "liconic")
                          .map((tool) => (
                            <option key={tool.id} value={tool.id}>
                              {tool.name}
                            </option>
                          ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                {/* Options Section */}
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
                        colorScheme="teal"
                        size="md"
                      />
                    </FormControl>
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
                    <>
                      <FormControl mb={4}>
                        <FormLabel color={labelColor}>Selection Mode</FormLabel>
                        <RadioGroup
                          value={selectionMode}
                          onChange={(value: "manual" | "nest") => setSelectionMode(value)}>
                          <VStack align="start" spacing={2}>
                            <Radio value="manual">
                              <HStack>
                                <Text>Manual Entry</Text>
                                <Badge colorScheme="blue">ID/Barcode</Badge>
                              </HStack>
                            </Radio>
                            <Radio value="nest">
                              <HStack>
                                <Text>From Nest</Text>
                                <Badge colorScheme="green">Visual Selection</Badge>
                              </HStack>
                            </Radio>
                          </VStack>
                        </RadioGroup>
                      </FormControl>

                      {selectionMode === "manual" ? (
                        <Tabs isFitted variant="enclosed" borderColor={borderColor}>
                          <TabList mb="1em">
                            <Tab
                              _selected={{ bg: selectedBg, borderColor: borderColor }}
                              color={textColor}>
                              By Barcode
                            </Tab>
                            <Tab
                              _selected={{ bg: selectedBg, borderColor: borderColor }}
                              color={textColor}>
                              By Plate ID
                            </Tab>
                          </TabList>
                          <TabPanels>
                            <TabPanel p={0}>
                              <FormControl isRequired>
                                <FormLabel color={labelColor}>Barcode</FormLabel>
                                <Input
                                  value={barcode}
                                  onChange={(e) => setBarcode(e.target.value)}
                                  placeholder="Enter plate barcode"
                                  bg={inputBg}
                                />
                              </FormControl>
                            </TabPanel>
                            <TabPanel p={0}>
                              <FormControl isRequired>
                                <FormLabel color={labelColor}>Plate ID</FormLabel>
                                <Input
                                  value={plateId}
                                  onChange={(e) => setPlateId(e.target.value)}
                                  placeholder="Enter plate ID"
                                  type="number"
                                  bg={inputBg}
                                />
                              </FormControl>
                            </TabPanel>
                          </TabPanels>
                        </Tabs>
                      ) : (
                        <Button
                          onClick={() => setIsNestModalOpen(true)}
                          colorScheme="teal"
                          variant="outline"
                          isDisabled={!selectedToolId}
                          leftIcon={<Icon as={BsGrid3X3} />}
                          width="100%">
                          Open Nest Selection Grid
                        </Button>
                      )}
                    </>
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
                size="lg"
                isDisabled={
                  !selectedToolId || (!selectedPlate && !barcode && !plateId && !selectedNestId)
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
          toolName={tools.find((t) => t.id === selectedToolId)?.name || ""}
          nests={filteredNests}
          plates={plates.filter((plate) => filteredNests.some((n) => plate.nest_id === n.id))}
          selectedNests={selectedNestId ? [selectedNestId] : []}
          isMultiSelect={false}
          onNestSelect={(nestIds) => handleNestSelection(nestIds[0])}
          onCreateNest={async () => {}}
          onDeleteNest={async () => {}}
          onPlateClick={onPlateClick}
        />
      )}
    </>
  );
};

export default CheckOutModal;
