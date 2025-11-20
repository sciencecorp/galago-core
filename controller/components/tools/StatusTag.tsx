import { Tag, TagProps } from "@chakra-ui/react";
import { ToolStatus } from "gen-interfaces/tools/grpc_interfaces/tool_base";

type ColorScheme = TagProps["colorScheme"];

export function statusColor(status: ToolStatus | undefined): ColorScheme {
  const map = {
    READY: "green",
    SIMULATED: "blue",
    BUSY: "teal",
    FAILED: "red",
    OFFLINE: "gray",
    NOT_CONFIGURED: "yellow",
    INITIALIZING: "orange",
    UNKNOWN_STATUS: "gray",
    UNRECOGNIZED: "gray",
  } as const satisfies Record<ToolStatus, ColorScheme>;
  return map[status ?? ToolStatus.UNRECOGNIZED] || "gray";
}

export function displayStatus(status: ToolStatus | undefined): string {
  return (status?.toLocaleLowerCase() ?? "unknown").replace("_", " ");
}

export default function StatusTag(
  props: Omit<TagProps, "colorScheme"> & {
    status: ToolStatus | undefined;
    label?: string;
  }
): JSX.Element {
  const tagProps = {
    ...props,
    colorScheme: statusColor(props.status),
  };
  return (
    <Tag {...tagProps}>{props.children ?? displayStatus(props.status)}</Tag>
  );
}
