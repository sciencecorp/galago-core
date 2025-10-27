// Updated CommandDetailsDrawer.tsx - Key changes marked with comments

import {
  Box,
  Button,
  HStack,
  VStack,
  Text,
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
  FormHelperText,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { capitalizeFirst } from "@/utils/parser";
import { successToast } from "../ui/Toast";
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
  const [editedParams, setEditedParams] = useState<Record<string, any>>({});
  const [editedAdvancedParams, setEditedAdvancedParams] = useState<AdvancedParameters | null>(null);
  const { data: availableVariables } = trpc.variable.getAll.useQuery();
  const { data: labwareData } = trpc.labware.getAll.useQuery();
  const { data: toolsData } = trpc.tool.getAll.useQuery();
  const { data: forms } = trpc.form.getAll.useQuery();

  // GOOD
  const pf400ToolId = toolsData?.find((t) => t.type === "pf400")?.id || 0;

  const waypointsQuery = trpc.robotArm.waypoints.getAll.useQuery(
    { toolId: pf400ToolId },
    {
      enabled: selectedCommand?.tool_type === "pf400",
    },
  );

  useEffect(() => {
    if (selectedCommand) {
      setEditedParams({});
      setEditedAdvancedParams(null);

      // If we have labware data and there's a labware parameter using "default"
      if (labwareData && selectedCommand?.params?.labware === "default") {
        if (labwareData.some((labware) => labware.name.toLowerCase() === "default")) {
          const defaultLabware = labwareData.find(
            (labware) => labware.name.toLowerCase() === "default",
          );
          if (defaultLabware && defaultLabware.name !== "default") {
            setEditedParams({
              labware: defaultLabware.name,
            });
          }
        }
      }
    }
  }, [selectedCommand, labwareData]);

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

  const getAdvancedParameters = (): AdvancedParameters => {
    if (editedAdvancedParams !== null) {
      return editedAdvancedParams;
    }

    if (selectedCommand?.advanced_parameters) {
      return selectedCommand?.advanced_parameters;
    }

    return {
      skip_execution_variable: { variable: null, value: "" },
      run_asynchronously: false,
    };
  };

  const handleSkipVariableSelect = (variableName: string) => {
    const currentAdvParams = getAdvancedParameters();

    setEditedAdvancedParams({
      ...currentAdvParams,
      skip_execution_variable: {
        ...currentAdvParams.skip_execution_variable,
        variable: variableName === "" ? null : variableName,
      },
    });
  };

  const handleSkipValueChange = (value: string) => {
    const currentAdvParams = getAdvancedParameters();

    setEditedAdvancedParams({
      ...currentAdvParams,
      skip_execution_variable: {
        ...currentAdvParams.skip_execution_variable,
        value,
      },
    });
  };

  const handleRunAsyncChange = (isChecked: boolean) => {
    const currentAdvParams = getAdvancedParameters();

    setEditedAdvancedParams({
      ...currentAdvParams,
      run_asynchronously: isChecked,
    });
  };

  const handleSaveInputs = () => {
    if (isEditing && selectedCommand) {
      const updatedParams = {
        ...selectedCommand?.params,
        ...editedParams,
      };

      const advancedParams = getAdvancedParameters();

      const updatedCommand = {
        ...selectedCommand,
        params: updatedParams,
        advanced_parameters: advancedParams,
      };

      onSave(updatedCommand);
      setEditedParams({});
      setEditedAdvancedParams(null);
      onClose();
    }
  };

  const advancedParams = getAdvancedParameters();

  const renderParameterInput = (key: string, value: any) => {
    const currentValue = editedParams[key] !== undefined ? editedParams[key] : value;
    const isVariable = isVariableReference(currentValue);
    const variableName = isVariable ? getVariableNameFromReference(currentValue as string) : "";

    // For labware parameters, render a dropdown
    if (key === "labware") {
      return (
        <HStack width="100%" spacing={2}>
          <Select
            flex={1}
            value={isVariable ? "" : (currentValue as string) || "default"}
            onChange={(e) => {
              if (!isVariable && isEditing) {
                setEditedParams({
                  ...editedParams,
                  [key]: e.target.value,
                });
              }
            }}
            isDisabled={isVariable || !isEditing}>
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
      );
    }

    if (
      key === "name" &&
      selectedCommand?.commandInfo?.command === "user_form" &&
      selectedCommand?.commandInfo?.toolType === "toolbox"
    ) {
      return (
        <HStack width="100%" spacing={2}>
          <Select
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
            isDisabled={isVariable || !isEditing}
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
      );
    }

    // For sequence_name in run_sequence command, render a dropdown
    if (key === "sequence_name" && selectedCommand?.command === "run_sequence") {
      return (
        <HStack width="100%" spacing={2}>
          <Select
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
            isDisabled={isVariable || !isEditing || waypointsQuery.isLoading}
            placeholder={waypointsQuery.isLoading ? "Loading sequences..." : "Select a sequence"}>
            {waypointsQuery.isLoading ? (
              <option value="" disabled>
                Loading...
              </option>
            ) : waypointsQuery.data?.sequences && waypointsQuery.data.sequences.length > 0 ? (
              waypointsQuery.data.sequences.map((seq) => (
                <option key={seq.id} value={seq.name}>
                  {seq.name}
                </option>
              ))
            ) : (
              <option value="" disabled>
                {waypointsQuery.isError ? "Error loading sequences" : "No sequences available"}
              </option>
            )}
          </Select>
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
      );
    }

    // For location fields in various PF400 commands
    if (
      key === "name" &&
      selectedCommand?.command === "move" &&
      selectedCommand?.tool_type === "pf400"
    ) {
      return (
        <HStack width="100%" spacing={2}>
          <Select
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
            isDisabled={isVariable || !isEditing || waypointsQuery.isLoading}
            placeholder={waypointsQuery.isLoading ? "Loading locations..." : "Select a location"}>
            {waypointsQuery.isLoading ? (
              <option value="" disabled>
                Loading...
              </option>
            ) : waypointsQuery.data?.locations && waypointsQuery.data.locations.length > 0 ? (
              waypointsQuery.data.locations.map((loc) => (
                <option key={loc.id} value={loc.name}>
                  {loc.name}
                </option>
              ))
            ) : (
              <option value="" disabled>
                {waypointsQuery.isError ? "Error loading locations" : "No locations available"}
              </option>
            )}
          </Select>
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
      );
    }

    // Default rendering for all other parameters
    return (
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
    );
  };

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
              <Text>{capitalizeFirst(selectedCommand?.tool_type)}</Text>
              <Divider />
              <Text as="b">Name:</Text>
              <Text>{capitalizeFirst(selectedCommand?.command?.replaceAll("_", " "))}</Text>
              <Divider />
              <Text as="b" fontSize="18px">
                Parameters
              </Text>
              <VStack align="stretch" spacing={4} width="100%">
                {Object.entries(selectedCommand?.params || {}).map(([key, value], index) => {
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
                      {renderParameterInput(key, value)}
                    </Box>
                  );
                })}

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
                            value={advancedParams.skip_execution_variable?.variable || ""}
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
                            !advancedParams.skip_execution_variable?.variable || !isEditing
                          }>
                          <FormLabel>Value to Match</FormLabel>
                          <Input
                            value={advancedParams.skip_execution_variable?.value || ""}
                            onChange={(e) => handleSkipValueChange(e.target.value)}
                            placeholder="Value that variable must match to skip"
                          />
                          <FormHelperText fontSize="sm" color="gray.500" mt={2}>
                            The command will be skipped if the selected variable matches the
                            specified value.
                          </FormHelperText>
                        </FormControl>

                        <FormControl display="flex" alignItems="center" mt={4}>
                          <FormLabel mb="0">Run Asynchronously</FormLabel>
                          <Switch
                            isChecked={advancedParams.run_asynchronously || false}
                            onChange={(e) => handleRunAsyncChange(e.target.checked)}
                            isDisabled={!isEditing}
                          />
                        </FormControl>
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>

                {isEditing && (
                  <Button
                    colorScheme="teal"
                    variant="outline"
                    onClick={handleSaveInputs}
                    isDisabled={!isEditing}
                    mt={4}>
                    Save
                  </Button>
                )}
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
