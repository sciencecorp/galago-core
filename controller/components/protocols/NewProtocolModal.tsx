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
import { trpc } from "@/utils/trpc";
interface NewProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewProtocolModal: React.FC<NewProtocolModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<"development" | "qc" | "production">("development");
  const [workcell, setWorkcell] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();

  // const createProtocol = trpc.protocol.create.useMutation({
  //   onSuccess: () => {
  //     onClose();
  //     router.push("/protocols");
  //   },
  // });

  const handleSubmit = async () => {
    // await createProtocol.mutateAsync({
    //   name,
    //   category,
    //   workcell,
    //   description,
    // });
    console.log("create protocol");
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
                onChange={(e) => setCategory(e.target.value as "development" | "qc" | "production")}
                placeholder="Select category">
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
