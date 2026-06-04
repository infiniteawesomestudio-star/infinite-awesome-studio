# Infinite Awesome Studio — Project Hand-Off

**Date:** April 22, 2026
**Version:** 2.0 (supersedes v1 dated April 20, 2026)
**Prepared for:** Ty Mosher / Infinite Awesome Studio
**Project owner:** Ty (ty@infiniteawesomestudio.com)
**Domain:** infiniteawesomestudio.com (Porkbun)

---

## 1. Executive Summary

Infinite Awesome Studio is a consulting and product brand at the intersection of employee benefits expertise and AI. Three connected layers live under a single domain: the Studio (parent), MyBenefitsGuy (the benefits practice, "The Guy"), and BeneBots (the flagship AI product, "The Bot").

Since the v1 hand-off two days ago, three major pieces of work have landed:

1. **A fifth bot — LOA Navigator — was added to the BeneBots platform**, bringing the total to five pre-built agents (Ask BeneBot, Stewardship Studio, Plan Compare, OE Coach, LOA Navigator)
2. **The full Infinite Awesome Studio brand identity (v1.0) was delivered** and applied across both the landing page and the BeneBots platform
3. **The landing page was restructured** into a three-act narrative: Studio services → MyBenefitsGuy practice → BeneBots product

This document captures the current state across all workstreams and is designed as the single file needed to continue this project in Claude Code or another environment.

---

## 2. Brand System — IMPLEMENTED

The brand identity guide (v1.0, April 2026) is now the authoritative source for all visual and voice decisions. Key specs applied across the build:

### 2.1 Brand Architecture

```
Infinite Awesome Studio (parent — The Studio)
│   infiniteawesomestudio.com
│
├── Core consulting, AI automation, education, thought leadership
│
├── MyBenefitsGuy (The Guy — benefits practice)
│   infiniteawesomestudio.com/mybenefitsguy (future sub-page)
│   Currently presented as a showcase section on the main page
│
└── BeneBots (The Bot — flagship AI product)
    infiniteawesomestudio.com/benebots (future deployment path)
    benebots.com — to acquire; park to IAS in interim
    │
    ├── Ask BeneBot — employee Q&A (Mint accent)
    ├── Stewardship Studio — consultant reports (Ink Blue accent)
    ├── Plan Compare — analyst side-by-side (Sunshine Gold accent)
    ├── OE Coach — open-enrollment recommender (Coral Pop accent)
    └── LOA Navigator — leave education (Deep Forest accent)
```

### 2.2 Color Tokens (in use throughout both artifacts)

| Token | Hex | Role |
|---|---|---|
| Mint & Ink | `#00C47A` | Primary brand — CTAs, active states, Ask BeneBot accent |
| Ink | `#1A1A1A` | Body text, dark backgrounds, Stewardship sidebar |
| Warm Neutral | `#F5F5F2` | Page background |
| White | `#FFFFFF` | Card surfaces |
| Ink Blue | `#0B4FBB` | Secondary — links, Stewardship Studio accent |
| Mint Wash | `#E5FBF2` | Bot chat bubble background, tinted containers |
| Deep Forest | `#002E1D` | Text on Mint, LOA Navigator accent |
| Sunshine Gold | `#F7D154` | Premium/analytical — Plan Compare accent |
| Coral Pop | `#FF6F61` | Error states, OE Coach accent |
| Light Gray | `#F0EFE9` | Subtle containers, dividers |

The 70/20/10 split is respected: Mint & Ink dominates the voice, Ink Blue and Mint Wash handle secondary moments, Sunshine Gold and Coral Pop appear only in specific accent roles.

### 2.3 Typography (in use)

| Face | Role | Where |
|---|---|---|
| **Space Grotesk** (500/700) | Display — headlines, hero, section titles | `.ias-h1`, `.ias-section-title`, SectionHeader `<h2>`, Dashboard title |
| **Inter** (400/500/600/700) | Body — everything else | All paragraphs, UI text, labels, form inputs |

Loaded via Google Fonts in both artifacts. BeneBots injects the link tag programmatically on mount; the landing page loads it in `<head>`.

### 2.4 Taglines — wired into the build

