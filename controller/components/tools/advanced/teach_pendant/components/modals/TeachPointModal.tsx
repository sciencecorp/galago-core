import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  NumberInput,
  NumberInputField,
  useToast,
} from "@chakra-ui/react";
import { TeachPoint } from "../types";

interface TeachPointModalProps {
  isOpen: boolean;
  onClose: () => void;
  point?: TeachPoint;
  onSave: (point: TeachPoint) => void;
  toolId: number;
}

export const TeachPointModal: React.FC<TeachPointModalProps> = ({
  isOpen,
  onClose,
  point,
  onSave,
  toolId,
}) => {
  const [name, setName] = useState(point?.name ?? "");
  const [coordinates, setCoordinates] = useState<number[]>(
    point?.coordinate ? point.coordinate.split(" ").map(Number) : [0, 0, 0, 0, 0, 0]
  );
  const toast = useToast();

  useEffect(() => {
    if (isOpen && point) {
      setName(point.name);
      setCoordinates(
        point.coordinate ? point.coordinate.split(" ").map(Number) : [0, 0, 0, 0, 0, 0]
      );
    } else if (isOpen) {
      setName("");
      setCoordinates([0, 0, 0, 0, 0, 0]);
    }
  }, [isOpen, point]);

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Name is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    console.log('Saving teach point with coordinates:', coordinates);
    
    // Create location object with explicit joint assignments
    const location = {
      id: point?.id ?? 0,
      name,
      j1: coordinates[0],
      j2: coordinates[1],
      j3: coordinates[2],
      j4: coordinates[3],
      j5: coordinates[4],
      j6: coordinates[5],
      type: "location" as const,
      locType: "j" as const,
      coordinate: coordinates.join(" "),
    };
    
    console.log('Saving location:', location);
    onSave(location);
    onClose();
  };

  const handleCoordinateChange = (index: number, value: number) => {
    console.log(`Updating joint ${index + 1} (${["J1", "J2", "J3", "J4", "J5", "J6"][index]}) to value:`, value);
    console.log('Previous coordinates:', coordinates);
    const newCoordinates = [...coordinates];
    newCoordinates[index] = isNaN(value) ? 0 : value;
    console.log('New coordinates:', newCoordinates);
    setCoordinates(newCoordinates);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{point ? "Edit Teach Point" : "Create Teach Point"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter teach point name"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Coordinates</FormLabel>
              <VStack spacing={2}>
                {["J1", "J2", "J3", "J4", "J5", "J6"].map((joint, index) => (
                  <HStack key={joint} width="100%">
                    <FormLabel width="60px" marginBottom="0">{joint}</FormLabel>
                    <NumberInput
                      value={coordinates[index]}
                      onChange={(valueString, valueNumber) => {
                        console.log(`NumberInput onChange - joint ${joint}:`, { valueString, valueNumber });
                        handleCoordinateChange(index, valueNumber);
                      }}
                      step={0.001}
                      precision={3}
                      width="100%"
                    >
                      <NumberInputField />
                    </NumberInput>
                  </HStack>
                ))}
              </VStack>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSave}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}; 