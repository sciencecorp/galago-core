// Common functionality for objects with HasRunStatus

import { HasRunStatus, RunStatus } from "@/types";

export function setRunStatusWithTimestamp(
  status: HasRunStatus,
  newStatus: RunStatus
) {
  const now = new Date();
  // This could be DRYed up with string literal template types, but is more
  // obvious this way
  switch (newStatus) {
    case "CREATED":
      status.createdAt = now;
      break;
    case "STARTED":
      status.startedAt = now;
      break;
    case "FAILED":
      status.failedAt = now;
      break;
    case "COMPLETED":
      status.completedAt = now;
      break;
    case "SKIPPED":
      status.skippedAt = now;
      break;
    default:
      throw new Error(`Invalid status: ${newStatus}`);
  }
  status.status = newStatus;
}
