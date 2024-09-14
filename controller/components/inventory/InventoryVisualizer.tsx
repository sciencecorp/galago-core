import React, { useState, useEffect } from "react";
import { Inventory, Plate, Nest } from "@/server/utils/InventoryClient";
import {
  Box,
  Checkbox,
  Flex,
  Grid,
  Heading,
  Image,
  Text,
  useColorModeValue,
  Tooltip,
  VStack,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Center,
  useBreakpointValue,
} from "@chakra-ui/react";
import Link from "next/link";

type InventoryProps = {
  inventory: Inventory;
  onSelectedPlateChange: (selectedPlate: Plate | null) => void;
  onSelectedNestChange: (selectedNest: Nest | null) => void;
  refreshOnChange?: (flag: boolean) => void;
};

const InventoryVisualizer: React.FC<InventoryProps> = ({
  inventory,
  onSelectedPlateChange,
  onSelectedNestChange,
  refreshOnChange = () => {},
}) => {
  const [selectedPlate, setSelectedPlate] = useState<Plate | null>(null);
  const [selectedNest, setSelectedNest] = useState<Nest | null>(null);
  const [instrumentNestCountMap, setInstrumentNestCountMap] = useState<Record<number, number>>({});
  const [selectedInstrument, setSelectedInstrument] = useState<any | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const plateMap = inventory.plates.reduce((acc, plate) => {
    if (plate.nest_id) {
      acc[plate.nest_id] = plate;
    }
    return acc;
  }, {} as { [key: number]: Plate });

  const bgColor = useColorModeValue("gray.100", "gray.700");
  const textColor = useColorModeValue("black", "white");
  const headingColor = useColorModeValue("blue.600", "blue.200");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const modalSize = useBreakpointValue({ base: "full", md: "xl", lg: "2xl" });

  useEffect(() => {
    const newMap = inventory.instruments.reduce((acc, instrument) => {
      const nestCount = inventory.nests.filter(nest => nest.instrument_id === instrument.id).length;
      acc[instrument.id] = nestCount;
      return acc;
    }, {} as Record<number, number>);
    setInstrumentNestCountMap(newMap);
  }, [inventory]);

  const handlePlateCheckBoxEvent = (plate: Plate | null) => {
    setSelectedPlate(plate);
    onSelectedPlateChange(plate);
    refreshOnChange(true);
  };

  const handleNestCheckBoxEvent = (nest: Nest | null) => {
    setSelectedNest(nest);
    onSelectedNestChange(nest);
    refreshOnChange(true);
  };

  const getCleanInstrumentName = (name: string) => {
    return name.replace(/\d+$/, '').replace(/\s/g, '');
  };
  

  const renderNestGrid = (instrument: any) => {
    const instrumentNests = inventory.nests.filter(
      (nest) => nest.instrument_id === instrument.id
    );
    const maxRows = Math.max(...instrumentNests.map((nest) => nest.row));
    const maxColumns = Math.max(...instrumentNests.map((nest) => nest.column));

    return (
      <Grid
        templateRows={`repeat(${maxRows}, 1fr)`}
        templateColumns={`repeat(${maxColumns}, 1fr)`}
        gap={1}
        p={2}
        overflowX="auto"
      >
        {/* Rows with nests and labels appearing on hover */}
        {Array.from({ length: maxRows }, (_, rowIndex) => (
          Array.from({ length: maxColumns }, (_, colIndex) => {
            const nest = instrumentNests.find(n => n.row === rowIndex + 1 && n.column === colIndex + 1);
            return (
              <Box key={`cell-${rowIndex}-${colIndex}`}>
                {nest ? (
                  <Tooltip label={`Row ${rowIndex + 1}, Col ${colIndex + 1}`} placement="top">
                    <Box>
                      {plateMap[nest.id] ? (
                        <Flex>
                          <Checkbox
                            isChecked={plateMap[nest.id].id === selectedPlate?.id}
                            onChange={(e) => handlePlateCheckBoxEvent(e.target.checked ? plateMap[nest.id] : null)}
                            mr={1}
                            colorScheme="green"
                          />
                            <Box
                              as={Link}
                              href={`/daily_actions/edit_plate/${plateMap[nest.id].barcode}`}
                              width="60px"
                              height="35px"
                              borderWidth="2px"
                              borderRadius="lg"
                              borderColor="gray.300"
                              bg="gray.100"
                              p={1}
                            >
                              <Text fontSize="xs" color={textColor} isTruncated>
                                {plateMap[nest.id].name}
                              </Text>
                            </Box>
                        </Flex>
                      ) : (
                          <Center
                            width="60px"
                            height="35px"
                            borderWidth="2px"
                            borderRadius="lg"
                            borderColor="gray.300"
                            bg="white"
                          >
                            <Checkbox
                              isChecked={nest.id === selectedNest?.id}
                              onChange={(e) => handleNestCheckBoxEvent(e.target.checked ? nest : null)}
                              colorScheme="green"
                            />
                          </Center>
                      )}
                    </Box>
                  </Tooltip>
                ) : null}
              </Box>
            );
          })
        ))}
      </Grid>
    );
  };

  return (
    <Box>
      <SimpleGrid columns={[2, 3, 4]} spacing={6}>
        {inventory.instruments.sort((a, b) => a.name.localeCompare(b.name)).map((instrument) => (
          <Box
            key={instrument.id}
            borderWidth="1px"
            borderRadius="lg"
            p={4}
            cursor="pointer"
            onClick={() => {
              setSelectedInstrument(instrument);
              onOpen();
            }}
            _hover={{ boxShadow: "md" }}
          >
            <VStack spacing={2}>
              <Image  
                src={`/tool_icons/${getCleanInstrumentName(instrument.name).toLowerCase()}.png`}
                alt={`${instrument.name} icon`} 
                boxSize="100px" 
                objectFit="contain"
              />
              <Heading fontSize="md" textAlign="center" marginTop={1}>
                {instrument.name}
              </Heading>
              <Text fontSize="sm" color="gray.500">
                {instrumentNestCountMap[instrument.id] || 0} nests
              </Text>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>

      <Modal isOpen={isOpen} onClose={onClose} size={modalSize} scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxWidth="fit-content" maxHeight="fit-content" right="10%"> 
        <ModalHeader mt={4}>{selectedInstrument?.name}</ModalHeader> {/* Adjust the mt value as needed */}
        <ModalCloseButton />
        <ModalBody>
          <Box overflowX="auto" overflowY="auto" maxHeight="70vh">
            {selectedInstrument && renderNestGrid(selectedInstrument)}
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>

    </Box>
  );
};

export default InventoryVisualizer;
