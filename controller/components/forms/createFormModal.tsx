import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useDisclosure,
  Tooltip,
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { successToast, errorToast } from "../ui/Toast";
import { RiAddFill } from "react-icons/ri";

export const CreateFormModal: React.FC<{ isDisabled?: boolean }> = ({ isDisabled }) => {
  const [formName, setFormName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const createForm = trpc.form.add.useMutation();
  const { refetch } = trpc.form.getAll.useQuery();

  const clearForm = () => {
    setFormName("");
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      errorToast("Error", "Form name is required");
      return;
    }

    setIsLoading(true);
    try {
      await createForm.mutateAsync({
        name: formName.trim(),
        fields: [],
      });

      successToast("Form created successfully", "");
      onClose();
      await refetch();
    } catch (error) {
      console.error("Failed to create form:", error);
      errorToast("Error creating form", `Please try again. ${error}`);
    }
    setIsLoading(false);
    clearForm();
  };

  const handleClose = () => {
    onClose();
    clearForm();
  };

  return (
    <>
      <Tooltip label={isDisabled ? "Select a workcell to create a form" : ""}>
        <Button
          onClick={onOpen}
          colorScheme="teal"
          leftIcon={<RiAddFill />}
          isDisabled={isDisabled}>
          New Form
        </Button>
      </Tooltip>

      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Form</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Form Name</FormLabel>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Enter form name"
                  isDisabled={isLoading}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleSave}
              mr={3}
              isLoading={isLoading}
              isDisabled={!formName.trim()}>
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
