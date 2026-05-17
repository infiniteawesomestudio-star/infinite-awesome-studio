---
title: MASTER_TRACKER — Infinite Awesome Studio (Updated Session 11)
owner: Ty Mosher
date: 2026-05-17
---

# MASTER_TRACKER — Infinite Awesome Studio
**Owner:** Ty Mosher — ty@infiniteawesomestudio.com
**Last updated:** May 17, 2026 (Session 11 — Landing copy overhaul + /prompt-library launch)
**Repo:** https://github.com/infiniteawesomestudio-star/infinite-awesome-studio
**Branch:** main — auto-deploys to Cloudflare Pages on every push

---

## PROJECT 1 — Infinite Awesome Studio Landing Page

**Status:** In Progress — **Live:** `infinite-awesome-studio.pages.dev`

### P1 — Session 12 (Do First)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1.34 | Create /about-ty expanded founder page | **NEXT** | Ty writing founder story; build page once copy is ready |
| 1.36 | Email capture on /prompt-library | Pending | Formspree or Basin; "Get notified when new prompts drop" |
| 1.35 | Prompt library downloadable PDFs | Pending | Export each category; add download buttons; optional email gate |
| 1.3 | DNS: Porkbun → infiniteawesome.studio | Pending | Custom domain; blocked until ready to go live publicly |

### P2 — Session 12+ (Backlog)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1.8 | Validate/confirm pricing copy | Pending | $4k/mo, $500/hr, guarantee still placeholders |
| 1.9 | Clean up duplicate ias-landing.html | Pending | Review and delete or consolidate |
| 1.10 | Add waitlist/contact form handler | Backlog | Formspree or Basin for v1.1 |
| 1.11 | Add analytics | Backlog | Plausible or Cloudflare Web Analytics |
| 1.12 | Add case study page | Backlog | After 1-2 pilots have run |

### Done — Session 11 (May 17, 2026)

| Task | Notes |
|------|-------|
| Hero badge update | "AI TOOLS FOR BENEFITS ADMIN" → "STOP DIGGING WITH YOUR HANDS" |
| Problem section rewrite | New intro, 4-bullet rewrite, updated closing paragraphs |
| Founder eyebrow + guy-tag | Updated to "BUILT BY AN EXPERT DOING THIS FOR 25 YEARS" |
| Founder bio replacement | 4 old paragraphs → MY BACKGROUND narrative |
| MyBenefitsGuy mascot swap | New pointing-pose image (MyBenefitsGuy.png) embedded |
| Em dash removal (site-wide) | All `&mdash;` and `—` removed; rephrased naturally |
| "See the Free Workflows" CTA wiring | Both buttons: `#ai-tools` → `/prompt-library` |
| ias-founder-body block removed | Duplicate bio block deleted |
| /prompt-library page built + deployed | 19 prompts, 7 categories, role filtering, copy buttons, time-saved callouts |
| Prompt library source docs | 6 markdown files in `docs/prompt-library/` |

### Done — Session 10 (May 10, 2026)

| Task | Notes |
|------|-------|
| Messaging repositioning | AI Tools first, BeneBots as upgrade path |
| Founder credibility framing | 25 years expertise anchor established |

### Done — Sessions 1–9

All foundational build, a11y, UI/UX audit, Privacy/Terms, logo deployment, mobile nav, em dash removal complete.

---

## PROJECT 2 — BeneBots Platform

**Status:** In Progress — **Live:** `benebots.pages.dev`
**Stack:** TypeScript + React 18 + Tailwind + Vite

### P1 — Session 12 (Pending)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 2.31 | AskDemo follow-up suggestions UX | Pending | 2-3 suggested questions below first response |
| 2.22 | Acquire benebots.com domain | Pending | ~$12-15/yr via Porkbun; CNAME to benebots.pages.dev |

### P2 — Audit Fixes (Backlog)

