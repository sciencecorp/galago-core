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
  Switch,
  useToast,
  NumberInput,
  NumberInputField,
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { Labware } from "./types";
import { RiAddFill } from "react-icons/ri";

export const LabwareModal: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [numberOfWells, setNumberOfWells] = useState(0);
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
    setNumberOfWells(0);
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
      number_of_wells: numberOfWells,
      z_offset: zOffset,
      width,
      height,
      plate_lid_offset: plateLidOffset,
      lid_offset: lidOffset,
      stack_height: stackHeight,
      has_lid: hasLid,
      image_url: imageUrl,
    } as Labware;

    setIsLoading(true);
    try {
      await addLabware.mutateAsync(labware);
      toast({
        title: "Labware created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
      await refetch();
    } catch (error) {
      toast({
        title: "Error saving labware",
        description: `Please try again. ${error}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
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
                <FormLabel>Number of Wells</FormLabel>
                <NumberInput value={numberOfWells} onChange={(_, val) => setNumberOfWells(val)}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Z Offset (mm)</FormLabel>
                <NumberInput value={zOffset} onChange={(_, val) => setZOffset(val)}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Width (mm)</FormLabel>
                <NumberInput value={width} onChange={(_, val) => setWidth(val)}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Height (mm)</FormLabel>
                <NumberInput value={height} onChange={(_, val) => setHeight(val)}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Plate Lid Offset (mm)</FormLabel>
                <NumberInput value={plateLidOffset} onChange={(_, val) => setPlateLidOffset(val)}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Lid Offset (mm)</FormLabel>
                <NumberInput value={lidOffset} onChange={(_, val) => setLidOffset(val)}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              <FormControl>
                <FormLabel>Stack Height (mm)</FormLabel>
                <NumberInput value={stackHeight} onChange={(_, val) => setStackHeight(val)}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Has Lid</FormLabel>
                <Switch isChecked={hasLid} onChange={(e) => setHasLid(e.target.checked)} />
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
