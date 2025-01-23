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
  NumberInput,
  NumberInputField,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { GripParams } from "@/components/tools/advanced/teach_pendant/components/types";

interface GripParamsModalProps {
  isOpen: boolean;
  onClose: () => void;
  params?: GripParams;
  onSave?: (params: Omit<GripParams, "id">) => void;
  toolId: number;
}

export const GripParamsModal: React.FC<GripParamsModalProps> = ({
  isOpen,
  onClose,
  params,
  onSave,
  toolId,
}) => {
  const [name, setName] = useState("");
  const [width, setWidth] = useState(122);
  const [speed, setSpeed] = useState(10);
  const [force, setForce] = useState(20);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      if (params) {
        setName(params.name);
        setWidth(params.width);
        setSpeed(params.speed);
        setForce(params.force);
      } else {
        setName("");
        setWidth(122);
        setSpeed(10);
        setForce(20);
      }
    }
  }, [isOpen, params]);

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

    if (onSave) {
      onSave({
        name: name.trim(),
        width,
        speed,
        force,
        tool_id: toolId,
      });
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{params ? "Edit" : "New"} Grip Parameters</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel>Width (mm)</FormLabel>
              <NumberInput value={width} onChange={(_, value) => setWidth(value)}>
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Speed (%)</FormLabel>
              <NumberInput value={speed} onChange={(_, value) => setSpeed(value)}>
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Force (%)</FormLabel>
              <NumberInput value={force} onChange={(_, value) => setForce(value)}>
                <NumberInputField />
              </NumberInput>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSave}>
            Save
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
