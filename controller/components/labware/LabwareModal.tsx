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
  useColorModeValue,
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { Labware as LabwareResponse } from "@/types/api";
import { Icon, AddFillIcon, RectangleStackIcon } from "../ui/Icons";
import { semantic } from "../../themes/colors";
import tokens from "../../themes/tokens";

export const LabwareModal: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

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

  const accentColor = useColorModeValue(semantic.text.accent.light, semantic.text.accent.dark);
  const borderColor = useColorModeValue(
    semantic.border.primary.light,
    semantic.border.primary.dark,
  );
  const modalBg = useColorModeValue(
    semantic.background.primary.light,
    semantic.background.primary.dark,
  );
  const textColor = useColorModeValue(semantic.text.primary.light, semantic.text.primary.dark);
  const textSecondary = useColorModeValue(
    semantic.text.secondary.light,
    semantic.text.secondary.dark,
  );

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
      z_offset: zOffset,
      width,
      height,
      plate_lid_offset: plateLidOffset,
      lid_offset: lidOffset,
      stack_height: stackHeight,
      has_lid: hasLid,
      image_url: imageUrl,
    } as LabwareResponse;

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
        title: "Error creating labware",
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
      <Button
        onClick={onOpen}
        bg={accentColor}
        color="white"
        _hover={{ bg: `${accentColor}90` }}
        leftIcon={<Icon as={AddFillIcon} />}>
        New Labware
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent
          bg={modalBg}
          borderColor={borderColor}
          borderWidth={tokens.borders.widths.thin}
          boxShadow={tokens.shadows.md}>
          <ModalHeader color={textColor}>Create Labware</ModalHeader>
          <ModalCloseButton color={textColor} />
          <ModalBody>
            <VStack spacing={tokens.spacing.md} align="stretch">
              <FormControl isRequired>
                <FormLabel color={textColor}>Name</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor }}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Description</FormLabel>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={textColor}>Number of Rows</FormLabel>
                <NumberInput
                  min={1}
                  value={numberOfRows}
                  onChange={(_, val) => setNumberOfRows(val)}>
                  <NumberInputField
                    borderColor={borderColor}
                    _focus={{ borderColor: accentColor }}
                  />
                </NumberInput>
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={textColor}>Number of Columns</FormLabel>
                <NumberInput
                  min={1}
                  value={numberOfColumns}
                  onChange={(_, val) => setNumberOfColumns(val)}>
                  <NumberInputField
                    borderColor={borderColor}
                    _focus={{ borderColor: accentColor }}
                  />
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Z Offset (mm)</FormLabel>
                <NumberInput value={zOffset} onChange={(_, val) => setZOffset(val)}>
                  <NumberInputField
                    borderColor={borderColor}
                    _focus={{ borderColor: accentColor }}
                  />
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Width (mm)</FormLabel>
                <NumberInput min={0} value={width} onChange={(_, val) => setWidth(val)}>
                  <NumberInputField
                    borderColor={borderColor}
                    _focus={{ borderColor: accentColor }}
                  />
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Height (mm)</FormLabel>
                <NumberInput min={0} value={height} onChange={(_, val) => setHeight(val)}>
                  <NumberInputField
                    borderColor={borderColor}
                    _focus={{ borderColor: accentColor }}
                  />
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Plate Lid Offset (mm)</FormLabel>
                <NumberInput value={plateLidOffset} onChange={(_, val) => setPlateLidOffset(val)}>
                  <NumberInputField
                    borderColor={borderColor}
                    _focus={{ borderColor: accentColor }}
                  />
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Lid Offset (mm)</FormLabel>
                <NumberInput value={lidOffset} onChange={(_, val) => setLidOffset(val)}>
                  <NumberInputField
                    borderColor={borderColor}
                    _focus={{ borderColor: accentColor }}
                  />
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Stack Height (mm)</FormLabel>
                <NumberInput value={stackHeight} onChange={(_, val) => setStackHeight(val)}>
                  <NumberInputField
                    borderColor={borderColor}
                    _focus={{ borderColor: accentColor }}
                  />
                </NumberInput>
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0" color={textColor}>
                  Has Lid
                </FormLabel>
                <Switch
                  isChecked={hasLid}
                  onChange={(e) => setHasLid(e.target.checked)}
                  sx={{
                    "& .chakra-switch__track[data-checked]": {
                      backgroundColor: accentColor,
                    },
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Image URL</FormLabel>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor }}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              onClick={onClose}
              mr={tokens.spacing.sm}
              color={textColor}
              _hover={{ bg: `${semantic.background.hover.light}50` }}>
              Cancel
            </Button>
            <Button
              bg={accentColor}
              color="white"
              _hover={{ bg: `${accentColor}90` }}
              onClick={handleSave}
              isLoading={isLoading}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
