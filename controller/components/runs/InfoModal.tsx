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
import { MdInfo } from "react-icons/md";

interface InfoModalProps {
  isOpen: boolean;
  message: string;
  title?: string;
  onContinue: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  message,
  title = "Message",
  onContinue,
}) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const messageIconColor = useColorModeValue("blue.500", "blue.300");

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <Modal isOpen={true} onClose={() => {}} closeOnOverlayClick={false} isCentered>
      <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.300" />
      <ModalContent bg={bgColor} maxW="md">
        <ModalHeader textAlign="center">{title}</ModalHeader>

        <ModalBody>
          <VStack spacing={4} py={2}>
            <Icon as={MdInfo} boxSize={12} color={messageIconColor} />
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
