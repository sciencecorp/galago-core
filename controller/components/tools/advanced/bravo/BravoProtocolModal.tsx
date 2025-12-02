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
import { BravoProtocol } from "@/server/schemas/bravo";

interface BravoProtocolModalProps {
  config: Tool;
  isOpen: boolean;
  onClose: () => void;
  protocol?: BravoProtocol;
  onSave: (protocol: Omit<BravoProtocol, "id">) => void;
}

export const BravoProtocolModal: React.FC<BravoProtocolModalProps> = ({
  config,
  isOpen,
  onClose,
  protocol,
  onSave,
}) => {
  const [name, setName] = useState(protocol?.name ?? "");
  const [description, setDescription] = useState(protocol?.description ?? "");

  useEffect(() => {
    if (isOpen) {
      setName(protocol?.name ?? "");
      setDescription(protocol?.description ?? "");
    }
  }, [isOpen, protocol]);

  const handleSave = () => {
    if (!name.trim()) {
      errorToast("Error", "Name is required");
      return;
    }

    const protocolData = {
      name,
      description: description || undefined,
      tool_id: config.id,
      commands: protocol?.commands || [],
    };

    onSave(protocolData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{protocol ? "Edit Protocol" : "New Protocol"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter protocol name"
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
