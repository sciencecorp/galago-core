import {
    Button,
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    Textarea,
    VStack,
  } from "@chakra-ui/react";
  import { useState } from "react";
  import { ProtocolManager } from "./ProtocolManager";
  import { useRouter } from "next/router";
  
  interface NewProtocolModalProps {
    isOpen: boolean;
    onClose: () => void;
  }
  
  export const NewProtocolModal: React.FC<NewProtocolModalProps> = ({
    isOpen,
    onClose,
  }) => {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [workcell, setWorkcell] = useState("");
    const [description, setDescription] = useState("");
    const router = useRouter();
  
    const protocolManager = new ProtocolManager({
      onSuccess: () => {
        onClose();
        router.push("/protocols");
      },
    });
  
    const createProtocol = protocolManager.useCreateProtocol();
  
    const handleSubmit = async () => {
      await createProtocol.mutateAsync({
        name,
        category: category as "development" | "qc" | "production",
        workcell,
        description,
      });
    };
  
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Protocol</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Protocol name"
                />
              </FormControl>
  
              <FormControl isRequired>
                <FormLabel>Category</FormLabel>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Select category"
                >
                  <option value="development">Development</option>
                  <option value="qc">QC</option>
                  <option value="production">Production</option>
                </Select>
              </FormControl>
  
              <FormControl isRequired>
                <FormLabel>Workcell</FormLabel>
                <Input
                  value={workcell}
                  onChange={(e) => setWorkcell(e.target.value)}
                  placeholder="Workcell name"
                />
              </FormControl>
  
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Protocol description"
                />
              </FormControl>
            </VStack>
          </ModalBody>
  
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };