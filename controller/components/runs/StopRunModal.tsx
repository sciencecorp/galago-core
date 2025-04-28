import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Icon,
  VStack,
  useColorModeValue,
  HStack,
  CircularProgress,
  CircularProgressLabel,
  Center,
} from "@chakra-ui/react";
import { MdStop, MdWarning } from "react-icons/md";

interface StopRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  messageData: {
    type: "pause" | "message" | "timer" | "stop_run";
    timerDuration?: number;
    timerEndTime?: number;
    timerStartTime?: number;
    message: string;
    title?: string;
    pausedAt?: number;
  };
}

export const StopRunModal: React.FC<StopRunModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  messageData,
}) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const warningIconColor = useColorModeValue("red.500", "red.300");
  const [countdown, setCountdown] = useState<number | null>(null);

  const handleConfirm = () => {
    // Start the countdown
    setCountdown(5);

    // Create an interval that decrements the countdown every second
    const intervalId = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          // When countdown reaches 1, clear the interval and call onConfirm
          clearInterval(intervalId);
          onConfirm();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        // Clear the countdown if modal is closed
        setCountdown(null);
        onClose();
      }}
      isCentered>
      <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.300" />
      <ModalContent bg={bgColor} maxW="md">
        <ModalHeader textAlign="center">Stop Run</ModalHeader>
        <ModalBody>
          {countdown === null ? (
            <VStack spacing={2} py={2}>
              <Icon as={MdWarning} boxSize={12} color={warningIconColor} />
              <Text textAlign="center">{messageData.message}</Text>
            </VStack>
          ) : (
            <Center>
              <VStack spacing={2} align="center">
                <CircularProgress
                  value={(countdown / 5) * 100}
                  size="80px"
                  thickness="8px"
                  color="red.500">
                  <CircularProgressLabel fontSize="2xl" fontWeight="bold">
                    {countdown}
                  </CircularProgressLabel>
                </CircularProgress>
                <Text mt={2} fontWeight="bold" textAlign="center">
                  Run will stop in {countdown} second{countdown !== 1 ? "s" : ""}
                </Text>
              </VStack>
            </Center>
          )}
        </ModalBody>
        <ModalFooter>
          <HStack spacing={4} width="100%" justifyContent="center">
            <Button
              variant="outline"
              onClick={() => {
                setCountdown(null);
                onClose();
              }}
              isDisabled={countdown !== null}>
              Continue
            </Button>
            <Button
              colorScheme="red"
              onClick={handleConfirm}
              leftIcon={<MdStop />}
              isDisabled={countdown !== null}>
              Stop Run
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
