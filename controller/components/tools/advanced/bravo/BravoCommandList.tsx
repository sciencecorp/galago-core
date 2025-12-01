import {
  Box,
  VStack,
  Text,
  IconButton,
  HStack,
  useColorModeValue,
  Collapse,
  Input,
  Center,
  SlideFade,
  Select,
  ButtonGroup,
  Tooltip,
} from "@chakra-ui/react";
import {
  DeleteIcon,
  AddIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowDownIcon,
} from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import { Tool } from "@/types/api";
import { trpc } from "@/utils/trpc";
import { BravoCommandIcons } from "@/components/ui/Icons";
import { getCommandColor, getCommandColorHex } from "@/components/ui/Theme";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { SaveIcon, EditIcon } from "@/components/ui/Icons";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { BravoSequenceStep } from "@/server/routers/bravoSequence";
import { BravoStepModal } from "./BravoStepModal";

// Centralized command styling hook
const useCommandStyles = (commandName: string, isExpanded: boolean) => {
  const isDarkMode = useColorModeValue(false, true);
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const commandColor = getCommandColor(commandName);

  return {
    container: {
      borderColor: isExpanded ? `${commandColor}.${isDarkMode ? "500" : "300"}` : borderColor,
      bg: isExpanded ? `${commandColor}.${isDarkMode ? "900" : "50"}` : "transparent",
      boxShadow: isExpanded ? "md" : "none",
      opacity: isExpanded ? 1 : 0.8,
      _hover: {
        transform: "scale(1.01)",
        opacity: 1,
        shadow: "sm",
        borderColor: `${commandColor}.${isDarkMode ? "500" : "300"}`,
      },
      _before: {
        content: '""',
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: "4px",
        bg: `${commandColor}.${isDarkMode ? "600" : "400"}`,
        borderTopLeftRadius: "md",
        borderBottomLeftRadius: "md",
      },
    },
    iconContainer: {
      bg: `${commandColor}.${isDarkMode ? "900" : "50"}`,
      color: `${commandColor}.${isDarkMode ? "300" : "500"}`,
    },
    commandName: {
      fontWeight: isExpanded ? "bold" : "medium",
      color: `${commandColor}.${isDarkMode ? "300" : "700"}`,
    },
  };
};

interface BravoCommandListProps {
  steps: BravoSequenceStep[];
  sequenceName: string;
  config: Tool;
  onDelete?: () => void;
  onStepsChange: (steps: BravoSequenceStep[]) => void;
  onSequenceNameChange?: (name: string) => void;
  expandedCommandIndex?: number | null;
  onCommandClick?: (index: number) => void;
}

interface StepItemProps {
  step: BravoSequenceStep;
  index: number;
  isEditing: boolean;
  expandedStep: number | null;
  config: Tool;
  handleDeleteStep: (index: number) => void;
  handleEditStep: (index: number, updatedStep: Partial<BravoSequenceStep>) => void;
  setExpandedStep: (index: number | null) => void;
  onCommandClick?: (index: number) => void;
  formatParamKey: (key: string) => string;
  getCommandIcon: (commandName: string) => JSX.Element;
  localSteps: BravoSequenceStep[];
  handleAddStep: (index: number) => void;
  deckConfigs?: any[];
}

