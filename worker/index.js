const MAX_TOKENS_ALLOWED = 8192;
const MAX_MESSAGE_CHARS = 32_000;

// ─── Public (tokenless) route config — Infinite Careers only ─────────────────
// The public site cannot ship WORKER_TOKEN (Vite would inline it into the JS
// bundle), so job-analyzer gets a second, tokenless path gated by layered
// defenses instead of a shared secret: hard origin lock + Turnstile + per-IP
// hourly KV cap + a global daily KV spend cap. Pilot access codes (PILOT_CODES
// secret) bypass Turnstile and the caps for named private testers.
const PUBLIC_BOT = "job-analyzer";
const PUBLIC_ORIGIN = "https://infiniteawesomestudio.com";
const PUBLIC_MAX_CALLS_PER_REQUEST = 2; // one analysis = 2 Claude calls, batched
const DEFAULT_IP_HOURLY_LIMIT = 5;      // public requests per IP per hour
const DEFAULT_DAILY_CAP = 60;           // public requests per day, all IPs

// All bots now run on Sonnet 5 (the newer, cheaper agentic default). job-analyzer
// moved first (2026-07-06); the BeneBots demos and Blog Studio followed on 2026-07-12.
// Kept as a function so a single bot can be pinned to a different model later if needed.
function modelFor(botId) {
  return "claude-sonnet-5";
}

// ─── Tenant context ──────────────────────────────────────────────────────────
// Every BeneBots chat call is scoped to one tenant (a client employer). The
// system prompt is composed server-side as:
//   bot identity + STATUTORY_2026 (law, shared) + the tenant's plan design.
// Statutory figures live ONLY in STATUTORY_2026 so a correction is one edit
// that reaches every tenant. Tenant records carry plan design only.
//
// Fictional demo tenants are built in below. Real tenants live in the TENANTS
// KV namespace under `tenant:<tenantId>`, so onboarding a client is a data
// operation (see tools/build-tenant.mjs), not a code deploy.
//
// Unknown or missing tenantId FAILS CLOSED. There is deliberately no default
// tenant: a silent fallback to Demo Co is the exact defect this replaced.
const TENANT_ID_RE = /^[a-z0-9][a-z0-9-]{1,62}$/;
const DEFAULT_TENANT_DAILY_CAP = 200; // chat calls per tenant per UTC day

// Verified 2026 figures: Rev. Proc. 2025-19 (HSA/HDHP), Rev. Proc. 2025-32
// (FSA), OBBBA (DCFSA), Notice 2025-67 (401(k)). Last checked 2026-06-20.
// Re-verify every plan year.
const STATUTORY_2026 = `
FEDERAL LIMITS FOR 2026 (statutory, identical for every employer):
   - HSA contribution limit: $4,400 self-only | $8,750 family
   - HSA catch-up (age 55+): additional $1,000
   - HDHP minimum deductible: $1,700 self-only | $3,400 family
   - HDHP maximum out-of-pocket: $8,500 self-only | $17,000 family
   - Health FSA: $3,400 limit | carryover up to $680 (if the plan offers carryover)
   - Dependent care FSA: $7,500 per household ($3,750 if married filing separately)
   - 401(k) employee deferral: $24,500 | catch-up 50+: additional $8,000 | ages 60-63: additional $11,250 instead
   - 401(k) catch-ups for employees with over $150,000 prior-year FICA wages must be Roth
   - HSA and a general-purpose health FSA cannot be combined. HDHP/HSA enrollees may use a limited-purpose FSA (dental and vision).
`.trim();

