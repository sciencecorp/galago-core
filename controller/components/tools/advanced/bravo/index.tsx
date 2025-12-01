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
import { BravoSequencesPanel } from "./BravoSequencesPanel";
import { BravoSequenceModal } from "./BravoSequenceModal";
import { trpc } from "@/utils/trpc";
import { CreateDeckConfigModal } from "./CreateDeckConfigModal";
import { successToast, errorToast } from "@/components/ui/Toast";
import { BravoSequence, BravoSequenceStep } from "@/server/routers/bravo-sequence";

interface BravoAdvancedProps {
  tool: Tool;
}

export const BravoAdvanced: React.FC<BravoAdvancedProps> = ({ tool }) => {
  const headerBg = useColorModeValue("white", "gray.700");
  const bgColor = useColorModeValue("blue.500", "blue.700");
  const bgColorAlpha = useColorModeValue("blue.50", "blue.900");
  const [currentDeckPositions, setCurrentDeckPositions] = useState<any[]>([]);

  const {
    isOpen: isSequenceModalOpen,
    onOpen: onSequenceModalOpen,
    onClose: onSequenceModalClose,
  } = useDisclosure();

  const { data: configs, refetch: refetchConfigs } = trpc.bravoDeckConfig.getAll.useQuery();

  const { data: sequences, refetch: refetchSequences } =
    trpc.bravoSequence.sequence.getAll.useQuery({ toolId: tool.id });

  const createSequenceMutation = trpc.bravoSequence.sequence.create.useMutation();
  const updateSequenceMutation = trpc.bravoSequence.sequence.update.useMutation();
  const deleteSequenceMutation = trpc.bravoSequence.sequence.delete.useMutation();
  const updateStepsMutation = trpc.bravoSequence.sequence.updateSteps.useMutation();

  const handleCreateSequence = async (sequenceData: Omit<BravoSequence, "id">) => {
    try {
      await createSequenceMutation.mutateAsync(sequenceData);
      successToast("Success", "Sequence created successfully");
      refetchSequences();
    } catch (error) {
      errorToast("Error", "Failed to create sequence");
      console.error(error);
    }
  };

  const handleUpdateSequence = async (sequence: BravoSequence) => {
    try {
      // Update sequence metadata
      await updateSequenceMutation.mutateAsync({
        id: sequence.id!,
        data: {
          name: sequence.name,
          description: sequence.description,
        },
      });

      // Update steps if provided
      if (sequence.steps) {
        const stepsToUpdate = sequence.steps.map((step, index) => ({
          command_name: step.command_name,
          label: step.label,
          params: step.params,
          position: index,
          sequence_id: sequence.id!,
        }));

        await updateStepsMutation.mutateAsync({
          id: sequence.id!,
          steps: stepsToUpdate,
        });
      }

      successToast("Success", "Sequence updated successfully");
      refetchSequences();
    } catch (error) {
      errorToast("Error", "Failed to update sequence");
      console.error(error);
    }
  };

  const handleDeleteSequence = async (id: number) => {
    try {
      await deleteSequenceMutation.mutateAsync(id);
      successToast("Success", "Sequence deleted successfully");
      refetchSequences();
    } catch (error) {
      errorToast("Error", "Failed to delete sequence");
      console.error(error);
    }
  };

  const handleDeleteAllSequences = async () => {
    if (!sequences) return;

    try {
      for (const seq of sequences) {
        if (seq.id) {
          await deleteSequenceMutation.mutateAsync(seq.id);
        }
      }
      successToast("Success", "All sequences deleted successfully");
      refetchSequences();
    } catch (error) {
      errorToast("Error", "Failed to delete all sequences");
      console.error(error);
    }
  };

  const handleCloneSequence = async (sequence: BravoSequence) => {
    try {
      const { id, ...sequenceData } = sequence;
      await createSequenceMutation.mutateAsync(sequenceData);
      successToast("Success", "Sequence cloned successfully");
      refetchSequences();
    } catch (error) {
      errorToast("Error", "Failed to clone sequence");
      console.error(error);
    }
  };

  const handleRunSequence = (sequence: BravoSequence) => {
    // TODO: Implement sequence execution
    console.log("Running sequence:", sequence);
    successToast("Info", `Running sequence: ${sequence.name}`);
  };

  return (
    <Box p={6} minH="100vh">
      <VStack spacing={6} align="stretch" maxW="1600px" mx="auto">
        <Card bg={headerBg} shadow="md" borderRadius="lg">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <PageHeader
                title="Bravo Advanced Controls"
                subTitle="Agilent Bravo Deck and Sequence Management"
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
                  <StatNumber>{sequences?.length || 0}</StatNumber>
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
                  <BravoSequencesPanel
                    sequences={sequences || []}
                    onRun={handleRunSequence}
                    onDelete={handleDeleteSequence}
                    onDeleteAll={handleDeleteAllSequences}
                    onCreateNew={onSequenceModalOpen}
                    onUpdateSequence={handleUpdateSequence}
                    onCloneSequence={handleCloneSequence}
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

      <BravoSequenceModal
        config={tool}
        isOpen={isSequenceModalOpen}
        onClose={onSequenceModalClose}
        onSave={handleCreateSequence}
      />
    </Box>
  );
};
