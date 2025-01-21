import React, { useEffect, useState } from "react";
import { SwimLaneComponent } from "@/components/runs/SwimLaneComponent";
import RunQueueGanttChart from "@/components/runs/RunQueueGanttChart";
import { trpc } from "@/utils/trpc";
import {
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
  useDisclosure,
  Text,
  Progress,
  useColorModeValue,
} from "@chakra-ui/react";
import { DeleteWithConfirmation } from "../UI/Delete";
import { PlusSquareIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { QueueStatusComponent } from "./QueueStatuscomponent";
import { getRunAttributes, groupCommandsByRun } from "@/utils/runUtils";

export const RunsComponent: React.FC = () => {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [expandedRuns, setExpandedRuns] = useState<Set<string>>(new Set());
  const skipRunMutation = trpc.commandQueue.clearByRunId.useMutation();
  const commandsAll = trpc.commandQueue.commands.useQuery(
    { limit: 1000, offset: 0 },
    { refetchInterval: 1000 },
  );
  const commandBgColor = useColorModeValue("gray.100", "gray.700");
  const borderColor = useColorModeValue("gray.800", "white");
  const runsInfo = trpc.commandQueue.getAllRuns.useQuery(undefined, { refetchInterval: 1000 });
  const CommandInfo = trpc.commandQueue.getAll.useQuery(undefined, { refetchInterval: 1000 });
  const groupedCommands = commandsAll.data ? groupCommandsByRun(commandsAll.data) : [];

  useEffect(() => {
    if (commandsAll.data && commandsAll.data.length > 0 && !selectedRunId) {
      const firstRunId = commandsAll.data[0].runId;
      setSelectedRunId(firstRunId);
      setExpandedRuns(new Set([firstRunId]));
    }
  }, [commandsAll.data]);

  function expandButtonIcon(runId: string) {
    return expandedRuns.has(runId) ? <ChevronUpIcon /> : <PlusSquareIcon />;
  }

  const handleConfirmDelete = (runId: string) => {
    skipRunMutation.mutate(runId);
  };

  const handleRunButtonClick = (runId: string | null) => {
    if (!runId) return;
    setExpandedRuns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(runId)) {
        newSet.delete(runId);
      } else {
        newSet.add(runId);
      }
      return newSet;
    });
  };

  const handleRunClick = (runId: string) => {
    setSelectedRunId((prevId) => (prevId === runId ? null : runId));
    setExpandedRuns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(runId)) {
        newSet.delete(runId);
      } else {
        newSet.add(runId);
      }
      return newSet;
    });
  };

  const renderRunsList = () => {
    return groupedCommands.map((run, index) => {
      const runAttributes = getRunAttributes(
        runsInfo.data?.find((r) => r.id === run.Id),
        CommandInfo.data?.find((r) => r.runId === run.Id),
      );
      return (
        <VStack align="left" key={index} width="100%">
          <Box width="100%">
            <Box bg={commandBgColor} p={1} color="black" border="1px" width="100%">
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
                <HStack mb={2} justify="space-between" width="100%">
                  <Box>
                    <Button
                      p={1}
                      variant="ghost"
                      onClick={() => handleRunButtonClick(run.Id)}
                      color={borderColor}
                      leftIcon={expandButtonIcon(run.Id)}>
                      <Heading size="sm" padding="4px">
                        <HStack>
                          <Text as="b">{index + 1}.</Text>
                          <Text>{runAttributes.runName}</Text>
                        </HStack>
                      </Heading>
                    </Button>
                  </Box>
                  <DeleteWithConfirmation
                    onDelete={() => handleConfirmDelete(run.Id)}
                    label="Run"
                  />
                </HStack>
              </VStack>
            </Box>
            {expandedRuns.has(run.Id) && (
              <Box
                maxWidth="100%"
                overflowX="auto"
                overflowY="hidden"
                // zIndex={1}
                borderWidth="1px"
                borderColor="gray.200"
                _dark={{ borderColor: "gray.600" }}>
                <SwimLaneComponent runCommands={run.Commands} />
              </Box>
            )}
          </Box>
        </VStack>
      );
    });
  };

  return (
    <Box width="100%">
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
          <TabPanel width="100%">
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