const StepItem: React.FC<StepItemProps> = ({
  step,
  index,
  isEditing,
  expandedStep,
  config,
  handleDeleteStep,
  handleEditStep,
  setExpandedStep,
  onCommandClick,
  formatParamKey,
  getCommandIcon,
  localSteps,
  handleAddStep,
  deckConfigs,
}) => {
  const isExpanded = expandedStep === index;
  const styles = useCommandStyles(step.command_name, isExpanded);

  const renderParamField = (key: string, value: any) => {
    // Special handling for deck_config_id
    if (key === "deck_config_id" && deckConfigs) {
      return (
        <Select
          size="sm"
          value={value}
          onChange={(e) => {
            handleEditStep(index, {
              params: {
                ...step.params,
                [key]: parseInt(e.target.value),
              },
            });
          }}>
          {deckConfigs.map((config) => (
            <option key={config.id} value={config.id}>
              {config.name}
            </option>
          ))}
        </Select>
      );
    }

    // For boolean values
    if (typeof value === "boolean") {
      return (
        <Select
          size="sm"
          value={String(value)}
          onChange={(e) => {
            handleEditStep(index, {
              params: {
                ...step.params,
                [key]: e.target.value === "true",
              },
            });
          }}>
          <option value="false">False</option>
          <option value="true">True</option>
        </Select>
      );
    }

    // For numeric values
    if (typeof value === "number") {
      return (
        <Input
          size="sm"
          type="number"
          value={value}
          onChange={(e) => {
            handleEditStep(index, {
              params: {
                ...step.params,
                [key]: parseFloat(e.target.value) || 0,
              },
            });
          }}
        />
      );
    }

    // Default text input
    return (
      <Input
        size="sm"
        value={value}
        onChange={(e) => {
          handleEditStep(index, {
            params: {
              ...step.params,
              [key]: e.target.value,
            },
          });
        }}
      />
    );
  };

  return (
    <Draggable draggableId={`step-${index}`} index={index} isDragDisabled={!isEditing}>
      {(provided, snapshot) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{
            ...provided.draggableProps.style,
            transition: snapshot.isDragging
              ? provided.draggableProps.style?.transition
              : "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}>
          <SlideFade key={index} in={true} offsetY="20px">
            <VStack width="100%" spacing={0} align="stretch" mb={1}>
              <Box width="100%">
                <Box
                  px={6}
                  py={3}
                  cursor={isEditing ? "grab" : "pointer"}
                  borderRadius="md"
                  borderWidth="1px"
                  {...styles.container}
                  {...(isEditing ? provided.dragHandleProps : {})}
                  width="100%"
                  maxW="100%"
                  transition="all 0.2s"
                  position="relative"
                  overflow="hidden"
                  opacity={snapshot.isDragging ? 0.8 : 1}
                  boxShadow={snapshot.isDragging ? "md" : undefined}>
                  <HStack
                    onClick={(e) => {
                      e.stopPropagation();
                      const newExpandedIndex = expandedStep === index ? null : index;
                      setExpandedStep(newExpandedIndex);
                      onCommandClick?.(index);
                    }}
                    justify="space-between">
                    <HStack spacing={3}>
                      <Box p={2} borderRadius="md" {...styles.iconContainer}>
                        {getCommandIcon(step.command_name)}
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="md" {...styles.commandName}>
                          {step.label}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {step.command_name}
                        </Text>
                      </VStack>
                    </HStack>
                    <HStack spacing={2} minW="70px" justifyContent="flex-end">
                      <IconButton
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                        icon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                        size="sm"
                        variant="ghost"
                        colorScheme={getCommandColor(step.command_name)}
                        minW="32px"
                      />
                      {isEditing && isExpanded && (
                        <IconButton
                          aria-label="Delete step"
                          icon={<DeleteIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStep(index);
                          }}
                          minW="32px"
                        />
                      )}
                    </HStack>
                  </HStack>
                  <Collapse
                    in={isExpanded}
                    animateOpacity
                    style={{ overflow: "hidden" }}
                    transition={{ enter: { duration: 0.5 }, exit: { duration: 0.5 } }}>
                    <VStack
                      align="start"
                      mt={4}
                      spacing={3}
                      pl={2}
                      pt={2}
                      borderTop="1px"
                      borderColor="gray.100">
                      {Object.entries(step.params).map(([key, value]) => (
                        <HStack key={key} width="100%">
                          <Text fontSize="sm" color="gray.500" width="30%">
                            {formatParamKey(key)}:
                          </Text>
                          {isEditing ? (
                            renderParamField(key, value)
                          ) : (
                            <Text fontSize="sm" fontWeight="medium">
                              {value?.toString()}
                            </Text>
                          )}
                        </HStack>
                      ))}
                    </VStack>
                  </Collapse>
                </Box>
              </Box>
              {!isEditing && index < localSteps.length - 1 && (
                <Center>
                  <Box color="gray.500" my={2}>
                    <ArrowDownIcon />
                  </Box>
                </Center>
              )}
              {isEditing && (
                <SlideFade in={isEditing} offsetY="-20px">
                  <IconButton
                    aria-label={`Add step after ${index}`}
                    icon={<AddIcon />}
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddStep(index + 1)}
                    width="100%"
                    my={2}
                  />
                </SlideFade>
              )}
            </VStack>
          </SlideFade>
        </Box>
      )}
    </Draggable>
  );
};

