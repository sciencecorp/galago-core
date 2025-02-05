import React, { useState, useEffect } from "react";
import {
  VStack,
  Box,
  Button,
  HStack,
  Heading,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
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
import { Variable } from "./types";
import { RiAddFill } from "react-icons/ri";

export const VariableModal: React.FC = () => {
  const [name, setName] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [value, setValue] = useState("");
  const [type, setType] = useState("string" as Variable["type"]);
  const [isLoading, setIsLoading] = useState(false);
  const addVariable = trpc.variable.add.useMutation();
  const toast = useToast();

  const { data: fetchedVariables, refetch } = trpc.variable.getAll.useQuery();

  const clearForm = () => {
    setName("");
    setValue("");
    setType("string");
  };

  const handleSave = async () => {
    const variable = { name, value, type } as Variable;
    setIsLoading(true);
    try {
      await addVariable.mutateAsync(variable);
      toast({
        title: `Variable created successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
      await refetch();
    } catch (error) {
      toast({
        title: "Error saving variable",
        description: `Please try again. ${error}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setIsLoading(false);
    clearForm();
  };

  return (
    <>
      <Button onClick={onOpen} colorScheme="teal" leftIcon={<RiAddFill />}>
        New Variable
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Variable</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Type</FormLabel>
                <Select value={type} onChange={(e) => setType(e.target.value as Variable["type"])}>
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="array">Array</option>
                  <option value="object">Object</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Value</FormLabel>
                {type === "boolean" ? (
                  <Select value={value} onChange={(e) => setValue(e.target.value)} placeholder="Choose a value">
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </Select>
                ) : (
                  <Input value={value} onChange={(e) => setValue(e.target.value)} />
                )}
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
