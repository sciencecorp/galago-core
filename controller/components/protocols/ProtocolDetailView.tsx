import {
  Box,
  Button,
  HStack,
  VStack,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tag,
  useColorModeValue,
  IconButton,
  Divider,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Center,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Grid,
  GridItem,
  Input,
  Tooltip,
} from "@chakra-ui/react";
import { DeleteIcon, AddIcon, EditIcon, ArrowForwardIcon, HamburgerIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
  DraggableStateSnapshot,
  DroppableStateSnapshot,
} from "react-beautiful-dnd";
import { AddToolCommandModal } from "./AddToolCommandModal";
import NewProtocolRunModal from "./NewProtocolRunModal";
import { trpc } from "@/utils/trpc";
import { capitalizeFirst } from "@/utils/parser";
import { VscRunBelow } from "react-icons/vsc";
import { ProtocolFormModal } from "./ProtocolFormModal";
import { FaPlay } from "react-icons/fa6";
import { SaveIcon } from "@/components/ui/Icons";
import { SiPlatformdotsh } from "react-icons/si";
import { ConfirmationModal } from "../ui/ConfirmationModal";
import { MdOutlineExitToApp, MdOutlineFormatListBulleted } from "react-icons/md";
import { CommandDetailsDrawer } from "./CommandDetailsDrawer";
import { ParameterSchema } from "@/types";
import CommandImage from "@/components/tools/CommandImage";
import { successToast, errorToast } from "../ui/Toast";
import { useCommonColors } from "@/components/ui/Theme";
import { PiPathBold } from "react-icons/pi";

// Interface for swimlane structure
interface Swimlane {
  id: string;
  name: string;
  commands: any[];
}

const handleWheel = (e: WheelEvent) => {
  const container = e.currentTarget as HTMLElement;
  if (e.deltaY !== 0) {
    e.preventDefault();
    container.scrollLeft += e.deltaY;
  }
};

const ProtocolSwimLaneCommandComponent: React.FC<{
  command: any;
  onCommandClick: (command: any) => void;
  onRunCommand: (command: any) => void;
  onDeleteCommand: () => void;
  isEditing?: boolean;
}> = ({ command, onCommandClick, onRunCommand, onDeleteCommand, isEditing = false }) => {
  const infoQuery = trpc.tool.info.useQuery({ toolId: command.commandInfo.toolId });

  return (
    <Box
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (!target.closest(".command-menu")) {
          onCommandClick(command);
        }
      }}>
      <Box
        left="0px"
        right="0px"
        minW="250px"
        maxW="300px"
        height="165px"
        overflowY="auto"
        mr="4"
        fontSize="18px"
        borderLeftRadius="15"
        borderRightRadius="15"
        padding="6px"
        background={useColorModeValue("gray.50", "gray.700")}
        border="1px"
        borderColor={useColorModeValue("gray.200", "gray.600")}
        boxShadow={useColorModeValue("md", "none")}>
        <VStack alignItems="stretch">
          <Box>
            <HStack spacing={2}>
              <Box width="90%">
                <Text as="b">{capitalizeFirst(command.commandInfo.toolType)}</Text>
              </Box>
              <Box className="command-menu">
                <Menu>
                  <MenuButton
                    as={IconButton}
                    aria-label="Options"
                    border={0}
                    bg="transparent"
                    icon={<HamburgerIcon fontSize="lg" />}
                    variant="outline"
                  />
                  <MenuList>
                    <MenuItem onClick={() => onRunCommand(command)} icon={<VscRunBelow />}>
                      Run Command
                    </MenuItem>
                    {isEditing && (
                      <MenuItem onClick={onDeleteCommand} icon={<DeleteIcon />}>
                        Delete Command
                      </MenuItem>
                    )}
                  </MenuList>
                </Menu>
              </Box>
            </HStack>
          </Box>
          <Center p={0}>
            <VStack spacing={2}>
              <CommandImage
                config={infoQuery.data}
                command={command}
                onCommandClick={onCommandClick}
              />
              <Box bottom={0} position="sticky">
                <Text>{capitalizeFirst(command.commandInfo.command.replaceAll("_", " "))}</Text>
              </Box>
            </VStack>
          </Center>
        </VStack>
      </Box>
    </Box>
  );
};

