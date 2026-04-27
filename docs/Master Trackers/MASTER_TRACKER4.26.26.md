# MASTER_TRACKER — Infinite Awesome Studio
**Owner:** Ty Mosher · ty@infiniteawesomestudio.com  
**Last updated:** April 26, 2026 (Sessions 1–5 complete · Session 6 queued)  
**Repo:** https://github.com/infiniteawesomestudio-star/infinite-awesome-studio  
**Branch:** main → auto-deploys to Cloudflare Pages on every push

---

## PROJECT 1 — Infinite Awesome Studio Landing Page

**Status:** 🟡 In Progress · **Live:** `infinite-awesome-studio.pages.dev`

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1.1 | Wire all CTA href="#" → mailto: links | ⏳ Pending | mailto:ty@infiniteawesomestudio.com on every button |
| 1.2 | Deploy to Cloudflare Pages | ✅ Done | CI/CD via GitHub OAuth |
| 1.3 | Point Porkbun DNS → custom domain | ⏳ Pending | Pages URL live; DNS not confirmed yet |
| 1.4 | Wire "View Live Demo" CTA → benebots.pages.dev | ⏳ Pending | BeneBots is live — just needs the link wired |
| 1.5 | Generate IAS logo from Gemini | ⏳ Pending | Prompts in brand guide §07 |
| 1.6 | Update IAS logo in landing + navbar + footer | 🟡 P2 | Check branding/ folder first |
| 1.7 | Mobile nav hamburger menu | ⏳ Pending | Nav links hide below 900px |
| 1.8 | Add Privacy + Terms pages | ⏳ Pending | Termly/iubenda before any public traffic |
| 1.9 | Validate/confirm pricing copy | ⏳ Pending | $4k/mo, $500/hr, guarantee are placeholders |
| 1.10 | Clean up landing/ duplicate (ias-landing.html) | ⏳ Pending | Review and delete or consolidate |
| 1.11 | Add waitlist/contact form handler | 🔵 Backlog | Formspree or Basin for v1.1 |
| 1.12 | Add analytics | 🔵 Backlog | Plausible or Cloudflare Web Analytics post-launch |
| 1.13 | Add case study page | 🔵 Backlog | After 1-2 pilots have run |
| 1.14 | Brand mark + OG image wired | ✅ Done | favicon.svg + og-image.png |
| 1.15 | Mascot PNGs embedded as base64 | ✅ Done | Self-contained HTML |
| 1.16 | Three-act narrative structure built | ✅ Done | Studio → MyBenefitsGuy → BeneBots |
| 1.17 | Brand identity v1.0 applied | ✅ Done | Ink + paper + electric amber |
| 1.18 | Cloudflare Pages CI/CD connected | ✅ Done | Auto-deploys on every git push |

---

## PROJECT 2 — BeneBots Platform

**Status:** 🟡 In Progress · **Live:** `benebots.pages.dev`  
**Stack:** TypeScript + React 18 + Tailwind + Vite

### 🔴 P0 — Session 6 (fix before any demo calls)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 2.26 | Revert AskDemo error message to user-friendly copy | ⏳ Pending | `AskDemo.tsx` ~line 119 — was debug string; change to "The demo isn't responding right now. Try again in a moment." |
| 2.27 | Rotate WORKER_TOKEN to strong random value | ⏳ Pending | Current token `benebots-demo-2026` is weak; `openssl rand -hex 32`; update both benebots-proxy Worker vars and Pages env vars |
| 2.28 | Deploy remaining worker CORS fixes | ⏳ Pending | Lines 13, 23, 33, 36 in worker/index.js — committed to git but NOT deployed to Cloudflare yet; requires dashboard deploy |

### 🟡 P1 — Session 6 Core Work

| # | Task | Status | Notes |
|---|------|--------|-------|
| 2.18 | Full copy audit — HowItWorks.tsx | ⏳ Pending | Real consultant workflow: onboard → configure → deploy; no "3 easy steps" framing; keep diagnostics callout |
| 2.19 | Full copy audit — FAQ.tsx | ⏳ Pending | Add grounding differentiator Q; add customization Q; remove pricing refs; fix LOA Navigator badge color #00a868 → #A78BFA |
| 2.29 | Set up wrangler CI/CD for worker | ⏳ Pending | `.github/workflows/deploy-worker.yml` + `worker/wrangler.toml`; requires `CLOUDFLARE_API_TOKEN` secret in GitHub |
| 1.1 | Wire all CTA href="#" → mailto: links | ⏳ Pending | `landing/index.html` — mailto:ty@infiniteawesomestudio.com on every button |
| 1.4 | Wire "View Live Demo" CTA → benebots.pages.dev | ⏳ Pending | BeneBots is live — just needs the link wired |
| 1.7 | Mobile nav hamburger menu | ⏳ Pending | Nav links hide below 900px |

