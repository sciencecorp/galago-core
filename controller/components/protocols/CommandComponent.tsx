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
  useColorModeValue,
  HStack,
  Text,
} from "@chakra-ui/react";
import { ToolType } from "gen-interfaces/controller";
import NextLink from "next/link";
import { Icon, FormIcons, RunIcons } from "../ui/Icons";
import { semantic } from "../../themes/colors";
import tokens from "../../themes/tokens";

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

  const textColor = useColorModeValue(semantic.text.primary.light, semantic.text.primary.dark);
  const textSecondary = useColorModeValue(
    semantic.text.secondary.light,
    semantic.text.secondary.dark,
  );
  const borderColor = useColorModeValue(
    semantic.border.secondary.light,
    semantic.border.secondary.dark,
  );
  const accentColor = useColorModeValue(semantic.text.accent.light, semantic.text.accent.dark);
  const tagBg = useColorModeValue(
    semantic.background.secondary.light,
    semantic.background.secondary.dark,
  );
  const codeBg = useColorModeValue(
    `${semantic.background.secondary.light}80`,
    `${semantic.background.secondary.dark}80`,
  );

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
  const paramString = paramLines.join("\n");

  const getStatusColor = () => {
    switch (status) {
      case "COMPLETED":
        return semantic.status.success.light;
      case "FAILED":
        return semantic.status.error.light;
      case "SKIPPED":
        return semantic.status.warning.light;
      case "STARTED":
        return accentColor;
      default:
        return textSecondary;
    }
  };

  return (
    <Tr>
      <Td>
        <Tag
          bg={tagBg}
          color={textColor}
          borderRadius={tokens.borders.radii.md}
          px={tokens.spacing.sm}
          py={tokens.spacing.xs}>
          {toolType}
        </Tag>
      </Td>
      <Td>
        <Tag
          bg={tagBg}
          color={textColor}
          borderRadius={tokens.borders.radii.md}
          px={tokens.spacing.sm}
          py={tokens.spacing.xs}>
          {command}
        </Tag>
      </Td>
      <Td>
        <Box
          as="pre"
          style={{
            maxHeight: "200px",
            overflowY: "auto",
            minWidth: "200px",
            maxWidth: "200px",
            overflowX: "auto",
            fontSize: tokens.typography.fontSizes.xs,
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            padding: tokens.spacing.xs,
            textAlign: "left",
            backgroundColor: codeBg,
            borderRadius: tokens.borders.radii.sm,
            color: textColor,
          }}>
          {paramString}
        </Box>
      </Td>
      <Td>
        <Tag
          bg={tagBg}
          color={textColor}
          borderRadius={tokens.borders.radii.md}
          px={tokens.spacing.sm}
          py={tokens.spacing.xs}>
          {estimatedDuration}s
        </Tag>
      </Td>
      <Td minWidth="100px">
        <HStack
          spacing={tokens.spacing.xs}
          fontSize={tokens.typography.fontSizes.xs}
          color={getStatusColor()}>
          {status === "CREATED" ? null : status === "STARTED" ? (
            <Spinner size="sm" color={accentColor} />
          ) : status === "COMPLETED" ? (
            <Icon as={FormIcons.Check} color={semantic.status.success.light} />
          ) : status === "SKIPPED" ? (
            <Icon as={RunIcons.PlaySkipForward} color={semantic.status.warning.light} />
          ) : status === "FAILED" ? (
            <Icon as={FormIcons.Close} color={semantic.status.error.light} />
          ) : (
            <Text>{JSON.stringify(status, null, 2)}</Text>
          )}
          <Text>{timeDescription}</Text>
        </HStack>
      </Td>
      <Td>
        <Menu>
          <MenuButton
            as={Button}
            bg={accentColor}
            color="white"
            _hover={{ bg: `${accentColor}90` }}
            size="sm">
            Actions...
          </MenuButton>
          <MenuList borderColor={borderColor} boxShadow={tokens.shadows.md}>
            {queued ? (
              <MenuItem
                onClick={() => skipMutation.mutate(queueId)}
                _hover={{ bg: `${semantic.background.hover.light}50` }}>
                <Icon as={RunIcons.PlaySkipForward} color={textSecondary} />
                <Box as="span" ml={tokens.spacing.sm}>
                  Skip
                </Box>
              </MenuItem>
            ) : null}
            {queued ? (
              <MenuItem
                onClick={() => skipUntilMutation.mutate(queueId)}
                _hover={{ bg: `${semantic.background.hover.light}50` }}>
                <Icon as={RunIcons.SkipForward} color={textSecondary} />
                <Box as="span" ml={tokens.spacing.sm}>
                  Skip to this command
                </Box>
              </MenuItem>
            ) : null}
            <MenuItem
              onClick={() => execMutation.mutate(commandInfo)}
              _hover={{ bg: `${semantic.background.hover.light}50` }}>
              <Icon as={RunIcons.RunBelow} color={textSecondary} />
              <Box as="span" ml={tokens.spacing.sm}>
                Send to Tool
              </Box>
            </MenuItem>
          </MenuList>
        </Menu>
      </Td>
    </Tr>
  );
}
