import { trpc } from "@/utils/trpc";
import {
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  VStack,
  Box,
  useNumberInput,
  HStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { z } from "zod";
import { successToast, errorToast } from "../ui/Toast";

export default function NewProtocolRunModal({ id, onClose }: { id: string; onClose: () => void }) {
  const router = useRouter();
  const workcellData = trpc.workcell.getSelectedWorkcell.useQuery();
  const workcellName = workcellData.data;

  const protocol = trpc.protocol.get.useQuery(
    {
      id: id,
    },
    {
      onError: (error) => {
        console.error({
          message: error.message,
          data: error.data,
        });
        errorToast("Error loading protocol", error.message);
      },
    },
  );

  const { isOpen, onOpen } = useDisclosure({ defaultIsOpen: true });
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
      successToast(
        "Run queued successfully",
        `Successfully queued ${numberOfRuns.value} run${Number(numberOfRuns.value) > 1 ? "s" : ""}`,
      );
      onClose();
      router.push(`/runs`);
    },
    onError: (error) => {
      if (error.data?.zodError) {
        setFormErrors(error.data.zodError as any);
        errorToast("Validation Error", "Please check your input values");
      } else {
        setFormErrors(undefined);
        errorToast("Error creating run", error.message);
      }
    },
  });

  const handleClose = () => {
    onClose();
  };

<<<<<<< HEAD
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

      console.log("Creating protocol run with params:", userDefinedParams);
      // Now queue the run
      await createRunMutation.mutate(
        {
          protocolId: Number(id),
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
=======
  const handleQueueRun = () => {
    if (!workcellName) {
      errorToast("No workcell selected", "Please select a workcell before queuing a run");
      return;
>>>>>>> origin
    }

    createRunMutation.mutate({
      protocolId: id,
      numberOfRuns: Number(numberOfRuns.value),
    });
  };

  return (
    <>
      {workcellName && protocol.data && (
        <Box>
          <Modal
            isOpen={isOpen}
            onClose={handleClose}
            closeOnOverlayClick={!createRunMutation.isLoading}
            closeOnEsc={!createRunMutation.isLoading}
            size="md">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>New Run - {protocol.data?.name || "Protocol"}</ModalHeader>
              <ModalCloseButton onClick={handleClose} isDisabled={createRunMutation.isLoading} />
              <ModalBody>
                <VStack align="start" spacing={4}>
<<<<<<< HEAD
                  <>
                    {Object.entries(uiParams).map(([param, paramInfo]) => {
                      const linkedVariableName = (paramInfo as any).variable_name;
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
=======
                  <Box width="100%" borderRadius="md" p={4}>
                    <FormControl isInvalid={!!formErrors}>
                      <FormLabel textAlign="center">Number of Runs</FormLabel>
                      <HStack justifyContent="center">
                        <Button {...dec} isDisabled={createRunMutation.isLoading}>
                          -
                        </Button>
                        <Input
                          maxWidth="100px"
                          {...numberOfRuns}
                          textAlign="center"
                          isDisabled={createRunMutation.isLoading}
                        />
                        <Button {...inc} isDisabled={createRunMutation.isLoading}>
                          +
                        </Button>
                      </HStack>
                    </FormControl>
                  </Box>
>>>>>>> origin
                </VStack>
              </ModalBody>
              <ModalFooter>
                <ButtonGroup>
                  <Button onClick={handleClose} isDisabled={createRunMutation.isLoading}>
                    Cancel
                  </Button>
                  <Button
                    isLoading={createRunMutation.isLoading}
                    isDisabled={createRunMutation.isLoading || !workcellName}
                    colorScheme="teal"
                    onClick={handleQueueRun}>
                    Queue Run{Number(numberOfRuns.value) > 1 ? "s" : ""}
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
