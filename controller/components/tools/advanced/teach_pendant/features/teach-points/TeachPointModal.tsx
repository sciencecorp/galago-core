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
import { TeachPoint } from "../../types";
import { Tool } from "@/types";
import { errorToast } from "@/components/ui/Toast";

interface TeachPointModalProps {
  isOpen: boolean;
  onClose: () => void;
  point?: TeachPoint;
  onSave: (point: TeachPoint) => void;
  toolId: number;
  config?: Tool;
}

export const TeachPointModal: React.FC<TeachPointModalProps> = ({
  isOpen,
  onClose,
  point,
  onSave,
  toolId: _toolId,
  config,
}) => {
  const [name, setName] = useState(point?.name ?? "");

  useEffect(() => {
    if (isOpen && point) {
      setName(point.name);
    } else if (isOpen) {
      setName("");
    }
  }, [isOpen, point]);

  const handleSave = () => {
    if (!name.trim()) {
      errorToast("Error", "Name is required");
      return;
    }

    // Get the number of joints from config
    const numJoints = parseInt((config?.config as any)?.pf400?.joints || "6");

    // Create default coordinates with zeros for all joints
    const defaultCoordinates = Array(numJoints).fill("0").join(" ");

    // Create location object with default coordinates
    const location = {
      id: point?.id ?? 0,
      name,
      type: "location" as const,
      locType: "j" as const,
      coordinates: point?.coordinates || defaultCoordinates,
      orientation: point?.orientation ?? ("portrait" as const),
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
