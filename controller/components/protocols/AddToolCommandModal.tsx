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
  NumberInput,
  NumberInputField,
  HStack,
  IconButton,
  Badge,
  Text,
  Box,
  SimpleGrid,
  Image,
  Flex,
  InputGroup,
  InputLeftElement,
  Tag,
  useColorModeValue,
  useSteps,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepTitle,
  StepDescription,
  StepSeparator,
  StepIcon,
  StepNumber,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { commandFields } from "../tools/constants";
import { capitalizeFirst } from "@/utils/parser";
import {
  ToolCase,
  Search,
  Wrench,
  FileCode,
  MessageSquare,
  PauseCircle,
  AlarmClock,
  StickyNote,
  StopCircle,
  Repeat,
  Variable,
  List,
  Volume2,
} from "lucide-react";
import { warningToast } from "../ui/Toast";

interface AddToolCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommandAdded: (newCommand: any) => void;
}

// Icon mapping for toolbox commands
const getToolBoxCommandIcon = (commandName: string) => {
  const iconMap: Record<string, JSX.Element> = {
    run_script: <FileCode style={{ width: "100%", height: "50px" }} />,
    show_message: <MessageSquare style={{ width: "100%", height: "50px" }} />,
    pause: <PauseCircle style={{ width: "100%", height: "50px" }} />,
    timer: <AlarmClock style={{ width: "100%", height: "50px" }} />,
    note: <StickyNote style={{ width: "100%", height: "50px" }} />,
    stop_run: <StopCircle style={{ width: "100%", height: "50px", color: "red" }} />,
    goto: <Repeat style={{ width: "100%", height: "50px" }} />,
    variable_assignment: <Variable style={{ width: "100%", height: "50px" }} />,
    user_form: <List style={{ width: "100%", height: "50px" }} />,
    text_to_speech: <Volume2 style={{ width: "100%", height: "50px" }} />,
  };
  return iconMap[commandName] || <Wrench style={{ width: "100%", height: "50px" }} />;
};

