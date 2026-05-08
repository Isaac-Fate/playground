/**
 * Decrypts payloads logged by `src/routes/api/v1/chat/completions.ts`:
 * `[chat/completions] bearer_token_enc=<base64url>`
 *
 * Must match TOKEN_AUDIT_SECRET_ENV and salt there exactly.
 *
 * Loads `CHAT_PROXY_TOKEN_LOG_SECRET` from the repo's `.env`, then `.env.local`
 * (`.env.local` overrides `.env` and existing `process.env` for keys it defines).
 */

import { createDecipheriv, scryptSync } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

config({ path: resolve(repoRoot, ".env") });
config({ path: resolve(repoRoot, ".env.local"), override: true });

const TOKEN_AUDIT_SECRET_ENV = "CHAT_PROXY_TOKEN_LOG_SECRET";
/** Must stay in sync with `encryptBearerForAudit` in chat completions route. */
const SCRYPT_SALT_UTF8 = "playground-chat-proxy-token-audit-v1";

function extractCiphertext(raw: string): string {
  const trimmed = raw.trim();
  const fromLog =
    trimmed.match(/bearer_token_enc=([^\s\r\n]+)/)?.[1] ?? trimmed;
  return fromLog.trim();
}

function decryptBearerAuditBase64Url(encoded: string): string {
  const passphrase = process.env[TOKEN_AUDIT_SECRET_ENV]?.trim();
  if (!passphrase?.length) {
    throw new Error(
      `${TOKEN_AUDIT_SECRET_ENV} is missing. Add it to .env or .env.local in the project root (loaded automatically), or export it in your shell.`,
    );
  }

  const salt = Buffer.from(SCRYPT_SALT_UTF8);
  const key = scryptSync(passphrase, salt, 32);

  let combined: Buffer;
  try {
    combined = Buffer.from(encoded, "base64url");
  } catch {
    throw new Error("Invalid ciphertext: not valid base64url.");
  }

  if (combined.length < 16 + 1) {
    throw new Error("Invalid ciphertext: too short.");
  }

  const iv = combined.subarray(0, 16);
  const ciphertext = combined.subarray(16);
  const decipher = createDecipheriv("aes-256-cbc", key, iv);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString(
    "utf8",
  );
}

function readInput(): string {
  const arg = process.argv[2];
  if (arg) return arg;
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

const input = readInput();
const cipherText = extractCiphertext(input);

if (!cipherText) {
  console.error(
    `Usage: pnpm decrypt:chat-proxy-bearer '<base64-or-log-line>'
   Or pipe: echo "...bearer_token_enc=..." | pnpm decrypt:chat-proxy-bearer

Set ${TOKEN_AUDIT_SECRET_ENV} in .env or .env.local (repo root: ${repoRoot}).`,
  );
  process.exit(1);
}

try {
  process.stdout.write(decryptBearerAuditBase64Url(cipherText));
  process.stdout.write("\n");
} catch (e) {
  console.error(
    e instanceof Error ? e.message : e,
    "\n(Ciphertext formats can change — ensure this script matches the latest route encryption.)",
  );
  process.exit(1);
}
