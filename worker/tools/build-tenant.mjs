// Build a BeneBots tenant record from curated plan-line files, ready to load
// into the TENANTS KV namespace. Onboarding a client is this script plus one
// `wrangler kv key put`, with no code change and no deploy.
//
// Usage:
//   node tools/build-tenant.mjs --tenant-id acme --name "Acme Co" --out ~/somewhere-private \
//     medical=path/to/medical.json dental=path/to/dental.json vision=path/to/vision.json
//
// Writes two files into --out (keep it OUTSIDE this repo, plan data is client data):
//   tenant-<id>.json  the KV value. Holds a SHA-256 of the access token, never the token.
//   tenant-<id>.token the access token to hand the client, file mode 600. Shown nowhere else.
// Then:
//   npx wrangler kv key put --binding TENANTS "tenant:<id>" --path <out>/tenant-<id>.json --remote

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash, randomBytes } from "node:crypto";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const TENANT_ID_RE = /^[a-z0-9][a-z0-9-]{1,62}$/;

// Copies only what the worker reads. Curator notes (keys starting "_", at any
// depth) and provenance stay in the source files.
function stripNotes(value) {
  if (Array.isArray(value)) return value.map(stripNotes);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).filter(([k]) => !k.startsWith("_")).map(([k, v]) => [k, stripNotes(v)]));
}

function toLine(source) {
  if (!source.tiers || typeof source.tiers !== "object" || !Object.keys(source.tiers).length) {
    throw new Error(`${source._fixture || "line file"}: needs at least one tier`);
  }
  const tiers = {};
  for (const [name, tier] of Object.entries(source.tiers)) {
    if (typeof tier.contextBlock !== "string" || !tier.contextBlock.trim()) {
      throw new Error(`${source._fixture || "line file"}: tier "${name}" has no contextBlock`);
    }
    tiers[name] = { contextBlock: tier.contextBlock, sourceDoc: tier.sourceDoc };
  }
  const line = { planType: source.planType, carrier: source.carrier, figuresCheckedAt: source.figuresCheckedAt, tiers };
  if (source.sharedPlanRules) line.sharedPlanRules = stripNotes(source.sharedPlanRules);
  if (Array.isArray(source.doesNotCover_answerBoundary)) line.doesNotCover_answerBoundary = stripNotes(source.doesNotCover_answerBoundary);
  return line;
}

export function buildTenant({ tenantId, displayName, planYear, dailyCallCap, lines, token }) {
  if (!TENANT_ID_RE.test(tenantId)) throw new Error(`Invalid tenant id: ${tenantId}`);
  if (!displayName) throw new Error("Missing display name");
  const accessToken = token || randomBytes(32).toString("base64url");
  const record = {
    tenantId,
    displayName,
    planYear,
    dailyCallCap,
    accessTokenSha256: createHash("sha256").update(accessToken).digest("hex"),
    lines: Object.fromEntries(Object.entries(lines).map(([name, source]) => [name, toLine(source)])),
    updatedAt: new Date().toISOString(),
  };
  return { record, accessToken };
}

function main(argv) {
  const opts = {};
  const lines = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) opts[arg.slice(2)] = argv[++i];
    else if (arg.includes("=")) {
      const [name, path] = arg.split("=", 2);
      lines[name] = JSON.parse(readFileSync(resolve(path), "utf8"));
    }
  }
  if (!opts["tenant-id"] || !opts.name || !opts.out || !Object.keys(lines).length) {
    console.error("Usage: node tools/build-tenant.mjs --tenant-id <id> --name <display name> --out <dir> [--plan-year 2026] [--cap 200] line=path ...");
    process.exit(1);
  }
  const { record, accessToken } = buildTenant({
    tenantId: opts["tenant-id"],
    displayName: opts.name,
    planYear: opts["plan-year"] || String(new Date().getFullYear()),
    dailyCallCap: opts.cap ? parseInt(opts.cap, 10) : undefined,
    lines,
  });
  const out = resolve(opts.out);
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, `tenant-${record.tenantId}.json`), JSON.stringify(record, null, 2));
  writeFileSync(join(out, `tenant-${record.tenantId}.token`), accessToken + "\n", { mode: 0o600 });
  console.log(`Wrote tenant-${record.tenantId}.json and tenant-${record.tenantId}.token to ${out}`);
  console.log(`Lines: ${Object.entries(record.lines).map(([n, l]) => `${n} (${Object.keys(l.tiers).join(", ")})`).join("; ")}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv.slice(2));
