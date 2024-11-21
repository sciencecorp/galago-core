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
  Center
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { Run, RunCommand } from "@/types";
import { HamburgerIcon } from "@chakra-ui/icons";
import { IoPlaySkipForward } from "react-icons/io5";
import { BsSkipForwardFill } from "react-icons/bs";
import { VscRunBelow } from "react-icons/vsc";
import { Tooltip } from "@chakra-ui/react";
import { PiToolbox } from "react-icons/pi";
import { useRef } from "react";
import { capitalizeFirst } from "@/utils/parser";

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
      <Box display="flex" justifyContent="center" alignItems="center" py={3}>
        <IconButton
          aria-label="Tool Box"
          icon={<PiToolbox style={{ width: "100%", height: "65px" }} />} // Ensure the icon fills the button
          variant="ghost"
          colorScheme="teal"
          isRound
      />
    </Box>
      );
    }
    else {
      return (
        <Box display="flex" justifyContent="center" alignItems="center">
          <Image
            src={config.image_url}
            alt={config.name}
            objectFit="contain"
            height={"65px"}
            width={"65px"}
            transition="all 0.3s ease-in-out"
          />
        </Box>
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
      minW="210px"
      height="165px"
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
          <HStack spacing={2}>
            <Box width="90%">
              <HStack>
            </HStack>
              <Text as="b">{toolName}</Text>
            </Box>
            <Box>
              <Menu offset={[40, -40]}>
                <MenuButton
                  as={IconButton}
                  aria-label="Options"
                  padding="0"
                  margin="0"
                  border={0}
                  bg="transparent"
                  icon={<HamburgerIcon fontSize='sm' />}
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
              <Box>
                {renderToolImage(infoQuery.data)}
              </Box>
              <Box bottom={0} position="sticky">
                <Tooltip
                placement="right"
                label={JSON.stringify(command.commandInfo.params, null, 2).split("\n")}>
                  <Text>{capitalizeFirst(command.commandInfo.command.replaceAll("_"," "))}</Text>
                </Tooltip>
              </Box>
          </VStack>
        </Center>
      </VStack>
    </Box>

  );
};

export default React.memo(SwimLaneCommandComponent);