### ✅ Done — Session 5 (April 26)

| Task | Notes |
|------|-------|
| Create `src/data/acmeProfile.ts` | Full Acme Industries profile: medical, dental, vision, HSA, FSA, 401k, LOA, COBRA |
| Add React Router v7 + `/demo/:botId` routes | BrowserRouter in App.tsx; `public/_redirects` for Cloudflare SPA |
| Build `Demo.tsx` route handler | Dispatches to 5 demo components; viewport-locked layout for chat |
| Build `AskDemo.tsx` | Live chat via Worker; Acme system prompt; suggested questions; viewport-locked |
| Build `StewardshipDemo.tsx` | Section picker; Acme claims sidebar; canned + live drafts |
| Build `PlanCompareDemo.tsx` | HDHP vs PPO; 3 employee profiles; real cost math |
| Build `OECoachDemo.tsx` | 4-step questionnaire → plan recommendation |
| Build `LOANavigatorDemo.tsx` | Employee/HR mode; CA/NY/WA picker; guardrail discipline |
| Features.tsx — 5 bot cards clickable | LOA Navigator added; all cards navigate to `/demo/{slug}` |
| Hero.tsx copy audit | New headline; 5 bots; "Try Ask BeneBot →" CTA |
| Features.tsx copy audit | "Five Agents, One Platform"; 2-sentence bot descriptions |
| Capabilities.tsx — replaced Pricing | 3 use-type columns; no price anchoring |
| Footer + Navbar copy audit | Pricing removed; contact email updated |
| Worker CORS fix — 401 response | Auth error now includes CORS headers; deployed via dashboard |
| tsconfig `types: ["vite/client"]` | Fixed `import.meta.env` TypeScript error |
| Worker CORS — remaining responses | Lines 13, 23, 33–36 fixed in git; dashboard deploy pending (2.28) |

### 🔵 P2 — Session 6 If Time Allows

| # | Task | Status | Notes |
|---|------|--------|-------|
| 2.21 | Update BeneBots logo in Navbar + Hero + Footer | ⏳ Pending | Current: text "B" monogram — replace from branding/ |
| 2.22 | Acquire benebots.com domain | ⏳ Pending | ~$12-15/yr via Porkbun; CNAME → benebots.pages.dev |
| 2.30 | Testimonials.tsx — stub or remove | ⏳ Pending | Either add one real quote or remove component until available |
| 2.31 | AskDemo suggested follow-ups UX | ⏳ Pending | Keep 2-3 follow-up suggestions visible below chat after first response |

### 🔵 Backlog

| # | Task | Status | Notes |
|---|------|--------|-------|
| 2.23 | Vite esbuild moderate vulnerability | 🔵 Backlog | Wait for Vite 7 stable |
| 2.24 | Add user auth / multi-tenancy | 🔵 Backlog | Enterprise tier requirement |
| 2.25 | Add DOCX/PPTX export | 🔵 Backlog | Agency tier requirement |

### ✅ Done (Sessions 1–4)

| Task | Notes |
|------|-------|
| Add Anthropic API key to .env.local | Rotated S4 |
| Build Cloudflare Worker API proxy | worker/index.js — auth, rate limit, validation |
| Deploy BeneBots to public URL | benebots.pages.dev — CI/CD connected |
| Security audit — 7/8 findings resolved | Keys rotated, rate limiting, validation, gitignore fixes |
| Replace Acme demo app with marketing site | New TS + React 18 + Tailwind site |
| Scaffold as Vite + React + TypeScript | React 18 + Tailwind + Vite |
| Git repo + CI/CD via GitHub | Auto-deploy |
| BeneBots marketing site components built | Hero, Features, HowItWorks, Pricing, FAQ, Footer, Navbar |

---

## PROJECT 3 — MyBenefitsGuy Practice Sub-Brand

**Status:** 🔴 Not Started (Tier 2 — clear Projects 1 + 2 first)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 3.1 | Decide architecture: section vs sub-page vs subdomain | ⏳ Pending | Brand guide leans /mybenefitsguy |
| 3.2 | Build /mybenefitsguy dedicated sub-page | ⏳ Pending | When content is ready |
| 3.3 | Generate MyBenefitsGuy logo | ⏳ Pending | Gemini prompt in brand guide §07 |
| 3.4 | Social media content strategy live | ⏳ Pending | IG/TikTok/Facebook |
| 3.5 | Content calendar built | ⏳ Pending | Use content-calendar-builder skill |
| 3.6 | Instagram/TikTok accounts active | ⏳ Pending | Handle: @mybenefitsguy |
| 3.7 | MyBenefitsGuy mascot finalized | ✅ Done | MyBenefitsGuy4.png |
| 3.8 | BeneBots brand mascot finalized | ✅ Done | BeneBots2.png |
| 3.9 | Practice section on IAS landing page | ✅ Done | Placeholder for Tier 2 |

