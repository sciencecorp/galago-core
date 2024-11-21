import StatusTag from "@/components/tools/StatusTag";
import { Run, RunCommand } from "@/types";
import { trpc } from "@/utils/trpc";
import {
  Box,
  Button,
  Link,
  Menu,
  MenuButton,
  MenuIcon,
  MenuItem,
  MenuList,
  Spinner,
  Tag,
  Td,
  Tr,
} from "@chakra-ui/react";
import { ToolType } from "gen-interfaces/controller";
import NextLink from "next/link";
import { IoPlaySkipForward } from "react-icons/io5";
import { BsSkipForwardFill } from "react-icons/bs";
import { VscRunBelow } from "react-icons/vsc";

export default function CommandComponent({
  run,
  command: runCommand,
}: {
  run?: Run;
  command: RunCommand;
}) {
  const { queueId, commandInfo, estimatedDuration, status } = runCommand;  
  const { toolId, toolType, params, command, label = "" } = commandInfo;
  const skipMutation = trpc.commandQueue.skipCommand.useMutation();
  const skipUntilMutation = trpc.commandQueue.skipCommandsUntil.useMutation();
  const execMutation = trpc.tool.runCommand.useMutation();
  const toolStatusQuery = trpc.tool.status.useQuery({ toolId: toolId.toString() });
  const relevantTimestamp =
    status === "CREATED"
      ? runCommand.createdAt
      : status === "STARTED"
        ? runCommand.startedAt
        : status === "COMPLETED"
          ? runCommand.completedAt
          : status === "FAILED"
            ? runCommand.failedAt
            : status === "SKIPPED"
              ? runCommand.skippedAt
              : undefined;

  const queued = queueId && (status === "CREATED" || status === "FAILED" || status === "STARTED");
  const timeDescription = relevantTimestamp && relevantTimestamp.toLocaleTimeString();

  // Truncate params message if too long
  const paramLines = JSON.stringify(params, null, 2).split("\n");
  // const truncatedParams =
  //   paramLines.length > 10
  //     ? [...paramLines.slice(0, 10), "...[Text truncated for brevity]"]
  //     : paramLines;
  const paramString = paramLines.join("\n");
  return (
    <Tr>
      <Td>
        <Tag>{toolType}</Tag>
      </Td>
      <Td>
        <Tag>{command}</Tag>
      </Td>
      <Td>
        <Box
          as="pre"
          style={{
            maxHeight: "200px",
            overflowY: "auto",
            minWidth: "200px", // Increased width
            maxWidth: "200px", // Increased max width
            overflowX: "auto",
            fontSize: "0.8em",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            padding: "4px",
            textAlign: "left" // Explicitly set left alignment
          }}>
          {paramString}
        </Box>
      </Td>
      <Td>
        <Tag>{estimatedDuration}s</Tag>
      </Td>
      <Td minWidth="100px"> {/* Increased width */}
        <pre style={{ 
          fontSize: "0.8em", 
          whiteSpace: "pre-wrap",
          textAlign: "left" // Explicitly set left alignment
        }}>
          {status === "CREATED" ? (
            ""
          ) : status === "STARTED" ? (
            <Spinner size="sm" />
          ) : status === "COMPLETED" ? (
            "✅"
          ) : status === "SKIPPED" ? (
            <IoPlaySkipForward />
          ) : status === "FAILED" ? (
            "❌"
          ) : (
            JSON.stringify(status, null, 2)
          )}{" "}
          {timeDescription}
        </pre>
      </Td>
      <Td>
        <Menu>
          <MenuButton colorScheme="teal" as={Button}>
            Actions...
          </MenuButton>
          <MenuList>
            {queued ? (
              <MenuItem onClick={() => skipMutation.mutate(queueId)}>
                <IoPlaySkipForward /> <Box as="span" ml={2}>Skip</Box>
              </MenuItem>
            ) : null}
            {queued ? (
              <MenuItem onClick={() => skipUntilMutation.mutate(queueId)}>
                <BsSkipForwardFill /> <Box as="span" ml={2}>Skip to this command</Box>
              </MenuItem>
            ) : null}
            <MenuItem onClick={() => execMutation.mutate(commandInfo)}>
              <VscRunBelow /> <Box as="span" ml={2}>Send to Tool</Box>
            </MenuItem>
          </MenuList>
        </Menu>
      </Td>
    </Tr>
  );
}
