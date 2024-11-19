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
  Th,
  Td,
  Tag,
  useColorModeValue,
  IconButton,
  useToast,
  Divider,
} from "@chakra-ui/react";
import { DeleteIcon, AddIcon, DragHandleIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import { ProtocolManager } from "./ProtocolManager";
import { useState } from "react";
import { AddToolCommandModal } from "./AddToolCommandModal";
import CommandComponent from "./CommandComponent";

export const ProtocolDetailView: React.FC<{ id: string }> = ({ id }) => {
  const router = useRouter();
  const toast = useToast();
  const [commands, setCommands] = useState<any[]>([]);
  const [isAddCommandModalOpen, setIsAddCommandModalOpen] = useState(false);
  
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");

  const protocolManager = new ProtocolManager({
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const { data: protocol, refetch } = protocolManager.useGetProtocol(id);

  if (!protocol) {
    return null;
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
    console.log("ProtocolDetailView - received newCommand:", newCommand);
    console.log("ProtocolDetailView - before setState:", commands);
    
    setCommands(prevCommands => {
      const updatedCommands = [...prevCommands, newCommand];
      console.log("ProtocolDetailView - after setState:", updatedCommands);
      return updatedCommands;
    });
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
          <Button
            leftIcon={<AddIcon />}
            colorScheme="teal"
            onClick={() => setIsAddCommandModalOpen(true)}
          >
            Add Command
          </Button>
        </HStack>

        <Text>{protocol.description}</Text>
        <Divider />

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Tool</Th>
              <Th>Command</Th>
              <Th>Parameters</Th>
              <Th width="100px">Actions</Th>
              <Th>Created At</Th>
            </Tr>
          </Thead>
          <Tbody>
            {commands.map((command: any, index: number) => (
              <CommandComponent
                key={index}
                command={{
                  queueId: index,
                  commandInfo: {
                    toolId: command.commandInfo.toolId,
                    toolType: command.commandInfo.toolType,
                    command: command.commandInfo.command,
                    params: command.commandInfo.params,
                    label: command.commandInfo.label || ""
                  },
                  status: "CREATED",
                  estimatedDuration: 0,
                  createdAt: new Date(),
                  startedAt: new Date(),
                  completedAt: undefined,
                  failedAt: undefined,
                  skippedAt: undefined,
                  runId: undefined
                }}
              />
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
    </Box>
  );
};

