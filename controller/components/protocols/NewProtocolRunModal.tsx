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
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { z } from "zod";

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
          value={value || paramInfo.default}
          onChange={(_stringValue, numberValue) => setValue(numberValue)}>
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
          value={value || paramInfo.default}
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
            value={value || paramInfo.default}
            onChange={(e) => setValue(e.currentTarget.value.split(",").map((s) => s.trim()))}
          />
        );
      } else {
        return (
          <Input
            value={value || paramInfo.default}
            onChange={(e) => setValue(e.currentTarget.value)}
          />
        );
      }
    case "boolean":
      return (
        <Checkbox
          isChecked={value || paramInfo.default}
          onChange={(e) => setValue(e.currentTarget.checked)}
        />
      );
    case "Barcode":
      return (
        <Input
          value={value || paramInfo.default}
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
            value={value || paramInfo.default}
            onChange={(e) => setValue(e.currentTarget.value)}
          />
        </>
      );
  }
}

export default function NewProtocolRunModal({ id, onClose }: { id: string; onClose: () => void }) {
  console.log("NewProtocolRunModal - Received ID:", id);

  const router = useRouter();
  const toast = useToast();
  const workcellData = trpc.workcell.getSelectedWorkcell.useQuery();
  const workcellName = workcellData.data;
  const protocol = trpc.protocol.get.useQuery(
    {
      id: id.toString(),
    },
    {
      onSuccess: (data) => {
        console.log("Protocol data received:", data);
      },
      onError: (error) => {
        console.log("Protocol fetch error:", {
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
  const uiParams = protocol.data?.uiParams || {};
  const { isOpen, onOpen } = useDisclosure({ defaultIsOpen: true });
  const [userDefinedParams, setUserDefinedParams] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<z.inferFormattedError<z.AnyZodObject>>();

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
    router.push("/protocols", undefined, { shallow: true });
  };

  const handleSuccess = () => {
    onClose();
    router.push("/runs", undefined, { shallow: true });
  };

  return (
    <>
      {workcellName && uiParams && protocol && (
        <Box>
          <Modal isOpen={isOpen} onClose={handleClose} closeOnOverlayClick={true} closeOnEsc={true}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>New Protocol Run</ModalHeader>
              <ModalCloseButton onClick={handleClose} />
              <ModalBody>
                <VStack align="start" spacing={4}>
                  <>
                    {Object.entries(uiParams).map(([param, paramInfo]) => {
                      return (
                        <FormControl key={param} isInvalid={!!(formErrors && formErrors[param])}>
                          <FormLabel>{param}</FormLabel>
                          <ParamInput
                            paramInfo={paramInfo}
                            value={userDefinedParams[param]}
                            setValue={(value) =>
                              setUserDefinedParams({ ...userDefinedParams, [param]: value })
                            }
                          />
                          <FormHelperText>{paramInfo.description}</FormHelperText>
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
                  </>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <ButtonGroup>
                  <Button onClick={handleClose}>Cancel</Button>
                  <Button
                    colorScheme="blue"
                    onClick={() => {
                      createRunMutation.mutate(
                        {
                          protocolId: id,
                          workcellName: workcellName,
                          params: userDefinedParams,
                        },
                        {
                          onSuccess: handleSuccess,
                        },
                      );
                    }}>
                    Start Run
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
