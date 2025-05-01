import {
  Box,
  VStack,
  Text,
  IconButton,
  HStack,
  useColorModeValue,
  Collapse,
  Input,
  Button,
  FormControl,
  FormLabel,
  Center,
  SlideFade,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  NumberInput,
  NumberInputField,
  Select,
  Badge,
} from "@chakra-ui/react";
import {
  DeleteIcon,
  AddIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowDownIcon,
  DragHandleIcon,
} from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import { SequenceCommand } from "../../types/";
import { CommandModal } from "./CommandModal";
import { TeachPoint, MotionProfile, GripParams } from "../../types/";
import { Tool } from "@/types/api";
import { trpc } from "@/utils/trpc";
import { CommandIcons } from "@/components/ui/Icons";
import { getCommandColor, getCommandColorHex } from "@/components/ui/Theme";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

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

interface CommandListProps {
  commands: SequenceCommand[];
  sequenceName: string;
  labware?: string;
  teachPoints: TeachPoint[];
  motionProfiles: MotionProfile[];
  gripParams: GripParams[];
  config: Tool;
  onDelete?: () => void;
  onCommandsChange: (commands: SequenceCommand[]) => void;
  onSequenceNameChange?: (name: string) => void;
  onLabwareChange?: (labware: string) => void;
  expandedCommandIndex?: number | null;
  onCommandClick?: (index: number) => void;
}

// Command item component to fix the hooks issue
interface CommandItemProps {
  command: SequenceCommand;
  index: number;
  isEditing: boolean;
  expandedCommand: number | null;
  teachPoints: TeachPoint[];
  config: Tool;
  handleDeleteCommand: (index: number) => void;
  handleEditCommand: (index: number, updatedCommand: Partial<SequenceCommand>) => void;
  setExpandedCommand: (index: number | null) => void;
  onCommandClick?: (index: number) => void;
  getDisplayValue: (command: SequenceCommand) => string;
  formatParamKey: (key: string) => string;
  getCommandIcon: (commandName: string) => JSX.Element;
  localCommands: SequenceCommand[];
  handleAddCommand: (index: number) => void;
}

