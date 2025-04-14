import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  IconButton,
  Box,
  Text,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
  Badge,
} from "@chakra-ui/react";
import { AddIcon, CloseIcon, ViewIcon } from "@chakra-ui/icons";
import { AiFillEdit } from "react-icons/ai";
import { EditableText } from "@/components/ui/Form";
import { trpc } from "@/utils/trpc";

// Add a new enum for field types
enum FieldType {
  USER_INPUT = "user_input",
  FILE_INPUT = "file_input",
}

interface ParameterSchema {
  type: string;
  placeHolder?: string;
  variable_name?: string;
  fieldType?: FieldType; // New property to determine input type
}

interface ProtocolFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialParams: Record<string, ParameterSchema>;
  protocolId: number;
  onSave?: (params: Record<string, ParameterSchema>) => void;
}

export const ProtocolFormModal: React.FC<ProtocolFormModalProps> = ({
  isOpen,
  onClose,
  initialParams,
  protocolId,
  onSave,
}) => {
  const [localParams, setLocalParams] = useState<Record<string, ParameterSchema>>({});
  const [previewMode, setPreviewMode] = useState(true);
  const toast = useToast();
  const { data: fetchedVariables, refetch: refetchVariables } = trpc.variable.getAll.useQuery();

  const { data: protocol, refetch: refetchProtocol } = trpc.protocol.getById.useQuery({
    id: protocolId,
  });

  const updateProtocolMutation = trpc.protocol.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Protocol parameters updated",
        status: "success",
        duration: 3000,
      });
      refetchProtocol();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to update protocol parameters",
        description: error.message,
        status: "error",
        duration: 5000,
      });
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialParams && fetchedVariables) {
        // Convert any existing variable_id to variable_name and ensure fieldType is set
        const convertedParams = Object.entries(initialParams).reduce(
          (acc, [key, schema]) => {
            const newSchema = { ...schema };

            // If we have a variable_id but not a variable_name, find the matching name
            if ("variable_id" in newSchema && !("variable_name" in newSchema)) {
              const variable = fetchedVariables.find((v) => v.id === newSchema.variable_id);
              if (variable) {
                newSchema.variable_name = variable.name;
              }
              // Remove the old variable_id property
              delete newSchema.variable_id;
            }

            // Set default fieldType if not present
            if (!newSchema.fieldType) {
              newSchema.fieldType = FieldType.USER_INPUT;
            }

            acc[key] = newSchema;
            return acc;
          },
          {} as Record<string, ParameterSchema>,
        );

        setLocalParams(convertedParams);
      } else {
        // Ensure all params have a fieldType
        const paramsWithFieldType = { ...initialParams };
        Object.keys(paramsWithFieldType).forEach((key) => {
          if (!paramsWithFieldType[key].fieldType) {
            paramsWithFieldType[key].fieldType = FieldType.USER_INPUT;
          }
        });
        setLocalParams(paramsWithFieldType || {});
      }
    }
  }, [isOpen, initialParams, fetchedVariables]);

  const handleAddParameter = () => {
    const newSchema = { ...localParams };
    const newParamName = `parameter_${Object.keys(newSchema).length + 1}`;
    newSchema[newParamName] = {
      type: "string",
      placeHolder: "",
      fieldType: FieldType.USER_INPUT, // Default to user input
    };
    setLocalParams(newSchema);
  };

  const handleDeleteParameter = (paramName: string) => {
    const newSchema = { ...localParams };
    delete newSchema[paramName];
    setLocalParams(newSchema);
  };

  const handleRenameParameter = (oldName: string, newName: string) => {
    if (newName === oldName) return;

    // Check if new name already exists
    if (newName !== oldName && localParams[newName]) {
      toast({
        title: "Parameter name already exists",
        status: "error",
        duration: 3000,
      });
      return;
    }

    // Create new schema preserving order
    const newSchema = Object.entries(localParams).reduce(
      (acc, [key, value]) => {
        if (key === oldName) {
          acc[newName] = value;
        } else {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, ParameterSchema>,
    );
    setLocalParams(newSchema);
  };

  const handleUpdateParameterSchema = (
    paramName: string,
    field: keyof ParameterSchema,
    value: any,
  ) => {
    const newSchema = { ...localParams };
    newSchema[paramName] = {
      ...newSchema[paramName],
      [field]: value,
    };
    setLocalParams(newSchema);
  };

  // Handle variable selection by name
  const handleVariableSelect = (paramName: string, variableName: string) => {
    const newSchema = { ...localParams };
    const variable = fetchedVariables?.find((v) => v.name === variableName);

    if (variableName === "") {
      // If clearing the variable selection, remove variable_name but keep other properties
      const { variable_name, ...rest } = newSchema[paramName];
      newSchema[paramName] = rest;
    } else if (variable) {
      newSchema[paramName] = {
        ...newSchema[paramName],
        type: variable.type,
        variable_name: variableName,
      };
    }

    setLocalParams(newSchema);
  };

  const handleSave = () => {
    // Only proceed if we have the protocol data
    if (!protocol) {
      toast({
        title: "Cannot update protocol",
        description: "Protocol data not available",
        status: "error",
        duration: 3000,
      });
      return;
    }

    // Update the protocol with new parameters
    updateProtocolMutation.mutate({
      id: protocolId,
      data: {
        name: protocol.name,
        description: protocol.description,
        params: localParams,
        commands: protocol.commands,
        icon: protocol.icon || "",
      },
    });

    // Still call the onSave callback if provided (for compatibility)
    if (onSave) {
      onSave(localParams);
    }
  };

  // Find the variable associated with a parameter by name
  const getVariableForParam = (paramSchema: ParameterSchema) => {
    if (!paramSchema.variable_name || !fetchedVariables) return null;
    return fetchedVariables.find((v) => v.name === paramSchema.variable_name);
  };

  // This is the mock implementation of the NewProtocolRunModal preview
  const renderPreviewMode = () => {
    const capitalizeFirst = (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    };

    return (
      <VStack align="start" spacing={4} width="100%">
        {Object.entries(localParams).map(([param, schema]) => {
          const variable = getVariableForParam(schema);
          const isBoolean = schema.type.toLowerCase() === "boolean";
          const isFileInput = schema.fieldType === FieldType.FILE_INPUT;

          return (
            <FormControl key={param}>
              <FormLabel>
                {capitalizeFirst(param.replaceAll("_", " "))}
                <Badge colorScheme="blue" ml={2}>
                  {schema.type}
                </Badge>
                {schema.variable_name && (
                  <Badge colorScheme="green" ml={2}>
                    {schema.variable_name}
                  </Badge>
                )}
                {isFileInput && (
                  <Badge colorScheme="purple" ml={2}>
                    File
                  </Badge>
                )}
              </FormLabel>
              {isFileInput ? (
                <Input type="file" pt={1} placeholder={schema.placeHolder || "Choose a file"} />
              ) : isBoolean ? (
                <Select defaultValue={variable?.value || schema.placeHolder || "false"}>
                  <option value="true">True</option>
                  <option value="false">False</option>
                </Select>
              ) : (
                <Input
                  value={variable?.value || schema.placeHolder || ""}
                  placeholder="Default value"
                  isReadOnly
                />
              )}
            </FormControl>
          );
        })}
      </VStack>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={previewMode ? "xl" : "4xl"}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Text>Protocol Parameters</Text>
            <Tooltip label={previewMode ? "Switch to Edit Mode" : "Preview Run Form"}>
              <IconButton
                aria-label="Toggle preview mode"
                icon={previewMode ? <AiFillEdit fontSize="18px" /> : <ViewIcon fontSize="18px" />}
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
                variant="ghost"
              />
            </Tooltip>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {previewMode ? (
            renderPreviewMode()
          ) : (
            <Box>
              <Table variant="simple" size="md">
                <Thead>
                  <Tr>
                    <Th>Label</Th>
                    <Th>Field Type</Th>
                    <Th>PlaceHolder</Th>
                    <Th>Variable</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {Object.entries(localParams).map(([paramName, schema]) => {
                    const paramVariable = getVariableForParam(schema);

                    return (
                      <Tr key={paramName}>
                        <Td>
                          <EditableText
                            onSubmit={(value) => {
                              if (value) handleRenameParameter(paramName, value);
                            }}
                            defaultValue={paramName || ""}
                            placeholder="Parameter name"
                          />
                        </Td>
                        <Td>
                          <Select
                            size="md"
                            value={schema.fieldType || FieldType.USER_INPUT}
                            onChange={(e) =>
                              handleUpdateParameterSchema(
                                paramName,
                                "fieldType",
                                e.target.value as FieldType,
                              )
                            }>
                            <option value={FieldType.USER_INPUT}>User Input</option>
                            <option value={FieldType.FILE_INPUT}>File Input</option>
                          </Select>
                        </Td>
                        <Td>
                          <Input
                            size="md"
                            value={schema.placeHolder || ""}
                            placeholder="Place Holder"
                            onChange={(e) =>
                              handleUpdateParameterSchema(paramName, "placeHolder", e.target.value)
                            }
                          />
                        </Td>
                        <Td minW="200px">
                          <Select
                            size="md"
                            value={schema.variable_name || ""}
                            onChange={(e) => handleVariableSelect(paramName, e.target.value)}>
                            <option value="">No Variable</option>
                            {fetchedVariables?.map((variable) => (
                              <option key={variable.id} value={variable.name}>
                                {variable.name} ({variable.type})
                              </option>
                            ))}
                          </Select>
                        </Td>
                        <Td>
                          <IconButton
                            aria-label="Delete parameter"
                            icon={<CloseIcon />}
                            fontSize={10}
                            variant="ghost"
                            onClick={() => handleDeleteParameter(paramName)}
                          />
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
              <Button
                leftIcon={<AddIcon />}
                onClick={handleAddParameter}
                colorScheme="blue"
                variant="ghost"
                alignSelf="flex-start"
                mt={4}>
                Add
              </Button>
            </Box>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="teal"
            onClick={handleSave}
            isLoading={updateProtocolMutation.isLoading}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
