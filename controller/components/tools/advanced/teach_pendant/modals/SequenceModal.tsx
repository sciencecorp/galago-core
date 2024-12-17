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
  Box,
  Heading,
  Text,
  IconButton,
  HStack,
  useToast,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { Tool } from "@/types/api";
import { CommandModal } from "./CommandModal";
import { Sequence, SequenceCommand } from "../types";

interface SequenceModalProps {
  config: Tool;
  isOpen: boolean;
  onClose: () => void;
  sequence?: Sequence;
  onSave: (sequence: Omit<Sequence, "id">) => void;
  teachPoints: TeachPoint[];
  motionProfiles: MotionProfile[];
  gripParams: GripParams[];
}

export const SequenceModal: React.FC<SequenceModalProps> = ({ 
  config, 
  isOpen, 
  onClose, 
  sequence,
  onSave,
  teachPoints,
  motionProfiles,
  gripParams,
}) => {
  const [name, setName] = useState(sequence?.name ?? "");
  const [description, setDescription] = useState(sequence?.description ?? "");
  const [commands, setCommands] = useState<SequenceCommand[]>(sequence?.commands ?? []);
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      setName(sequence?.name ?? "");
      setDescription(sequence?.description ?? "");
      setCommands(sequence?.commands ?? []);
    }
  }, [isOpen, sequence]);

  const handleAddCommand = (command: { command: string; params: Record<string, any> }) => {
    setCommands([...commands, { ...command, order: commands.length }]);
  };

  const handleRemoveCommand = (index: number) => {
    setCommands(commands.filter((_, i) => i !== index));
  };

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

    onSave({
      name,
      description,
      commands,
      tool_id: config.id,
    });
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{sequence ? "Edit Sequence" : "Create Sequence"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
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
                  placeholder="Enter sequence description (optional)"
                />
              </FormControl>

              <Box w="100%">
                <Heading size="sm" mb={2}>
                  Commands
                </Heading>
                <VStack align="stretch" spacing={2}>
                  {commands.map((cmd, index) => (
                    <HStack key={index} justify="space-between">
                      <Text>{cmd.command}</Text>
                      <IconButton
                        aria-label="Remove command"
                        icon={<DeleteIcon />}
                        size="sm"
                        onClick={() => handleRemoveCommand(index)}
                      />
                    </HStack>
                  ))}
                </VStack>
                <Button mt={2} size="sm" onClick={() => setIsCommandModalOpen(true)}>
                  Add Command
                </Button>
              </Box>
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

      <CommandModal
        isOpen={isCommandModalOpen}
        onClose={() => setIsCommandModalOpen(false)}
        onAddCommand={handleAddCommand}
        teachPoints={teachPoints}
        motionProfiles={motionProfiles}
        gripParams={gripParams}
      />
    </>
  );
}; 