// SwimLaneContainer Component for multiple processes
const SwimLaneContainer: React.FC<{
  swimlane: Swimlane;
  isEditing: boolean;
  onCommandClick: (command: any) => void;
  onRunCommand: (command: any) => void;
  onDeleteCommand: (swimlaneId: string, commandIndex: number) => void;
  onAddCommandAtPosition: (swimlaneId: string, position: number) => void;
  onRemoveSwimlane: (swimlaneId: string) => void;
  onEditSwimlane: (swimlaneId: string, newName: string) => void;
  isSelected?: boolean;
}> = ({
  swimlane,
  isEditing,
  onCommandClick,
  onRunCommand,
  onDeleteCommand,
  onAddCommandAtPosition,
  onRemoveSwimlane,
  onEditSwimlane,
  isSelected,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(swimlane.name);
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const highlightColor = useColorModeValue("blue.50", "blue.900");
  const arrowColor = useColorModeValue("gray.500", "gray.400");

  const handleNameChange = () => {
    onEditSwimlane(swimlane.id, nameValue);
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameChange();
    }
  };

  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="md"
      mb={4}
      bg={isSelected ? highlightColor : bgColor}
      borderColor={borderColor}
      className="swimlane-container">
      <VStack align="stretch" spacing={4}>
        <HStack justifyContent="space-between">
          {isEditingName ? (
            <Input
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={handleNameChange}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          ) : (
            <Heading size="md">{swimlane.name}</Heading>
          )}
          <HStack>
            {isEditing && (
              <>
                <Tooltip label="Edit swimlane name">
                  <IconButton
                    aria-label="Edit swimlane name"
                    icon={<EditIcon />}
                    size="sm"
                    onClick={() => setIsEditingName(true)}
                  />
                </Tooltip>
                <Tooltip label="Delete swimlane">
                  <IconButton
                    aria-label="Delete swimlane"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => onRemoveSwimlane(swimlane.id)}
                  />
                </Tooltip>
              </>
            )}
          </HStack>
        </HStack>
        <Box
          overflowX="auto"
          py={2}
          maxW="90vw"
          onWheel={(e: any) => handleWheel(e)}
          css={{
            "&::-webkit-scrollbar": {
              height: "8px",
            },
            "&::-webkit-scrollbar-track": {
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              borderRadius: "4px",
              "&:hover": {},
            },
          }}>
          <Droppable droppableId={swimlane.id} direction="horizontal">
            {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
              <HStack
                spacing={4}
                align="flex-start"
                minW="min-content"
                ref={provided.innerRef}
                {...provided.droppableProps}>
                {swimlane.commands.length === 0 && isEditing ? (
                  <Button
                    leftIcon={<AddIcon />}
                    colorScheme="blue"
                    variant="outline"
                    onClick={() => onAddCommandAtPosition(swimlane.id, 0)}>
                    Add First Command
                  </Button>
                ) : (
                  swimlane.commands.map((command: any, index: number) => (
                    <Draggable
                      key={`${swimlane.id}-${command.queueId}`}
                      draggableId={`${swimlane.id}-${command.queueId}`}
                      index={index}
                      isDragDisabled={!isEditing}>
                      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                        <HStack
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            opacity: snapshot.isDragging ? 0.8 : 1,
                          }}>
                          {isEditing && index === 0 && (
                            <IconButton
                              aria-label="Add command before"
                              icon={<AddIcon />}
                              size="sm"
                              colorScheme="blue"
                              variant="ghost"
                              onClick={() => onAddCommandAtPosition(swimlane.id, index)}
                              _hover={{ bg: "blue.100" }}
                            />
                          )}
                          <ProtocolSwimLaneCommandComponent
                            command={command}
                            onCommandClick={(cmd) => onCommandClick(cmd)}
                            onRunCommand={onRunCommand}
                            onDeleteCommand={() => onDeleteCommand(swimlane.id, index)}
                            isEditing={isEditing}
                          />
                          {isEditing ? (
                            <IconButton
                              aria-label="Add command after"
                              icon={<AddIcon />}
                              size="sm"
                              colorScheme="blue"
                              variant="ghost"
                              onClick={() => onAddCommandAtPosition(swimlane.id, index + 1)}
                              _hover={{ bg: "blue.100" }}
                            />
                          ) : (
                            index < swimlane.commands.length - 1 && (
                              <Box color={arrowColor}>
                                <ArrowForwardIcon boxSize={6} />
                              </Box>
                            )
                          )}
                        </HStack>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </HStack>
            )}
          </Droppable>
        </Box>
      </VStack>
    </Box>
  );
};

