import { Protocol } from "@/types/api";
import {
  Box,
  Button,
  HStack,
  VStack,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Th,
  Td,
  Tag,
  useColorModeValue,
  IconButton,
  Image,
  useToast,
  Divider,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  Switch,
  Input,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Center,
  Select,
  Icon
} from "@chakra-ui/react";
import {
  DeleteIcon,
  AddIcon,
  DragHandleIcon,
  EditIcon,
  ArrowForwardIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  HamburgerIcon,
} from "@chakra-ui/icons";
import { useRouter } from "next/router";
import { useState, useEffect, useMemo } from "react";
import { AddToolCommandModal } from "./AddToolCommandModal";
import CommandComponent from "./CommandComponent";
import NewProtocolRunModal from "./NewProtocolRunModal";
import { trpc } from "@/utils/trpc";
import { DeleteWithConfirmation } from "@/components/ui/Delete";
import { PiToolbox } from "react-icons/pi";
import { ParameterEditor } from "@/components/ui/ParameterEditor";
import SwimLaneCommandComponent from "../runs/list/SwimLaneCommandComponent";
import { capitalizeFirst } from "@/utils/parser";
import { VscRunBelow } from "react-icons/vsc";
import { ProtocolFormModal } from "./ProtocolFormModal"
import { MdOutlineFormatListBulleted } from "react-icons/md";
import { FaPlay } from "react-icons/fa6";
import { SaveIcon } from "@/components/ui/Icons";

interface ParameterSchema {
  type: string;
  description?: string;
  variable?: string;
}

// Move renderToolImage to be accessible to all components
const renderToolImage = (config: any) => {
  if (!config) return null;
  if (!config.image_url) return null;
  if (config.name === "Tool Box") {
    return (
      <IconButton
        aria-label="Tool Box"
        icon={<PiToolbox style={{ width: "60px", height: "60px" }} />}
        variant="ghost"
        colorScheme="teal"
        isRound
        size="lg"
      />
    );
  }
  return (
    <Image
      src={config.image_url}
      alt={config.name}
      sizes="100vw"
      style={{
        width: "60px",
        height: "60px",
        objectFit: "contain",
      }}
    />
  );
};

const handleWheel = (e: WheelEvent) => {
  const container = e.currentTarget as HTMLElement;
  if (e.deltaY !== 0) {
    e.preventDefault();
    container.scrollLeft += e.deltaY;
  }
};