// ─── Built-in fictional demo tenants (plan design only, no statutory figures) ─
const DEMO_TENANTS = {
  "demo-co": {
    tenantId: "demo-co",
    displayName: "Demo Co",
    demo: true,
    planYear: "2026",
    contextBlock: `
CLIENT: Demo Co | Mid-size employer, ~450 employees | Plan year 2026

MEDICAL PLANS:
1. HDHP with HSA
   - Individual deductible: $1,700 | Family: $3,400
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
   - Employer seed: $1,000/year

FSA:
   - Health FSA offered, with carryover
   - Limited-purpose FSA: available for HDHP/HSA enrollees
   - Dependent care FSA offered

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
`.trim(),
  },

  northpoint: {
    tenantId: "northpoint",
    displayName: "Northpoint Manufacturing",
    demo: true,
    planYear: "2026",
    contextBlock: `
CLIENT: Northpoint Manufacturing | Large employer, ~1,800 employees | Plan year 2026

MEDICAL PLANS:
1. HDHP with HSA
   - Individual deductible: $2,000 | Family: $4,000
   - Individual OOPM: $5,000 | Family: $10,000
   - Coinsurance: 70% after deductible
   - Employer HSA seed: $500/year

2. PPO
   - Individual deductible: $750 | Family: $1,500
   - Individual OOPM: $4,000 | Family: $8,000
   - Primary care copay: $35 | Specialist: $70
   - Coinsurance: 70% after deductible

DENTAL: MetLife PPO
   - Preventive: 100% (no deductible) | Basic: 80% after deductible
   - Major: 50% after deductible | Ortho: 50% up to $1,500 lifetime
   - Annual max: $1,500

VISION: EyeMed

HSA (HDHP enrollees only):
   - Employer seed: $500/year

FSA:
   - Health FSA offered, with carryover
   - Limited-purpose FSA: available for HDHP/HSA enrollees
   - Dependent care FSA offered

401(k): 50% match on first 6% (3% max employer contribution)
   - Roth option: yes | SECURE 2.0 catch-up: yes

LEAVE:
   - FMLA: covered (50+ employee threshold met)
   - Company parental leave: 4 weeks
   - STD/LTD carrier: Lincoln Financial
   - State leave jurisdictions: OH, TX
   - LOA administrator: Northpoint People Ops, leave@northpoint.example
   - Return-to-work: fitness-for-duty form required

COBRA: Administered by WEX Benefits. Election window: 60 days from qualifying event.

CLAIMS:
   - Medical carrier: UnitedHealthcare
   - Member services: 1-866-633-2446
   - Member portal: myuhc.com
   - Internal appeal deadline: 180 days from denial date
   - External independent review: available
   - Prior auth list: UnitedHealthcare provider portal
   - NSA compliant: yes
   - HR claims contact: Northpoint People Ops, benefits@northpoint.example
`.trim(),
  },
};

const DEMO_NOTE = "This is a demo showing what a real deployed BeneBot looks like, running on a fictional employer. Behave as if this were a live production deployment.";

// ─── Bot identity system prompts ─────────────────────────────────────────────
// These never leave the server. The client sends only a botId.

