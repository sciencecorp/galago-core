import React, { useState } from "react";
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
    useDisclosure
  } from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import StatusTag from "@/components/tools/StatusTag";
import { ExecuteCommandReply, ResponseCode } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import { ToolCommandInfo } from "@/types";
import { ToolType } from "gen-interfaces/controller";
import { ToolStatus } from "gen-interfaces/tools/grpc_interfaces/tool_base";

interface QueueStatusComponent {
  totalRuns:number
}

export const QueueStatusComponent: React.FC<QueueStatusComponent>= ({totalRuns}) => {
    const [slackNotificationsEnabled, setSlackNotificationsEnabled] = useState(false);
    
    const toggleSlackNotifications = () => {
      setSlackNotificationsEnabled(!slackNotificationsEnabled);
    };
    const stateQuery = trpc.commandQueue.state.useQuery(undefined, { refetchInterval: 100 });
    const stateMutationOpts = {
      onSettled: () => stateQuery.refetch(),
    };
    const queue = trpc.commandQueue;
    const restartMutation = queue.restart.useMutation(stateMutationOpts);
    const stopMutation = queue.stop.useMutation(stateMutationOpts);
    const clearAllMutation = queue.clearAll.useMutation(stateMutationOpts);
    const commandMutation = trpc.tool.runCommand.useMutation();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const ClearSlackErrors = async ()  => {
      const toolCommand: ToolCommandInfo = {
          toolId: "toolbox",
          toolType: "toolbox" as ToolType,
          command: "clear_last_slack_alert",
          params: {},
        };
        try{ await commandMutation.mutateAsync(
          toolCommand
        );
      }
      catch{
        console.error("failed to clear slack messages.")
      }
    }

    const run = async () => {
      await ClearSlackErrors(); 
      restartMutation.mutate();
    }

    const pause = async () => {
      stopMutation.mutate();
    }

    const clear = async () => {
      ClearSlackErrors();
      clearAllMutation.mutate();
    }
    
    const handleConfirmStart = () => {
      run();
      onClose();
    }

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
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      )

    }

    if (stateQuery.isLoading) return <Spinner />;
    return (
      <>
        <VStack padding='2em'>
          {confirmRunStartModal()}
          <Heading
            css={{
              fontFamily: `'Bungee Shade', cursive`,
            }}>
            Run Queue
            <StatusTag 
            css={{
              fontFamily: `'system-ui', sans-serif`,
            }}
            marginTop='2' marginLeft='2' size="lg" status={stateQuery.data} />
          </Heading>
          <Heading size='md'>Total: {totalRuns}</Heading>
        </VStack>
        <Center>
        <HStack>
          <Button colorScheme='green' variant='outline' onClick={() => onOpen()}>Start</Button>
          <Button colorScheme='red' variant='outline'  onClick={() => pause()}>Stop</Button>
          <Button variant = 'outline' borderColor='black' onClick={() => clear()}>Clear All</Button>
        </HStack>
        </Center>
      </>
    );
  }