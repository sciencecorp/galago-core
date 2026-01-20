import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { Icon } from "@/components/ui/Icons";
import { ArrowLeftRight } from "lucide-react";

interface TransferStationButtonProps {
  toolId: number;
  onCreate: (name: string) => Promise<void>;
}

export const TransferStationButton: React.FC<TransferStationButtonProps> = ({
  onCreate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await onCreate(name);
      setName("");
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to create transfer station:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        leftIcon={<Icon as={ArrowLeftRight} />}
        colorScheme="orange"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
      >
        Add Transfer Station
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Transfer Station</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Station Name</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., PF400_Transfer_1"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              colorScheme="orange"
              onClick={handleCreate}
              isLoading={isLoading}
              isDisabled={!name.trim()}
            >
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
