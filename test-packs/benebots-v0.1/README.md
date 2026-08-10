# BeneBots Answer Fidelity Pack v0.1

The first test coverage BeneBots has ever had. Built 2026-08-09.

**System under test:** the `benebots-proxy` Worker over HTTP — not a prompt file. This is an integration test of worker + context + model, which is what a client actually talks to.

---

## Why it exists

Three reasons, in order of weight.

**1. The statutory-figure regression has already happened twice.** The HSA pair `$4,300 / $8,550` was corrected on 6-20, silently reverted by the 7-04 reorg, and sat live for a month. Case `S-01` asserts `4,400` is present **and `4,300` is absent**. That regression could not survive one run of this pack.

**2. Shape B is build-once-template-to-ten.** Ten tenants means ten context blocks. Without automated checks, every new client is manual QA that does not scale — which quietly turns a product back into consulting.

**3. The tenant-context build will change how answers resolve.** You want the tests to exist *before* that lands, not after.

## Why scoring is deterministic

**Plan facts are facts.** "What is the family deductible" has one right answer, so it is an assertion, not a judgement.

That is a deliberate departure from the Infinite Sidekick packs, where an LLM evaluator is unavoidable — and where evaluator behaviour and single-sample variance consumed a full day on 8-09. **None of that applies here, and we should not import it.** No LLM judge appears anywhere in this pack.

---

## Run it

Always in this order. `run` executes `selftest` itself and refuses to continue if it fails.

```bash
python3 runner.py validate
python3 runner.py selftest
```

`selftest` is the **positive control** and it needs no network, no token, and no money. It feeds the engine known-good and known-bad responses and proves each assertion type can both pass *and* fail.

> A check that cannot fail is worthless. On 8-09 a PDF extraction returned 20,481 characters containing none of the words the document must contain — the volume looked exactly like success. Prove the check finds a positive before you trust its negative.

For the live suite, **export the token, never paste it on the command line** — it lands in shell history:

```bash
read -rs BENEBOTS_WORKER_TOKEN && export BENEBOTS_WORKER_TOKEN
```

```bash
export BENEBOTS_WORKER_URL="https://<worker-host>" && python3 runner.py run
```

Single case while iterating:

```bash
python3 runner.py run --case S-01
```

Live runs cost real Anthropic tokens — 17 cases, one call each.

---

## The pass bar, committed before the first run

**Zero critical failures.** The `T-*` tenant-isolation cases are excluded and tracked separately as known-defect witnesses.

Committing the bar in `manifest.json` before running is the discipline that let Core Coach v0.5.0 sign. **Do not adjust it after seeing results** — a bar moved to fit an outcome is not a bar.

## Known-defect witnesses

`T-01` and `T-02` are **expected to fail today.** The worker has no tenant concept: `AskDemo.tsx` and `StewardshipDemo.tsx` send no client id, and `DEMO_CONTEXT` is a hardcoded constant appended to every system prompt. So a `tenantId` of `testco-hdhp` gets Demo Co's answers.

They exist so the defect cannot be quietly forgotten, and so the tenant-context build has a witness that flips green when it lands. The runner calls that out explicitly when it happens and tells you to promote them into the scored bar.

## Case classes

| Class | Cases | Scoring |
|---|---|---|
| `statutory` | S-01…S-05 | Law. Identical for every tenant, so these belong to the shared statutory constant, never a per-tenant record. Critical. |
| `plan-design` | P-01…P-06 | Ty's fictional Demo Co values. `contains_none` traps the adjacent wrong number — PPO deductible when asked about the HDHP, primary-care copay when asked about a specialist. |
| `boundary` | B-01…B-04 | What the bot must **refuse**. A refusal that still states a dollar figure is scored as a failure, because that is the invention failure mode. |
| `tenant-isolation` | T-01…T-02 | Known-defect witnesses. Excluded from the bar. |

`B-03` deserves a note: premiums are excluded from plan documents by federal design, confirmed 8-09 across 146 pages of real documents. The bot must say it does not have the figure. **The dangerous answer is a plausible one.**

## Not covered here

`plan-compare`, `oe-coach`, `loa-navigator` and `claims-compass` are deterministic React widgets, not model calls. They need component tests, not this pack.

## When the tenant build lands

1. Point `T-01`/`T-02` at the real tenant route and confirm they flip to PASS.
2. Move them into the scored bar and drop `known_defect`.
3. Clone the `demo-co` cases per tenant, generating the answer key from that tenant's own documents.
4. Add a per-tier pair — an SBC is issued **per coverage tier**, and answering a self-only member from the family document is the same defect one level deeper.

---

*Related: `02-Products/BeneBots/Tenant-Context-Build-Scope.md`, `Plan-Extraction-Timing-Test-2026-08-09.md`, and the scrubbed `fixtures/tenant-testco-hdhp.json` that supplies the T-case answer key.*
