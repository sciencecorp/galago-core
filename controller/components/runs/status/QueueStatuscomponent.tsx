import React from "react";
import {
  Spinner,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  useDisclosure,
  ButtonGroup,
  Icon,
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { ToolStatus } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import {
  Play, // replaces FaPlay
  Pause, // replaces FaPause
  Trash2, // replaces FaTrash
} from "lucide-react";

interface QueueStatusComponent {
  totalRuns: number;
}

export const QueueStatusComponent: React.FC<QueueStatusComponent> = ({ totalRuns }) => {
  const stateQuery = trpc.commandQueue.state.useQuery(undefined, { refetchInterval: 1000 });
  const commandsQuery = trpc.commandQueue.getAll.useQuery(undefined, { refetchInterval: 1000 });
  const stateMutationOpts = {
    onSettled: () => {
      stateQuery.refetch();
      getError.refetch();
      commandsQuery.refetch();
    },
  };
  const queue = trpc.commandQueue;
  const restartMutation = queue.restart.useMutation(stateMutationOpts);
  const stopMutation = queue.stop.useMutation(stateMutationOpts);
  const clearAllMutation = queue.clearAll.useMutation(stateMutationOpts);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const getError = queue.getError.useQuery(undefined, { refetchInterval: 1500 });

  const run = async () => {
    restartMutation.mutate();
  };

  const pause = async () => {
    stopMutation.mutate();
  };

  const clear = async () => {
    clearAllMutation.mutate();
  };

  const handleConfirmStart = () => {
    run();
    onClose();
  };

  const confirmRunStartModal = () => {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Warning</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Make sure instruments are not unintentionally in simulation mode.</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={handleConfirmStart}>
              Accept
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  if (stateQuery.isLoading || commandsQuery.isLoading) return <Spinner />;

  const isRunning = stateQuery.data === ToolStatus.BUSY;

  // Check if there are any commands (including completed ones) to clear
  const hasCommandsToClear = commandsQuery.data && commandsQuery.data.length > 0;

  return (
    <>
      {confirmRunStartModal()}
      <ButtonGroup spacing={2}>
        {isRunning ? (
          <Button
            leftIcon={<Icon as={Pause} size={14} />}
            colorScheme="orange"
            variant="solid"
            onClick={() => pause()}>
            Pause
          </Button>
        ) : (
          <Button
            leftIcon={<Icon as={Play} size={14} />}
            colorScheme="green"
            variant="solid"
            onClick={() => onOpen()}
            isDisabled={totalRuns === 0}>
            Start
          </Button>
        )}
        <Button
          leftIcon={<Icon as={Trash2} size={14} />}
          colorScheme="red"
          variant="outline"
          onClick={() => clear()}
          isDisabled={!hasCommandsToClear}
          title={
            hasCommandsToClear ? "Clear all runs including completed ones" : "No runs to clear"
          }>
          Clear All
        </Button>
      </ButtonGroup>
    </>
  );
};
