import React, { useState, useEffect } from "react";
import {
  VStack,
  Button,
  Input,
  useToast,
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
  Select,
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { RiAddFill } from "react-icons/ri";
import { ToolType } from "gen-interfaces/controller";
import { capitalizeFirst } from "@/utils/parser";
import { Tool , Workcell} from "@/types/api";

export const NewWorkcellModal: React.FC = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location ,setLocation] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const [type, setType] = useState<string>("");
  const createWorkcell = trpc.workcell.add.useMutation();
  const { data: fetchedWorkcells, refetch } = trpc.workcell.getAll.useQuery();

  const handleSave = async () => {
    const workcell = { name , description, location} as Workcell;
    setIsLoading(true);
    try {
      await createWorkcell.mutateAsync(workcell);
      toast({
        title: `Workcell created successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
      await refetch();
    } catch (error) {
      toast({
        title: "Error creating workcell",
        description: `Please try again. ${error}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setIsLoading(false);
    clearForm();
  };

  const clearForm = () => {
    setName("");
    setValue("");
    setType("string");
  };

  return (
    <>
      <Button onClick={onOpen} colorScheme="teal" leftIcon={<RiAddFill />}>
        New Workcell
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