---

## Open Decisions

| Decision | Options | Status |
|----------|---------|--------|
| Pricing — timing and structure | Not publishing yet; will finalize after real client conversations | ⏳ Undecided |
| HIPAA / data tenancy FAQ | Confirm with compliance before any pilot | ⏳ Undecided |
| BeneBots long-term domain | /benebots subdirectory vs. standalone benebots.com | ⏳ Undecided |
| Contact mechanism v1 | mailto: (now) vs. Formspree/Basin (v1.1) | ⏳ Undecided |
| MyBenefitsGuy architecture | Section vs. sub-page /mybenefitsguy | ⏳ Undecided |
| "14 hours saved per stewardship" stat | Validate against real sales story | ⏳ Undecided |

---

## ClickUp Task Registry

| Task | Status | URL |
|------|--------|-----|
| Install Node.js + first local run | ✅ Complete | https://app.clickup.com/t/86b9jh544 |
| Complete InfiniteAwesomeStudio.com/BeneBots | 🔵 In Progress | https://app.clickup.com/t/86b9jfnam |
| Complete InfiniteAwesomeStudio.com Website | 🔵 In Progress | https://app.clickup.com/t/86b9jfn8u |
| Complete BeneBots Modules | ✅ All 5 built | https://app.clickup.com/t/86b9jfnbh |
| S6 P0: Rotate WORKER_TOKEN + revert error msg | ⏳ Pending | https://app.clickup.com/t/86b9m7t8d |
| S6 P0: Deploy remaining worker CORS fixes | ⏳ Pending | https://app.clickup.com/t/86b9m7t8g |
| S6 P1: Copy audit HowItWorks + FAQ | ⏳ Pending | https://app.clickup.com/t/86b9m7t8x |
| S6 P1: Wrangler CI/CD for Worker | ⏳ Pending | https://app.clickup.com/t/86b9m7t92 |
| S6 P1: IAS landing page CTA wiring + mobile nav | ⏳ Pending | https://app.clickup.com/t/86b9m7t9k |

---

## Dev Quick-Start (Session 6)

```bash
cd "/Users/tyboogie/Documents/Career Plans/Inifinte Awesome Studio/Claude Code Safe/infinite-awesome-studio"
git pull origin main
cd benebots && npm run dev    # http://localhost:5173
```

**Workflow:** Edit → `git add . && git commit -m "..." && git push origin main` → auto-deploys in ~60s  
**Worker changes:** Edit `worker/index.js` → Cloudflare dashboard → Workers & Pages → benebots-proxy → Edit code → Deploy  
*(Worker CI/CD via wrangler is a S6 task — not yet automated)*

---

## Change Log

| Date | Change |
|------|--------|
| Apr 26 (S5 complete) | All 5 demo pages live; React Router v7; acmeProfile.ts; Capabilities replaces Pricing; Hero/Features/Navbar/Footer copy audit; Worker CORS partial fix; viewport-locked chat; SESSION6_SPEC created |
| Apr 26 (S5 queued) | Added per-bot demo pages spec (5 demos using Acme data); remove Pricing → replace with Capabilities section; full copy audit queued; SESSION5_SPEC.md created |
| Apr 26 (S4) | CI/CD connected; BeneBots marketing site live; security audit 7/8 resolved; P1 tasks added (LOA Navigator, copy audit, bot alignment) |
| Apr 23 (S3) | BeneBots scaffolded as Vite+React; Node.js installed; git initialized; migrations applied |
| Apr 22 (S2) | LOA Navigator added; brand identity v1.0 applied; 3-act narrative |
| Apr 20 (S1) | Initial project state; landing page + BeneBots prototype complete |

---

## Session 6 First Prompt

```
Read docs/Master Trackers/MASTER_TRACKER4.26.26.md and docs/Master Trackers/SESSION6_SPEC_4.26.26.md for full context.

Today's work:

Priority order:
1. Revert AskDemo error message from debug string back to user-friendly copy (AskDemo.tsx ~line 119)
2. Rotate WORKER_TOKEN: generate a strong token, update in both the benebots-proxy Worker and Pages env vars, push rebuild
3. Fix remaining worker CORS gaps in worker/index.js (lines 13, 23, 33, 36) — deploy via Cloudflare dashboard
4. Copy audit — HowItWorks.tsx (real consultant workflow, no "easy steps" framing)
5. Copy audit — FAQ.tsx (add grounding/customization FAQs, fix LOA Navigator badge color to #A78BFA, remove pricing refs)
6. IAS landing page CTA wiring: mailto links, "View Live Demo" → benebots.pages.dev, mobile nav hamburger
7. Set up wrangler CI/CD for worker via GitHub Actions

Live site: benebots.pages.dev
Worker deploys manually via Cloudflare dashboard until CI/CD is wired (item 7)
```

---
*Every benefit. Every penny. Delivered awesomely.*
