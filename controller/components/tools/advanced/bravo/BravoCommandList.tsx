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
  Badge,
} from "@chakra-ui/react";
import {
  DeleteIcon,
  AddIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowDownIcon,
  RepeatIcon,
} from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import { Tool } from "@/types/api";
import { trpc } from "@/utils/trpc";
import { BravoCommandIcons } from "@/components/ui/Icons";
import { getCommandColor, getCommandColorHex } from "@/components/ui/Theme";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { SaveIcon, EditIcon } from "@/components/ui/Icons";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { BravoProtocolCommand } from "@/server/schemas/bravo";
import { BravoCommandModal } from "./BravoCommandModal";

const useCommandStyles = (commandType: string, isExpanded: boolean) => {
  const isDarkMode = useColorModeValue(false, true);
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const commandColor = getCommandColor(commandType);

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
  commands: BravoProtocolCommand[];
  protocolName: string;
  config: Tool;
  onDelete?: () => void;
  onCommandsChange: (commands: BravoProtocolCommand[]) => void;
  onProtocolNameChange?: (name: string) => void;
  expandedCommandIndex?: number | null;
  onCommandClick?: (index: number) => void;
}

interface CommandItemProps {
  command: BravoProtocolCommand;
  index: number;
  isEditing: boolean;
  expandedCommand: string | null;
  config: Tool;
  handleDeleteCommand: (commandId: string) => void;
  handleEditCommand: (commandId: string, updatedCommand: Partial<BravoProtocolCommand>) => void;
  setExpandedCommand: (commandId: string | null) => void;
  onCommandClick?: (index: number) => void;
  formatParamKey: (key: string) => string;
  getCommandIcon: (commandType: string) => JSX.Element;
  handleAddCommand: (parentId?: string) => void;
  deckConfigs?: any[];
  level?: number;
  parentId?: string;
}

