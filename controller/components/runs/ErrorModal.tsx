import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  useColorModeValue,
  Icon,
  Divider,
} from "@chakra-ui/react";
import { WarningTwoIcon } from "@chakra-ui/icons";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorMessage: string;
  onRetry: () => void;
  onClearAll: () => void;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  errorMessage,
  onRetry,
  onClearAll,
}) => {
  const headerBg = useColorModeValue("red.50", "red.900");
  const headerColor = useColorModeValue("red.600", "red.200");

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay backdropFilter="blur(3px)" />
      <ModalContent>
        <ModalHeader bg={headerBg} color={headerColor} borderTopRadius="md" px={6} py={4}>
          <VStack align="center" spacing={2}>
            <Icon as={WarningTwoIcon} boxSize={8} />
            <Text>Error Occurred</Text>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody px={6} py={5}>
          <VStack spacing={4} align="stretch">
            <Text fontWeight="medium">An error occurred while executing the command:</Text>
            <Text fontStyle="italic" color="red.500" fontSize="sm">
              {errorMessage}
            </Text>
            <Divider />
            <Text fontSize="sm">
              You can either retry the last command or clear all commands in the queue.
            </Text>
          </VStack>
        </ModalBody>
        <ModalFooter gap={3}>
          <Button variant="outline" onClick={onClose}>
            Dismiss
          </Button>
          <Button onClick={onRetry} colorScheme="blue">
            Retry
          </Button>
          <Button onClick={onClearAll} colorScheme="red" variant="outline">
            Stop
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
