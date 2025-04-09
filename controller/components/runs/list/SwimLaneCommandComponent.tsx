import { trpc } from "@/utils/trpc";
import React, { useEffect } from "react";
import {
  Box,
  HStack,
  Text,
  VStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useColorModeValue,
  Center,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { IoPlaySkipForward } from "react-icons/io5";
import { BsSkipForwardFill } from "react-icons/bs";
import { VscRunBelow } from "react-icons/vsc";
import { useRef } from "react";
import { capitalizeFirst } from "@/utils/parser";
import { RunCommand } from "@/types";
import CommandImage from "@/components/tools/CommandImage";

interface LaneCommandComponentProps {
  command: RunCommand;
  onCommandClick: (command: RunCommand) => void;
}

const SwimLaneCommandComponent: React.FC<LaneCommandComponentProps> = (props) => {
  const { command, onCommandClick } = props;
  const infoQuery = trpc.tool.info.useQuery({ toolId: command.commandInfo.toolId });
  const toolStatusQuery = trpc.tool.status.useQuery({ toolId: command.commandInfo.toolId });
  const skipMutation = trpc.commandQueue.skipCommand.useMutation();
  const skipUntilMutation = trpc.commandQueue.skipCommandsUntil.useMutation();
  const execMutation = trpc.tool.runCommand.useMutation();
  const { queueId, commandInfo, estimatedDuration, status } = command;
  let toolName = infoQuery.data?.name || "undefined";
  const bgColor = useColorModeValue("white", "gray.700");
  const errorColor = useColorModeValue("red.200", "red.800");
  const toolNameRef = useRef(toolName);

  useEffect(() => {
    toolNameRef.current = toolName;
  }, [toolName]);

  const runningBg = useColorModeValue("teal.200", "teal.800");

  function setBackgroundColor(status: any) {
    switch (status) {
      case "STARTED":
        return runningBg;
      case "FAILED":
        return errorColor;
      default:
        return bgColor;
    }
  }

  const queued =
    queueId &&
    (command.status === "CREATED" || command.status === "FAILED" || command.status === "STARTED");

  return (
    <Box
      left="0px"
      right="0px"
      minW="250px"
      maxW="300px"
      height="165px"
      overflowY="auto"
      mr="4"
      fontSize="18px"
      borderLeftRadius="15"
      borderRightRadius="15"
      padding="6px"
      background={setBackgroundColor(command.status)}
      border={command.status === "STARTED" ? "2px" : "1px"}
      borderColor={command.status === "STARTED" ? "teal" : "black"}>
      <VStack alignItems="stretch">
        <Box>
          <HStack spacing={2}>
            <Box width="90%">
              <HStack></HStack>
              <Text as="b">{toolName}</Text>
            </Box>
            <Box>
              <Menu offset={[40, -40]}>
                <MenuButton
                  as={IconButton}
                  aria-label="Options"
                  border={0}
                  bg="transparent"
                  icon={<HamburgerIcon fontSize="lg" />}
                  variant="outline"
                />
                <MenuList>
                  {queued ? (
                    <MenuItem onClick={() => skipMutation.mutate(queueId)}>
                      <IoPlaySkipForward />{" "}
                      <Box as="span" ml={2}>
                        Skip
                      </Box>
                    </MenuItem>
                  ) : null}
                  {queued ? (
                    <MenuItem onClick={() => skipUntilMutation.mutate(queueId)}>
                      <BsSkipForwardFill />{" "}
                      <Box as="span" ml={2}>
                        Skip to this command
                      </Box>
                    </MenuItem>
                  ) : null}
                  <MenuItem onClick={() => execMutation.mutate(command.commandInfo)}>
                    <VscRunBelow />{" "}
                    <Box as="span" ml={2}>
                      Send to Tool
                    </Box>
                  </MenuItem>
                </MenuList>
              </Menu>
            </Box>
          </HStack>
        </Box>
        <Center p={0}>
          <VStack spacing={2}>
            <CommandImage
              config={infoQuery.data}
              command={command}
              onCommandClick={onCommandClick}
            />
            <Box bottom={0} position="sticky">
              <Text>{capitalizeFirst(command.commandInfo.command.replaceAll("_", " "))}</Text>
            </Box>
          </VStack>
        </Center>
      </VStack>
    </Box>
  );
};

export default React.memo(SwimLaneCommandComponent);
