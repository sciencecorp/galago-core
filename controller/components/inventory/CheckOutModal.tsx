import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { Plate } from "@/types/api";
import { semantic } from "../../themes/colors";
import tokens from "../../themes/tokens";

type CheckOutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedPlate: Plate | null;
  onSubmit: () => Promise<void>;
};

const CheckOutModal: React.FC<CheckOutModalProps> = ({
  isOpen,
  onClose,
  selectedPlate,
  onSubmit,
}) => {
  const textColor = useColorModeValue(semantic.text.primary.light, semantic.text.primary.dark);
  const borderColor = useColorModeValue(
    semantic.border.secondary.light,
    semantic.border.secondary.dark,
  );
  const modalBg = useColorModeValue(
    semantic.background.primary.light,
    semantic.background.primary.dark,
  );
  const accentColor = useColorModeValue(semantic.text.accent.light, semantic.text.accent.dark);
  const inputBg = useColorModeValue(semantic.background.card.light, semantic.background.card.dark);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent
        bg={modalBg}
        borderColor={borderColor}
        borderWidth={tokens.borders.widths.thin}
        boxShadow={tokens.shadows.md}>
        <ModalHeader color={textColor}>Check Out Plate</ModalHeader>
        <ModalCloseButton color={textColor} />
        <ModalBody pb={tokens.spacing.md}>
          <VStack spacing={tokens.spacing.md}>
            <FormControl>
              <FormLabel color={textColor}>Selected Plate</FormLabel>
              <Input
                value={selectedPlate?.name || ""}
                isReadOnly
                borderColor={borderColor}
                bg={inputBg}
                color={textColor}
              />
            </FormControl>
            <FormControl>
              <FormLabel color={textColor}>Current Nest</FormLabel>
              <Input
                value={selectedPlate?.nest_id || "Not checked in"}
                isReadOnly
                borderColor={borderColor}
                bg={inputBg}
                color={textColor}
              />
            </FormControl>
            <Button
              bg={accentColor}
              color="white"
              _hover={{ bg: `${accentColor}90` }}
              width="100%"
              onClick={onSubmit}
              isDisabled={!selectedPlate?.nest_id}
              borderRadius={tokens.borders.radii.md}>
              Check Out
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CheckOutModal;
