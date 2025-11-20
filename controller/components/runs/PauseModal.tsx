import React from "react";
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
} from "@chakra-ui/react";
import { MdPause } from "react-icons/md";

interface PauseModalProps {
  isOpen: boolean;
  pauseMessage: string;
  onContinue: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  pauseMessage,
  onContinue,
}) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const iconColor = useColorModeValue("orange.500", "orange.300");

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      closeOnOverlayClick={false}
      isCentered
    >
      <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.300" />
      <ModalContent bg={bgColor} maxW="md">
        <ModalHeader textAlign="center">Run Paused</ModalHeader>
        <ModalBody>
          <VStack spacing={4} py={2}>
            <Icon as={MdPause} boxSize={12} color={iconColor} />
            <Text textAlign="center">{pauseMessage}</Text>
          </VStack>
        </ModalBody>
        <ModalFooter justifyContent="center">
          <Button
            // variant="outline"
            colorScheme="teal"
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
