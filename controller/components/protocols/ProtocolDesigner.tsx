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
  Divider,
  useDisclosure,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Center,
} from "@chakra-ui/react";
import { AddIcon, EditIcon } from "@chakra-ui/icons";
import { useState, useEffect, useRef } from "react";
import { DragDropContext, DropResult, Droppable, Draggable } from "react-beautiful-dnd";
import { AddToolCommandModal } from "./AddToolCommandModal";
import NewProtocolRunModal from "./NewProtocolRunModal";
import { trpc } from "@/utils/trpc";
import { FaPlay } from "react-icons/fa6";
import { SiPlatformdotsh } from "react-icons/si";
import { ConfirmationModal } from "../ui/ConfirmationModal";
import { MdOutlineExitToApp, MdOutlineFormatListBulleted } from "react-icons/md";
import { CommandDetailsDrawer } from "./CommandDetailsDrawer";
import { ParameterSchema } from "@/types";
import { successToast, errorToast } from "../ui/Toast";
import { SwimlaneComponent } from "./Swimlane";
import { Swimlane } from "@/types";
import { ProtocolCommand } from "@/types";

export const ProtocolDesigner: React.FC<{ id: string }> = ({ id }) => {
  const [swimlanes, setSwimlanes] = useState<Swimlane[]>([]);
  const [isAddCommandModalOpen, setIsAddCommandModalOpen] = useState(false);
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [addCommandPosition, setAddCommandPosition] = useState<number | null>(null);
  const [selectedCommand, setSelectedCommand] = useState<ProtocolCommand | null>(null);
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
      refetch();
    },
    onError: (error) => {
      errorToast("Failed to update protocol", error.message);
      console.error("Update protocol error:", error);
    },
  });

  // Process mutations
  const createProcessMutation = trpc.protocol.createProcess.useMutation({
    onSuccess: () => {
      successToast("Process created", "");
      refetch();
    },
    onError: (error) => {
      errorToast("Failed to create process", error.message);
    },
  });

  const updateProcessMutation = trpc.protocol.updateProcess.useMutation({
    onSuccess: () => {
      successToast("Process updated", "");
    },
    onError: (error) => {
      errorToast("Failed to update process", error.message);
    },
  });

  const deleteProcessMutation = trpc.protocol.deleteProcess.useMutation({
    onSuccess: () => {
      successToast("Process deleted", "");
      refetch();
    },
    onError: (error) => {
      errorToast("Failed to delete process", error.message);
    },
  });

  const createCommandMutation = trpc.protocol.createCommand.useMutation({
    onSuccess: () => {
      successToast("Command created", "");
      refetch();
    },
    onError: (error) => {
      errorToast("Failed to create command", error.message);
    },
  });

  const updateCommandMutation = trpc.protocol.updateCommand.useMutation({
    onSuccess: () => {
      successToast("Command updated", "");
    },
    onError: (error) => {
      errorToast("Failed to update command", error.message);
    },
  });

  const deleteCommandMutation = trpc.protocol.deleteCommand.useMutation({
    onSuccess: () => {
      successToast("Command deleted", "");
      refetch();
    },
    onError: (error) => {
      errorToast("Failed to delete command", error.message);
    },
  });

  const reorderProcessesMutation = trpc.protocol.reorderProcesses.useMutation({
    onSuccess: () => {
      successToast("Protocol updated", "");
    },
    onError: (error) => {
      errorToast("Failed to reorder processes", error.message);
    },
  });

  const reorderCommandsMutation = trpc.protocol.reorderCommands.useMutation({
    onError: (error) => {
      errorToast("Failed to reorder commands", error.message);
    },
  });

  const {
    isOpen: isParametersModalOpen,
    onOpen: openParametersModal,
    onClose: closeParametersModal,
  } = useDisclosure();

  const addSwimlane = async () => {
    if (!protocol) return;
    const position = swimlanes.length;
    try {
      await createProcessMutation.mutateAsync({
        name: newSwimlaneTitle || `Process ${nextSwimlaneId.current}`,
        description: "",
        position: position,
        protocol_id: protocol.id,
      });

      setNewSwimlaneTitle("New Process");
      nextSwimlaneId.current += 1;
    } catch (error) {
      console.error("Error creating process:", error);
    }
  };

  const removeSwimlane = (swimlaneId: string) => {
    setSwimlaneToDelete(swimlaneId);
    openDeleteSwimlaneConfirm();
  };

  const updateSwimlane = (swimlaneId: string, newName: string, newDescription?: string) => {
    const swimlane = swimlanes.find((lane) => lane.id === swimlaneId);
    if (!swimlane || !swimlane.processId) return;

    updateProcessMutation.mutate({
      id: swimlane.processId,
      data: {
        name: newName,
        description: newDescription || "",
      },
    });
    // Update locally
    setSwimlanes(
      swimlanes.map((lane) =>
        lane.id === swimlaneId
          ? {
              ...lane,
              name: newName,
              description: newDescription,
            }
          : lane,
      ),
    );
    refetch();
  };

  const handleAddCommandAtPosition = (swimlaneId: string, position: number) => {
    setSelectedSwimlaneId(swimlaneId);
    setAddCommandPosition(position);
    setIsAddCommandModalOpen(true);
  };

  useEffect(() => {
    if (!protocol?.processes) return;

    if (protocol.id && protocol.processes.length > 0) {
      const initializedSwimlanes = protocol.processes
        .sort((a, b) => a.position - b.position)
        .map((process, idx) => {
          const swimlaneId = `swimlane-${idx + 1}`;
          return {
            id: swimlaneId,
            name: process.name,
            description: process.description,
            processId: process.id,
            position: process.position,
            commands: process.commands,
          };
        });

      setSwimlanes(initializedSwimlanes);
      nextSwimlaneId.current = protocol.processes.length + 1;
    } else if (protocol.id) {
      setSwimlanes([]);
    }
  }, [protocol?.id, protocol?.processes]);

  useEffect(() => {
    if (protocol?.params) {
      setLocalParams(protocol.params);
    }
  }, [protocol?.params]);

  if (isLoading) {
    return <Center><Spinner size="sm" /></Center>;
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
    const targetSwimlane = swimlanes.find((lane) => lane.id === selectedSwimlaneId);
    if (!targetSwimlane || !targetSwimlane.processId) return;

    const position =
      addCommandPosition !== null ? addCommandPosition : targetSwimlane.commands.length;

    const commandData = {
      name: newCommand.label || newCommand.command,
      tool_type: newCommand.tool_type,
      tool_id: newCommand.tool_id,
      label: newCommand.label || "",
      command: newCommand.command,
      params: newCommand.params || {},
      advanced_parameters: newCommand.advanced_parameters || {},
      process_id: targetSwimlane.processId,
      position: position,
    };

    await createCommandMutation.mutateAsync(commandData);

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

    const swimlane = swimlanes.find((lane) => lane.id === commandToDeleteSwimlaneId);
    if (!swimlane) return;

    const commandToDelete = swimlane.commands[commandToDeleteIndex];
    if (!commandToDelete || !commandToDelete.id) {
      setSwimlanes((prevSwimlanes) => {
        return prevSwimlanes.map((lane) => {
          if (lane.id === commandToDeleteSwimlaneId) {
            const updatedCommands = [...lane.commands];
            updatedCommands.splice(commandToDeleteIndex, 1);
            return {
              ...lane,
              commands: updatedCommands,
            };
          }
          return lane;
        });
      });
    } else {
      await deleteCommandMutation.mutateAsync({
        id: commandToDelete.id,
      });
    }

    closeDeleteConfirm();
  };

  const handleConfirmDeleteSwimlane = async () => {
    if (swimlaneToDelete === null) return;

    const swimlane = swimlanes.find((lane) => lane.id === swimlaneToDelete);
    if (!swimlane || !swimlane.processId) return;
    await deleteProcessMutation.mutateAsync({ id: swimlane.processId });
    closeDeleteSwimlaneConfirm();
  };

  const handleSaveChanges = async () => {
    if (!protocol) return;

    // Update the protocol parameters
    try {
      //Okay so this updates localParams (the form parameters). This will be removed later.
      await updateProtocol.mutateAsync({
        id: protocol.id,
        data: {
          params: localParams,
        },
      });

      // Refetch to get the latest state
      refetch();
    } catch (error) {
      console.error("Error saving protocol:", error);
      errorToast("Failed to save protocol", "An unexpected error occurred");
    }
  };

  const handleRunCommand = (command: any) => {
    execMutation.mutate(command, {
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
      const commandIndex = swimlane.commands.findIndex((cmd) => cmd.id === updatedCommand.id);
      if (commandIndex !== -1) {
        const command = swimlane.commands[commandIndex];

        // If the command has an ID, update it in the database
        if (command.id) {
          try {
            await updateCommandMutation.mutateAsync({
              id: command.id,
              data: {
                name: updatedCommand.label || updatedCommand.command,
                tool_type: updatedCommand.tool_type,
                tool_id: updatedCommand.tool_id,
                label: updatedCommand.label || "",
                command: updatedCommand.command,
                params: updatedCommand.params || {},
                advanced_parameters: updatedCommand.advanced_parameters || {},
              },
            });
          } catch (error) {
            console.error("Error updating command:", error);
          }
        }

        // Update the local state
        setSwimlanes((prevSwimlanes) => {
          return prevSwimlanes.map((lane) => {
            if (lane.id === swimlane.id) {
              const updatedCommands = [...lane.commands];
              updatedCommands[commandIndex] = updatedCommand;
              return {
                ...lane,
                commands: updatedCommands,
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
    const { source, destination, type } = result;

    if (!destination) return; // If dropped outside any droppable area, do nothing

    // Handle swimlane reordering
    if (type === "SWIMLANE") {
      const newSwimlanes = Array.from(swimlanes);
      const [reorderedSwimlane] = newSwimlanes.splice(source.index, 1);
      newSwimlanes.splice(destination.index, 0, reorderedSwimlane);

      setSwimlanes(newSwimlanes);

      try {
        const processIds = newSwimlanes
          .filter((lane) => lane.processId)
          .map((lane) => lane.processId!);

        if (processIds.length > 0) {
          await reorderProcessesMutation.mutateAsync({
            protocol_id: protocol!.id,
            process_ids: processIds,
          });
        }
        refetch();
      } catch (error) {
        console.error("Error reordering processes:", error);
      }
      return;
    }

    // Handle command reordering
    if (source.droppableId === destination.droppableId) {
      // Moving within same swimlane
      const swimlaneId = source.droppableId;
      const currentSwimlane = swimlanes.find((lane) => lane.id === swimlaneId);

      if (!currentSwimlane || !currentSwimlane.processId) {
        console.error("Swimlane or process ID not found");
        return;
      }

      // Create new commands array with the moved command
      const newCommands = [...currentSwimlane.commands];
      const [movedCommand] = newCommands.splice(source.index, 1);
      newCommands.splice(destination.index, 0, movedCommand);

      // Get command IDs in the new order (filter out any commands without IDs)
      const commandIds = newCommands.filter((cmd) => cmd.id).map((cmd) => cmd.id);

      // Update local state optimistically
      setSwimlanes((prevSwimlanes) => {
        return prevSwimlanes.map((lane) => {
          if (lane.id === swimlaneId) {
            return {
              ...lane,
              commands: newCommands,
            };
          }
          return lane;
        });
      });

      // Update backend
      if (commandIds.length > 0) {
        try {
          await reorderCommandsMutation.mutateAsync({
            process_id: currentSwimlane.processId,
            command_ids: commandIds,
          });

          // Optionally refetch to ensure consistency
          // refetch();
        } catch (error) {
          console.error("Error reordering commands:", error);
          // Revert to the previous state if there's an error
          refetch();
        }
      }
    } else {
      // Moving between swimlanes
      const sourceSwimlane = swimlanes.find((lane) => lane.id === source.droppableId);
      const destSwimlane = swimlanes.find((lane) => lane.id === destination.droppableId);

      if (
        !sourceSwimlane ||
        !destSwimlane ||
        !sourceSwimlane.processId ||
        !destSwimlane.processId
      ) {
        console.error("Source or destination swimlane not found");
        return;
      }

      const commandToMove = sourceSwimlane.commands[source.index];

      if (!commandToMove || !commandToMove.id) {
        console.error("Command not found or missing ID");
        return;
      }

      // Update local state optimistically
      setSwimlanes((prevSwimlanes) => {
        return prevSwimlanes.map((lane) => {
          if (lane.id === source.droppableId) {
            // Remove from source
            const newCommands = [...lane.commands];
            newCommands.splice(source.index, 1);
            return { ...lane, commands: newCommands };
          } else if (lane.id === destination.droppableId) {
            // Add to destination
            const newCommands = [...lane.commands];
            newCommands.splice(destination.index, 0, commandToMove);
            return { ...lane, commands: newCommands };
          }
          return lane;
        });
      });

      try {
        // First, update the command to move it to the new process
        await updateCommandMutation.mutateAsync({
          id: commandToMove.id,
          data: {
            process_id: destSwimlane.processId,
            position: destination.index + 1, // Backend expects 1-based positions
          },
        });

        const sourceCommandIds = sourceSwimlane.commands
          .filter((cmd, idx) => idx !== source.index && cmd.id)
          .map((cmd) => cmd.id);

        if (sourceCommandIds.length > 0) {
          await reorderCommandsMutation.mutateAsync({
            process_id: sourceSwimlane.processId,
            command_ids: sourceCommandIds,
          });
        }

        // Destination process: get all command IDs in new order
        const destCommands = [...destSwimlane.commands];
        destCommands.splice(destination.index, 0, commandToMove);
        const destCommandIds = destCommands.filter((cmd) => cmd.id).map((cmd) => cmd.id);

        if (destCommandIds.length > 0) {
          await reorderCommandsMutation.mutateAsync({
            process_id: destSwimlane.processId,
            command_ids: destCommandIds,
          });
        }
        refetch();
      } catch (error) {
        console.error("Error moving command between processes:", error);
        refetch();
      }
    }
  };

  // Calculate protocol stats
  const totalCommands = swimlanes.reduce((acc, lane) => acc + lane.commands.length, 0);
  const estimatedDuration = totalCommands * 3; // 3 minutes per command

  return (
    <Box
      width="100%"
      bg={bgColor}
      borderRadius="lg"
      p={6}
      color={textColor}
      borderColor={borderColor}
      borderWidth="1px"
      mx="auto"
      overflow="hidden">
      <VStack align="stretch" spacing={3} width="100%">
        <HStack justify="space-between">
          <VStack align="start" spacing={2}>
            <Heading size="lg">{protocol.name}</Heading>
            <HStack>
              <Tag colorScheme={getCategoryColor(protocol.category)}>{protocol.category}</Tag>
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
        <Divider />

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="swimlanes" type="SWIMLANE" direction="vertical">
            {(provided) => (
              <VStack
                spacing={0}
                align="stretch"
                ref={provided.innerRef}
                {...provided.droppableProps}>
                {swimlanes.map((swimlane, index) => (
                  <Draggable
                    key={swimlane.id}
                    draggableId={swimlane.id}
                    index={index}
                    isDragDisabled={!isEditing}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={{
                          ...provided.draggableProps.style,
                        }}>
                        <SwimlaneComponent
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
                          dragHandleProps={provided.dragHandleProps}
                          isDragging={snapshot.isDragging}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                {isEditing && (
                  <HStack justify="center" mt={4}>
                    <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={addSwimlane}>
                      Add Process
                    </Button>
                  </HStack>
                )}
              </VStack>
            )}
          </Droppable>
        </DragDropContext>
      </VStack>

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
        {`Are you sure you want to delete this command?`}
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