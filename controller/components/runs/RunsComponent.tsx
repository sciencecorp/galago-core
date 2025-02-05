import React, { useEffect, useState } from "react";
import { SwimLaneComponent } from "@/components/runs/list/SwimLaneComponent";
import RunQueueGanttChart from "@/components/runs/gantt/RunQueueGanttChart";
import { trpc } from "@/utils/trpc";
import {
  Box,
  Button,
  Heading,
  HStack,
  VStack,
  Text,
  Progress,
  useColorModeValue,
  Divider,
  Card,
  CardBody,
  Badge,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Icon,
} from "@chakra-ui/react";
import { DeleteWithConfirmation } from "../ui/Delete";
import { PlusSquareIcon, ChevronUpIcon, TimeIcon } from "@chakra-ui/icons";
import { QueueStatusComponent } from "./status/QueueStatuscomponent";
import { getRunAttributes, groupCommandsByRun } from "@/utils/runUtils";
import { SiGithubactions } from "react-icons/si";
import { ToolStatus } from "gen-interfaces/tools/grpc_interfaces/tool_base";

const LastUpdatedTime = () => {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString());
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return null;

  return (
    <Text fontSize="sm" color="gray.500">
      <TimeIcon mr={1} />
      Last updated: {time}
    </Text>
  );
};

export const RunsComponent: React.FC = () => {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [expandedRuns, setExpandedRuns] = useState<Set<string>>(new Set());
  const skipRunMutation = trpc.commandQueue.clearByRunId.useMutation();
  const commandsAll = trpc.commandQueue.commands.useQuery(
    { limit: 1000, offset: 0 },
    { refetchInterval: 1000 },
  );
  const commandBgColor = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.300", "gray.600");
  const hoverBgColor = useColorModeValue("gray.100", "gray.600");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const cardBg = useColorModeValue("white", "gray.700");
  const runsInfo = trpc.commandQueue.getAllRuns.useQuery(undefined, { refetchInterval: 1000 });
  const CommandInfo = trpc.commandQueue.getAll.useQuery(undefined, { refetchInterval: 1000 });
  const groupedCommands = commandsAll.data ? groupCommandsByRun(commandsAll.data) : [];
  const stateQuery = trpc.commandQueue.state.useQuery(undefined, { refetchInterval: 1000 });

  // Calculate statistics
  const totalRuns = groupedCommands.length;
  const completedRuns = groupedCommands.filter((run) =>
    run.Commands.every((cmd) => cmd.status === "COMPLETED"),
  ).length;
  const activeRuns = groupedCommands.filter((run) =>
    run.Commands.some((cmd) => cmd.status === "STARTED"),
  ).length;
  const pendingRuns = totalRuns - completedRuns - activeRuns;

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

  const handleRunButtonClick = (runId: string) => {
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
            <Box
              bg={commandBgColor}
              p={2}
              color={textColor}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="md"
              width="100%"
              transition="all 0.2s"
              _hover={{
                bg: hoverBgColor,
                transform: "translateY(-1px)",
                boxShadow: "sm",
              }}>
              <VStack spacing="2">
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
                    size="xs"
                    borderRadius="full"
                  />
                )}
                <HStack justify="space-between" width="100%" spacing={4}>
                  <Button
                    variant="ghost"
                    onClick={() => handleRunButtonClick(run.Id)}
                    color={textColor}
                    leftIcon={expandButtonIcon(run.Id)}
                    size="sm"
                    _hover={{ bg: "transparent" }}>
                    <HStack spacing={2}>
                      <Text fontSize="sm" fontWeight="medium">
                        {index + 1}.
                      </Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {runAttributes.runName}
                      </Text>
                    </HStack>
                  </Button>
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
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="md"
                mt={2}
                bg={useColorModeValue("white", "gray.800")}>
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
      <VStack spacing={6} align="stretch">
        <Card bg={cardBg} shadow="md">
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Flex justify="space-between" align="center">
                <HStack spacing={4}>
                  <Icon as={SiGithubactions} boxSize={8} color="teal.500" />
                  <VStack align="start" spacing={1}>
                    <Heading size="lg">Run Queue</Heading>
                    <HStack>
                      <Badge
                        colorScheme={stateQuery.data === ToolStatus.BUSY ? "green" : "gray"}
                        fontSize="sm">
                        {stateQuery.data === ToolStatus.BUSY ? "Running" : "Stopped"}
                      </Badge>
                      <LastUpdatedTime />
                    </HStack>
                  </VStack>
                </HStack>
                <QueueStatusComponent totalRuns={totalRuns} />
              </Flex>

              <Divider />

              <StatGroup>
                <Stat>
                  <StatLabel>Total Runs</StatLabel>
                  <StatNumber>{totalRuns}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Active</StatLabel>
                  <StatNumber color="teal.500">{activeRuns}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Completed</StatLabel>
                  <StatNumber color="green.500">{completedRuns}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Pending</StatLabel>
                  <StatNumber color="gray.500">{pendingRuns}</StatNumber>
                </Stat>
              </StatGroup>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} shadow="md">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <RunQueueGanttChart onRunClick={handleRunClick} selectedRunId={selectedRunId} />
              </Box>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} shadow="md">
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="lg">Runs List</Heading>
              {commandsAll.data && commandsAll.data.length > 0 ? (
                renderRunsList()
              ) : (
                <Heading mt="10px" size="lg" color="gray">
                  No protocols queued
                </Heading>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};
