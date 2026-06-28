---
title: "Insights Blog (Blog Studio) — Product Explainer (Interview Prep + Library)"
tags: [ias-product, explainer, interview-prep, ai-concepts, pipeline, scraping, human-in-the-loop, static-publishing]
product: Insights Blog / Blog Studio
headline_concepts: [multi-step-pipeline, source-grounding, web-scraping, structured-output, static-publishing]
created: 2026-06-14
---

# Insights Blog (Blog Studio) — What It Is and How It Actually Works

> Headline concept: a **multi-step content pipeline** (scrape, research, draft, review, publish), grounded in real scraped sources. This one is a nice capstone, because it reuses pieces from every other product: the shared Worker proxy, structured output, source grounding and human-in-the-loop.

---

## 1. What it is (plain English)

Two halves. The **public** half is the "Insights" blog on the IAS site, a static surface that reads published posts from a JSON file. The **internal** half is **Blog Studio**, a private tool that scrapes recent benefits/AI news, drafts posts in the IAS voice from those real sources, and lets Ty review and approve before anything publishes.

So it's a small editorial assembly line: fresh source in, on-brand draft out, human approves, static site updates.

---

## 2. The 30-second spoken answer (know this cold)

> "The Insights blog has a public static front end that just reads published posts from a JSON file, cheap and safe. Behind it is an internal Blog Studio that runs a multi-step pipeline: it scrapes recent industry articles with a web scraper, then for each one it chains several Claude calls, generate research angles, gather supporting points, pick an angle, then draft the post as structured JSON in the brand voice. The draft is grounded in a real source article, not invented. Nothing auto-publishes, I review and approve, then it exports to the JSON the site reads. Same Worker proxy as my other products keeps the API key off the browser."

That answer signals: pipeline orchestration, web scraping, grounding, structured output, human-in-the-loop and static publishing. It's the broadest single answer you have.

---

## 3. The architecture: an editorial pipeline

Trace one post (`studio/blog-studio.html` + `worker/index.js`):

1. **Scrape sources.** The Studio asks the Worker (`action: "fetch"`) to run an Apify Google-News scraper for queries like "AI in employee benefits." The Worker calls Apify **server-side** (the `APIFY_TOKEN` never reaches the browser) and returns normalized article candidates (headline, summary, source, url, date). The Worker also **allowlists** which actor can run, so the proxy can't be used to run arbitrary paid jobs (least privilege).

2. **Chain the drafting steps.** For a chosen article the Studio runs a visible, ordered pipeline, each step a Claude call through the Worker (`botId: "blog-drafter"`):
   - **Generate research angles** → 3 short search queries.
   - **Gather supporting points** → 3 to 4 specific, data-flavored bullets.
   - **Choose an article angle** → pick a framing.
   - **Draft the post in IAS voice** → return **structured JSON** (`{title, excerpt, body, tags}`), following the brand guidelines, 350 to 600 words.

3. **Parse defensively.** `parseDraft()` strips code fences, finds the outer braces, and `JSON.parse`s, with a fallback to saving the raw text if parsing fails. (This is the validation step Infinite Careers still needs, you actually built it here.)

4. **Human-in-the-loop.** The result is saved as a **draft**, not published. Ty reviews and sets `status: "approved"`.

5. **Static publish.** `buildExport()` collects approved drafts, merges them with previously published posts, dedupes by slug, sorts newest-first, and writes `blog-posts.json`. The public `articles.html` reads that file. No database, no server at request time, just a static JSON the site renders.

The shape to name: **a grounded, multi-step pipeline with a human gate and a static publish target.**

---

## 4. The concepts this demonstrates

- **Multi-step pipeline / chaining.** One task is broken into ordered, single-purpose model calls (angles, then research, then draft), each feeding the next. This is the foundation of agentic workflows: small reliable steps, not one giant prompt.
- **Source grounding.** Drafts are built **from a real scraped article**, not from the model's imagination. Same anti-hallucination philosophy as the content engine, applied to editorial.
- **Web scraping, done safely.** A third-party scraper (Apify) invoked **through your Worker** so the scraper token stays server-side, with an actor allowlist. You can speak to both the capability and the security boundary.
- **Structured output with real parsing.** JSON-by-prompt **plus** a defensive parser that survives code fences and junk. This is the hardened version of the structured-output story.
- **Static publishing (JAMstack instinct).** The site serves a pre-built JSON file, not a live backend. Cheap, fast, hard to attack. Knowing *when not to use a server* is a real architecture signal.

---

## 5. A sharp nuance: when prompts are IP and when they're not

Worth understanding, because it shows you grasp *why* the architecture differs:

- In **BeneBots**, the system prompts are secret IP, so they live **server-side in the Worker** and the client only sends a `botId`.
- In **Blog Studio**, the prompts are **not** secret (they're just editorial instructions), so the client **supplies its own system prompt** per step and the Worker's only job is keeping the **API key** off the browser.

Same Worker, two different trust decisions, made on purpose. Being able to explain that contrast is a strong "I understand security boundaries" moment.

---

## 6. Likely interview follow-ups + how to answer

- **"Walk me through the pipeline."** → Scrape sources via the Worker, then chain calls: angles, supporting points, choose angle, draft as JSON, parse, save draft, human-approve, export to static JSON.
- **"How do you keep it from hallucinating a fake story?"** → It drafts from a real scraped source article, and benefits facts would still go through the KB-style verification before anything ships.
- **"How is the API key protected if the client sends the prompt?"** → The prompt isn't the secret here, the key is. The Worker holds the key; the client only sends non-secret editorial instructions.
- **"Why a static JSON instead of a CMS?"** → Cheap, fast, and almost nothing to attack. The publish volume doesn't justify a live backend.
- **"Is it automated end to end?"** → No, by choice. Drafting is automated, publishing is human-approved.

---

## 7. Honest limits (say before asked)

- Until DNS/config is finalized, `postsUrl` may point at the `pages.dev` URL rather than the apex, a config detail, noted in the HOWTO.
- The "choose angle" step is currently a random pick from a list, not a model decision, fine, but name it if asked how the angle is selected.
- The **scrape/redraft engine is the newer half**; the public reading surface is the mature part. Don't overstate the automation maturity.

---

## Source map (for re-reading the real code)

- `studio/blog-studio.html` — the pipeline: `callClaude()` (`botId: "blog-drafter"`), the ordered `step()` chain (~251 to 299), `parseDraft()` defensive JSON (~306), `buildExport()` static publish + dedupe (~321).
- `worker/index.js` — `handleFetch()` Apify scrape + actor allowlist (~281), the `blog-drafter` branch where the client supplies its own system prompt (~203).
- `landing/articles.html` + `landing/blog-posts.json` — the public static surface and its data file.
- `docs/HOWTO-Blog-Studio.md` — operating notes (incl. the `postsUrl` DNS caveat).
- Related: [[project-ias-blog]], [[project-ias-launch-state]].
