import { ProtocolParamInfo } from "@/protocols/params";
import { trpc } from "@/utils/trpc";
import {
  Button,
  ButtonGroup,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
  useDisclosure,
  VStack,
  Box,
  useNumberInput,
  HStack,
  Select,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState, useRef } from "react";
import { z } from "zod";
import { capitalizeFirst } from "@/utils/parser";
import { successToast, errorToast } from "../ui/Toast";

// Enum for field types, matching the one in ProtocolFormModal
enum FieldType {
  USER_INPUT = "user_input",
  FILE_INPUT = "file_input",
}

// Extended type to include fieldType
interface ExtendedProtocolParamInfo extends ProtocolParamInfo {
  fieldType?: FieldType;
  variable_name?: string;
}

function ParamInput({
  paramInfo,
  value,
  setValue,
}: {
  paramInfo: ExtendedProtocolParamInfo;
  value: any;
  setValue: (value: any) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Read the file as text
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        // Save the file content to the state
        setValue(content);
      };
      reader.readAsText(file);
    } catch (error) {
      console.error("Error reading file:", error);
    }
  };

  // Check if this is a file input field
  if (paramInfo.fieldType === FieldType.FILE_INPUT) {
    return (
      <Box width="100%">
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          pt={1}
          placeholder={paramInfo.placeHolder || "Choose a file"}
        />
        {value && (
          <Text mt={2} fontSize="sm" color="gray.500">
            File content loaded ({(value as string).length} characters)
          </Text>
        )}
      </Box>
    );
  }

  // Handle other input types as before
  switch (paramInfo.type) {
    case "number":
      return (
        <NumberInput
          placeholder={paramInfo.placeHolder}
          value={value ?? 0}
          onChange={(_stringValue, numberValue) => {
            // Ensure we pass a number, not a string
            setValue(typeof numberValue === "string" ? parseFloat(numberValue) : numberValue);
          }}>
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      );
    case "string":
      return (
        <Input
          placeholder={paramInfo.placeHolder}
          value={value ?? ""}
          onChange={(e) => setValue(e.currentTarget.value)}
        />
      );
    case "boolean":
      return (
        <Select
          defaultValue="true"
          onChange={(e) => {
            setValue(e.target.value === "true" ? true : false);
          }}>
          <option value="true">True</option>
          <option value="false">False</option>
        </Select>
      );
    case "label":
      return <Text>{paramInfo.placeHolder}</Text>;
    default:
      return (
        <>
          <Text>Unknown param type: {paramInfo.type}</Text>
        </>
      );
  }
}

