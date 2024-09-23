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
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { run } from "node:test";
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

export default function NewProtocolRunModal({
  id
}: {
  id: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const workcellData = trpc.tool.getWorkcellName.useQuery();
  const workcellName = workcellData.data;
 // const [uiParams, setuiParams] = useState()
  const protocol = trpc.protocol.get.useQuery({id });
  const uiParams = protocol.data?.uiParams || {};
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [userDefinedParams, setUserDefinedParams] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<z.inferFormattedError<z.AnyZodObject>>();
  const [runsCount, setRunsCount] = useState<number>(1);

  const createRunMutation = trpc.run.create.useMutation({
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

  const queueRuns = async (workcell:string, id:string, userDefinedParams:Record<string, any>, runsCount:number) =>{
    for (let i = 0; i < runsCount; i++) {
      await createRunMutation.mutateAsync(
        {
          protocolId: id,
          workcellName:workcell,
          params: userDefinedParams,
        }
      );
    }

    setUserDefinedParams({});
    onClose();
    router.push(`/runs`);
  }

  return (
    <>
      {workcellName && uiParams && protocol && (
    <Box> 
      <Modal isOpen={true} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New Protocol Run</ModalHeader>
          <ModalCloseButton onClick={()=>{router.push(`/protocols`)}}/>
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
                        formErrors[param]?._errors.map((key,error) => (
                          <FormErrorMessage key={key}>{error}</FormErrorMessage>
                        ))}
                    </FormControl>
                  );
                })}
                {formErrors?._errors.map((key, error) => (
                  <FormErrorMessage key={key}>{error}</FormErrorMessage>
                ))}
              </>
              <Divider/>
              <FormLabel>Number of Runs:</FormLabel>
              <NumberInput
                width={100}
                value={runsCount}
                onChange={(_stringValue, numberValue) => setRunsCount(numberValue)}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <ButtonGroup>
              <Button onClick={()=>{router.push(`/protocols`)}}>Cancel</Button>
              <Button
                colorScheme="blue"
                onClick={async () => {
                  await queueRuns(workcellName, id, userDefinedParams, runsCount);
                }}>
                Start Run(s)
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
