import { Tag, TagProps, useColorModeValue } from "@chakra-ui/react";
import { ToolStatus } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import { getToolStatusColor } from "../../themes/colors";
import tokens from "../../themes/tokens";

type ColorScheme = TagProps["colorScheme"];

export function statusColor(status: ToolStatus | undefined): ColorScheme {
  // Use the centralized color system's getToolStatusColor function
  return getToolStatusColor(status ?? ToolStatus.UNRECOGNIZED) as ColorScheme;
}

export function displayStatus(status: ToolStatus | undefined): string {
  return (status?.toLocaleLowerCase() ?? "unknown").replace("_", " ");
}

export default function StatusTag(
  props: Omit<TagProps, "colorScheme"> & {
    status: ToolStatus | undefined;
    label?: string;
  },
): JSX.Element {
  const tagProps = {
    ...props,
    colorScheme: statusColor(props.status),
    borderRadius: tokens.borders.radii.md,
    fontWeight: "medium",
    fontSize: tokens.typography.fontSizes.sm,
    px: tokens.spacing.sm,
    py: tokens.spacing.xs,
  };
  return <Tag {...tagProps}>{props.children ?? displayStatus(props.status)}</Tag>;
}
