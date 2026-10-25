// Tenant-context tests for the BeneBots worker. No network, no API key: the
// Anthropic call is intercepted and the composed system prompt is inspected.
//
// The three TestCo fixtures are real (scrubbed) plan documents and stay in the
// vault, never in this repo. They are read from BENEBOTS_FIXTURES_DIR, which
// defaults to the vault folder. Run: node --test test/
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import worker from "../index.js";
import { buildTenant } from "../tools/build-tenant.mjs";

const FIXTURES_DIR = process.env.BENEBOTS_FIXTURES_DIR ||
  join(homedir(), "Library/CloudStorage/OneDrive-Personal/Obsidian/Infinite Awesome Studio/02-Products/BeneBots/fixtures");
const fixture = name => JSON.parse(readFileSync(join(FIXTURES_DIR, name), "utf8"));
const medical = fixture("tenant-testco-hdhp.json");
const dental = fixture("tenant-testco-dental-dhmo.json");
const vision = fixture("tenant-testco-vision.json");

const ADMIN = "admin-token-for-tests";
const TESTCO_TOKEN = "testco-token-for-tests";
const OTHER_TOKEN = "otherco-token-for-tests";

const testco = buildTenant({
  tenantId: "testco", displayName: "TestCo", planYear: "2026", dailyCallCap: 3,
  lines: { medical, dental, vision }, token: TESTCO_TOKEN,
}).record;
const otherco = buildTenant({
  tenantId: "otherco", displayName: "OtherCo", planYear: "2026",
  lines: { vision }, token: OTHER_TOKEN,
}).record;

function kv(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    store,
    async get(key, type) {
      const v = store.get(key);
      if (v === undefined) return null;
      return type === "json" ? JSON.parse(v) : v;
    },
    async put(key, value) { store.set(key, value); },
  };
}

let anthropicCalls;
let env;
beforeEach(() => {
  anthropicCalls = [];
  globalThis.fetch = async (url, init) => {
    assert.equal(String(url), "https://api.anthropic.com/v1/messages", "only Anthropic may be called");
    anthropicCalls.push(JSON.parse(init.body));
    return new Response(JSON.stringify({ content: [{ type: "text", text: "ok" }] }), { status: 200 });
  };
  env = {
    WORKER_TOKEN: ADMIN,
    ANTHROPIC_API_KEY: "test",
    RATE_LIMITER: { limit: async () => ({ success: true }) },
    PUBLIC_KV: kv(),
    TENANTS: kv({ "tenant:testco": JSON.stringify(testco), "tenant:otherco": JSON.stringify(otherco) }),
  };
});