const CommandItem: React.FC<CommandItemProps> = ({
  command,
  index,
  isEditing,
  expandedCommand,
  teachPoints,
  config,
  handleDeleteCommand,
  handleEditCommand,
  setExpandedCommand,
  onCommandClick,
  getDisplayValue,
  formatParamKey,
  getCommandIcon,
  localCommands,
  handleAddCommand,
}) => {
  const isExpanded = expandedCommand === index;
  const styles = useCommandStyles(command.command, isExpanded);

  return (
    <Draggable draggableId={`command-${index}`} index={index} isDragDisabled={!isEditing}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={provided.draggableProps.style}>
          <SlideFade key={index} in={true} offsetY="20px">
            <VStack width="100%" spacing={0} align="stretch" mb={3}>
              <Box width="100%">
                <Box
                  px={6}
                  py={3}
                  cursor={isEditing ? "grab" : "pointer"}
                  borderRadius="md"
                  borderWidth="1px"
                  {...styles.container}
                  {...(isEditing ? provided.dragHandleProps : {})}
                  onClick={() => {
                    if (!isEditing) {
                      const newExpandedIndex = expandedCommand === index ? null : index;
                      setExpandedCommand(newExpandedIndex);
                      onCommandClick?.(index);
                    }
                  }}
                  width="100%"
                  maxW="100%"
                  transition="all 0.2s"
                  position="relative"
                  overflow="hidden"
                  opacity={snapshot.isDragging ? 0.8 : 1}
                  boxShadow={snapshot.isDragging ? "md" : undefined}>
                  <HStack justify="space-between">
                    <HStack spacing={3}>
                      <Box p={2} borderRadius="md" {...styles.iconContainer}>
                        {getCommandIcon(command.command)}
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="md" {...styles.commandName}>
                          {command.command.replace(/_/g, " ")}
                        </Text>
                        <Text color="gray.500" fontSize="sm">
                          {getDisplayValue(command)}
                        </Text>
                      </VStack>
                    </HStack>
                    <HStack spacing={2} minW="70px" justifyContent="flex-end">
                      {isEditing && (
                        <IconButton
                          aria-label="Delete command"
                          icon={<DeleteIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCommand(index);
                          }}
                          minW="32px"
                        />
                      )}
                      <IconButton
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                        icon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                        size="sm"
                        variant="ghost"
                        colorScheme={getCommandColor(command.command)}
                        onClick={(e) => {
                          e.stopPropagation();
                          const newExpandedIndex = expandedCommand === index ? null : index;
                          setExpandedCommand(newExpandedIndex);
                          onCommandClick?.(index);
                        }}
                        minW="32px"
                      />
                    </HStack>
                  </HStack>
                  <Collapse in={isEditing || isExpanded}>
                    <VStack
                      align="start"
                      mt={4}
                      spacing={3}
                      pl={2}
                      pt={2}
                      borderTop="1px"
                      borderColor="gray.100">
                      {Object.entries(command.params)
                        .filter(([key]) => key !== "waypoint_id" && key !== "waypoint")
                        .map(([key, value]) => (
                          <HStack key={key} width="100%">
                            <Text fontSize="sm" color="gray.500" width="30%">
                              {formatParamKey(key)}:
                            </Text>
                            {isEditing && (key === "waypoint" || key === "coordinates") ? (
                              <Box width="100%" overflowX="auto">
                                <Table size="sm" variant="simple" width="auto">
                                  <Thead>
                                    <Tr>
                                      {Array.from(
                                        {
                                          length: parseInt((config.config as any)?.pf400?.joints || "5"),
                                        },
                                        (_, i) => (
                                          <Th key={`j${i + 1}`} fontSize="xs" textAlign="center" px={1}>
                                            J{i + 1}
                                          </Th>
                                        ),
                                      )}
                                    </Tr>
                                  </Thead>
                                  <Tbody>
                                    <Tr>
                                      {(value || "0 0 0 0 0 0")
                                        .split(" ")
                                        .map((coord: string, i: number) => (
                                          <Td key={i} padding={0.5} width="auto">
                                            <NumberInput
                                              size="xs"
                                              value={parseFloat(coord) || 0}
                                              onChange={(valueString) => {
                                                const coords = (value || "0 0 0 0 0 0")
                                                  .split(" ")
                                                  .map(Number);
                                                coords[i] = parseFloat(valueString) || 0;
                                                handleEditCommand(index, {
                                                  params: {
                                                    ...command.params,
                                                    [key]: coords.join(" "),
                                                  },
                                                });
                                              }}
                                              step={0.001}
                                              precision={3}
                                              width="35px">
                                              <NumberInputField
                                                textAlign="right"
                                                paddingInline={0}
                                                fontSize="xs"
                                                px={0.5}
                                              />
                                            </NumberInput>
                                          </Td>
                                        ))}
                                    </Tr>
                                  </Tbody>
                                </Table>
                              </Box>
                            ) : isEditing ? (
                              <Input
                                size="sm"
                                value={value}
                                onChange={(e) => {
                                  handleEditCommand(index, {
                                    params: {
                                      ...command.params,
                                      [key]: e.target.value,
                                    },
                                  });
                                }}
                              />
                            ) : key === "waypoint" || key === "coordinates" ? (
                              <Box width="100%" overflowX="auto">
                                <Table size="sm" variant="simple" width="auto">
                                  <Thead>
                                    <Tr>
                                      {Array.from(
                                        {
                                          length: parseInt((config.config as any)?.pf400?.joints || "5"),
                                        },
                                        (_, i) => (
                                          <Th key={`j${i + 1}`} fontSize="xs" textAlign="center" px={1}>
                                            J{i + 1}
                                          </Th>
                                        ),
                                      )}
                                    </Tr>
                                  </Thead>
                                  <Tbody>
                                    <Tr>
                                      {(value || "0 0 0 0 0 0")
                                        .split(" ")
                                        .map((coord: string, i: number) => (
                                          <Td key={i} padding={1} width="auto">
                                            <Text
                                              fontSize="sm"
                                              textAlign="center"
                                              width="60px"
                                              fontFamily="mono">
                                              {Number(coord).toFixed(2)}
                                            </Text>
                                          </Td>
                                        ))}
                                    </Tr>
                                  </Tbody>
                                </Table>
                              </Box>
                            ) : (
                              <Text fontSize="sm" fontWeight="medium">
                                {value.toString()}
                              </Text>
                            )}
                          </HStack>
                        ))}
                    </VStack>
                  </Collapse>
                </Box>
              </Box>
              {!isEditing && index < localCommands.length - 1 && (
                <Center>
                  <Box color="gray.500" my={2}>
                    <ArrowDownIcon />
                  </Box>
                </Center>
              )}
              {isEditing && (
                <SlideFade in={isEditing} offsetY="-20px">
                  <IconButton
                    aria-label={`Add command after ${index}`}
                    icon={<AddIcon />}
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddCommand(index + 1)}
                    width="100%"
                    my={2}
                  />
                </SlideFade>
              )}
            </VStack>
          </SlideFade>
        </div>
      )}
    </Draggable>
  );
};

