// components/bravo/CreateDeckConfigModal.tsx
import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { successToast, errorToast } from "@/components/ui/Toast";
import { RiAddFill } from "react-icons/ri";

interface CreateDeckConfigModalProps {
  workcellId: number;
  currentDeckPositions: Array<{
    position: number;
    labwareType: string;
  }>;
  onConfigCreated?: () => void;
}

export const CreateDeckConfigModal: React.FC<CreateDeckConfigModalProps> = ({
  workcellId,
  currentDeckPositions,
  onConfigCreated,
}) => {
  const [configName, setConfigName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const createConfig = trpc.bravoDeckConfig.create.useMutation();

  const clearForm = () => {
    setConfigName("");
  };

  const handleSave = async () => {
    if (!configName.trim()) {
      errorToast("Error", "Configuration name is required");
      return;
    }

    setIsLoading(true);
    try {
      // Convert current deck positions to the required format
      const deckLayout: Record<string, string | null> = {};
      for (let i = 1; i <= 9; i++) {
        const position = currentDeckPositions.find((p) => p.position === i);
        deckLayout[i.toString()] =
          position?.labwareType && position.labwareType !== "Empty" ? position.labwareType : null;
      }

      await createConfig.mutateAsync({
        name: configName.trim(),
        workcell_id: workcellId,
        deck_layout: deckLayout,
      });

      successToast("Config created", `Deck configuration "${configName}" has been saved`);
      onClose();
      if (onConfigCreated) {
        onConfigCreated();
      }
    } catch (error) {
      console.error("Failed to create config:", error);
      errorToast("Error", `Failed to create configuration. ${error}`);
    } finally {
      setIsLoading(false);
      clearForm();
    }
  };

  const handleClose = () => {
    onClose();
    clearForm();
  };

  return (
    <>
      <Button onClick={onOpen} colorScheme="purple" leftIcon={<RiAddFill />} size="sm">
        New Config
      </Button>

      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Deck Configuration</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Configuration Name</FormLabel>
                <Input
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                  placeholder="e.g., Standard 96-well Setup"
                  isDisabled={isLoading}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              onClick={handleSave}
              mr={3}
              isLoading={isLoading}
              isDisabled={!configName.trim()}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
