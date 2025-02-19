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
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { commandFields, Field, Command } from "@/pages/tools/[id]";
import { AddIcon } from "@chakra-ui/icons";

interface AddToolCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  protocolId: string;
  onCommandAdded: (newCommand: any) => void;
  protocolParams?: Record<string, any>;
}

export const AddToolCommandModal: React.FC<AddToolCommandModalProps> = ({
  isOpen,
  onClose,
  protocolId,
  onCommandAdded,
  protocolParams = {},
}) => {
  const toast = useToast();
  const [selectedToolType, setSelectedToolType] = useState("");
  const [selectedCommand, setSelectedCommand] = useState("");
  const [commandParams, setCommandParams] = useState<Record<string, any>>({});

  const toolsQuery = trpc.tool.getAll.useQuery();
  const toolBoxQuery = trpc.tool.getToolBox.useQuery();
  const selectedToolData =
    toolsQuery.data?.find((tool) => tool.type === selectedToolType) ||
    (toolBoxQuery.data?.type === selectedToolType ? toolBoxQuery.data : undefined);

  // Query for PF400 locations and sequences when needed
  const waypointsQuery = trpc.robotArm.waypoints.getAll.useQuery(
    { toolId: selectedToolData?.id || 0 },
    { enabled: !!selectedToolData?.id && selectedToolType === "pf400" },
  );

  // Reset params when tool or command changes
  useEffect(() => {
    setCommandParams({});
  }, [selectedToolType, selectedCommand]);

  // Get available commands for the selected tool
  const availableCommands: Command = selectedToolType ? commandFields[selectedToolType] || {} : {};

  // Get fields for the selected command
  const fields: Field[] =
    selectedToolType && selectedCommand ? availableCommands[selectedCommand] || [] : [];

  const handleSubmit = () => {
    const newCommand = {
      queueId: Date.now(),
      commandInfo: {
        toolId: selectedToolType === "toolbox" ? "tool_box" : selectedToolData?.id?.toString(),
        toolType: selectedToolType,
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
  };

  const renderField = (field: Field) => {
    // Add parameter reference button
    const ParameterReferenceButton = () => (
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Insert parameter reference"
          icon={<AddIcon />}
          size="sm"
          variant="ghost"
        />
        <MenuList>
          {Object.entries(protocolParams).map(([paramName, schema]) => (
            <MenuItem
              key={paramName}
              onClick={() => {
                setCommandParams({
                  ...commandParams,
                  [field.name]: `\${${paramName}}`,
                });
              }}>
              {paramName} ({schema.type})
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    );

    // Special handling for PF400 location and sequence fields
    if (selectedToolType === "pf400") {
      // For move command's name parameter (locations)
      if (selectedCommand === "move" && field.name === "name") {
        return (
          <Select
            value={commandParams[field.name] || ""}
            onChange={(e) => setCommandParams({ ...commandParams, [field.name]: e.target.value })}>
            <option value="">Select location</option>
            {waypointsQuery.data?.locations.map((loc) => (
              <option key={loc.id} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </Select>
        );
      }

      // For run_sequence command's sequence_name parameter
      if (selectedCommand === "run_sequence" && field.name === "sequence_name") {
        return (
          <Select
            value={commandParams[field.name] || ""}
            onChange={(e) => setCommandParams({ ...commandParams, [field.name]: e.target.value })}>
            <option value="">Select sequence</option>
            {waypointsQuery.data?.sequences.map((seq) => (
              <option key={seq.id} value={seq.name}>
                {seq.name}
              </option>
            ))}
          </Select>
        );
      }
    }

    // Default field rendering based on type
    switch (field.type) {
      case "number":
        return (
          <HStack>
            <NumberInput
              flex={1}
              value={commandParams[field.name] || field.defaultValue || ""}
              onChange={(value) =>
                setCommandParams({ ...commandParams, [field.name]: parseFloat(value) })
              }>
              <NumberInputField />
            </NumberInput>
            <ParameterReferenceButton />
          </HStack>
        );
      case "text_array":
        return (
          <HStack>
            <Input
              flex={1}
              value={
                commandParams[field.name]
                  ? JSON.stringify(commandParams[field.name])
                  : field.defaultValue
                    ? JSON.stringify(field.defaultValue)
                    : ""
              }
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
            <ParameterReferenceButton />
          </HStack>
        );
      case "boolean":
        return (
          <HStack>
            <Select
              flex={1}
              value={
                commandParams[field.name]?.toString() || field.defaultValue?.toString() || "false"
              }
              onChange={(e) =>
                setCommandParams({ ...commandParams, [field.name]: e.target.value === "true" })
              }>
              <option value="true">True</option>
              <option value="false">False</option>
            </Select>
            <ParameterReferenceButton />
          </HStack>
        );
      default:
        return (
          <HStack>
            <Input
              flex={1}
              value={commandParams[field.name] || field.defaultValue || ""}
              onChange={(e) => setCommandParams({ ...commandParams, [field.name]: e.target.value })}
            />
            <ParameterReferenceButton />
          </HStack>
        );
    }
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
                value={selectedToolType}
                onChange={(e) => {
                  setSelectedToolType(e.target.value);
                  setSelectedCommand("");
                  setCommandParams({});
                }}>
                {toolsQuery.data?.map((tool) => (
                  <option key={tool.type} value={tool.type}>
                    {tool.type}
                  </option>
                ))}
                {toolBoxQuery.data && (
                  <option key={toolBoxQuery.data.type} value={toolBoxQuery.data.type}>
                    {toolBoxQuery.data.type}
                  </option>
                )}
              </Select>
            </FormControl>

            {selectedToolType && (
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
                    {renderField(field)}
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
            isDisabled={!selectedToolType || !selectedCommand}>
            Add Command
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
