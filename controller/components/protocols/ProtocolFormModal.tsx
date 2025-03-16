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
} from "@chakra-ui/react";
import { AddIcon, CloseIcon, ViewIcon } from "@chakra-ui/icons";
import { AiFillEdit } from "react-icons/ai";
import { EditableText } from "@/components/ui/Form";

// Define the parameter schema interface
interface ParameterSchema {
  type: string;
  description?: string;
  default?: any;
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

  const handleDefaultValueChange = (paramName: string, value: string) => {
    try {
      const schema = localParams[paramName];
      let defaultValue;

      // Type validation based on schema type
      switch (schema.type) {
        case "number":
          defaultValue = Number(value);
          if (isNaN(defaultValue)) {
            throw new Error("Invalid number");
          }
          break;
        case "string":
          defaultValue = value;
          break;
        case "boolean":
          defaultValue = value === "true";
          break;
        default:
          throw new Error("Invalid type");
      }

      const newSchema = { ...localParams };
      newSchema[paramName] = {
        ...schema,
        default: defaultValue,
      };
      setLocalParams(newSchema);
    } catch (error) {
      // Handle invalid input
      toast({
        title: "Invalid default value",
        description: `Please enter a valid ${localParams[paramName].type}`,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleSave = () => {
    onSave(localParams);
    onClose();
  };

  // This is the mock implementation of the NewProtocolRunModal preview
  const renderPreviewMode = () => {
    const capitalizeFirst = (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    };

    return (
      <VStack align="start" spacing={4}>
        {Object.entries(localParams).map(([param, schema]) => (
          <FormControl key={param}>
            <FormLabel>{capitalizeFirst(param.replaceAll("_", " "))}</FormLabel>
            {schema.type === "number" ? (
              <Input type="number" defaultValue={schema.default} />
            ) : schema.type === "boolean" ? (
              <Select defaultValue={String(schema.default)}>
                <option value="true">true</option>
                <option value="false">false</option>
              </Select>
            ) : (
              <Input defaultValue={schema.default} />
            )}
            <Text fontSize="sm" color="gray.500" mt={1}>
              {schema.description}
            </Text>
          </FormControl>
        ))}
      </VStack>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={previewMode ?
      "lg" : "2xl"}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Text>Protocol Parameters</Text>
            <Tooltip label={previewMode ? "Switch to Edit Mode" : "Preview Run Form"}>
              <IconButton
                aria-label="Toggle preview mode"
                icon={previewMode ? <AiFillEdit fontSize="18px"/>:<ViewIcon fontSize="18px"/>}
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
            // Preview Mode - similar to NewProtocolRunModal
            renderPreviewMode()
          ) : (
            // Edit Mode with Table Layout
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
                  {Object.entries(localParams).map(([paramName, schema]) => (
                    <Tr key={paramName}>
                      <Td>
                      <EditableText
                          onSubmit={async (value) => {
                            if(value)
                            handleRenameParameter(paramName, value)
                          }}
                          defaultValue={paramName || ""}
                        />
                      </Td>
                      <Td>
                      <EditableText
                          onSubmit={async (value) => {
                            handleUpdateParameterSchema(paramName, "description", value);
                          }}
                          defaultValue={schema.description || ""}
                        />
                      </Td>
                      <Td>
                        <Input/>
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
                  ))}
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
                Add
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