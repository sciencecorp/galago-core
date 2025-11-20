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
  Box,
  Flex,
  Badge,
  Icon,
  Divider,
  Code,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { WarningTwoIcon } from "@chakra-ui/icons";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorData: {
    message: string;
    code?: string;
    details?: string;
  };
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  errorData,
}) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const errorBadgeBg = useColorModeValue("red.100", "red.900");
  const errorBadgeColor = useColorModeValue("red.800", "red.200");
  const codeBg = useColorModeValue("gray.100", "gray.700");

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay backdropFilter="blur(2px)" />
      <ModalContent bg={bgColor} borderRadius="lg" boxShadow="xl">
        <ModalHeader>
          <Flex alignItems="center">
            <Icon as={WarningTwoIcon} color="red.500" mr={2} boxSize={5} />
            <Text>Error Executing Command</Text>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text fontWeight="bold" fontSize="lg">
              {errorData.message}
            </Text>

            {errorData.code && (
              <Flex>
                <Badge
                  bg={errorBadgeBg}
                  color={errorBadgeColor}
                  px={2}
                  py={1}
                  borderRadius="md"
                >
                  Error Code: {errorData.code}
                </Badge>
              </Flex>
            )}

            <Divider />

            {errorData.details && (
              <Box>
                <Text fontWeight="semibold" mb={2}>
                  Technical Details:
                </Text>
                <Code
                  p={3}
                  borderRadius="md"
                  bg={codeBg}
                  fontSize="sm"
                  width="100%"
                  overflowX="auto"
                >
                  {errorData.details} - {errorData.message}
                </Code>
              </Box>
            )}

            <Box>
              <Text fontSize="sm" color="gray.500">
                If this error persists, please check the tool connection status
                and verify that the command is supported by the specified tool.
              </Text>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
