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

// Define the variable interface
interface Variable {
  id: number;
  name: string;
  value: string;
  type: string;
  created_at: string;
  updated_at: string;
}

// Define the parameter schema interface with added variable support
interface ParameterSchema {
  type: string;
  description?: string;
  default?: any;
  variable_name?: string; // Store variable name instead of ID
}

interface ProtocolFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialParams: Record<string, ParameterSchema>;
  onSave: (params: Record<string, ParameterSchema>) => void;
}

export const ProtocolFormModal: React.FC<ProtocolFormModalProps> = ({
  isOpen,
  onClose,
  initialParams,
  onSave,
}) => {
  const [localParams, setLocalParams] = useState<Record<string, ParameterSchema>>({});
  const [previewMode, setPreviewMode] = useState(true);
  const toast = useToast();
  const { data: fetchedVariables, refetch } = trpc.variable.getAll.useQuery();

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
      default: "",
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
    onSave(localParams);
    onClose();
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
                {variable && (
                  <Badge ml={2} colorScheme="green">
                    Variable: {variable.name}
                  </Badge>
                )}
              </FormLabel>
              {schema.type === "number" ? (
                <Input type="number" defaultValue={schema.default} isReadOnly={!!variable} />
              ) : schema.type === "boolean" ? (
                <Select defaultValue={String(schema.default)} isDisabled={!!variable}>
                  <option value="true">true</option>
                  <option value="false">false</option>
                </Select>
              ) : (
                <Input defaultValue={schema.default} isReadOnly={!!variable} />
              )}
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
                        <Td>
                          <Select
                            size="sm"
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
                            colorScheme="red"
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
          <Button colorScheme="blue" onClick={handleSave}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};