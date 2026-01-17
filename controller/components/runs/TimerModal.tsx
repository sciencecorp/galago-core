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
  Progress,
  Box,
} from "@chakra-ui/react";
import {
  AlarmClock, // replaces MdAlarm
  Timer, // replaces MdTimer
} from "lucide-react";

interface TimerModalProps {
  isOpen: boolean;
  messageData: {
    message: string;
    pausedAt?: number;
    timerDuration?: number;
    timerEndTime?: number;
  };
  onSkip: () => void;
}

// Format time for display
const formatTimeDisplay = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export const TimerModal: React.FC<TimerModalProps> = ({ isOpen, messageData, onSkip }) => {
  const bgColor = useColorModeValue("white", "surface.section");
  const timerColor = useColorModeValue("purple.500", "purple.300");

  // State to track remaining time
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [progress, setProgress] = useState<number>(100);

  // Use refs to prevent infinite update loops
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasSkippedRef = useRef<boolean>(false);
  const isActiveRef = useRef<boolean>(false);

  // Function to safely call onSkip
  const handleSkip = () => {
    if (hasSkippedRef.current) return;
    hasSkippedRef.current = true;

    // Clear any timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    onSkip();
  };

  // Initialize and update timer
  useEffect(() => {
    // Handle component mounting/unmounting
    isActiveRef.current = true;
    hasSkippedRef.current = false;

    // Don't do anything if not open
    if (!isOpen || !messageData.timerEndTime) {
      return () => {
        isActiveRef.current = false;
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }

    // Calculate initial state
    const now = Date.now();
    const endTime = messageData.timerEndTime;
    const duration = messageData.timerDuration || 0;

    // Handle case where timer might already be expired
    if (now >= endTime) {
      setRemainingSeconds(0);
      setProgress(0);
      setTotalSeconds(Math.ceil(duration / 1000));

      // Call skip after a short delay to avoid render issues
      setTimeout(() => {
        if (isActiveRef.current && !hasSkippedRef.current) {
          handleSkip();
        }
      }, 50);

      return;
    }

    // Set up the update function
    const updateTimer = () => {
      if (!isActiveRef.current || hasSkippedRef.current) return;

      const currentTime = Date.now();
      const timeLeft = Math.max(0, endTime - currentTime);
      const secondsLeft = Math.ceil(timeLeft / 1000);
      const totalDuration = Math.ceil(duration / 1000);
      const progressPercent = Math.max(0, Math.min(100, (timeLeft / duration) * 100));

      setRemainingSeconds(secondsLeft);
      setTotalSeconds(totalDuration);
      setProgress(progressPercent);

      // Auto-complete when timer ends
      if (secondsLeft <= 0 && isActiveRef.current && !hasSkippedRef.current) {
        setTimeout(handleSkip, 50);
      }
    };

    // Initial update
    updateTimer();

    // Set up interval for updates
    timerRef.current = setInterval(updateTimer, 100);

    // Cleanup function
    return () => {
      isActiveRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isOpen, messageData.timerEndTime, messageData.timerDuration, onSkip]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <Modal isOpen={true} onClose={() => {}} closeOnOverlayClick={false} isCentered>
      <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.300" />
      <ModalContent bg={bgColor} maxW="md">
        <ModalHeader textAlign="center">
          <HStack spacing={2} justifyContent="center">
            <Icon as={AlarmClock} color={timerColor} />
            <Text>Timer</Text>
          </HStack>
        </ModalHeader>

        <ModalBody>
          <VStack spacing={6} py={2}>
            <Icon as={Timer} boxSize={12} color={timerColor} />

            <Text textAlign="center" fontWeight="medium">
              {messageData.message}
            </Text>

            {/* Timer display */}
            <Box w="100%" textAlign="center">
              <Text fontSize="4xl" fontWeight="bold" color={timerColor}>
                {formatTimeDisplay(remainingSeconds)}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Total duration: {formatTimeDisplay(totalSeconds)}
              </Text>
            </Box>

            {/* Progress bar */}
            <Box w="100%" pt={2}>
              <Progress
                value={progress}
                size="lg"
                colorScheme="purple"
                borderRadius="full"
                hasStripe
                isAnimated
              />
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter justifyContent="center">
          <Button colorScheme="purple" onClick={handleSkip} size="lg" minW="150px">
            Skip Timer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
