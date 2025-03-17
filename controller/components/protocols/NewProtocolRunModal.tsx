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
  Select,
  Text,
  useDisclosure,
  useToast,
  VStack,
  Box,
  Divider,
  useColorModeValue,
  useNumberInput,
  HStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
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
          value={value ?? paramInfo.default ?? ""}
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
    case "enum":
      return (
        <Select
          value={value ?? paramInfo.default ?? ""}
          onChange={(e) => setValue(e.currentTarget.value)}>
          {paramInfo.options.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>
      );
    case "string":
      if (Array.isArray(paramInfo.default)) {
        return (
          <Input
            value={value ?? paramInfo.default ?? ""}
            onChange={(e) => setValue(e.currentTarget.value.split(",").map((s) => s.trim()))}
          />
        );
      } else {
        return (
          <Input
            value={value ?? paramInfo.default ?? ""}
            onChange={(e) => setValue(e.currentTarget.value)}
          />
        );
      }
    case "boolean":
      return (
        <Checkbox
          isChecked={value ?? paramInfo.default ?? false}
          onChange={(e) => setValue(e.currentTarget.checked)}
        />
      );
    case "Barcode":
      return (
        <Input
          value={value ?? paramInfo.default ?? ""}
          onChange={(e) => setValue(e.currentTarget.value)}
        />
      );
    case "WellPlateWithWells":
      return <div>Insert cool well plate picker here</div>;
    default:
      return (
        <>
          <Text>Unknown param type: {paramInfo.type}</Text>
          <Input
            value={value ?? paramInfo.default ?? ""}
            onChange={(e) => setValue(e.currentTarget.value)}
          />
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

  useEffect(() => {
    if (protocol.data) {
      console.log("Protocol data:");
      console.log(protocol.data.params);
    }
  }, [protocol.data]);

  const uiParams = protocol.data?.params || {};
  const { isOpen, onOpen } = useDisclosure({ defaultIsOpen: true });
  const [userDefinedParams, setUserDefinedParams] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<z.inferFormattedError<z.AnyZodObject>>();
  const spacerColor = useColorModeValue("gray.400", "gray.100");
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
  const runCountBg = useColorModeValue("gray.50", "gray.800");


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
                      return (
                        <FormControl key={param} isInvalid={!!(formErrors && formErrors[param])}>
                          <FormLabel>{capitalizeFirst(param.replaceAll("_", " "))}</FormLabel>
                          <ParamInput
                            paramInfo={paramInfo as ProtocolParamInfo}
                            value={userDefinedParams[param]}
                            setValue={(value) =>
                              setUserDefinedParams({ ...userDefinedParams, [param]: value })
                            }
                          />
                          <FormHelperText>
                            {(paramInfo as ProtocolParamInfo).description}
                          </FormHelperText>
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
                    <Box width="100%" borderRadius="md" p={4} bg={runCountBg} mt={4}>
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
                    isLoading={createRunMutation.isLoading}
                    isDisabled={createRunMutation.isLoading}
                    colorScheme="teal"
                    onClick={async () => {
                      console.log("QUEUing run");
                      console.log(userDefinedParams);
                      // await createRunMutation.mutate(
                      //   {
                      //     protocolId: id,
                      //     workcellName: workcellName,
                      //     params: userDefinedParams,
                      //     numberOfRuns: Number(numberOfRuns.value),
                      //   },
                      //   {
                      //     onSuccess: handleSuccess,
                      //   },
                      // );
                    }}>
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
