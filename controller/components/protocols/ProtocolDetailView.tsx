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
} from "@chakra-ui/react";
import { DeleteIcon, AddIcon, EditIcon, ArrowForwardIcon, HamburgerIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
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
import { MdOutlineExitToApp } from "react-icons/md";
import { CommandDetailsDrawer } from "./CommandDetailsDrawer";
import { ParameterSchema } from "@/types";
import CommandImage from "@/components/tools/CommandImage";
import { successToast, errorToast } from "../ui/Toast";

const handleWheel = (e: WheelEvent) => {
  const container = e.currentTarget as HTMLElement;
  if (e.deltaY !== 0) {
    e.preventDefault();
    container.scrollLeft += e.deltaY;
  }
};

//TODO:
//This should be reused by the runs component, (there is already one there.)
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
        background={useColorModeValue("gray.100", "gray.700")}
        border="1px"
        borderColor="black">
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

export const ProtocolDetailView: React.FC<{ id: string }> = ({ id }) => {
  const [commands, setCommands] = useState<any[]>([]);
  const [isAddCommandModalOpen, setIsAddCommandModalOpen] = useState(false);
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [addCommandPosition, setAddCommandPosition] = useState<number | null>(null);
  const [selectedCommand, setSelectedCommand] = useState<any | null>(null);
  const [localParams, setLocalParams] = useState<Record<string, ParameterSchema>>({});
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
  const {
    isOpen: isDeleteConfirmOpen,
    onOpen: openDeleteConfirm,
    onClose: closeDeleteConfirm,
  } = useDisclosure();

  const updateProtocol = trpc.protocol.update.useMutation({
    onSuccess: () => {
      successToast("Protocol updated", "");
      refetch();
    },
  });

  const {
    isOpen: isParametersModalOpen,
    onOpen: openParametersModal,
    onClose: closeParametersModal,
  } = useDisclosure();

  const handleAddCommandAtPosition = (position: number) => {
    setAddCommandPosition(position);
    setIsAddCommandModalOpen(true);
  };

  useEffect(() => {
    if (!protocol?.commands) return;

    const newCommands = protocol.commands.map((cmd: any, index: number) => ({
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

    setCommands(newCommands);
  }, [protocol?.commands]);

  useEffect(() => {
    if (protocol?.params) {
      setLocalParams(protocol.params);
    }
  }, [protocol?.params]);

  useEffect(() => {
    return () => {
      setCommands([]);
      setIsAddCommandModalOpen(false);
    };
  }, []);

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

    setCommands((prevCommands) => {
      const updatedCommands = [...prevCommands];
      if (addCommandPosition !== null) {
        updatedCommands.splice(addCommandPosition, 0, commandWithId);
      } else {
        updatedCommands.push(commandWithId);
      }
      return updatedCommands;
    });

    setAddCommandPosition(null);
    setIsAddCommandModalOpen(false);
  };

  const handleRunClick = () => {
    setIsRunModalOpen(true);
  };

  const handleRunModalClose = () => {
    setIsRunModalOpen(false);
  };

  const handleDeleteCommand = () => {
    setCommands((prevCommands) => {
      const updatedCommands = [...prevCommands];
      updatedCommands.splice(commandToDeleteIndex, 1);
      return updatedCommands;
    });
    closeDeleteConfirm();
  };

  const handleSaveChanges = () => {
    if (!protocol) return;

    // Convert commands to the format expected by the API
    const newCommands = commands.map((cmd) => ({
      toolId: cmd.commandInfo.toolId,
      toolType: cmd.commandInfo.toolType,
      command: cmd.commandInfo.command,
      params: cmd.commandInfo.params,
      label: cmd.commandInfo.label || "",
      // Add tool info for UI
      tool_info: {
        type: cmd.commandInfo.toolType,
        image_url: cmd.commandInfo.toolType === "toolbox" ? "/tool_icons/toolbox.png" : undefined,
      },
      //Add advanced parameters for UI
      advancedParameters: cmd.commandInfo.advancedParameters || {
        skipExecutionVariable: {
          variable: null,
          value: "",
        },
        runAsynchronously: false,
      },
    }));

    updateProtocol.mutate({
      id: protocol.id,
      data: {
        name: protocol.name,
        description: protocol.description,
        params: localParams,
        commands: newCommands,
        icon: protocol.icon || "",
      },
    });
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
    setCommands((prevCommands) =>
      prevCommands.map((cmd) => (cmd.queueId === updatedCommand.queueId ? updatedCommand : cmd)),
    );
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(commands);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setCommands(items);
  };

  const renderDraggableCommands = (
    provided: DroppableProvided,
    snapshot: DroppableStateSnapshot,
  ) => {
    if (commands.length === 0 && isEditing) {
      return (
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          variant="outline"
          onClick={() => handleAddCommandAtPosition(0)}>
          Add First Command
        </Button>
      );
    }

    return (
      <HStack
        spacing={4}
        align="flex-start"
        minW="min-content"
        ref={provided.innerRef}
        {...provided.droppableProps}>
        {commands.map((command: any, index: number) => (
          <Draggable
            key={command.queueId}
            draggableId={command.queueId.toString()}
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
                    onClick={() => handleAddCommandAtPosition(index)}
                    _hover={{ bg: "blue.100" }}
                  />
                )}
                <ProtocolSwimLaneCommandComponent
                  command={command}
                  onCommandClick={(cmd) => {
                    setSelectedCommand(cmd);
                    onDrawerOpen();
                  }}
                  onRunCommand={handleRunCommand}
                  onDeleteCommand={() => {
                    setCommandToDeleteIndex(index);
                    openDeleteConfirm();
                  }}
                  isEditing={isEditing}
                />
                {isEditing ? (
                  <IconButton
                    aria-label="Add command after"
                    icon={<AddIcon />}
                    size="sm"
                    colorScheme="blue"
                    variant="ghost"
                    onClick={() => handleAddCommandAtPosition(index + 1)}
                    _hover={{ bg: "blue.100" }}
                  />
                ) : (
                  index < commands.length - 1 && (
                    <Box color={arrowColor}>
                      <ArrowForwardIcon boxSize={6} />
                    </Box>
                  )
                )}
              </HStack>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </HStack>
    );
  };

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
        <Divider />
        <Box
          overflowX="auto"
          py={6}
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
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="commands" direction="horizontal">
              {renderDraggableCommands}
            </Droppable>
          </DragDropContext>
        </Box>
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
        header={`Delete command?`}
        isOpen={isDeleteConfirmOpen}
        onClick={handleDeleteCommand}
        onClose={closeDeleteConfirm}>
        {`Are you sure you want to delete this command "${selectedCommand?.commandInfo?.command?.replaceAll("_", " ") || ""}"?`}
      </ConfirmationModal>
    </Box>
  );
};
