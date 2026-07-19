// ─── IW Front Desk worker ────────────────────────────────────────────────────
// The Front Desk PRODUCT-LINE worker. One deployable engine that serves every
// Front Desk client (Vic is client #0). Per-client differences (deposit %, voice,
// which features are on) are config passed in the request or read from Airtable —
// NOT separate workers. New workers are for new products, not new clients.
//
// This is kept ISOLATED from benebots-proxy on purpose: a bad deploy here can't
// touch the demos / Blog Studio / Infinite Careers, and Vic's live client system
// gets its own secrets, own token, own billing attribution. IAS owns this engine
// and licenses it to the JV — a clean, self-contained unit that matches the
// reversion clause.
//
// Phase 2 "money spine" first (this file): create a Stripe Checkout Session for a
// VARIABLE deposit (30% of an approved quote) after Vic approves. The money rail
// is deliberately SEPARATE from the DM brain — the agent triages + drafts, a human
// (Vic) approves, and only then does a deposit link get minted. The agent never
// moves money.
//
// SECRETS (set with: npx wrangler secret put NAME):
//   WORKER_TOKEN       — shared secret gating this worker (its own, not benebots')
//   STRIPE_SECRET_KEY  — Stripe secret key. Use sk_test_… first; swap Vic's live
//                        sk_live_… (or move to Connect, see README) at go-live.
//   MAKE_SHARED_SECRET — dedicated least-privilege token sent to Make on the webhook
//                        forward (X-Frontdesk-Token). Distinct from WORKER_TOKEN so the
//                        master auth secret never leaves the worker. Falls back to
//                        WORKER_TOKEN only if unset (set it before go-live).
// Optional:
//   CLIENT_ACCOUNTS    — JSON map { clientId: "acct_… | \"\"" } binding each client's
//                        Stripe account SERVER-SIDE. A mapped acct_ routes the deposit
//                        on-behalf-of that connected account; "" pins the client to a
//                        DIRECT charge on this worker's own key (Vic's setup). When a
//                        client is mapped the binding is authoritative — a caller-supplied
//                        stripeAccountId is ignored (and rejected on mismatch), so a token
//                        holder can't reroute a deposit into an arbitrary account.
//   STRIPE_ACCOUNT_ID  — single-tenant Connect fallback for clients NOT in CLIENT_ACCOUNTS.
//                        (Legacy: unmapped clients may also pass `stripeAccountId` per
//                        request; prefer CLIENT_ACCOUNTS for anything handling real money.)
//   CLIENT_MAX_QUOTE   — JSON map { clientId: dollars } overriding the per-client quote
//                        ceiling (default $5,000). Server-side only; a caller can't raise
//                        their own cap. Malformed / missing → the default for everyone.

const CURRENCY = "usd";
const DEFAULT_DEPOSIT_PCT = 0.30; // Vic: 30% of quote, confirmed via Austain call 7-4
// Per-client sanity ceiling on the full quote ($). This caps the blast radius if the
// WORKER_TOKEN ever leaks — the max chargeable deposit is maxQuote × MAX_DEPOSIT_PCT, so
// the tight default keeps a leaked token to a ~$2,500 deposit, not $50,000. Raise it per
// client via the CLIENT_MAX_QUOTE env map. The cap is SERVER-SIDE only — never
// caller-suppliable, or a token holder could just lift their own ceiling.
// TODO(vic): confirm Vic's real top-end quote / preference and set CLIENT_MAX_QUOTE for
//            "vic" accordingly — $5k is a placeholder assumed to cover his full-day work.
const DEFAULT_MAX_QUOTE = 5_000;
const MAX_DEPOSIT_PCT = 0.50;     // a "deposit" over half the quote isn't a deposit — reject it

