# MASTER_TRACKER — Infinite Awesome Studio
**Owner:** Ty Mosher · ty@infiniteawesomestudio.com
**Last updated:** April 27, 2026 (Sessions 1–6 complete · Session 7 queued)
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
| 1.5 | IAS logo — placeholder deployed | ✅ Done (placeholder) | Transparent PNG in landing/assets/ias-logo.png — needs higher-quality replacement |
| 1.6 | Mobile nav hamburger menu | ⏳ Pending | Nav links hide below 900px |
| 1.7 | Add Privacy + Terms pages | ⏳ Pending | Termly/iubenda before any public traffic |
| 1.8 | Validate/confirm pricing copy | ⏳ Pending | $4k/mo, $500/hr, guarantee are placeholders |
| 1.9 | Clean up landing/ duplicate (ias-landing.html) | ⏳ Pending | Review and delete or consolidate |
| 1.10 | Add waitlist/contact form handler | 🔵 Backlog | Formspree or Basin for v1.1 |
| 1.11 | Add analytics | 🔵 Backlog | Plausible or Cloudflare Web Analytics post-launch |
| 1.12 | Add case study page | 🔵 Backlog | After 1-2 pilots have run |
| 1.13 | Brand mark + OG image wired | ✅ Done | favicon.svg + og-image.png |
| 1.14 | Mascot PNGs embedded | ✅ Done | Self-contained HTML |
| 1.15 | Three-act narrative structure built | ✅ Done | Studio → MyBenefitsGuy → BeneBots |
| 1.16 | Brand identity v1.0 applied | ✅ Done | Ink + paper + electric amber |
| 1.17 | Cloudflare Pages CI/CD connected | ✅ Done | Auto-deploys on every git push |

---

## PROJECT 2 — BeneBots Platform

**Status:** 🟡 In Progress · **Live:** `benebots.pages.dev`
**Stack:** TypeScript + React 18 + Tailwind + Vite

### 🔴 P1 — Session 7 (Do First)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 2.32 | Copy audit — HowItWorks.tsx | ⏳ Pending | Real workflow: onboard → configure → deploy; no "3 easy steps" framing |
| 2.33 | Copy audit — FAQ.tsx | ⏳ Pending | Add grounding differentiator Q; add customization Q; remove pricing refs; fix LOA badge color #00a868 → #A78BFA |
| 2.34 | Full copy sweep — all remaining components | ⏳ Pending | Hero, Features, Capabilities, Footer, Navbar — check against brand voice rules in memory |

### 🟡 P2 — Session 7 If Time Allows

| # | Task | Status | Notes |
|---|------|--------|-------|
| 2.35 | Upgrade IAS logo | ⏳ Pending | When Ty finalizes high-quality logo — overwrite landing/assets/ias-logo.png + benebots/public/ias-logo.png; no code changes needed |
| 2.36 | Wire landing page CTAs | ⏳ Pending | href="#" → mailto:; "View Live Demo" → benebots.pages.dev; mobile hamburger |
| 2.22 | Acquire benebots.com domain | ⏳ Pending | ~$12-15/yr via Porkbun; CNAME → benebots.pages.dev |
| 2.30 | Testimonials.tsx — stub or remove | ⏳ Pending | Add one real quote or remove until available |
| 2.31 | AskDemo suggested follow-ups UX | ⏳ Pending | 2-3 follow-up suggestions visible below chat after first response |

### ✅ Done — Session 6 (April 27)

| Task | Notes |
|------|-------|
| Rotate WORKER_TOKEN | New 64-char hex token; updated benebots/.env + Cloudflare Worker secret via wrangler |
| Fix AskDemo error messages | Removed dev config string; 429 → "Too many requests"; other → "Something went wrong" |
| Deploy IAS logo — landing page | Replaced CSS/SVG text logo with transparent ias-logo.png in landing/assets |
| Deploy IAS logo — BeneBots Navbar | Replaced "B" monogram with IAS logo + BeneBots wordmark |
| Deploy logos — BeneBots Footer | BeneBots logo as brand mark; IAS logo as "built by" attribution |
| Deploy BeneBots logo — Hero | Replaced text "BENEBOTS" widget with benebots-logo.png in constellation center |

### ✅ Done — Session 5 (April 26)

| Task | Notes |
|------|-------|
| Create `src/data/acmeProfile.ts` | Full Acme Industries profile: medical, dental, vision, HSA, FSA, 401k, LOA, COBRA |
| Add React Router v7 + `/demo/:botId` routes | BrowserRouter in App.tsx; `public/_redirects` for Cloudflare SPA |
| Build `Demo.tsx` route handler | Dispatches to 5 demo components; viewport-locked layout for chat |
| Build `AskDemo.tsx` | Live chat via Worker; Acme system prompt; suggested questions |
| Build `StewardshipDemo.tsx` | Section picker; Acme claims sidebar; canned + live drafts |
| Build `PlanCompareDemo.tsx` | HDHP vs PPO; 3 employee profiles; real cost math |
| Build `OECoachDemo.tsx` | 4-step questionnaire → plan recommendation |
| Build `LOANavigatorDemo.tsx` | Employee/HR mode; CA/NY/WA picker; guardrail discipline |
| Features.tsx — 5 bot cards clickable | LOA Navigator added; all cards navigate to `/demo/{slug}` |
| Hero.tsx + Features.tsx copy audit | New headline; 5 bots; "Try Ask BeneBot →" CTA |
| Capabilities.tsx — replaced Pricing | 3 use-type columns; no price anchoring |
| Footer + Navbar copy audit | Pricing removed; contact email updated |
| Worker CORS fix — all error responses | Auth + rate limit + validation errors all include CORS headers |

### ✅ Done (Sessions 1–4)

| Task | Notes |
|------|-------|
| Security audit — all critical findings resolved | Keys rotated, rate limiting (20 req/IP/min), input validation, gitignore fixes |
| Build Cloudflare Worker API proxy | worker/index.js — auth, rate limit, system prompt validation, Anthropic proxy |
| Deploy BeneBots to public URL | benebots.pages.dev — CI/CD connected |
| Replace Acme demo app with marketing site | TS + React 18 + Tailwind + Vite scaffold |
| BeneBots marketing site components built | Hero, Features, HowItWorks, Pricing, FAQ, Footer, Navbar |
| Git repo + CI/CD via GitHub | Auto-deploy on every push to main |

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
| IAS logo final version | Ty working on high-quality replacement | ⏳ In progress |
| Pricing — timing and structure | Not publishing yet; finalize after real client conversations | ⏳ Undecided |
| HIPAA / data tenancy FAQ | Confirm with compliance before any pilot | ⏳ Undecided |
| BeneBots long-term domain | /benebots subdirectory vs. standalone benebots.com | ⏳ Undecided |
| Contact mechanism v1 | mailto: (now) vs. Formspree/Basin (v1.1) | ⏳ Undecided |
| MyBenefitsGuy architecture | Section vs. sub-page /mybenefitsguy | ⏳ Undecided |