function call(body, token = ADMIN) {
  const headers = { "Content-Type": "application/json", Origin: "http://localhost:5173" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const req = new Request("https://worker.test/", { method: "POST", headers, body: JSON.stringify(body) });
  return worker.fetch(req, env);
}

const ask = extra => ({ botId: "ask", messages: [{ role: "user", content: "What is my deductible?" }], ...extra });
const lastSystem = () => anthropicCalls.at(-1).system;
const count = (haystack, needle) => haystack.split(needle).length - 1;

// ── Fail closed ─────────────────────────────────────────────────────────────

test("missing tenantId is rejected, never defaulted to Demo Co", async () => {
  const res = await call(ask({}));
  assert.equal(res.status, 400);
  assert.equal(anthropicCalls.length, 0);
});

test("unknown tenantId 404s and calls nothing", async () => {
  const res = await call(ask({ tenantId: "no-such-client" }));
  assert.equal(res.status, 404);
  assert.equal(anthropicCalls.length, 0);
});

test("malformed tenantId is rejected", async () => {
  for (const tenantId of ["", "Demo Co", "../tenant", 42]) {
    const res = await call(ask({ tenantId }));
    assert.equal(res.status, 400, `tenantId ${JSON.stringify(tenantId)}`);
  }
  assert.equal(anthropicCalls.length, 0);
});

test("a KV tenant 404s when the TENANTS namespace is not bound", async () => {
  delete env.TENANTS;
  const res = await call(ask({ tenantId: "testco" }));
  assert.equal(res.status, 404);
});

// ── The client-switcher defect ──────────────────────────────────────────────

test("Northpoint answers from Northpoint's plan, not Demo Co's", async () => {
  const res = await call(ask({ tenantId: "northpoint" }));
  assert.equal(res.status, 200);
  const s = lastSystem();
  assert.match(s, /Northpoint Manufacturing employees/);
  assert.match(s, /UnitedHealthcare/);
  assert.match(s, /\$2,000 \| Family: \$4,000/);
  assert.doesNotMatch(s, /Demo Co|Aetna|The Hartford/);
});

test("Demo Co answers from Demo Co's plan", async () => {
  await call(ask({ tenantId: "demo-co" }));
  const s = lastSystem();
  assert.match(s, /Demo Co employees/);
  assert.match(s, /Aetna/);
  assert.doesNotMatch(s, /Northpoint|UnitedHealthcare/);
  assert.doesNotMatch(s, /\{\{CLIENT\}\}/);
});

// ── Statutory vs plan design ────────────────────────────────────────────────

test("statutory figures appear exactly once, from the shared constant", async () => {
  for (const tenantId of ["demo-co", "northpoint", "testco"]) {
    await call(ask({ tenantId }));
    const s = lastSystem();
    assert.equal(count(s, "FEDERAL LIMITS FOR 2026"), 1, tenantId);
    assert.equal(count(s, "$4,400"), 1, `${tenantId}: HSA limit typed more than once`);
    assert.equal(count(s, "$3,400 limit"), 1, `${tenantId}: FSA limit typed more than once`);
  }
});

// ── The three real fixtures ─────────────────────────────────────────────────

test("TestCo composes medical, dental and vision from the fixtures verbatim", async () => {
  const res = await call(ask({ tenantId: "testco" }));
  assert.equal(res.status, 200);
  const s = lastSystem();
  for (const [name, source] of Object.entries({ medical, dental, vision })) {
    for (const [tier, t] of Object.entries(source.tiers)) {
      assert.ok(s.includes(t.contextBlock), `${name}/${tier} contextBlock missing from prompt`);
    }
  }
  assert.match(s, /TestCo employees/);
  assert.doesNotMatch(s, /Demo Co|Northpoint/);
});

// Assertions read plan facts from the fixtures themselves, so no real-plan
// figure is ever written into this repo.
test("TestCo medical carries both tiers with an ask-which-tier instruction", async () => {
  await call(ask({ tenantId: "testco" }));
  const s = lastSystem();
  assert.match(s, /Figures differ by coverage tier \(self-only, family\)/);
  assert.ok(s.includes(medical.tiers["self-only"].contextBlock));
  assert.ok(s.includes(medical.tiers.family.contextBlock));
});

test("naming a tier narrows medical to that tier only", async () => {
  await call(ask({ tenantId: "testco", tier: "self-only" }));
  const s = lastSystem();
  assert.ok(s.includes(medical.tiers["self-only"].contextBlock));
  assert.ok(!s.includes(medical.tiers.family.contextBlock), "family tier leaked into a self-only prompt");
  assert.doesNotMatch(s, /Figures differ by coverage tier/);
  // Tier-invariant lines are untouched.
  assert.ok(s.includes(dental.tiers.all.contextBlock));
  assert.ok(s.includes(vision.tiers.all.contextBlock));
});

test("an unknown tier is rejected", async () => {
  const res = await call(ask({ tenantId: "testco", tier: "employee-plus-pets" }));
  assert.equal(res.status, 400);
  assert.equal(anthropicCalls.length, 0);
});

test("answer boundaries and plan rules render, curator notes do not", async () => {
  await call(ask({ tenantId: "testco" }));
  const s = lastSystem();
  assert.match(s, /NOT IN THE MEDICAL PLAN DATA/);
  assert.match(s, /NOT IN THE DENTAL PLAN DATA/);
  assert.match(s, /MEDICAL PLAN RULES:/);
  const [ruleKey, ruleValue] = Object.entries(medical.sharedPlanRules.claimsAndAppeals)[0];
  assert.ok(s.includes(`${ruleKey}: ${ruleValue}`), "nested plan rule did not render");
  assert.doesNotMatch(s, /_exclusionNote|_provenance|_openForPilot|sourceDoc/);
});

test("the real tenant record carries no curator notes or raw tokens", () => {
  const json = JSON.stringify(testco);
  assert.doesNotMatch(json, /"_[a-zA-Z]/);
  assert.ok(!json.includes(TESTCO_TOKEN));
  assert.match(testco.accessTokenSha256, /^[0-9a-f]{64}$/);
});

// ── Per-tenant auth ─────────────────────────────────────────────────────────

test("a tenant's own token reaches its own tenant", async () => {
  const res = await call(ask({ tenantId: "testco" }), TESTCO_TOKEN);
  assert.equal(res.status, 200);
  assert.match(lastSystem(), /TestCo employees/);
});

test("a tenant token cannot read another tenant", async () => {
  const res = await call(ask({ tenantId: "otherco" }), TESTCO_TOKEN);
  assert.equal(res.status, 401);
  assert.equal(anthropicCalls.length, 0);
});

test("a tenant token cannot reach demo tenants or internal tools", async () => {
  const attempts = [
    ask({ tenantId: "demo-co" }),
    { botId: "blog-drafter", tenantId: "testco", system: "x", messages: [{ role: "user", content: "hi" }] },
    { botId: "job-analyzer", tenantId: "testco", system: "x", messages: [{ role: "user", content: "hi" }] },
    { action: "fetch", botId: "ask", tenantId: "testco" },
  ];
  for (const body of attempts) {
    const res = await call(body, TESTCO_TOKEN);
    assert.equal(res.status, 401, JSON.stringify(body).slice(0, 60));
  }
  assert.equal(anthropicCalls.length, 0);
});

test("wrong token and unknown tenant are indistinguishable", async () => {
  const wrong = await call(ask({ tenantId: "testco" }), "not-the-token");
  const unknown = await call(ask({ tenantId: "ghost-co" }), "not-the-token");
  assert.equal(wrong.status, 401);
  assert.equal(unknown.status, 401);
  assert.equal(await wrong.text(), await unknown.text());
});

test("admin token still reaches the internal tools", async () => {
  const res = await call({ botId: "blog-drafter", system: "You draft posts.", messages: [{ role: "user", content: "hi" }] });
  assert.equal(res.status, 200);
  assert.equal(lastSystem(), "You draft posts.");
});

// ── Spend cap ───────────────────────────────────────────────────────────────

test("a real tenant stops at its daily cap", async () => {
  const statuses = [];
  for (let i = 0; i < 4; i++) statuses.push((await call(ask({ tenantId: "testco" }), TESTCO_TOKEN)).status);
  assert.deepEqual(statuses, [200, 200, 200, 429]);
  assert.equal(anthropicCalls.length, 3);
});

test("admin calls on a real tenant count against its cap too", async () => {
  for (let i = 0; i < 3; i++) await call(ask({ tenantId: "testco" }));
  const res = await call(ask({ tenantId: "testco" }), TESTCO_TOKEN);
  assert.equal(res.status, 429);
});

test("invalid requests are not charged against the cap", async () => {
  await call({ botId: "ask", tenantId: "testco", messages: [] }, TESTCO_TOKEN);
  const day = new Date().toISOString().slice(0, 10);
  assert.equal(env.PUBLIC_KV.store.get(`tenantday:testco:${day}`), undefined);
});

test("a real tenant fails closed when the usage store is missing", async () => {
  delete env.PUBLIC_KV;
  const res = await call(ask({ tenantId: "testco" }), TESTCO_TOKEN);
  assert.equal(res.status, 503);
  assert.equal(anthropicCalls.length, 0);
});
