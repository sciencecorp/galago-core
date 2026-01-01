import React, { useState } from "react";
import {
  Button,
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
  Input,
  VStack,
  NumberInput,
  NumberInputField,
  Tooltip,
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { Plus } from "lucide-react";
import { successToast, errorToast } from "../ui/Toast";

interface LabwareModalProps {
  isDisabled: boolean;
}
export const LabwareModal: React.FC<LabwareModalProps> = ({ isDisabled }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [numberOfRows, setNumberOfRows] = useState(8);
  const [numberOfColumns, setNumberOfColumns] = useState(12);

  const addLabware = trpc.labware.add.useMutation();
  const { refetch } = trpc.labware.getAll.useQuery();

  const clearForm = () => {
    setName("");
    setDescription("");
    setNumberOfRows(0);
    setNumberOfColumns(0);
  };

  const handleSave = async () => {
    const labware = {
      name: name,
      description: description,
      numberOfRows: numberOfRows,
      numberOfColumns: numberOfColumns,
    };

    setIsLoading(true);
    try {
      await addLabware.mutateAsync(labware);
      successToast("Success", "Labware created successfully");
      onClose();
      await refetch();
    } catch (error) {
      errorToast(
        "Error saving labware",
        error instanceof Error ? error.message : "An error occurred",
      );
    }
    setIsLoading(false);
    clearForm();
  };

  return (
    <>
      <Tooltip
        label={isDisabled ? "Create or Select a Workcell to add new labware" : ""}
        placement="top"
        hasArrow>
        <Button
          isDisabled={isDisabled}
          onClick={onOpen}
          colorScheme="teal"
          leftIcon={<Plus size={14} />}
          size="sm">
          New
        </Button>
      </Tooltip>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Labware</ModalHeader>
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
                <FormLabel>Rows</FormLabel>
                <NumberInput
                  defaultValue={8}
                  value={numberOfRows}
                  onChange={(_, val) => setNumberOfRows(val)}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Columns</FormLabel>
                <NumberInput
                  defaultValue={12}
                  value={numberOfColumns}
                  onChange={(_, val) => setNumberOfColumns(val)}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              isDisabled={isLoading || !name || !description || !numberOfRows || !numberOfColumns}
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