const CommandItem: React.FC<CommandItemProps> = ({
  command,
  index,
  isEditing,
  expandedCommand,
  config,
  handleDeleteCommand,
  handleEditCommand,
  setExpandedCommand,
  onCommandClick,
  formatParamKey,
  getCommandIcon,
  handleAddCommand,
  deckConfigs,
  level = 0,
  parentId,
}) => {
  const commandId = `${parentId ? `${parentId}-` : ""}${index}`;
  const isExpanded = expandedCommand === commandId;
  const styles = useCommandStyles(command.command_type, isExpanded);
  const isContainer = command.command_type === "loop" || command.command_type === "group";

  const dropZoneBg = useColorModeValue("gray.50", "gray.800");
  const dropZoneBorder = useColorModeValue("gray.300", "gray.600");

  const renderParamField = (key: string, value: any) => {
    // Special handling for deck_config_id
    if (key === "deck_config_id" && deckConfigs) {
      return (
        <Select
          size="sm"
          value={value}
          onChange={(e) => {
            handleEditCommand(commandId, {
              params: {
                ...command.params,
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

    // Special handling for loop iterations
    if (key === "iterations" && command.command_type === "loop") {
      return (
        <Input
          size="sm"
          type="number"
          min={1}
          value={value}
          onChange={(e) => {
            handleEditCommand(commandId, {
              params: {
                ...command.params,
                [key]: parseInt(e.target.value) || 1,
              },
            });
          }}
        />
      );
    }

    // For boolean values
    if (typeof value === "boolean") {
      return (
        <Select
          size="sm"
          value={String(value)}
          onChange={(e) => {
            handleEditCommand(commandId, {
              params: {
                ...command.params,
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
            handleEditCommand(commandId, {
              params: {
                ...command.params,
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
          handleEditCommand(commandId, {
            params: {
              ...command.params,
              [key]: e.target.value,
            },
          });
        }}
      />
    );
  };

  return (
    <Draggable
      draggableId={commandId}
      index={index}
      isDragDisabled={!isEditing}
      type={level === 0 ? "root" : `nested-${level - 1}`}>
      {(provided, snapshot) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{
            ...provided.draggableProps.style,
            transition: snapshot.isDragging
              ? provided.draggableProps.style?.transition
              : "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          ml={level * 6}>
          <SlideFade in={true} offsetY="20px">
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
                      const newExpandedId = expandedCommand === commandId ? null : commandId;
                      setExpandedCommand(newExpandedId);
                      onCommandClick?.(index);
                    }}
                    justify="space-between">
                    <HStack spacing={3}>
                      <Box p={2} borderRadius="md" {...styles.iconContainer}>
                        {getCommandIcon(command.command_type)}
                      </Box>
                      <VStack align="start" spacing={0}>
                        <HStack>
                          <Text fontSize="md" {...styles.commandName}>
                            {command.label}
                          </Text>
                          {command.command_type === "loop" && command.params?.iterations && (
                            <Badge colorScheme="purple" ml={2}>
                              <HStack spacing={1}>
                                <RepeatIcon boxSize={3} />
                                <Text>{command.params.iterations}x</Text>
                              </HStack>
                            </Badge>
                          )}
                          {isContainer && (
                            <Badge colorScheme="cyan" ml={2}>
                              {command.child_commands?.length || 0} commands
                            </Badge>
                          )}
                        </HStack>
                        <Text fontSize="xs" color="gray.500">
                          {command.command_type}
                        </Text>
                      </VStack>
                    </HStack>
                    <HStack spacing={2} minW="70px" justifyContent="flex-end">
                      <IconButton
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                        icon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                        size="sm"
                        variant="ghost"
                        colorScheme={getCommandColor(command.command_type)}
                        minW="32px"
                      />
                      {isEditing && isExpanded && (
                        <IconButton
                          aria-label="Delete command"
                          icon={<DeleteIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCommand(commandId);
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
                      {Object.entries(command.params || {}).map(([key, value]) => (
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

                {/* Nested commands for loops/groups */}
                {isContainer && (
                  <Box mt={2} ml={4}>
                    {isEditing && (
                      <Droppable droppableId={commandId} type={`nested-${level}`}>
                        {(dropProvided, dropSnapshot) => (
                          <Box
                            ref={dropProvided.innerRef}
                            {...dropProvided.droppableProps}
                            minH="60px"
                            p={2}
                            borderWidth="2px"
                            borderStyle="dashed"
                            borderColor={dropSnapshot.isDraggingOver ? "blue.400" : dropZoneBorder}
                            borderRadius="md"
                            bg={dropSnapshot.isDraggingOver ? "blue.50" : dropZoneBg}
                            transition="all 0.2s">
                            {command.child_commands && command.child_commands.length > 0 ? (
                              <>
                                {command.child_commands.map((childCommand, childIndex) => (
                                  <CommandItem
                                    key={childIndex}
                                    command={childCommand}
                                    index={childIndex}
                                    isEditing={isEditing}
                                    expandedCommand={expandedCommand}
                                    config={config}
                                    handleDeleteCommand={handleDeleteCommand}
                                    handleEditCommand={handleEditCommand}
                                    setExpandedCommand={setExpandedCommand}
                                    onCommandClick={onCommandClick}
                                    formatParamKey={formatParamKey}
                                    getCommandIcon={getCommandIcon}
                                    handleAddCommand={handleAddCommand}
                                    deckConfigs={deckConfigs}
                                    level={level + 1}
                                    parentId={commandId}
                                  />
                                ))}
                                <Center mt={2}>
                                  <IconButton
                                    aria-label="Add command to container"
                                    icon={<AddIcon />}
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => handleAddCommand(commandId)}
                                  />
                                </Center>
                              </>
                            ) : (
                              <Center minH="40px">
                                <VStack spacing={1}>
                                  <Text fontSize="xs" color="gray.400">
                                    {dropSnapshot.isDraggingOver
                                      ? "Drop commands here"
                                      : "Drag commands into this container"}
                                  </Text>
                                  <IconButton
                                    aria-label="Add command to container"
                                    icon={<AddIcon />}
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => handleAddCommand(commandId)}
                                  />
                                </VStack>
                              </Center>
                            )}
                            {dropProvided.placeholder}
                          </Box>
                        )}
                      </Droppable>
                    )}
                    {!isEditing && command.child_commands && command.child_commands.length > 0 && (
                      <VStack spacing={2} align="stretch">
                        {command.child_commands.map((childCommand, childIndex) => (
                          <CommandItem
                            key={childIndex}
                            command={childCommand}
                            index={childIndex}
                            isEditing={isEditing}
                            expandedCommand={expandedCommand}
                            config={config}
                            handleDeleteCommand={handleDeleteCommand}
                            handleEditCommand={handleEditCommand}
                            setExpandedCommand={setExpandedCommand}
                            onCommandClick={onCommandClick}
                            formatParamKey={formatParamKey}
                            getCommandIcon={getCommandIcon}
                            handleAddCommand={handleAddCommand}
                            deckConfigs={deckConfigs}
                            level={level + 1}
                            parentId={commandId}
                          />
                        ))}
                      </VStack>
                    )}
                  </Box>
                )}
              </Box>
              {!isEditing && !isContainer && (
                <Center>
                  <Box color="gray.500" my={2}>
                    <ArrowDownIcon />
                  </Box>
                </Center>
              )}
              {isEditing && !isContainer && (
                <SlideFade in={isEditing} offsetY="-20px">
                  <IconButton
                    aria-label={`Add command after ${index}`}
                    icon={<AddIcon />}
                    size="sm"
                    variant="ghost"
                    onClick={() => handleAddCommand()}
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
  commands,
  protocolName,
  config,
  onDelete,
  onCommandsChange,
  onProtocolNameChange,
  expandedCommandIndex,
  onCommandClick,
}) => {
  const [localCommands, setLocalCommands] = useState<BravoProtocolCommand[]>(commands);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedProtocolName, setEditedProtocolName] = useState(protocolName);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [insertParentId, setInsertParentId] = useState<string | null>(null);
  const [expandedCommand, setExpandedCommand] = useState<string | null>(null);

  const { data: deckConfigs } = trpc.bravoDeckConfig.getAll.useQuery(undefined, {
    enabled: isEditing,
  });

  const bgColor = useColorModeValue("white", isEditing ? "gray.700" : "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    if (JSON.stringify(commands || []) !== JSON.stringify(localCommands)) {
      setLocalCommands(commands || []);
    }
    setEditedProtocolName(protocolName);
    setHasUnsavedChanges(false);
  }, [commands, protocolName]);

  const findCommandById = (
    commands: BravoProtocolCommand[],
    id: string,
  ): BravoProtocolCommand | null => {
    const parts = id.split("-");
    if (parts.length === 1) {
      const index = parseInt(parts[0]);
      if (!isNaN(index) && index < commands.length) {
        return commands[index];
      }
    } else {
      const index = parseInt(parts[0]);
      if (!isNaN(index) && index < commands.length) {
        const remaining = parts.slice(1).join("-");
        if (commands[index].child_commands) {
          return findCommandById(commands[index].child_commands!, remaining);
        }
      }
    }
    return null;
  };

  const deleteCommandById = (
    commands: BravoProtocolCommand[],
    id: string,
  ): BravoProtocolCommand[] => {
    const parts = id.split("-");
    if (parts.length === 1) {
      const index = parseInt(parts[0]);
      return commands.filter((_, i) => i !== index).map((cmd, idx) => ({ ...cmd, position: idx }));
    } else {
      const index = parseInt(parts[0]);
      const remaining = parts.slice(1).join("-");
      const newCommands = [...commands];
      if (newCommands[index].child_commands) {
        newCommands[index] = {
          ...newCommands[index],
          child_commands: deleteCommandById(newCommands[index].child_commands!, remaining),
        };
      }
      return newCommands;
    }
  };

  const updateCommandById = (
    commands: BravoProtocolCommand[],
    id: string,
    updates: Partial<BravoProtocolCommand>,
  ): BravoProtocolCommand[] => {
    const parts = id.split("-");
    if (parts.length === 1) {
      const index = parseInt(parts[0]);
      return commands.map((cmd, i) => (i === index ? { ...cmd, ...updates } : cmd));
    } else {
      const index = parseInt(parts[0]);
      const remaining = parts.slice(1).join("-");
      const newCommands = [...commands];
      if (newCommands[index].child_commands) {
        newCommands[index] = {
          ...newCommands[index],
          child_commands: updateCommandById(newCommands[index].child_commands!, remaining, updates),
        };
      }
      return newCommands;
    }
  };

  const handleAddCommand = (parentId?: string) => {
    setInsertParentId(parentId || null);
    setIsModalOpen(true);
  };

  const handleDeleteCommand = (commandId: string) => {
    const newCommands = deleteCommandById(localCommands, commandId);
    setLocalCommands(newCommands);
    setHasUnsavedChanges(true);
  };

  const handleEditCommand = (commandId: string, updatedCommand: Partial<BravoProtocolCommand>) => {
    const newCommands = updateCommandById(localCommands, commandId, updatedCommand);
    setLocalCommands(newCommands);
    setHasUnsavedChanges(true);
  };

  const handleModalAddCommand = (command: Omit<BravoProtocolCommand, "id" | "protocol_id">) => {
    const newCommand: BravoProtocolCommand = {
      ...command,
      position: 0,
      child_commands: [],
    };

    if (insertParentId) {
      // Recursively add command to parent container with proper immutability
      const addToParentImmutable = (
        commands: BravoProtocolCommand[],
        parentId: string,
      ): BravoProtocolCommand[] => {
        const parts = parentId.split("-");
        const index = parseInt(parts[0]);

        if (parts.length === 1) {
          // Base case: we found the parent
          return commands.map((cmd, i) => {
            if (i === index) {
              const existingChildren = cmd.child_commands || [];
              return {
                ...cmd,
                child_commands: [
                  ...existingChildren,
                  {
                    ...newCommand,
                    position: existingChildren.length,
                    parent_command_id: cmd.id || undefined,
                  },
                ],
              };
            }
            return cmd;
          });
        } else {
          // Recursive case: go deeper
          const remaining = parts.slice(1).join("-");
          return commands.map((cmd, i) => {
            if (i === index) {
              return {
                ...cmd,
                child_commands: addToParentImmutable(cmd.child_commands || [], remaining),
              };
            }
            return cmd;
          });
        }
      };

      const newCommands = addToParentImmutable(localCommands, insertParentId);
      setLocalCommands(newCommands);
    } else {
      // Add to root
      setLocalCommands([
        ...localCommands,
        {
          ...newCommand,
          position: localCommands.length,
        },
      ]);
    }

    setHasUnsavedChanges(true);
    setIsModalOpen(false);
    setInsertParentId(null);
  };

  const handleSave = () => {
    if (hasUnsavedChanges) {
      onCommandsChange(localCommands);
      if (editedProtocolName !== protocolName) {
        onProtocolNameChange?.(editedProtocolName);
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

  const getCommandIcon = (commandType: string) => {
    const iconKey = commandType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("") as keyof typeof BravoCommandIcons;

    const IconComponent = BravoCommandIcons[iconKey] || BravoCommandIcons.Mix;
    return <IconComponent color={getCommandColorHex(commandType)} />;
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    if (!destination) {
      return;
    }

    // Same location
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    // Deep clone to ensure immutability
    const cloneCommands = (cmds: BravoProtocolCommand[]): BravoProtocolCommand[] => {
      return cmds.map((cmd) => ({
        ...cmd,
        child_commands: cmd.child_commands ? cloneCommands(cmd.child_commands) : [],
      }));
    };

    const newLocalCommands = cloneCommands(localCommands);

    // Helper to get commands array by droppable ID
    const getCommandsArray = (
      droppableId: string,
      commands: BravoProtocolCommand[],
    ): BravoProtocolCommand[] | null => {
      if (droppableId === "commands") {
        return commands;
      }

      const findByPath = (
        cmds: BravoProtocolCommand[],
        path: string[],
      ): BravoProtocolCommand[] | null => {
        for (let i = 0; i < cmds.length; i++) {
          const currentPath = [...path, i.toString()];
          const fullPath = currentPath.join("-");

          if (fullPath === droppableId) {
            return cmds[i].child_commands || [];
          }

          if (cmds[i].child_commands) {
            const result = findByPath(cmds[i].child_commands, currentPath);
            if (result) return result;
          }
        }
        return null;
      };

      return findByPath(commands, []);
    };

    const sourceArray = getCommandsArray(source.droppableId, newLocalCommands);
    const destArray = getCommandsArray(destination.droppableId, newLocalCommands);

    if (!sourceArray || !destArray) {
      return;
    }

    // Extract command from source
    const [movedCommand] = sourceArray.splice(source.index, 1);

    // Insert into destination
    destArray.splice(destination.index, 0, movedCommand);

    // Update positions
    sourceArray.forEach((cmd, idx) => {
      cmd.position = idx;
    });
    destArray.forEach((cmd, idx) => {
      cmd.position = idx;
    });

    setLocalCommands(newLocalCommands);
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
            <Text fontWeight="bold">{protocolName}</Text>
          </VStack>
          <ButtonGroup>
            {!isEditing ? (
              <Tooltip label="Edit Protocol" placement="top" hasArrow>
                <IconButton
                  aria-label="Edit Protocol"
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
                        setLocalCommands(commands || []);
                        setEditedProtocolName(protocolName);
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
            <Droppable droppableId="commands" type="root">
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
                        onClick={() => handleAddCommand()}
                        width="100%"
                      />
                    </SlideFade>
                  )}

                  {localCommands?.map((command, index) => (
                    <CommandItem
                      key={index}
                      command={command}
                      index={index}
                      isEditing={isEditing}
                      expandedCommand={expandedCommand}
                      config={config}
                      handleDeleteCommand={handleDeleteCommand}
                      handleEditCommand={handleEditCommand}
                      setExpandedCommand={setExpandedCommand}
                      onCommandClick={onCommandClick}
                      formatParamKey={formatParamKey}
                      getCommandIcon={getCommandIcon}
                      handleAddCommand={handleAddCommand}
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

      <BravoCommandModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setInsertParentId(null);
        }}
        onAddCommand={handleModalAddCommand}
        deckConfigs={deckConfigs || []}
        parentCommand={insertParentId ? findCommandById(localCommands, insertParentId) : null}
      />
    </Box>
  );
};
