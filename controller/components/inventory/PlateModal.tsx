import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  HStack,
  Text,
  useToast,
  VStack,
  Button,
  Flex,
  Box,
} from '@chakra-ui/react';
import { Plate, Well, Reagent } from '@/types/api';
import { PlateGrid } from '../UI/PlateGrid';
import { trpc } from '@/utils/trpc';
interface PlateModalProps {
  isOpen: boolean;
  onClose: () => void;
  plate: Plate;
  onAddReagents?: (wellIds: number[]) => void;
}

const PlateModal: React.FC<PlateModalProps> = ({
  isOpen,
  onClose,
  plate,
  onAddReagents,
}) => {
  const [selectedWells, setSelectedWells] = useState<number[]>([]);
  const [selectedReagents, setSelectedReagents] = useState<number[]>([]);
  const toast = useToast();

  const { data: wells = [] } = trpc.inventory.getWells.useQuery(
    plate.id,
    {
      enabled: !!plate.id
    }
  );

  const { data: reagents = [] } = trpc.inventory.getReagents.useQuery(
    plate.id,
    {
      enabled: !!plate.id
    }
  );

  const handleWellClick = (wellId: number) => {
    setSelectedWells(prev => 
      prev.includes(wellId) 
        ? prev.filter(id => id !== wellId)
        : [...prev, wellId]
    );
  };

  const getWellTooltip = (wellId: number): string => {
    const wellReagents = (reagents as Reagent[]).filter((r: Reagent) => r.well_id === wellId);
    return wellReagents.length > 0
      ? wellReagents.map((r: Reagent) => r.name).join(', ')
      : 'Empty';
  };

  const getWellContent = (wellId: number): React.ReactNode => {
    const well = (wells as Well[]).find((w: Well) => w.id === wellId);
    return well ? `${String.fromCharCode(65 + well.row)}${well.column + 1}` : '';
  };

  const getModalSize = () => {
    if (plate.plate_type.includes('384')) {
      return '4xl';  // Much larger size for 384-well plates
    }
    else if (plate.plate_type.includes('96')) {
      return 'xl';  // Larger size for 96-well plates
    }
    else if (plate.plate_type.includes('48')) {
      return 'lg';  // Larger size for 48-well plates
    }
    else if (plate.plate_type.includes('24')) {
      return 'lg';    // Larger size for other plates
    }
    else if (plate.plate_type.includes('6')) {
      return 'sm';    // Larger size for other plates
    }
    else {
      return 'md';    // Larger size for other plates
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={getModalSize()}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Text>{plate.name}</Text>
          <Text fontSize="sm" color="gray.500">Type: {plate.plate_type}</Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex>
            <VStack spacing={4} mr={4} minW="150px">
              <Button 
                onClick={() => setSelectedWells((wells as Well[]).map((w: Well) => w.id))}
                width="100%"
              >
                Select All Wells
              </Button>
              <Button 
                onClick={() => setSelectedWells([])}
                width="100%"
              >
                Clear Selection
              </Button>
              <Button 
                colorScheme="blue"
                isDisabled={selectedWells.length === 0}
                onClick={() => onAddReagents?.(selectedWells)}
                width="100%"
              >
                Add Reagents
              </Button>
            </VStack>
            
            <Box flex="1">
              <PlateGrid
                plateType={plate.plate_type}
                wells={wells as Well[]}
                selectedWells={selectedWells}
                onWellClick={handleWellClick}
                getWellTooltip={getWellTooltip}
                getWellContent={getWellContent}
              />
            </Box>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PlateModal;