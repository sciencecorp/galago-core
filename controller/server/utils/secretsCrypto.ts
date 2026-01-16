import crypto from "node:crypto";

export type SecretsKeyStatus = { configured: boolean; message?: string | null };

const ENC_PREFIX = "enc:v1";

function tryParseKey(raw: string | undefined): Buffer | null {
  if (!raw) return null;
  const s = raw.trim();
  if (!s) return null;

  // Hex (32 bytes => 64 hex chars)
  if (/^[0-9a-fA-F]{64}$/.test(s)) {
    return Buffer.from(s, "hex");
  }

  // Base64 (32 bytes)
  try {
    const b = Buffer.from(s, "base64");
    if (b.length === 32) return b;
  } catch {
    // ignore
  }

  // Raw string (use utf8 bytes)
  const utf8 = Buffer.from(s, "utf8");
  if (utf8.length === 32) return utf8;

  return null;
}

export function secretsKeyStatus(): SecretsKeyStatus {
  const key = tryParseKey(process.env.GALAGO_SECRETS_KEY);
  if (!key) {
    return {
      configured: false,
      message:
        "GALAGO_SECRETS_KEY is missing or invalid. Provide 32-byte key as hex (64 chars) or base64.",
    };
  }
  return { configured: true, message: null };
}

function getKeyOrThrow(): Buffer {
  const key = tryParseKey(process.env.GALAGO_SECRETS_KEY);
  if (!key) {
    throw new Error(
      "Secrets encryption is not configured: set GALAGO_SECRETS_KEY (32-byte key: hex64 or base64)",
    );
  }
  return key;
}

export function encryptSecret(plaintext: string): string {
  const key = getKeyOrThrow();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    ENC_PREFIX,
    iv.toString("base64"),
    tag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(":");
}

export function decryptSecret(encoded: string): string {
  const key = getKeyOrThrow();
  const parts = String(encoded || "").split(":");
  if (parts.length !== 4 || parts[0] !== ENC_PREFIX) {
    throw new Error("Invalid encrypted secret format");
  }
  const iv = Buffer.from(parts[1], "base64");
  const tag = Buffer.from(parts[2], "base64");
  const ciphertext = Buffer.from(parts[3], "base64");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString("utf8");
}
