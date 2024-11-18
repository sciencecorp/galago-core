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
import { Script } from "@/types/api";

interface NewScriptProps {
  isDisabled?: boolean;
}


export const NewScript: React.FC<NewScriptProps> = (props) => {
  const { isDisabled} = props;
  const [scriptName, setScriptName] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const addScript = trpc.script.add.useMutation();
  const [description, setDescription] = useState("");
  const {data: fetchedScript, refetch} = trpc.script.getAll.useQuery();

  const validateScriptName = (name: string): string => {
    if (!name) return "Name cannot be empty";
    if (name.length > 25) return "Name cannot exceed 25 characters";
    if (/[ .\\/]/.test(name)) return "Name cannot contain spaces, periods, or slashes";
    return "";
  };

  const handleSave = async () => {
    let is_blocking = true;
    let language = "python";
    let content = "";
    let isNotValid = validateScriptName(scriptName);
    if (isNotValid) {
      toast({
        title: "Error creating script",
        description: isNotValid,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    let name =`${scriptName}.py`;
    const script = {name, description, content, language, is_blocking};
    setIsLoading(true);
    try {
      await addScript.mutateAsync(script);
      await refetch();
      toast({
        title: `Script created successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error creating script",
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
    setScriptName("");
    setDescription("");
  };

  return (
    <>
      <Button onClick={onOpen} colorScheme="teal" leftIcon={<RiAddFill />} isDisabled={isDisabled}>
        New Script
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Script</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input value={scriptName} onChange={(e) => setScriptName(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
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
