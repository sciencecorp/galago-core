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
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  VStack,
  HStack,
  useColorModeValue,
  Badge,
  Tooltip,
  Icon,
  Flex,
} from "@chakra-ui/react";
import { Nest, Plate, NestStatus, PlateStatus } from "@/types/api";
import { HamburgerIcon, CheckIcon, AddIcon, MinusIcon } from "@chakra-ui/icons";
import { WellPlateIcon } from "@/components/ui/Icons";
import { BsGrid3X3 } from "react-icons/bs";

interface NestModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolName: string;
  nests: Nest[];
  plates: Plate[];
  selectedNests?: number[];
  isMultiSelect?: boolean;
  maxSelections?: number;
  onNestSelect: (nestIds: number[]) => void;
  onCreateNest?: (row: number, column: number) => Promise<void>;
  onDeleteNest?: (nestId: number) => Promise<void>;
  onPlateClick?: (plate: Plate) => void;
}

const NestModal: React.FC<NestModalProps> = ({
  isOpen,
  onClose,
  toolName,
  nests,
  plates,
  selectedNests = [],
  isMultiSelect = false,
  maxSelections,
  onNestSelect,
  onCreateNest,
  onDeleteNest,
  onPlateClick,
}) => {
  const [localSelectedNests, setLocalSelectedNests] = useState<number[]>(selectedNests || []);
  const [dimensionMode, setDimensionMode] = useState<'row' | 'column'>('column');
  const toast = useToast();

  const maxRows = Math.max(...nests.map((nest) => nest.row), 1);
  const maxColumns = Math.max(...nests.map((nest) => nest.column), 1);

  // Colors
  const nestBg = useColorModeValue("white", "gray.700");
  const nestBorderColor = useColorModeValue("gray.200", "gray.600");
  const selectedNestBg = useColorModeValue("teal.50", "teal.900");
  const selectedNestBorder = useColorModeValue("teal.500", "teal.400");
  const ghostNestBg = useColorModeValue("gray.50", "gray.800");
  const ghostNestBorder = useColorModeValue("gray.300", "gray.600");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const labelBg = useColorModeValue("gray.100", "gray.600");

  // Reset local selection when modal opens
  useEffect(() => {
    setLocalSelectedNests(selectedNests || []);
  }, [isOpen]);

  const handleNestClick = (nest: Nest) => {
    let newSelection: number[];
    
    if (isMultiSelect) {
      if (localSelectedNests.includes(nest.id)) {
        // Always allow deselection
        newSelection = localSelectedNests.filter(id => id !== nest.id);
      } else {
        // Check if we can add more selections
        if (maxSelections && localSelectedNests.length >= maxSelections) {
          toast({
            title: "Selection limit reached",
            description: `You can only select up to ${maxSelections} nest${maxSelections > 1 ? 's' : ''}`,
            status: "warning",
            duration: 3000,
            isClosable: true,
          });
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
    const rows = plateType.includes("384") ? 16 : 
                 plateType.includes("96") ? 8 : 
                 plateType.includes("24") ? 4 : 2;
    const cols = plateType.includes("384") ? 24 : 
                 plateType.includes("96") ? 12 : 
                 plateType.includes("24") ? 6 : 3;
    return { rows, cols };
  };

  const handleDimensionChange = async (type: 'row' | 'column', operation: 'add' | 'remove') => {
    try {
      const currentMax = type === 'row' ? maxRows : maxColumns;
      const newValue = operation === 'add' ? currentMax + 1 : Math.max(1, currentMax - 1);
      
      if (operation === 'remove' && onDeleteNest) {
        // Delete nests in the last row/column
        const nestsToDelete = nests.filter(nest => 
          type === 'row' ? nest.row === currentMax : nest.column === currentMax
        );
        
        for (const nest of nestsToDelete) {
          await onDeleteNest(nest.id);
        }
      } else if (operation === 'add' && onCreateNest) {
        // If inventory is empty, create first nest at (1,1)
        if (nests.length === 0) {
          await onCreateNest(1, 1);
        }
        
        // Add new nests in the new row/column
        if (type === 'row') {
          for (let col = 1; col <= maxColumns; col++) {
            if (nests.length === 0 && col === 1) continue; // Skip (1,1) if we just created it
            await onCreateNest(newValue, col);
          }
        } else {
          for (let row = 1; row <= maxRows; row++) {
            if (nests.length === 0 && row === 1) continue; // Skip (1,1) if we just created it
            await onCreateNest(row, newValue);
          }
        }
      }
    } catch (error) {
      toast({
        title: "Error modifying grid",
        description: "Failed to modify the grid dimensions",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const renderNestContent = (nest: Nest) => {
    const plate = plates.find(p => p.nest_id === nest.id);
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
        height="60px"
        width="60px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        transition="all 0.2s"
        _hover={{
          transform: "scale(1.02)",
          shadow: "sm",
          borderColor: selectedNestBorder,
          bg: isSelected ? selectedNestBg : 'transparent',
        }}>
        {plate && (
          <Tooltip label={`${plate.name || 'Unnamed Plate'}`}>
            <Box
              onClick={(e) => {
                e.stopPropagation(); // Prevent nest selection when clicking the plate
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
                size="40px"
              />
            </Box>
          </Tooltip>
        )}
        {!plate && (
          <Badge
            position="absolute"
            top="-2"
            left="-2"
            colorScheme={nest.status === 'empty' ? 'gray' : 
                        nest.status === 'reserved' ? 'yellow' : 'red'}
            borderRadius="full"
            p="1"
            fontSize="xs">
            {nest.status}
          </Badge>
        )}
        {isSelected && (
          <Badge
            position="absolute"
            top="-2"
            right="-2"
            colorScheme="teal"
            borderRadius="full"
            p="1"
            fontSize="xs">
            <CheckIcon boxSize="2" />
          </Badge>
        )}
      </Box>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent maxW="fit-content" minW="min-content">
        <ModalHeader borderBottomWidth="1px" py={4}>
          <HStack spacing={3} justify="space-between">
            <HStack spacing={3}>
              <Icon as={BsGrid3X3} boxSize={5} color="teal.500" />
              <VStack align="start" spacing={0}>
                <Text>{toolName}</Text>
                <Text fontSize="sm" color="gray.500">
                  Select nest{isMultiSelect ? "s" : ""}
                </Text>
              </VStack>
            </HStack>

            {onCreateNest && onDeleteNest && (
              <HStack spacing={2}>
                <Button
                  size="sm"
                  variant="ghost"
                  rightIcon={dimensionMode === 'column' ? <Icon as={BsGrid3X3} /> : <Icon as={BsGrid3X3} transform="rotate(90deg)" />}
                  onClick={() => setDimensionMode(prev => prev === 'column' ? 'row' : 'column')}
                  color={textColor}
                  fontWeight="medium"
                >
                  {dimensionMode === 'column' ? 'Columns' : 'Rows'}
                </Button>
                <Tooltip label={`Add ${dimensionMode}`}>
                  <IconButton
                    aria-label={`Add ${dimensionMode}`}
                    icon={<AddIcon />}
                    size="sm"
                    onClick={() => handleDimensionChange(dimensionMode, 'add')}
                    colorScheme="teal"
                  />
                </Tooltip>
                {(dimensionMode === 'row' ? maxRows : maxColumns) > 1 && (
                  <Tooltip label={`Remove ${dimensionMode}`}>
                    <IconButton
                      aria-label={`Remove ${dimensionMode}`}
                      icon={<MinusIcon />}
                      size="sm"
                      onClick={() => handleDimensionChange(dimensionMode, 'remove')}
                      colorScheme="teal"
                    />
                  </Tooltip>
                )}
              </HStack>
            )}
          </HStack>
        </ModalHeader>
        <ModalBody py={6}>
          <Flex>
            {/* Row labels column */}
            <VStack spacing={0} pt={14} pr={3} minW="40px">
              {Array.from({ length: maxRows }, (_, i) => (
                <Box
                  key={`row-${i}`}
                  h="60px"
                  mb={i < maxRows - 1 ? "12px" : 0}
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-end"
                >
                  <Box
                    bg={labelBg}
                    px={2}
                    py={1}
                    borderRadius="md"
                    fontSize="sm"
                    fontWeight="medium">
                    {i + 1}
                  </Box>
                </Box>
              ))}
            </VStack>

            <VStack spacing={0} align="stretch">
              {/* Column labels row */}
              <HStack spacing={3} px={4} pb={3} minH="40px" align="flex-end">
                {Array.from({ length: maxColumns }, (_, i) => (
                  <Flex key={`col-${i}`} w="60px" justify="center">
                    <Box
                      bg={labelBg}
                      px={2}
                      py={1}
                      borderRadius="md"
                      fontSize="sm"
                      fontWeight="medium">
                      {i + 1}
                    </Box>
                  </Flex>
                ))}
              </HStack>

              {/* Grid */}
              <Grid
                templateColumns={`repeat(${maxColumns}, 60px)`}
                gap={3}
                p={4}
                bg={ghostNestBg}
                borderRadius="lg">
                {Array.from({ length: maxRows }, (_, rowIndex) =>
                  Array.from({ length: maxColumns }, (_, colIndex) => {
                    const nest = nests.find(
                      (n) => n.row === rowIndex + 1 && n.column === colIndex + 1,
                    );
                    
                    if (!nest) {
                      return (
                        <Box
                          key={`empty-${rowIndex}-${colIndex}`}
                          height="60px"
                          width="60px"
                          borderWidth="1px"
                          borderStyle="dashed"
                          borderColor={ghostNestBorder}
                          borderRadius="md"
                          opacity={0.5}
                        />
                      );
                    }

                    return renderNestContent(nest);
                  }),
                )}
              </Grid>
            </VStack>
          </Flex>
        </ModalBody>

        {isMultiSelect && (
          <ModalFooter borderBottomWidth="1px" py={4}>
            <HStack width="100%" justify="space-between">
              <Text color="gray.500" fontSize="sm">
                {localSelectedNests.length} nest{localSelectedNests.length !== 1 ? "s" : ""} selected
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
