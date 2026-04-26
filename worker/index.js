const MAX_TOKENS_ALLOWED = 2048;
const MAX_MESSAGE_CHARS = 32_000;

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Shared-secret token check — blocks anonymous abuse from outside the app.
    const auth = request.headers.get("Authorization") || "";
    if (!env.WORKER_TOKEN || auth !== `Bearer ${env.WORKER_TOKEN}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    // Rate limiting — 20 requests per IP per minute
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const { success } = await env.RATE_LIMITER.limit({ key: ip });
    if (!success) {
      return new Response("Too many requests", { status: 429, headers: corsHeaders(request) });
    }

    const { system, messages, maxTokens } = body;

    // Validate system prompt if provided
    if (system !== undefined && system !== null) {
      if (typeof system !== "string") {
        return new Response("system must be a string", { status: 400 });
      }
      if (system.length > 8000) {
        return new Response("system prompt too long", { status: 400 });
      }
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response("Missing or empty messages array", { status: 400 });
    }

    // Validate each message: must have string role and string content only.
    for (const msg of messages) {
      if (!msg || typeof msg.role !== "string" || typeof msg.content !== "string") {
        return new Response("Invalid message shape", { status: 400 });
      }
      if (!["user", "assistant"].includes(msg.role)) {
        return new Response("Invalid message role", { status: 400 });
      }
      if (msg.content.length > MAX_MESSAGE_CHARS) {
        return new Response("Message content too long", { status: 400 });
      }
    }

    // Clamp maxTokens — never let the client drive unbounded spending.
    const safeMaxTokens = Math.min(
      typeof maxTokens === "number" && maxTokens > 0 ? maxTokens : 1024,
      MAX_TOKENS_ALLOWED
    );

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: safeMaxTokens,
        system,
        messages,
      }),
    });

    const data = await upstream.text();
    return new Response(data, {
      status: upstream.status,
      headers: { "Content-Type": "application/json", ...corsHeaders(request) },
    });
  },
};

const ALLOWED_ORIGINS = [
  "https://infiniteawesomestudio.com",
  "https://infinite-awesome-studio.pages.dev",
  "https://benebots.pages.dev",
];

function corsHeaders(request) {
  const origin = request?.headers?.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}
