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
} from "@chakra-ui/react";
import { useState } from "react";
import { trpc } from "@/utils/trpc";
import { z } from "zod";
import { mockToolCommands } from "@/mocks/mockToolCommands";

interface AddToolCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  protocolId: string;
  onCommandAdded: (newCommand: any) => void;
}

interface ToolCommand {
  schema: z.ZodSchema;
  // Add other properties if needed
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
  const availableCommands = selectedTool
    ? (mockToolCommands[selectedTool as keyof typeof mockToolCommands] as Record<
        string,
        ToolCommand
      >) || {}
    : {};

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

  let commandSchema;
  if (availableCommands[selectedCommand as keyof typeof availableCommands]) {
    commandSchema = availableCommands[selectedCommand as keyof typeof availableCommands]?.schema;
  }

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

            {commandSchema && (
              <VStack spacing={4} align="stretch" width="100%">
                {Object.entries(commandSchema || {}).map(([param, schema]) => (
                  <FormControl key={param}>
                    <FormLabel>{param}</FormLabel>
                    <Input
                      value={commandParams[param] || ""}
                      onChange={(e) =>
                        setCommandParams({ ...commandParams, [param]: e.target.value })
                      }
                    />
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
