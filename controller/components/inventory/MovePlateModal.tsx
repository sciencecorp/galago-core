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

type MovePlateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  availableNests: Nest[];
  selectedPlate: Plate | null;
  onSubmit: (newNestId: number) => Promise<void>;
};

const MovePlateModal: React.FC<MovePlateModalProps> = ({
  isOpen,
  onClose,
  availableNests,
  selectedPlate,
  onSubmit,
}) => {
  const [newNestId, setNewNestId] = React.useState<number | "">("");

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Move Plate</ModalHeader>
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
            <FormControl>
              <FormLabel>New Nest</FormLabel>
              <Select
                placeholder="Select new nest"
                value={newNestId}
                onChange={(e) => setNewNestId(Number(e.target.value))}
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
              onClick={() => newNestId && onSubmit(newNestId)}
              isDisabled={!newNestId || newNestId === selectedPlate?.nest_id}
            >
              Move Plate
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default MovePlateModal;