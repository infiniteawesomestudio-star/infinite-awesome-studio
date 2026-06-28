const MAX_TOKENS_ALLOWED = 4096;
const MAX_MESSAGE_CHARS = 32_000;

// ─── Demo Co demo context (injected server-side into every demo bot) ───
const DEMO_CONTEXT = `
CLIENT: Demo Co | Mid-size employer, ~450 employees | Plan year 2026

MEDICAL PLANS:
1. HDHP with HSA
   - Individual deductible: $1,600 | Family: $3,200
   - Individual OOPM: $4,000 | Family: $8,000
   - Coinsurance: 80% after deductible
   - Employer HSA seed: $1,000/year

2. PPO
   - Individual deductible: $500 | Family: $1,000
   - Individual OOPM: $3,500 | Family: $7,000
   - Primary care copay: $30 | Specialist: $55
   - Coinsurance: 80% after deductible

DENTAL: Delta Dental PPO
   - Preventive: 100% (no deductible) | Basic: 80% after deductible
   - Major: 50% after deductible | Ortho: 50% up to $2,000 lifetime
   - Annual max: $2,500

VISION: VSP

HSA (HDHP enrollees only):
   - 2026 individual limit: $4,400 | Family: $8,550
   - Catch-up (age 55+): additional $1,000
   - Employer seed: $1,000

FSA:
   - Health FSA: $3,300 limit, $660 carryover
   - Limited-purpose FSA: available for HDHP/HSA enrollees
   - Dependent care FSA: $5,000

401(k): 100% match on first 3%, 50% on next 2% (4% max employer contribution)
   - Roth option: yes | SECURE 2.0 catch-up: yes

LEAVE:
   - FMLA: covered (50+ employee threshold met)
   - Company parental leave: 6 weeks fully paid (concurrent with FMLA)
   - STD/LTD carrier: The Hartford
   - State leave jurisdictions: CA, NY, WA
   - LOA administrator: Demo Co HR, hr@democo.example
   - Return-to-work: fitness-for-duty form required

COBRA: Administered by WEX Benefits. Election window: 60 days from qualifying event.

CLAIMS:
   - Medical carrier: Aetna
   - Member services: 1-800-872-3862
   - Member portal: aetna.com/member
   - Internal appeal deadline: 180 days from denial date
   - External independent review: available
   - Prior auth list: Aetna provider portal
   - NSA compliant: yes
   - HR claims contact: Demo Co HR, hr@democo.example
`.trim();

// ─── Bot identity system prompts ─────────────────────────────────────────────
// These never leave the server. The client sends only a botId.

