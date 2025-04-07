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
  Progress,
  Box,
} from "@chakra-ui/react";
import { MdPause, MdInfo, MdAccessTime, MdAlarm, MdTimer } from "react-icons/md";
import { TimerModal } from "./TimerModal";

// Interface that matches the UIMessage from CommandQueue
interface MessageProps {
  isOpen: boolean;
  messageData: {
    type: 'pause' | 'message' | 'timer';
    message: string;
    title?: string;
    pausedAt?: number;
    timerDuration?: number;
    timerEndTime?: number;
  };
  onContinue: () => void;
}

// Function to format elapsed time
const formatElapsedTime = (elapsedMs: number): string => {
  // Handle negative times (shouldn't happen but just in case)
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

// Format time for display (used for timer)
const formatTimeDisplay = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const MessageModal: React.FC<MessageProps> = ({ 
  isOpen, 
  messageData, 
  onContinue 
}) => {
  // Don't render anything if not open
  if (!isOpen) return null;
  
  // If it's a timer, use the TimerModal component
  if (messageData.type === 'timer') {
    return <TimerModal isOpen={isOpen} messageData={messageData} onSkip={onContinue} />;
  }
  
  // For pause and message types, use the standard MessageModal
  const bgColor = useColorModeValue("white", "gray.800");
  const pauseIconColor = useColorModeValue("orange.500", "orange.300");
  const messageIconColor = useColorModeValue("blue.500", "blue.300");
  const timerBgColor = useColorModeValue("gray.100", "gray.700");
  
  // State to track elapsed time
  const [elapsedTime, setElapsedTime] = useState<string>("0s");
  
  // Update the elapsed time every second
  useEffect(() => {
    if (!isOpen) return;
    
    // If no pausedAt provided, use current time
    const startTime = messageData.pausedAt || Date.now();
    
    const calculateElapsedTime = () => {
      const now = Date.now();
      const elapsed = now - startTime;
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
    <Modal isOpen={isOpen} onClose={() => {}} closeOnOverlayClick={false} isCentered>
      <ModalOverlay
        backdropFilter="blur(4px)"
        bg="blackAlpha.300"
      />
      <ModalContent bg={bgColor} maxW="md">
        <ModalHeader textAlign="center">
          {messageData.type === 'pause' ? 'Run Paused' : messageData.title || 'Message'}
        </ModalHeader>
        
        {/* Elapsed Time Display (only for pause type) */}
        {messageData.type === 'pause' && (
          <HStack 
            px={4} 
            py={2} 
            bg={timerBgColor} 
            justify="center" 
            spacing={2}
          >
            <Icon as={MdAccessTime} color={pauseIconColor} />
            <Text fontSize="sm" fontWeight="medium">
              Paused for: <Badge colorScheme="orange" fontSize="sm">{elapsedTime}</Badge>
            </Text>
          </HStack>
        )}
        
        <ModalBody>
          <VStack spacing={4} py={2}>
            {/* Only show icon for pause type */}
            {messageData.type === 'pause' ? (
              <Icon as={MdPause} boxSize={12} color={pauseIconColor} />
            ) : (
              <Icon as={MdInfo} boxSize={12} color={messageIconColor} />
            )}
            <Text textAlign="center">{messageData.message}</Text>
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