| Brand | Tagline | Where used |
|---|---|---|
| IAS | *"Every benefit. Every penny. Delivered awesomely."* | Hero H1, footer |
| IAS | *"Translating insurance chaos into human language."* | Hero badge |
| MyBenefitsGuy | *"The benefits meeting you'll actually look forward to."* | Practice section H3 |
| BeneBots | *"Benefits Without Boundaries."* | Product section H2, BeneBots footer |
| BeneBots | *"Never sleeps, never sighs, knows every plan detail like the back of its hand."* | Product section pull quote |

### 2.5 Voice enforcement

Removed from all copy: *powerful, seamless, cutting-edge, innovative, game-changing, reimagine, revolutionize, disrupt.*

Added verbatim from brand guide's "Keep These Phrases": *translating insurance chaos, dumb questions that aren't actually dumb, never sleeps never sighs, bot-shaped life raft, HR circus, every benefit every penny.*

---

## 3. Domain & Email — COMPLETE

| Item | Status | Notes |
|---|---|---|
| Domain | ✅ Owned | `infiniteawesomestudio.com` registered through Porkbun |
| Email forwarding | ✅ Configured | `ty@infiniteawesomestudio.com` → `infiniteawesomestudio@gmail.com` |
| DNS | ⏳ Pending | Needs to point at a host once deployment target is chosen |
| SSL | ⏳ Pending | Will be auto-provisioned by chosen host |
| `benebots.com` | ⏳ To acquire | ~$12-15/year; park pointing to IAS now; acquire before standalone BeneBots launch |

**Decision made:** `.com` (not `.studio`). All config files updated accordingly.

---

## 4. Infinite Awesome Studio Landing Page — WORKING DRAFT

**Artifact ID:** `ias-landing`
**Status:** Functional HTML, fully branded, mobile-responsive, ready for logo asset swap and deployment.

### 4.1 Structure (three-act narrative)

1. **Nav bar** — IAS logo mark (infinity + upward arrow SVG), nav links (Services, MyBenefitsGuy [featured mint], BeneBots, About), "Let's Talk" mint CTA
2. **Hero** — "Translating insurance chaos" badge, headline *"Every benefit. Every penny. Delivered awesomely."*, sub-copy, primary + ghost CTAs
3. **Bento grid (5 cards)** — Fractional Consulting (wide), Workflow Automation, Templates & Toolkits, Benefits × AI Literacy, Newsletter (wide)
4. **MyBenefitsGuy section** — split layout, mascot image on left (placeholder box, ready for PNG swap), practice pitch on right with four feature bullets and two CTAs
5. **BeneBots section** — inverted dark Ink background for product distinction, BeneBots logo panel (placeholder box), five-bot grid (now includes LOA Navigator as Bot 05), tech pills, ghost + mint CTAs
6. **Footer** — © line with email, brand tagline

### 4.2 Logo assets — status

| Logo | Status | Where |
|---|---|---|
| IAS mark | Inline SVG built from brand guide spec | Nav bar (infinity + arrow, Ink Blue + Mint) |
| MyBenefitsGuy mascot | Placeholder box | Practice section; ready for PNG swap |
| BeneBots mark | Placeholder box | Product section; ready for PNG swap |

When ready, swap the `<img src="data:image/svg+xml...">` lines in the landing page to point at local PNG/SVG files in an `/assets` directory.

### 4.3 What's placeholder / pending

