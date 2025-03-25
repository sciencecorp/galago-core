import React, { useState, useEffect, use } from "react";
import {
  VStack,
  HStack,
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
  Box,
  Text,
  Image,
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { ToolType } from "gen-interfaces/controller";
import { capitalizeFirst } from "@/utils/parser";
import { Tool } from "@/types/api";
import { Icon, FormIcons } from "../ui/Icons";
import { semantic } from "../../themes/colors";
import tokens from "../../themes/tokens";

interface AddToolCommandModalProps {
  isDisabled?: boolean;
}

export const NewToolModal: React.FC<AddToolCommandModalProps> = (props) => {
  const { isDisabled } = props;
  const { isOpen: isSelectOpen, onOpen: onSelectOpen, onClose: onSelectClose } = useDisclosure();
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTool, setSelectedTool] = useState<ToolType | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const addTool = trpc.tool.add.useMutation();
  const { data: fetchedIds, refetch } = trpc.tool.availableIDs.useQuery();
  const selectedToolBg = useColorModeValue("teal.100", "teal.900");

  const availableTools = Object.values(ToolType)
    .filter(
      (tool) =>
        tool !== ToolType.UNRECOGNIZED && tool !== ToolType.unknown && tool !== ToolType.toolbox,
    )
    .sort();

  // Filter tools based on search query
  const filteredTools = availableTools.filter((tool) =>
    tool.toLowerCase().replace(/_/g, " ").includes(searchQuery.toLowerCase()),
  );

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
    trpc.tool.getProtoConfigDefinitions.useQuery(selectedTool as ToolType, {
      enabled: !!selectedTool, // Only fetch when type is set
    });

  useEffect(() => {
    if (selectedTool) {
      setName(capitalizeFirst(selectedTool.toLowerCase().replaceAll("_", " ")));
    }
  }, [selectedTool]);

  const handleToolSelect = (tool: ToolType) => {
    setSelectedTool(tool);
  };

  const handleConfirmSelection = () => {
    if (!selectedTool) {
      toast({
        title: "No tool selected",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    onSelectClose();
    onDetailsOpen();
  };

  const handleSave = async () => {
    if (!selectedTool) return;

    let workcell_id = 1;
    let ip = "localhost";
    let image_url = `/tool_icons/${selectedTool}.png`;

    const tool = {
      name,
      type: selectedTool,
      workcell_id,
      ip,
      image_url,
      description,
      config: { [selectedTool]: configData || {} },
    };

    setIsLoading(true);
    try {
      await addTool.mutateAsync(tool);
      await refetch();
      toast({
        title: `Tool added successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onDetailsClose();
      clearForm();
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
  };

  const clearForm = () => {
    setSelectedTool(null);
    setName("");
    setDescription("");
    setSearchQuery("");
  };

  const toolCardBg = useColorModeValue("white", "gray.800");

  const ToolCard = ({ tool }: { tool: ToolType }) => {
    const isSelected = selectedTool === tool;
    const displayName = capitalizeFirst(tool.replaceAll("_", " "));

    return (
      <Box
        p={2}
        borderRadius="lg"
        cursor="pointer"
        bg={isSelected ? selectedToolBg : toolCardBg}
        borderColor={isSelected ? "teal.500" : "gray.200"}
        boxShadow="md"
        _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
        onClick={() => handleToolSelect(tool)}>
        <VStack spacing={1} align="center">
          <Image
            src={`/tool_icons/${tool}.png`}
            alt={displayName}
            fallbackSrc="https://via.placeholder.com/40"
            objectFit="contain"
            loading="lazy"
            height={"90px"}
          />
          <Text fontSize="sm" fontWeight={isSelected ? "bold" : "normal"}>
            {displayName}
          </Text>
        </VStack>
      </Box>
    );
  };

  return (
    <>
      <Button
        onClick={onSelectOpen}
        bg={accentColor}
        color="white"
        _hover={{ bg: `${accentColor}90` }}
        leftIcon={<Icon as={FormIcons.Add} />}
        isDisabled={isDisabled}
        borderRadius={tokens.borders.radii.md}>
        New Tool
      </Button>

      {/* Tool Selection Modal */}
      <Modal isOpen={isSelectOpen} onClose={onSelectClose} size="xl">
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
                  value={selectedTool}
                  onChange={(e) => {
                    const enumValue = e.target.value as ToolType;
                    setSelectedTool(enumValue); // This sets the actual enum value, not the string
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
              onClick={onSelectClose}
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
