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
import NextLink from "next/link";

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
  const toolStatusQuery = trpc.tool.status.useQuery({ toolId });
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
        <StatusTag status={toolStatusQuery.data?.status} label={toolType} />
      </Td>
      <Td>
        <Tag>{command}</Tag>
      </Td>
      <Td>
        <Tag>{label}</Tag>
      </Td>
      <Td>
        <Box
          as="pre"
          style={{
            maxHeight: "200px", // or whatever maximum height you prefer
            overflowY: "auto", // this provides the vertical scrollbar when needed
            maxWidth: "400px",
            overflowX: "auto",
            fontSize: "0.8em",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            padding: "4px",
          }}>
          {paramString}
        </Box>
      </Td>
      <Td>
        <Tag>{estimatedDuration}s</Tag>
      </Td>
      {run ? null : (
        <Td>
          <Box>
            <NextLink href={`/runs/${runCommand.runId}`} passHref>
              <Link>Run {runCommand.runId}</Link>
            </NextLink>
          </Box>
        </Td>
      )}
      <Td maxWidth="300px">
        <pre style={{ fontSize: "0.8em", whiteSpace: "pre-wrap" }}>
          {status === "CREATED" ? (
            "🆕"
          ) : status === "STARTED" ? (
            <Spinner size="sm" />
          ) : status === "COMPLETED" ? (
            "✅"
          ) : status === "SKIPPED" ? (
            "⏩"
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
              <MenuItem onClick={() => skipMutation.mutate(queueId)}>⏩ Skip</MenuItem>
            ) : null}
            {queued ? (
              <MenuItem onClick={() => skipUntilMutation.mutate(queueId)}>
                ⏩⏩ Skip to this command
              </MenuItem>
            ) : null}
            <MenuItem onClick={() => execMutation.mutate(commandInfo)}>🔨 Send to Tool</MenuItem>
          </MenuList>
        </Menu>
      </Td>
    </Tr>
  );
}