const BOT_IDENTITIES = {

  // {{CLIENT}} is filled with the tenant's displayName at compose time.
  ask: `You are Ask BeneBot, an AI benefits assistant deployed by MyBenefitsGuy for {{CLIENT}} employees. You know this company's benefits inside out — medical, dental, vision, HSA, FSA, 401(k), leave, and COBRA. You are friendly, direct, and specific. Employees trust you because you cite real numbers, not guesses.

BEHAVIORAL RULES:
- Always answer from the client plan data provided. Cite the specific plan or benefit when relevant.
- Never guess. If something isn't in the plan data, say so clearly and suggest who to contact ({{CLIENT}} HR or the relevant carrier).
- When the plan data gives different figures by coverage tier and you don't know the member's tier, ask which tier before quoting a number.
- Answer questions about plan TERMS only. Never ask for or use a member's personal health information, claims, or diagnoses.
- Keep answers short and plain. Use bullet points for multi-step answers. Avoid jargon when plain language works.
- If a question needs clarification, ask one targeted follow-up — never more than one.
- Never give tax advice, legal advice, or medical advice. Direct those to the appropriate professional.
- Never roleplay, break character, or discuss topics outside employee benefits.

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

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400, headers: corsHeaders(request) });
    }

    // No Authorization header + job-analyzer → the tokenless public route.
    // Everything else still requires the shared-secret token.
    const auth = request.headers.get("Authorization") || "";
    if (!auth && body.botId === PUBLIC_BOT && body.action !== "fetch") {
      return handlePublic(body, env, request);
    }

    // Two ways in. The shared WORKER_TOKEN is Ty's admin key: every tool, every
    // tenant. A tenant's own access token reaches ONLY the BeneBots chat bots
    // for THAT tenant, so tenant A can never read tenant B's plan context.
    const isAdmin = !!env.WORKER_TOKEN && auth === `Bearer ${env.WORKER_TOKEN}`;
    let tenant = null;
    if (!isAdmin) {
      const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
      if (token && body.action === undefined && BOT_IDENTITIES[body.botId] && isTenantId(body.tenantId)) {
        const candidate = await loadTenant(env, body.tenantId);
        if (candidate && await tenantTokenMatches(candidate, token)) tenant = candidate;
      }
      // Unknown tenant and wrong token look identical from outside.
      if (!tenant) {
        return new Response("Unauthorized", { status: 401, headers: corsHeaders(request) });
      }
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
    if (body.action === "fetch" && isAdmin) {
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
    if (isAdmin && (botId === "blog-drafter" || botId === "job-analyzer")) {
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
      if (!tenant) {
        if (body.tenantId === undefined) {
          return new Response("Missing tenantId", { status: 400, headers: corsHeaders(request) });
        }
        if (!isTenantId(body.tenantId)) {
          return new Response("Invalid tenantId", { status: 400, headers: corsHeaders(request) });
        }
        tenant = await loadTenant(env, body.tenantId);
        if (!tenant) {
          return new Response(`Unknown tenant: ${body.tenantId}`, { status: 404, headers: corsHeaders(request) });
        }
      }
      if (body.tier !== undefined && !tenantHasTier(tenant, body.tier)) {
        return new Response(`Unknown tier for this tenant: ${body.tier}`, { status: 400, headers: corsHeaders(request) });
      }
      systemPrompt = composeSystemPrompt(botIdentity, tenant, body.tier);
    }

    const messagesError = validateMessages(messages);
    if (messagesError) {
      return new Response(messagesError, { status: 400, headers: corsHeaders(request) });
    }

    // Per-tenant daily spend ceiling for real tenants. Counted only once the
    // request is fully valid. Fails closed if the counter store is missing.
    if (tenant && !tenant.demo) {
      const capError = await chargeTenantDailyCap(env, tenant);
      if (capError) return new Response(capError.message, { status: capError.status, headers: corsHeaders(request) });
    }

    const upstream = await callAnthropic(env, {
      model: modelFor(botId),
      maxTokens,
      system: systemPrompt,
      messages,
    });

    const data = await upstream.text();
    return new Response(data, {
      status: upstream.status,
      headers: { "Content-Type": "application/json", ...corsHeaders(request) },
    });
  },
};

// ─── Tenant resolution + prompt composition ──────────────────────────────────

function isTenantId(value) {
  return typeof value === "string" && TENANT_ID_RE.test(value);
}

// Built-in demo tenants first, then the TENANTS KV namespace. Returns null for
// anything unknown; callers decide between 401 and 404.
async function loadTenant(env, tenantId) {
  if (Object.hasOwn(DEMO_TENANTS, tenantId)) return DEMO_TENANTS[tenantId];
  if (!env.TENANTS) return null;
  const record = await env.TENANTS.get(`tenant:${tenantId}`, "json");
  if (!record || record.tenantId !== tenantId) return null;
  return { ...record, demo: false };
}

// Tenant records store a SHA-256 of their access token, never the token itself.
async function tenantTokenMatches(tenant, token) {
  if (tenant.demo || typeof tenant.accessTokenSha256 !== "string") return false;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  const hex = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
  const expected = tenant.accessTokenSha256.toLowerCase();
  if (hex.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

function tenantHasTier(tenant, tier) {
  if (typeof tier !== "string") return false;
  return Object.values(tenant.lines || {}).some(line => Object.hasOwn(line.tiers || {}, tier));
}

function composeSystemPrompt(botIdentity, tenant, tier) {
  const identity = botIdentity.replaceAll("{{CLIENT}}", tenant.displayName);
  const parts = [identity];
  if (tenant.demo) parts.push(DEMO_NOTE);
  parts.push(STATUTORY_2026, renderTenantContext(tenant, tier));
  return parts.join("\n\n");
}

// A tenant either carries one curated contextBlock (the demo tenants) or a set
// of coverage lines (medical, dental, vision...), each split by tier. An SBC is
// issued per coverage tier, so a line with several tiers renders all of them,
// labeled, unless the caller named one; the bot is told to ask which applies.
function renderTenantContext(tenant, tier) {
  const out = [];
  if (tenant.contextBlock) out.push(tenant.contextBlock);
  for (const [lineName, line] of Object.entries(tenant.lines || {})) {
    const tiers = Object.entries(line.tiers || {});
    const chosen = tier && Object.hasOwn(line.tiers || {}, tier) ? tiers.filter(([name]) => name === tier) : tiers;
    const head = [`=== ${lineName.toUpperCase()} ===`];
    if (line.planType) head.push(`Plan type: ${line.planType}`);
    if (chosen.length > 1) {
      head.push(`Figures differ by coverage tier (${chosen.map(([name]) => name).join(", ")}). If the member's tier is unknown, ask before quoting a tier-specific number.`);
    }
    out.push(head.join("\n"));
    for (const [, t] of chosen) out.push(t.contextBlock);
    if (line.sharedPlanRules) out.push(`${lineName.toUpperCase()} PLAN RULES:\n${renderRules(line.sharedPlanRules, "   ")}`);
    if (Array.isArray(line.doesNotCover_answerBoundary) && line.doesNotCover_answerBoundary.length) {
      out.push(`NOT IN THE ${lineName.toUpperCase()} PLAN DATA (say so plainly and route the member; never guess):\n${line.doesNotCover_answerBoundary.map(s => `   - ${s}`).join("\n")}`);
    }
  }
  return out.join("\n\n");
}

