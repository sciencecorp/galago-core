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
  Select,
  NumberInput,
  NumberInputField,
  Text,
  Badge,
  HStack,
} from "@chakra-ui/react";
import { errorToast } from "@/components/ui/Toast";
import { BravoProtocolCommand } from "@/server/schemas/bravo";

interface BravoCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCommand: (command: Omit<BravoProtocolCommand, "id" | "protocol_id">) => void;
  deckConfigs: any[];
  parentCommand?: BravoProtocolCommand | null;
}

// Available Bravo commands
const BRAVO_COMMANDS = [
  { value: "home", label: "Home", category: "basic" },
  { value: "mix", label: "Mix", category: "basic" },
  { value: "aspirate", label: "Aspirate", category: "basic" },
  { value: "dispense", label: "Dispense", category: "basic" },
  { value: "tips_on", label: "Tips On", category: "basic" },
  { value: "tips_off", label: "Tips Off", category: "basic" },
  { value: "move_to_location", label: "Move to Location", category: "basic" },
  { value: "configure_deck", label: "Configure Deck", category: "basic" },
  { value: "loop", label: "Loop (Repeat N Times)", category: "control" },
  { value: "group", label: "Group", category: "control" },
];

export const BravoCommandModal: React.FC<BravoCommandModalProps> = ({
  isOpen,
  onClose,
  onAddCommand,
  deckConfigs,
  parentCommand,
}) => {
  const [commandType, setCommandType] = useState("");
  const [label, setLabel] = useState("");
  const [params, setParams] = useState<Record<string, any>>({});

  useEffect(() => {
    if (isOpen) {
      setCommandType("");
      setLabel("");
      setParams({});
    }
  }, [isOpen]);

  // Update params based on selected command
  useEffect(() => {
    if (commandType) {
      // Set default parameters based on command type
      let defaultParams: Record<string, any> = {};

      switch (commandType) {
        case "aspirate":
        case "dispense":
          defaultParams = {
            location: 1,
            volume: 100,
          };
          break;
        case "mix":
          defaultParams = {
            location: 1,
            volume: 100,
            cycles: 3,
          };
          break;
        case "tips_on":
        case "tips_off":
          defaultParams = {
            location: 1,
          };
          break;
        case "move_to_location":
          defaultParams = {
            location: 1,
          };
          break;
        case "configure_deck":
          defaultParams = {
            deck_config_id: deckConfigs[0]?.id || 1,
          };
          break;
        case "loop":
          defaultParams = {
            iterations: 3,
          };
          break;
        case "group":
          defaultParams = {};
          break;
        case "home":
        case "show_diagnostics":
          defaultParams = {};
          break;
      }

      setParams(defaultParams);

      // Set default label if not already set
      if (!label) {
        const command = BRAVO_COMMANDS.find((c) => c.value === commandType);
        setLabel(command?.label || commandType);
      }
    }
  }, [commandType, deckConfigs]);

  const handleSave = () => {
    if (!commandType || !label.trim()) {
      errorToast("Error", "Command type and label are required");
      return;
    }

    // Validate loop iterations
    if (commandType === "loop" && (!params.iterations || params.iterations < 1)) {
      errorToast("Error", "Loop must have at least 1 iteration");
      return;
    }

    const commandData: Omit<BravoProtocolCommand, "id" | "protocol_id"> = {
      command_type: commandType as any,
      label,
      params,
      position: 0, // Will be set by parent
      parent_command_id: parentCommand?.id,
      child_commands: [],
    };

    onAddCommand(commandData);
    onClose();
  };

  const renderParamFields = () => {
    switch (commandType) {
      case "aspirate":
      case "dispense":
        return (
          <>
            <FormControl isRequired>
              <FormLabel>Location (Deck Position)</FormLabel>
              <NumberInput
                value={params.location || 1}
                min={1}
                max={9}
                onChange={(valueString) => {
                  setParams({ ...params, location: parseInt(valueString) || 1 });
                }}>
                <NumberInputField />
              </NumberInput>
              <Text fontSize="xs" color="gray.500" mt={1}>
                Deck position (1-9)
              </Text>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Volume (µL)</FormLabel>
              <NumberInput
                value={params.volume || 100}
                min={0}
                onChange={(valueString) => {
                  setParams({ ...params, volume: parseFloat(valueString) || 100 });
                }}>
                <NumberInputField />
              </NumberInput>
            </FormControl>
          </>
        );

      case "mix":
        return (
          <>
            <FormControl isRequired>
              <FormLabel>Location (Deck Position)</FormLabel>
              <NumberInput
                value={params.location || 1}
                min={1}
                max={9}
                onChange={(valueString) => {
                  setParams({ ...params, location: parseInt(valueString) || 1 });
                }}>
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Volume (µL)</FormLabel>
              <NumberInput
                value={params.volume || 100}
                min={0}
                onChange={(valueString) => {
                  setParams({ ...params, volume: parseFloat(valueString) || 100 });
                }}>
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Cycles</FormLabel>
              <NumberInput
                value={params.cycles || 3}
                min={1}
                onChange={(valueString) => {
                  setParams({ ...params, cycles: parseInt(valueString) || 3 });
                }}>
                <NumberInputField />
              </NumberInput>
            </FormControl>
          </>
        );

      case "tips_on":
      case "tips_off":
      case "move_to_location":
        return (
          <FormControl isRequired>
            <FormLabel>Location (Deck Position)</FormLabel>
            <NumberInput
              value={params.location || 1}
              min={1}
              max={9}
              onChange={(valueString) => {
                setParams({ ...params, location: parseInt(valueString) || 1 });
              }}>
              <NumberInputField />
            </NumberInput>
            <Text fontSize="xs" color="gray.500" mt={1}>
              Deck position (1-9)
            </Text>
          </FormControl>
        );

      case "configure_deck":
        return (
          <FormControl isRequired>
            <FormLabel>Deck Configuration</FormLabel>
            <Select
              value={params.deck_config_id || deckConfigs[0]?.id}
              onChange={(e) => {
                setParams({ ...params, deck_config_id: parseInt(e.target.value) });
              }}>
              {deckConfigs.map((config) => (
                <option key={config.id} value={config.id}>
                  {config.name}
                </option>
              ))}
            </Select>
          </FormControl>
        );

      case "loop":
        return (
          <>
            <FormControl isRequired>
              <FormLabel>Number of Iterations</FormLabel>
              <NumberInput
                value={params.iterations || 3}
                min={1}
                max={1000}
                onChange={(valueString) => {
                  setParams({ ...params, iterations: parseInt(valueString) || 3 });
                }}>
                <NumberInputField />
              </NumberInput>
              <Text fontSize="xs" color="gray.500" mt={1}>
                How many times to repeat the commands inside this loop
              </Text>
            </FormControl>
            <Text fontSize="sm" color="blue.500" fontStyle="italic">
              After creating the loop, you can drag commands into it.
            </Text>
          </>
        );

      case "group":
        return (
          <>
            <Text fontSize="sm" color="gray.500">
              A group is a container for organizing related commands.
            </Text>
            <Text fontSize="sm" color="blue.500" fontStyle="italic">
              After creating the group, you can drag commands into it.
            </Text>
          </>
        );

      case "home":
      case "show_diagnostics":
        return (
          <Text fontSize="sm" color="gray.500">
            This command has no parameters.
          </Text>
        );

      default:
        return null;
    }
  };

  const getCommandCategory = (type: string) => {
    return BRAVO_COMMANDS.find((c) => c.value === type)?.category || "basic";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Text>Add Bravo Command</Text>
            {parentCommand && (
              <Badge colorScheme="purple" ml={2}>
                Inside: {parentCommand.label}
              </Badge>
            )}
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Command Type</FormLabel>
              <Select
                placeholder="Select command"
                value={commandType}
                onChange={(e) => setCommandType(e.target.value)}>
                <optgroup label="Basic Commands">
                  {BRAVO_COMMANDS.filter((c) => c.category === "basic").map((cmd) => (
                    <option key={cmd.value} value={cmd.value}>
                      {cmd.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Control Flow">
                  {BRAVO_COMMANDS.filter((c) => c.category === "control").map((cmd) => (
                    <option key={cmd.value} value={cmd.value}>
                      {cmd.label}
                    </option>
                  ))}
                </optgroup>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Label</FormLabel>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Enter a descriptive label"
              />
            </FormControl>

            {commandType && (
              <VStack spacing={4} align="stretch">
                <Text fontWeight="bold" fontSize="sm">
                  Parameters
                </Text>
                {renderParamFields()}
              </VStack>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            isDisabled={!commandType || !label.trim()}
            colorScheme="blue"
            onClick={handleSave}>
            Add Command
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
