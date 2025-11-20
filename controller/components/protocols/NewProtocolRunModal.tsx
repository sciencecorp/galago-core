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

export default function NewProtocolRunModal({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
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
  const [formErrors, setFormErrors] =
    useState<z.inferFormattedError<z.AnyZodObject>>();

  const { getInputProps, getIncrementButtonProps, getDecrementButtonProps } =
    useNumberInput({
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

  const handleQueueRun = () => {
    if (!workcellName) {
      errorToast(
        "No workcell selected",
        "Please select a workcell before queuing a run",
      );
      return;
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
            size="md"
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                New Run - {protocol.data?.name || "Protocol"}
              </ModalHeader>
              <ModalCloseButton
                onClick={handleClose}
                isDisabled={createRunMutation.isLoading}
              />
              <ModalBody>
                <VStack align="start" spacing={4}>
                  <Box width="100%" borderRadius="md" p={4}>
                    <FormControl isInvalid={!!formErrors}>
                      <FormLabel textAlign="center">Number of Runs</FormLabel>
                      <HStack justifyContent="center">
                        <Button
                          {...dec}
                          isDisabled={createRunMutation.isLoading}
                        >
                          -
                        </Button>
                        <Input
                          maxWidth="100px"
                          {...numberOfRuns}
                          textAlign="center"
                          isDisabled={createRunMutation.isLoading}
                        />
                        <Button
                          {...inc}
                          isDisabled={createRunMutation.isLoading}
                        >
                          +
                        </Button>
                      </HStack>
                    </FormControl>
                  </Box>
                </VStack>
              </ModalBody>
              <ModalFooter>
                <ButtonGroup>
                  <Button
                    onClick={handleClose}
                    isDisabled={createRunMutation.isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    isLoading={createRunMutation.isLoading}
                    isDisabled={createRunMutation.isLoading || !workcellName}
                    colorScheme="teal"
                    onClick={handleQueueRun}
                  >
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
