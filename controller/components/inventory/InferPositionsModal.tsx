import React, { useState } from "react";
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Text,
  Badge,
  VStack,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { Nest } from "@/types";

interface InferPositionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotelId: number;
  referenceNest: Nest;
  onInfer: (zOffset: number) => Promise<void>;
}

export const InferPositionsModal: React.FC<InferPositionsModalProps> = ({
  isOpen,
  onClose,
  referenceNest,
  onInfer,
}) => {
  const [zOffset, setZOffset] = useState(20.5);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onInfer(zOffset);
      onClose();
    } catch (error) {
      console.error("Inference failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Infer Hotel Positions</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text>
              Using nest <Badge colorScheme="blue">{referenceNest.name}</Badge> as reference.
            </Text>
            <FormControl>
              <FormLabel>Z-Offset Between Vertical Levels (mm)</FormLabel>
              <NumberInput
                value={zOffset}
                onChange={(_, val) => setZOffset(val)}
                min={0}
                max={1000}
                step={0.5}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <Alert status="info" fontSize="sm">
              <AlertIcon />
              This will calculate positions for all nests in the same column based on the reference
              position and automatically mark them as robot-accessible.
            </Alert>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit} isLoading={isLoading}>
            Infer Positions
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
