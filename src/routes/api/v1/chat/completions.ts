import { createCipheriv, randomBytes, scryptSync } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const TOKEN_AUDIT_SECRET_ENV = "CHAT_PROXY_TOKEN_LOG_SECRET";

/** OpenAI Chat Completions request body (minimal / simple chat). */
const chatMessageSchema = z.object({
  role: z.enum([
    "system",
    "user",
    "assistant",
    "tool",
    "function",
    "developer",
  ]),
  content: z.union([z.string(), z.null()]),
  name: z.string().optional(),
});

const chatCompletionRequestSchema = z
  .object({
    model: z.string().min(1),
    messages: z.array(chatMessageSchema).min(1),
    temperature: z.number().optional(),
    top_p: z.number().optional(),
    n: z.number().int().positive().optional(),
    stream: z.boolean().optional(),
    stop: z.union([z.string(), z.array(z.string())]).optional(),
    max_tokens: z.number().int().optional(),
    presence_penalty: z.number().optional(),
    frequency_penalty: z.number().optional(),
    logit_bias: z.record(z.string(), z.number()).optional(),
    user: z.string().optional(),
    seed: z.number().int().optional(),
  })
  .passthrough();

function openAIError(
  message: string,
  type: string,
  param: string | null = null,
  code: string | null = null,
  status = 400,
) {
  return Response.json(
    {
      error: {
        message,
        type,
        param,
        code,
      },
    },
    { status },
  );
}

/**
 * AES-256-CBC ciphertext of the bearer token with a random IV, base64url.
 * Requires {@link TOKEN_AUDIT_SECRET_ENV}. Never logs plaintext.
 */
function encryptBearerForAudit(token: string): string | null {
  const passphrase = process.env[TOKEN_AUDIT_SECRET_ENV]?.trim();
  if (!passphrase?.length) {
    console.warn(
      `[chat/completions] ${TOKEN_AUDIT_SECRET_ENV} is not set; skipping encrypted bearer audit log.`,
    );
    return null;
  }

  const salt = Buffer.from("playground-chat-proxy-token-audit-v1");
  const key = scryptSync(passphrase, salt, 32);
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);
  return Buffer.concat([iv, encrypted]).toString("base64url");
}

function logEncryptedBearer(encoded: string | null): void {
  if (encoded == null) return;
  console.log(`[chat/completions] bearer_token_enc=${encoded}`);
}

/**
 * Loose shape check matching common OpenAI secret keys (not cryptographic verification).
 * - Legacy keys: prefix `sk-` (not project), commonly ~51 characters total (`sk-` + ~48-char body).
 * - Project keys: prefix `sk-proj-`, often ~150–180 characters (varies).
 */
function isLikelyOpenAISecretKey(secret: string): boolean {
  if (secret.length < 43 || secret.length > 260) return false;

  if (secret.startsWith("sk-proj-")) {
    return /^sk-proj-[A-Za-z0-9_-]+$/.test(secret) && secret.length >= 54;
  }

  const lower = secret.toLowerCase();
  if (
    lower.startsWith("sk-ant-api") ||
    lower.startsWith("sk_live_") ||
    lower.startsWith("sk_test_")
  ) {
    return false;
  }

  return (
    secret.startsWith("sk-") &&
    !lower.startsWith("sk-proj-") &&
    /^sk-[A-Za-z0-9_-]+$/.test(secret) &&
    secret.length <= 175
  );
}

function requireBearerToken(request: Request): Response | string {
  const auth = request.headers.get("authorization");
  const match = auth?.match(/^Bearer\s+(\S+)/i);
  if (!match) {
    return openAIError(
      "You didn't provide an OpenAI API key. Provide it in the Authorization header using Bearer auth (e.g. Authorization: Bearer YOUR_OPENAI_API_KEY). Learn more at https://platform.openai.com/docs/api-reference/authentication.",
      "invalid_request_error",
      null,
      "invalid_api_key",
      401,
    );
  }

  const token = match[1];
  if (!isLikelyOpenAISecretKey(token)) {
    return openAIError(
      "Incorrect API key provided.",
      "invalid_request_error",
      null,
      "invalid_api_key",
      401,
    );
  }

  return token;
}

export const Route = createFileRoute("/api/v1/chat/completions")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const bearer = requireBearerToken(request);
        if (bearer instanceof Response) {
          return bearer;
        }

        logEncryptedBearer(encryptBearerForAudit(bearer));

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return openAIError(
            "We could not parse the JSON body of your request.",
            "invalid_request_error",
            null,
            "invalid_json",
          );
        }

        const parsed = chatCompletionRequestSchema.safeParse(body);
        if (!parsed.success) {
          const issues = parsed.error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; ");
          return openAIError(
            issues || "Invalid request body",
            "invalid_request_error",
            null,
            null,
          );
        }

        const data = parsed.data;
        if (data.stream === true) {
          return openAIError(
            "This endpoint does not support streaming completions.",
            "invalid_request_error",
            "stream",
            null,
          );
        }

        const model = data.model;
        const now = Math.floor(Date.now() / 1000);
        const id = `chatcmpl-${crypto.randomUUID().replace(/-/g, "")}`;

        /** OpenAI Chat Completions response object (non-streaming). */
        const response = {
          id,
          object: "chat.completion" as const,
          created: now,
          model,
          choices: [
            {
              index: 0,
              message: {
                role: "assistant" as const,
                content: "this is gpt proxy",
              },
              finish_reason: "stop" as const,
              logprobs: null,
            },
          ],
          usage: {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
          },
        };

        return Response.json(response);
      },
    },
  },
});
