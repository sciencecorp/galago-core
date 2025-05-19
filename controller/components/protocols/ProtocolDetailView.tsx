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
import { ProtocolFormModal } from "./ProtocolFormModal";
import { FaPlay } from "react-icons/fa6";
import { SaveIcon } from "@/components/ui/Icons";
import { SiPlatformdotsh } from "react-icons/si";
import { ConfirmationModal } from "../ui/ConfirmationModal";
import { MdOutlineExitToApp, MdOutlineFormatListBulleted } from "react-icons/md";
import { CommandDetailsDrawer } from "./CommandDetailsDrawer";
import { ParameterSchema } from "@/types";
import { successToast, errorToast } from "../ui/Toast";
import { useCommonColors } from "@/components/ui/Theme";
import { CommandComponent } from "./CommandComponent";
import { SwimlaneComponent } from "./SwimlaneComponent";
import { Swimlane } from "@/types/api";





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
      setIsEditing(false);
      refetch();
    },
    onError: (error) => {
      errorToast("Failed to update protocol", error.message);
      console.error("Update protocol error:", error);
    }
  });

  // Process mutations
  const createProcessMutation = trpc.protocol.createProcess.useMutation({
    onSuccess: () => {
      successToast("Process created", "");
      refetch();
    },
    onError: (error) => {
      errorToast("Failed to create process", error.message);
    }
  });

  const updateProcessMutation = trpc.protocol.updateProcess.useMutation({
    onSuccess: () => {
      successToast("Process updated", "");
    },
    onError: (error) => {
      errorToast("Failed to update process", error.message);
    }
  });

  const deleteProcessMutation = trpc.protocol.deleteProcess.useMutation({
    onSuccess: () => {
      successToast("Process deleted", "");
      refetch();
    },
    onError: (error) => {
      errorToast("Failed to delete process", error.message);
    }
  });

  // Command mutations
  const createCommandMutation = trpc.protocol.createCommand.useMutation({
    onSuccess: () => {
      successToast("Command created", "");
      refetch();
    },
    onError: (error) => {
      errorToast("Failed to create command", error.message);
    }
  });

  const updateCommandMutation = trpc.protocol.updateCommand.useMutation({
    onSuccess: () => {
      successToast("Command updated", "");
    },
    onError: (error) => {
      errorToast("Failed to update command", error.message);
    }
  });

  const deleteCommandMutation = trpc.protocol.deleteCommand.useMutation({
    onSuccess: () => {
      successToast("Command deleted", "");
      refetch();
    },
    onError: (error) => {
      errorToast("Failed to delete command", error.message);
    }
  });

  // Process reordering mutation
  const reorderProcessesMutation = trpc.protocol.reorderProcesses.useMutation({
    onSuccess: () => {
      successToast("Processes reordered", "");
    },
    onError: (error) => {
      errorToast("Failed to reorder processes", error.message);
    }
  });

  // Command reordering mutation
  const reorderCommandsMutation = trpc.protocol.reorderCommands.useMutation({
    onSuccess: () => {
      successToast("Commands reordered", "");
    },
    onError: (error) => {
      errorToast("Failed to reorder commands", error.message);
    }
  });

  const {
    isOpen: isParametersModalOpen,
    onOpen: openParametersModal,
    onClose: closeParametersModal,
  } = useDisclosure();

  // Function to add a new swimlane
  const addSwimlane = async () => {
    if (!protocol) return;
    
    // Calculate the next position for the new process
    const position = swimlanes.length;
    
    // Create the process in the database
    try {
      await createProcessMutation.mutateAsync({
        name: newSwimlaneTitle || `Process ${nextSwimlaneId.current}`,
        description: "",
        position: position,
        protocol_id: protocol.id
      });
      
      // The refetch will update the swimlanes state
      setNewSwimlaneTitle("New Process");
      nextSwimlaneId.current += 1;
    } catch (error) {
      console.error("Error creating process:", error);
    }
  };

  // Function to remove a swimlane
  const removeSwimlane = (swimlaneId: string) => {
    setSwimlaneToDelete(swimlaneId);
    openDeleteSwimlaneConfirm();
  };

  // Function to update swimlane name
  const updateSwimlane = (swimlaneId: string, newName: string, newDescription?: string) => {
    // Find the swimlane first to get the real process ID
    const swimlane = swimlanes.find(lane => lane.id === swimlaneId);
    if (!swimlane || !swimlane.processId) return;

    // Update in the database
    updateProcessMutation.mutate({
      id: swimlane.processId,
      data: {
        name: newName,
        description: newDescription || ""
      }
    });

    // Update locally
    setSwimlanes(swimlanes.map(lane => 
      lane.id === swimlaneId ? { 
        ...lane, 
        name: newName, 
        description: newDescription 
      } : lane
    ));
  };

  const handleAddCommandAtPosition = (swimlaneId: string, position: number) => {
    setSelectedSwimlaneId(swimlaneId);
    setAddCommandPosition(position);
    setIsAddCommandModalOpen(true);
  };

  // Initialize from protocol data
  useEffect(() => {
    if (!protocol?.processes) return;

    // Clear swimlanes when protocol changes
    if (protocol.id && protocol.processes.length > 0) {
      const initializedSwimlanes = protocol.processes.map((process, idx) => {
        const swimlaneId = `swimlane-${idx + 1}`;
        
        const commands = process.commands.map((cmd, cmdIdx) => ({
          queueId: cmdIdx,
          id: cmd.id, // Store the actual database ID
          commandInfo: {
            toolId: cmd.tool_id,
            toolType: cmd.tool_type,
            command: cmd.command,
            params: cmd.params || {},
            label: cmd.label || "",
            tool_info: {
              type: cmd.tool_type,
              image_url: cmd.tool_type === "toolbox" ? "/tool_icons/toolbox.png" : undefined,
            },
            advancedParameters: {
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
          name: process.name,
          description: process.description,
          processId: process.id, // Store the real process ID
          commands: commands
        };
      });

      setSwimlanes(initializedSwimlanes);
      nextSwimlaneId.current = protocol.processes.length + 1;
    } else if (protocol.id) {
      // If no processes, create an empty swimlanes array
      setSwimlanes([]);
    }
  }, [protocol?.id, protocol?.processes]); 

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

  const handleCommandAdded = async (newCommand: any) => {
    // Find the target swimlane and its process ID
    const targetSwimlane = swimlanes.find(lane => lane.id === selectedSwimlaneId);
    if (!targetSwimlane || !targetSwimlane.processId) return;

    // Determine the position for the new command
    const position = addCommandPosition !== null ? addCommandPosition : targetSwimlane.commands.length;

    // Create the command in the database
    try {
      await createCommandMutation.mutateAsync({
        name: newCommand.commandInfo.label || newCommand.commandInfo.command,
        tool_type: newCommand.commandInfo.toolType,
        tool_id: newCommand.commandInfo.toolId,
        label: newCommand.commandInfo.label || "",
        command: newCommand.commandInfo.command,
        params: newCommand.commandInfo.params || {},
        process_id: targetSwimlane.processId,
        position: position
      });

      // The UI will update after refetch
    } catch (error) {
      console.error("Error creating command:", error);
      
      // Update the UI temporarily until the refetch completes
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
    }

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

  const handleDeleteCommand = async () => {
    if (commandToDeleteSwimlaneId === null || commandToDeleteIndex === null) return;
    
    // Find the swimlane and command to delete
    const swimlane = swimlanes.find(lane => lane.id === commandToDeleteSwimlaneId);
    if (!swimlane) return;
    
    const commandToDelete = swimlane.commands[commandToDeleteIndex];
    if (!commandToDelete || !commandToDelete.id) {
      // If command doesn't have an ID (it's a temporary addition), just remove it from the UI
      setSwimlanes((prevSwimlanes) => {
        return prevSwimlanes.map(lane => {
          if (lane.id === commandToDeleteSwimlaneId) {
            const updatedCommands = [...lane.commands];
            updatedCommands.splice(commandToDeleteIndex, 1);
            return {
              ...lane,
              commands: updatedCommands
            };
          }
          return lane;
        });
      });
    } else {
      // Delete from the database
      try {
        await deleteCommandMutation.mutateAsync({
          id: commandToDelete.id
        });
        
        // Update UI will happen via refetch
      } catch (error) {
        console.error("Error deleting command:", error);
        
        // Update the UI temporarily
        setSwimlanes((prevSwimlanes) => {
          return prevSwimlanes.map(lane => {
            if (lane.id === commandToDeleteSwimlaneId) {
              const updatedCommands = [...lane.commands];
              updatedCommands.splice(commandToDeleteIndex, 1);
              return {
                ...lane,
                commands: updatedCommands
              };
            }
            return lane;
          });
        });
      }
    }
    
    closeDeleteConfirm();
  };

  const handleConfirmDeleteSwimlane = async () => {
    if (swimlaneToDelete === null) return;
    
    // Find the swimlane to delete
    const swimlane = swimlanes.find(lane => lane.id === swimlaneToDelete);
    if (!swimlane || !swimlane.processId) {
      // If the swimlane doesn't have a process ID, just remove it from the UI
      setSwimlanes(prevSwimlanes => prevSwimlanes.filter(lane => lane.id !== swimlaneToDelete));
    } else {
      // Delete from the database
      try {
        await deleteProcessMutation.mutateAsync({
          id: swimlane.processId
        });
        
        // Update UI will happen via refetch
      } catch (error) {
        console.error("Error deleting process:", error);
        
        // Update the UI temporarily
        setSwimlanes(prevSwimlanes => prevSwimlanes.filter(lane => lane.id !== swimlaneToDelete));
      }
    }
    
    closeDeleteSwimlaneConfirm();
  };

  const handleSaveChanges = async () => {
    if (!protocol) return;

    // Update the protocol parameters
    try {
      await updateProtocol.mutateAsync({
        id: protocol.id,
        data: {
          params: localParams
        }
      });

      // Reorder processes if needed
      const processIds = swimlanes
        .filter(lane => lane.processId)
        .map((lane, index) => ({
          id: lane.processId!,
          position: index
        }));

      if (processIds.length > 0) {
        await reorderProcessesMutation.mutateAsync({
          protocol_id: protocol.id,
          process_ids: processIds.map(p => p.id)
        });
      }

      // Reorder commands within each process if needed
      for (const swimlane of swimlanes) {
        if (!swimlane.processId) continue;
        
        const commandIds = swimlane.commands
          .filter(cmd => cmd.id)
          .map(cmd => cmd.id);
          
        if (commandIds.length > 0) {
          await reorderCommandsMutation.mutateAsync({
            process_id: swimlane.processId,
            command_ids: commandIds
          });
        }
      }

      // Refetch to get the latest state
      refetch();
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

  const handleUpdateCommand = async (updatedCommand: any) => {
    // Find the command in the swimlanes
    for (const swimlane of swimlanes) {
      const commandIndex = swimlane.commands.findIndex(cmd => cmd.queueId === updatedCommand.queueId);
      if (commandIndex !== -1) {
        const command = swimlane.commands[commandIndex];
        
        // If the command has an ID, update it in the database
        if (command.id) {
          try {
            await updateCommandMutation.mutateAsync({
              id: command.id,
              data: {
                name: updatedCommand.commandInfo.label || updatedCommand.commandInfo.command,
                tool_type: updatedCommand.commandInfo.toolType,
                tool_id: updatedCommand.commandInfo.toolId,
                label: updatedCommand.commandInfo.label || "",
                command: updatedCommand.commandInfo.command,
                params: updatedCommand.commandInfo.params || {}
              }
            });
          } catch (error) {
            console.error("Error updating command:", error);
          }
        }
        
        // Update the local state
        setSwimlanes((prevSwimlanes) => {
          return prevSwimlanes.map(lane => {
            if (lane.id === swimlane.id) {
              const updatedCommands = [...lane.commands];
              updatedCommands[commandIndex] = updatedCommand;
              return {
                ...lane,
                commands: updatedCommands
              };
            }
            return lane;
          });
        });
        
        break;
      }
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    
    if (!destination) return;

    // Update local state first for immediate UI feedback
    if (source.droppableId === destination.droppableId) {
      // Moving within same swimlane
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
      
      // Get the process ID for this swimlane
      const swimlane = swimlanes.find(lane => lane.id === source.droppableId);
      if (swimlane?.processId) {
        // Get all command IDs in the new order
        const updatedSwimlane = swimlanes.find(lane => lane.id === source.droppableId);
        if (updatedSwimlane) {
          const commandIds = updatedSwimlane.commands
            .filter(cmd => cmd.id)
            .map(cmd => cmd.id);
            
          if (commandIds.length > 0) {
            try {
              await reorderCommandsMutation.mutateAsync({
                process_id: swimlane.processId,
                command_ids: commandIds
              });
            } catch (error) {
              console.error("Error reordering commands:", error);
              // Revert to the previous state or refetch if there's an error
              refetch();
            }
          }
        }
      }
    } 
    else {
      // Moving between swimlanes
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
      
      // This is more complex as we need to move a command from one process to another
      // Find the relevant swimlanes and command
      const sourceSwimlane = swimlanes.find(lane => lane.id === source.droppableId);
      const destSwimlane = swimlanes.find(lane => lane.id === destination.droppableId);
      
      if (sourceSwimlane && destSwimlane && sourceSwimlane.processId && destSwimlane.processId) {
        const command = sourceSwimlane.commands[source.index];
        
        if (command && command.id) {
          // Update the command to move it to the new process
          try {
            await updateCommandMutation.mutateAsync({
              id: command.id,
              data: {
                process_id: destSwimlane.processId,
                position: destination.index
              }
            });
            
            // Reorder commands in both processes
            const sourceCommandIds = sourceSwimlane.commands
              .filter(cmd => cmd.id && cmd.id !== command.id)
              .map(cmd => cmd.id);
              
            if (sourceCommandIds.length > 0) {
              await reorderCommandsMutation.mutateAsync({
                process_id: sourceSwimlane.processId,
                command_ids: sourceCommandIds
              });
            }
            
            // Get updated destination swimlane commands
            const updatedDestSwimlane = swimlanes.find(lane => lane.id === destination.droppableId);
            if (updatedDestSwimlane) {
              const destCommandIds = updatedDestSwimlane.commands
                .filter(cmd => cmd.id)
                .map(cmd => cmd.id);
                
              if (destCommandIds.length > 0) {
                await reorderCommandsMutation.mutateAsync({
                  process_id: destSwimlane.processId,
                  command_ids: destCommandIds
                });
              }
            }
          } catch (error) {
            console.error("Error moving command between processes:", error);
            // Revert to the previous state or refetch if there's an error
            refetch();
          }
        }
      }
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
              <Text color="gray.500">{protocol.workcell_id}</Text>
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
              <SwimlaneComponent
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