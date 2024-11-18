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
  Divider,
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { RiAddFill } from "react-icons/ri";
import { ToolConfig, ToolType } from "gen-interfaces/controller";
import { capitalizeFirst } from "@/utils/parser";
import { Tool } from "@/types/api";

interface EditToolModalProps {
  toolId : number;
  toolInfo : ToolConfig;
  isOpen : boolean;
  onClose : () => void;
  refetch : () => void; 
}


export const EditToolModal : React.FC<EditToolModalProps> = (props) => {
  const { toolId, toolInfo, isOpen, onClose, refetch} = props;
  const toast = useToast();
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const editTool = trpc.tool.edit.useMutation();
  const {name, description, config, type} = toolInfo;
  const context = trpc.useContext();


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
  }

  const handleSave = async () => {
    try {
      let id = toolId;
      const editedTool = { name: newName || name, description: newDescription || description, config };
      await editTool.mutateAsync({ id:id, config:editedTool });
      toast({
        title: "Tool updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    
      //Invalidate the query cache to ensure fresh data is fetched
    context.tool.info.invalidate({ toolId });
    } catch (error) {
      toast({
        title: "Error updating tool",
        description: `Please try again. ${error}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Tool</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  placeholder="New name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input
                  placeholder="New description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </FormControl>
              <Divider />
              {config && type != ToolType.unknown && type != ToolType.UNRECOGNIZED && Object.entries(config[type] || {}).map(([key, value]) => (
                <FormControl key={key}>
                  <FormLabel>{capitalizeFirst(key).replaceAll("_", " ")}</FormLabel>
                  <Input
                    value={value}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      console.log("New value: ", newValue);
                    }}
                  />
                </FormControl>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" onClick={handleSave}>
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