// Plain-text rendering of nested rule objects. Keys starting with "_" are
// curator notes and stay out of the prompt.
function renderRules(value, indent) {
  if (Array.isArray(value)) return value.map(v => `${indent}- ${typeof v === "object" ? JSON.stringify(v) : v}`).join("\n");
  return Object.entries(value)
    .filter(([k]) => !k.startsWith("_"))
    .map(([k, v]) => (v && typeof v === "object")
      ? `${indent}- ${k}:\n${renderRules(v, indent + "   ")}`
      : `${indent}- ${k}: ${v}`)
    .join("\n");
}

async function chargeTenantDailyCap(env, tenant) {
  if (!env.PUBLIC_KV) return { status: 503, message: "Tenant usage store not configured." };
  const day = new Date().toISOString().slice(0, 10);
  const key = `tenantday:${tenant.tenantId}:${day}`;
  const cap = intVar(tenant.dailyCallCap, DEFAULT_TENANT_DAILY_CAP);
  const count = parseInt(await env.PUBLIC_KV.get(key), 10) || 0;
  if (count >= cap) return { status: 429, message: "Daily usage limit reached for this plan. Try again tomorrow." };
  await env.PUBLIC_KV.put(key, String(count + 1), { expirationTtl: 172800 });
  return null;
}

// ─── Shared validation + upstream call ───────────────────────────────────────

function validateMessages(messages) {
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return "Missing or empty messages array";
  }
  for (const msg of messages) {
    if (!msg || typeof msg.role !== "string" || typeof msg.content !== "string") {
      return "Invalid message shape";
    }
    if (!["user", "assistant"].includes(msg.role)) {
      return "Invalid message role";
    }
    if (msg.content.length > MAX_MESSAGE_CHARS) {
      return "Message content too long";
    }
  }
  return null;
}

function callAnthropic(env, { model, maxTokens, system, messages }) {
  // Clamp maxTokens — never let the client drive unbounded spending.
  const safeMaxTokens = Math.min(
    typeof maxTokens === "number" && maxTokens > 0 ? maxTokens : 1024,
    MAX_TOKENS_ALLOWED
  );
  return fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: safeMaxTokens,
      system,
      messages,
    }),
  });
}