// Create a custom version of SwimLaneCommandComponent for the protocol editor
const ProtocolSwimLaneCommandComponent: React.FC<{
  command: any;
  onCommandClick: (command: any) => void;
  onRunCommand: (command: any) => void;
  onDeleteCommand: () => void;
  isEditing?: boolean;
}> = ({ command, onCommandClick, onRunCommand, onDeleteCommand, isEditing = false }) => {
  const infoQuery = trpc.tool.info.useQuery({ toolId: command.commandInfo.toolId });
  const execMutation = trpc.tool.runCommand.useMutation();

  return (
    <Box
      onClick={(e) => {
        // Only trigger click if not clicking menu
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
              <Box>{renderToolImage(infoQuery.data)}</Box>
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
  const router = useRouter();
  const toast = useToast();
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
  const tableBgColor = useColorModeValue("white", "gray.700");
  const hoverBgColor = useColorModeValue("gray.50", "gray.600");
  const tableBorderColor = useColorModeValue("gray.200", "gray.600");
  const arrowColor = useColorModeValue("gray.500", "gray.400");
  const {
    data: protocol,
    isLoading,
    error,
    refetch,
  } = trpc.protocol.getById.useQuery({ id: parseInt(id) });

  const { 
    isOpen: isParametersModalOpen, 
    onOpen: openParametersModal, 
    onClose: closeParametersModal 
  } = useDisclosure();

  const updateProtocol = trpc.protocol.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Protocol updated",
        status: "success",
        duration: 3000,
      });
      refetch();
    },
  });

  const deleteProtocol = trpc.protocol.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Protocol deleted",
        status: "success",
        duration: 3000,
      });
      router.push("/protocols");
    },
  });

  const handleAddCommandAtPosition = (position: number) => {
    setAddCommandPosition(position);
    setIsAddCommandModalOpen(true);
  };

  const handleFormSave = (newParams:any) => {
    setLocalParams(newParams);
    closeParametersModal();
  }

  useEffect(() => {
    if (!protocol?.commands) return;

    const newCommands = protocol.commands.map((cmd: any) => ({
      queueId: cmd.queueId || `${Date.now()}-${Math.random()}`,
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
    setCommands((prevCommands) => {
      const updatedCommands = [...prevCommands];
      if (addCommandPosition !== null) {
        updatedCommands.splice(addCommandPosition, 0, newCommand);
      } else {
        updatedCommands.push(newCommand);
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

  const handleDeleteCommand = (index: number) => {
    setCommands((prevCommands) => {
      const updatedCommands = [...prevCommands];
      updatedCommands.splice(index, 1);
      return updatedCommands;
    });
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

    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!protocol) return;
    deleteProtocol.mutate({ id: protocol.id });
  };

  const handleRunCommand = (command: any) => {
    execMutation.mutate(command.commandInfo, {
      onSuccess: () => {
        toast({
          title: "Command executed",
          status: "success",
          duration: 3000,
        });
      },
      onError: (error) => {
        toast({
          title: "Failed to execute command",
          description: error.message,
          status: "error",
          duration: 5000,
        });
      },
    });
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
          // We still handle the params update in local state to keep UI in sync
          setLocalParams(newParams);
          
          // Refetch the protocol data to ensure we have the latest from the database
          refetch();
          
          // Close the modal
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
                    leftIcon={<MdOutlineFormatListBulleted />}
                    size="md" 
                    onClick={openParametersModal}>
                    Form 
                    </Button>
                    <IconButton 
                        aria-label="Save"
                        colorScheme="gray"
                        onClick={handleSaveChanges}>
                        <Icon as={SaveIcon} boxSize={6} />
                    </IconButton>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
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
                <Button 
                  leftIcon={<FaPlay />}
                  colorScheme="green" 
                  onClick={handleRunClick}>
                  Run
                </Button>
              </>
            )}
          </HStack>
        </HStack>

        <Text>{protocol.description}</Text>
        <Divider />

        {/* Add Parameter Schema Editor Section */}
        {/* <VStack align="stretch" spacing={4}>
          <Heading size="md">Protocol Parameters</Heading>
          {isEditing ? (
            <Box p={4} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={bgColor}>
              <VStack align="stretch" spacing={4}>
                {Object.entries(localParams || {}).map(([paramName, schemaData], index) => {
                  const schema = schemaData as ParameterSchema;
                  return (
                    <HStack key={index} spacing={4}>
                      <FormControl flex={1}>
                        <FormLabel>Parameter Name</FormLabel>
                        <Input
                          value={paramName}
                          onChange={(e) => {
                            // Create new schema preserving order
                            const newSchema = Object.entries(localParams).reduce(
                              (acc, [key, value]) => {
                                if (key === paramName) {
                                  acc[e.target.value] = value;
                                } else {
                                  acc[key] = value;
                                }
                                return acc;
                              },
                              {} as Record<string, ParameterSchema>,
                            );
                            setLocalParams(newSchema);
                          }}
                        />
                      </FormControl>
                      <FormControl flex={1}>
                        <FormLabel>Type</FormLabel>
                        <Select
                          value={schema.type}
                          onChange={(e) => {
                            const newSchema = { ...localParams };
                            newSchema[paramName] = {
                              ...schema,
                              type: e.target.value,
                            };
                            setLocalParams(newSchema);
                          }}>
                          <option value="string">String</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean</option>
                        </Select>
                      </FormControl>
                      <FormControl flex={2}>
                        <FormLabel>Description</FormLabel>
                        <Input
                          value={schema.description || ""}
                          onChange={(e) => {
                            const newSchema = { ...localParams };
                            newSchema[paramName] = {
                              ...schema,
                              description: e.target.value,
                            };
                            setLocalParams(newSchema);
                          }}
                        />
                      </FormControl>
                      <FormControl flex={1}>
                        <FormLabel>Default Value</FormLabel>
                        {schema.type === "boolean" ? (
                          <Select
                            value={String(schema.default) || ""}
                            onChange={(e) => {
                              const newSchema = { ...localParams };
                              newSchema[paramName] = {
                                ...schema,
                                default: e.target.value === "true",
                              };
                              setLocalParams(newSchema);
                            }}
                            placeholder="Select boolean value">
                            <option value="true">true</option>
                            <option value="false">false</option>
                          </Select>
                        ) : (
                          <Input
                            value={schema.default !== undefined ? schema.default : ""}
                            onChange={(e) => {
                              try {
                                let defaultValue;
                                // Type validation based on schema type
                                switch (schema.type) {
                                  case "number":
                                    defaultValue = Number(e.target.value);
                                    if (isNaN(defaultValue)) {
                                      throw new Error("Invalid number");
                                    }
                                    break;
                                  case "string":
                                    defaultValue = e.target.value;
                                    break;
                                  default:
                                    throw new Error("Invalid type");
                                }

                                const newSchema = { ...localParams };
                                newSchema[paramName] = {
                                  ...schema,
                                  default: defaultValue,
                                };
                                setLocalParams(newSchema);
                              } catch (error) {
                                // Handle invalid input
                                toast({
                                  title: "Invalid default value",
                                  description: `Please enter a valid ${schema.type}`,
                                  status: "error",
                                  duration: 3000,
                                });
                              }
                            }}
                            placeholder={`Enter ${schema.type} value`}
                          />
                        )}
                      </FormControl>
                      <IconButton
                        aria-label="Delete parameter"
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => {
                          const newSchema = { ...localParams };
                          delete newSchema[paramName];
                          setLocalParams(newSchema);
                        }}
                      />
                    </HStack>
                  );
                })}
                <IconButton
                  aria-label="Add parameter"
                  icon={<AddIcon />}
                  colorScheme="blue"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newSchema = { ...localParams };
                    const newParamName = `parameter_${Object.keys(newSchema).length + 1}`;
                    newSchema[newParamName] = {
                      type: "string",
                      description: "",
                      default: "",
                    };
                    setLocalParams(newSchema);
                  }}
                />
              </VStack>
            </Box>
          ) : (
            <Box p={4} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={bgColor}>
              {Object.entries(protocol.params || {}).length > 0 ? (
                <Table
                  variant="simple"
                  sx={{
                    th: {
                      borderColor: tableBorderColor,
                    },
                    td: {
                      borderColor: tableBorderColor,
                    },
                  }}>
                  <Thead>
                    <Tr>
                      <Th>Parameter</Th>
                      <Th>Type</Th>
                      <Th>Description</Th>
                      <Th>Default Value</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {Object.entries(protocol.params || {}).map(([paramName, schemaData], index) => {
                      const schema = schemaData as ParameterSchema;
                      return (
                        <Tr key={index}>
                          <Td>{paramName}</Td>
                          <Td>{schema.type}</Td>
                          <Td>{schema.description || "-"}</Td>
                          <Td>
                            {schema.default !== undefined ? JSON.stringify(schema.default) : "-"}
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              ) : (
                <Text color="gray.500">No parameters defined</Text>
              )}
            </Box>
          )}
        </VStack>
        <Divider /> */}

        <Box
          overflowX="auto"
          py={6}
          maxW="100%"
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
          <HStack spacing={4} align="flex-start" minW="min-content">
            {commands.length === 0 && isEditing ? (
              <Button
                leftIcon={<AddIcon />}
                colorScheme="blue"
                variant="outline"
                onClick={() => handleAddCommandAtPosition(0)}>
                Add First Command
              </Button>
            ) : (
              commands.map((command: any, index: number) => (
                <HStack key={command.queueId}>
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
                    onDeleteCommand={() => handleDeleteCommand(index)}
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
              ))
            )}
          </HStack>
        </Box>
      </VStack>

      <AddToolCommandModal
        isOpen={isAddCommandModalOpen}
        onClose={() => setIsAddCommandModalOpen(false)}
        protocolId={id}
        onCommandAdded={handleCommandAdded}
        protocolParams={protocol.params}
      />

      {isRunModalOpen && (
        <NewProtocolRunModal id={protocol.id.toString()} onClose={handleRunModalClose} />
      )}

      <Drawer isOpen={isDrawerOpen} onClose={onDrawerClose} placement="right" size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Command Details</DrawerHeader>
          <DrawerBody>
            {selectedCommand ? (
              <VStack spacing={4} align="self-start">
                <Divider />
                <Text as="b">Tool:</Text>
                <Text>{capitalizeFirst(selectedCommand.commandInfo.toolType)}</Text>
                <Divider />
                <Text as="b">Name:</Text>
                <Text>
                  {capitalizeFirst(selectedCommand.commandInfo.command.replaceAll("_", " "))}
                </Text>
                <Divider />
                <Text as="b" fontSize="18px">
                  Parameters
                </Text>
                <VStack align="stretch" spacing={2} w="100%">
                  {Object.entries(selectedCommand.commandInfo.params).map(([key, value], index) => (
                    <Box key={index}>
                      <Text as="b" flex="1">
                        {capitalizeFirst(key).replaceAll("_", " ")}:
                      </Text>
                      <Box flex="3">
                        <input
                          type="text"
                          defaultValue={value as string}
                          style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid lightgray",
                            borderRadius: "4px",
                          }}
                          onChange={(e) => {
                            if (isEditing) {
                              const newParams = {
                                ...selectedCommand.commandInfo.params,
                                [key]: e.target.value,
                              };
                              setCommands((prevCommands) =>
                                prevCommands.map((cmd) =>
                                  cmd.queueId === selectedCommand.queueId
                                    ? {
                                        ...cmd,
                                        commandInfo: {
                                          ...cmd.commandInfo,
                                          params: newParams,
                                        },
                                      }
                                    : cmd,
                                ),
                              );
                            }
                          }}
                          readOnly={!isEditing}
                        />
                      </Box>
                    </Box>
                  ))}
                </VStack>
              </VStack>
            ) : (
              <Text>No command selected.</Text>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};
