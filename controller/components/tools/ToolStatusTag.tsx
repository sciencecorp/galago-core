import { trpc } from "@/utils/trpc";
import { Box, Spinner, Tag } from "@chakra-ui/react";
import { ToolStatus } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import moment from "moment-timezone";
import StatusTag from "./StatusTag";

export function ToolStatusTag({
  toolId,
  isConfiguring = false,
}: {
  toolId: string;
  isConfiguring?: boolean;
}): JSX.Element {
  const statusQuery = trpc.tool.status.useQuery({ toolId: toolId });
  if (statusQuery.isError || statusQuery.isLoadingError) {
    return <Tag colorScheme="red">Could not load tool status</Tag>;
  }
  if (!statusQuery.isSuccess) {
    return <Spinner />;
  }
  const { status, uptime } = statusQuery.data;

  return (
    <Box>
      {isConfiguring ? (
        <Box display="inline-flex" alignItems="center">
          <Spinner size="sm" mr={2} />
          <Tag>Configuring...</Tag>
        </Box>
      ) : (
        <StatusTag status={status} />
      )}
      <Tag ml={2}>
        {moment
          .utc(moment.duration(uptime, "seconds").asMilliseconds())
          .format("H:mm:ss")}
      </Tag>
    </Box>
  );
}