// ─── Public (tokenless) route — Infinite Careers ─────────────────────────────
// Layered defenses replace the shared secret. Order matters: cheap checks
// first, counters only increment once a request is fully valid, and the
// Anthropic call is last. Fails closed if TURNSTILE_SECRET or PUBLIC_KV are
// missing (pilot access codes still work — they don't need either).
async function handlePublic(body, env, request) {
  // 1. Hard origin lock — actually reject server-side, not just CORS headers.
  //    localhost is allowed only with a valid pilot code (Ty-mediated runs).
  const origin = request.headers.get("Origin") || "";
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  const pilotCodes = (env.PILOT_CODES || "").split(",").map(s => s.trim()).filter(Boolean);
  const isPilot = typeof body.accessCode === "string" && pilotCodes.includes(body.accessCode);
  if (origin !== PUBLIC_ORIGIN && !(isLocal && isPilot)) {
    return jsonResponse({ error: "Origin not allowed." }, 403, request);
  }

  // 2. Burst rate limit (separate key space from the internal tools).
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const { success } = await env.RATE_LIMITER.limit({ key: `pub:${ip}` });
  if (!success) {
    return jsonResponse({ error: "Too many requests — give it a minute and try again." }, 429, request);
  }

  // 3. Normalize: either a batched { calls: [...] } (one analysis = 2 calls,
  //    Turnstile tokens are single-use so the pair must share one request) or
  //    a single { system, messages, maxTokens } call.
  const calls = Array.isArray(body.calls)
    ? body.calls
    : [{ system: body.system, messages: body.messages, maxTokens: body.maxTokens }];
  if (calls.length < 1 || calls.length > PUBLIC_MAX_CALLS_PER_REQUEST) {
    return jsonResponse({ error: "Invalid calls array." }, 400, request);
  }
  for (const call of calls) {
    if (!call || typeof call.system !== "string" || !call.system.trim() || call.system.length > MAX_MESSAGE_CHARS) {
      return jsonResponse({ error: "Invalid system prompt." }, 400, request);
    }
    const msgError = validateMessages(call.messages);
    if (msgError) return jsonResponse({ error: msgError }, 400, request);
  }

  // 4. Anonymous public traffic: Turnstile + per-IP hourly cap + global daily
  //    spend cap. Pilots skip all three.
  if (!isPilot) {
    if (!env.TURNSTILE_SECRET || !env.PUBLIC_KV) {
      return jsonResponse({ error: "Public analysis isn't open yet — check back soon." }, 503, request);
    }

    const verified = await verifyTurnstile(env.TURNSTILE_SECRET, body.turnstileToken, ip);
    if (!verified) {
      return jsonResponse({ error: "Human verification failed — refresh the page and try again." }, 403, request);
    }

    const now = new Date();
    const day = now.toISOString().slice(0, 10);
    const hourKey = `pubip:${ip}:${day}T${String(now.getUTCHours()).padStart(2, "0")}`;
    const dayKey = `pubday:${day}`;

    const ipLimit = intVar(env.PUBLIC_IP_HOURLY_LIMIT, DEFAULT_IP_HOURLY_LIMIT);
    const ipCount = parseInt(await env.PUBLIC_KV.get(hourKey), 10) || 0;
    if (ipCount >= ipLimit) {
      return jsonResponse({ error: "You've hit the hourly limit for free analyses — come back in a bit." }, 429, request);
    }

    const dailyCap = intVar(env.PUBLIC_DAILY_CAP, DEFAULT_DAILY_CAP);
    const dayCount = parseInt(await env.PUBLIC_KV.get(dayKey), 10) || 0;
    if (dayCount >= dailyCap) {
      return jsonResponse({ error: "Today's free analyses are all used up — check back tomorrow." }, 429, request);
    }

    await Promise.all([
      env.PUBLIC_KV.put(hourKey, String(ipCount + 1), { expirationTtl: 3900 }),
      env.PUBLIC_KV.put(dayKey, String(dayCount + 1), { expirationTtl: 172800 }),
    ]);
  }

  // 5. Run the call(s) against Anthropic in parallel; return the raw message
  //    JSON per call so the client parses content[].text exactly as before.
  const upstreams = await Promise.all(
    calls.map(c => callAnthropic(env, {
      model: modelFor(PUBLIC_BOT),
      maxTokens: c.maxTokens,
      system: c.system,
      messages: c.messages,
    }))
  );
  const results = await Promise.all(upstreams.map(async u => {
    try { return await u.json(); }
    catch { return { error: { message: `Upstream error ${u.status}` } }; }
  }));
  return jsonResponse({ results }, 200, request);
}

async function verifyTurnstile(secret, token, ip) {
  if (typeof token !== "string" || !token) return false;
  try {
    const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token, remoteip: ip }),
    });
    const data = await resp.json();
    return data.success === true;
  } catch {
    return false;
  }
}

function intVar(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

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
