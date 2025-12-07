import React, { useState, useEffect } from "react";
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
  Select,
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { RiAddFill } from "react-icons/ri";
import { ToolType } from "gen-interfaces/controller";
import { capitalizeFirst } from "@/utils/parser";
import { Tool, Workcell } from "@/types/api";
import { successToast, errorToast } from "../ui/Toast";

export const NewWorkcellModal: React.FC = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState<string>("");
  const createWorkcell = trpc.workcell.add.useMutation();
  const { data: fetchedWorkcells, refetch } = trpc.workcell.getAll.useQuery();

  const handleSave = async () => {
    const workcell = { name, description, location } as Workcell;
    setIsLoading(true);
    try {
      await createWorkcell.mutateAsync(workcell);
      successToast("Workcell created", "");
      onClose();
      await refetch();
      
      // If running in Electron, start the Tool Box server
      if (typeof window !== "undefined" && window.galagoDesktop?.isElectron) {
        try {
          const isInstalled = await window.galagoDesktop.isToolInstalled("toolbox");
          if (isInstalled) {
            const result = await window.galagoDesktop.startTool("toolbox", 51010);
            if (result.success && !result.alreadyRunning) {
              successToast("Tool Box started", `Running on port ${result.port}`);
            }
          }
        } catch (electronError) {
          console.error("Failed to start Tool Box:", electronError);
        }
      }
    } catch (error) {
      errorToast("Error creating workcell", "");
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
