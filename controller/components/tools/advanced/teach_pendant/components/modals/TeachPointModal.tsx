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
  const toast = useToast();

  useEffect(() => {
    if (isOpen && point) {
      setName(point.name);
    } else if (isOpen) {
      setName("");
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

    // Create location object with empty coordinates
    const location = {
      id: point?.id ?? 0,
      name,
      type: "location" as const,
      locType: "j" as const,
      coordinates: "",
    };

    onSave(location);
    onClose();
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