export const CommandList: React.FC<CommandListProps> = ({
  commands,
  sequenceName,
  labware = "default",
  teachPoints,
  motionProfiles,
  gripParams,
  config,
  onDelete,
  onCommandsChange,
  onSequenceNameChange,
  onLabwareChange,
  expandedCommandIndex,
  onCommandClick,
}) => {
  const [localCommands, setLocalCommands] = useState<SequenceCommand[]>(commands);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedSequenceName, setEditedSequenceName] = useState(sequenceName);
  const [editedLabware, setEditedLabware] = useState(labware);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [expandedCommand, setExpandedCommand] = useState<number | null>(
    expandedCommandIndex || null,
  );
  const { data: labwareList } = trpc.labware.getAll.useQuery(undefined, {
    enabled: isEditing,
  });

  const bgColor = useColorModeValue("white", isEditing ? "gray.700" : "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const arrowColor = useColorModeValue("gray.400", "gray.600");

  // Update local state when props change
  useEffect(() => {
    if (JSON.stringify(commands || []) !== JSON.stringify(localCommands)) {
      setLocalCommands(commands || []);
    }
    setEditedSequenceName(sequenceName);
    setEditedLabware(labware);
    setHasUnsavedChanges(false);
  }, [commands, sequenceName, labware]);

  // Update expandedCommand when expandedCommandIndex changes
  useEffect(() => {
    if (expandedCommandIndex !== undefined) {
      setExpandedCommand(expandedCommandIndex);
    }
  }, [expandedCommandIndex]);

  const handleAddCommand = (index: number) => {
    setInsertIndex(index);
    setIsModalOpen(true);
  };

  const handleDeleteCommand = (index: number) => {
    const newCommands = localCommands
      .filter((_, i) => i !== index)
      .map((cmd, idx) => ({
        ...cmd,
        order: idx,
      }));
    setLocalCommands(newCommands);
    setHasUnsavedChanges(true);
  };

  const handleEditCommand = (index: number, updatedCommand: Partial<SequenceCommand>) => {
    const newCommands = [...localCommands];
    newCommands[index] = {
      ...newCommands[index],
      ...updatedCommand,
    };
    setLocalCommands(newCommands);
    setHasUnsavedChanges(true);
  };

  const handleModalAddCommand = (command: { command: string; params: Record<string, any> }) => {
    const newCommand: SequenceCommand = {
      command: command.command,
      params: command.params,
      order: insertIndex !== null ? insertIndex : localCommands.length,
    };

    let newCommands: SequenceCommand[];
    if (insertIndex !== null) {
      newCommands = [...localCommands];
      newCommands.splice(insertIndex, 0, newCommand);
      newCommands = newCommands.map((cmd, idx) => ({
        ...cmd,
        order: idx,
      }));
    } else {
      newCommands = [...localCommands, { ...newCommand, order: localCommands.length }];
    }

    setLocalCommands(newCommands);
    setHasUnsavedChanges(true);
    setIsModalOpen(false);
    setInsertIndex(null);
  };

  const handleNameChange = (newName: string) => {
    setEditedSequenceName(newName);
    setHasUnsavedChanges(true);
  };

  const handleLabwareChange = (newLabware: string) => {
    setEditedLabware(newLabware);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    if (hasUnsavedChanges) {
      onCommandsChange(localCommands);
      if (editedSequenceName !== sequenceName) {
        onSequenceNameChange?.(editedSequenceName);
      }
      if (editedLabware !== labware) {
        onLabwareChange?.(editedLabware);
      }
      setHasUnsavedChanges(false);
    }
    setIsEditing(false);
  };

  const getDisplayValue = (command: SequenceCommand) => {
    let displayValue = "";

    switch (command.command) {
      case "move":
        if (command.params.waypoint_id) {
          const point = teachPoints.find((p) => p.id === command.params.waypoint_id);
          displayValue = point ? point.name : `Unknown (${command.params.waypoint_id})`;
        } else if (command.params.waypoint) {
          displayValue = command.params.waypoint;
        }
        break;
      case "approach":
        if (command.params.nest_id) {
          const point = teachPoints.find((p) => p.id === command.params.nest_id);
          displayValue = point ? point.name : `Unknown (${command.params.nest_id})`;
        }
        break;
      case "leave":
        if (command.params.nest_id) {
          const point = teachPoints.find((p) => p.id === command.params.nest_id);
          displayValue = point ? point.name : `Unknown (${command.params.nest_id})`;
        }
        break;
      default:
        displayValue = command.command;
    }

    return displayValue;
  };

  const formatParamKey = (key: string): string => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getCommandIcon = (commandName: string) => {
    // Convert snake_case command name to PascalCase for CommandIcons
    const iconKey = commandName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("") as keyof typeof CommandIcons;

    // Check if the icon exists in CommandIcons, otherwise use Move as fallback
    const IconComponent = CommandIcons[iconKey] || CommandIcons.Move;

    return <IconComponent color={getCommandColorHex(commandName)} />;
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    // If dropped outside the list or no movement
    if (!destination || destination.index === source.index) {
      return;
    }

    const reorderedCommands = Array.from(localCommands);
    const [removed] = reorderedCommands.splice(source.index, 1);
    reorderedCommands.splice(destination.index, 0, removed);

    // Update the order property for each command
    const updatedCommands = reorderedCommands.map((cmd, idx) => ({
      ...cmd,
      order: idx,
    }));

    setLocalCommands(updatedCommands);
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
          <Box flex={1}>
            {isEditing ? (
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Sequence Name</FormLabel>
                  <Input
                    value={editedSequenceName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    size="sm"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Labware</FormLabel>
                  <Select
                    value={editedLabware}
                    onChange={(e) => handleLabwareChange(e.target.value)}
                    size="sm">
                    <option value="default">Default</option>
                    {labwareList
                      ?.filter((item) => item.name.toLowerCase() !== "default")
                      .map((item) => (
                        <option key={item.id} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                  </Select>
                </FormControl>
              </VStack>
            ) : (
              <VStack align="start" spacing={1}>
                <Text fontWeight="bold">{sequenceName}</Text>
                <HStack>
                  <Text fontSize="sm" color="gray.500">
                    Labware:
                  </Text>
                  <Badge colorScheme={labware === "default" ? "gray" : "blue"}>{labware}</Badge>
                </HStack>
              </VStack>
            )}
          </Box>
          <HStack>
            <Button
              size="sm"
              colorScheme={isEditing ? (hasUnsavedChanges ? "blue" : "gray") : "gray"}
              onClick={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                }
              }}>
              {isEditing ? (hasUnsavedChanges ? "Save" : "Done") : "Edit"}
            </Button>
            {isEditing && (
              <IconButton
                aria-label="Delete sequence"
                icon={<DeleteIcon />}
                size="sm"
                colorScheme="red"
                variant="ghost"
                onClick={onDelete}
              />
            )}
          </HStack>
        </HStack>

        <Box width="100%" flex={1} overflowY="auto" overflowX="hidden" px={2}>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="commands">
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
                        aria-label="Add command at start"
                        icon={<AddIcon />}
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAddCommand(0)}
                        width="100%"
                      />
                    </SlideFade>
                  )}

                  {localCommands?.map((command, index) => (
                    <CommandItem
                      key={`command-${index}`}
                      command={command}
                      index={index}
                      isEditing={isEditing}
                      expandedCommand={expandedCommand}
                      teachPoints={teachPoints}
                      config={config}
                      handleDeleteCommand={handleDeleteCommand}
                      handleEditCommand={handleEditCommand}
                      setExpandedCommand={setExpandedCommand}
                      onCommandClick={onCommandClick}
                      getDisplayValue={getDisplayValue}
                      formatParamKey={formatParamKey}
                      getCommandIcon={getCommandIcon}
                      localCommands={localCommands}
                      handleAddCommand={handleAddCommand}
                    />
                  ))}
                  {provided.placeholder}
                </VStack>
              )}
            </Droppable>
          </DragDropContext>
        </Box>
      </VStack>

      <CommandModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setInsertIndex(null);
        }}
        onAddCommand={handleModalAddCommand}
        teachPoints={teachPoints}
        motionProfiles={motionProfiles}
        gripParams={gripParams}
      />
    </Box>
  );
};
