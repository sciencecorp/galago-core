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
import { RiAddFill } from "react-icons/ri";
import { ToolType } from "gen-interfaces/controller";
import { capitalizeFirst } from "@/utils/parser";
import {Tool} from "@/types/api";

export const NewToolModal: React.FC = () => {
  const [name, setName] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const [type, setType] = useState<string>("");
  const addTool = trpc.tool.add.useMutation();
  const { data: fetchedVariables, refetch } = trpc.variable.getAll.useQuery();
 

  const availableTools = Object.values(ToolType);

  const handleSave = async () => {
    let workcell_id = 1;
    let ip = "12"
    let port = 12
    const tool = { name, type, workcell_id, ip, port };
    setIsLoading(true);
    try {
      await addTool.mutateAsync(tool);
      toast({
        title: `Tool created successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
      await refetch();
    } catch (error) {
      toast({
        title: "Error creating tool",
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
        New Tool
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Tool</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Select Tool Type</FormLabel>
                <Select value={type} onChange={(e) => setType(e.target.value)}>
                    {availableTools.filter(x => x !==ToolType.UNRECOGNIZED && x !==ToolType.unknown && x !==ToolType.toolbox).sort().map((tool) => (
                        <option key={tool} value={tool}>
                          {capitalizeFirst(tool.replaceAll("_", " "))} 
                        </option>
                    ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
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
