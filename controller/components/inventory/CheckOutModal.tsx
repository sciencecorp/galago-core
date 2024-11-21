import React from "react";
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
} from "@chakra-ui/react";
import { Plate } from "@/types/api";

type CheckOutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedPlate: Plate | null;
  onSubmit: () => Promise<void>;
};

const CheckOutModal: React.FC<CheckOutModalProps> = ({
  isOpen,
  onClose,
  selectedPlate,
  onSubmit,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Check Out Plate</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Selected Plate</FormLabel>
              <Input value={selectedPlate?.name || ""} isReadOnly />
            </FormControl>
            <FormControl>
              <FormLabel>Current Nest</FormLabel>
              <Input value={selectedPlate?.nest_id || "Not checked in"} isReadOnly />
            </FormControl>
            <Button
              colorScheme="blue"
              width="100%"
              onClick={onSubmit}
              isDisabled={!selectedPlate?.nest_id}>
              Check Out
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CheckOutModal;
