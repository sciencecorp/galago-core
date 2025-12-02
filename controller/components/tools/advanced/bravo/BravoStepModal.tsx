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
} from "@chakra-ui/react";
import { errorToast } from "@/components/ui/Toast";
import { BravoSequenceStep } from "@/server/schemas";

interface BravoStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStep: (step: Omit<BravoSequenceStep, "id" | "sequence_id">) => void;
  deckConfigs: any[];
}

// Available Bravo commands
const BRAVO_COMMANDS = [
  { value: "home", label: "Home" },
  { value: "mix", label: "Mix" },
  { value: "aspirate", label: "Aspirate" },
  { value: "dispense", label: "Dispense" },
  { value: "tips_on", label: "Tips On" },
  { value: "tips_off", label: "Tips Off" },
  { value: "move_to_location", label: "Move to Location" },
];

export const BravoStepModal: React.FC<BravoStepModalProps> = ({
  isOpen,
  onClose,
  onAddStep,
  deckConfigs,
}) => {
  const [commandName, setCommandName] = useState("");
  const [label, setLabel] = useState("");
  const [params, setParams] = useState<Record<string, any>>({});

  useEffect(() => {
    if (isOpen) {
      setCommandName("");
      setLabel("");
      setParams({});
    }
  }, [isOpen]);

  // Update params based on selected command
  useEffect(() => {
    if (commandName) {
      // Set default parameters based on command type
      let defaultParams: Record<string, any> = {};

      switch (commandName) {
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
        case "home":
        case "show_diagnostics":
          defaultParams = {};
          break;
      }

      setParams(defaultParams);

      // Set default label if not already set
      if (!label) {
        const command = BRAVO_COMMANDS.find((c) => c.value === commandName);
        setLabel(command?.label || commandName);
      }
    }
  }, [commandName]);

  const handleSave = () => {
    if (!commandName || !label.trim()) {
      errorToast("Error", "Command and label are required");
      return;
    }

    const stepData: Omit<BravoSequenceStep, "id" | "sequence_id"> = {
      command_name: commandName as any,
      label,
      params,
      position: 0, // Will be set by parent
    };

    onAddStep(stepData);
    onClose();
  };

  const renderParamFields = () => {
    switch (commandName) {
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Bravo Step</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Command</FormLabel>
              <Select
                placeholder="Select command"
                value={commandName}
                onChange={(e) => setCommandName(e.target.value)}>
                {BRAVO_COMMANDS.map((cmd) => (
                  <option key={cmd.value} value={cmd.value}>
                    {cmd.label}
                  </option>
                ))}
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

            {commandName && (
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
            isDisabled={!commandName || !label.trim()}
            colorScheme="blue"
            onClick={handleSave}>
            Add Step
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
