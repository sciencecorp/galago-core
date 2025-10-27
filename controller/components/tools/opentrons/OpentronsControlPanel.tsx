import React, { useState } from "react";
import {
  Box,
  VStack,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  HStack,
  Icon,
  useColorModeValue,
  Divider,
  Switch,
  FormControl,
  FormLabel,
  Tooltip,
  Text,
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { ToolCommandInfo } from "@/types";
import { ToolType } from "gen-interfaces/controller";
import { loadingToast } from "@/components/ui/Toast";
import { FaHome, FaLightbulb, FaDoorOpen, FaDoorClosed } from "react-icons/fa";
import { MdPause, MdPlayArrow, MdStop } from "react-icons/md";

interface OpentronsControlPanelProps {
  toolId: string;
  onSimulate?: (isSimulated: boolean) => void;
}

export const OpentronsControlPanel: React.FC<OpentronsControlPanelProps> = ({
  toolId,
  onSimulate,
}) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const [lightsOn, setLightsOn] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const commandMutation = trpc.tool.runCommand.useMutation();

  const executeCommand = (commandName: string, params: Record<string, any> = {}) => {
    const toolCommand: ToolCommandInfo = {
      toolId: toolId,
      toolType: ToolType.opentrons2,
      command: commandName,
      params,
    };

    const commandPromise = new Promise((resolve, reject) => {
      commandMutation.mutate(toolCommand, {
        onSuccess: (data) => resolve(data),
        onError: (error) => reject(error),
      });
    });

    loadingToast(`Executing ${commandName}...`, "Please wait.", commandPromise, {
      successTitle: `${commandName} completed!`,
      successDescription: () => "Command completed successfully",
      errorTitle: "Failed to execute command",
      errorDescription: (error) => `Error: ${error.message}`,
    });

    return commandPromise;
  };

  const handleHome = async () => {
    await executeCommand("home");
  };

  const handleToggleLights = async () => {
    const newState = !lightsOn;
    await executeCommand("toggle_light", { on: newState });
    setLightsOn(newState);
  };

  const handleOpenDoor = async () => {
    await executeCommand("open_door");
  };

  const handleCloseDoor = async () => {
    await executeCommand("close_door");
  };

  const handlePause = async () => {
    await executeCommand("pause");
  };

  const handleResume = async () => {
    await executeCommand("resume");
  };

  const handleStop = async () => {
    await executeCommand("cancel");
  };

  return (
    <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} borderRadius="md" width="100%">
      <CardBody pt={2}>
        <VStack spacing={3} align="stretch">
          <Text pb={2} textAlign="start" mt={2}>
            <Heading size="sm">Robot Controls</Heading>
          </Text>
          <Tooltip label="Home all axes" placement="right" hasArrow>
            <Button
              leftIcon={<Icon as={FaHome} />}
              colorScheme="blue"
              variant="solid"
              onClick={handleHome}
              isLoading={commandMutation.isLoading && commandMutation.variables?.command === "home"}
              size="md"
              width="100%">
              Home Robot
            </Button>
          </Tooltip>

          <Divider />

          <VStack spacing={2} align="stretch" width="100%">
            <Text fontWeight="bold" textAlign="start">
              Deck Lights
            </Text>
            <Tooltip label="Toggle deck lights" placement="right" hasArrow>
              <Button
                leftIcon={<Icon as={FaLightbulb} />}
                colorScheme="yellow"
                variant="outline"
                onClick={handleToggleLights}
                isLoading={
                  commandMutation.isLoading && commandMutation.variables?.command === "toggle_light"
                }
                size="md"
                width="100%">
                Toggle Lights
              </Button>
            </Tooltip>
          </VStack>
          <Divider />
          <VStack spacing={2} align="stretch">
            <Text fontWeight="bold" textAlign="start">
              Run Controls
            </Text>
            <Tooltip label="Pause running protocol" placement="right" hasArrow>
              <Button
                leftIcon={<Icon as={MdPause} />}
                colorScheme="orange"
                variant="outline"
                onClick={handlePause}
                // isDisabled={!isConnected || commandMutation.isLoading}
                isLoading={
                  commandMutation.isLoading && commandMutation.variables?.command === "pause"
                }
                size="sm"
                width="100%">
                Pause Run
              </Button>
            </Tooltip>

            <Tooltip label="Resume paused protocol" placement="right" hasArrow>
              <Button
                leftIcon={<Icon as={MdPlayArrow} />}
                colorScheme="green"
                variant="outline"
                onClick={handleResume}
                // isDisabled={!isConnected || commandMutation.isLoading}
                isLoading={
                  commandMutation.isLoading && commandMutation.variables?.command === "resume"
                }
                size="sm"
                width="100%">
                Resume Run
              </Button>
            </Tooltip>

            <Tooltip label="Stop and cancel protocol" placement="right" hasArrow>
              <Button
                leftIcon={<Icon as={MdStop} />}
                colorScheme="red"
                variant="outline"
                onClick={handleStop}
                // isDisabled={!isConnected || commandMutation.isLoading}
                isLoading={
                  commandMutation.isLoading && commandMutation.variables?.command === "cancel"
                }
                size="sm"
                width="100%">
                Stop Run
              </Button>
            </Tooltip>
          </VStack>
          <Divider />
          <VStack spacing={2} align="stretch" width="100%">
            <Switch
              isChecked={isSimulated}
              onChange={(e) => {
                const newValue = e.target.checked;
                setIsSimulated(newValue);
                onSimulate?.(newValue);
              }}
              colorScheme="teal">
              Simulate Run
            </Switch>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
};