export const ProtocolDetailView: React.FC<{ id: string }> = ({ id }) => {
  const [swimlanes, setSwimlanes] = useState<Swimlane[]>([]);
  const [isAddCommandModalOpen, setIsAddCommandModalOpen] = useState(false);
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [addCommandPosition, setAddCommandPosition] = useState<number | null>(null);
  const [selectedCommand, setSelectedCommand] = useState<any | null>(null);
  const [localParams, setLocalParams] = useState<Record<string, ParameterSchema>>({});
  const [selectedSwimlaneId, setSelectedSwimlaneId] = useState<string | null>(null);
  const [newSwimlaneTitle, setNewSwimlaneTitle] = useState("New Process");
  const nextSwimlaneId = useRef(1);

  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const execMutation = trpc.tool.runCommand.useMutation();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const arrowColor = useColorModeValue("gray.500", "gray.400");
  
  const {
    data: protocol,
    isLoading,
    error,
    refetch,
  } = trpc.protocol.getById.useQuery({ id: parseInt(id) });
  
  const { data: selectedWorkcellData } = trpc.workcell.getSelectedWorkcell.useQuery();
  const { data: workcells } = trpc.workcell.getAll.useQuery();
  const { data: fetchedIds } = trpc.tool.availableIDs.useQuery({
    workcellId: workcells?.find((workcell) => workcell.name === selectedWorkcellData)?.id,
  });
  
  const [commandToDeleteIndex, setCommandToDeleteIndex] = useState<any | null>(null);
  const [commandToDeleteSwimlaneId, setCommandToDeleteSwimlaneId] = useState<string | null>(null);
  const [swimlaneToDelete, setSwimlaneToDelete] = useState<string | null>(null);
  
  const {
    isOpen: isDeleteConfirmOpen,
    onOpen: openDeleteConfirm,
    onClose: closeDeleteConfirm,
  } = useDisclosure();
  
  const {
    isOpen: isDeleteSwimlaneConfirmOpen,
    onOpen: openDeleteSwimlaneConfirm,
    onClose: closeDeleteSwimlaneConfirm,
  } = useDisclosure();

  const updateProtocol = trpc.protocol.update.useMutation({
    onSuccess: () => {
      successToast("Protocol updated", "");
      // Don't force a refetch that will reset swimlanes
      // Instead, just mark the editing state as done
      setIsEditing(false);
    },
    onError: (error) => {
      errorToast("Failed to update protocol", error.message);
      console.error("Update protocol error:", error);
    }
  });

  const {
    isOpen: isParametersModalOpen,
    onOpen: openParametersModal,
    onClose: closeParametersModal,
  } = useDisclosure();

  // Function to add a new swimlane
  const addSwimlane = () => {
    const newLaneId = `swimlane-${nextSwimlaneId.current}`;
    const newSwimlane: Swimlane = {
      id: newLaneId,
      name: newSwimlaneTitle || `Process ${nextSwimlaneId.current}`,
      commands: []
    };

    setSwimlanes([...swimlanes, newSwimlane]);
    setNewSwimlaneTitle("New Process");
    nextSwimlaneId.current += 1;
  };

  // Function to remove a swimlane
  const removeSwimlane = (swimlaneId: string) => {
    setSwimlaneToDelete(swimlaneId);
    openDeleteSwimlaneConfirm();
  };

  // Function to update swimlane name
  const updateSwimlane = (swimlaneId: string, newName: string) => {
    setSwimlanes(swimlanes.map(lane => 
      lane.id === swimlaneId ? { ...lane, name: newName } : lane
    ));
  };

  const handleAddCommandAtPosition = (swimlaneId: string, position: number) => {
    setSelectedSwimlaneId(swimlaneId);
    setAddCommandPosition(position);
    setIsAddCommandModalOpen(true);
  };

  // Initialize from protocol data
  useEffect(() => {
    if (!protocol?.commands) return;

    // Check if we already have swimlanes - if so, don't reset them
    if (swimlanes.length > 0) return;

    // If protocol doesn't have processes array yet, initialize with a single swimlane
    if (!protocol.processes || protocol.processes.length === 0) {
      const defaultSwimlaneId = `swimlane-${nextSwimlaneId.current}`;
      nextSwimlaneId.current += 1;

      const commands = protocol.commands.map((cmd: any, index: number) => ({
        queueId: index, // Add a unique queueId for each command
        commandInfo: {
          toolId: cmd.toolId,
          toolType: cmd.toolType,
          command: cmd.command,
          params: cmd.params || {},
          label: cmd.label || "",
          tool_info: cmd.tool_info || {
            type: cmd.toolType,
            image_url: cmd.toolType === "toolbox" ? "/tool_icons/toolbox.png" : undefined,
          },
          advancedParameters: cmd.advancedParameters || {
            skipExecutionVariable: {
              variable: null,
              value: "",
            },
            runAsynchronously: false,
          },
        },
      }));

      const defaultSwimlane: Swimlane = {
        id: defaultSwimlaneId,
        name: `${protocol.name} Process`,
        commands: commands
      };

      setSwimlanes([defaultSwimlane]);
    } else {
      // Initialize swimlanes from protocol.processes
      const initializedSwimlanes = protocol.processes.map((process: any, idx: number) => {
        const swimlaneId = `swimlane-${idx + 1}`;
        
        const commands = process.commands.map((cmd: any, cmdIdx: number) => ({
          queueId: cmdIdx,
          commandInfo: {
            toolId: cmd.toolId,
            toolType: cmd.toolType,
            command: cmd.command,
            params: cmd.params || {},
            label: cmd.label || "",
            tool_info: cmd.tool_info || {
              type: cmd.toolType,
              image_url: cmd.toolType === "toolbox" ? "/tool_icons/toolbox.png" : undefined,
            },
            advancedParameters: cmd.advancedParameters || {
              skipExecutionVariable: {
                variable: null,
                value: "",
              },
              runAsynchronously: false,
            },
          },
        }));

        return {
          id: swimlaneId,
          name: process.name || `Process ${idx + 1}`,
          commands: commands
        };
      });

      setSwimlanes(initializedSwimlanes);
      nextSwimlaneId.current = protocol.processes.length + 1;
    }
  }, [protocol?.id]); // Only reinitialize if the protocol ID changes

  useEffect(() => {
    if (protocol?.params) {
      setLocalParams(protocol.params);
    }
  }, [protocol?.params]);

  if (isLoading) {
    return <Spinner size="xl" />;
  }

  if (error || !protocol) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error loading protocol</AlertTitle>
        <AlertDescription>Unable to load protocol details</AlertDescription>
      </Alert>
    );
  }

  const getCategoryColor = (category: string): string => {
    switch (category.toLowerCase()) {
      case "development":
        return "purple";
      case "qc":
        return "blue";
      case "production":
        return "green";
      default:
        return "gray";
    }
  };

  const handleCommandAdded = (newCommand: any) => {
    const commandWithId = {
      queueId: Date.now(), // Use timestamp as a temporary unique ID
      ...newCommand,
    };

    setSwimlanes((prevSwimlanes) => {
      return prevSwimlanes.map(swimlane => {
        if (swimlane.id === selectedSwimlaneId) {
          const updatedCommands = [...swimlane.commands];
          if (addCommandPosition !== null) {
            updatedCommands.splice(addCommandPosition, 0, commandWithId);
          } else {
            updatedCommands.push(commandWithId);
          }
          return {
            ...swimlane,
            commands: updatedCommands
          };
        }
        return swimlane;
      });
    });

    setAddCommandPosition(null);
    setSelectedSwimlaneId(null);
    setIsAddCommandModalOpen(false);
  };

  const handleRunClick = () => {
    setIsRunModalOpen(true);
  };

  const handleRunModalClose = () => {
    setIsRunModalOpen(false);
  };

  const handleDeleteCommand = () => {
    if (commandToDeleteSwimlaneId !== null && commandToDeleteIndex !== null) {
      setSwimlanes((prevSwimlanes) => {
        return prevSwimlanes.map(swimlane => {
          if (swimlane.id === commandToDeleteSwimlaneId) {
            const updatedCommands = [...swimlane.commands];
            updatedCommands.splice(commandToDeleteIndex, 1);
            return {
              ...swimlane,
              commands: updatedCommands
            };
          }
          return swimlane;
        });
      });
    }
    closeDeleteConfirm();
  };

  const handleConfirmDeleteSwimlane = () => {
    if (swimlaneToDelete !== null) {
      setSwimlanes(swimlanes.filter(lane => lane.id !== swimlaneToDelete));
    }
    closeDeleteSwimlaneConfirm();
  };

  const handleSaveChanges = () => {
    if (!protocol) return;

    // Convert the swimlanes structure to the format expected by the API
    const processes = swimlanes.map(swimlane => ({
      name: swimlane.name,
      commands: swimlane.commands.map(cmd => ({
        toolId: cmd.commandInfo.toolId,
        toolType: cmd.commandInfo.toolType,
        command: cmd.commandInfo.command,
        params: cmd.commandInfo.params,
        label: cmd.commandInfo.label || "",
        tool_info: {
          type: cmd.commandInfo.toolType,
          image_url: cmd.commandInfo.toolType === "toolbox" ? "/tool_icons/toolbox.png" : undefined,
        },
        advancedParameters: cmd.commandInfo.advancedParameters || {
          skipExecutionVariable: {
            variable: null,
            value: "",
          },
          runAsynchronously: false,
        },
      }))
    }));

    // For backward compatibility, also set the commands field to ALL commands flattened across swimlanes
    const flattenedCommands = swimlanes.flatMap(swimlane => 
      swimlane.commands.map(cmd => ({
        toolId: cmd.commandInfo.toolId,
        toolType: cmd.commandInfo.toolType,
        command: cmd.commandInfo.command,
        params: cmd.commandInfo.params,
        label: cmd.commandInfo.label || "",
        tool_info: {
          type: cmd.commandInfo.toolType,
          image_url: cmd.commandInfo.toolType === "toolbox" ? "/tool_icons/toolbox.png" : undefined,
        },
        advancedParameters: cmd.commandInfo.advancedParameters || {
          skipExecutionVariable: {
            variable: null,
            value: "",
          },
          runAsynchronously: false,
        },
      }))
    );

    try {
      updateProtocol.mutate({
        id: protocol.id,
        data: {
          name: protocol.name,
          description: protocol.description,
          params: localParams,
          commands: flattenedCommands, // Keep for backward compatibility - now flattened across ALL swimlanes
          processes: processes, // New structure with multiple swimlanes
          icon: protocol.icon || "",
        },
      });
    } catch (error) {
      console.error("Error saving protocol:", error);
      errorToast("Failed to save protocol", "An unexpected error occurred");
    }
  };

  const handleRunCommand = (command: any) => {
    execMutation.mutate(command.commandInfo, {
      onSuccess: () => {
        successToast("Command executed", "");
      },
      onError: (error) => {
        errorToast("Failed to execute command", error.message);
      },
    });
  };

  const handleUpdateCommand = (updatedCommand: any) => {
    setSwimlanes((prevSwimlanes) => {
      return prevSwimlanes.map(swimlane => {
        return {
          ...swimlane,
          commands: swimlane.commands.map(cmd => 
            cmd.queueId === updatedCommand.queueId ? updatedCommand : cmd
          )
        };
      });
    });
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    
    if (!destination) return;

    // If dragging within the same swimlane
    if (source.droppableId === destination.droppableId) {
      setSwimlanes(prevSwimlanes => {
        return prevSwimlanes.map(swimlane => {
          if (swimlane.id === source.droppableId) {
            const newCommands = [...swimlane.commands];
            const [movedCommand] = newCommands.splice(source.index, 1);
            newCommands.splice(destination.index, 0, movedCommand);
            return {
              ...swimlane,
              commands: newCommands
            };
          }
          return swimlane;
        });
      });
    } 
    // If dragging between different swimlanes
    else {
      setSwimlanes(prevSwimlanes => {
        const updatedSwimlanes = [...prevSwimlanes];
        
        // Find source and destination swimlanes
        const sourceSwimLaneIndex = updatedSwimlanes.findIndex(lane => lane.id === source.droppableId);
        const destSwimLaneIndex = updatedSwimlanes.findIndex(lane => lane.id === destination.droppableId);
        
        if (sourceSwimLaneIndex !== -1 && destSwimLaneIndex !== -1) {
          // Get the command being moved
          const sourceCommands = [...updatedSwimlanes[sourceSwimLaneIndex].commands];
          const [movedCommand] = sourceCommands.splice(source.index, 1);
          
          // Update source swimlane
          updatedSwimlanes[sourceSwimLaneIndex] = {
            ...updatedSwimlanes[sourceSwimLaneIndex],
            commands: sourceCommands
          };
          
          // Update destination swimlane
          const destCommands = [...updatedSwimlanes[destSwimLaneIndex].commands];
          destCommands.splice(destination.index, 0, movedCommand);
          updatedSwimlanes[destSwimLaneIndex] = {
            ...updatedSwimlanes[destSwimLaneIndex],
            commands: destCommands
          };
        }
        
        return updatedSwimlanes;
      });
    }
  };

  // Calculate protocol stats
  const totalCommands = swimlanes.reduce((acc, lane) => acc + lane.commands.length, 0);
  const estimatedDuration = totalCommands * 3; // 3 minutes per command

  return (
    <Box
      bg={bgColor}
      borderRadius="lg"
      p={6}
      color={textColor}
      borderColor={borderColor}
      borderWidth="1px"
      mx="auto"
      overflow="hidden">
      <ProtocolFormModal
        isOpen={isParametersModalOpen}
        onClose={closeParametersModal}
        initialParams={protocol.params || {}}
        protocolId={protocol.id}
        onSave={(newParams) => {
          setLocalParams(newParams);
          refetch();
          closeParametersModal();
        }}
      />
      <VStack align="stretch" spacing={6} width="100%">
        <HStack justify="space-between">
          <VStack align="start" spacing={2}>
            <Heading size="lg">{protocol.name}</Heading>
            <HStack>
              <Tag colorScheme={getCategoryColor(protocol.category)}>{protocol.category}</Tag>
              <Text color="gray.500">{protocol.workcell}</Text>
            </HStack>
          </VStack>
          <HStack>
            {isEditing ? (
              <>
                <Button
                  leftIcon={<SiPlatformdotsh fontSize="14px" />}
                  variant="outline"
                  size="md"
                  onClick={openParametersModal}>
                  Form
                </Button>
                <Button
                  variant="outline"
                  leftIcon={<SaveIcon />}
                  size="md"
                  onClick={handleSaveChanges}>
                  Save
                </Button>
                <Button
                  leftIcon={<MdOutlineExitToApp />}
                  variant="outline"
                  onClick={() => setIsEditing(false)}>
                  Exit
                </Button>
              </>
            ) : (
              <>
                <Button
                  leftIcon={<EditIcon />}
                  colorScheme="teal"
                  onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
                <Button leftIcon={<FaPlay />} colorScheme="green" onClick={handleRunClick}>
                  Run
                </Button>
              </>
            )}
          </HStack>
        </HStack>

        <Text>{protocol.description}</Text>
        
        {/* Protocol Stats Section */}
        {isEditing && (
          <StatGroup>
            <Stat>
              <StatLabel>Protocol</StatLabel>
              <StatNumber color="green.500">{protocol.name}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Processes</StatLabel>
              <StatNumber>{swimlanes.length}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Commands</StatLabel>
              <StatNumber>{totalCommands}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Est. Duration</StatLabel>
              <StatNumber color="yellow.500">{estimatedDuration} mins</StatNumber>
            </Stat>
          </StatGroup>
        )}
        
        <Divider />
        
        {/* Swimlanes Section */}
        <DragDropContext onDragEnd={onDragEnd}>
          <VStack spacing={4} align="stretch">
            {swimlanes.map((swimlane) => (
              <SwimLaneContainer
                key={swimlane.id}
                swimlane={swimlane}
                isEditing={isEditing}
                onCommandClick={(cmd) => {
                  setSelectedCommand(cmd);
                  onDrawerOpen();
                }}
                onRunCommand={handleRunCommand}
                onDeleteCommand={(swimlaneId, index) => {
                  setCommandToDeleteSwimlaneId(swimlaneId);
                  setCommandToDeleteIndex(index);
                  openDeleteConfirm();
                }}
                onAddCommandAtPosition={handleAddCommandAtPosition}
                onRemoveSwimlane={removeSwimlane}
                onEditSwimlane={updateSwimlane}
              />
            ))}
            
            {isEditing && (
              <HStack justify="center" mt={4}>
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="blue"
                  onClick={addSwimlane}>
                  Add Process
                </Button>
              </HStack>
            )}
          </VStack>
        </DragDropContext>
      </VStack>

      {/* Command Details Drawer */}
      <CommandDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={onDrawerClose}
        selectedCommand={selectedCommand}
        onSave={handleUpdateCommand}
        isEditing={isEditing}
      />

      <AddToolCommandModal
        isOpen={isAddCommandModalOpen}
        onClose={() => setIsAddCommandModalOpen(false)}
        onCommandAdded={handleCommandAdded}
      />

      {isRunModalOpen && (
        <NewProtocolRunModal id={protocol.id.toString()} onClose={handleRunModalClose} />
      )}

      <ConfirmationModal
        colorScheme="red"
        confirmText="Delete"
        header="Delete command?"
        isOpen={isDeleteConfirmOpen}
        onClick={handleDeleteCommand}
        onClose={closeDeleteConfirm}>
        {`Are you sure you want to delete this command "${selectedCommand?.commandInfo?.command?.replaceAll("_", " ") || ""}"?`}
      </ConfirmationModal>

      <ConfirmationModal
        colorScheme="red"
        confirmText="Delete"
        header="Delete Process"
        isOpen={isDeleteSwimlaneConfirmOpen}
        onClick={handleConfirmDeleteSwimlane}
        onClose={closeDeleteSwimlaneConfirm}>
        {`Are you sure you want to delete this process? All commands in this process will be deleted.`}
      </ConfirmationModal>
    </Box>
  );
};