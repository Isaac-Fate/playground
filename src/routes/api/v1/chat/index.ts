import { createFileRoute } from "@tanstack/react-router";

const PUBLIC_BASE_URL = "https://playground.isaacfei.com";

export const Route = createFileRoute("/api/v1/chat/")({
  server: {
    handlers: {
      GET: () => {
        return Response.json({
          title: "Blazing fast OpenAI chat proxy",
          audience:
            "Built with Chinese users in mind—use this endpoint from your tooling with lower friction than routing cross-border to api.openai.com directly.",
          description:
            `Hosted at ${PUBLIC_BASE_URL}. Ultra-light OpenAI Chat Completions: requests and responses use the Chat Completions API as documented by OpenAI, with low-latency responses (no upstream model hop). Point OpenAI SDKs or HTTP clients here instead of api.openai.com when you want a fast, predictable stand-in.`,
          base_url: PUBLIC_BASE_URL,
          documentation:
            "https://platform.openai.com/docs/api-reference/chat/create",
          endpoints: [
            {
              name: "chat.completions",
              method: "POST",
              path: "/api/v1/chat/completions",
              url: `${PUBLIC_BASE_URL}/api/v1/chat/completions`,
              summary:
                "Non-streaming OpenAI chat completion. Requests and responses follow the Chat Completions API documented at OpenAI.",
              authentication: {
                header: "Authorization",
                scheme: "Bearer",
                note: "Send a valid-looking OpenAI API secret in the Bearer token. The server checks format only (this proxy never calls OpenAI).",
              },
              request: {
                content_type: "application/json",
                required_fields: {
                  model: "string — echoed back in the response",
                  messages: "array of { role, content } chat messages (roles used here: system, user, assistant, tool, function, developer)",
                },
                limitations: ["stream: true is not supported"],
              },
              response: {
                content_type: "application/json",
                note: "OpenAI chat.completion object; assistant message content is fixed for this deployment.",
              },
            },
          ],
          example_curl: `curl -X POST "${PUBLIC_BASE_URL}/api/v1/chat/completions" \\
  -H "Authorization: Bearer $YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Hello"}]}'`,
        });
      },
    },
  },
});
