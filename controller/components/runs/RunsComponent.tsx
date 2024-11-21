import CommandComponent from "@/components/protocols/CommandComponent";
import React, { useEffect, useState } from "react";
import StatusTag from "@/components/tools/StatusTag";
import { ToolStatusCardsComponent } from "@/components/tools/ToolStatusCardsComponent";
import { SwimLaneComponent } from "@/components/runs/SwimLaneComponent";
import RunQueueGanttChart from "@/components/runs/RunQueueGanttChart";
import { trpc } from "@/utils/trpc";
import {
  Alert,
  Box,
  Button,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Heading,
  HStack,
  VStack,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalBody,
  ModalFooter,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  Text,
  Progress,
  useColorModeValue,
} from "@chakra-ui/react";

import { PlusSquareIcon, ChevronUpIcon, DeleteIcon } from "@chakra-ui/icons";
import { RunCommand, RunQueue } from "@/types";
import { QueueStatusComponent } from "./QueueStatuscomponent";
import { getRunAttributes, groupCommandsByRun } from "@/utils/runUtils";

interface GroupedCommand {
  Id: string;
  Commands: RunCommand[];
}

interface RunsComponentProps {}

interface RunQueueAttributes {
  runId: string;
  runName: string;
  commandsCount: number;
}

export const RunsComponent: React.FC<RunsComponentProps> = () => {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [expandedParams, setExpandedParams] = useState<boolean>(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const skipRunMutation = trpc.commandQueue.clearByRunId.useMutation();
  const [selectedDeleteRun, setSelectedDeleteRun] = useState<string>("");
  const commandsAll = trpc.commandQueue.commands.useQuery(
    { limit: 1000, offset: 0 },
    { refetchInterval: 1000 },
  );
  const commandBgColor = useColorModeValue("gray.100", "gray.700");
  const runsInfo = trpc.commandQueue.getAllRuns.useQuery(undefined, { refetchInterval: 1000 });
  const CommandInfo = trpc.commandQueue.getAll.useQuery(undefined, { refetchInterval: 1000 });
  const groupedCommands = commandsAll.data ? groupCommandsByRun(commandsAll.data) : [];

  function expandButtonIcon(runId: string) {
    return expandedRunId === runId ? <ChevronUpIcon /> : <PlusSquareIcon />;
  }

  const handleConfirmDelete = (runId: string) => {
    skipRunMutation.mutate(runId);
    onClose();
  };

  const handleRunButtonClick = (runId: string | null) => {
    setExpandedRunId((prevId) => (prevId === runId ? null : runId));
  };

  const handleDeleteButtonClick = (runId: string) => {
    setSelectedDeleteRun(runId);
    onOpen();
  };

  const handleRunClick = (runId: string) => {
    setSelectedRunId((prevId) => (prevId === runId ? null : runId));
    setExpandedRunId((prevId) => (prevId === runId ? null : runId));
  };

  const handleParamExpand = (expanded: boolean) => {
    setExpandedParams(expanded);
  };

  const renderRunsList = () => {
    return groupedCommands.map((run, index) => {
      const runAttributes = getRunAttributes(
        runsInfo.data?.find((r) => r.id === run.Id),
        CommandInfo.data?.find((r) => r.runId === run.Id),
      );
      return (
        <VStack align="left" key={index}>
          <Modal isOpen={isOpen} onClose={onClose} isCentered={true}>
            <ModalContent>
              <ModalHeader>Confirm Action</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Text>Are you sure you want to delete this run?</Text>
              </ModalBody>
              <ModalFooter>
                <Button
                  colorScheme="blue"
                  mr={3}
                  onClick={() => handleConfirmDelete(selectedDeleteRun)}>
                  Accept
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
          <Box
            left="0"
            right="0"
            height={expandedRunId !== run.Id ? "auto" : "250px"}
            position="relative"
            maxWidth="100%">
            <Box position="relative" bg={commandBgColor} w="100%" p={1} color="black" border="1px">
              <VStack spacing="0">
                {runAttributes.commandsCount - run.Commands.length > 0 && (
                  <Progress
                    width="100%"
                    hasStripe
                    isAnimated
                    value={
                      ((runAttributes.commandsCount - run.Commands.length) /
                        runAttributes.commandsCount) *
                      100
                    }
                    colorScheme="blue"
                    size="md"
                  />
                )}
                <HStack width="100%">
                  <Box width="90%">
                    <Button
                      padding="2px"
                      variant="ghost"
                      onClick={() => handleRunButtonClick(run.Id)}
                      color={useColorModeValue("gray.800", "white")}>
                      {expandButtonIcon(run.Id)}
                      <Heading size="md" padding="4px" color={useColorModeValue("gray.800", "white")}>
                        {runAttributes.runName}
                      </Heading>
                    </Button>
                  </Box>
                  <Box width="10%" textAlign="right">
                    <IconButton
                      onClick={() => handleDeleteButtonClick(run.Id)}
                      variant="ghost"
                      aria-label="Delete Run"
                      size="lg"
                      icon={<DeleteIcon />}
                      color={useColorModeValue("gray.800", "white")}
                    />
                  </Box>
                </HStack>
              </VStack>
            </Box>
            {expandedRunId === run.Id && (
              <Box 
                ml={2} 
                position="relative" 
                minHeight={expandedParams ? "800px" : "500px"}
                overflow="visible"
                zIndex={2}
                mb={expandedParams ? 32 : 16}
              >
                <SwimLaneComponent 
                  runCommands={run.Commands}
                  onParamExpand={handleParamExpand}
                />
              </Box>
            )}
          </Box>
        </VStack>
      );
    });
  };

  return (
    <Box width="95%">
      <QueueStatusComponent totalRuns={groupedCommands.length} />

      <Tabs mt={4}>
        <TabList>
          <Tab>Gantt Chart</Tab>
          <Tab>Runs List</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <RunQueueGanttChart onRunClick={handleRunClick} selectedRunId={selectedRunId} />
          </TabPanel>
          <TabPanel>
            {commandsAll.data && commandsAll.data.length > 0 ? (
              renderRunsList()
            ) : (
              <Heading mt="10px" size="lg" color="gray">
                No protocols queued
              </Heading>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};
