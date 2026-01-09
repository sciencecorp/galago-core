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
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { z } from "zod";
import { successToast, errorToast } from "../ui/Toast";

// Change id prop type to number
export default function NewProtocolRunModal({ id, onClose }: { id: number; onClose: () => void }) {
  const router = useRouter();
  const workcellData = trpc.workcell.getSelectedWorkcell.useQuery();
  const workcellName = workcellData.data;

  // FIX: Pass id directly as a number, not as an object
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

  const handleQueueRun = () => {
    if (!workcellName) {
      errorToast("No workcell selected", "Please select a workcell before queuing a run");
      return;
    }

    createRunMutation.mutate({
      protocolId: id,
      numberOfRuns: Number(numberOfRuns.value),
    });
  };

  // Add loading state
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

  // Add error state
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
      size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>New Run - {protocol.name || "Protocol"}</ModalHeader>
        <ModalCloseButton onClick={handleClose} isDisabled={createRunMutation.isLoading} />
        <ModalBody>
          <VStack align="start" spacing={4}>
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
