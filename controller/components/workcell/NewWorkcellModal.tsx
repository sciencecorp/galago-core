import React, { useState } from "react";
import {
  VStack,
  Button,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { Plus } from "lucide-react";
import { Workcell } from "@/types";
import { successToast, errorToast } from "../ui/Toast";

export const NewWorkcellModal: React.FC = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [_value, _setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [_type, _setType] = useState<string>("");
  const createWorkcell = trpc.workcell.add.useMutation();
  const { data: _fetchedWorkcells, refetch } = trpc.workcell.getAll.useQuery();

  const handleSave = async () => {
    const workcell = { name, description, location } as Workcell;
    setIsLoading(true);
    try {
      await createWorkcell.mutateAsync(workcell);
      successToast("", "Workcell created successfully");
      onClose();
      await refetch();
    } catch (error) {
      errorToast("", "Error creating workcell");
    }
    setIsLoading(false);
    clearForm();
  };

  const clearForm = () => {
    setName("");
    _setValue("");
    _setType("string");
  };

  return (
    <>
      <Button onClick={onOpen} colorScheme="teal" leftIcon={<Plus size={16} />} size="sm">
        New
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Workcell</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Location</FormLabel>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" onClick={handleSave} mr={3} isLoading={isLoading}>
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