const ALLOWED_ORIGINS = [
  "https://infiniteawesomestudio.com",
  "https://vic-frontdesk-demo.pages.dev",
];

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    const path = new URL(request.url).pathname;

    // Stripe payment webhook. Authed by the SIGNATURE, not the WORKER_TOKEN (Stripe
    // can't send our Bearer), and it needs the RAW body for signature verification —
    // so it's routed before the Bearer gate and before any body parsing.
    if (path === "/webhook" || path === "/stripe-webhook") {
      if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, 405, request);
      }
      return handleStripeWebhook(request, env);
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, request);
    }

    // Shared-secret gate. This worker never takes anonymous public traffic —
    // it's called by Make / the approval flow, not by end users' browsers.
    const auth = request.headers.get("Authorization") || "";
    if (!env.WORKER_TOKEN || auth !== `Bearer ${env.WORKER_TOKEN}`) {
      return json({ error: "Unauthorized" }, 401, request);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400, request);
    }
    // A valid-JSON `null`, array, or scalar would make `body.action` throw. Require
    // an object before we touch any property.
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return json({ error: "Body must be a JSON object" }, 400, request);
    }

    if (body.action === "create_deposit") {
      return handleCreateDeposit(body, env, request);
    }
    return json({ error: `Unknown action: ${body.action}` }, 400, request);
  },
};

