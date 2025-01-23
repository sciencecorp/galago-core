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
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import StatusTag from "@/components/tools/StatusTag";
import { ExecuteCommandReply, ResponseCode } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import { ToolCommandInfo } from "@/types";
import { ToolType } from "gen-interfaces/controller";
import { ToolStatus } from "gen-interfaces/tools/grpc_interfaces/tool_base";

import { getegid } from "process";
import { get } from "http";
import { PageHeader } from "@/components/ui/PageHeader";
import { RunTag } from "./RunTag";

interface QueueStatusComponent {
  totalRuns: number;
}

export const QueueStatusComponent: React.FC<QueueStatusComponent> = ({ totalRuns }) => {
  const stateQuery = trpc.commandQueue.state.useQuery(undefined, { refetchInterval: 1000 });
  const stateMutationOpts = {
    onSettled: () => {
      stateQuery.refetch();
      getError.refetch();
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

  if (stateQuery.isLoading) return <Spinner />;
  return (
    <>
      <ErrorBanner />
      {confirmRunStartModal()}
      <PageHeader
        title="Runs"
        subTitle={`Total Runs: ${totalRuns}`}
        mainButton={
          <Button colorScheme="green" variant="outline" onClick={() => onOpen()}>
            Start
          </Button>
        }
        secondaryButton={
          <Button colorScheme="red" variant="outline" onClick={() => pause()}>
            Stop
          </Button>
        }
        tertiaryButton={
          <Button colorScheme="white" variant="outline" onClick={() => clear()}>
            Clear
          </Button>
        }
      />
    </>
  );
};
