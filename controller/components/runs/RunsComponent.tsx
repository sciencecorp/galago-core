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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  CloseButton,
} from "@chakra-ui/react";
import { DeleteWithConfirmation } from "../ui/Delete";
import { QueueStatusComponent } from "./status/QueueStatuscomponent";
import { getRunAttributes, groupCommandsByRun } from "@/utils/runUtils";
import { ToolStatus } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import { palette, semantic } from "../../themes/colors";
import tokens from "../../themes/tokens";
import {
  Icon,
  GithubActionsIcon,
  InboxIcon,
  PlusSquareIcon,
  ChevronUpIcon,
  TimeIcon,
} from "../ui/Icons";

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
    <Text fontSize={tokens.typography.fontSizes.sm} color={semantic.text.secondary.light}>
      <Icon as={TimeIcon} mr={1} />
      Last updated: {time}
    </Text>
  );
};

export const RunsComponent: React.FC = () => {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [expandedRuns, setExpandedRuns] = useState<Set<string>>(new Set());
  const [runAttributesMap, setRunAttributesMap] = useState<Record<string, any>>({});
  const [isErrorVisible, setIsErrorVisible] = useState(true);
  const skipRunMutation = trpc.commandQueue.clearByRunId.useMutation();
  const commandsAll = trpc.commandQueue.commands.useQuery(
    { limit: 1000, offset: 0 },
    { refetchInterval: 1000 },
  );
  const commandBgColor = useColorModeValue(
    semantic.background.secondary.light,
    semantic.background.secondary.dark,
  );
  const borderColor = useColorModeValue(
    semantic.border.secondary.light,
    semantic.border.primary.dark,
  );
  const hoverBgColor = useColorModeValue(
    semantic.background.hover.light,
    semantic.background.hover.dark,
  );
  const textColor = useColorModeValue(semantic.text.primary.light, semantic.text.secondary.light);
  const cardBg = useColorModeValue(semantic.background.card.light, semantic.background.card.dark);
  const expandedRunBg = useColorModeValue(
    semantic.background.secondary.light,
    semantic.background.secondary.dark,
  );
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
    return expandedRuns.has(runId) ? <Icon as={ChevronUpIcon} /> : <Icon as={PlusSquareIcon} />;
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
              borderWidth={tokens.borders.widths.thin}
              borderColor={borderColor}
              borderRadius={tokens.borders.radii.md}
              width="100%"
              transition={`all ${tokens.animation.durations.fast} ${tokens.animation.easings.easeInOut}`}
              _hover={{
                bg: hoverBgColor,
                transform: "translateY(-1px)",
                boxShadow: tokens.shadows.sm,
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
                      <Text
                        fontSize={tokens.typography.fontSizes.sm}
                        fontWeight={tokens.typography.fontWeights.medium}>
                        {index + 1}.
                      </Text>
                      <Text
                        fontSize={tokens.typography.fontSizes.sm}
                        fontWeight={tokens.typography.fontWeights.medium}>
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
                bg={expandedRunBg}
                p={3}
                borderWidth={tokens.borders.widths.thin}
                borderColor={borderColor}
                borderRadius={tokens.borders.radii.md}
                mt={tokens.spacing.xs}
                mb={tokens.spacing.md}>
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
      <ErrorBanner />
      <VStack spacing={6} align="stretch">
        <Card bg={cardBg} shadow="md">
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Flex justify="space-between" align="center">
                <HStack spacing={4}>
                  <Icon as={GithubActionsIcon} boxSize={8} color={semantic.text.accent.light} />
                  <VStack align="start" spacing={1}>
                    <Heading size="lg">Run Queue</Heading>
                    <HStack>
                      <Badge
                        colorScheme={stateQuery.data === ToolStatus.BUSY ? "green" : "gray"}
                        fontSize={tokens.typography.fontSizes.sm}>
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
                  <StatNumber color={semantic.text.accent.light}>{activeRuns}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Completed</StatLabel>
                  <StatNumber color={semantic.status.success.light}>{completedRuns}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Pending</StatLabel>
                  <StatNumber color={semantic.text.secondary.light}>{pendingRuns}</StatNumber>
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
                  <Icon as={InboxIcon} boxSize={8} color={semantic.text.secondary.light} />
                  <Heading
                    size="md"
                    color={semantic.text.secondary.light}
                    fontWeight={tokens.typography.fontWeights.medium}>
                    Queue is Empty
                  </Heading>
                  <Text
                    color={semantic.text.secondary.light}
                    fontSize={tokens.typography.fontSizes.sm}>
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