export const AddToolCommandModal: React.FC<AddToolCommandModalProps> = ({
  isOpen,
  onClose,
  onCommandAdded,
}) => {
  const [selectedToolId, setSelectedToolId] = useState<number | string>("");
  const [selectedToolType, setSelectedToolType] = useState("");
  const [selectedCommand, setSelectedCommand] = useState("");
  const [commandParams, setCommandParams] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState("");

  // For the stepper UI
  const steps = [
    { title: "Select Tool", description: "Choose a tool to use" },
    { title: "Select Command", description: "Choose a command" },
    { title: "Configure Parameters", description: "Command Inputs." },
  ];
  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });

  const toolsQuery = trpc.tool.getAll.useQuery();
  const toolBoxQuery = trpc.tool.getToolBox.useQuery();
  const { data: fetchedVariables } = trpc.variable.getAll.useQuery();
  const { data: labwareData } = trpc.labware.getAll.useQuery();
  const { data: forms } = trpc.form.getAll.useQuery();

  const selectedToolData =
    toolsQuery.data?.find((tool) => tool.id === selectedToolId) ||
    (toolBoxQuery.data?.id === selectedToolId ? toolBoxQuery.data : undefined);

  // Query for PF400 locations and sequences when needed
  const waypointsQuery = trpc.robotArm.waypoints.getAll.useQuery(
    { toolId: selectedToolData?.id || 0 },
    { enabled: !!selectedToolData?.id && selectedToolType === "pf400" },
  );

  useEffect(() => {
    if (selectedToolType && selectedCommand) {
      const availableCommands = commandFields[selectedToolType] || {};
      const fields = availableCommands[selectedCommand] || [];

      const initialParams: Record<string, any> = {};
      fields.forEach((field: Field) => {
        if (field.defaultValue !== undefined) {
          initialParams[field.name] = field.defaultValue;
        } else if (field.name === "labware") {
          // Check if there's a labware named "default" in the database first
          if (labwareData?.some((labware) => labware.name.toLowerCase() === "default")) {
            // If it exists in labwareData, use the exact case that exists in the database
            const defaultLabware = labwareData.find(
              (labware) => labware.name.toLowerCase() === "default",
            );
            initialParams[field.name] = defaultLabware?.name || "default";
          } else {
            // Otherwise use the lowercase "default"
            initialParams[field.name] = "default";
          }
        }
      });

      setCommandParams(initialParams);
    } else {
      setCommandParams({});
    }
  }, [selectedToolType, selectedCommand, labwareData]);

  // Get available commands for the selected tool
  const availableCommands: Command = selectedToolType ? commandFields[selectedToolType] || {} : {};

  // Get fields for the selected command
  const fields: Field[] =
    selectedToolType && selectedCommand
      ? commandFields[selectedToolType]?.[selectedCommand] || []
      : [];

  // Get available tools with their IDs and names
  const availableTools = [
    ...(toolsQuery.data || []).map((tool) => ({
      id: tool.id,
      type: tool.type,
      name: tool.name || capitalizeFirst(tool.type.replaceAll("_", " ")),
    })),
  ];

  if (toolBoxQuery.data) {
    availableTools.push({
      id: toolBoxQuery.data.id,
      type: toolBoxQuery.data.type,
      name: "Tool Box",
    });
  }

  // Filter tools based on search query (now searching by name, not just type)
  const filteredTools = availableTools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.type.toLowerCase().replace(/_/g, " ").includes(searchQuery.toLowerCase()),
  );

  const handleToolSelect = (tool: { id: number | string; type: string; name: string }) => {
    setSelectedToolId(tool.id);
    setSelectedToolType(tool.type);
    setSelectedCommand("");
    setCommandParams({});
  };

  const handleNextStep = () => {
    if (activeStep === 0 && !selectedToolType) {
      warningToast("Warning", "No tool selected");
      return;
    }
    if (activeStep === 1 && !selectedCommand) {
      warningToast("Warning", "No command selected");
      return;
    }
    setActiveStep(activeStep + 1);
  };

  const handlePreviousStep = () => {
    setActiveStep(activeStep - 1);
  };

  const handleSubmit = () => {
    // Ensure all fields have values (default or entered)
    const finalParams = { ...commandParams };

    // Add missing fields with empty strings to ensure they're saved
    fields.forEach((field: Field) => {
      if (finalParams[field.name] === undefined) {
        if (field.type === "number") {
          finalParams[field.name] = 0;
        } else if (field.type === "boolean") {
          finalParams[field.name] = false;
        } else if (field.type === "text_array") {
          finalParams[field.name] = [];
        } else {
          finalParams[field.name] = "";
        }
      }
    });

    const newCommand = {
      commandInfo: {
        toolId:
          selectedToolType === "toolbox"
            ? "tool_box"
            : selectedToolData?.name?.toLocaleLowerCase().replaceAll(" ", "_"),
        toolType: selectedToolType,
        command: selectedCommand,
        params: finalParams, // Use the complete params
        label: "",
        advancedParameters: {
          skipExecutionVariable: {
            variable: null,
            value: null,
          },
          runAsynchronously: false,
        },
      },
    };

    onCommandAdded(newCommand);
    onClose();
    // Reset state after closing
    setActiveStep(0);
    setSelectedToolId("");
    setSelectedToolType("");
    setSelectedCommand("");
    setCommandParams({});
    setSearchQuery("");
  };

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
      setCommandParams({
        ...commandParams,
        [fieldName]: `{{${variableName}}}`,
      });
    }
  };

  const isVariableReference = (value: any): boolean => {
    return typeof value === "string" && value.startsWith("{{") && value.endsWith("}}");
  };

  const getVariableNameFromReference = (value: string): string => {
    if (isVariableReference(value)) {
      return value.slice(2, -2);
    }
    return "";
  };

  const renderField = (field: Field) => {
    // Get current value
    const currentValue = commandParams[field.name];
    const isVariable = isVariableReference(currentValue);
    const variableName = isVariable ? getVariableNameFromReference(currentValue) : "";

    // For labware fields, use a dropdown with available labware
    if (field.name === "labware") {
      return (
        <HStack width="100%">
          <Select
            flex={1}
            value={isVariable ? "" : currentValue || "default"}
            onChange={(e) => {
              if (!isVariable) {
                setCommandParams({ ...commandParams, [field.name]: e.target.value });
              }
            }}
            isDisabled={isVariable}>
            {labwareData?.map((labware) => (
              <option key={labware.id} value={labware.name}>
                {labware.name}
              </option>
            ))}
            {!labwareData?.some((labware) => labware.name.toLowerCase() === "default") && (
              <option value="default">default</option>
            )}
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

    if (
      selectedToolType === "toolbox" &&
      selectedCommand === "user_form" &&
      field.name === "name"
    ) {
      return (
        <HStack width="100%">
          <Select
            flex={1}
            value={isVariable ? "" : currentValue || ""}
            onChange={(e) => {
              if (!isVariable) {
                setCommandParams({ ...commandParams, [field.name]: e.target.value });
              }
            }}
            isDisabled={isVariable}
            placeholder="Select a form">
            {forms && forms.length > 0 ? (
              forms.map((form) => (
                <option key={form.id} value={form.name}>
                  {form.name}
                </option>
              ))
            ) : (
              <option value="" disabled>
                No forms available
              </option>
            )}
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

    // Special handling for PF400 location and sequence fields
    if (selectedToolType === "pf400") {
      if (selectedCommand === "move" && field.name === "name") {
        return (
          <HStack width="100%">
            <Select
              flex={1}
              value={isVariable ? "" : currentValue || ""}
              onChange={(e) => {
                if (e.target.value) {
                  setCommandParams({ ...commandParams, [field.name]: e.target.value });
                } else {
                  setCommandParams({ ...commandParams, [field.name]: "" });
                }
              }}
              isDisabled={isVariable}
              placeholder="Select a location">
              {waypointsQuery.data?.locations && waypointsQuery.data.locations.length > 0 ? (
                waypointsQuery.data.locations.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No locations available
                </option>
              )}
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
                } else {
                  // Ensure empty string is saved when nothing is selected
                  setCommandParams({ ...commandParams, [field.name]: "" });
                }
              }}
              isDisabled={isVariable}
              placeholder="Select a sequence">
              {waypointsQuery.data?.sequences && waypointsQuery.data.sequences.length > 0 ? (
                waypointsQuery.data.sequences.map((seq) => (
                  <option key={seq.id} value={seq.name}>
                    {seq.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No sequences available
                </option>
              )}
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
              value={
                isVariable
                  ? ""
                  : currentValue !== undefined
                    ? currentValue
                    : field.defaultValue !== undefined
                      ? field.defaultValue
                      : 0
              }
              onChange={(value) => {
                if (!isVariable) {
                  setCommandParams({ ...commandParams, [field.name]: parseFloat(value) || 0 });
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
                  : currentValue !== undefined
                    ? JSON.stringify(currentValue)
                    : field.defaultValue !== undefined
                      ? JSON.stringify(field.defaultValue)
                      : "[]"
              }
              onChange={(e) => {
                if (!isVariable) {
                  try {
                    const arrayValue = JSON.parse(e.target.value);
                    setCommandParams({ ...commandParams, [field.name]: arrayValue });
                  } catch {
                    // If parsing fails, store as empty array
                    setCommandParams({ ...commandParams, [field.name]: [] });
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
                  : currentValue !== undefined
                    ? currentValue.toString()
                    : field.defaultValue !== undefined
                      ? field.defaultValue.toString()
                      : "false"
              }
              onChange={(e) => {
                if (!isVariable) {
                  setCommandParams({ ...commandParams, [field.name]: e.target.value === "true" });
                }
              }}
              isDisabled={isVariable}>
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
              value={
                isVariable
                  ? ""
                  : currentValue !== undefined
                    ? currentValue
                    : field.defaultValue !== undefined
                      ? field.defaultValue
                      : ""
              }
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

  // Tool card component
  const toolCardBg = useColorModeValue("white", "gray.800");
  const selectedToolBg = useColorModeValue("teal.100", "teal.900");

  const ToolCard = ({ tool }: { tool: { id: number | string; type: string; name: string } }) => {
    const isSelected = selectedToolId === tool.id;

    return (
      <Box
        p={2}
        borderRadius="lg"
        cursor="pointer"
        bg={isSelected ? selectedToolBg : toolCardBg}
        borderColor={isSelected ? "teal.500" : "gray.200"}
        boxShadow="md"
        _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
        onClick={() => handleToolSelect(tool)}>
        <VStack spacing={1} align="center">
          {tool.type === "toolbox" ? (
            <IconButton
              aria-label="Tool Box"
              icon={<ToolCase style={{ width: "90px", height: "90px" }} />}
              variant="ghost"
              colorScheme="teal"
              isRound
              boxSize="85px"
            />
          ) : (
            <Image
              src={`/tool_icons/${tool.type}.png`}
              alt={tool.name}
              objectFit="contain"
              loading="lazy"
              height={"85px"}
            />
          )}
          <Text fontSize="sm" fontWeight={isSelected ? "bold" : "normal"}>
            {tool.name}
          </Text>
        </VStack>
      </Box>
    );
  };

  const CommandCard = ({ command }: { command: string }) => {
    const isSelected = selectedCommand === command;

    // Render icon based on tool type
    const renderCommandIcon = () => {
      if (selectedToolType === "toolbox") {
        return (
          <Box display="flex" justifyContent="center" alignItems="center">
            {getToolBoxCommandIcon(command)}
          </Box>
        );
      } else {
        // For other tools, use the tool's icon image
        return (
          <Box display="flex" justifyContent="center" alignItems="center">
            <Image
              src={`/tool_icons/${selectedToolType}.png`}
              alt={command}
              objectFit="contain"
              height="50px"
              width="50px"
            />
          </Box>
        );
      }
    };

    return (
      <Box
        p={4}
        borderRadius="lg"
        cursor="pointer"
        bg={isSelected ? selectedToolBg : toolCardBg}
        borderColor={isSelected ? "teal.500" : "gray.200"}
        border="1px solid"
        boxShadow="md"
        _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
        onClick={() => setSelectedCommand(command)}
        minH="100px">
        <VStack spacing={3} align="center" justify="center" h="100%">
          {renderCommandIcon()}
          <Text
            fontSize="sm"
            fontWeight={isSelected ? "bold" : "normal"}
            textAlign="center"
            wordBreak="break-word">
            {command}
          </Text>
        </VStack>
      </Box>
    );
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <VStack spacing={6} align="stretch">
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Search color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search for a tool..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>

            <Flex justify="space-between" align="center">
              <Text fontSize="md" fontWeight="bold">
                Available Tools
              </Text>
              {selectedToolId && selectedToolData && (
                <HStack>
                  <Text fontSize="sm">Selected:</Text>
                  <Tag colorScheme="teal">
                    {selectedToolData.name ||
                      capitalizeFirst(selectedToolType.replaceAll("_", " "))}
                  </Tag>
                </HStack>
              )}
            </Flex>
            <Box
              maxH="calc(3 * 140px + 3 * 1rem)" // 3 rows of cards (approx 130px each) + spacing
              overflowY="auto"
              pr={2}
              py={5}>
              <SimpleGrid columns={[2, 3, 4, 5]} spacing={4}>
                {filteredTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </SimpleGrid>
            </Box>
          </VStack>
        );
      case 1:
        return (
          <VStack spacing={6} align="stretch">
            <Flex justify="space-between" align="center">
              <Text fontSize="md" fontWeight="bold">
                Available Commands for{" "}
                {selectedToolData?.name || capitalizeFirst(selectedToolType.replaceAll("_", " "))}
              </Text>
              {selectedCommand && (
                <HStack>
                  <Text fontSize="sm">Selected:</Text>
                  <Tag colorScheme="teal">{selectedCommand}</Tag>
                </HStack>
              )}
            </Flex>
            <Box maxH="400px" overflowY="auto" pr={2} py={2}>
              <SimpleGrid columns={[2, 3, 4]} spacing={4}>
                {Object.keys(availableCommands).map((command) => (
                  <CommandCard key={command} command={command} />
                ))}
              </SimpleGrid>
            </Box>
          </VStack>
        );
      case 2:
        return (
          <VStack spacing={4} align="stretch" width="100%">
            <HStack spacing={3}>
              <Text fontSize="md" fontWeight="bold">
                Configure Parameters
              </Text>
              <Tag colorScheme="teal">
                {selectedToolData?.name || capitalizeFirst(selectedToolType.replaceAll("_", " "))} →{" "}
                {selectedCommand}
              </Tag>
            </HStack>

            {fields.length > 0 ? (
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
            ) : (
              <Text>No parameters required for this command.</Text>
            )}
          </VStack>
        );
      default:
        return null;
    }
  };

  // Determine modal footer buttons based on current step
  const renderFooterButtons = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              ml={3}
              onClick={handleNextStep}
              isDisabled={!selectedToolType}>
              Next
            </Button>
          </>
        );
      case 1:
        return (
          <>
            <Button variant="ghost" onClick={handlePreviousStep}>
              Back
            </Button>
            <Button variant="ghost" ml={2} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              ml={3}
              onClick={handleNextStep}
              isDisabled={!selectedCommand}>
              Next
            </Button>
          </>
        );
      case 2:
        return (
          <>
            <Button variant="ghost" onClick={handlePreviousStep}>
              Back
            </Button>
            <Button variant="ghost" ml={2} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" ml={3} onClick={handleSubmit}>
              Add Command
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent maxW="900px">
        <ModalHeader>Add Tool Command</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            <Stepper index={activeStep} colorScheme="teal" mb={4}>
              {steps.map((step, index) => (
                <Step key={index}>
                  <StepIndicator>
                    <StepStatus
                      complete={<StepIcon />}
                      incomplete={<StepNumber />}
                      active={<StepNumber />}
                    />
                  </StepIndicator>
                  <Box flexShrink="0">
                    <StepTitle>{step.title}</StepTitle>
                    <StepDescription>{step.description}</StepDescription>
                  </Box>
                  <StepSeparator />
                </Step>
              ))}
            </Stepper>

            {renderStepContent()}
          </VStack>
        </ModalBody>

        <ModalFooter>{renderFooterButtons()}</ModalFooter>
      </ModalContent>
    </Modal>
  );
};
