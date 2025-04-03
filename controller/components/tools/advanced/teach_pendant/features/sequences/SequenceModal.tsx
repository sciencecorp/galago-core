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
  Select,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { Tool } from "@/types/api";
import { CommandModal } from "./CommandModal";
import { Sequence, SequenceCommand, TeachPoint, MotionProfile, GripParams } from "../../types/";
import { trpc } from "@/utils/trpc";
import { errorToast } from "@/components/ui/Toast";

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
  const [labware, setLabware] = useState(sequence?.labware ?? "default");
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);
  const toast = useToast();
  const { data: labwareList } = trpc.labware.getAll.useQuery();

  useEffect(() => {
    if (isOpen) {
      setName(sequence?.name ?? "");
      setDescription(sequence?.description ?? "");
      setCommands(sequence?.commands ?? []);
      setLabware(sequence?.labware ?? "default");
      setIsCommandModalOpen(false);
    }
  }, [isOpen, sequence]);

  const handleAddCommand = (command: { command: string; params: Record<string, any> }) => {
    const newCommand = { ...command, order: commands.length };
    const newCommands = [...commands, newCommand];
    setCommands(newCommands);
    setIsCommandModalOpen(false);
  };

  const handleRemoveCommand = (index: number) => {
    const newCommands = commands
      .filter((_, i) => i !== index)
      .map((cmd, i) => ({
        ...cmd,
        order: i,
      }));
    setCommands(newCommands);
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
      labware,
    };

    onSave(sequenceData);
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{sequence ? "Edit Sequence" : "New Sequence"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </FormControl>

              <FormControl>
                <FormLabel>Labware</FormLabel>
                <Select
                  value={labware}
                  onChange={(e) => setLabware(e.target.value)}
                  placeholder="Select labware">
                  <option value="default">Default</option>
                  {labwareList
                    ?.filter((item) => item.name.toLowerCase() !== "default")
                    .map((item) => (
                      <option key={item.id} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                </Select>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Select the labware to use when running this sequence
                </Text>
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </FormControl>

              <Box>
                <HStack justify="space-between" mb={2}>
                  <Heading size="sm">Commands</Heading>
                  <Button size="sm" onClick={() => setIsCommandModalOpen(true)}>
                    Add Command
                  </Button>
                </HStack>
                {commands.length === 0 ? (
                  <Text fontSize="sm" color="gray.500">
                    No commands added yet
                  </Text>
                ) : (
                  <VStack align="stretch" spacing={2}>
                    {commands.map((cmd, index) => (
                      <HStack key={index} p={2} borderWidth="1px" borderRadius="md">
                        <Box flex={1}>
                          <Text fontWeight="bold">{cmd.command}</Text>
                          <Text fontSize="sm">
                            {Object.entries(cmd.params)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(", ")}
                          </Text>
                        </Box>
                        <IconButton
                          aria-label="Remove command"
                          icon={<DeleteIcon />}
                          size="sm"
                          onClick={() => handleRemoveCommand(index)}
                        />
                      </HStack>
                    ))}
                  </VStack>
                )}
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