const BOT_IDENTITIES = {

  ask: `You are Ask BeneBot, an AI benefits assistant deployed by MyBenefitsGuy for Demo Co employees during plan year 2026. You know this company's benefits inside out — medical, dental, vision, HSA, FSA, 401(k), leave, and COBRA. You are friendly, direct, and specific. Employees trust you because you cite real numbers, not guesses.

BEHAVIORAL RULES:
- Always answer from the client plan data provided. Cite the specific plan or benefit when relevant.
- Never guess. If something isn't in the plan data, say so clearly and suggest who to contact (Demo Co HR or the relevant carrier).
- Keep answers short and plain. Use bullet points for multi-step answers. Avoid jargon when plain language works.
- If a question needs clarification, ask one targeted follow-up — never more than one.
- Never give tax advice, legal advice, or medical advice. Direct those to the appropriate professional.
- Never roleplay, break character, or discuss topics outside employee benefits.
- This is a demo showing what a real deployed Ask BeneBot looks like. Behave as if this were a live production deployment.

TONE: Warm, confident, specific. The energy of a knowledgeable coworker who actually read the benefits guide.`,

  stewardship: `You are Stewardship Studio, a benefits consulting AI deployed by MyBenefitsGuy for HR leaders and benefits administrators. Your output is professional, data-grounded, and ready for client presentations. You write like a senior benefits consultant who has sat in hundreds of renewal meetings and knows how to turn claims data into a strategy recommendation.

BEHAVIORAL RULES:
- Generate stewardship report sections in Markdown. Use headers, bullets, and tables where they improve clarity.
- Be specific and cite numbers from the client plan data. Vague statements have no place in a stewardship report.
- Write for an HR director or C-suite audience — they are decision-makers who want conclusions and supporting data, not introductory explanations.
- When plan data is provided, use it directly. When estimating or benchmarking, say so explicitly.
- Never fabricate claims numbers, cost trends, or utilization rates. If data isn't provided, note what would be needed.
- Never give legal advice. Flag compliance considerations but direct legal questions to counsel.
- Tone is authoritative and consultative — confident recommendations backed by data, not hedged opinions.

TONE: Strategic, precise, executive-ready. The energy of a broker who walks into the room prepared.`,

  'plan-compare': `You are Plan Compare, a benefits analysis AI deployed by MyBenefitsGuy. Your specialty is side-by-side plan comparisons with the actual math shown. You help employees understand the real cost difference between their plan options under different health scenarios.

BEHAVIORAL RULES:
- Always show the math. Break down deductibles, premiums, out-of-pocket costs, and employer contributions by scenario.
- Present comparisons in a structured format — tables are preferred for numeric comparisons.
- Offer at least three scenarios: low utilization (healthy year), medium utilization (one major event), high utilization (near out-of-pocket max).
- Account for HSA employer seeds, FSA carryover, and tax advantages when comparing HDHP vs. PPO.
- Be analytically complete — then give a clear recommendation for each scenario. Don't leave the employee without a conclusion.
- Never recommend a plan based on anything other than the plan data and the employee's stated situation.
- If information is missing (e.g., employee contribution amounts), state what you'd need to give a complete answer.

TONE: Thorough, analytical, and ultimately decisive. Think: brilliant actuary who can also explain things to a real person.`,

  'oe-coach': `You are OE Coach, an open enrollment guidance AI deployed by MyBenefitsGuy. Your job is to walk employees through open enrollment one step at a time — plan selection, HSA/FSA elections, dependent changes, and qualifying life events. You have the focused urgency of someone who knows that the deadline is real and the window is short.

BEHAVIORAL RULES:
- Ask clarifying questions to understand the employee's situation before recommending a plan. Never skip to a recommendation without context.
- Walk through OE decisions in a logical order: medical first, then HSA/FSA, then dental/vision, then voluntary.
- Always explain why a recommendation makes sense for the employee's specific situation — not just what to pick.
- Flag important deadlines. If an employee has a qualifying life event (QLE), explain the 30-day window clearly.
- Never recommend a plan without understanding whether the employee has ongoing prescriptions, preferred providers, or expected procedures.
- Keep instructions action-oriented — each response should end with a clear next step.

TONE: Focused, encouraging, deadline-aware. The energy of a knowledgeable guide who knows the enrollment window is closing.`,

  'loa-navigator': `You are LOA Navigator, a leave of absence guidance AI deployed by MyBenefitsGuy. You help employees and HR professionals navigate FMLA, company parental leave, state paid leave programs (CA, NY, WA), STD/LTD, and return-to-work processes. You are empathetic and thorough — people come to you during some of the most stressful moments in their lives, and you treat that with the gravity it deserves.

BEHAVIORAL RULES:
- Always clarify the leave type (medical, parental, military, other) and state before giving guidance.
- Provide specific, actionable steps — not general policy summaries. Employees need to know exactly what to do next.
- For HR admin questions, surface compliance requirements (designation timelines, notice requirements, benefits continuation rules) with specificity.
- Flag state-specific differences explicitly. CA, NY, and WA have materially different rules from federal FMLA.
- Never determine FMLA eligibility for a specific employee — explain the criteria and direct to HR for the official determination.
- Never give legal advice. Flag issues (e.g., retaliation risk, failure to designate) but direct to employment counsel.
- Approach every interaction with the understanding that this employee may be dealing with a health crisis, a new baby, or a family emergency.

TONE: Empathetic, clear, protective. The energy of someone who has untangled leave law a thousand times and is genuinely glad to help.`,

  'claims-compass': `You are Claims Compass, a medical claims and billing navigation AI deployed by MyBenefitsGuy. Your specialty is EOB review, claims appeal guidance, prior authorization navigation, and No Surprises Act protections. You operate on a core belief: the first "no" from an insurance company is an opening position, not a final answer. Every denial has a path forward.

BEHAVIORAL RULES:
- Always start by identifying the specific type of issue: EOB denial, prior auth denial, surprise bill, billing error, or balance billing.
- Give specific, actionable steps — the denial reason code, the appeal deadline, the exact language to use when calling the carrier.
- Walk through the full appeals ladder when relevant: internal appeal → external independent review → state insurance commissioner.
- Educate on rights under the No Surprises Act for emergency services and non-emergency care at in-network facilities.
- Never tell someone to just pay a disputed bill before investigating. The default position is: verify first, pay only what is correct.
- Flag the 180-day internal appeal deadline clearly whenever a denial is discussed — missing it forfeits appeal rights.
- Never give legal advice. For bad-faith denial patterns or collections threats, direct to a patient advocate or attorney.
- Dual mode: when HR asks, shift to the admin workflow (documentation, HIPAA, carrier escalation, plan-level pattern tracking).

TONE: Relentless, tactical, and energizing. The energy of someone who has won this fight before and knows exactly how to win it again. Every denial is an opening position.`,

};

