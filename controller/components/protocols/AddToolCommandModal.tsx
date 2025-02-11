import {
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  VStack,
  Input,
  useToast,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react";
import { useState } from "react";
import { trpc } from "@/utils/trpc";
import { commandFields, Field, Command } from "@/pages/tools/[id]";

interface AddToolCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  protocolId: string;
  onCommandAdded: (newCommand: any) => void;
}

export const AddToolCommandModal: React.FC<AddToolCommandModalProps> = ({
  isOpen,
  onClose,
  protocolId,
  onCommandAdded,
}) => {
  const toast = useToast();
  const [selectedTool, setSelectedTool] = useState("");
  const [selectedCommand, setSelectedCommand] = useState("");
  const [commandParams, setCommandParams] = useState<Record<string, any>>({});

  const toolsQuery = trpc.tool.getAll.useQuery();
  
  // Get available commands for the selected tool
  const availableCommands: Command = selectedTool ? commandFields[selectedTool] || {} : {};
  
  // Get fields for the selected command
  const fields: Field[] = selectedTool && selectedCommand ? availableCommands[selectedCommand] || [] : [];

  const handleSubmit = () => {
    const toolId = toolsQuery.data?.find((tool) => tool.type === selectedTool)?.id || "0";

    const newCommand = {
      queueId: Date.now(),
      commandInfo: {
        toolId: toolId,
        toolType: selectedTool,
        command: selectedCommand,
        params: commandParams,
        label: "",
      },
      status: "CREATED",
      estimatedDuration: 0,
      createdAt: new Date(),
      startedAt: new Date(),
      completedAt: null,
      failedAt: null,
      skippedAt: null,
      runId: null,
    };
    onCommandAdded(newCommand);
    onClose();
    toast({
      title: "Command added",
      status: "success",
      duration: 3000,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Tool Command</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Tool</FormLabel>
              <Select
                placeholder="Select tool"
                value={selectedTool}
                onChange={(e) => {
                  setSelectedTool(e.target.value);
                  setSelectedCommand("");
                  setCommandParams({});
                }}>
                {toolsQuery.data?.map((tool) => (
                  <option key={tool.type} value={tool.type}>
                    {tool.type}
                  </option>
                ))}
              </Select>
            </FormControl>

            {selectedTool && (
              <FormControl isRequired>
                <FormLabel>Command</FormLabel>
                <Select
                  placeholder="Select command"
                  value={selectedCommand}
                  onChange={(e) => {
                    setSelectedCommand(e.target.value);
                    setCommandParams({});
                  }}>
                  {Object.keys(availableCommands).map((command) => (
                    <option key={command} value={command}>
                      {command}
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}

            {fields.length > 0 && (
              <VStack spacing={4} align="stretch" width="100%">
                {fields.map((field: Field) => (
                  <FormControl key={field.name}>
                    <FormLabel>{field.name}</FormLabel>
                    {field.type === "number" ? (
                      <NumberInput
                        value={commandParams[field.name] || field.defaultValue || ""}
                        onChange={(value) =>
                          setCommandParams({ ...commandParams, [field.name]: parseFloat(value) })
                        }
                      >
                        <NumberInputField />
                      </NumberInput>
                    ) : field.type === "text_array" ? (
                      <Input
                        value={commandParams[field.name] ? JSON.stringify(commandParams[field.name]) : field.defaultValue ? JSON.stringify(field.defaultValue) : ""}
                        onChange={(e) => {
                          try {
                            const arrayValue = JSON.parse(e.target.value);
                            setCommandParams({ ...commandParams, [field.name]: arrayValue });
                          } catch {
                            // If parsing fails, store as string
                            setCommandParams({ ...commandParams, [field.name]: e.target.value });
                          }
                        }}
                        placeholder="Enter as JSON array: ['item1', 'item2']"
                      />
                    ) : field.type === "boolean" ? (
                      <Select
                        value={commandParams[field.name]?.toString() || field.defaultValue?.toString() || "false"}
                        onChange={(e) => 
                          setCommandParams({ ...commandParams, [field.name]: e.target.value === "true" })
                        }
                      >
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </Select>
                    ) : (
                      <Input
                        value={commandParams[field.name] || field.defaultValue || ""}
                        onChange={(e) =>
                          setCommandParams({ ...commandParams, [field.name]: e.target.value })
                        }
                      />
                    )}
                  </FormControl>
                ))}
              </VStack>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={false}
            isDisabled={!selectedTool || !selectedCommand}>
            Add Command
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
