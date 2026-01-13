import { db } from "@/db/client";
import { appSecrets, appSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { decryptSecret } from "./secretsCrypto";
import { logAuditEvent } from "./auditLog";
import { sendSmtpMail } from "./smtpClient";

async function getSetting(name: string, fallback = ""): Promise<string> {
  const rows = await db.select().from(appSettings).where(eq(appSettings.name, name)).limit(1);
  const s = rows[0];
  if (!s || s.isActive === false) return fallback;
  return (s.value ?? "").toString() || fallback;
}

async function getSecretPlaintextOptional(name: string): Promise<string | null> {
  const rows = await db.select().from(appSecrets).where(eq(appSecrets.name, name)).limit(1);
  const s = rows[0];
  if (!s || s.isActive === false) return null;
  try {
    return decryptSecret(s.encryptedValue);
  } catch {
    return null;
  }
}

async function getSecretPlaintext(name: string): Promise<string> {
  const v = await getSecretPlaintextOptional(name);
  if (!v) throw new Error(`Secret not set: ${name}`);
  return v;
}

function normalizeSlackChannel(channel: string): string {
  const c = (channel || "").trim();
  return c.startsWith("#") ? c.slice(1) : c;
}

function normalizeSlackBotToken(token: string): string {
  let t = (token || "").trim();
  if (
    t.length >= 2 &&
    ((t[0] === t[t.length - 1] && t[0] === '"') || (t[0] === t[t.length - 1] && t[0] === "'"))
  ) {
    t = t.slice(1, -1).trim();
  }
  if (t.toLowerCase().startsWith("bearer ")) t = t.slice(7).trim();
  return t;
}

export async function sendSlackMessage(opts: {
  message: string;
  channel?: string;
  auditActor?: string;
  auditAction?: string;
}): Promise<void> {
  const message = (opts.message || "").toString();
  if (!message) throw new Error("Missing message");

  const webhook = await getSecretPlaintextOptional("slack_webhook_url");
  const botTokenRaw = await getSecretPlaintextOptional("slack_bot_token");

  const channel =
    (opts.channel || "").trim() || (await getSetting("slack_default_channel", "")).trim();

  // Webhook (if present)
  if (webhook) {
    const payload: any = { text: message };
    if (channel) payload.channel = channel;
    const resp = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`Slack webhook error: ${resp.status} ${text}`.trim());
    }
    await logAuditEvent({
      actor: opts.auditActor ?? "system",
      action: opts.auditAction ?? "integrations.slack.send",
      targetType: "integration",
      targetName: "slack",
      details: { method: "webhook" },
    });
    return;
  }

  // Bot token fallback
  if (botTokenRaw) {
    const token = normalizeSlackBotToken(botTokenRaw);
    const ch = normalizeSlackChannel(channel);
    if (!ch) {
      throw new Error(
        "Slack bot token is set, but no channel is configured (slack_default_channel).",
      );
    }
    const resp = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "content-type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({ channel: ch, text: message }),
    });
    const data: any = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      throw new Error(`Slack API error: ${resp.status} ${JSON.stringify(data)}`.trim());
    }
    if (!data?.ok) {
      const err = (data?.error || "").toString().trim() || "Slack error";
      throw new Error(`Slack error: ${err}`);
    }
    await logAuditEvent({
      actor: opts.auditActor ?? "system",
      action: opts.auditAction ?? "integrations.slack.send",
      targetType: "integration",
      targetName: "slack",
      details: { method: "bot_token" },
    });
    return;
  }

  throw new Error("Slack not configured: set either slack_webhook_url or slack_bot_token.");
}

export async function sendEmailMessage(opts: {
  subject: string;
  message: string;
  auditActor?: string;
  auditAction?: string;
}): Promise<void> {
  const subject = (opts.subject || "").toString();
  const message = (opts.message || "").toString();
  if (!subject || !message) throw new Error("Missing subject or message");

  const host = (await getSetting("smtp_host", "")).trim();
  const portStr = (await getSetting("smtp_port", "587")).trim();
  const user = (await getSetting("smtp_user", "")).trim();
  const from = (await getSetting("smtp_from", "")).trim();
  const toCsv = (await getSetting("smtp_to", "")).trim();
  if (!host || !from || !toCsv) {
    throw new Error("SMTP settings incomplete (host/from/to required)");
  }
  const port = Number(portStr);
  if (!Number.isFinite(port) || port <= 0) {
    throw new Error("Invalid smtp_port");
  }
  const recipients = toCsv
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  if (recipients.length === 0) throw new Error("No recipients configured (smtp_to)");

  const password = await getSecretPlaintext("smtp_password");

  await sendSmtpMail({
    host,
    port,
    user: user || undefined,
    password: user ? password : undefined,
    from,
    to: recipients,
    subject,
    message,
  });

  await logAuditEvent({
    actor: opts.auditActor ?? "system",
    action: opts.auditAction ?? "integrations.email.send",
    targetType: "integration",
    targetName: "smtp",
    details: null,
  });
}
