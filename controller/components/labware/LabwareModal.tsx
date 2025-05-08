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
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { Labware as LabwareResponse } from "@/types/api";
import { RiAddFill } from "react-icons/ri";
import { successToast, errorToast } from "../ui/Toast";

export const LabwareModal: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [numberOfRows, setNumberOfRows] = useState(0);
  const [numberOfColumns, setNumberOfColumns] = useState(0);
  const [zOffset, setZOffset] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [plateLidOffset, setPlateLidOffset] = useState(0);
  const [lidOffset, setLidOffset] = useState(0);
  const [stackHeight, setStackHeight] = useState(0);
  const [hasLid, setHasLid] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const addLabware = trpc.labware.add.useMutation();
  const { refetch } = trpc.labware.getAll.useQuery();

  const clearForm = () => {
    setName("");
    setDescription("");
    setNumberOfRows(0);
    setNumberOfColumns(0);
    setZOffset(0);
    setWidth(0);
    setHeight(0);
    setPlateLidOffset(0);
    setLidOffset(0);
    setStackHeight(0);
    setHasLid(false);
    setImageUrl("");
  };

  const handleSave = async () => {
    const labware = {
      name,
      description,
      number_of_rows: numberOfRows,
      number_of_columns: numberOfColumns,
      // z_offset: zOffset,
      // width,
      // height,
      // plate_lid_offset: plateLidOffset,
      // lid_offset: lidOffset,
      // stack_height: stackHeight,
      // has_lid: hasLid,
      image_url: imageUrl,
    } as LabwareResponse;

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
      <Button onClick={onOpen} colorScheme="teal" leftIcon={<RiAddFill />}>
        New Labware
      </Button>
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
                <NumberInput value={numberOfRows} onChange={(_, val) => setNumberOfRows(val)}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Columns</FormLabel>
                <NumberInput value={numberOfColumns} onChange={(_, val) => setNumberOfColumns(val)}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Image URL</FormLabel>
                <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
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
