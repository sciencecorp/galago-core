import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import {
  useToast,
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
  useDisclosure,
  Box,
  Heading,
  Text,
  IconButton,
  HStack,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { RobotArmSequence } from "@/server/routers/robot-arm";
import { ToolCommandInfo } from "@/types";
import { Tool } from "@/types/api";
import { CommandModal } from "../modals/CommandModal";
import { ToolType } from "gen-interfaces/controller";
import { TeachPoint, MotionProfile, GripParams } from "../types";

export interface SequenceCommand {
  command: string;
  params: Record<string, any>;
  order: number;
}

export interface Sequence {
  id: number;
  name: string;
  description?: string;
  commands: SequenceCommand[];
  tool_id: number;
}

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

const SequenceModal: React.FC<SequenceModalProps> = ({
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
  const [commands, setCommands] = useState(sequence?.commands ?? []);
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);
  const toast = useToast();
  const { handleUpdateSequence, handleCreateSequence } = useSequenceHandler(config);

  // Reset form when sequence changes
  useEffect(() => {
    setName(sequence?.name ?? "");
    setDescription(sequence?.description ?? "");
  }, [sequence]);

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

    const sequenceData = {
      name,
      description,
      commands,
      tool_id: config.id,
    };

    if (sequence?.id) {
      handleUpdateSequence({
        ...sequenceData,
        id: sequence.id,
      });
    } else {
      handleCreateSequence(sequenceData);
    }
    onClose();
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

export function useSequenceHandler(config: Tool) {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedSequence, setSelectedSequence] = useState<Sequence | null>(null);
  const commandMutation = trpc.tool.runCommand.useMutation();
  const sequencesQuery = trpc.robotArm.sequence.getAll.useQuery(
    { toolId: config.id },
    { enabled: !!config.id && config.id !== 0 },
  );

  const createSequenceMutation = trpc.robotArm.sequence.create.useMutation({
    onSuccess: () => {
      sequencesQuery.refetch();
      toast({
        title: "Success",
        description: "Sequence created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    },
  });

  const updateSequenceMutation = trpc.robotArm.sequence.update.useMutation({
    onSuccess: () => {
      sequencesQuery.refetch();
      toast({
        title: "Success",
        description: "Sequence updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    },
  });

  const deleteSequenceMutation = trpc.robotArm.sequence.delete.useMutation({
    onSuccess: () => {
      sequencesQuery.refetch();
      toast({
        title: "Success",
        description: "Sequence deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleCreateSequence = async (sequence: Omit<RobotArmSequence, "id">) => {
    try {
      await createSequenceMutation.mutateAsync(sequence);
    } catch (error) {
      toast({
        title: "Failed to create sequence",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUpdateSequence = async (sequence: RobotArmSequence) => {
    try {
      await updateSequenceMutation.mutateAsync(sequence);
    } catch (error) {
      toast({
        title: "Failed to update sequence",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteSequence = async (id: number) => {
    try {
      await deleteSequenceMutation.mutateAsync({ id, tool_id: config.id });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete sequence",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRunSequence = async (sequence: Sequence) => {
    try {
      await commandMutation.mutateAsync({
        toolId: config.name,
        toolType: config.type as ToolType,
        command: "run_sequence",
        params: {
          sequence_id: sequence.id,
        },
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run sequence",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditSequence = (sequence: Sequence | null) => {
    setSelectedSequence(sequence);
    onOpen();
  };

  const handleNewSequence = () => {
    setSelectedSequence(null);
    onOpen();
  };

  return {
    sequences: sequencesQuery.data,
    handleCreateSequence,
    handleUpdateSequence,
    handleDeleteSequence,
    handleRunSequence,
    handleEditSequence,
    handleNewSequence,
    isOpen,
    onClose,
    selectedSequence,
  };
}
