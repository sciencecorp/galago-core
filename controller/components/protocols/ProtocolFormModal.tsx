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
  description?: string;
  variable_name?: string; // Store variable name instead of ID
}

interface ProtocolFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialParams: Record<string, ParameterSchema>;
  protocolId: number; // Added protocol ID for database update
  onSave?: (params: Record<string, ParameterSchema>) => void; // Made optional since we're saving directly
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
  
  // Add mutation for updating protocol
  const { data: protocol, refetch: refetchProtocol } = trpc.protocol.getById.useQuery({ 
    id: protocolId 
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
    }
  });

  // Initialize local params when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalParams(initialParams || {});
    }
  }, [isOpen, initialParams]);

  const handleAddParameter = () => {
    const newSchema = { ...localParams };
    const newParamName = `parameter_${Object.keys(newSchema).length + 1}`;
    newSchema[newParamName] = {
      type: "string",
      description: "",
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
      {} as Record<string, ParameterSchema>
    );
    setLocalParams(newSchema);
  };

  const handleUpdateParameterSchema = (
    paramName: string,
    field: keyof ParameterSchema,
    value: any
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
    const variable = fetchedVariables?.find(v => v.name === variableName);
    
    if (variableName === "") {
      // If clearing the variable selection, remove variable_name but keep other properties
      const { variable_name, ...rest } = newSchema[paramName];
      newSchema[paramName] = rest;
    } else if (variable) {
      // Update the parameter schema with variable info
      newSchema[paramName] = {
        ...newSchema[paramName],
        type: variable.type,
        default: variable.value,
        variable_name: variable.name,
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
    if (!paramSchema.variable_name || !fetchedVariables) return null;
    return fetchedVariables.find(v => v.name === paramSchema.variable_name);
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
              </FormLabel>
              <Input
                value={variable?.value || ""}
                placeholder="Default value"
                isReadOnly
              />
              <Text fontSize="sm" color="gray.500" mt={1}>
                {schema.description}
              </Text>
            </FormControl>
          );
        })}
      </VStack>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={previewMode ? "lg" : "2xl"}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Text>Protocol Parameters</Text>
            <Tooltip label={previewMode ? "Switch to Edit Mode" : "Preview Run Form"}>
              <IconButton
                aria-label="Toggle preview mode"
                icon={previewMode ? <AiFillEdit fontSize="18px"/> : <ViewIcon fontSize="18px"/>}
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
                    <Th>Description</Th>
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
                              if(value)
                                handleRenameParameter(paramName, value);
                            }}
                            defaultValue={paramName || ""}
                            placeholder="Parameter name"
                          />
                        </Td>
                        <Td>
                          <EditableText
                            onSubmit={(value) => {
                              handleUpdateParameterSchema(paramName, "description", value);
                            }}
                            defaultValue={schema.description || ""}
                            placeholder="Add description..."
                            persistentEdit={!schema.description}
                          />
                        </Td>
                        <Td minW="200px">
                          <Select
                            size="md"
                            value={schema.variable_name || ""}
                            onChange={(e) => handleVariableSelect(paramName, e.target.value)}
                          >
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
                mt={4}
              >
                Add Parameter
              </Button>
            </Box>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleSave}
            isLoading={updateProtocolMutation.isLoading}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};