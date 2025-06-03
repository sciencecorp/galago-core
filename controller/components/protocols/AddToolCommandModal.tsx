import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  VStack,
  Input,
  HStack,
  IconButton,
  Text,
  Box,
  SimpleGrid,
  Image,
  Flex,
  InputGroup,
  InputLeftElement,
  Tag,
  useColorModeValue,
  useSteps,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepTitle,
  StepDescription,
  StepSeparator,
  StepIcon,
  StepNumber,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import { RiSearchLine } from "react-icons/ri";
import { commandFields } from "../tools/constants";
import { capitalizeFirst } from "@/utils/parser";
import { PiToolbox } from "react-icons/pi";
import { warningToast } from "../ui/Toast";

interface AddToolCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommandAdded: (newCommand: any) => void;
}

export const AddToolCommandModal: React.FC<AddToolCommandModalProps> = ({
  isOpen,
  onClose,
  onCommandAdded,
}) => {
  const [selectedToolId, setSelectedToolId] = useState<number | string>("");
  const [selectedToolType, setSelectedToolType] = useState("");
  const [selectedCommand, setSelectedCommand] = useState("");
  const [commandParams, setCommandParams] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const steps = [
    { title: "Select Tool", description: "Choose a tool to use" },
    { title: "Select Command", description: "Choose a command" },
  ];

  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });

  const toolsQuery = trpc.tool.getAll.useQuery();
  const toolBoxQuery = trpc.tool.getToolBox.useQuery();
  const { data: labwareData } = trpc.labware.getAll.useQuery();

  const selectedToolData =
    toolsQuery.data?.find((tool) => tool.id === selectedToolId) ||
    (toolBoxQuery.data?.id === selectedToolId ? toolBoxQuery.data : undefined);

  // Available commands for selected tool
  const availableCommands: Command = selectedToolType ? commandFields[selectedToolType] || {} : {};

  // Get available tools with their IDs and names
  const availableTools = [
    ...(toolsQuery.data || []).map((tool) => ({
      id: tool.id,
      type: tool.type,
      name: tool.name || capitalizeFirst(tool.type.replaceAll("_", " ")),
    })),
  ];

  if (toolBoxQuery.data) {
    availableTools.push({
      id: toolBoxQuery.data.id,
      type: toolBoxQuery.data.type,
      name: "Tool Box",
    });
  }

  // Filter tools based on search query
  const filteredTools = availableTools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.type.toLowerCase().replace(/_/g, " ").includes(searchQuery.toLowerCase()),
  );

  const handleToolSelect = (tool: { id: number | string; type: string; name: string }) => {
    setSelectedToolId(tool.id);
    setSelectedToolType(tool.type);
    setSelectedCommand("");
    setCommandParams({});
  };

  const handleNextStep = () => {
    if (activeStep === 0 && !selectedToolType) {
      warningToast("Warning", "No tool selected");
      return;
    }
    setActiveStep(activeStep + 1);
  };

  const handlePreviousStep = () => {
    setActiveStep(activeStep - 1);
  };

  const handleCommandSelect = (command: string) => {
    setSelectedCommand(command);

    //Submit the command with default parameters
    const availableCommands = commandFields[selectedToolType] || {};
    const fields = availableCommands[command] || [];

    const finalParams: Record<string, any> = {};
    fields.forEach((field: Field) => {
      if (field.defaultValue !== undefined) {
        finalParams[field.name] = field.defaultValue;
      } else if (field.name === "labware") {
        if (labwareData?.some((labware) => labware.name.toLowerCase() === "default")) {
          const defaultLabware = labwareData.find(
            (labware) => labware.name.toLowerCase() === "default",
          );
          finalParams[field.name] = defaultLabware?.name || "default";
        } else {
          finalParams[field.name] = "default";
        }
      } else if (field.type === "number") {
        finalParams[field.name] = 0;
      } else if (field.type === "boolean") {
        finalParams[field.name] = false;
      } else if (field.type === "text_array") {
        finalParams[field.name] = [];
      } else {
        finalParams[field.name] = "";
      }
    });

    const newCommand = {
      tool_id:
        selectedToolType === "toolbox"
          ? "tool_box"
          : selectedToolData?.name?.toLocaleLowerCase().replaceAll(" ", "_"),
      tool_type: selectedToolType,
      command: command,
      params: finalParams,
      label: "",
      advanced_parameters: {
        skip_execution_variable: {
          variable: null,
          value: null,
        },
        run_asynchronously: false,
      },
    };

    onCommandAdded(newCommand);
    onClose();

    // Reset state after closing
    setActiveStep(0);
    setSelectedToolId("");
    setSelectedToolType("");
    setSelectedCommand("");
    setCommandParams({});
    setSearchQuery("");
  };

  // Tool card component
  const toolCardBg = useColorModeValue("gray.50", "gray.800");
  const selectedToolBg = useColorModeValue("teal.100", "teal.900");

  const ToolCard = ({ tool }: { tool: { id: number | string; type: string; name: string } }) => {
    const isSelected = selectedToolId === tool.id;

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
          {tool.type === "toolbox" ? (
            <IconButton
              aria-label="Tool Box"
              icon={<PiToolbox style={{ width: "90px", height: "90px" }} />}
              variant="ghost"
              colorScheme="teal"
              isRound
              boxSize="85px"
            />
          ) : (
            <Image
              src={`/tool_icons/${tool.type}.png`}
              alt={tool.name}
              objectFit="contain"
              loading="lazy"
              height={"85px"}
            />
          )}
          <Text fontSize="sm" fontWeight={isSelected ? "bold" : "normal"}>
            {tool.name}
          </Text>
        </VStack>
      </Box>
    );
  };

  const CommandCard = ({ command }: { command: string }) => {
    return (
      <Box
        p={3}
        borderRadius="lg"
        cursor="pointer"
        bg={toolCardBg}
        borderColor="gray.200"
        boxShadow="md"
        _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
        onClick={() => handleCommandSelect(command)}>
        <Text fontSize="md">{command.toLocaleLowerCase().replaceAll("_", " ")}</Text>
      </Box>
    );
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
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
              {selectedToolId && selectedToolData && (
                <HStack>
                  <Text fontSize="sm">Selected:</Text>
                  <Tag colorScheme="teal">
                    {selectedToolData.name ||
                      capitalizeFirst(selectedToolType.replaceAll("_", " "))}
                  </Tag>
                </HStack>
              )}
            </Flex>
            <Box maxH="calc(3 * 140px + 3 * 1rem)" overflowY="auto" pr={2} py={5}>
              <SimpleGrid columns={[2, 3, 4, 5]} spacing={4}>
                {filteredTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </SimpleGrid>
            </Box>
          </VStack>
        );
      case 1:
        return (
          <VStack spacing={6} align="stretch">
            <Flex justify="space-between" align="center">
              <Text fontSize="md" fontWeight="bold">
                Select a Command for{" "}
                {selectedToolData?.name || capitalizeFirst(selectedToolType.replaceAll("_", " "))}
              </Text>
              <Text fontSize="sm" fontStyle="italic" color="gray.500">
                Click to add with default parameters
              </Text>
            </Flex>
            <Box maxH="300px" overflowY="auto" pr={2} py={2}>
              <VStack spacing={4} width={"100%"} align="stretch">
                {Object.keys(availableCommands).map((command) => (
                  <CommandCard key={command} command={command} />
                ))}
              </VStack>
            </Box>
          </VStack>
        );
      default:
        return null;
    }
  };

  // Determine modal footer buttons based on current step
  const renderFooterButtons = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              ml={3}
              onClick={handleNextStep}
              isDisabled={!selectedToolType}>
              Next
            </Button>
          </>
        );
      case 1:
        return (
          <>
            <Button variant="ghost" onClick={handlePreviousStep}>
              Back
            </Button>
            <Button variant="ghost" ml={2} onClick={onClose}>
              Cancel
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={activeStep === 0 ? "md" : "sm"}>
      <ModalOverlay />
      <ModalContent maxW={activeStep === 0 ? "900px" : "600px"}>
        <ModalHeader>Add Tool Command</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            <Stepper index={activeStep} colorScheme="teal" mb={4}>
              {steps.map((step, index) => (
                <Step key={index}>
                  <StepIndicator>
                    <StepStatus
                      complete={<StepIcon />}
                      incomplete={<StepNumber />}
                      active={<StepNumber />}
                    />
                  </StepIndicator>
                  <Box flexShrink="0">
                    <StepTitle>{step.title}</StepTitle>
                    <StepDescription>{step.description}</StepDescription>
                  </Box>
                  <StepSeparator />
                </Step>
              ))}
            </Stepper>

            {renderStepContent()}
          </VStack>
        </ModalBody>

        <ModalFooter>{renderFooterButtons()}</ModalFooter>
      </ModalContent>
    </Modal>
  );
};
