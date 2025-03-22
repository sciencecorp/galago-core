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
import { Tool } from "@/types/api";
import { Icon, FormIcons } from "../ui/Icons";
import { semantic } from "../../themes/colors";
import tokens from "../../themes/tokens";

interface NewToolModalProps {
  isDisabled?: boolean;
}
export const NewToolModal: React.FC<NewToolModalProps> = (props) => {
  const { isDisabled } = props;
  const [name, setName] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const [type, setType] = useState<ToolType>(ToolType.UNRECOGNIZED);
  const addTool = trpc.tool.add.useMutation();
  const [description, setDescription] = useState("");
  const { data: fetchedIds, refetch } = trpc.tool.availableIDs.useQuery();
  const availableTools = Object.values(ToolType);
  const [defaultConfig, setDefaultConfig] = useState<any>(null);

  const textColor = useColorModeValue(semantic.text.primary.light, semantic.text.primary.dark);
  const borderColor = useColorModeValue(
    semantic.border.secondary.light,
    semantic.border.secondary.dark,
  );
  const modalBg = useColorModeValue(
    semantic.background.primary.light,
    semantic.background.primary.dark,
  );
  const accentColor = useColorModeValue(semantic.text.accent.light, semantic.text.accent.dark);
  const buttonHoverBg = useColorModeValue(
    semantic.background.hover.light,
    semantic.background.hover.dark,
  );

  const { data: configData, isFetching: isConfigLoading } =
    trpc.tool.getProtoConfigDefinitions.useQuery(type as ToolType, {
      enabled: !!type, // Only fetch when type is set
    });

  useEffect(() => {
    console.log("configData", configData);
    if (configData) {
      setDefaultConfig(configData);
    }
  }, [configData]);

  useEffect(() => {
    if (type && type !== ToolType.UNRECOGNIZED) {
      setName(capitalizeFirst(type.toLowerCase().replaceAll("_", " ")));
    }
  }, [type]);

  const handleSave = async () => {
    let workcell_id = 1;
    let ip = "localhost";
    let image_url = `/tool_icons/${type}.png`;
    const tool = {
      name,
      type,
      workcell_id,
      ip,
      image_url,
      description,
      config: { [type]: defaultConfig || {} },
    };
    setIsLoading(true);
    try {
      await addTool.mutateAsync(tool);
      await refetch();
      toast({
        title: `Tool created successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error creating tool",
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
    setType(ToolType.UNRECOGNIZED);
    setDescription("");
  };

  return (
    <>
      <Button
        onClick={onOpen}
        bg={accentColor}
        color="white"
        _hover={{ bg: `${accentColor}90` }}
        leftIcon={<Icon as={FormIcons.Add} />}
        isDisabled={isDisabled}
        borderRadius={tokens.borders.radii.md}>
        New Tool
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent
          bg={modalBg}
          borderColor={borderColor}
          borderWidth={tokens.borders.widths.thin}
          boxShadow={tokens.shadows.md}>
          <ModalHeader color={textColor}>Add Tool</ModalHeader>
          <ModalCloseButton color={textColor} />
          <ModalBody>
            <VStack spacing={tokens.spacing.md}>
              <FormControl>
                <FormLabel color={textColor}>Select Tool Type</FormLabel>
                <Select
                  value={type}
                  onChange={(e) => {
                    const enumValue = e.target.value as ToolType;
                    setType(enumValue); // This sets the actual enum value, not the string
                  }}
                  placeholder="Select Tool"
                  borderColor={borderColor}
                  color={textColor}
                  _focus={{ borderColor: accentColor }}>
                  {availableTools
                    .filter(
                      (x) =>
                        x !== ToolType.UNRECOGNIZED &&
                        x !== ToolType.unknown &&
                        x !== ToolType.toolbox,
                    )
                    .sort()
                    .map((tool) => (
                      <option key={tool} value={tool}>
                        {capitalizeFirst(tool.replaceAll("_", " "))}
                      </option>
                    ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel color={textColor}>Name</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value.toLocaleLowerCase().replaceAll(" ", "_"))}
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