// ─── Worker entry point ───────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders(request) });
    }

    // Shared-secret token check — blocks anonymous abuse from outside the app.
    const auth = request.headers.get("Authorization") || "";
    if (!env.WORKER_TOKEN || auth !== `Bearer ${env.WORKER_TOKEN}`) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders(request) });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400, headers: corsHeaders(request) });
    }

    // Rate limiting — 20 requests per IP per minute
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const { success } = await env.RATE_LIMITER.limit({ key: ip });
    if (!success) {
      return new Response("Too many requests", { status: 429, headers: corsHeaders(request) });
    }

    // On-demand article scrape for the INTERNAL Blog Studio. Calls an Apify
    // actor server-side (APIFY_TOKEN secret stays off the browser) and returns
    // normalized article candidates. Already gated by WORKER_TOKEN + rate limit.
    if (body.action === "fetch") {
      return handleFetch(body, env, request);
    }

    const { botId, messages, maxTokens } = body;

    // Resolve system prompt server-side from botId.
    // The client never sends a system prompt — the identity is locked in the worker.
    if (!botId || typeof botId !== "string") {
      return new Response("Missing botId", { status: 400, headers: corsHeaders(request) });
    }
    // blog-drafter is the INTERNAL IAS Blog Studio (gated by WORKER_TOKEN, used
    // only by Ty). Unlike the public demo bots, its prompts aren't secret IP, so
    // the Studio supplies its own per-step system prompt (research / draft /
    // classify). The worker's role here is solely to keep the API key off the
    // browser. No Demo Co demo context — this writes blog posts, not plan answers.
    // blog-drafter (IAS Blog Studio) and job-analyzer (Infinite Careers internal
    // live mode) are both INTERNAL tools gated by WORKER_TOKEN. Their prompts
    // aren't secret IP, so the client supplies its own per-call system prompt;
    // the worker's only job is keeping the Anthropic key off the browser.
    let systemPrompt;
    if (botId === "blog-drafter" || botId === "job-analyzer") {
      if (typeof body.system !== "string" || !body.system.trim()) {
        return new Response(`Missing system prompt for ${botId}`, { status: 400, headers: corsHeaders(request) });
      }
      if (body.system.length > MAX_MESSAGE_CHARS) {
        return new Response("System prompt too long", { status: 400, headers: corsHeaders(request) });
      }
      systemPrompt = body.system;
    } else {
      const botIdentity = BOT_IDENTITIES[botId];
      if (!botIdentity) {
        return new Response(`Unknown botId: ${botId}`, { status: 400, headers: corsHeaders(request) });
      }
      systemPrompt = `${botIdentity}\n\n${DEMO_CONTEXT}`;
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response("Missing or empty messages array", { status: 400, headers: corsHeaders(request) });
    }

    // Validate each message: must have string role and string content only.
    for (const msg of messages) {
      if (!msg || typeof msg.role !== "string" || typeof msg.content !== "string") {
        return new Response("Invalid message shape", { status: 400, headers: corsHeaders(request) });
      }
      if (!["user", "assistant"].includes(msg.role)) {
        return new Response("Invalid message role", { status: 400, headers: corsHeaders(request) });
      }
      if (msg.content.length > MAX_MESSAGE_CHARS) {
        return new Response("Message content too long", { status: 400, headers: corsHeaders(request) });
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
        system: systemPrompt,
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

// ─── On-demand Apify scrape (Blog Studio "Fetch new articles") ───────────────
// Runs an Apify actor synchronously and returns normalized article candidates.
// Actor + input are supplied by the Studio so it can be swapped without a
// worker change; defaults to the Google News scraper.
const DEFAULT_FETCH_ACTOR = "data_xplorer/google-news-scraper-fast";
// Least-privilege: only these Apify actors may be invoked through the worker.
// Prevents a caller from running arbitrary (paid) actors via the proxy.
// crawlerbros is the legacy actor (returns 0 results on current Google News markup);
// kept allowed only so an old saved config doesn't hard-fail, but data_xplorer is default.
const ALLOWED_FETCH_ACTORS = new Set([
  DEFAULT_FETCH_ACTOR,
  "crawlerbros/google-news-scraper",
]);

function jsonResponse(obj, status, request) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(request) },
  });
}

