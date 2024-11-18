import React, { useState } from 'react';
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
  Tooltip,
  VStack,
  HStack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { Plate, Well, Reagent } from '@/types/api';

interface PlateModalProps {
  isOpen: boolean;
  onClose: () => void;
  plate: Plate;
  wells: Well[];
  reagents: Reagent[];
  onAddReagents?: (wellIds: number[]) => void;
}

const getPlateLayout = (plateType: string): { rows: number; cols: number } => {
  switch (plateType) {
    case '6_well':
      return { rows: 2, cols: 3 };
    case '24_well':
      return { rows: 4, cols: 6 };
    case '96_well':
      return { rows: 8, cols: 12 };
    case '384_well':
      return { rows: 16, cols: 24 };
    default:
      return { rows: 8, cols: 12 }; // Default to 96 well
  }
};

const PlateModal: React.FC<PlateModalProps> = ({
  isOpen,
  onClose,
  plate,
  wells,
  reagents,
  onAddReagents,
}) => {
  const [selectedWells, setSelectedWells] = useState<number[]>([]);
  const toast = useToast();
  const { rows, cols } = getPlateLayout(plate.plate_type);

  const handleWellClick = (wellId: number) => {
    setSelectedWells(prev => 
      prev.includes(wellId) 
        ? prev.filter(id => id !== wellId)
        : [...prev, wellId]
    );
  };

  const handleSelectAll = () => {
    setSelectedWells(wells.map(well => well.id));
  };

  const handleClearSelection = () => {
    setSelectedWells([]);
  };

  const getWellReagents = (wellId: number): Reagent[] => {
    return reagents.filter(reagent => reagent.well_id === wellId);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Text>{plate.name}</Text>
          <Text fontSize="sm" color="gray.500">Type: {plate.plate_type}</Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <HStack spacing={2}>
              <Button onClick={handleSelectAll}>Select All Wells</Button>
              <Button onClick={handleClearSelection}>Clear Selection</Button>
              <Button 
                colorScheme="blue"
                isDisabled={selectedWells.length === 0}
                onClick={() => onAddReagents?.(selectedWells)}
              >
                Add Reagents
              </Button>
            </HStack>
            
            <Grid
              templateColumns={`repeat(${cols}, 1fr)`}
              templateRows={`repeat(${rows}, 1fr)`}
              gap={1}
              w="100%"
              aspectRatio={cols/rows}
            >
              {wells.map((well) => {
                const wellReagents = getWellReagents(well.id);
                return (
                  <Tooltip
                    key={well.id}
                    label={
                      wellReagents.length > 0
                        ? wellReagents.map(r => r.name).join(', ')
                        : 'Empty well'
                    }
                  >
                    <Box
                      bg={selectedWells.includes(well.id) ? 'blue.200' : 'gray.100'}
                      border="1px solid"
                      borderColor={wellReagents.length > 0 ? 'green.400' : 'gray.300'}
                      borderRadius="md"
                      cursor="pointer"
                      onClick={() => handleWellClick(well.id)}
                      aspectRatio={1}
                      _hover={{ bg: 'blue.100' }}
                    />
                  </Tooltip>
                );
              })}
            </Grid>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PlateModal;