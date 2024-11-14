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
  Select,
} from "@chakra-ui/react";
import { Nest, Plate } from "@/server/utils/InventoryClient";

type CheckInModalProps = {
  isOpen: boolean;
  onClose: () => void;
  availableNests: Nest[];
  selectedPlate: Plate | null;
  onSubmit: (nestId: number) => Promise<void>;
};

const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  onClose,
  availableNests,
  selectedPlate,
  onSubmit,
}) => {
  const [selectedNestId, setSelectedNestId] = React.useState<number | "">("");

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Check In Plate</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Selected Plate</FormLabel>
              <Input value={selectedPlate?.name || ""} isReadOnly />
            </FormControl>
            <FormControl>
              <FormLabel>Select Nest</FormLabel>
              <Select
                placeholder="Select nest"
                value={selectedNestId}
                onChange={(e) => setSelectedNestId(Number(e.target.value))}
              >
                {availableNests.map((nest) => (
                  <option key={nest.id} value={nest.id}>
                    {nest.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            <Button
              colorScheme="blue"
              width="100%"
              onClick={() => selectedNestId && onSubmit(selectedNestId)}
              isDisabled={!selectedNestId}
            >
              Check In
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CheckInModal;