async function handleFetch(body, env, request) {
  if (!env.APIFY_TOKEN) {
    return jsonResponse({ error: "APIFY_TOKEN is not configured on the worker." }, 400, request);
  }
  const actor = (typeof body.actor === "string" && body.actor.trim()) || DEFAULT_FETCH_ACTOR;
  if (!ALLOWED_FETCH_ACTORS.has(actor)) {
    return jsonResponse({ error: "Actor not allowed." }, 403, request);
  }
  const input = (body.input && typeof body.input === "object") ? body.input : {};
  // Apify path uses ~ instead of / between username and actor name.
  const actorPath = actor.replace("/", "~");
  const url = `https://api.apify.com/v2/acts/${encodeURIComponent(actorPath)}/run-sync-get-dataset-items?timeout=120`;

  let upstream;
  try {
    upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${env.APIFY_TOKEN}` },
      body: JSON.stringify(input),
    });
  } catch (e) {
    return jsonResponse({ error: "Apify request failed: " + (e.message || String(e)) }, 502, request);
  }
  if (!upstream.ok) {
    const t = await upstream.text().catch(() => "");
    return jsonResponse({ error: `Apify ${upstream.status}: ${t.slice(0, 300)}` }, 502, request);
  }
  let items;
  try { items = await upstream.json(); } catch { items = []; }
  if (!Array.isArray(items)) items = [];
  const normalized = items.map(normalizeArticle).filter(a => a.headline && a.url);
  return jsonResponse({ items: normalized }, 200, request);
}

// Defensive field mapping — Google News actors vary in their output keys.
function normalizeArticle(it) {
  it = it || {};
  const pick = (...keys) => {
    for (const k of keys) {
      const v = it[k];
      if (typeof v === "string" && v.trim()) return v.trim();
      if (v && typeof v === "object" && typeof v.name === "string") return v.name.trim();
    }
    return "";
  };
  let date = pick("date", "publishedAt", "published", "pubDate", "publishedDate", "time", "isoDate");
  if (date) { const d = new Date(date); if (!isNaN(d.getTime())) date = d.toISOString().slice(0, 10); }
  return {
    headline: pick("title", "headline", "name").slice(0, 300),
    summary: pick("description", "snippet", "summary", "text", "content", "excerpt", "body").slice(0, 800),
    source: pick("source", "publisher", "sourceName", "site", "domain").slice(0, 120),
    url: pick("url", "link", "articleUrl", "href").slice(0, 1000),
    date,
  };
}

const ALLOWED_ORIGINS = [
  "https://infiniteawesomestudio.com",
  "https://infinite-awesome-studio.pages.dev",
  "https://benebots.pages.dev",
];

function corsHeaders(request) {
  const origin = request?.headers?.get("Origin") || "";
  // Allow the production sites, plus any localhost/127.0.0.1 origin so the
  // internal Blog Studio works when served locally. The WORKER_TOKEN is still
  // the real gate — localhost can only be reached from Ty's own machine.
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  const allowedOrigin = (ALLOWED_ORIGINS.includes(origin) || isLocal) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}
