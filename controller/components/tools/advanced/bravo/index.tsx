import React, { useState } from "react";
import {
  Box,
  VStack,
  Card,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  useColorModeValue,
  Divider,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  Image,
  useDisclosure,
} from "@chakra-ui/react";
import { Tool } from "@/types/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { FaRegListAlt } from "react-icons/fa";
import { DeckConfigEditor } from "./DeckConfigEditor";
import { BravoProtocolsPanel } from "./BravoProtocolsPanel";
import { BravoProtocolModal } from "./BravoProtocolModal";
import { trpc } from "@/utils/trpc";
import { CreateDeckConfigModal } from "./CreateDeckConfigModal";
import { successToast, errorToast } from "@/components/ui/Toast";
import { BravoProtocol, BravoProtocolCommand } from "@/server/schemas/bravo";

interface BravoAdvancedProps {
  tool: Tool;
}

export const BravoAdvanced: React.FC<BravoAdvancedProps> = ({ tool }) => {
  const headerBg = useColorModeValue("white", "gray.700");
  const bgColor = useColorModeValue("blue.500", "blue.700");
  const bgColorAlpha = useColorModeValue("blue.50", "blue.900");
  const [currentDeckPositions, setCurrentDeckPositions] = useState<any[]>([]);

  const {
    isOpen: isProtocolModalOpen,
    onOpen: onProtocolModalOpen,
    onClose: onProtocolModalClose,
  } = useDisclosure();

  const { data: configs, refetch: refetchConfigs } = trpc.bravoDeckConfig.getAll.useQuery();

  const { data: protocols, refetch: refetchProtocols } =
    trpc.bravoProtocol.protocol.getAll.useQuery({ toolId: tool.id });

  const createProtocolMutation = trpc.bravoProtocol.protocol.create.useMutation();
  const updateProtocolMutation = trpc.bravoProtocol.protocol.update.useMutation();
  const deleteProtocolMutation = trpc.bravoProtocol.protocol.delete.useMutation();
  const updateCommandsMutation = trpc.bravoProtocol.protocol.updateCommands.useMutation();

  const handleCreateProtocol = async (protocolData: Omit<BravoProtocol, "id">) => {
    try {
      await createProtocolMutation.mutateAsync(protocolData);
      successToast("Success", "Protocol created successfully");
      refetchProtocols();
    } catch (error) {
      errorToast("Error", "Failed to create protocol");
      console.error(error);
    }
  };

  const handleUpdateProtocol = async (protocol: BravoProtocol) => {
    try {
      // Update protocol metadata
      await updateProtocolMutation.mutateAsync({
        id: protocol.id!,
        data: {
          name: protocol.name,
          description: protocol.description,
        },
      });

      // Update commands if provided
      if (protocol.commands) {
        const commandsToUpdate = protocol.commands.map((command, index) => ({
          command_type: command.command_type,
          label: command.label,
          params: command.params,
          position: index,
          protocol_id: protocol.id!,
          parent_command_id: command.parent_command_id,
        }));

        await updateCommandsMutation.mutateAsync({
          id: protocol.id!,
          commands: commandsToUpdate,
        });
      }

      successToast("Success", "Protocol updated successfully");
      refetchProtocols();
    } catch (error) {
      errorToast("Error", "Failed to update protocol");
      console.error(error);
    }
  };

  const handleDeleteProtocol = async (id: number) => {
    try {
      await deleteProtocolMutation.mutateAsync(id);
      successToast("Success", "Protocol deleted successfully");
      refetchProtocols();
    } catch (error) {
      errorToast("Error", "Failed to delete protocol");
      console.error(error);
    }
  };

  const handleDeleteAllProtocols = async () => {
    if (!protocols) return;

    try {
      for (const protocol of protocols) {
        if (protocol.id) {
          await deleteProtocolMutation.mutateAsync(protocol.id);
        }
      }
      successToast("Success", "All protocols deleted successfully");
      refetchProtocols();
    } catch (error) {
      errorToast("Error", "Failed to delete all protocols");
      console.error(error);
    }
  };

  const handleCloneProtocol = async (protocol: BravoProtocol) => {
    try {
      const { id, ...protocolData } = protocol;
      await createProtocolMutation.mutateAsync(protocolData);
      successToast("Success", "Protocol cloned successfully");
      refetchProtocols();
    } catch (error) {
      errorToast("Error", "Failed to clone protocol");
      console.error(error);
    }
  };

  const handleRunProtocol = (protocol: BravoProtocol) => {
    // TODO: Implement protocol execution
    console.log("Running protocol:", protocol);
    successToast("Info", `Running protocol: ${protocol.name}`);
  };

  return (
    <Box p={6} minH="100vh">
      <VStack spacing={6} align="stretch" maxW="1600px" mx="auto">
        <Card bg={headerBg} shadow="md" borderRadius="lg">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <PageHeader
                title="Bravo Advanced Controls"
                subTitle="Agilent Bravo Deck and Protocol Management"
                titleIcon={<Image src="/tool_icons/bravo.png" alt="Bravo Logo" boxSize={12} />}
                mainButton={
                  <CreateDeckConfigModal
                    currentDeckPositions={currentDeckPositions}
                    onConfigCreated={() => {
                      refetchConfigs();
                    }}
                  />
                }
              />
              <Divider />
              <StatGroup>
                <Stat>
                  <StatLabel>Total Deck Configs</StatLabel>
                  <StatNumber>{configs?.length || 0}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Total Protocols</StatLabel>
                  <StatNumber>{protocols?.length || 0}</StatNumber>
                </Stat>
              </StatGroup>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Tabs colorScheme="teal" variant="enclosed">
              <TabList>
                <Tab>Deck Configurations</Tab>
                <Tab>Protocol Builder</Tab>
              </TabList>

              <TabPanels>
                <TabPanel px={0}>
                  <DeckConfigEditor onDeckPositionsChange={setCurrentDeckPositions} />
                </TabPanel>
                <TabPanel px={0}>
                  <BravoProtocolsPanel
                    protocols={protocols || []}
                    onRun={handleRunProtocol}
                    onDelete={handleDeleteProtocol}
                    onDeleteAll={handleDeleteAllProtocols}
                    onCreateNew={onProtocolModalOpen}
                    onUpdateProtocol={handleUpdateProtocol}
                    onCloneProtocol={handleCloneProtocol}
                    bgColor={bgColor}
                    bgColorAlpha={bgColorAlpha}
                    config={tool}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      </VStack>

      <BravoProtocolModal
        config={tool}
        isOpen={isProtocolModalOpen}
        onClose={onProtocolModalClose}
        onSave={handleCreateProtocol}
      />
    </Box>
  );
};
