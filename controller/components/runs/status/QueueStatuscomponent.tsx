import React, { use, useState, useEffect } from "react";
import {
  Heading,
  HStack,
  Spinner,
  Button,
  VStack,
  Center,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  CloseButton,
  ButtonGroup,
  Icon,
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import StatusTag from "@/components/tools/StatusTag";
import { ExecuteCommandReply, ResponseCode } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import { ToolCommandInfo } from "@/types";
import { ToolType } from "gen-interfaces/controller";
import { ToolStatus } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import { FaPlay, FaPause, FaStop, FaTrash } from "react-icons/fa";

import { getegid } from "process";
import { get } from "http";
import { PageHeader } from "@/components/ui/PageHeader";

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
  const getError = queue.getError.useQuery(undefined, { refetchInterval: 1000 });

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

  const ErrorBanner = () => {
    if (!getError.data) return null;
    if (stateQuery.data === ToolStatus.FAILED) {
      return (
        <Alert status="error" variant="left-accent">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>An error occurred while executing the command.</AlertDescription>
            <AlertDescription>{getError.data.toString()}</AlertDescription>
          </Box>
        </Alert>
      );
    } else {
      return null;
    }
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
            <Button colorScheme="blue" mr={3} onClick={handleConfirmStart}>
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
  const isStopped = stateQuery.data === ToolStatus.OFFLINE;
  const hasFailed = stateQuery.data === ToolStatus.FAILED;

  // Check if there are any commands (including completed ones) to clear
  const hasCommandsToClear = commandsQuery.data && commandsQuery.data.length > 0;

  return (
    <>
      <ErrorBanner />
      {confirmRunStartModal()}
      <ButtonGroup spacing={2}>
        {isRunning ? (
          <Button
            leftIcon={<Icon as={FaPause} />}
            colorScheme="orange"
            variant="solid"
            onClick={() => pause()}>
            Pause Queue
          </Button>
        ) : (
          <Button
            leftIcon={<Icon as={FaPlay} />}
            colorScheme="green"
            variant="solid"
            onClick={() => onOpen()}
            isDisabled={totalRuns === 0}>
            Start Queue
          </Button>
        )}
        <Button
          leftIcon={<Icon as={FaTrash} />}
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
