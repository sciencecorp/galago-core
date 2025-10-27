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
  IconButton,
  Tooltip,
  ButtonGroup,
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { validateScriptName, showErrorToast, showSuccessToast } from "./utils";
import { FileAddIcon } from "../ui/Icons";
import { ScriptEnvironment } from "@/types/api";

interface NewScriptProps {
  isDisabled?: boolean;
  activeFolderId?: number;
  onScriptCreated?: () => void;
  defaultEnvironment?: ScriptEnvironment;
}

export const NewScript: React.FC<NewScriptProps> = (props) => {
  const { isDisabled, activeFolderId, onScriptCreated, defaultEnvironment } = props;
  const [scriptName, setScriptName] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const [description, setDescription] = useState("");
  const addScript = trpc.script.add.useMutation();
  const { data: fetchedScript, refetch } = trpc.script.getAll.useQuery();
  const [selectedLanguage, setSelectedLanguage] = useState<string>("python"); 
  const [environment, setEnvironment] = useState<ScriptEnvironment>(defaultEnvironment || "global");

  const handleSave = async () => {
    const isNotValid = validateScriptName(scriptName);
    if (isNotValid) {
      showErrorToast("Error creating script", isNotValid);
      return;
    }

    const script = {
      name: scriptName,
      description,
      content: "",
      language: environment === "opentrons" ? "python" : selectedLanguage,
      is_blocking: true,
      folder_id: activeFolderId,
      script_environment: environment,
    };

    setIsLoading(true);
    try {
      await addScript.mutateAsync(script);
      await refetch();
      onScriptCreated?.();
      showSuccessToast("Script created successfully");
      onClose();
    } catch (error) {
      showErrorToast("Error creating script", `Please try again. ${error}`);
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
      <Tooltip label="Create New Script" placement="top">
        <IconButton
          aria-label="New Script"
          icon={<FileAddIcon />}
          colorScheme="teal"
          variant="ghost"
          size="md"
          onClick={onOpen}
          isDisabled={isDisabled}
        />
      </Tooltip>
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
              {environment === "global" && (
                <FormControl>
                  <ButtonGroup>
                    <Button
                      size="sm"
                      colorScheme={selectedLanguage === "python" ? "teal" : "gray"}
                      onClick={() => setSelectedLanguage("python")}>
                      Python
                    </Button>
                    <Button
                      size="sm"
                      colorScheme={selectedLanguage === "javascript" ? "teal" : "gray"}
                      onClick={() => setSelectedLanguage("javascript")}>
                      JavaScript
                    </Button>
                    <Button
                      size="sm"
                      colorScheme={selectedLanguage === "csharp" ? "teal" : "gray"}
                      onClick={() => setSelectedLanguage("csharp")}>
                      C#
                    </Button>
                  </ButtonGroup>
                </FormControl>
              )}
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
