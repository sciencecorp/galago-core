import CommandComponent from "@/components/protocols/CommandComponent";
import { use, useState } from "react";
import StatusTag from "@/components/tools/StatusTag";
import { ToolStatusCardsComponent } from "@/components/tools/ToolStatusCardsComponent";
import { trpc } from "@/utils/trpc";
import React, { useEffect } from "react";
import {
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
  Tag,
  VStack,
  TagLabel,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Image,
  useColorModeValue,
} from "@chakra-ui/react";

import { Run, RunCommand } from "@/types";
import { HamburgerIcon } from "@chakra-ui/icons";
import { IoPlaySkipForward } from "react-icons/io5";
import { BsSkipForwardFill } from "react-icons/bs";
import { VscRunBelow } from "react-icons/vsc";
import { Tooltip } from "@chakra-ui/react";
import { PiToolbox } from "react-icons/pi";
import { useRef } from "react";

interface LaneCommandComponentProps {
  command: RunCommand;
}

const SwimLaneCommandComponent: React.FC<LaneCommandComponentProps> = ({ command }) => {
  const infoQuery = trpc.tool.info.useQuery({ toolId: command.commandInfo.toolId });
  const toolStatusQuery = trpc.tool.status.useQuery({ toolId: command.commandInfo.toolId });
  const skipMutation = trpc.commandQueue.skipCommand.useMutation();
  const skipUntilMutation = trpc.commandQueue.skipCommandsUntil.useMutation();
  const execMutation = trpc.tool.runCommand.useMutation();
  const { queueId, commandInfo, estimatedDuration, status } = command;
  let toolName = infoQuery.data?.name || "undefined";
  //const MemoizedSwimLaneComponentItem = React.memo(SwimLaneCommandComponent);
  const [commandColor, setCommandColor] = useState<string>("White");
  const bgColor = useColorModeValue("gray.100", "gray.700");
  const errorColor = useColorModeValue("red.200", "red.800");
  const toolNameRef = useRef(toolName);

  useEffect(() => {
    toolNameRef.current = toolName;
  }, [toolName]);

  function renderToolImage(config: any) {
    if(!config) return;
    if (!config.image_url) {
      return <Box></Box>;
    } 
    else if(config.name == "Tool Box"){
      return(
      <Box display="flex" justifyContent="center" alignItems="center">
        <IconButton
          aria-label="Tool Box"
          icon={<PiToolbox style={{ width: "100%", height: "100%" }} />} // Ensure the icon fills the button
          variant="ghost"
          colorScheme="teal"
          isRound
         // boxSize="100px"
      />
    </Box>
      );
    }
    else {
      return (
        <Image
          src={config.image_url}
          alt={config.name}
          sizes="100vw"
          style={{ width: "15%", height: "30px" }}
        />
      );
    }
  }

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

  infoQuery.data?.image_url;
  useEffect(() => {
    if (infoQuery.isLoading) {
      setCommandColor("Blue");
      toolName = "loading..";
    }
  }, [infoQuery.isLoading]);

  const queued =
    queueId &&
    (command.status === "CREATED" || command.status === "FAILED" || command.status === "STARTED");

  return (
    <Box
      left="0px"
      right="0px"
      minW="250px"
      height="150px"
      overflowY="auto"
      mr="4"
      fontSize="18px"
      borderLeftRadius="15"
      borderRightRadius="15"
      padding="6px"
      boxSizing="border-box"
      background={setBackgroundColor(command.status)}
      border={command.status === "STARTED" ? "2px" : "1px"}
      borderColor={command.status === "STARTED" ? "teal" : "black"}>
      <VStack alignItems="stretch">
        <Box>
          <HStack>
            <Box width="90%">
              <Text as="b">{toolName}</Text>
            </Box>
            <Box>
              <Menu offset={[40, -40]}>
                <MenuButton
                  as={IconButton}
                  aria-label="Options"
                  icon={<HamburgerIcon />}
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
        <HStack>
          <Text as="b">Command:</Text>
          <Text>{command.commandInfo.command}</Text>
        </HStack>
        <Tooltip
          placement="right"
          label={JSON.stringify(command.commandInfo.params, null, 2).split("\n")}>
          <Box p="1">
            <HStack>
              <Tag width="90%">
                <Text>Parameters</Text>
              </Tag>
              {renderToolImage(infoQuery.data)}
            </HStack>
          </Box>
        </Tooltip>
      </VStack>
    </Box>
  );
};

export default React.memo(SwimLaneCommandComponent);
