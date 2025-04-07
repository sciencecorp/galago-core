import React, { useState, useEffect, useRef } from "react";
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
  Badge,
} from "@chakra-ui/react";
import { MdPause, MdAccessTime } from "react-icons/md";

interface PauseModalProps {
  isOpen: boolean;
  message: string;
  pausedAt?: number;
  onContinue: () => void;
}

// Function to format elapsed time
const formatElapsedTime = (elapsedMs: number): string => {
  if (elapsedMs < 0) elapsedMs = 0;

  const seconds = Math.floor(elapsedMs / 1000) % 60;
  const minutes = Math.floor(elapsedMs / (1000 * 60)) % 60;
  const hours = Math.floor(elapsedMs / (1000 * 60 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  message,
  pausedAt,
  onContinue,
}) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const pauseIconColor = useColorModeValue("orange.500", "orange.300");
  const timerBgColor = useColorModeValue("gray.100", "gray.700");

  // State to track elapsed time
  const [elapsedTime, setElapsedTime] = useState<string>("0s");

  // Ref for interval cleanup
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update the elapsed time every second
  useEffect(() => {
    if (!isOpen) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // If no pausedAt provided, use current time
    const startTime = pausedAt || Date.now();

    const calculateElapsedTime = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      setElapsedTime(formatElapsedTime(elapsed));
    };

    // Initial calculation
    calculateElapsedTime();

    // Set up timer
    intervalRef.current = setInterval(calculateElapsedTime, 1000);

    // Clean up
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isOpen, pausedAt]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <Modal isOpen={true} onClose={() => {}} closeOnOverlayClick={false} isCentered>
      <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.300" />
      <ModalContent bg={bgColor} maxW="md">
        <ModalHeader textAlign="center">Run Paused</ModalHeader>

        {/* Elapsed Time Display */}
        <HStack px={4} py={2} bg={timerBgColor} justify="center" spacing={2}>
          <Icon as={MdAccessTime} color={pauseIconColor} />
          <Text fontSize="sm" fontWeight="medium">
            Paused for:{" "}
            <Badge colorScheme="orange" fontSize="sm">
              {elapsedTime}
            </Badge>
          </Text>
        </HStack>

        <ModalBody>
          <VStack spacing={4} py={2}>
            <Icon as={MdPause} boxSize={12} color={pauseIconColor} />
            <Text textAlign="center">{message}</Text>
          </VStack>
        </ModalBody>
        <ModalFooter justifyContent="center">
          <Button colorScheme="blue" onClick={onContinue} size="lg" minW="150px">
            Continue
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
