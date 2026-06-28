---
title: "BeneBots — Product Explainer (Interview Prep + Library)"
tags: [ias-product, explainer, interview-prep, ai-concepts, architecture, security]
product: BeneBots
headline_concepts: [client-server-ai, proxy-pattern, secrets-management, system-prompt-as-product]
created: 2026-06-14
---

# BeneBots — What It Is and How It Actually Works

> Use this two ways. Top half = the plain-English story you tell out loud. Bottom half = the technical depth for follow-up questions. The 30-second answer is the thing to know cold.

---

## 1. What it is (plain English)

BeneBots is an AI benefits-administration product: six specialized assistants (Ask BeneBot, Stewardship Studio, Plan Compare, OE Coach, LOA Navigator, Claims Compass), each tuned for a different benefits job. Employees and HR teams chat with a bot, the bot answers using a specific company's real plan data, and the answers are grounded in that data instead of guessed.

The public site runs on canned data so anyone can try it with zero cost. There is also an internal "live" mode that talks to the real Claude API.

---

## 2. The 30-second spoken answer (know this cold)

> "BeneBots is a client/server AI product. The browser is a thin React app. It never talks to the AI model directly. It sends a short request to a Cloudflare Worker I wrote, the Worker holds the API key and the system prompts server-side, picks the right bot personality from an ID, attaches the company's plan data, and proxies the call to Claude. That design exists for one reason: the secrets and the prompts are the intellectual property, so they never ship to the browser. The public demos don't even make a network call. They fall back to grounded canned answers so the demo costs nothing to run."

That single paragraph signals: you understand client/server separation, the proxy pattern, secrets management and cost control. That is a builder's answer.

---

## 3. The architecture: one request, end to end

Trace a single question from the browser to the model and back.

1. **Browser (React/TypeScript/Vite).** The user types a question. The client builds a tiny payload: `{ botId: 'ask', messages, maxTokens: 1024 }`. That is *all* it sends. No system prompt, no API key, no plan data.
   - File: `benebots/src/demo/AskDemo.tsx` → `callWorker()`

2. **Public-demo shortcut.** If no Worker URL/token is configured (the public site), the client never makes a network call at all. It matches keywords and returns a grounded canned answer after a short fake delay. Zero API spend, zero secrets shipped.
   - `CANNED[]` + `cannedAnswer()` in the same file.

3. **The Worker (the brain).** In live mode the client POSTs to the Cloudflare Worker with an `Authorization: Bearer <token>` header. The Worker:
   - Rejects anything without the shared secret token (`401`).
   - Rate-limits to 20 requests per IP per minute (`429` past that).
   - Looks up the system prompt **server-side** from `botId` in the `BOT_IDENTITIES` map. The client cannot choose or see the prompt.
   - Appends `DEMO_CONTEXT` (the company plan data) to the bot's identity prompt.
   - Validates every message shape and clamps `maxTokens` to 2048 so a caller can't drive unbounded spend.
   - Calls `api.anthropic.com` with the `ANTHROPIC_API_KEY` that lives only as a Worker secret.
   - File: `worker/index.js`

4. **Back to the browser.** The Worker returns Claude's JSON, the client reads `data.content[0].text`, and renders it.

The shape to remember: **thin client, fat secure proxy, model behind the proxy.**

---

## 4. The three concepts this demonstrates

- **Client/server separation + the proxy pattern.** The browser is untrusted, so anything secret or valuable sits behind a server you control. This is the single most important pattern in production AI apps.
- **System-prompt-as-product.** Each bot's personality and rules are a long, carefully written system prompt. Those prompts are the actual IP. They live in the Worker and never reach the client. "The prompt is the product" is a real and current idea, and you built it that way on purpose.
- **Grounding.** Every answer is anchored to `DEMO_CONTEXT` (real plan numbers: deductibles, HSA limits, COBRA windows). The bots are told never to guess and to name who to contact when data is missing. In a regulated domain that is the difference between a toy and something an HR team would trust.

---

## 5. The security war story (lean into this)

This is the part technical interviewers respect, because you lived it.

- **The mistake:** early builds embedded the Worker URL and token into the public JavaScript bundle as Vite build vars. Anyone could open dev tools and read them. The token gate was effectively bypassable.
- **The root cause:** the secrets were set as Cloudflare **build** environment variables, so every git push triggered a CI rebuild that re-embedded them, overwriting local fixes. It kept regressing.
- **The fix:** moved the creds into `.env.development.local`, which Vite loads only during `npm run dev` and never during a production `vite build`. Deleted the build-time vars from the Pages project so CI stopped re-injecting them. Verified the *live* bundle (not just the local build) shipped zero secrets.
- **The follow-through:** rotated the burned `WORKER_TOKEN`, confirmed the Worker returns `401` to anyone without it, and locked the Apify proxy path to an allowlist of one actor so nobody could run arbitrary paid jobs through it (least privilege).

The lesson you can state: *"After any secrets fix, verify the deployed artifact, not the local one. The build pipeline can re-introduce what you just removed."* That sentence alone sounds like someone who has shipped.

---

## 6. Honest limits (say these before you're asked)

- The token still ships to the *browser* in live mode, so the real gate is rate-limit + CORS allowlist + the maxTokens clamp, not the token alone. The public site sidesteps this entirely by being fully canned. A real production hardening step would be moving live demos behind proper auth (Cloudflare Access / Turnstile).
- "Live" mode depends on API credits. If they run out, only Ask BeneBot would error. The rest are canned. (Ask now has a canned fallback too.)
- Naming nuance, do not let it trip you: the *products* have names (Stewardship Studio, Plan Compare...) and the *characters* (HSABot, COBRABot...) are a separate social-media set. Public face vs private workhorse, by design.

---

## 7. Likely interview follow-ups + how to answer

- **"Why a Worker instead of calling the API from the front end?"** → Secrets and prompts can't live in a browser. The Worker is the trust boundary. It also lets me rate-limit, validate, and cap spend in one place.
- **"How do you stop it from hallucinating?"** → Grounding. The system prompt carries the actual plan data and explicitly forbids guessing, with instructions to defer to HR or the carrier when data is missing.
- **"How do you control cost?"** → maxTokens clamped server-side to 2048, rate limit per IP, and the public demo makes zero API calls at all.
- **"What would you do differently / harden next?"** → Real auth in front of live mode, move the token off the client, add observability on the Worker.

---

## Source map (for re-reading the real code)

- `worker/index.js` — the Worker: auth, rate limit, `BOT_IDENTITIES`, `DEMO_CONTEXT`, the Anthropic call, CORS, the Apify allowlist.
- `benebots/src/demo/AskDemo.tsx` — the client round trip: `callWorker()`, the canned fallback, `data.content[0].text`.
- Model in use: `claude-sonnet-4-6` (server-side, in the Worker).
- Other demos in `benebots/src/demo/` follow the same pattern with their own `botId`.
