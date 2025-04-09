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
  useDisclosure,
  Select,
  Input,
  Badge,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { capitalizeFirst } from "@/utils/parser";
import { ParameterSchema } from "@/types";

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
  const { data: availableVariables } = trpc.variable.getAll.useQuery();

  // Reset editedParams when a command is selected
  useEffect(() => {
    if (selectedCommand) {
      setEditedParams({});
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

  const handleSaveInputs = () => {
    if (isEditing && selectedCommand) {
      // Create updated params by merging original params with edited ones
      const updatedParams = {
        ...selectedCommand.commandInfo.params,
        ...editedParams,
      };

      // Create updated command object
      const updatedCommand = {
        ...selectedCommand,
        commandInfo: {
          ...selectedCommand.commandInfo,
          params: updatedParams,
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

      // Close the drawer
      onClose();
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="right" size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Command Details</DrawerHeader>
        <DrawerBody>
          {selectedCommand ? (
            <VStack spacing={4} align="self-start">
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
                <Button
                  colorScheme="teal"
                  variant="outline"
                  onClick={handleSaveInputs}
                  isDisabled={!isEditing}>
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
