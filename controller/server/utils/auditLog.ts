import { db } from "@/db/client";
import { appAuditEvents } from "@/db/schema";

export async function logAuditEvent(opts: {
  actor?: string;
  action: string;
  targetType: string;
  targetName?: string | null;
  details?: Record<string, any> | null;
}): Promise<void> {
  const now = new Date().toISOString();
  try {
    await db.insert(appAuditEvents).values({
      actor: opts.actor ?? "system",
      action: opts.action,
      targetType: opts.targetType,
      targetName: opts.targetName ?? null,
      details: opts.details ?? null,
      createdAt: now,
      updatedAt: now,
    });
  } catch {
    // Audit failures should never break core flows.
  }
}