| # | Task | Status | Notes |
|---|------|--------|-------|
| -- | FAQ arrow-key navigation | Pending | Audit finding #10 |
| -- | Base64 image extraction (landing) | Pending | Audit finding #11; reduces index.html from ~2.4MB |
| -- | Replace emoji icon (test tube) | Pending | Audit finding #12; use SVG |
| -- | Logo optimization (WebP) | Pending | Compress via squoosh.app |
| -- | Canonical URL update | Pending | Update when DNS live |

### Done — Sessions 1–9

All platform functionality, demo routes, Worker proxy, security, Privacy/Terms, logo deployment complete.

---

## PROJECT 3 — MyBenefitsGuy Practice Sub-Brand

**Status:** Content Strategy Live, Website Tier 2 (clear Projects 1 + 2 first)

### Content (NOW ACTIVE)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3.1–3.5 | Design system, templates, content calendar | Done | Carousel, typography, AI tool template, skills audit |
| 3.6 | Instagram/TikTok ready | In Progress | @MyBenefitsGuy handles registered |
| 3.7 | First carousel script | Pending | Shovel Origin Story (priority) |
| 3.8 | Weekly posting schedule | Pending | 3x Reels + 2x Carousels/week target |

### Website (Tier 2 — Defer)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3.10–3.12 | /mybenefitsguy sub-page | Deferred | Build when content is live and performing |

---

## /prompt-library — Prompts Status

**Page:** `/prompt-library` — deployed May 17, 2026
**Total prompts:** 19 across 7 categories

| Category | Prompts | Status |
|----------|---------|--------|
| New Hire & Onboarding | 3 | Live |
| Stewardship & Reporting | 3 | Live |
| Open Enrollment | 3 | Live |
| COBRA & Life Events | 3 | Live |
| Renewal & Carrier Strategy | 3 | Live |
| Compliance & Documentation | 3 | Live |
| Executive Summaries | 3 | Live |

**Next phase:** Downloadable PDFs per category + email capture

---

## Open Decisions

| Decision | Options | Status | Updated |
|----------|---------|--------|---------|
| Messaging strategy | AI Tools first → BeneBots as upgrade | DECIDED | May 10 |
| Prompt library hub | Built as /prompt-library (not /ai-workflows) | DECIDED | May 17 |
| Founder page | /about-ty — Ty writing story, build next session | In Progress | May 17 |
| PDF downloads | Per category; optional email gate | Pending decision | May 17 |
| DNS timing | Porkbun → infiniteawesome.studio | Undecided | — |
| Pricing copy | Finalize after client conversations | Undecided | — |
| BeneBots domain | benebots.com via Porkbun | Pending purchase | — |
| MyBenefitsGuy website | Section vs. /mybenefitsguy sub-page | Deferred Tier 2 | — |

---

## Session Velocity

| Session | Date | Focus | Status |
|---------|------|-------|--------|
| 1–5 | April 20–26 | BeneBots platform build + security | Complete |
| 6 | April 27 | Token rotation + logo deployment | Complete |
| 7 | April 29 | Shovel positioning + copy audit | Complete |
| 8 | April 29 | CTA wiring + logo final | Complete |
| 9 | May 8–9 | Content cleanup, a11y, UI/UX audit | Complete |
| 10 | May 10 | AI Tools messaging repositioning | Complete |
| 11 | May 17 | Landing copy overhaul + /prompt-library (19 prompts) | Complete |
| 12 | TBD | /about-ty founder page, PDFs, email capture | Queued |

---

## Technical Debt / Maintenance

| Item | Priority | Notes |
|------|----------|-------|
| Base64 image extraction | Medium | index.html is ~2.4MB; move images to /assets |
| FAQ keyboard navigation | Medium | Arrow keys between BeneBots FAQ items |
| Canonical URL (.studio) | Medium | Update when DNS live |
| Logo WebP optimization | Low | Squoosh.app compression |
| Emoji icon replacement | Low | HowItWorks test tube emoji → SVG |

---

## Cloudflare Account Reference

| Item | Value |
|---|---|
| Account ID | `cca65928af6c41ef16c684120cf68b0b` |
| Pages project — landing | `infinite-awesome-studio` |
| Pages project — benebots | `benebots` |
| Worker | `benebots-proxy` at `benebots-proxy.infiniteawesomestudio.workers.dev` |
