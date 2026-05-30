# Master Tracker — Session 14
**Date:** 2026-05-30 | **Project:** IAS Blog "Insights" — scrape + redraft engine
**Commits:** `69b7787` (public blog) · `e1c3d18` (engine) · `8ebad93` (data_xplorer) · `dc85e45` (RSS-only)
**Worker:** `benebots-proxy.infiniteawesomestudio.workers.dev` · Version `7b23c869` ✅ | **Deploy:** Cloudflare Pages (auto) ✅

---

## IAS Blog "Insights" — NEW this session

### ✅ Public surface (deployed)
- [x] `landing/articles.html` — IAS-branded articles page (card grid + hash-routed reader, source attribution), matches brand tokens (warm-neutral / mint / Space Grotesk + Inter)
- [x] `landing/index.html` — replaced "Fractional Benefits Consulting" card with a **Latest Insights** card that pulls the 3 newest posts from blog-posts.json
- [x] "Insights" link added to main nav (desktop + mobile)
- [x] `landing/blog-posts.json` — single source of truth (schema in `_schema` key) + 2 seed posts in IAS voice
- [x] Em dashes removed across blog files per brand preference (title separators use `·`)

### ✅ Engine (deployed + verified)
- [x] `worker/index.js` — `blog-drafter` botId: internal Studio supplies its own per-step system prompt (research/draft/classify); Anthropic key stays server-side; no Acme demo context
- [x] `worker/index.js` — `fetch` action: runs an Apify actor server-side (APIFY_TOKEN secret), normalizes varied Google News output to {headline,summary,source,url,date}; actor-agnostic
- [x] CORS now allows localhost/127.0.0.1 origins (for the internal Studio); WORKER_TOKEN still the gate
- [x] APIFY_TOKEN secret added; worker redeployed (version `7b23c869`)
- [x] `blog-drafter` path verified live (curl ping → "ok")

### ✅ Blog Studio (internal tool)
- [x] `studio/blog-studio.html` — lives OUTSIDE `landing/` so Cloudflare Pages never serves it publicly
- [x] Tabs: Queue → Pipeline → Drafts → Publish → Setup
- [x] Pipeline mirrors the LinkedIn flow: research angles → supporting points → pick angle → draft (JSON title/excerpt/body/tags) → editable draft
- [x] Human-in-the-loop: edit → Approve → Publish tab exports full blog-posts.json (merges imported published + approved)
- [x] All Claude calls route through the worker (blog-drafter); no API key in the browser
- [x] `.claude/launch.json` — added `studio` dev server (port 8090)

### ✅ Apify scraping (on-demand)
- [x] Chosen actor: **`data_xplorer/google-news-scraper-fast`** (after `crawlerbros` returned 0 results — broken)
- [x] RSS-only config (decodeUrls + extractDescriptions OFF) — both do per-article page fetches that throttle/TIME-OUT at batch scale; RSS-only returns ~30–40 articles in ~2s
- [x] Auto-migration in Studio: stale `crawlerbros` actor + `1m` date range in localStorage get corrected on load
- [x] **VERIFIED: 43 articles fetched into the queue** — full chain Studio → worker → Apify → normalized queue working

### 🔜 Remaining (usage)
- [ ] Run first article through redraft → approve → export → drop into `landing/blog-posts.json` → push (publish a real post)

---

## 🔒 Security (resolved this session)
- [x] GitHub PAT was embedded in the git remote URL (plaintext) → switched to **tokenless HTTPS + macOS Keychain** auth
- [x] Two further token leaks via terminal paste (GitHub token in a `# Password:` line; Apify token as an `npx` arg) → **both revoked + rotated**
- [x] Lesson captured: secrets go ONLY at hidden prompts (`Enter a secret value:`, `Password:`), never on a command line

---

## 🔜 Session 15 — Priority Todos
- [ ] **Fix BeneBots logo on the BeneBots page** — the transparent version added in Session 13 isn't looking good; correct it
- [ ] **Write step-by-step "How to run Blog Studio" doc** — start server, open, connect token, fetch, redraft, approve, export, publish
- [ ] **Add small-business AI news to Blog Studio** — IAS is broader than benefits; add small-business/SMB AI fetch queries (and surface them in the fetch defaults)

---

## 🔜 Carried over (from Session 13)
- [ ] Add prompt-library link to navbar (when ready to promote)
- [ ] Stewardship Studio dedicated character image (ComplianceBot standing in)
- [ ] Group shot / HSABot+FSABot duo (blocked on ChatGPT delivery)
- [ ] /about-ty expanded founder page (Ty writing copy)
- [ ] DNS: Porkbun → infiniteawesome.studio (Ty action)
- [ ] Replace Acme Industries sample data before live demos

---

## Session Log
| Session | Date | Focus |
|---------|------|-------|
| 14 | 2026-05-30 | IAS Blog "Insights": public articles page, homepage card, worker blog-drafter + Apify fetch, Blog Studio, data_xplorer scraper, security hardening |
| 13 | 2026-05-28 | New logo, Claims Compass demo, worker security, prompt library, IAS updates, deploy |
| 12 | 2026-05-23 | Bot images, 6th bot, duo image, ChatGPT prompts |
