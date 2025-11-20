import CommandComponent from "@/components/protocols/CommandComponent";
import { useState } from "react";
import StatusTag from "@/components/tools/StatusTag";
import { ToolStatusCardsComponent } from "@/components/tools/ToolsComponent";
import { trpc } from "@/utils/trpc";
import {
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Alert,
  Box,
  Button,
  Heading,
  HStack,
  Spinner,
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";

function CommandQueueStatusComponent() {
  const [slackNotificationsEnabled, setSlackNotificationsEnabled] =
    useState(false);
  const toggleSlackNotifications = () => {
    setSlackNotificationsEnabled(!slackNotificationsEnabled);
  };
  const stateQuery = trpc.commandQueue.state.useQuery(undefined, {
    refetchInterval: 100,
  });
  const stateMutationOpts = {
    onSettled: () => stateQuery.refetch(),
  };
  const queue = trpc.commandQueue;
  const restartMutation = queue.restart.useMutation(stateMutationOpts);
  const stopMutation = queue.stop.useMutation(stateMutationOpts);
  const clearCompletedMutation =
    queue.clearCompleted.useMutation(stateMutationOpts);
  const clearAllMutation = queue.clearAll.useMutation(stateMutationOpts);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const handleStartClick = () => {
    onOpen();
  };
  const handleConfirmStart = () => {
    restartMutation.mutate();
    onClose();
  };
  if (stateQuery.isLoading) return <Spinner />;

  return (
    <>
      <HStack>
        <Heading>Command Queue</Heading>
        <StatusTag size="lg" status={stateQuery.data} />
      </HStack>
      <HStack>
        <Button onClick={handleStartClick}>Start</Button>
        <Button onClick={() => stopMutation.mutate()}>Stop</Button>
        <Button onClick={() => clearCompletedMutation.mutate()}>
          Clear Completed
        </Button>
        <Button onClick={() => clearAllMutation.mutate()}>Clear All</Button>
        {/* button to toggle slack notifications */}
        <Button onClick={toggleSlackNotifications}>
          {slackNotificationsEnabled
            ? "Disable Slack Notifications"
            : "Enable Slack Notifications"}
        </Button>
      </HStack>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Warning</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Make sure instruments are not unintentionally in simulation mode.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleConfirmStart}>
              Accept
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

function CommandListComponent() {
  const [limit] = useState<number>(25);
  const [offset, setOffset] = useState<number>(0);

  const commandsQuery = trpc.commandQueue.commands.useQuery(
    { limit: limit, offset: offset },
    { refetchInterval: 100 }
  );
  const hasPrevious = offset > 0;
  const hasNext =
    (commandsQuery.data && commandsQuery.data.length === limit) || false;

  const handleNext = () => {
    if (hasNext) {
      setOffset(offset + limit);
    }
  };

  const handlePrevious = () => {
    if (hasPrevious) {
      setOffset(Math.max(offset - limit, 0));
    }
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" mt={4}>
        <Button disabled={!hasPrevious} onClick={handlePrevious}>
          Previous
        </Button>
        <Button disabled={!hasNext} onClick={handleNext}>
          Next
        </Button>
      </Box>
      <Table variant="striped" mt={8}>
        <Thead>
          <Tr>
            <Th>Tool Type</Th>
            <Th>Command</Th>
            <Th>Label</Th>
            <Th>Params</Th>
            <Th>Duration</Th>
            <Th>Execute</Th>
            <Th>Response</Th>
          </Tr>
        </Thead>
        <Tbody>
          {commandsQuery.isSuccess &&
            commandsQuery.data.map((command, i) => {
              return (
                <CommandComponent key={command.queueId} command={command} />
              );
            })}
        </Tbody>
      </Table>
      <Box display="flex" justifyContent="space-between" mt={4}>
        <Button disabled={!hasPrevious} onClick={handlePrevious}>
          Previous
        </Button>
        <Button disabled={!hasNext} onClick={handleNext}>
          Next
        </Button>
      </Box>
      {commandsQuery.isLoading ? (
        <Spinner />
      ) : commandsQuery.isError ? (
        <Alert status="error">{commandsQuery.error.message}</Alert>
      ) : null}
    </>
  );
}

export default function Page() {
  return (
    <VStack>
      <ToolStatusCardsComponent />
      <CommandQueueStatusComponent />
      <CommandListComponent />
    </VStack>
  );
}
