import { ProtocolParamInfo } from "@/protocols/params";
import { trpc } from "@/utils/trpc";
import {
  Button,
  ButtonGroup,
  Checkbox,
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
  useToast,
  VStack,
  Box,
  useColorModeValue,
  useNumberInput,
  HStack,
  Select,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { z } from "zod";
import { capitalizeFirst } from "@/utils/parser";

function ParamInput({
  paramInfo,
  value,
  setValue,
}: {
  paramInfo: ProtocolParamInfo;
  value: any;
  setValue: (value: any) => void;
}) {
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
  const toast = useToast();
  const workcellData = trpc.workcell.getSelectedWorkcell.useQuery();
  const workcellName = workcellData.data;
  const editVariable = trpc.variable.edit.useMutation();
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
        toast({
          title: "Error loading protocol",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
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
        toast({
          title: "Error creating run",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    },
  });

  const handleClose = () => {
    onClose();
  };

  const handleSuccess = () => {
    toast({
      title: "Run queued successfully",
      status: "success",
      duration: 3000,
    });
    handleClose();
  };

  // Function to update all linked variables before queueing the run
  const updateLinkedVariablesAndQueueRun = async () => {
    try {
      // Get all parameters with linked variables
      const linkedParams = Object.entries(uiParams).filter(
        ([_, paramInfo]) => (paramInfo as any).variable_id,
      );

      // Update all linked variables with new values from the form
      const updatePromises = linkedParams.map(async ([paramName, paramInfo]) => {
        const variableId = (paramInfo as any).variable_id;
        if (!variableId) return null;

        // Get the variable from our query
        const variable = variablesQuery.data?.find((v) => v.id === variableId);
        if (!variable) return null;

        // Get the new value from the form
        const newValue = userDefinedParams[paramName];

        // If value hasn't changed, don't update
        if (newValue === variable.value) return null;

        // Special handling for boolean values to ensure consistency
        let valueToSave = newValue;
        if (variable.type === "boolean") {
          valueToSave = newValue === true || newValue === "true";
        }

        // Update the variable
        return editVariable.mutateAsync({
          id: variableId,
          value: valueToSave.toString(),
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
      toast({
        title: "Error updating variables",
        description: "Failed to update linked variables before queueing the run, Error: \n" + error,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
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
                      const linkedVariableId = (paramInfo as any).variable_id;
                      const linkedVariable =
                        linkedVariableId && variablesQuery.data
                          ? variablesQuery.data.find((v) => v.id === linkedVariableId)
                          : null;

                      return (
                        <FormControl key={param} isInvalid={!!(formErrors && formErrors[param])}>
                          <FormLabel>
                            <HStack spacing={1} alignItems="center">
                              <Text>{capitalizeFirst(param.replaceAll("_", " "))}</Text>
                            </HStack>
                          </FormLabel>
                          <ParamInput
                            paramInfo={paramInfo as ProtocolParamInfo}
                            value={userDefinedParams[param]}
                            setValue={(value) =>
                              setUserDefinedParams({ ...userDefinedParams, [param]: value })
                            }
                          />
                          {(paramInfo.type === "boolean" || paramInfo.type === "number") && (
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
