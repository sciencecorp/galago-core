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
  Badge,
  Text,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { AddIcon } from "@chakra-ui/icons";
import { commandFields } from "../tools/constants";

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
  const { data: fetchedVariables } = trpc.variable.getAll.useQuery();

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
        toolId:
          selectedToolType === "toolbox"
            ? "tool_box"
            : selectedToolData?.name?.toLocaleLowerCase().replaceAll(" ", "_"),
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

  // Function to handle variable selection
  const handleVariableSelect = (fieldName: string, variableName: string) => {
    if (variableName === "") {
      // If clearing the variable selection
      const valueWithoutVariable = commandParams[fieldName];
      if (
        typeof valueWithoutVariable === "string" &&
        valueWithoutVariable.startsWith("{{") &&
        valueWithoutVariable.endsWith("}}")
      ) {
        // If it was a variable reference, clear it completely
        const newParams = { ...commandParams };
        delete newParams[fieldName];
        setCommandParams(newParams);
      }
    } else {
      // Set the parameter value to the variable reference format
      setCommandParams({
        ...commandParams,
        [fieldName]: `{{${variableName}}}`,
      });
    }
  };

  // Check if a parameter value is a variable reference
  const isVariableReference = (value: any): boolean => {
    return typeof value === "string" && value.startsWith("{{") && value.endsWith("}}");
  };

  // Extract variable name from variable reference
  const getVariableNameFromReference = (value: string): string => {
    if (isVariableReference(value)) {
      return value.slice(2, -2); // Remove {{ and }}
    }
    return "";
  };

  const renderField = (field: Field) => {
    // Get current value
    const currentValue = commandParams[field.name];
    const isVariable = isVariableReference(currentValue);
    const variableName = isVariable ? getVariableNameFromReference(currentValue) : "";

    // Special handling for PF400 location and sequence fields
    if (selectedToolType === "pf400") {
      // For move command's name parameter (locations)
      if (selectedCommand === "move" && field.name === "name") {
        return (
          <HStack width="100%">
            <Select
              flex={1}
              value={isVariable ? "" : currentValue || ""}
              onChange={(e) => {
                if (e.target.value) {
                  setCommandParams({ ...commandParams, [field.name]: e.target.value });
                }
              }}
              isDisabled={isVariable}>
              <option value="">Select location</option>
              {waypointsQuery.data?.locations.map((loc) => (
                <option key={loc.id} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </Select>
            <Select
              width="180px"
              value={variableName}
              onChange={(e) => handleVariableSelect(field.name, e.target.value)}>
              <option value="">No Variable</option>
              {fetchedVariables?.map((variable) => (
                <option key={variable.id} value={variable.name}>
                  {variable.name}
                </option>
              ))}
            </Select>
          </HStack>
        );
      }

      // For run_sequence command's sequence_name parameter
      if (selectedCommand === "run_sequence" && field.name === "sequence_name") {
        return (
          <HStack width="100%">
            <Select
              flex={1}
              value={isVariable ? "" : currentValue || ""}
              onChange={(e) => {
                if (e.target.value) {
                  setCommandParams({ ...commandParams, [field.name]: e.target.value });
                }
              }}
              isDisabled={isVariable}>
              <option value="">Select sequence</option>
              {waypointsQuery.data?.sequences.map((seq) => (
                <option key={seq.id} value={seq.name}>
                  {seq.name}
                </option>
              ))}
            </Select>
            <Select
              width="180px"
              value={variableName}
              onChange={(e) => handleVariableSelect(field.name, e.target.value)}>
              <option value="">No Variable</option>
              {fetchedVariables?.map((variable) => (
                <option key={variable.id} value={variable.name}>
                  {variable.name}
                </option>
              ))}
            </Select>
          </HStack>
        );
      }
    }

    // Default field rendering based on type
    switch (field.type) {
      case "number":
        return (
          <HStack width="100%">
            <NumberInput
              flex={1}
              value={isVariable ? "" : currentValue || field.defaultValue || ""}
              onChange={(value) => {
                if (!isVariable) {
                  setCommandParams({ ...commandParams, [field.name]: parseFloat(value) });
                }
              }}
              isDisabled={isVariable}>
              <NumberInputField placeholder={isVariable ? "Using variable" : "Enter value"} />
            </NumberInput>
            <Select
              width="180px"
              value={variableName}
              onChange={(e) => handleVariableSelect(field.name, e.target.value)}>
              <option value="">No Variable</option>
              {fetchedVariables?.map((variable) => (
                <option key={variable.id} value={variable.name}>
                  {variable.name}
                </option>
              ))}
            </Select>
          </HStack>
        );
      case "text_array":
        return (
          <HStack width="100%">
            <Input
              flex={1}
              value={
                isVariable
                  ? ""
                  : currentValue
                    ? JSON.stringify(currentValue)
                    : field.defaultValue
                      ? JSON.stringify(field.defaultValue)
                      : ""
              }
              onChange={(e) => {
                if (!isVariable) {
                  try {
                    const arrayValue = JSON.parse(e.target.value);
                    setCommandParams({ ...commandParams, [field.name]: arrayValue });
                  } catch {
                    // If parsing fails, store as string
                    setCommandParams({ ...commandParams, [field.name]: e.target.value });
                  }
                }
              }}
              placeholder={
                isVariable ? "Using variable" : "Enter as JSON array: ['item1', 'item2']"
              }
              isDisabled={isVariable}
            />
            <Select
              width="180px"
              value={variableName}
              onChange={(e) => handleVariableSelect(field.name, e.target.value)}>
              <option value="">No Variable</option>
              {fetchedVariables?.map((variable) => (
                <option key={variable.id} value={variable.name}>
                  {variable.name}
                </option>
              ))}
            </Select>
          </HStack>
        );
      case "boolean":
        return (
          <HStack width="100%">
            <Select
              flex={1}
              value={
                isVariable
                  ? ""
                  : currentValue?.toString() || field.defaultValue?.toString() || "false"
              }
              onChange={(e) => {
                if (!isVariable) {
                  setCommandParams({ ...commandParams, [field.name]: e.target.value === "true" });
                }
              }}
              isDisabled={isVariable}>
              <option value="">Select value</option>
              <option value="true">True</option>
              <option value="false">False</option>
            </Select>
            <Select
              width="180px"
              value={variableName}
              onChange={(e) => handleVariableSelect(field.name, e.target.value)}>
              <option value="">No Variable</option>
              {fetchedVariables?.map((variable) => (
                <option key={variable.id} value={variable.name}>
                  {variable.name}
                </option>
              ))}
            </Select>
          </HStack>
        );
      default:
        return (
          <HStack width="100%">
            <Input
              flex={1}
              value={isVariable ? "" : currentValue || field.defaultValue || ""}
              onChange={(e) => {
                if (!isVariable) {
                  setCommandParams({ ...commandParams, [field.name]: e.target.value });
                }
              }}
              placeholder={isVariable ? "Using variable" : "Enter value"}
              isDisabled={isVariable}
            />
            <Select
              width="180px"
              value={variableName}
              onChange={(e) => handleVariableSelect(field.name, e.target.value)}>
              <option value="">No Variable</option>
              {fetchedVariables?.map((variable) => (
                <option key={variable.id} value={variable.name}>
                  {variable.name}
                </option>
              ))}
            </Select>
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
                {fields.map((field: Field) => {
                  const isVariable = isVariableReference(commandParams[field.name]);
                  const variableName = isVariable
                    ? getVariableNameFromReference(commandParams[field.name])
                    : "";

                  return (
                    <FormControl key={field.name}>
                      <FormLabel>
                        {field.name}
                        {isVariable && (
                          <Badge ml={2} colorScheme="green">
                            Variable: {variableName}
                          </Badge>
                        )}
                      </FormLabel>
                      {renderField(field)}
                    </FormControl>
                  );
                })}
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