export const BravoCommandList: React.FC<BravoCommandListProps> = ({
  steps,
  sequenceName,
  config,
  onDelete,
  onStepsChange,
  onSequenceNameChange,
  expandedCommandIndex,
  onCommandClick,
}) => {
  const [localSteps, setLocalSteps] = useState<BravoSequenceStep[]>(steps);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedSequenceName, setEditedSequenceName] = useState(sequenceName);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(expandedCommandIndex || null);

  const { data: deckConfigs } = trpc.bravoDeckConfig.getAll.useQuery(undefined, {
    enabled: isEditing,
  });

  const bgColor = useColorModeValue("white", isEditing ? "gray.700" : "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    if (JSON.stringify(steps || []) !== JSON.stringify(localSteps)) {
      setLocalSteps(steps || []);
    }
    setEditedSequenceName(sequenceName);
    setHasUnsavedChanges(false);
  }, [steps, sequenceName]);

  useEffect(() => {
    if (expandedCommandIndex !== undefined) {
      setExpandedStep(expandedCommandIndex);
    }
  }, [expandedCommandIndex]);

  const handleAddStep = (index: number) => {
    setInsertIndex(index);
    setIsModalOpen(true);
  };

  const handleDeleteStep = (index: number) => {
    const newSteps = localSteps
      .filter((_, i) => i !== index)
      .map((step, idx) => ({
        ...step,
        position: idx,
      }));
    setLocalSteps(newSteps);
    setHasUnsavedChanges(true);
  };

  const handleEditStep = (index: number, updatedStep: Partial<BravoSequenceStep>) => {
    const newSteps = [...localSteps];
    newSteps[index] = {
      ...newSteps[index],
      ...updatedStep,
    };
    setLocalSteps(newSteps);
    setHasUnsavedChanges(true);
  };

  const handleModalAddStep = (step: Omit<BravoSequenceStep, "id" | "sequence_id">) => {
    const newStep: BravoSequenceStep = {
      ...step,
      position: insertIndex !== null ? insertIndex : localSteps.length,
      sequence_id: 0, // Will be set by backend
    };

    let newSteps: BravoSequenceStep[];
    if (insertIndex !== null) {
      newSteps = [...localSteps];
      newSteps.splice(insertIndex, 0, newStep);
      newSteps = newSteps.map((s, idx) => ({
        ...s,
        position: idx,
      }));
    } else {
      newSteps = [...localSteps, { ...newStep, position: localSteps.length }];
    }

    setLocalSteps(newSteps);
    setHasUnsavedChanges(true);
    setIsModalOpen(false);
    setInsertIndex(null);
  };

  const handleSave = () => {
    if (hasUnsavedChanges) {
      onStepsChange(localSteps);
      if (editedSequenceName !== sequenceName) {
        onSequenceNameChange?.(editedSequenceName);
      }
      setHasUnsavedChanges(false);
    }
  };

  const formatParamKey = (key: string): string => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getCommandIcon = (commandName: string) => {
    const iconKey = commandName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("") as keyof typeof BravoCommandIcons;

    const IconComponent = BravoCommandIcons[iconKey] || BravoCommandIcons.Mix;
    return <IconComponent color={getCommandColorHex(commandName)} />;
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    if (!destination || destination.index === source.index) {
      return;
    }

    const reorderedSteps = Array.from(localSteps);
    const [removed] = reorderedSteps.splice(source.index, 1);
    reorderedSteps.splice(destination.index, 0, removed);

    const updatedSteps = reorderedSteps.map((step, idx) => ({
      ...step,
      position: idx,
    }));

    if (expandedStep === source.index) {
      setExpandedStep(destination.index);
    } else if (expandedStep !== null) {
      if (source.index < expandedStep && destination.index >= expandedStep) {
        setExpandedStep(expandedStep - 1);
      } else if (source.index > expandedStep && destination.index <= expandedStep) {
        setExpandedStep(expandedStep + 1);
      }
    }

    setLocalSteps(updatedSteps);
    setHasUnsavedChanges(true);
  };

  return (
    <Box
      border="1px"
      borderColor={borderColor}
      borderRadius="md"
      p={3}
      bg={bgColor}
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
      overflow="hidden">
      <VStack spacing={2} height="100%" width="100%">
        <HStack width="100%" justify="space-between" align="start">
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold">{sequenceName}</Text>
          </VStack>
          <ButtonGroup>
            {!isEditing ? (
              <Tooltip label="Edit Sequence" placement="top" hasArrow>
                <IconButton
                  aria-label="Edit Sequence"
                  icon={<EditIcon />}
                  colorScheme="blue"
                  variant="ghost"
                  onClick={() => setIsEditing(!isEditing)}
                />
              </Tooltip>
            ) : (
              <HStack>
                <Tooltip label="Save Changes" placement="top" hasArrow>
                  <IconButton
                    isDisabled={!hasUnsavedChanges}
                    aria-label="Save Changes"
                    icon={<SaveIcon />}
                    colorScheme="blue"
                    variant="ghost"
                    onClick={handleSave}
                  />
                </Tooltip>
                <Tooltip label="Exit Edit Mode" placement="top" hasArrow>
                  <IconButton
                    aria-label="Exit Edit Mode"
                    icon={<ArrowForwardIcon />}
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(false);
                      if (hasUnsavedChanges) {
                        setLocalSteps(steps || []);
                        setEditedSequenceName(sequenceName);
                        setHasUnsavedChanges(false);
                      }
                    }}
                  />
                </Tooltip>
              </HStack>
            )}
          </ButtonGroup>
        </HStack>

        <Box width="100%" flex={1} overflowY="auto" overflowX="hidden" px={2}>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="steps">
              {(provided) => (
                <VStack
                  spacing={0}
                  width="100%"
                  align="stretch"
                  {...provided.droppableProps}
                  ref={provided.innerRef}>
                  {isEditing && (
                    <SlideFade in={isEditing} offsetY="-20px">
                      <IconButton
                        aria-label="Add step at start"
                        icon={<AddIcon />}
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAddStep(0)}
                        width="100%"
                      />
                    </SlideFade>
                  )}

                  {localSteps?.map((step, index) => (
                    <StepItem
                      key={`step-${index}`}
                      step={step}
                      index={index}
                      isEditing={isEditing}
                      expandedStep={expandedStep}
                      config={config}
                      handleDeleteStep={handleDeleteStep}
                      handleEditStep={handleEditStep}
                      setExpandedStep={setExpandedStep}
                      onCommandClick={onCommandClick}
                      formatParamKey={formatParamKey}
                      getCommandIcon={getCommandIcon}
                      localSteps={localSteps}
                      handleAddStep={handleAddStep}
                      deckConfigs={deckConfigs}
                    />
                  ))}
                  {provided.placeholder}
                </VStack>
              )}
            </Droppable>
          </DragDropContext>
        </Box>
      </VStack>

      <BravoStepModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setInsertIndex(null);
        }}
        onAddStep={handleModalAddStep}
        deckConfigs={deckConfigs || []}
      />
    </Box>
  );
};
