/**
 * One-shot OpenAI Chat Completions call to verify `OPENAI_API_KEY` from
 * `.env` / `.env.local` (same loading order as other scripts).
 *
 * Run: pnpm openai:chat-test
 */

import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

config({ path: resolve(repoRoot, ".env") });
config({ path: resolve(repoRoot, ".env.local"), override: true });

const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";

async function main(): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    console.error(
      "OPENAI_API_KEY is missing. Set it in .env.local (or .env) in the project root.",
    );
    process.exitCode = 1;
    return;
  }

  const model = process.env.OPENAI_TEST_MODEL?.trim() || "gpt-4o-mini";
  const userMessage =
    process.env.OPENAI_TEST_PROMPT?.trim() ||
    "Reply with exactly: ok-connection";

  const res = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: userMessage }],
      max_tokens: 64,
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    console.error("OpenAI API error:", res.status, res.statusText);
    console.error(raw);
    process.exitCode = 1;
    return;
  }

  let data: unknown;
  try {
    data = JSON.parse(raw) as unknown;
  } catch {
    console.error("Response was not JSON:", raw.slice(0, 500));
    process.exitCode = 1;
    return;
  }

  const content =
    typeof data === "object" &&
    data !== null &&
    "choices" in data &&
    Array.isArray((data as { choices?: unknown }).choices)
      ? (data as { choices: Array<{ message?: { content?: string } }> })
          .choices[0]?.message?.content
      : undefined;

  console.log("model:", model);
  console.log("assistant:", content?.trim() ?? "(no content)");
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
