import React, { useState, useEffect } from "react";
import {
  VStack,
  Box,
  Button,
  HStack,
  Heading,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
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
import { Variable } from "./types";
import { Icon, AddFillIcon, VariableIcons } from "../ui/Icons";
import { semantic } from "../../themes/colors";
import tokens from "../../themes/tokens";

export const VariableModal: React.FC = () => {
  const [name, setName] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [value, setValue] = useState("");
  const [type, setType] = useState("string" as Variable["type"]);
  const [isLoading, setIsLoading] = useState(false);
  const addVariable = trpc.variable.add.useMutation();
  const toast = useToast();

  const { data: fetchedVariables, refetch } = trpc.variable.getAll.useQuery();

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

  const clearForm = () => {
    setName("");
    setValue("");
    setType("string");
  };

  const handleSave = async () => {
    const variable = { name, value, type } as Variable;
    setIsLoading(true);
    try {
      await addVariable.mutateAsync(variable);
      toast({
        title: `Variable created successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
      await refetch();
    } catch (error) {
      toast({
        title: "Error saving variable",
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
        New Variable
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent
          bg={modalBg}
          borderColor={borderColor}
          borderWidth={tokens.borders.widths.thin}
          boxShadow={tokens.shadows.md}>
          <ModalHeader color={textColor}>Create Variable</ModalHeader>
          <ModalCloseButton color={textColor} />
          <ModalBody>
            <VStack spacing={tokens.spacing.md}>
              <FormControl>
                <FormLabel color={textColor}>Name</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor }}
                />
              </FormControl>
              <FormControl>
                <FormLabel color={textColor}>Type</FormLabel>
                <Select
                  value={type}
                  onChange={(e) => setType(e.target.value as Variable["type"])}
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor }}
                  icon={
                    <Icon
                      as={
                        type === "string"
                          ? VariableIcons.String
                          : type === "number"
                            ? VariableIcons.Number
                            : VariableIcons.Boolean
                      }
                    />
                  }>
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="array">Array</option>
                  <option value="object">Object</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel color={textColor}>Value</FormLabel>
                {type === "boolean" ? (
                  <Select
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Choose a value"
                    borderColor={borderColor}
                    _focus={{ borderColor: accentColor }}>
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </Select>
                ) : (
                  <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    borderColor={borderColor}
                    _focus={{ borderColor: accentColor }}
                  />
                )}
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              onClick={onClose}
              color={textColor}
              _hover={{ bg: `${semantic.background.hover.light}50` }}>
              Cancel
            </Button>
            <Button
              bg={accentColor}
              color="white"
              _hover={{ bg: `${accentColor}90` }}
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
