import { db } from "@/db/client";
import { webhooks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logAuditEvent } from "@/server/utils/auditLog";
import { logAction } from "@/server/logger";

export interface WebhookPayload {
  event: "command.completed" | "command.failed";
  timestamp: string;
  runId: string;
  toolType: string;
  toolId: string;
  command: string;
  status: string;
  params: Record<string, any>;
  data?: string | null;
  errorMessage?: string;
}

export async function dispatchWebhooks(payload: WebhookPayload): Promise<void> {
  let activeWebhooks;
  try {
    activeWebhooks = await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.isActive, true));
  } catch (e) {
    logAction({
      level: "error",
      action: "Webhook Dispatch Error",
      details: `Failed to fetch webhooks: ${e}`,
    });
    return;
  }

  for (const webhook of activeWebhooks) {
    if (webhook.toolTypes && !webhook.toolTypes.includes(payload.toolType)) {
      continue;
    }
    if (webhook.commands && !webhook.commands.includes(payload.command)) {
      continue;
    }

    const body = webhook.includeData
      ? payload
      : { ...payload, data: undefined };

    fireWebhook(webhook.url, webhook.name, body).catch(() => {});
  }
}

async function fireWebhook(
  url: string,
  name: string,
  body: Record<string, any>,
): Promise<void> {
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    if (!resp.ok) {
      logAction({
        level: "warning",
        action: "Webhook Delivery Failed",
        details: `Webhook "${name}" to ${url} returned ${resp.status}`,
      });
    }

    await logAuditEvent({
      actor: "system",
      action: "webhooks.dispatch",
      targetType: "webhook",
      targetName: name,
      details: { url, status: resp.status },
    });
  } catch (e) {
    logAction({
      level: "warning",
      action: "Webhook Delivery Error",
      details: `Webhook "${name}" to ${url} failed: ${e instanceof Error ? e.message : e}`,
    });
  }
}
