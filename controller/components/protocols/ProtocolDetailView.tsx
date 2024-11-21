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
} from "@chakra-ui/react";
import { DeleteIcon, AddIcon, DragHandleIcon, EditIcon, ArrowForwardIcon, ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import { ProtocolManager } from "./ProtocolManager";
import { useState, useEffect, useMemo } from "react";
import { AddToolCommandModal } from "./AddToolCommandModal";
import CommandComponent from "./CommandComponent";
import NewProtocolRunModal from "./NewProtocolRunModal";
import { trpc } from "@/utils/trpc";
import { DeleteWithConfirmation } from "@/components/UI/Delete";
import { PiToolbox } from "react-icons/pi";
import { ParameterEditor } from "@/components/UI/ParameterEditor";


const CommandBox: React.FC<{
  command: any;
  isEditing: boolean;
  onParamChange: (newParams: Record<string, any>) => void;
  onDelete: () => void;
  isLast: boolean;
}> = ({ command, isEditing, onParamChange, onDelete, isLast }) => {
  const boxBg = useColorModeValue("white", "gray.700");
  const boxBorder = useColorModeValue("gray.200", "gray.600");
  const arrowColor = useColorModeValue("gray.500", "gray.400");
  const infoQuery = trpc.tool.info.useQuery({ toolId: command.commandInfo.toolId });

  const formatToolId = (toolId: string) => {
    return toolId
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const renderToolImage = (config: any) => {
    if (!config) return null;
    if (!config.image_url) return null;
    if (config.name === "Tool Box") {
      return (
        <IconButton
          aria-label="Tool Box"
          icon={<PiToolbox style={{ width: "100%", height: "100%" }} />}
          variant="ghost"
          colorScheme="teal"
          isRound
          size="md"
        />
      );
    }
    return (
      <Image
        src={config.image_url}
        alt={config.name}
        sizes="100vw"
        style={{
          width: "40px",
          height: "40px",
          objectFit: "contain"
        }}
      />
    );
  };

  return (
    <HStack>
      <Box
        borderWidth="1px"
        borderRadius="lg"
        p={6}
        minW="250px"
        maxW="250px"
        bg={boxBg}
        borderColor={boxBorder}
        shadow="sm"
        position="relative">
        <VStack align="stretch" spacing={4}>
          <Text fontWeight="bold" fontSize="md">
            {formatToolId(command.commandInfo.toolId)}
          </Text>
          <Tag>{command.commandInfo.command}</Tag>
          <ParameterEditor
            params={command.commandInfo.params}
            isEditing={isEditing}
            onParamChange={onParamChange}
          />
          {isEditing && (
            <Box 
              position="absolute"
              top="1"
              right="3"
              zIndex="2"
            >
              <DeleteWithConfirmation
                label="command"
                onDelete={onDelete}
                variant="icon"
                size="sm"
              />
            </Box>
          )}
        </VStack>
        <Box 
          position="absolute" 
          bottom="4"
          right="4"
          opacity="0.9"
          zIndex="1"
        >
          {renderToolImage(infoQuery.data)}
        </Box>
      </Box>
      {!isLast && (
        <Box color={arrowColor}>
          <ArrowForwardIcon boxSize={6} />
        </Box>
      )}
    </HStack>
  );
};

const handleWheel = (e: WheelEvent) => {
  const container = e.currentTarget as HTMLElement;
  if (e.deltaY !== 0) {
    e.preventDefault();
    container.scrollLeft += e.deltaY;
  }
};

export const ProtocolDetailView: React.FC<{ id: string }> = ({ id }) => {
  const router = useRouter();
  const toast = useToast();
  const [commands, setCommands] = useState<any[]>([]);
  const [isAddCommandModalOpen, setIsAddCommandModalOpen] = useState(false);
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");

  const { data: protocol, isLoading, isError } = trpc.protocol.get.useQuery({ id });

  useEffect(() => {
    if (!protocol?.commands) return;

    const newCommands = protocol.commands.map((cmd: any) => ({
      queueId: cmd.queueId || `${Date.now()}-${Math.random()}`,
      commandInfo: {
        toolId: cmd.toolId || cmd.commandInfo?.toolId,
        toolType: cmd.toolType || cmd.commandInfo?.toolType,
        command: cmd.command || cmd.commandInfo?.command,
        params: cmd.params || cmd.commandInfo?.params,
        label: cmd.label || cmd.commandInfo?.label || "",
      },
      status: "CREATED",
      estimatedDuration: 0,
      createdAt: new Date(),
      startedAt: new Date(),
      completedAt: undefined,
      failedAt: undefined,
      skippedAt: undefined,
      runId: undefined,
    }));

    setCommands(newCommands);
  }, [protocol?.commands]);

  useEffect(() => {
    return () => {
      setCommands([]);
      setIsAddCommandModalOpen(false);
    };
  }, []);

  if (isLoading) {
    return <Spinner size="xl" />;
  }

  if (isError || !protocol) {
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
      const updatedCommands = [...prevCommands, newCommand];
      return updatedCommands;
    });
  };

  const handleRunClick = () => {
    setIsRunModalOpen(true);
  };

  const handleRunModalClose = () => {
    setIsRunModalOpen(false);
  };

  const handleDeleteCommand = (index: number) => {
    console.log("Delete command at index:", index);
  };

  const handleSaveChanges = () => {
    console.log("Save changes");
    setIsEditing(false);
  };

  return (
    <Box
      bg={bgColor}
      borderRadius="lg"
      p={6}
      color={textColor}
      borderColor={borderColor}
      borderWidth="1px"
      maxW="container.xl"
      mx="auto"
      overflow="hidden">
      <VStack align="stretch" spacing={6}>
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
                  leftIcon={<AddIcon />}
                  colorScheme="blue"
                  onClick={() => setIsAddCommandModalOpen(true)}>
                  Add Command
                </Button>
                <Button colorScheme="green" onClick={handleSaveChanges}>
                  Save Changes
                </Button>
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
                  Edit Protocol
                </Button>
                <Button colorScheme="green" onClick={handleRunClick}>
                  Run Protocol
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
          maxW="100%"
          onWheel={(e: any) => handleWheel(e)}
          css={{
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: useColorModeValue('gray.100', 'gray.900'),
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: useColorModeValue('gray.300', 'gray.600'),
              borderRadius: '4px',
              '&:hover': {
                background: useColorModeValue('gray.400', 'gray.500'),
              },
            },
          }}>
                    <HStack spacing={4} align="flex-start" minW="min-content">
            {commands.map((command: any, index: number) => (
              <CommandBox
                key={command.queueId}
                command={command}
                isEditing={isEditing}
                isLast={index === commands.length - 1}
                onParamChange={(newParams) => {
                  setCommands((prevCommands) => {
                    const updatedCommands = prevCommands.map((cmd, i) => {
                      if (i === index) {
                        return {
                          ...cmd,
                          commandInfo: {
                            ...cmd.commandInfo,
                            params: newParams,
                          },
                        };
                      }
                      return cmd;
                    });
                    return updatedCommands;
                  });
                }}
                onDelete={() => handleDeleteCommand(index)}
              />
            ))}
          </HStack>
        </Box>
      </VStack>

      <AddToolCommandModal
        isOpen={isAddCommandModalOpen}
        onClose={() => setIsAddCommandModalOpen(false)}
        protocolId={id}
        onCommandAdded={handleCommandAdded}
      />

      {isRunModalOpen && <NewProtocolRunModal id={id} onClose={handleRunModalClose} />}
    </Box>
  );
};