- All CTA buttons non-functional (Book a Discovery Call, Let's Talk, View Live Demo, Read the build)
- Logo images are placeholders — swap when Gemini-generated assets are finalized
- No contact form or waitlist capture
- No hamburger menu for mobile nav (links hide below 900px)
- The IAS inline SVG logo approximates the brand spec; swap for final asset once produced

---

## 5. BeneBots Platform — WORKING PROTOTYPE

**Artifact ID:** `benebots`
**Status:** Fully functional React application, five live-API bots, fully branded, persistent storage, diagnostics suite.

### 5.1 The five bots

| Bot | Audience | Purpose | Accent |
|---|---|---|---|
| **Ask BeneBot** | Employee | Chat Q&A grounded in client plan data | Mint |
| **Stewardship Studio** | Consultant | Drafts 7 types of stewardship report sections | Ink Blue |
| **Plan Compare** | Analyst | Side-by-side comparison of 2–3 medical plans | Sunshine Gold |
| **OE Coach** | Employee | Profile → personalized plan + HSA/FSA rec | Coral Pop |
| **LOA Navigator** | Both | Educational leave orientation, routes to HR | Deep Forest |

### 5.2 Technical characteristics

- **Model:** `claude-sonnet-4-20250514` via Anthropic Messages API
- **Grounding:** Full client profile passed as system prompt (simple RAG, works at this scale)
- **Persistence:** Uses `window.storage` API — needs migration to `localStorage` outside Claude
- **Client data:** Acme Industries (452 employees, 12 plans, full claims summary, complete `leavePolicies` block)
- **Sidebar:** BeneBots robot mark (inline CSS), "Bene" (Mint) + "Bots" (white) wordmark in Space Grotesk
- **State persisted:** client profile, Q&A chat history, LOA chat history, LOA audience/jurisdiction context, Stewardship drafts

### 5.3 LOA Navigator — design notes

The LOA bot is distinct from the other four in three ways:

1. **Dual audience** — toggles between Employee and HR Admin mode; adapts tone, depth, and uses industry jargon or plain language accordingly
2. **Jurisdiction-aware** — US state picker; bot asks for state if not set before answering state-sensitive questions
3. **Educational guardrails** — allowed to explain how leaves generally work (FMLA, ADA, CFRA, PDL, stacking, concurrency, typical pay replacement structures); prohibited from calculating individual dates, specific pay amounts, legal advice, or case-specific job protection calls. Every response ends with a "What to ask HR" checklist (Employee mode) or "Case Intake Checklist" (HR mode).

The `leavePolicies` block in the client profile is the real grounding surface for this bot. When a real client is swapped in, that block must be filled out carefully (jurisdictions, FMLA coverage, company parental leave, STD/LTD carrier, LOA administrator contact, return-to-work process).

### 5.4 Additional infrastructure

- **Dashboard** — active client overview, enrollment totals, cost drivers, prior-year highlights, 5-tile bot grid
- **Client Profile** — JSON editor with validation, save/revert/reset-to-sample
- **Diagnostics** — 7 live API tests (Q&A cost math, Q&A grounding, Stewardship executive summary, Plan Compare structure, OE recommendation, LOA stacking education, LOA guardrail discipline)
- **Help** — in-app documentation covering premise, five bots, grounding, LOA guardrails

### 5.5 What's placeholder / pending

- `window.storage` API won't exist outside Claude artifact environment — requires ~10-line swap to `localStorage.getItem/setItem` before local dev
- `callClaude` function calls `https://api.anthropic.com/v1/messages` directly with no API key (handled by artifact runtime); outside Claude, needs either an API key in env or a Cloudflare Worker proxy
- Sample client data is Acme Industries (fictional) — swap for real or anonymized client before demoing to prospects
- No user authentication, multi-tenancy, or role-based access yet
- No Worker deployment (see `wrangler.toml` pattern in prior hand-off)

---

## 6. Open Decisions

Items that are unresolved and will shape next steps:

1. **Logo deliverables** — Gemini prompts exist in brand guide §07 for all three logos (IAS, MyBenefitsGuy, BeneBots); need to be generated and saved as production assets
2. **MyBenefitsGuy presentation** — currently a section on main page. Brand guide says `infiniteawesomestudio.com/mybenefitsguy` is the eventual URL. Decision point: when to build the dedicated sub-page vs. leave as showcase section
3. **BeneBots deployment path** — subdomain (`benebots.infiniteawesomestudio.com`) vs. subdirectory (`/benebots`) vs. eventual standalone (`benebots.com`); brand guide leans subdirectory at launch, standalone when enterprise SaaS
4. **Contact mechanism** — simple `mailto:` link, a form handler (Formspree, Basin), or a custom Worker endpoint
5. **Production hosting** — Cloudflare Pages, Netlify, or Vercel. Cloudflare Pages recommended for alignment with Worker pattern if API proxying becomes necessary
6. **Real client data** — when and how to populate a representative anonymized client for BeneBots demos (currently Acme is fictional)

---

## 7. Immediate Next Steps

Ordered by logical sequence for taking this to Claude Code:

1. **Set up local project structure:**
   ```
   infinite-awesome-studio/
   ├── docs/
   │   ├── HANDOFF-2026-04-22.md         ← this file
   │   └── IAS_Brand_Identity_Guide_v1.md  ← brand guide
   ├── landing/
   │   └── index.html                     ← ias-landing artifact
   ├── benebots/
   │   └── src/App.jsx                    ← benebots artifact (as React component)
   └── assets/
       ├── mybenefitsguy-logo.png
       ├── benebots-logo.png
       └── ias-logo.svg
   ```

2. **Scaffold BeneBots as a real React app** (Vite + React + Tailwind recommended):
   ```bash
   cd benebots && npm create vite@latest . -- --template react
   npm install && npm install lucide-react
   ```
   Install Tailwind per their Vite guide.

3. **First Claude Code session — migration cleanup:**
   - Swap `window.storage.get/set` for `localStorage.getItem/setItem` in BeneBots
   - Set up API key via `.env` for local dev (`VITE_ANTHROPIC_API_KEY`), update `callClaude` to use it
   - Git commit as a clean baseline: `git add . && git commit -m "initial import from claude.ai"`

4. **Generate logos from Gemini** using prompts in brand guide §07; save PNGs to `/assets`; swap image placeholders in landing page

5. **Deploy landing page** to Cloudflare Pages, Netlify, or Vercel; point Porkbun DNS

6. **Deploy BeneBots** to a subdirectory or subdomain; wire the landing page's "View Live Demo" CTA to it

7. **Replace Acme sample client** with a real or anonymized client profile for live demos

8. **Add contact mechanism** — at minimum, upgrade all CTAs from `#` to `mailto:ty@infiniteawesomestudio.com?subject=...`

9. **Build `/mybenefitsguy` dedicated sub-page** when practice-specific content is ready (Tier 2 outreach stage per brand guide §02)

10. **Acquire `benebots.com`** and park pointing to IAS

---

## 8. Asset Inventory

| Artifact ID | Title | Type | State | Lines (approx) |
|---|---|---|---|---|
| `ias-landing` | Infinite Awesome Studio landing page | HTML | Fully branded draft | ~660 |
| `benebots` | BeneBots platform (5 bots + infra) | React app | Fully branded working prototype | ~900 |
| `handoff-doc` | This document | Markdown | Current (v2.0) | — |

### Referenced source docs
- `IAS_Brand_Identity_Guide_v1.docx` — authoritative brand spec (April 2026)
- `MyBenefitsGuy4.png` — mascot reference (snap-and-point pose, charcoal blazer, mint pocket square)
- `BeneBots2.png` — robot mascot reference (mint rounded-rectangle head, cyan antenna, friendly smile)

---

## 9. Taking This to Claude Code — Setup Checklist

A condensed "first session" checklist for when you open Claude Code in the project folder:

```
□ Read docs/HANDOFF-2026-04-22.md
□ Read docs/IAS_Brand_Identity_Guide_v1.md (brand voice before any new copy)
□ Confirm file structure matches §7 layout
□ Run: git init && git add . && git commit -m "initial import"
□ Scaffold benebots/ as Vite + React if not already done
□ Swap window.storage → localStorage in benebots/src/App.jsx
□ Swap direct API call → .env-backed API key or Worker proxy
□ Run: cd landing && python -m http.server 8000 (or similar) to view landing locally
□ Run: cd benebots && npm run dev to view BeneBots locally
□ Generate logos from Gemini using prompts in brand guide §07
□ Drop PNGs in /assets; swap the three image placeholders in landing/index.html
```

### First prompt to Claude Code

> Read `docs/HANDOFF-2026-04-22.md` and `docs/IAS_Brand_Identity_Guide_v1.md` for full project context. We're continuing a project started in claude.ai. The hand-off doc lists open decisions and next steps. Confirm you've read both, then tell me what you think the first priority should be and what you'd tackle first.

---

## 10. Contact & Ownership

| | |
|---|---|
| **Owner** | Ty Mosher |
| **Primary email** | ty@infiniteawesomestudio.com (→ infiniteawesomestudio@gmail.com) |
| **Domain registrar** | Porkbun |
| **Entity** | Infinite Awesome Studio |
| **Brand guide version** | v1.0 (April 2026) |
| **Hand-off version** | v2.0 (this document, April 22, 2026) |

---

*Every benefit. Every penny. Delivered awesomely.*

*Document generated April 22, 2026. Supersedes hand-off v1.0 dated April 20, 2026. Confidential — Infinite Awesome Studio.*
