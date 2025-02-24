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

  const bgColor = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const selectedBg = useColorModeValue("blue.50", "blue.900");
  const inputBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.200");
  const labelColor = useColorModeValue("gray.700", "gray.200");
  const sectionBg = useColorModeValue("gray.50", "whiteAlpha.50");

  const filteredNests = availableNests.filter(nest => 
    selectedToolId ? nest.tool_id === selectedToolId : true
  );

  const handleNestSelection = (nestId: number) => {
    setSelectedNestId(nestId);
    setIsNestModalOpen(false);
    // Find the plate in the selected nest
    const nest = availableNests.find(n => n.id === nestId);
    if (nest && nest.current_plate_id) {
      setPlateId(String(nest.current_plate_id));
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (!selectedPlate && !barcode && !plateId) {
        throw new Error("Please provide a plate barcode or ID");
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
                        {tools.map((tool) => (
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
                        <Badge colorScheme={
                          selectedPlate?.status === 'stored' ? 'green' :
                          selectedPlate?.status === 'in_use' ? 'blue' :
                          selectedPlate?.status === 'completed' ? 'purple' :
                          'red'
                        }>
                          {selectedPlate?.status || 'Unknown'}
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
                  !selectedToolId ||
                  (!selectedPlate && !barcode && !plateId && !selectedNestId)
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
          toolName={tools.find(t => t.id === selectedToolId)?.name || ""}
          nests={filteredNests}
          plates={plates.filter(plate => 
            filteredNests.some(n => plate.nest_id === n.id)
          )}
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
