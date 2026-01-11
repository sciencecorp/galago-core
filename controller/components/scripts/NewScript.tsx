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
  FormHelperText,
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { showErrorToast, showSuccessToast } from "./utils";
import { FileAddIcon } from "../ui/Icons";

interface NewScriptProps {
  isDisabled?: boolean;
  activeFolderId?: number;
  onScriptCreated?: () => void;
}

export const NewScript: React.FC<NewScriptProps> = (props) => {
  const { isDisabled, activeFolderId, onScriptCreated } = props;
  const [scriptName, setScriptName] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const addScript = trpc.script.add.useMutation();
  const { refetch } = trpc.script.getAll.useQuery();

  const handleSave = async () => {
    const isNotValid = validateScriptName(scriptName);
    if (isNotValid) {
      showErrorToast("Error creating script", isNotValid);
      return;
    }

    const script = {
      name: scriptName,
      content: "",
      language: extensionToLanguage(getFileExtensionFromName(scriptName)),
      folderId: activeFolderId,
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
  };

  const getFileExtensionFromName = (name: string) => {
    const parts = name.split(".");
    return parts[parts.length - 1];
  };

  const validateScriptName = (name: string) => {
    const extension = getFileExtensionFromName(name);
    if (!["py", "js", "cs"].includes(extension)) {
      return "Invalid file extension. Must be .py, .js or .cs";
    }
    return "";
  };

  const extensionToLanguage = (extension: string) => {
    switch (extension) {
      case "py":
        return "python";
      case "js":
        return "javascript";
      case "cs":
        return "csharp";
      default:
        return "Unknown";
    }
  };

  return (
    <>
      <Tooltip label="Create New Script" placement="top">
        <IconButton
          aria-label="New Script"
          icon={<FileAddIcon size={16} />}
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
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input value={scriptName} onChange={(e) => setScriptName(e.target.value)} />
                <FormHelperText>
                  Enter a name for your script. Must be of type .py, .js or .cs
                </FormHelperText>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              isDisabled={!scriptName || validateScriptName(scriptName) !== ""}
              colorScheme="teal"
              onClick={handleSave}
              mr={3}
              isLoading={isLoading}>
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