export default function NewProtocolRunModal({ id, onClose }: { id: string; onClose: () => void }) {
  const router = useRouter();
  const workcellData = trpc.workcell.getSelectedWorkcell.useQuery();
  const workcellName = workcellData.data;
  const editVariable = trpc.variable.edit.useMutation();
  const createVariable = trpc.variable.add.useMutation();
  const variablesQuery = trpc.variable.getAll.useQuery();

  const protocol = trpc.protocol.get.useQuery(
    {
      id: id,
    },
    {
      onSuccess: (data) => {},
      onError: (error) => {
        console.error({
          message: error.message,
          data: error.data,
        });
        errorToast("Error loading protocol", error.message);
      },
    },
  );

  const uiParams = protocol.data?.params || {};
  const { isOpen, onOpen } = useDisclosure({ defaultIsOpen: true });
  const [userDefinedParams, setUserDefinedParams] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<z.inferFormattedError<z.AnyZodObject>>();
  const { getInputProps, getIncrementButtonProps, getDecrementButtonProps } = useNumberInput({
    step: 1,
    defaultValue: 1,
    min: 1,
    max: 100,
    precision: 0,
  });

  const inc = getIncrementButtonProps();
  const dec = getDecrementButtonProps();
  const numberOfRuns = getInputProps();

  const createRunMutation = trpc.run.create.useMutation({
    onSuccess: (data) => {
      router.push(`/runs`);
    },
    onError: (error) => {
      if (error.data?.zodError) {
        setFormErrors(error.data.zodError as any);
      } else {
        setFormErrors(undefined);
        errorToast("Error creating run", error.message);
      }
    },
  });

  const handleClose = () => {
    onClose();
  };

  const handleSuccess = () => {
    successToast("Run queued successfully", "");
    handleClose();
  };

  // Function to update all linked variables before queueing the run
  const updateLinkedVariablesAndQueueRun = async () => {
    try {
      // Get all parameters with linked variables
      const linkedParams = Object.entries(uiParams).filter(
        ([_, paramInfo]) => (paramInfo as any).variable_name,
      );

      const updatePromises = linkedParams.map(async ([paramName, paramInfo]) => {
        const variableName = (paramInfo as any).variable_name;
        if (!variableName) return null;

        const variable = variablesQuery.data?.find((v) => v.name === variableName);
        const newValue = userDefinedParams[paramName];

        const determineType = () => {
          const paramType = (paramInfo as ProtocolParamInfo).type;
          const isFileInput =
            (paramInfo as ExtendedProtocolParamInfo).fieldType === FieldType.FILE_INPUT;

          if (isFileInput) return "string"; // File contents are stored as strings
          if (paramType === "number") return "number";
          if (paramType === "boolean") return "boolean";
          return "string"; // Default to string
        };

        if (!variable) {
          const variableType = determineType();
          // Special handling for boolean values
          let valueToSave = newValue;
          if (variableType === "boolean") {
            valueToSave = newValue === true || newValue === "true";
          }

          // Create the new variable
          return createVariable.mutateAsync({
            name: variableName,
            type: variableType,
            value: valueToSave !== undefined ? String(valueToSave) : "",
          });
        }

        // If value hasn't changed, don't update
        if (newValue === variable.value) return null;

        // Special handling for boolean values to ensure consistency
        let valueToSave = newValue;
        if (variable.type === "boolean") {
          valueToSave = newValue === true || newValue === "true";
        }

        // Update the existing variable
        return editVariable.mutateAsync({
          id: variable.id,
          value: valueToSave !== undefined ? String(valueToSave) : variable.value,
          name: variable.name,
          type: variable.type,
        });
      });

      await Promise.all(updatePromises.filter(Boolean));

      // Now queue the run
      await createRunMutation.mutate(
        {
          protocolId: id,
          workcellName: workcellName!,
          params: userDefinedParams,
          numberOfRuns: Number(numberOfRuns.value),
        },
        {
          onSuccess: handleSuccess,
        },
      );
    } catch (error) {
      console.error("Error updating variables:", error);
      errorToast(
        "Error updating variables",
        "Failed to update linked variables before queueing the run, Error: \n" + error,
      );
    }
  };

  return (
    <>
      {workcellName && uiParams && protocol && (
        <Box>
          <Modal
            isOpen={isOpen}
            onClose={handleClose}
            closeOnOverlayClick={true}
            closeOnEsc={true}
            size="2xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>New Run</ModalHeader>
              <ModalCloseButton onClick={handleClose} />
              <ModalBody>
                <VStack align="start" spacing={4}>
                  <>
                    {Object.entries(uiParams).map(([param, paramInfo]) => {
                      // Find if this parameter has a linked variable
                      const linkedVariableName = (paramInfo as any).variable_name;
                      const linkedVariable =
                        linkedVariableName && variablesQuery.data
                          ? variablesQuery.data.find((v) => v.name === linkedVariableName)
                          : null;

                      // Add badge for file input
                      const isFileInput =
                        (paramInfo as ExtendedProtocolParamInfo).fieldType === FieldType.FILE_INPUT;

                      return (
                        <FormControl key={param} isInvalid={!!(formErrors && formErrors[param])}>
                          <FormLabel>
                            <HStack spacing={1} alignItems="center">
                              <Text>{capitalizeFirst(param.replaceAll("_", " "))}</Text>
                              {isFileInput && (
                                <Text
                                  as="span"
                                  fontSize="xs"
                                  color="purple.500"
                                  fontWeight="bold"
                                  ml={1}>
                                  (File)
                                </Text>
                              )}
                            </HStack>
                          </FormLabel>
                          <ParamInput
                            paramInfo={paramInfo as ExtendedProtocolParamInfo}
                            value={userDefinedParams[param]}
                            setValue={(value) =>
                              setUserDefinedParams({ ...userDefinedParams, [param]: value })
                            }
                          />
                          {!isFileInput &&
                            (paramInfo.type === "boolean" || paramInfo.type === "number") && (
                              <FormHelperText>
                                {(paramInfo as ProtocolParamInfo).placeHolder}
                              </FormHelperText>
                            )}
                          {formErrors &&
                            formErrors[param]?._errors.map((key, error) => (
                              <FormErrorMessage key={key}>{error}</FormErrorMessage>
                            ))}
                        </FormControl>
                      );
                    })}

                    {formErrors?._errors.map((key, error) => (
                      <FormErrorMessage key={key}>{error}</FormErrorMessage>
                    ))}
                    <Box width="100%" borderRadius="md" p={4} mt={4}>
                      <FormControl>
                        <FormLabel textAlign="center">Number of Runs</FormLabel>
                        <HStack justifyContent="center">
                          <Button {...dec}>-</Button>
                          <Input maxWidth="250px" {...numberOfRuns} textAlign="center" />
                          <Button {...inc}>+</Button>
                        </HStack>
                      </FormControl>
                    </Box>
                  </>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <ButtonGroup>
                  <Button onClick={handleClose}>Cancel</Button>
                  <Button
                    isLoading={createRunMutation.isLoading || editVariable.isLoading}
                    isDisabled={createRunMutation.isLoading || editVariable.isLoading}
                    colorScheme="teal"
                    onClick={updateLinkedVariablesAndQueueRun}>
                    Queue Run
                  </Button>
                </ButtonGroup>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Box>
      )}
    </>
  );
}
