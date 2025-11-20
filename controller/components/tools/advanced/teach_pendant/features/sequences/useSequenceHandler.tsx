import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
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
import { CommandModal } from "./CommandModal";
import { ToolType } from "gen-interfaces/controller";
import { TeachPoint, MotionProfile, GripParams } from "../../types";
import {
  successToast,
  warningToast,
  errorToast,
  batchOperationToast,
} from "@/components/ui/Toast";
import {
  createBatchHandler,
  createBatchHandlerForIds,
} from "../../shared/utils/batchUtils";
import { validateSequenceExists } from "../../shared/utils/commandValidation";

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
  labware?: string;
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
  const { handleUpdateSequence, handleCreateSequence } =
    useSequenceHandler(config);

  // Reset form when sequence changes
  useEffect(() => {
    setName(sequence?.name ?? "");
    setDescription(sequence?.description ?? "");
  }, [sequence]);

  const handleAddCommand = (command: {
    command: string;
    params: Record<string, any>;
  }) => {
    setCommands([...commands, { ...command, order: commands.length }]);
  };

  const handleRemoveCommand = (index: number) => {
    setCommands(commands.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name.trim()) {
      errorToast("Error", "Name is required");
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
          <ModalHeader>
            {sequence ? "Edit Sequence" : "Create Sequence"}
          </ModalHeader>
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
                <Button
                  mt={2}
                  size="sm"
                  onClick={() => setIsCommandModalOpen(true)}
                >
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedSequence, setSelectedSequence] = useState<Sequence | null>(
    null
  );
  const commandMutation = trpc.tool.runCommand.useMutation();
  const sequencesQuery = trpc.robotArm.sequence.getAll.useQuery(
    { toolId: config.id },
    { enabled: !!config.id && config.id !== 0 }
  );
  const labwareQuery = trpc.labware.getAll.useQuery(undefined, {
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  const createSequenceMutation = trpc.robotArm.sequence.create.useMutation({
    onSuccess: () => {
      sequencesQuery.refetch();
      successToast("Success", "Sequence created successfully");
      onClose();
    },
  });

  const updateSequenceMutation = trpc.robotArm.sequence.update.useMutation({
    onSuccess: () => {
      sequencesQuery.refetch();
      successToast("Success", "Sequence updated successfully");
      onClose();
    },
  });

  const deleteSequenceMutation = trpc.robotArm.sequence.delete.useMutation({
    onSuccess: () => {
      sequencesQuery.refetch();
      // Toast is handled in the handler function
    },
  });

  /**
   * Create multiple sequences in batch
   * @param sequences Array of sequences to create
   * @returns Object containing success and error counts
   */
  const handleBatchCreateSequence = async (
    sequences: Omit<RobotArmSequence, "id">[]
  ) => {
    const createSequence = async (sequence: Omit<RobotArmSequence, "id">) => {
      await createSequenceMutation.mutateAsync(sequence);
    };

    const batchCreateSequences = createBatchHandler(
      createSequence,
      "create",
      "sequences"
    );

    return await batchCreateSequences(sequences);
  };

  /**
   * Update multiple sequences in batch
   * @param sequences Array of sequences to update
   * @returns Object containing success and error counts
   */
  const handleBatchUpdateSequence = async (sequences: RobotArmSequence[]) => {
    const updateSequence = async (sequence: RobotArmSequence) => {
      await updateSequenceMutation.mutateAsync(sequence);
    };

    const batchUpdateSequences = createBatchHandler(
      updateSequence,
      "update",
      "sequences"
    );

    return await batchUpdateSequences(sequences);
  };

  /**
   * Delete multiple sequences in batch
   * @param ids Array of sequence IDs to delete
   * @returns Object containing success and error counts
   */
  const handleBatchDeleteSequence = async (ids: number[]) => {
    const deleteSequence = async (id: number) => {
      await deleteSequenceMutation.mutateAsync({ id, tool_id: config.id });
    };

    const batchDeleteSequences = createBatchHandlerForIds(
      deleteSequence,
      "delete",
      "sequences"
    );

    return await batchDeleteSequences(ids);
  };

  const handleCreateSequence = async (
    sequence: Omit<RobotArmSequence, "id">
  ) => {
    try {
      await createSequenceMutation.mutateAsync(sequence);
    } catch (error) {
      errorToast(
        "Failed to create sequence",
        "An error occurred while creating the sequence"
      );
    }
  };

  const handleUpdateSequence = async (sequence: RobotArmSequence) => {
    try {
      await updateSequenceMutation.mutateAsync(sequence);
    } catch (error) {
      errorToast(
        "Failed to update sequence",
        "An error occurred while updating the sequence"
      );
    }
  };

  const handleDeleteSequence = async (id: number, silent: boolean = false) => {
    try {
      await deleteSequenceMutation.mutateAsync({ id, tool_id: config.id });
      if (!silent) {
        successToast("Success", "Sequence deleted successfully");
      }
    } catch (error) {
      if (!silent) {
        errorToast("Error", "Failed to delete sequence");
      }
      throw error;
    }
  };

  const handleRunSequence = async (sequence: Sequence) => {
    // Validate that sequences exist
    const allSequences = sequencesQuery.data || [];
    if (!validateSequenceExists(allSequences)) {
      return;
    }

    try {
      await commandMutation.mutateAsync({
        toolId: config.name,
        toolType: config.type as ToolType,
        command: "run_sequence",
        params: {
          sequence_name: sequence.name,
          labware: sequence.labware || "default",
        },
      });
    } catch (error) {
      errorToast("Error", "Failed to run sequence");
    }
  };

  /**
   * Run multiple sequences in batch
   * @param sequences Array of sequences to run
   * @returns Object containing success and error counts
   */
  const handleBatchRunSequence = async (sequences: Sequence[]) => {
    // Validate that sequences exist
    const allSequences = sequencesQuery.data || [];
    if (!validateSequenceExists(allSequences)) {
      return { successCount: 0, errorCount: 0 };
    }

    const runSequence = async (sequence: Sequence) => {
      await commandMutation.mutateAsync({
        toolId: config.name,
        toolType: config.type as ToolType,
        command: "run_sequence",
        params: {
          sequence_name: sequence.name,
          labware: sequence.labware || "default",
        },
      });
    };

    const batchRunSequences = createBatchHandler(
      runSequence,
      "run",
      "sequences"
    );

    return await batchRunSequences(sequences);
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
    // Add batch operation functions
    handleBatchCreateSequence,
    handleBatchUpdateSequence,
    handleBatchDeleteSequence,
    handleBatchRunSequence,
    isOpen,
    onClose,
    selectedSequence,
    labwareList: labwareQuery.data || [],
  };
}