// ─── Create a variable-amount deposit Checkout Session ───────────────────────
// Input: { action:"create_deposit", quoteAmount, depositPct?, clientId, description?,
//          customerEmail?, successUrl?, cancelUrl?, leadId?, stripeAccountId? }
// stripeAccountId is the client's Connect connected-account id (acct_…), passed in
// per-request so ONE worker serves every client — the deposit lands in that client's
// own Stripe. Falls back to the STRIPE_ACCOUNT_ID env for a single-tenant setup.
// quoteAmount is the full approved quote in DOLLARS; the charge is quoteAmount ×
// depositPct, computed server-side.
//
// TRUST MODEL (be honest about it): the caller supplies BOTH quoteAmount and depositPct,
// so a token holder CAN choose the charge — up to that client's max quote (default $5,000)
// × MAX_DEPOSIT_PCT (0.50) = $2,500 by default. This worker deliberately holds no Airtable
// token (that's Make's job, which keeps the worker entity-independent), so it can't
// re-derive the "approved" amount server-side. The real controls are therefore: (1) the
// WORKER_TOKEN gate — only Make / Ty can call this at all; the approval lookup happens in
// Make against Airtable BEFORE the call; and (2) the per-client max-quote + MAX_DEPOSIT_PCT
// ceilings, which cap the blast radius if the token ever leaks. It is NOT true that "the
// caller can't send an arbitrary amount" — don't claim that. If stronger control is ever
// needed, give the worker a read-only Airtable lookup keyed on leadId (accepting the added
// token custody).
async function handleCreateDeposit(body, env, request) {
  // Validate the request shape first, then check server config — a malformed
  // request should get a 400 regardless of whether Stripe is wired up yet.
  const clientId = typeof body.clientId === "string" && body.clientId.trim()
    ? body.clientId.trim() : "unknown";
  // Per-client quote ceiling, resolved server-side — a caller can't raise their own cap.
  const maxQuote = maxQuoteFor(clientId, env);

  const quoteAmount = Number(body.quoteAmount);
  if (!Number.isFinite(quoteAmount) || quoteAmount <= 0 || quoteAmount > maxQuote) {
    return json({ error: `quoteAmount must be a positive dollar amount up to $${maxQuote}.` }, 400, request);
  }

  let depositPct = body.depositPct == null ? DEFAULT_DEPOSIT_PCT : Number(body.depositPct);
  if (!Number.isFinite(depositPct) || depositPct <= 0 || depositPct > MAX_DEPOSIT_PCT) {
    return json({ error: `depositPct must be between 0 and ${MAX_DEPOSIT_PCT}.` }, 400, request);
  }

  if (!env.STRIPE_SECRET_KEY) {
    return json({ error: "Stripe is not configured on this worker yet." }, 503, request);
  }

  const description = (typeof body.description === "string" && body.description.trim()
    ? body.description.trim() : "Tattoo appointment").slice(0, 200);

  // Deposit in the smallest currency unit (cents). Convert the quote to integer cents
  // FIRST (kills float drift like 47999.999…), THEN apply the percentage and round —
  // so the deposit can't silently undercharge by a cent.
  const depositCents = Math.round(Math.round(quoteAmount * 100) * depositPct);
  if (depositCents < 50) {
    return json({ error: "Deposit below Stripe's $0.50 minimum." }, 400, request);
  }

  // Works for both standard (sk_) and RESTRICTED (rk_) keys — Vic's rail uses a
  // restricted key, so match on the "_test_" segment rather than an sk_ prefix.
  const testMode = env.STRIPE_SECRET_KEY.includes("_test_");

  // Stripe wants application/x-www-form-urlencoded with bracketed nested keys.
  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("success_url", validUrl(body.successUrl) || `${ALLOWED_ORIGINS[0]}/deposit-thanks`);
  form.set("cancel_url", validUrl(body.cancelUrl) || `${ALLOWED_ORIGINS[0]}/deposit-cancelled`);
  form.set("line_items[0][quantity]", "1");
  form.set("line_items[0][price_data][currency]", CURRENCY);
  form.set("line_items[0][price_data][unit_amount]", String(depositCents));
  form.set("line_items[0][price_data][product_data][name]", `Deposit — ${description}`);
  form.set("line_items[0][price_data][product_data][description]",
    `${Math.round(depositPct * 100)}% deposit on a $${quoteAmount.toFixed(2)} quote`);
  // Metadata so the payment webhook can reconcile back to the Airtable lead/booking.
  // Stamp it on BOTH the Checkout Session and the PaymentIntent. The session-level
  // copy is what rides on the `checkout.session.completed` event, so the webhook can
  // reconcile with zero extra Stripe calls (which, on a Connect connected account,
  // would otherwise need the Stripe-Account header re-plumbed). The PaymentIntent
  // copy keeps the data on the charge itself for the dashboard / disputes.
  const leadId = typeof body.leadId === "string" && body.leadId.trim()
    ? body.leadId.trim().slice(0, 120) : null;
  const stampMeta = (prefix) => {
    form.set(`${prefix}[type]`, "deposit");
    form.set(`${prefix}[clientId]`, clientId);
    form.set(`${prefix}[quoteAmount]`, quoteAmount.toFixed(2));
    form.set(`${prefix}[depositPct]`, String(depositPct));
    if (leadId) form.set(`${prefix}[leadId]`, leadId);
  };
  stampMeta("metadata");                      // Checkout Session metadata
  stampMeta("payment_intent_data[metadata]"); // PaymentIntent metadata
  // client_reference_id gives Make a top-level handle on the lead without digging
  // into metadata, and shows up in the Stripe dashboard's session view.
  if (leadId) form.set("client_reference_id", leadId);
  if (validEmail(body.customerEmail)) {
    form.set("customer_email", body.customerEmail.trim());
  }

  // Connect path (multi-client): create the session ON BEHALF OF the client's
  // connected account so the deposit lands in THEIR Stripe, with the platform never
  // holding their secret key. SECURITY: the account is bound to the clientId
  // SERVER-SIDE (CLIENT_ACCOUNTS env) — a caller-supplied stripeAccountId is only
  // honored for clients NOT in that map, so a token holder can't reroute one client's
  // deposit into an arbitrary or attacker-owned account.
  const stripeAccountId = resolveStripeAccountId(clientId, body.stripeAccountId, env);
  if (stripeAccountId === INVALID_ACCOUNT) {
    return json({ error: "stripeAccountId must look like acct_XXXX." }, 400, request);
  }
  if (stripeAccountId === ACCOUNT_MISMATCH) {
    return json({ error: "stripeAccountId does not match the account bound to this client." }, 400, request);
  }

  const headers = {
    "Authorization": `Bearer ${env.STRIPE_SECRET_KEY}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
  if (stripeAccountId) {
    headers["Stripe-Account"] = stripeAccountId;
    // Stamp it (session + PaymentIntent) so the payment webhook / logs can tell which
    // account collected the deposit. On a Connect connected account the event fires
    // on that account, but the explicit stamp survives even a platform-level webhook.
    form.set("metadata[stripeAccountId]", stripeAccountId);
    form.set("payment_intent_data[metadata][stripeAccountId]", stripeAccountId);
  }

  // Idempotency: an approval that re-fires (Make retry, network blip, double-click)
  // must NOT mint a second payable link. Key on the stable inputs of THIS deposit so
  // identical retries collapse onto one Stripe session, while a genuinely different
  // deposit (new amount / new account) still gets its own. Stripe caps the key at 255.
  headers["Idempotency-Key"] =
    `iwfd:deposit:${clientId}:${leadId || "nolead"}:${depositCents}:${stripeAccountId || "direct"}`.slice(0, 255);

  let resp, data;
  try {
    resp = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers,
      body: form.toString(),
    });
    data = await resp.json();
  } catch (e) {
    return json({ error: "Stripe request failed: " + (e.message || String(e)) }, 502, request);
  }

  if (!resp.ok) {
    // Surface Stripe's own error message (safe — it never contains the key).
    return json({ error: data?.error?.message || `Stripe ${resp.status}`, testMode }, 502, request);
  }

  return json({
    url: data.url,
    sessionId: data.id,
    depositAmount: depositCents / 100,
    quoteAmount,
    depositPct,
    testMode,
    // Echo the connected account (if any) so the caller can confirm the deposit
    // was routed to the right client's Stripe. acct_ ids are not secret.
    ...(stripeAccountId ? { stripeAccountId } : {}),
  }, 200, request);
}

// ─── Payment webhook: deposit paid → booking confirmed ───────────────────────
// Stripe POSTs here when a Checkout Session completes. We verify the signature,
// pull the metadata create_deposit stamped (leadId, clientId, quoteAmount…), and
// hand a clean `deposit_paid` event to Make — which owns the Airtable + Google
// Calendar connections and does the actual "flip booking to Confirmed + drop the
// GCal hold" work. Keeping those writes in Make (not here) means this worker never
// custodies an Airtable token or GCal creds on top of the Stripe key, and the whole
// thing stays entity-independent — no LLC required to run it.
//
// SECRETS (add to the two already documented up top):
//   STRIPE_WEBHOOK_SECRET — the signing secret (whsec_…) from the Stripe dashboard
//                           webhook endpoint. This is what authenticates Stripe.
//   MAKE_WEBHOOK_URL       — where to forward the verified deposit_paid event. If
//                           unset, the worker verifies + normalizes and echoes the
//                           payload back (test/echo mode) without forwarding.
const SIG_TOLERANCE_SEC = 300; // reject events whose timestamp is >5 min skewed
// Event types that can carry a PAID deposit (sync completion + delayed/async success).
const PAID_EVENTS = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
]);

async function handleStripeWebhook(request, env) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return json({ error: "Webhook not configured on this worker yet." }, 503, request);
  }

  // Raw body FIRST — signature is computed over the exact bytes Stripe sent, so we
  // must not JSON.parse-and-restringify before verifying.
  const rawBody = await request.text();
  const sigHeader = request.headers.get("Stripe-Signature") || "";

  const ok = await verifyStripeSignature(rawBody, sigHeader, env.STRIPE_WEBHOOK_SECRET);
  if (!ok) {
    return json({ error: "Invalid signature." }, 400, request);
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return json({ error: "Invalid JSON." }, 400, request);
  }

  // A deposit is confirmed by a Checkout session that is PAID. That arrives either
  // synchronously (`checkout.session.completed` with payment_status=paid) or, for
  // delayed/async methods (ACH, some wallets), later as
  // `checkout.session.async_payment_succeeded`. Handle both. Everything else — other
  // event types, and async_payment_FAILED — gets a 200 ack so Stripe stops retrying.
  if (!PAID_EVENTS.has(event.type)) {
    return json({ received: true, ignored: event.type }, 200, request);
  }

  const session = event.data?.object || {};
  // A `completed` session can still be pending on async methods; only a paid session
  // confirms a booking. (`async_payment_succeeded` always carries payment_status=paid.)
  if (session.payment_status && session.payment_status !== "paid") {
    return json({ received: true, pending: session.payment_status }, 200, request);
  }

  const md = session.metadata || {};
  // Only sessions WE minted as deposits should confirm a booking. Any other Checkout
  // on the same account (or an event lacking our stamp) is acked and ignored — the
  // booking side must never act on a session it didn't originate.
  if (md.type !== "deposit") {
    return json({ received: true, ignored: `type:${md.type || "unknown"}` }, 200, request);
  }
  // If this client is bound to a specific connected account server-side, the paid
  // session MUST have landed on that account. A mismatch means the stamp/event don't
  // agree with our config — refuse to confirm rather than trust it.
  const eventAccount = md.stripeAccountId || event.account || "";
  const bound = clientAccountBinding(md.clientId || "unknown", env);
  if (bound !== undefined && bound !== "" && eventAccount !== bound) {
    return json({ received: true, ignored: "account-mismatch" }, 200, request);
  }
  const num = (v) => (v != null && v !== "" && Number.isFinite(Number(v)) ? Number(v) : null);
  const payload = {
    type: "deposit_paid",
    leadId: md.leadId || session.client_reference_id || null,
    clientId: md.clientId || null,
    stripeAccountId: md.stripeAccountId || event.account || null,
    quoteAmount: num(md.quoteAmount),
    depositPct: num(md.depositPct),
    amountPaid: session.amount_total != null ? session.amount_total / 100 : null,
    currency: session.currency || CURRENCY,
    customerEmail: session.customer_details?.email || session.customer_email || null,
    sessionId: session.id || null,
    paymentIntentId: typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id || null,
    livemode: !!event.livemode,
  };

  // No Make URL configured → verify-and-echo mode. Useful for the local harness and
  // for confirming the endpoint is live before the Airtable/GCal side is wired.
  if (!env.MAKE_WEBHOOK_URL) {
    return json({ received: true, forwarded: false, event: payload }, 200, request);
  }

  // Forward to Make. If the forward fails, return non-2xx so Stripe RETRIES (it will
  // for up to ~3 days). Make must therefore treat the Airtable write as idempotent —
  // match on sessionId / leadId so a retry can't double-confirm or double-drop.
  // Least-privilege outbound secret: authenticate to Make with MAKE_SHARED_SECRET, a
  // dedicated value scoped to this one forward — NOT the root WORKER_TOKEN that gates
  // the whole worker. Reusing WORKER_TOKEN here would ship the master auth secret to a
  // third party (Make) on every payment. Falls back to WORKER_TOKEN only if the new
  // secret isn't set yet, so existing deploys keep working until Ty sets it.
  const forwardToken = env.MAKE_SHARED_SECRET || env.WORKER_TOKEN;
  try {
    const r = await fetch(env.MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Lets the Make scenario reject anything that didn't come from this worker.
        ...(forwardToken ? { "X-Frontdesk-Token": forwardToken } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      return json({ error: `Make forward failed: ${r.status}` }, 502, request);
    }
  } catch (e) {
    return json({ error: "Make forward error: " + (e.message || String(e)) }, 502, request);
  }

  return json({ received: true, forwarded: true }, 200, request);
}

// Verify a Stripe webhook signature (scheme v1 = HMAC-SHA256 over `${t}.${payload}`).
// Mirrors Stripe's constructEvent, done with Web Crypto because the node SDK isn't
// available in the Workers runtime. Rejects a missing/garbled header, a timestamp
// outside the tolerance window (replay guard), and any payload whose HMAC doesn't
// match one of the header's v1 signatures (constant-time compared).
async function verifyStripeSignature(payload, header, secret, toleranceSec = SIG_TOLERANCE_SEC) {
  if (!header || !secret) return false;

  let t = null;
  const v1s = [];
  for (const part of header.split(",")) {
    const i = part.indexOf("=");
    if (i === -1) continue;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    if (k === "t") t = v;
    else if (k === "v1") v1s.push(v);
  }
  const ts = parseInt(t, 10);
  if (!Number.isFinite(ts) || v1s.length === 0) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - ts) > toleranceSec) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, enc.encode(`${ts}.${payload}`));
  const expected = hex(mac);
  return v1s.some((sig) => timingSafeEqualHex(sig, expected));
}

function hex(buf) {
  const bytes = new Uint8Array(buf);
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += bytes[i].toString(16).padStart(2, "0");
  return out;
}

// Constant-time hex-string compare — avoids leaking match position via timing.
function timingSafeEqualHex(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function validUrl(u) {
  if (typeof u !== "string") return null;
  try {
    const parsed = new URL(u);
    return parsed.protocol === "https:" || parsed.hostname === "localhost" ? u : null;
  } catch { return null; }
}

function validEmail(e) {
  return typeof e === "string" && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e.trim());
}

// Resolve which Stripe connected account (if any) to bill on behalf of.
//
// SECURITY: the account is bound to the clientId SERVER-SIDE via the CLIENT_ACCOUNTS
// env map. When a client is mapped, that binding is authoritative — a caller-supplied
// stripeAccountId is ignored, and rejected (ACCOUNT_MISMATCH) if it disagrees. So a
// token holder can't reroute one client's deposit into an arbitrary account. Only
// clients NOT in the map fall back to the legacy caller-supplied / env value.
//
// Returns: "" for a direct charge (client's own key), an acct_ id for a Connect
// on-behalf-of charge, INVALID_ACCOUNT for a malformed supplied value (also guards
// header injection), or ACCOUNT_MISMATCH when a supplied value contradicts the binding.
const INVALID_ACCOUNT = Symbol("invalid_account");
const ACCOUNT_MISMATCH = Symbol("account_mismatch");
function resolveStripeAccountId(clientId, fromBody, env) {
  const supplied = typeof fromBody === "string" && fromBody.trim() ? fromBody.trim() : "";
  if (supplied && !/^acct_[A-Za-z0-9]+$/.test(supplied)) return INVALID_ACCOUNT;

  const bound = clientAccountBinding(clientId, env);
  if (bound !== undefined) {
    // "" means "charge directly on this client's own key" (Vic's lighthouse setup).
    if (supplied && supplied !== bound) return ACCOUNT_MISMATCH;
    return bound;
  }

  // Client not bound server-side → legacy behavior: caller-supplied value (already
  // format-checked above) or the single-tenant STRIPE_ACCOUNT_ID env fallback.
  const raw = supplied || (env.STRIPE_ACCOUNT_ID || "");
  if (!raw) return "";
  return /^acct_[A-Za-z0-9]+$/.test(raw) ? raw : INVALID_ACCOUNT;
}

// Look up a client's server-side account binding from CLIENT_ACCOUNTS (JSON env:
// { "<clientId>": "acct_… | \"\"" }). Returns the bound acct_ id, "" for a client
// pinned to a DIRECT charge, or undefined if the client isn't mapped. Fails CLOSED:
// a present-but-malformed binding returns "" (direct) rather than ever honoring a
// caller-chosen account. A malformed JSON blob leaves everyone unmapped.
function clientAccountBinding(clientId, env) {
  if (!env.CLIENT_ACCOUNTS) return undefined;
  let map;
  try { map = JSON.parse(env.CLIENT_ACCOUNTS); } catch { return undefined; }
  if (!map || typeof map !== "object" || Array.isArray(map)) return undefined;
  if (!Object.prototype.hasOwnProperty.call(map, clientId)) return undefined;
  const v = map[clientId];
  if (typeof v === "string" && /^acct_[A-Za-z0-9]+$/.test(v.trim())) return v.trim();
  return ""; // "", null, or malformed → pin to direct charge (fail closed)
}

// Resolve a client's max allowed quote ($). Server-side only, via CLIENT_MAX_QUOTE (JSON
// env: { "<clientId>": <dollars> }). Fails CLOSED to DEFAULT_MAX_QUOTE — a malformed map, a
// missing client, or a non-positive value can never RAISE the ceiling; only an explicit
// positive per-client override does. So a caller can't lift their own cap, and a bad config
// is safe (it just pins everyone to the tight default).
function maxQuoteFor(clientId, env) {
  if (!env.CLIENT_MAX_QUOTE) return DEFAULT_MAX_QUOTE;
  let map;
  try { map = JSON.parse(env.CLIENT_MAX_QUOTE); } catch { return DEFAULT_MAX_QUOTE; }
  if (!map || typeof map !== "object" || Array.isArray(map)) return DEFAULT_MAX_QUOTE;
  const v = Number(map[clientId]);
  return Number.isFinite(v) && v > 0 ? v : DEFAULT_MAX_QUOTE;
}

function corsHeaders(request) {
  const origin = request?.headers?.get("Origin") || "";
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  const allowed = (ALLOWED_ORIGINS.includes(origin) || isLocal) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

function json(obj, status, request) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(request) },
  });
}
