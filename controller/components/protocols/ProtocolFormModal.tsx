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

interface ParameterSchema {
  type: string;
  placeHolder?: string;
  variable_id?: number; // Changed from variable_name to variable_id
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

  // Initialize local params when modal opens with converted variable_name to variable_id if needed
  useEffect(() => {
    if (isOpen) {
      if (initialParams && fetchedVariables) {
        // Convert any existing variable_name to variable_id
        const convertedParams = Object.entries(initialParams).reduce(
          (acc, [key, schema]) => {
            const newSchema = { ...schema };

            // If we have a variable_name but not a variable_id, find the matching ID
            if ("variable_name" in newSchema && !("variable_id" in newSchema)) {
              const variable = fetchedVariables.find((v) => v.name === newSchema.variable_name);
              if (variable) {
                newSchema.variable_id = variable.id;
              }
              // Remove the old variable_name property
              delete newSchema.variable_name;
            }

            acc[key] = newSchema;
            return acc;
          },
          {} as Record<string, ParameterSchema>,
        );

        setLocalParams(convertedParams);
      } else {
        setLocalParams(initialParams || {});
      }
    }
  }, [isOpen, initialParams, fetchedVariables]);

  const handleAddParameter = () => {
    const newSchema = { ...localParams };
    const newParamName = `parameter_${Object.keys(newSchema).length + 1}`;
    newSchema[newParamName] = {
      type: "string",
      placeHolder: "",
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

  // Handle variable selection by ID
  const handleVariableSelect = (paramName: string, variableId: string) => {
    const newSchema = { ...localParams };
    const numericVariableId = parseInt(variableId, 10);
    const variable = fetchedVariables?.find((v) => v.id === numericVariableId);

    if (variableId === "") {
      // If clearing the variable selection, remove variable_id but keep other properties
      const { variable_id, ...rest } = newSchema[paramName];
      newSchema[paramName] = rest;
    } else if (variable) {
      newSchema[paramName] = {
        ...newSchema[paramName],
        type: variable.type,
        variable_id: numericVariableId,
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

  // Find the variable associated with a parameter
  const getVariableForParam = (paramSchema: ParameterSchema) => {
    if (!paramSchema.variable_id || !fetchedVariables) return null;
    return fetchedVariables.find((v) => v.id === paramSchema.variable_id);
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

          return (
            <FormControl key={param}>
              <FormLabel>
                {capitalizeFirst(param.replaceAll("_", " "))}
                <Badge colorScheme="blue" ml={2}>
                  {schema.type}
                </Badge>
              </FormLabel>
              <Input
                value={variable?.value || schema.placeHolder || ""}
                placeholder="Default value"
                isReadOnly
              />
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
                            value={schema.variable_id ? schema.variable_id.toString() : ""}
                            onChange={(e) => handleVariableSelect(paramName, e.target.value)}>
                            <option value="">No Variable</option>
                            {fetchedVariables?.map((variable) => (
                              <option key={variable.id} value={variable.id.toString()}>
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
