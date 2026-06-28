---
title: "Bene-Research Assistant — Product Explainer (Interview Prep + Library)"
tags: [ias-product, explainer, interview-prep, ai-concepts, automation, batch, config-driven]
product: Bene-Research Assistant
headline_concepts: [batch-automation, config-driven-agents, direct-api, separation-of-config-and-code]
created: 2026-06-14
---

# Bene-Research Assistant — What It Is and How It Actually Works

> Headline concept: **config-driven batch automation.** This is the "I automate work at scale" story. It is the simplest of the IAS products under the hood, which makes it a great one to explain crisply.

---

## 1. What it is (plain English)

A research robot. It reads a list of benefits topics from a config file, and for each one it asks Claude to write a deeply researched, cited, wiki-linked study note, then saves it as a markdown file in the Obsidian vault. Run one command, walk away, come back to a populated knowledge base.

It scaled to **eight researchers** that share one engine: a main agent plus seven specialists (unions, retirement, supplemental, ICHRA, CEBS/GBA, BeneBot content, industry). Roughly 85 topics on demand.

---

## 2. The 30-second spoken answer (know this cold)

> "It's a config-driven batch automation in Node. The work to be done lives in a JSON config, a list of topics with research angles and the sections each note should have. The script is a generic engine: it loops the config, calls the Claude API once per topic with a specialized system prompt, and writes a structured markdown file with frontmatter and cross-links. Because the topics are data and the engine is code, I cloned it into eight specialized researchers by swapping the config and the system prompt, not by rewriting logic. It rate-limits between calls and has a dry-run mode so I can test without spending or writing files."

That answer signals: separation of config and code, API integration, batch processing, cost-awareness, testability. Clean engineering instincts.

---

## 3. The architecture: a generic engine driven by data

The whole system is one small pattern repeated. Walk it (`cebs-researcher.js`):

1. **Load config.** The script reads its JSON config at startup (`cebs-researcher-config.json`). The config holds the vault path and a list of topics, each with `search_queries`, `sources`, and the `include_sections` the note must contain.

2. **Flatten the work.** `getAllTopics()` pulls every topic out of the config into one list to iterate.

3. **Per topic, build two prompts.**
   - A **system prompt** that sets the role and the rules (e.g. "you are a benefits certification expert, focus on testable content, use `[[WikiLinks]]`, return only markdown").
   - A **user prompt** assembled from that topic's data, the study angles, the required section headers, the format rules.

4. **Call the API.** `callClaudeForResearch()` POSTs to `api.anthropic.com/v1/messages` with the API key from an environment variable, and returns the text.

5. **Write the file.** `writeMarkdownFile()` adds Obsidian frontmatter (title, tags, created/updated) and a title heading, then writes to the right folder, creating it if needed.

6. **Loop with a throttle.** It does the next topic after a **2-second delay** so it doesn't hammer the API. Progress, successes and failures are logged.

The shape to name: **the work is data, the engine is code.** That separation is why eight researchers exist with one piece of logic.

---

## 4. The concepts this demonstrates

- **Config-driven design / separation of concerns.** Behavior lives in JSON, not hardcoded. Add a topic = edit data. Add a whole new researcher = copy the config and the system prompt. No engine rewrite. This is the cleanest "I understand maintainable design" point you have.
- **Batch processing with rate limiting.** It processes a queue sequentially with a deliberate throttle between calls. You understood that an automation that fires unbounded requests will get rate-limited or run up a bill, so you paced it.
- **Direct API integration.** A plain `fetch` to the Anthropic messages endpoint with `x-api-key`, `anthropic-version`, a `system` prompt and a `messages` array. You can describe the actual anatomy of an API call, which is exactly what "I prompted Claude good" candidates cannot do.
- **Testability.** A `--dry-run` mode researches without writing files, and `--max=N` limits the run. You build a way to validate before going to production. That instinct reads as senior.

---

## 5. How this differs from BeneBots (have this contrast ready)

Interviewers love a compare. Same model, opposite shapes:

- **Bene-Research** is **server-side batch automation**: a script you run, no user, no browser, talks to the API **directly** because the key lives safely on your own machine in an env var.
- **BeneBots** is an **interactive product**: a browser, real users, so the key has to hide behind a Worker proxy.

The lesson you can articulate: *where the code runs decides how you handle the key.* On your own machine, an env var is fine. In a user's browser, you need a server in between. That single sentence shows you understand the security boundary, not just the API.

---

## 6. Honest limits (say before asked)

- **The model and API version are hardcoded** (`claude-sonnet-4-5`, `anthropic-version: 2023-06-01`). Fine for a personal tool, but it means the script needs a manual touch to move models. A hardening step would be pulling those into config too.
- **No web fetch in the loop.** It relies on the model plus its search-query prompting rather than scraping live sources, so freshness depends on the model's training. For facts that move yearly (benefits limits), pair the output with the content engine's KB Cross-Check before trusting a number. (Good systems-thinking link to make out loud.)
- **No retries on a failed call.** A failure is logged and skipped, not retried. Acceptable for a re-runnable batch, worth naming as a known edge.

---

## 7. Likely interview follow-ups + how to answer

- **"Walk me through one run."** → Load config, flatten topics, per topic build a system + user prompt, call the API, write a markdown file with frontmatter, wait 2 seconds, repeat.
- **"How did you avoid rewriting it eight times?"** → Config-driven. The engine is generic; each researcher is just a different config and system prompt.
- **"How do you test it safely?"** → Dry-run mode researches without writing or, effectively, committing spend; `--max` caps the batch.
- **"How is this different from your chat product?"** → See section 5. Batch vs interactive, direct API vs proxied, because of where the code runs.

---

## Source map (for re-reading the real code)

- `cebs-researcher.js` — the engine: `getAllTopics()`, `callClaudeForResearch()` (the actual API call), `writeMarkdownFile()`, the 2-second throttle, the dry-run/max flags.
- `cebs-researcher-config.json` — the data: topics, `search_queries`, `sources`, `include_sections`.
- `*-batch-runner.js` — orchestrates batches sequentially.
- `web-control-panel.html` + `0-Index/RESEARCHERS-DASHBOARD.md` — the management surfaces.
- Lives in the Obsidian vault folder `Bene-Research Assistant/`. Output lands in `3-Knowledge-Base/`.
