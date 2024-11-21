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
  useToast,
  Divider,
} from "@chakra-ui/react";
import { DeleteIcon, AddIcon, DragHandleIcon, EditIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import { ProtocolManager } from "./ProtocolManager";
import { useState, useEffect, useMemo } from "react";
import { AddToolCommandModal } from "./AddToolCommandModal";
import CommandComponent from "./CommandComponent";
import NewProtocolRunModal from "./NewProtocolRunModal";

export const ProtocolDetailView: React.FC<{ id: string }> = ({ id }) => {
  const router = useRouter();
  const toast = useToast();
  const [commands, setCommands] = useState<any[]>([]);
  const [isAddCommandModalOpen, setIsAddCommandModalOpen] = useState(false);
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");

  const protocolManager = useMemo(() => {
    return new ProtocolManager({
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    });
  }, [toast]);

  const { data: protocol, isLoading, isError } = useMemo(() => {
    return protocolManager.useGetProtocol(id);
  }, [protocolManager, id]);

  useEffect(() => {
    if (!protocol?.commands) return;
    
    const newCommands = protocol.commands.map((cmd: any) => ({
      queueId: cmd.queueId || `${Date.now()}-${Math.random()}`,
      commandInfo: {
        toolId: cmd.toolId || cmd.commandInfo?.toolId,
        toolType: cmd.toolType || cmd.commandInfo?.toolType,
        command: cmd.command || cmd.commandInfo?.command,
        params: cmd.params || cmd.commandInfo?.params,
        label: cmd.label || cmd.commandInfo?.label || ""
      },
      status: "CREATED",
      estimatedDuration: 0,
      createdAt: new Date(),
      startedAt: new Date(),
      completedAt: undefined,
      failedAt: undefined,
      skippedAt: undefined,
      runId: undefined
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
    setCommands(prevCommands => {
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

  return (
    <Box bg={bgColor} borderRadius="lg" p={6} color={textColor} borderColor={borderColor} borderWidth="1px">
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between">
          <VStack align="start" spacing={2}>
            <Heading size="lg">{protocol.name}</Heading>
            <HStack>
              <Tag colorScheme={getCategoryColor(protocol.category)}>
                {protocol.category}
              </Tag>
              <Text color="gray.500">{protocol.workcell}</Text>
            </HStack>
          </VStack>
          <HStack>
            <Button
              leftIcon={<EditIcon />}
              colorScheme="teal"
              onClick={() => setIsAddCommandModalOpen(true)}
            >
              Edit Protocol
            </Button>
            <Button
              colorScheme="green"
              onClick={handleRunClick}
            >
              Run Protocol
            </Button>
          </HStack>
        </HStack>

        <Text>{protocol.description}</Text>
        <Divider />

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Tool</Th>
              <Th>Command</Th>
              <Th>Parameters</Th>
            </Tr>
          </Thead>
          <Tbody>
            {commands.map((command: any, index: number) => (
              <Tr key={index}>
                <Td>
                  <Tag>{command.commandInfo.toolType}</Tag>
                </Td>
                <Td>
                  <Tag>{command.commandInfo.command}</Tag>
                </Td>
                <Td>
                  <Box
                    as="pre"
                    style={{
                      maxHeight: "200px",
                      overflowY: "auto",
                      minWidth: "200px",
                      maxWidth: "200px",
                      overflowX: "auto",
                      fontSize: "0.8em",
                      whiteSpace: "pre-wrap",
                      wordWrap: "break-word",
                      padding: "4px",
                      textAlign: "left"
                    }}>
                    {JSON.stringify(command.commandInfo.params, null, 2)}
                  </Box>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </VStack>

      <AddToolCommandModal
        isOpen={isAddCommandModalOpen}
        onClose={() => setIsAddCommandModalOpen(false)}
        protocolId={id}
        onCommandAdded={handleCommandAdded}
      />

      {isRunModalOpen && (
        <NewProtocolRunModal 
          id={id} 
          onClose={handleRunModalClose}
        />
      )}
    </Box>
  );
};

