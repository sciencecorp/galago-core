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
} from "@chakra-ui/react";
import { Tool } from "@/types/api";
import { errorToast } from "@/components/ui/Toast";
import { BravoSequence } from "@/server/schemas";

interface BravoSequenceModalProps {
  config: Tool;
  isOpen: boolean;
  onClose: () => void;
  sequence?: BravoSequence;
  onSave: (sequence: Omit<BravoSequence, "id">) => void;
}

export const BravoSequenceModal: React.FC<BravoSequenceModalProps> = ({
  config,
  isOpen,
  onClose,
  sequence,
  onSave,
}) => {
  const [name, setName] = useState(sequence?.name ?? "");
  const [description, setDescription] = useState(sequence?.description ?? "");

  useEffect(() => {
    if (isOpen) {
      setName(sequence?.name ?? "");
      setDescription(sequence?.description ?? "");
    }
  }, [isOpen, sequence]);

  const handleSave = () => {
    if (!name.trim()) {
      errorToast("Error", "Name is required");
      return;
    }

    const sequenceData = {
      name,
      description: description || undefined,
      tool_id: config.id,
      steps: sequence?.steps || [],
    };

    onSave(sequenceData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{sequence ? "Edit Sequence" : "New Sequence"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter sequence name"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Description</FormLabel>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description (optional)"
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button isDisabled={name.trim() === ""} colorScheme="blue" onClick={handleSave}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
