import React, { useEffect } from "react";
import {
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  ModalFooter,
  useColorModeValue,
  Text,
  Icon,
} from "@chakra-ui/react";
import { semantic } from "../../themes/colors";
import tokens from "../../themes/tokens";
import { StatusIcons, FormIcons } from "../ui/Icons";

interface UserMessageProps {
  title: string;
  message: string;
  type: "error" | "warning" | "info" | "success";
  isOpen: boolean;
  onClose: () => void;
}

export const UserMessage: React.FC<UserMessageProps> = ({
  title,
  message,
  type,
  isOpen,
  onClose,
}) => {
  const modalBg = useColorModeValue(
    semantic.background.primary.light,
    semantic.background.primary.dark,
  );
  const textColor = useColorModeValue(semantic.text.primary.light, semantic.text.primary.dark);
  const borderColor = useColorModeValue(
    semantic.border.primary.light,
    semantic.border.primary.dark,
  );

  // Get the appropriate icon and color based on message type
  const getIconAndColor = () => {
    switch (type) {
      case "error":
        return { icon: StatusIcons.Warning, color: semantic.status.error.light };
      case "warning":
        return { icon: StatusIcons.Warning, color: semantic.status.warning.light };
      case "success":
        return { icon: FormIcons.Check, color: semantic.status.success.light };
      case "info":
      default:
        return { icon: StatusIcons.Info, color: semantic.text.accent.light };
    }
  };

  const { icon, color } = getIconAndColor();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent
        bg={modalBg}
        borderColor={borderColor}
        borderWidth={tokens.borders.widths.thin}
        boxShadow={tokens.shadows.lg}>
        <ModalHeader color={textColor} display="flex" alignItems="center" gap={tokens.spacing.sm}>
          <Icon as={icon} color={color} boxSize={5} />
          <Text>{title}</Text>
        </ModalHeader>
        <ModalCloseButton color={textColor} />
        <ModalBody color={textColor}>{message}</ModalBody>
        <ModalFooter>
          <Button bg={color} color="white" _hover={{ bg: `${color}90` }} mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UserMessage;
