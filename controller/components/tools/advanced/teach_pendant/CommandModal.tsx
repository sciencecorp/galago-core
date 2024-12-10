import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Select,
  Input,
  NumberInput,
  NumberInputField,
  VStack,
} from "@chakra-ui/react";

interface CommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCommand: (command: { command: string; params: Record<string, any> }) => void;
}

const availableCommands = {
  move: [
    { name: "waypoint", type: "text" },
    { name: "motion_profile_id", type: "number", defaultValue: 2 },
  ],
  grasp_plate: [
    { name: "width", type: "number", defaultValue: 122 },
    { name: "speed", type: "number", defaultValue: 10 },
    { name: "force", type: "number", defaultValue: 20 },
  ],
  release_plate: [
    { name: "width", type: "number", defaultValue: 130 },
    { name: "speed", type: "number", defaultValue: 10 },
  ],
  approach: [
    { name: "nest", type: "text" },
    { name: "x_offset", type: "number", defaultValue: 0 },
    { name: "y_offset", type: "number", defaultValue: 0 },
    { name: "z_offset", type: "number", defaultValue: 0 },
    { name: "motion_profile_id", type: "number", defaultValue: 2 },
    { name: "ignore_safepath", type: "text", defaultValue: "false" },
  ],
  leave: [
    { name: "nest", type: "text" },
    { name: "x_offset", type: "number", defaultValue: 0 },
    { name: "y_offset", type: "number", defaultValue: 0 },
    { name: "z_offset", type: "number", defaultValue: 0 },
    { name: "motion_profile_id", type: "number", defaultValue: 2 },
  ],
  retrieve_plate: [
    { name: "labware", type: "text" },
    { name: "location", type: "text" },
    { name: "motion_profile_id", type: "number", defaultValue: 2 },
  ],
  dropoff_plate: [
    { name: "labware", type: "text" },
    { name: "location", type: "text" },
    { name: "motion_profile_id", type: "number", defaultValue: 2 },
  ],
  free: [],
  unfree: [],
  unwind: [],
};

export const CommandModal: React.FC<CommandModalProps> = ({ isOpen, onClose, onAddCommand }) => {
  const [selectedCommand, setSelectedCommand] = useState("");
  const [params, setParams] = useState<Record<string, any>>({});

  const handleCommandSelect = (command: string) => {
    setSelectedCommand(command);
    // Initialize params with default values
    const defaultParams = availableCommands[command as keyof typeof availableCommands].reduce(
      (acc, field) => {
        acc[field.name] = field.defaultValue ?? "";
        return acc;
      },
      {} as Record<string, any>,
    );
    setParams(defaultParams);
  };

  const handleSubmit = () => {
    onAddCommand({
      command: selectedCommand,
      params,
    });
    onClose();
    setSelectedCommand("");
    setParams({});
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Command</ModalHeader>
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Command</FormLabel>
              <Select
                placeholder="Select command"
                value={selectedCommand}
                onChange={(e) => handleCommandSelect(e.target.value)}>
                {Object.keys(availableCommands).map((cmd) => (
                  <option key={cmd} value={cmd}>
                    {cmd}
                  </option>
                ))}
              </Select>
            </FormControl>

            {selectedCommand &&
              availableCommands[selectedCommand as keyof typeof availableCommands].map((field) => (
                <FormControl key={field.name}>
                  <FormLabel>{field.name}</FormLabel>
                  {field.type === "number" ? (
                    <NumberInput
                      value={params[field.name]}
                      onChange={(_, value) => setParams({ ...params, [field.name]: value })}>
                      <NumberInputField />
                    </NumberInput>
                  ) : (
                    <Input
                      value={params[field.name]}
                      onChange={(e) => setParams({ ...params, [field.name]: e.target.value })}
                    />
                  )}
                </FormControl>
              ))}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit} isDisabled={!selectedCommand}>
            Add Command
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
