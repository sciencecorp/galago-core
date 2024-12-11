import { Tag, IconButton } from "@chakra-ui/react";
import { ToolStatus } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import { PiWarningBold } from "react-icons/pi";

export function statusColor(status: ToolStatus | undefined) {
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
  };
  return map[status ?? ToolStatus.UNRECOGNIZED] || "gray";
}

export function displayStatus(status: ToolStatus | undefined): string {
  return (status?.toLocaleLowerCase() ?? "unknown").replace("_", " ");
}

interface RunTagProps {
  status: ToolStatus | undefined;
  handleClick?: () => void;
  label?: string;
}

export const RunTag: React.FC<RunTagProps> = ({ status, label, handleClick }) => {
  if (!status) {
    return null;
  }
  return (
    <IconButton
      aria-label={label || displayStatus(status)}
      onClick={handleClick}
      bg="transparent"
      icon={
        status === ToolStatus.FAILED ? <PiWarningBold color="red" fontSize="24px" /> : undefined
      }>
      {displayStatus(status)}
    </IconButton>
  );
};
