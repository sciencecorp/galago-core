import {
  Box,
  Button,
  HStack,
  VStack,
  Text,
  useToast,
  Divider,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  Select,
  Input,
  Badge,
  Switch,
  FormControl,
  FormLabel,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { capitalizeFirst } from "@/utils/parser";
import { ParameterSchema, AdvancedParameters, SkipExecution } from "@/types";

interface CommandDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCommand: any;
  onSave: (updatedCommand: any) => void;
  isEditing: boolean;
}

export const CommandDetailsDrawer: React.FC<CommandDetailsDrawerProps> = (props) => {
  const { isOpen, onClose, selectedCommand, onSave, isEditing } = props;
  const toast = useToast();
  const router = useRouter();
  const [editedParams, setEditedParams] = useState<Record<string, any>>({});
  const [editedAdvancedParams, setEditedAdvancedParams] = useState<AdvancedParameters | null>(null);
  const { data: availableVariables } = trpc.variable.getAll.useQuery();

  // Reset editedParams when a command is selected
  useEffect(() => {
    if (selectedCommand) {
      setEditedParams({});
      setEditedAdvancedParams(null);
    }
  }, [selectedCommand]);

  const handleVariableSelect = (fieldName: string, variableName: string) => {
    if (variableName === "") {
      const valueWithoutVariable = editedParams[fieldName];
      if (
        typeof valueWithoutVariable === "string" &&
        valueWithoutVariable.startsWith("{{") &&
        valueWithoutVariable.endsWith("}}")
      ) {
        // If it was a variable reference, clear it completely
        const newParams = { ...editedParams };
        delete newParams[fieldName];
        setEditedParams(newParams);
      }
    } else {
      // Set the parameter value to the variable reference format
      setEditedParams({
        ...editedParams,
        [fieldName]: `{{${variableName}}}`,
      });
    }
  };

  const isVariableReference = (value: any): boolean => {
    return typeof value === "string" && value.startsWith("{{") && value.endsWith("}}");
  };

  const getVariableNameFromReference = (value: string): string => {
    if (isVariableReference(value)) {
      return value.slice(2, -2); // Remove {{ and }}
    }
    return "";
  };

  // Initialize advanced parameters from the selected command or create default values
  const getAdvancedParameters = (): AdvancedParameters => {
    if (editedAdvancedParams !== null) {
      return editedAdvancedParams;
    }

    if (selectedCommand?.commandInfo?.advancedParameters) {
      return selectedCommand.commandInfo.advancedParameters;
    }

    return {
      skipExecutionVariable: { variable: null, value: "" },
      runAsynchronously: false,
    };
  };

  const handleSkipVariableSelect = (variableName: string) => {
    const currentAdvParams = getAdvancedParameters();

    setEditedAdvancedParams({
      ...currentAdvParams,
      skipExecutionVariable: {
        ...currentAdvParams.skipExecutionVariable,
        variable: variableName === "" ? null : variableName,
      },
    });
  };

  const handleSkipValueChange = (value: string) => {
    const currentAdvParams = getAdvancedParameters();

    setEditedAdvancedParams({
      ...currentAdvParams,
      skipExecutionVariable: {
        ...currentAdvParams.skipExecutionVariable,
        value,
      },
    });
  };

  const handleRunAsyncChange = (isChecked: boolean) => {
    const currentAdvParams = getAdvancedParameters();

    setEditedAdvancedParams({
      ...currentAdvParams,
      runAsynchronously: isChecked,
    });
  };

  const handleSaveInputs = () => {
    if (isEditing && selectedCommand) {
      // Create updated params by merging original params with edited ones
      const updatedParams = {
        ...selectedCommand.commandInfo.params,
        ...editedParams,
      };

      // Get the advanced parameters
      const advancedParams = getAdvancedParameters();

      // Create updated command object
      const updatedCommand = {
        ...selectedCommand,
        commandInfo: {
          ...selectedCommand.commandInfo,
          params: updatedParams,
          advancedParameters: advancedParams,
        },
      };

      // Call the onSave function with the updated command
      onSave(updatedCommand);

      // Show success toast
      toast({
        title: "Parameters saved",
        description: "Command parameters have been updated",
        status: "success",
        duration: 3000,
      });

      // Clear edited params
      setEditedParams({});
      setEditedAdvancedParams(null);

      // Close the drawer
      onClose();
    }
  };

  const advancedParams = getAdvancedParameters();

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="right" size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Command Details</DrawerHeader>
        <DrawerBody>
          {selectedCommand ? (
            <VStack spacing={4} align="self-start" width="100%">
              <Divider />
              <Text as="b">Tool:</Text>
              <Text>{capitalizeFirst(selectedCommand.commandInfo.toolType)}</Text>
              <Divider />
              <Text as="b">Name:</Text>
              <Text>
                {capitalizeFirst(selectedCommand.commandInfo.command.replaceAll("_", " "))}
              </Text>
              <Divider />
              <Text as="b" fontSize="18px">
                Parameters
              </Text>
              <VStack align="stretch" spacing={4} width="100%">
                {Object.entries(selectedCommand.commandInfo.params).map(([key, value], index) => {
                  // Get current value (from editedParams if available, otherwise from command)
                  const currentValue = editedParams[key] !== undefined ? editedParams[key] : value;

                  // Check if it's a variable reference
                  const isVariable = isVariableReference(currentValue);
                  const variableName = isVariable
                    ? getVariableNameFromReference(currentValue as string)
                    : "";

                  return (
                    <Box key={index}>
                      <Text as="b" flex="1" mb={1}>
                        {capitalizeFirst(key).replaceAll("_", " ")}:
                        {isVariable && (
                          <Badge ml={2} colorScheme="green">
                            Variable: {variableName}
                          </Badge>
                        )}
                      </Text>
                      <HStack width="100%" spacing={2}>
                        <Input
                          flex={1}
                          value={isVariable ? "" : (currentValue as string) || ""}
                          onChange={(e) => {
                            if (!isVariable && isEditing) {
                              setEditedParams({
                                ...editedParams,
                                [key]: e.target.value,
                              });
                            }
                          }}
                          placeholder={isVariable ? "Using variable" : "Enter value"}
                          isDisabled={isVariable || !isEditing}
                        />
                        <Select
                          width="180px"
                          value={variableName}
                          onChange={(e) => {
                            if (isEditing) {
                              handleVariableSelect(key, e.target.value);
                            }
                          }}
                          isDisabled={!isEditing}>
                          <option value="">No Variable</option>
                          {availableVariables?.map((variable) => (
                            <option key={variable.id} value={variable.name}>
                              {variable.name}
                            </option>
                          ))}
                        </Select>
                      </HStack>
                    </Box>
                  );
                })}

                {/* Advanced Parameters Section */}
                <Accordion allowToggle width="100%" mt={4}>
                  <AccordionItem>
                    <h2>
                      <AccordionButton>
                        <Box as="span" flex="1" textAlign="left">
                          <Text as="b" fontSize="16px">
                            Advanced Parameters
                          </Text>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <VStack align="stretch" spacing={4} width="100%">
                        {/* Skip Execution Variable */}
                        <Text as="b" fontSize="15px">
                          Skip Execution Condition
                        </Text>
                        <FormControl>
                          <FormLabel>Variable</FormLabel>
                          <Select
                            value={advancedParams.skipExecutionVariable?.variable || ""}
                            onChange={(e) => handleSkipVariableSelect(e.target.value)}
                            isDisabled={!isEditing}>
                            <option value="">None</option>
                            {availableVariables?.map((variable) => (
                              <option key={variable.id} value={variable.name}>
                                {variable.name}
                              </option>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControl
                          isDisabled={
                            !advancedParams.skipExecutionVariable?.variable || !isEditing
                          }>
                          <FormLabel>Value to Match</FormLabel>
                          <Input
                            value={advancedParams.skipExecutionVariable?.value || ""}
                            onChange={(e) => handleSkipValueChange(e.target.value)}
                            placeholder="Value that variable must match to skip"
                          />
                        </FormControl>

                        {/* Run Asynchronously */}
                        <FormControl display="flex" alignItems="center" mt={4}>
                          <FormLabel mb="0">Run Asynchronously</FormLabel>
                          <Switch
                            isChecked={advancedParams.runAsynchronously || false}
                            onChange={(e) => handleRunAsyncChange(e.target.checked)}
                            isDisabled={!isEditing}
                          />
                        </FormControl>

                        <Text fontSize="sm" color="gray.500" mt={2}>
                          When "Skip Execution" is configured, the command will be skipped if the
                          selected variable matches the specified value. Running asynchronously
                          allows the workflow to continue without waiting for this command to
                          complete.
                        </Text>
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>

                <Button
                  colorScheme="teal"
                  variant="outline"
                  onClick={handleSaveInputs}
                  isDisabled={!isEditing}
                  mt={4}>
                  Save Inputs
                </Button>
              </VStack>
            </VStack>
          ) : (
            <Text>No command selected.</Text>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};
