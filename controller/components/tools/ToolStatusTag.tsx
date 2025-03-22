import { trpc } from "@/utils/trpc";
import { Box, Spinner, Tag, HStack, useColorModeValue } from "@chakra-ui/react";
import { ToolStatus } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import moment from "moment-timezone";
import StatusTag from "./StatusTag";
import { semantic } from "../../themes/colors";
import tokens from "../../themes/tokens";

export function ToolStatusTag({ toolId }: { toolId: string }): JSX.Element {
  const statusQuery = trpc.tool.status.useQuery({ toolId: toolId });
  const accentColor = useColorModeValue(semantic.text.accent.light, semantic.text.accent.dark);
  const textColor = useColorModeValue(semantic.text.primary.light, semantic.text.primary.dark);
  const bgColor = useColorModeValue(
    semantic.background.secondary.light,
    semantic.background.secondary.dark,
  );

  if (statusQuery.isError || statusQuery.isLoadingError) {
    return (
      <Tag
        colorScheme="red"
        borderRadius={tokens.borders.radii.md}
        fontSize={tokens.typography.fontSizes.sm}
        px={tokens.spacing.sm}
        py={tokens.spacing.xs}>
        Could not load tool status
      </Tag>
    );
  }

  if (!statusQuery.isSuccess) {
    return <Spinner color={accentColor} size="sm" />;
  }

  const { status, uptime } = statusQuery.data;
  return (
    <HStack spacing={tokens.spacing.sm}>
      <StatusTag status={status} />
      <Tag
        bg={bgColor}
        color={textColor}
        borderRadius={tokens.borders.radii.md}
        fontSize={tokens.typography.fontSizes.sm}
        px={tokens.spacing.sm}
        py={tokens.spacing.xs}>
        {moment.utc(moment.duration(uptime, "seconds").asMilliseconds()).format("H:mm:ss")}
      </Tag>
    </HStack>
  );
}
