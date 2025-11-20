import React, { useState, useEffect } from "react";
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
  Box,
} from "@chakra-ui/react";
import { MdPause, MdInfo, MdAccessTime } from "react-icons/md";

// Interface that matches the UIMessage from CommandQueue
interface MessageProps {
  isOpen: boolean;
  messageData: {
    type: "pause" | "message" | "timer" | "stop_run" | "user_form";
    timerDuration?: number;
    timerEndTime?: number;
    timerStartTime?: number;
    message: string;
    title?: string;
    pausedAt?: number;
  };
  onContinue: () => void;
}

// Function to format elapsed time
const formatElapsedTime = (elapsedMs: number): string => {
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

// Function to format message text with simple markup
const FormatText = ({ text }: { text: string }) => {
  if (!text) return null;

  // Process the text in two steps:
  // 1. Handle newlines first
  const lines = text.split("\\n");

  // 2. Process each line for bold formatting
  const processedLines = lines.map((line, lineIndex) => {
    // Split by * for bold formatting
    const parts = line.split(/(\*[^*]+\*)/g);

    const formattedParts = parts.map((part, partIndex) => {
      // Check if this part is a bold section (surrounded by *)
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
        // Remove the * characters and make it bold
        return (
          <Text
            as="span"
            fontWeight="bold"
            key={`part-${lineIndex}-${partIndex}`}
          >
            {part.slice(1, -1)}
          </Text>
        );
      }
      return (
        <React.Fragment key={`part-${lineIndex}-${partIndex}`}>
          {part}
        </React.Fragment>
      );
    });

    // Return the formatted line
    return (
      <React.Fragment key={`line-${lineIndex}`}>
        {lineIndex > 0 && <br />}
        {formattedParts}
      </React.Fragment>
    );
  });

  return <>{processedLines}</>;
};

export const MessageModal: React.FC<MessageProps> = ({
  isOpen,
  messageData,
  onContinue,
}) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const pauseIconColor = useColorModeValue("orange.500", "orange.300");
  const messageIconColor = useColorModeValue("blue.500", "blue.300");
  const timerBgColor = useColorModeValue("gray.100", "gray.700");

  // State to track elapsed time
  const [elapsedTime, setElapsedTime] = useState<string>("0s");

  // Update the elapsed time every second
  useEffect(() => {
    if (!isOpen || !messageData.pausedAt) return;

    const calculateElapsedTime = () => {
      const now = Date.now();
      const elapsed = now - messageData.pausedAt!;
      setElapsedTime(formatElapsedTime(elapsed));
    };

    // Initial calculation
    calculateElapsedTime();

    // Set up timer
    const timer = setInterval(calculateElapsedTime, 1000);

    // Clean up
    return () => clearInterval(timer);
  }, [isOpen, messageData.pausedAt]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      closeOnOverlayClick={false}
      isCentered
    >
      <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.300" />
      <ModalContent bg={bgColor} maxW="md">
        <ModalHeader textAlign="center">
          {messageData.type === "pause"
            ? "Run Paused"
            : messageData.title || "Message"}
        </ModalHeader>
        {messageData.type === "pause" && messageData.pausedAt && (
          <HStack px={4} py={2} justify="center" spacing={2}>
            <Icon as={MdAccessTime} color={pauseIconColor} />
            <Text fontSize="sm" fontWeight="medium">
              Paused for:{" "}
              <Badge colorScheme="orange" fontSize="sm">
                {elapsedTime}
              </Badge>
            </Text>
          </HStack>
        )}
        <ModalBody>
          <VStack spacing={4} py={2}>
            {/* Only show icon for pause type */}
            {messageData.type === "pause" ? (
              <Icon as={MdPause} boxSize={12} color={pauseIconColor} />
            ) : (
              <Icon as={MdInfo} boxSize={12} color={messageIconColor} />
            )}
            <Box textAlign="center">
              <FormatText text={messageData.message} />
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter justifyContent="center">
          <Button
            colorScheme="blue"
            onClick={onContinue}
            size="lg"
            minW="150px"
          >
            Continue
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
