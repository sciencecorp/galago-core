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
  Spacer,
  Switch,
} from "@chakra-ui/react";
import { DeleteWithConfirmation } from "../ui/Delete";
import { PlusSquareIcon, ChevronUpIcon, TimeIcon } from "@chakra-ui/icons";
import { QueueStatusComponent } from "./status/QueueStatuscomponent";
import { groupCommandsByRun, getRunAttributes } from "./utils";
import { Workflow } from "lucide-react";
import { ToolStatus } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import { Inbox } from "lucide-react";
import { MessageModal } from "./MessageModal";
import { TimerModal } from "./TimerModal";
import { StopRunModal } from "./StopRunModal";
import { ErrorModal } from "./ErrorModal";
import { UserFormModal } from "./UserFormModal";
import { Form } from "@/types";

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
  const [showAllCommands, setShowAllCommands] = useState(true);

  // User Form Modal state
  const [isUserFormModalOpen, setIsUserFormModalOpen] = useState(false);
  const [currentForm, setCurrentForm] = useState<Form | null>(null);
  const [userFormError, setUserFormError] = useState<string | null>(null);

  // Unified message state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorModalData, setErrorModalData] = useState<{
    message: string;
    code?: string;
    details?: string;
  }>({
    message: "An error occurred",
  });

  const [messageData, setMessageData] = useState<{
    type: "pause" | "message" | "timer" | "stop_run" | "user_form";
    message: string;
    title?: string;
    pausedAt?: number;
    timerDuration?: number;
    timerEndTime?: number;
    formName?: string;
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

  const commandsAll = trpc.commandQueue.getAll.useQuery(undefined, { refetchInterval: 2000 });
  // Query for waiting-for-input status
  const isWaitingForInputQuery = trpc.commandQueue.isWaitingForInput.useQuery(undefined, {
    refetchInterval: 1000,
  });

  // Query for current message data
  const currentMessageQuery = trpc.commandQueue.currentMessage.useQuery(undefined, {
    refetchInterval: 1000,
  });

  // Form fetching query (only execute when we have a form name)
  const formQuery = trpc.form.get.useQuery(messageData.formName || "", {
    enabled: !!messageData.formName && messageData.type === "user_form",
  });

  // Handle form query results
  useEffect(() => {
    if (formQuery.data && messageData.type === "user_form") {
      setCurrentForm(formQuery.data);
      setUserFormError(null);
    } else if (formQuery.error && messageData.type === "user_form") {
      console.error("❌ Failed to load form:", formQuery.error);
      setUserFormError(`Failed to load form: ${formQuery.error.message}`);
      setCurrentForm(null);
    }
  }, [formQuery.data, formQuery.error, messageData.type]);

  const commandBgColor = useColorModeValue("gray.50", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBgColor = useColorModeValue("gray.100", "gray.600");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const cardBg = useColorModeValue("white", "gray.700");
  const expandedRunBg = useColorModeValue("white", "gray.800");
  const boxShadowValue = useColorModeValue("md", "none");
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
      const shouldShowModal = isWaitingForInputQuery.data;
      const shouldShowUserForm = shouldShowModal && messageData.type === "user_form";

      setIsModalOpen(shouldShowModal && messageData.type !== "user_form");
      setIsUserFormModalOpen(shouldShowUserForm);
    }

    if (currentMessageQuery.data) {
      const newMessageData = {
        type: currentMessageQuery.data.type,
        message: currentMessageQuery.data.message,
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
        ...(currentMessageQuery.data.formName
          ? { formName: currentMessageQuery.data.formName }
          : {}),
      };

      setMessageData(newMessageData);

      // Reset form state when message type changes
      if (newMessageData.type !== "user_form") {
        setCurrentForm(null);
        setUserFormError(null);
      }
    }
  }, [isWaitingForInputQuery.data, currentMessageQuery.data, messageData.type]);

  const handleResume = () => {
    resumeMutation.mutate();
  };

  const handleUserFormSubmit = (formData: Record<string, any>) => {
    // TODO: Handle form submission - for now just resume
    resumeMutation.mutate();
    setIsUserFormModalOpen(false);
    setCurrentForm(null);
  };

  const handleUserFormCancel = () => {
    // For now, just resume the queue - you might want different behavior
    resumeMutation.mutate();
    setIsUserFormModalOpen(false);
    setCurrentForm(null);
  };

  const handleRunStop = () => {
    stopQueueMutation.mutate();
    clearAllMutation.mutate();
    setIsModalOpen(false);
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
      // Extract error information
      let errorMessage = "An error occurred while executing the command";
      let errorCode = "";
      let errorDetails = "";

      if (getError.data) {
        // Check if error is a ToolCommandExecutionError
        if (typeof getError.data === "object" && getError.data !== null) {
          // Handle ToolCommandExecutionError with our enhanced properties
          if ("userFriendlyMessage" in getError.data) {
            errorMessage = getError.data.userFriendlyMessage;
          } else if ("message" in getError.data) {
            errorMessage = getError.data.message;
          }

          if ("codeString" in getError.data) {
            errorCode = getError.data.codeString;
          } else if ("code" in getError.data) {
            // Convert numeric code to string if possible
            const code = getError.data.code;
            errorCode = typeof code === "number" ? `Code ${code}` : String(code);
          }

          errorDetails = JSON.stringify(getError.data, null, 2);
        } else {
          // Handle plain error message
          errorMessage = String(getError.data);
        }
      }

      return (
        <Alert status="error" variant="left-accent" mb={2}>
          <AlertIcon />
          <Box flex="1">
            <AlertTitle display="flex" alignItems="center">
              Error
              {errorCode && (
                <Badge ml={2} colorScheme="red">
                  {errorCode}
                </Badge>
              )}
            </AlertTitle>
            <AlertDescription fontWeight="medium">{errorMessage}</AlertDescription>
          </Box>
          <HStack>
            <Button
              size="sm"
              colorScheme="red"
              variant="outline"
              onClick={() => {
                setIsErrorModalOpen(true);
                setErrorModalData({
                  message: errorMessage,
                  code: errorCode,
                  details: errorDetails,
                });
              }}>
              Details
            </Button>
            <CloseButton onClick={() => setIsErrorVisible(false)} />
          </HStack>
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
              boxShadow={boxShadowValue}
              transition="all 0.2s"
              _hover={{
                bg: hoverBgColor,
                transform: "translateY(-1px)",
                boxShadow: "md",
              }}>
              <VStack spacing="2">
                {runAttributes.commandsCount > 0 && (
                  <Progress
                    width="100%"
                    hasStripe
                    isAnimated
                    value={
                      (run.Commands.filter(
                        (cmd) => cmd.status === "COMPLETED" || cmd.status === "SKIPPED",
                      ).length /
                        runAttributes.commandsCount) *
                      100
                    }
                    colorScheme="teal"
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
                <SwimLaneComponent runCommands={run.Commands} showAllCommands={showAllCommands} />
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
        isOpen={isModalOpen && messageData.type !== "timer" && messageData.type !== "user_form"}
        messageData={messageData}
        onContinue={handleResume}
      />
      <UserFormModal
        isOpen={isUserFormModalOpen}
        form={currentForm}
        onSubmit={handleUserFormSubmit}
        onCancel={handleUserFormCancel}
      />
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        errorData={errorModalData}
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
                  <Icon as={Workflow} boxSize={8} color="teal.500" />
                  <VStack align="start" spacing={1}>
                    <Heading size="lg">Protocol Runs</Heading>
                    <HStack>
                      <Badge
                        colorScheme={
                          isModalOpen || isUserFormModalOpen
                            ? messageData.type === "pause"
                              ? "orange"
                              : messageData.type === "user_form"
                                ? "purple"
                                : "blue"
                            : stateQuery.data === ToolStatus.BUSY
                              ? "green"
                              : "gray"
                        }
                        fontSize="sm">
                        {isModalOpen || isUserFormModalOpen
                          ? messageData.type === "pause"
                            ? "Paused"
                            : messageData.type === "user_form"
                              ? "Waiting for Form"
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
              <HStack justify="space-between" width="100%">
                <Heading size="lg">
                  {commandsAll.data && commandsAll.data.length > 0 ? "Runs List" : ""}
                </Heading>
                <Spacer />
                <Text color="GrayText">Show Completed:</Text>
                <Switch
                  isChecked={showAllCommands}
                  onChange={() => setShowAllCommands(!showAllCommands)}
                  colorScheme="teal"
                  size="md"
                />
              </HStack>
              {commandsAll.data && commandsAll.data.length > 0 ? (
                renderRunsList()
              ) : (
                <VStack spacing={3} py={4}>
                  <Icon as={Inbox} boxSize={8} color="gray.400" />
                  <Heading size="md" color="gray.400" fontWeight="medium">
                    Runs Queue is Empty
                  </Heading>
                </VStack>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};
