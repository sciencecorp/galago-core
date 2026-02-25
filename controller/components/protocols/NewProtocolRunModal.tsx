import { trpc } from "@/utils/trpc";
import {
  Button,
  ButtonGroup,
  Checkbox,
  Divider,
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  useDisclosure,
  VStack,
  Box,
  useNumberInput,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { successToast, errorToast } from "../ui/Toast";
import type { ProtocolParameter } from "@/protocols/params";

function buildDefaultValues(params: ProtocolParameter[]): Record<string, string> {
  const values: Record<string, string> = {};
  for (const p of params) {
    values[p.name] = p.defaultValue ?? (p.type === "boolean" ? "false" : "");
  }
  return values;
}

function validateParams(
  params: ProtocolParameter[],
  values: Record<string, string>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const p of params) {
    const val = values[p.name] ?? "";
    if (p.required && val.trim() === "") {
      errors[p.name] = `${p.label} is required`;
      continue;
    }
    if (val.trim() === "") continue;
    if (p.type === "number" && isNaN(Number(val))) {
      errors[p.name] = "Must be a valid number";
    }
  }
  return errors;
}

export default function NewProtocolRunModal({ id, onClose }: { id: number; onClose: () => void }) {
  const router = useRouter();
  const workcellData = trpc.workcell.getSelectedWorkcell.useQuery();
  const workcellName = workcellData.data;

  const {
    data: protocol,
    isLoading,
    error,
  } = trpc.protocol.get.useQuery(id, {
    onError: (error) => {
      console.error({
        message: error.message,
        data: error.data,
      });
      errorToast("Error loading protocol", error.message);
    },
  });

  const { isOpen } = useDisclosure({ defaultIsOpen: true });
  const [formErrors, setFormErrors] = useState<z.inferFormattedError<z.AnyZodObject>>();
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [paramErrors, setParamErrors] = useState<Record<string, string>>({});

  const protocolParams: ProtocolParameter[] = protocol?.parameters ?? [];

  useEffect(() => {
    if (protocolParams.length > 0) {
      setParamValues(buildDefaultValues(protocolParams));
    }
  }, [protocol?.parameters]);

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
    onSuccess: () => {
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

  const handleQueueRun = () => {
    if (!workcellName) {
      errorToast("No workcell selected", "Please select a workcell before queuing a run");
      return;
    }

    if (protocolParams.length > 0) {
      const errors = validateParams(protocolParams, paramValues);
      setParamErrors(errors);
      if (Object.keys(errors).length > 0) return;
    }

    createRunMutation.mutate({
      protocolId: id,
      numberOfRuns: Number(numberOfRuns.value),
      ...(protocolParams.length > 0 ? { parameters: paramValues } : {}),
    });
  };

  const setParamValue = (name: string, value: string) => {
    setParamValues((prev) => ({ ...prev, [name]: value }));
    setParamErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Loading Protocol...</ModalHeader>
          <ModalBody>
            <Spinner size="xl" />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  if (error || !protocol) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Error</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="error">
              <AlertIcon />
              <Box>
                <AlertTitle>Error loading protocol</AlertTitle>
                <AlertDescription>{error?.message || "Protocol not found"}</AlertDescription>
              </Box>
            </Alert>
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      closeOnOverlayClick={!createRunMutation.isLoading}
      closeOnEsc={!createRunMutation.isLoading}
      size={protocolParams.length > 0 ? "lg" : "md"}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>New Run - {protocol.name || "Protocol"}</ModalHeader>
        <ModalCloseButton onClick={handleClose} isDisabled={createRunMutation.isLoading} />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            {protocolParams.length > 0 && (
              <>
                <Text fontWeight="semibold" fontSize="sm">
                  Parameters
                </Text>
                <VStack align="stretch" spacing={3}>
                  {protocolParams.map((param) => (
                    <FormControl
                      key={param.name}
                      isRequired={param.required}
                      isInvalid={!!paramErrors[param.name]}>
                      <FormLabel fontSize="sm">{param.label}</FormLabel>

                      {param.type === "string" && (
                        <Input
                          size="sm"
                          value={paramValues[param.name] ?? ""}
                          placeholder={param.defaultValue || ""}
                          isDisabled={createRunMutation.isLoading}
                          onChange={(e) => setParamValue(param.name, e.target.value)}
                        />
                      )}

                      {param.type === "number" && (
                        <NumberInput
                          size="sm"
                          value={paramValues[param.name] ?? ""}
                          isDisabled={createRunMutation.isLoading}
                          onChange={(val) => setParamValue(param.name, val)}>
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      )}

                      {param.type === "boolean" && (
                        <Checkbox
                          isChecked={paramValues[param.name] === "true"}
                          isDisabled={createRunMutation.isLoading}
                          onChange={(e) =>
                            setParamValue(param.name, e.target.checked ? "true" : "false")
                          }>
                          {paramValues[param.name] === "true" ? "true" : "false"}
                        </Checkbox>
                      )}

                      {param.type === "select" && (
                        <Select
                          size="sm"
                          value={paramValues[param.name] ?? ""}
                          placeholder="Select..."
                          isDisabled={createRunMutation.isLoading}
                          onChange={(e) => setParamValue(param.name, e.target.value)}>
                          {(param.options ?? []).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </Select>
                      )}

                      {param.description && (
                        <FormHelperText fontSize="xs">{param.description}</FormHelperText>
                      )}
                      {paramErrors[param.name] && (
                        <FormErrorMessage fontSize="xs">{paramErrors[param.name]}</FormErrorMessage>
                      )}
                    </FormControl>
                  ))}
                </VStack>
                <Divider />
              </>
            )}

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
  );
}
