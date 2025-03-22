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
  Select,
  useColorModeValue,
} from "@chakra-ui/react";
import { Nest, Plate } from "@/types/api";
import { semantic } from "../../themes/colors";
import tokens from "../../themes/tokens";

type CheckInModalProps = {
  isOpen: boolean;
  onClose: () => void;
  availableNests: Nest[];
  selectedPlate: Plate | null;
  onSubmit: (nestId: number) => Promise<void>;
};

const CheckInModal: React.FC<CheckInModalProps> = ({
  isOpen,
  onClose,
  availableNests,
  selectedPlate,
  onSubmit,
}) => {
  const [selectedNestId, setSelectedNestId] = React.useState<number | "">("");

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
        <ModalHeader color={textColor}>Check In Plate</ModalHeader>
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
              <FormLabel color={textColor}>Select Nest</FormLabel>
              <Select
                placeholder="Select nest"
                value={selectedNestId}
                onChange={(e) => setSelectedNestId(Number(e.target.value))}
                borderColor={borderColor}
                bg={inputBg}
                color={textColor}
                _focus={{ borderColor: accentColor }}>
                {availableNests.map((nest) => (
                  <option key={nest.id} value={nest.id}>
                    {nest.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            <Button
              bg={accentColor}
              color="white"
              _hover={{ bg: `${accentColor}90` }}
              width="100%"
              onClick={() => selectedNestId && onSubmit(selectedNestId)}
              isDisabled={!selectedNestId}
              borderRadius={tokens.borders.radii.md}>
              Check In
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CheckInModal;
