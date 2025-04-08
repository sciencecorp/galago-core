import React, { useEffect, useState, useMemo } from "react";
import { SwimLaneComponent } from "@/components/runs/list/SwimLaneComponent";
import RunQueueGanttChart from "@/components/runs/gantt/RunQueueGanttChart";
import { trpc } from "@/utils/trpc";
import {
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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  CloseButton,
} from "@chakra-ui/react";
import { DeleteWithConfirmation } from "../ui/Delete";
import { PlusSquareIcon, ChevronUpIcon, TimeIcon } from "@chakra-ui/icons";
import { QueueStatusComponent } from "./status/QueueStatuscomponent";
import { getRunAttributes, groupCommandsByRun } from "@/utils/runUtils";
import { SiGithubactions } from "react-icons/si";
import { ToolStatus } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import { BsInbox } from "react-icons/bs";
import { MessageModal } from "./MessageModal";
import { TimerModal } from "./TimerModal";
import { StopRunModal } from "./StopRunModal";

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
  const [runAttributesMap, setRunAttributesMap] = useState<Record<string, any>>({});
  const [isErrorVisible, setIsErrorVisible] = useState(true);

  // Unified message state
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [messageData, setMessageData] = useState<{
    type: "pause" | "message" | "timer" | "stop_run";
    message: string;
    title?: string;
    pausedAt?: number;
    timerDuration?: number;
    timerEndTime?: number;
  }>({
    type: "pause",
    message: "Run is paused. Click Continue to resume.",
    title: "Message",
    pausedAt: undefined,
  });

  const stopQueueMutation = trpc.commandQueue.stop.useMutation();
  const clearAllMutation = trpc.commandQueue.clearAll.useMutation();
  const skipRunMutation = trpc.commandQueue.clearByRunId.useMutation();
  // Resume mutation
  const resumeMutation = trpc.commandQueue.resume.useMutation();

  const commandsAll = trpc.commandQueue.commands.useQuery(
    { limit: 1000, offset: 0 },
    { refetchInterval: 1000 },
  );

  // Query for waiting-for-input status
  const isWaitingForInputQuery = trpc.commandQueue.isWaitingForInput.useQuery(undefined, {
    refetchInterval: 1000,
  });

  // Query for current message data
  const currentMessageQuery = trpc.commandQueue.currentMessage.useQuery(undefined, {
    refetchInterval: 1000,
  });

  const commandBgColor = useColorModeValue("gray.50", "gray.800");
  const borderColor = useColorModeValue("gray.300", "gray.600");
  const hoverBgColor = useColorModeValue("gray.100", "gray.600");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const cardBg = useColorModeValue("white", "gray.700");
  const expandedRunBg = useColorModeValue("gray.50", "gray.800");
  const runsInfo = trpc.commandQueue.getAllRuns.useQuery(undefined, { refetchInterval: 1000 });
  const CommandInfo = trpc.commandQueue.getAll.useQuery(undefined, { refetchInterval: 1000 });
  const groupedCommands = useMemo(
    () => (commandsAll.data ? groupCommandsByRun(commandsAll.data) : []),
    [commandsAll.data],
  );
  const stateQuery = trpc.commandQueue.state.useQuery(undefined, { refetchInterval: 1000 });
  const queue = trpc.commandQueue;
  const getError = queue.getError.useQuery(undefined, {
    refetchInterval: 1500,
    select: (data) => data || null,
    retry: false,
  });

  useEffect(() => {
    if (isWaitingForInputQuery.data !== undefined) {
      setIsModalOpen(isWaitingForInputQuery.data);
    }

    if (currentMessageQuery.data) {
      // Create a compatible object that TypeScript will accept
      const newMessageData = {
        type: currentMessageQuery.data.type,
        message: currentMessageQuery.data.message,
        // Only include these properties if they exist
        ...(currentMessageQuery.data.title ? { title: currentMessageQuery.data.title } : {}),
        ...(currentMessageQuery.data.pausedAt
          ? { pausedAt: currentMessageQuery.data.pausedAt }
          : {}),
        ...(currentMessageQuery.data.timerDuration
          ? { timerDuration: currentMessageQuery.data.timerDuration }
          : {}),
        ...(currentMessageQuery.data.timerEndTime
          ? { timerEndTime: currentMessageQuery.data.timerEndTime }
          : {}),
      };

      setMessageData(newMessageData);
    }
  }, [isWaitingForInputQuery.data, currentMessageQuery.data]);

  // Handle resume button click
  const handleResume = () => {
    resumeMutation.mutate();
  };

  const handleRunStop = () => {
    // First stop the queue (which now also resets waiting state)
    stopQueueMutation.mutate();

    // Then clear all commands
    clearAllMutation.mutate();

    // Update local state
    setIsModalOpen(false);

    // Reset message data to default state
    setMessageData({
      type: "pause",
      message: "Run is paused. Click Continue to resume.",
      title: "Message",
      pausedAt: undefined,
    });
  };

  const ErrorBanner = () => {
    if (!getError.data && !getError.error) return null;
    if (stateQuery.data === ToolStatus.FAILED && isErrorVisible) {
      return (
        <Alert status="error" variant="left-accent" mb={2}>
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>An error occurred while executing the command.</AlertDescription>
            {getError.data && <AlertDescription>{getError.data.toString()}</AlertDescription>}
          </Box>
          <CloseButton onClick={() => setIsErrorVisible(false)} />
        </Alert>
      );
    } else {
      return null;
    }
  };

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
      if (firstRunId !== selectedRunId) {
        setSelectedRunId(firstRunId);
        setExpandedRuns(new Set([firstRunId]));
      }
    }
  }, [commandsAll.data, selectedRunId]);

  useEffect(() => {
    const updateRunAttributes = async () => {
      const newAttributes: Record<string, any> = {};
      for (const run of groupedCommands) {
        const runInfo = runsInfo.data?.find((r) => r.id === run.Id);
        const cmdInfo = CommandInfo.data?.find((r) => r.runId === run.Id);

        // Only update if we don't have attributes for this run or if the data has changed
        if (!runAttributesMap[run.Id] || runAttributesMap[run.Id].status !== cmdInfo?.status) {
          const attributes = await getRunAttributes(runInfo, cmdInfo);
          newAttributes[run.Id] = attributes;
        } else {
          newAttributes[run.Id] = runAttributesMap[run.Id];
        }
      }
      setRunAttributesMap(newAttributes);
    };

    updateRunAttributes();
  }, [runsInfo.data, CommandInfo.data]);

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
      const runAttributes = runAttributesMap[run.Id] || {
        runId: "",
        runName: "",
        commandsCount: 0,
        params: {},
        status: "UNKNOWN",
        createdAt: "",
        completedAt: "",
        startedAt: "",
      };

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
                bg={expandedRunBg}>
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
      {messageData.type === "timer" && (
        <TimerModal
          isOpen={isModalOpen && messageData.type === "timer"}
          messageData={{
            message: messageData.message,
            pausedAt: messageData.pausedAt,
            timerDuration: messageData.timerDuration,
            timerEndTime: messageData.timerEndTime,
          }}
          onSkip={handleResume}
        />
      )}
      <MessageModal
        isOpen={isModalOpen && messageData.type != "timer"}
        messageData={messageData}
        onContinue={handleResume}
      />

      <StopRunModal
        isOpen={isModalOpen && messageData.type === "stop_run"}
        messageData={messageData}
        onClose={handleResume}
        onConfirm={handleRunStop}
      />

      <ErrorBanner />
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
                        colorScheme={
                          isModalOpen
                            ? messageData.type === "pause"
                              ? "orange"
                              : "blue"
                            : stateQuery.data === ToolStatus.BUSY
                              ? "green"
                              : "gray"
                        }
                        fontSize="sm">
                        {isModalOpen
                          ? messageData.type === "pause"
                            ? "Paused"
                            : "Waiting"
                          : stateQuery.data === ToolStatus.BUSY
                            ? "Running"
                            : "Stopped"}
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
                <VStack spacing={3} py={4}>
                  <Icon as={BsInbox} boxSize={8} color="gray.400" />
                  <Heading size="md" color="gray.400" fontWeight="medium">
                    Queue is Empty
                  </Heading>
                  <Text color="gray.500" fontSize="sm">
                    No protocols are currently queued for execution
                  </Text>
                </VStack>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};
