# Session 14 Handoff — IAS Blog "Insights" Engine
**Date:** 2026-05-30
**Session Focus:** Built the IAS homepage blog end-to-end — public articles page, homepage Latest Insights card, worker blog-drafter + Apify fetch, internal Blog Studio, Google News scraper. Plus a round of git/secret security hardening.
**Branch:** main | **Deploy:** Cloudflare Pages ✅ auto-deploy on push
**Commits:** `69b7787` (public blog) · `e1c3d18` (engine) · `8ebad93` (data_xplorer) · `dc85e45` (RSS-only)
**Worker:** `benebots-proxy.infiniteawesomestudio.workers.dev` · Version `7b23c869`

---

## What Was Completed

### 1. Public Blog Surface (live)
- `landing/articles.html` — standalone IAS-branded articles page. Card grid + hash-routed reader view, source attribution, reuses IAS nav/footer. Renders from `landing/blog-posts.json`.
- `landing/index.html` — the "Fractional Benefits Consulting" Advisory card was replaced with a **Latest Insights** card that fetches the 3 newest published posts from blog-posts.json. "Insights" link added to desktop + mobile nav.
- `landing/blog-posts.json` — single source of truth for BOTH the articles page and the homepage card. Schema documented in its `_schema` key (id, title, slug, excerpt, body, tags, source, sourceUrl, date, readMinutes, status). Seeded with 2 starter posts in IAS voice. Body paragraphs separated by `\n\n`.
- Em dashes removed across the blog files (Ty preference); title separators use `·`.

### 2. Worker — blog-drafter + fetch (`worker/index.js`)
- **`blog-drafter` botId:** the internal Studio supplies its own per-step `system` prompt (research / draft / classify). Because it's gated by WORKER_TOKEN and used only by Ty, prompts aren't locked like the public BeneBots — the worker's only job there is keeping the Anthropic key server-side. No Acme demo context is appended.
- **`fetch` action:** `{ action:"fetch", actor, input }` → runs an Apify actor via `run-sync-get-dataset-items` using the `APIFY_TOKEN` secret, normalizes varied Google News fields to `{headline,summary,source,url,date}`, returns `{items:[...]}`. Actor-agnostic (default set in Studio).
- CORS updated to allow any `localhost`/`127.0.0.1` origin (internal Studio runs locally); WORKER_TOKEN is still the real gate.
- Secrets on the worker: `ANTHROPIC_API_KEY`, `WORKER_TOKEN`, `APIFY_TOKEN`. Redeploy with `cd worker && npx wrangler deploy`.

### 3. Blog Studio (`studio/blog-studio.html`) — internal tool
- Lives OUTSIDE `landing/` so Cloudflare Pages never serves it publicly.
- **Setup:** Worker URL, Worker token (the `VITE_WORKER_TOKEN` from `benebots/.env`), existing-posts URL, editable IAS brand guidelines.
- **Queue:** Fetch new articles (Apify) or add manually.
- **Pipeline:** research angles → supporting points → pick angle (4 ARTICLE_ANGLES) → draft → save.
- **Drafts:** review, edit (title/slug/excerpt/body/tags/source/date), Approve.
- **Publish:** Import existing published posts, then Download the merged `blog-posts.json` to drop into `landing/` and push.
- Run it: `npx serve studio -l 8090` → `http://localhost:8090/blog-studio.html`.

### 4. Apify Scraper
- `crawlerbros/google-news-scraper` was selected first but returned **0 results** on every run (broken). Switched to **`data_xplorer/google-news-scraper-fast`** (works, cheaper, no start fee).
- Input fields differ: `keywords`, `maxArticles`, `timeframe` (1h/1d/7d/1y/all — NO "1m"), `region_language` ("US:en").
- **RSS-only** config: `decodeUrls:false` + `extractDescriptions:false`. Both options do per-article page fetches that throttle and TIME-OUT at batch scale (4×12 timed out at 120s). RSS-only returns ~30–40 articles in ~2s. Trade-off: URLs are Google News redirect links (still resolve to the publisher); summaries come from the redraft's research step.
- Studio has an auto-migration: stale `crawlerbros` actor + invalid `1m` date range in a user's localStorage get corrected on load.
- **Verified: 43 articles fetched into the queue.** Full chain works.

### 5. Security Hardening
- The git remote URL had a GitHub PAT embedded in plaintext → switched to **tokenless HTTPS**, auth via macOS `credential.helper=osxkeychain`. Verified with `git ls-remote`.
- The token then leaked twice more via terminal paste (a `# Password: ghp_…` comment line, then `npx apify_api_…`). Both the GitHub PAT and the Apify token were **revoked and rotated**.
- Rule going forward: enter secrets ONLY at hidden prompts (`Enter a secret value:`, `Password:`) — never as a command-line argument.

---

## Files Changed
```
landing/articles.html                  — NEW: public IAS articles page
landing/blog-posts.json                — NEW: blog data source + 2 seed posts
landing/index.html                     — Latest Insights card (replaced Fractional Consulting) + Insights nav link + recent-posts script
studio/blog-studio.html                — NEW: internal Blog Studio
worker/index.js                        — blog-drafter botId + fetch (Apify) action + localhost CORS
.claude/launch.json                    — added 'studio' dev server (port 8090)
docs/Master Trackers/…session14.md     — NEW
docs/Handoff Vault/…session14.md        — NEW (this file)
```
(Root preview launch.json at `Claude Code Safe/.claude/launch.json` also got a `studio` entry — that file is outside the repo and not committed; it's what the preview tool reads.)

---

## How To Run / Publish a Post
1. `cd worker && npx wrangler deploy` (only if worker changed)
2. `npx serve studio -l 8090` → open `http://localhost:8090/blog-studio.html`
3. Setup → paste Worker URL + `VITE_WORKER_TOKEN` (from `benebots/.env`) → Test connection (green)
4. Queue → Fetch new articles → pick one → Generate
5. Drafts → edit → Approve
6. Publish → Import existing → Download `blog-posts.json` → replace `landing/blog-posts.json` → commit + push (Pages auto-deploys)

---

## Open for Session 15
| Item | Notes |
|------|-------|
| **Fix BeneBots logo on BeneBots page** | The transparent logo from Session 13 isn't looking good — correct it |
| **Blog Studio "how to run" doc** | Step-by-step run instructions (expand the section above into a standalone doc) |
| **Add small-business AI news to Blog Studio** | IAS is broader than benefits — add SMB/small-business AI fetch queries to the defaults |
| Publish first real post | Run one article through the full loop end-to-end |
| Carried: prompt-library navbar link, Stewardship/group-shot images, /about-ty, DNS Porkbun, replace Acme sample data | from Session 13 |

---

## Brand Reminders
- Never use: "powerful," "seamless," "innovative," "game-changer." Em dashes as sparingly as possible.
- Shovel analogy is the through-line.
- Bot colors: Ask `#00C47A` · Stewardship `#5B8FFF` · Compare `#F7D154` · OE Coach `#FF6F61` · LOA `#A78BFA` · Claims `#F97316`
