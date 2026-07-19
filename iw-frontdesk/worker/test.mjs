// IW Front Desk worker — test harness.  Run: `npm test`  (or `node test.mjs`)
//
// Pure-Node, zero deps. Imports the worker's default export and drives it with mock
// Request/env, stubbing global fetch so Stripe + Make are never really called. Covers the
// hardening surface: auth/routing/body guards, the per-client quote ceiling, depositPct
// cap, cents rounding, server-side account binding + mismatch, Stripe-Account routing,
// idempotency-key stability, and the /webhook signature + type filters + least-privilege
// Make forward. Exits non-zero on any failure.

import worker from "./index.js";

// ── mock global fetch: intercept Stripe + Make, record calls ──────────────────
let stripeCalls = [];
let makeCalls = [];
let stripeFail = false;
let makeFail = false;
let makeUrl = null;
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opts = {}) => {
  const u = String(url);
  if (u.includes("api.stripe.com")) {
    stripeCalls.push({ url: u, headers: opts.headers || {}, body: opts.body || "" });
    if (stripeFail) {
      return new Response(JSON.stringify({ error: { message: "card_declined" } }),
        { status: 402, headers: { "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ id: "cs_test_abc", url: "https://checkout.stripe.com/c/pay/cs_test_abc" }),
      { status: 200, headers: { "Content-Type": "application/json" } });
  }
  if (makeUrl && u === makeUrl) {
    makeCalls.push({ url: u, headers: opts.headers || {}, body: opts.body || "" });
    return new Response("ok", { status: makeFail ? 500 : 200 });
  }
  throw new Error("unexpected fetch to " + u);
};

// ── tiny assert framework ─────────────────────────────────────────────────────
let pass = 0, fail = 0; const fails = [];
function ok(cond, name) { if (cond) pass++; else { fail++; fails.push(name); } }
function eq(actual, expected, name) {
  ok(actual === expected, `${name}  (got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)})`);
}

// ── helpers ───────────────────────────────────────────────────────────────────
const baseEnv = { WORKER_TOKEN: "tok", STRIPE_SECRET_KEY: "sk_test_x" };

async function call(path, { method = "POST", token = "tok", body, rawBody, headers = {}, env = baseEnv } = {}) {
  const h = { ...headers };
  if (token) h["Authorization"] = `Bearer ${token}`;
  let payload;
  if (rawBody !== undefined) payload = rawBody;
  else if (body !== undefined) { h["Content-Type"] = "application/json"; payload = JSON.stringify(body); }
  const req = new Request("https://w" + path, { method, headers: h, body: payload });
  const res = await worker.fetch(req, env);
  let data = null; try { data = await res.json(); } catch { /* 204 etc */ }
  return { status: res.status, data };
}

async function stripeSig(payload, secret, t = Math.floor(Date.now() / 1000)) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, enc.encode(`${t}.${payload}`));
  const hexed = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `t=${t},v1=${hexed}`;
}
function webhookBody({ type = "checkout.session.completed", payment_status = "paid",
  metadata = { type: "deposit", clientId: "vic", quoteAmount: "1600.00", depositPct: "0.3", leadId: "rec1" },
  account } = {}) {
  return JSON.stringify({
    type, account, livemode: false,
    data: { object: { id: "cs_test_abc", payment_status, metadata, amount_total: 48000, currency: "usd",
      customer_details: { email: "a@b.com" }, payment_intent: "pi_1", client_reference_id: "rec1" } },
  });
}
const reset = () => { stripeCalls = []; makeCalls = []; stripeFail = false; makeFail = false; makeUrl = null; };

// ── cases ──────────────────────────────────────────────────────────────────────
async function run() {
  // routing / auth / body guards
  eq((await call("/", { method: "GET" })).status, 405, "01 GET / → 405");
  eq((await call("/", { token: null })).status, 401, "02 no auth → 401");
  eq((await call("/", { token: "wrong" })).status, 401, "03 bad token → 401");
  eq((await call("/", { rawBody: "{not json" })).status, 400, "04 invalid JSON → 400");
  eq((await call("/", { body: null })).status, 400, "05 null body → 400");
  eq((await call("/", { body: [1, 2] })).status, 400, "06 array body → 400");
  eq((await call("/", { body: { action: "nope" } })).status, 400, "07 unknown action → 400");

  // create_deposit validation + per-client cap
  eq((await call("/", { body: { action: "create_deposit", clientId: "vic" } })).status, 400, "08 missing quoteAmount → 400");
  eq((await call("/", { body: { action: "create_deposit", clientId: "vic", quoteAmount: 6000 } })).status, 400, "09 over default $5k cap → 400");
  {
    const r = await call("/", { body: { action: "create_deposit", clientId: "vic", quoteAmount: 1600 } });
    eq(r.status, 200, "10 valid 1600 → 200");
    eq(r.data?.depositAmount, 480, "10b 30% of 1600 = 480");
    eq(r.data?.testMode, true, "10c sk_test → testMode true");
  }
  eq((await call("/", { body: { action: "create_deposit", clientId: "vic", quoteAmount: 1600, depositPct: 0.9 } })).status, 400, "11 depositPct > 0.5 → 400");
  eq((await call("/", { body: { action: "create_deposit", clientId: "vic", quoteAmount: 1 } })).status, 400, "12 deposit below $0.50 min → 400");
  eq((await call("/", { env: { WORKER_TOKEN: "tok" }, body: { action: "create_deposit", clientId: "vic", quoteAmount: 1600 } })).status, 503, "13 no STRIPE_SECRET_KEY → 503");

  // CLIENT_MAX_QUOTE override + fail-closed
  eq((await call("/", { env: { ...baseEnv, CLIENT_MAX_QUOTE: '{"vic":10000}' }, body: { action: "create_deposit", clientId: "vic", quoteAmount: 8000 } })).status, 200, "14 override raises cap → 200");
  eq((await call("/", { env: { ...baseEnv, CLIENT_MAX_QUOTE: "{bad json" }, body: { action: "create_deposit", clientId: "vic", quoteAmount: 8000 } })).status, 400, "15 malformed CLIENT_MAX_QUOTE fails closed → 400");
  eq((await call("/", { env: { ...baseEnv, CLIENT_MAX_QUOTE: '{"vic":-1}' }, body: { action: "create_deposit", clientId: "vic", quoteAmount: 8000 } })).status, 400, "16 non-positive override ignored → 400");

  // account binding (server-side authoritative)
  {
    reset();
    const env = { ...baseEnv, CLIENT_ACCOUNTS: '{"vic":""}' };
    const r = await call("/", { env, body: { action: "create_deposit", clientId: "vic", quoteAmount: 1600 } });
    eq(r.status, 200, "17 bound-direct vic → 200");
    eq(stripeCalls[0]?.headers["Stripe-Account"], undefined, "17b direct = no Stripe-Account header");
  }
  eq((await call("/", { env: { ...baseEnv, CLIENT_ACCOUNTS: '{"vic":""}' }, body: { action: "create_deposit", clientId: "vic", quoteAmount: 1600, stripeAccountId: "acct_X" } })).status, 400, "18 caller acct vs bound-direct → 400 mismatch");
  {
    reset();
    const env = { ...baseEnv, CLIENT_ACCOUNTS: '{"vic":"acct_ABC"}' };
    const r = await call("/", { env, body: { action: "create_deposit", clientId: "vic", quoteAmount: 1600 } });
    eq(r.status, 200, "19 bound-connect vic → 200");
    eq(stripeCalls[0]?.headers["Stripe-Account"], "acct_ABC", "19b routed on bound acct_ABC");
  }
  {
    reset();
    const r = await call("/", { body: { action: "create_deposit", clientId: "studioZ", quoteAmount: 1600, stripeAccountId: "acct_ZZZ" } });
    eq(r.status, 200, "20 unmapped client + caller acct → 200");
    eq(stripeCalls[0]?.headers["Stripe-Account"], "acct_ZZZ", "20b uses caller-supplied acct");
  }
  eq((await call("/", { body: { action: "create_deposit", clientId: "vic", quoteAmount: 1600, stripeAccountId: "not-an-acct" } })).status, 400, "21 malformed stripeAccountId → 400");

  // idempotency-key stability
  {
    reset();
    const b = { action: "create_deposit", clientId: "vic", quoteAmount: 1600, leadId: "rec1" };
    await call("/", { body: b }); await call("/", { body: b });
    eq(stripeCalls[0]?.headers["Idempotency-Key"], stripeCalls[1]?.headers["Idempotency-Key"], "22 identical calls share Idempotency-Key");
    const c = await call("/", { body: { ...b, quoteAmount: 800 } });
    ok(stripeCalls[2]?.headers["Idempotency-Key"] !== stripeCalls[0]?.headers["Idempotency-Key"], "23 different amount → different key");
    eq(c.status, 200, "23b");
  }

  // Stripe error passthrough
  { reset(); stripeFail = true; eq((await call("/", { body: { action: "create_deposit", clientId: "vic", quoteAmount: 1600 } })).status, 502, "24 Stripe error → 502"); reset(); }

  // webhook
  const whEnv = { STRIPE_WEBHOOK_SECRET: "whsec_test" };
  eq((await call("/webhook", { token: null, env: {}, rawBody: "{}", headers: {} })).status, 503, "25 webhook no secret → 503");
  eq((await call("/webhook", { token: null, env: whEnv, rawBody: webhookBody(), headers: { "Stripe-Signature": "t=1,v1=deadbeef" } })).status, 400, "26 bad signature → 400");
  {
    const p = webhookBody();
    const r = await call("/webhook", { token: null, env: whEnv, rawBody: p, headers: { "Stripe-Signature": await stripeSig(p, "whsec_test") } });
    eq(r.status, 200, "27 valid deposit, no MAKE_URL → 200 echo");
    eq(r.data?.event?.type, "deposit_paid", "27b normalized deposit_paid");
    eq(r.data?.forwarded, false, "27c echo mode");
  }
  {
    const p = webhookBody({ metadata: { type: "other" } });
    const r = await call("/webhook", { token: null, env: whEnv, rawBody: p, headers: { "Stripe-Signature": await stripeSig(p, "whsec_test") } });
    eq(r.status, 200, "28 non-deposit session → 200 ignored");
    ok(String(r.data?.ignored || "").startsWith("type:"), "28b ignored by type");
  }
  {
    const p = webhookBody({ type: "payment_intent.succeeded" });
    const r = await call("/webhook", { token: null, env: whEnv, rawBody: p, headers: { "Stripe-Signature": await stripeSig(p, "whsec_test") } });
    eq(r.data?.ignored, "payment_intent.succeeded", "29 non-paid-event type → ignored");
  }
  {
    const p = webhookBody({ type: "checkout.session.async_payment_succeeded" });
    const r = await call("/webhook", { token: null, env: whEnv, rawBody: p, headers: { "Stripe-Signature": await stripeSig(p, "whsec_test") } });
    eq(r.data?.event?.type, "deposit_paid", "30 async_payment_succeeded → deposit_paid");
  }
  {
    reset();
    makeUrl = "https://make.test/hook";
    const env = { ...whEnv, MAKE_WEBHOOK_URL: makeUrl, MAKE_SHARED_SECRET: "makesecret" };
    const p = webhookBody();
    const r = await call("/webhook", { token: null, env, rawBody: p, headers: { "Stripe-Signature": await stripeSig(p, "whsec_test") } });
    eq(r.status, 200, "31 forward mode → 200");
    eq(r.data?.forwarded, true, "31b forwarded true");
    eq(makeCalls[0]?.headers["X-Frontdesk-Token"], "makesecret", "31c least-privilege token (not WORKER_TOKEN)");
    reset();
  }
  {
    reset();
    const env = { ...whEnv, CLIENT_ACCOUNTS: '{"vic":"acct_ABC"}' };
    const p = webhookBody({ account: "acct_OTHER" });
    const r = await call("/webhook", { token: null, env, rawBody: p, headers: { "Stripe-Signature": await stripeSig(p, "whsec_test") } });
    eq(r.data?.ignored, "account-mismatch", "32 webhook account mismatch → ignored");
    reset();
  }

  // ── report ──
  globalThis.fetch = realFetch;
  console.log(`\n  iw-frontdesk harness: ${pass} passed, ${fail} failed  (${pass + fail} checks)\n`);
  if (fail) { for (const f of fails) console.log("  ✗ " + f); process.exit(1); }
  else console.log("  ✓ all green\n");
}
run().catch((e) => { console.error(e); process.exit(1); });
