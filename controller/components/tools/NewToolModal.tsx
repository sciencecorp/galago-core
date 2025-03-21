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
  Grid,
  GridItem,
  Box,
  Text,
  Flex,
  Image,
  InputGroup,
  InputLeftElement,
  Tag,
  SimpleGrid,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { RiAddFill, RiSearchLine } from "react-icons/ri";
import { ToolType } from "gen-interfaces/controller";
import { capitalizeFirst } from "@/utils/parser";

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
        colorScheme="teal"
        leftIcon={<RiAddFill />}
        isDisabled={isDisabled}>
        New Tool
      </Button>

      {/* Tool Selection Modal */}
      <Modal isOpen={isSelectOpen} onClose={onSelectClose} size="xl">
        <ModalOverlay />
        <ModalContent maxW="900px">
          <ModalHeader>Select a Tool</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <RiSearchLine color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Search for a tool..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>

              <Flex justify="space-between" align="center">
                <Text fontSize="md" fontWeight="bold">
                  Available Tools
                </Text>
                {selectedTool && (
                  <HStack>
                    <Text fontSize="sm">Selected:</Text>
                    <Tag colorScheme="teal">
                      {capitalizeFirst(selectedTool.replaceAll("_", " "))}
                    </Tag>
                  </HStack>
                )}
              </Flex>
              <Box
                maxH="calc(3 * 140px + 3 * 1rem)" // 3 rows of cards (approx 130px each) + spacing
                overflowY="auto"
                pr={2}
                py={5}>
                <SimpleGrid columns={[2, 3, 4, 5]} spacing={4}>
                  {filteredTools.map((tool) => (
                    <ToolCard key={tool} tool={tool} />
                  ))}
                </SimpleGrid>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={onSelectClose}>
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              ml={3}
              onClick={handleConfirmSelection}
              isDisabled={!selectedTool}>
              Continue
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Tool Details Modal */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Configure Tool</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedTool && (
              <VStack spacing={4}>
                <Flex width="100%" align="center" mb={2}>
                  <Image
                    src={`/tool_icons/${selectedTool}.png`}
                    alt={capitalizeFirst(selectedTool.replaceAll("_", " "))}
                    fallbackSrc="https://via.placeholder.com/40"
                    boxSize="40px"
                    mr={3}
                  />
                  <Text fontWeight="bold">
                    {capitalizeFirst(selectedTool.replaceAll("_", " "))}
                  </Text>
                </Flex>

                <Divider />

                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </FormControl>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                </FormControl>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              variant="ghost"
              onClick={() => {
                onDetailsClose();
                onSelectOpen();
              }}>
              Back
            </Button>
            <Button variant="ghost" ml={2} onClick={onDetailsClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" ml={3} onClick={handleSave} isLoading={isLoading}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
