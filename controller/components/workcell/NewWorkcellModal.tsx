import React, { useState, useEffect } from "react";
import {
  VStack,
  Button,
  Input,
  useToast,
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
  useColorModeValue,
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { ToolType } from "gen-interfaces/controller";
import { capitalizeFirst } from "@/utils/parser";
import { Tool, Workcell } from "@/types/api";
import { Icon, FormIcons } from "../ui/Icons";
import { semantic } from "../../themes/colors";
import tokens from "../../themes/tokens";

export const NewWorkcellModal: React.FC = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const [type, setType] = useState<string>("");
  const createWorkcell = trpc.workcell.add.useMutation();
  const { data: fetchedWorkcells, refetch } = trpc.workcell.getAll.useQuery();

  const accentColor = useColorModeValue(semantic.text.accent.light, semantic.text.accent.dark);
  const borderColor = useColorModeValue(
    semantic.border.secondary.light,
    semantic.border.secondary.dark,
  );
  const modalBg = useColorModeValue(
    semantic.background.primary.light,
    semantic.background.primary.dark,
  );
  const textColor = useColorModeValue(semantic.text.primary.light, semantic.text.primary.dark);
  const buttonHoverBg = useColorModeValue(
    semantic.background.hover.light,
    semantic.background.hover.dark,
  );

  const handleSave = async () => {
    const workcell = { name, description, location } as Workcell;
    setIsLoading(true);
    try {
      await createWorkcell.mutateAsync(workcell);
      toast({
        title: `Workcell created successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
      await refetch();
    } catch (error) {
      toast({
        title: "Error creating workcell",
        description: `Please try again. ${error}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setIsLoading(false);
    clearForm();
  };

  const clearForm = () => {
    setName("");
    setValue("");
    setType("string");
    setDescription("");
    setLocation("");
  };

  return (
    <>
      <Button
        onClick={onOpen}
        bg={accentColor}
        color="white"
        _hover={{ bg: `${accentColor}90` }}
        leftIcon={<Icon as={FormIcons.Add} />}
        borderRadius={tokens.borders.radii.md}>
        New Workcell
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent
          bg={modalBg}
          borderColor={borderColor}
          borderWidth={tokens.borders.widths.thin}
          boxShadow={tokens.shadows.md}>
          <ModalHeader color={textColor}>Add Workcell</ModalHeader>
          <ModalCloseButton color={textColor} />
          <ModalBody>
            <VStack spacing={tokens.spacing.md}>
              <FormControl>
                <FormLabel color={textColor}>Name</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  borderColor={borderColor}
                  color={textColor}
                  _focus={{ borderColor: accentColor }}
                />
              </FormControl>
              <FormControl>
                <FormLabel color={textColor}>Description</FormLabel>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  borderColor={borderColor}
                  color={textColor}
                  _focus={{ borderColor: accentColor }}
                />
              </FormControl>
              <FormControl>
                <FormLabel color={textColor}>Location</FormLabel>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  borderColor={borderColor}
                  color={textColor}
                  _focus={{ borderColor: accentColor }}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              onClick={onClose}
              color={textColor}
              _hover={{ bg: buttonHoverBg }}
              mr={tokens.spacing.sm}>
              Cancel
            </Button>
            <Button
              bg={accentColor}
              color="white"
              _hover={{ bg: `${accentColor}90` }}
              onClick={handleSave}
              isLoading={isLoading}
              borderRadius={tokens.borders.radii.md}>
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
