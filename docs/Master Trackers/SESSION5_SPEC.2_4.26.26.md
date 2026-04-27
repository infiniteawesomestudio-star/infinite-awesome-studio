# BeneBots Marketing Site — Session 5 Product Spec
**Date:** April 26, 2026  
**For:** Claude Code Session 5  
**Repo:** https://github.com/infiniteawesomestudio-star/infinite-awesome-studio  
**Live site:** https://benebots.pages.dev

Read `docs/MASTER_TRACKER.md` first for full project state. This spec governs Session 5 work only.

---

## Overview

Three interconnected changes to `benebots/src/`:

1. **Restore the interactive demo** — each bot card in `Features.tsx` becomes a clickable entry point to a dedicated, live demo page for that bot, pre-loaded with Acme Industries data
2. **Remove pricing** — the `Pricing.tsx` section goes away entirely; replace with a capabilities/customization section
3. **Copy audit** — rewrite verbiage across all components to match the evolved brand voice

---

## Change 1 — Per-Bot Demo Pages (P1)

### What to build

A new route structure under `/demo/`:

```
/demo/ask               → Ask BeneBot demo (employee Q&A chat)
/demo/stewardship       → Stewardship Studio demo (report drafter)
/demo/plan-compare      → Plan Compare demo (analyst tool)
/demo/oe-coach          → OE Coach demo (employee decision support)
/demo/loa-navigator     → LOA Navigator demo (leave guide)
```

Each page is a full interactive demo of that bot, grounded in the **Acme Industries** fictional client profile (details below).

### How the bot cards change

**In `Features.tsx`:**
- Each bot card gets `cursor-pointer` + hover state (subtle lift or border highlight)
- Add a small `"Try it →"` or `"See it in action →"` text link at the bottom of each card — NOT a big CTA button
- `onClick` navigates to `/demo/{slug}`
- Remove any existing generic "See Demo" button from the section or hero

**In `Hero.tsx`:**
- Remove the generic "See Demo" / "Request Demo" button if present
- The bot faces/chips in the hero can remain but should not link to a generic page

### Demo page structure

Each `/demo/{bot}` page should feel like the marketing site's design language (Tailwind, same Navbar/Footer) but with the demo interface as the main content. Suggested layout:

```
[Navbar]
[Demo header bar]
  - Bot name + icon (consistent with Features.tsx card)
  - "Demo mode — Acme Industries" badge  
  - "← Back to BeneBots" link
[Demo interface — full width, generous height]
[Footer]
```

The demo interface for each bot should be extracted/adapted from the original `benebots.tsx` / `App.jsx` source (which is still in the repo at `benebots/benebots.tsx` for reference). Adapt it to TypeScript + Tailwind.

### Acme Industries client profile (use this across ALL demos)

```typescript
// src/data/acmeProfile.ts
export const ACME_PROFILE = {
  companyName: "Acme Industries",
  companySize: "Mid-size employer, ~450 employees",
  planYear: "2026",
  
  medical: {
    hdhp: {
      name: "HDHP with HSA",
      deductible: { individual: 1600, family: 3200 },
      oopm: { individual: 4000, family: 8000 },
      employerHsaSeed: 1000,
      coinsurance: "80% after deductible"
    },
    ppo: {
      name: "PPO",
      deductible: { individual: 500, family: 1000 },
      oopm: { individual: 3500, family: 7000 },
      primaryCareCopay: 30,
      specialistCopay: 55,
      coinsurance: "80% after deductible"
    }
  },
  
  dental: {
    carrier: "Delta Dental PPO",
    preventive: "100%",
    basic: "80% after deductible",
    major: "50% after deductible",
    ortho: "50% up to $2,000 lifetime",
    annualMax: 2500
  },
  
  vision: { carrier: "VSP" },
  
  hsa: {
    limit2026Individual: 4400,
    limit2026Family: 8550,
    catchUp55: 1000,
    employerSeed: 1000
  },
  
  fsa: {
    healthFsa: { limit: 3300, carryover: 660 },
    limitedPurposeFsa: true,
    dependentCareFsa: { limit: 5000 }
  },
  
  retirement: {
    match: "100% of first 3%, 50% of next 2% (4% max)",
    rothOption: true,
    secure2CatchUp: true
  },
  
  loa: {
    fmlaCovered: true,
    companyParentalLeave: "6 weeks fully paid",
    stateLeaveJurisdictions: ["CA", "NY", "WA"],
    stdCarrier: "The Hartford",
    ltdCarrier: "The Hartford",
    loaAdministrator: "Acme HR — hr@acme-demo.com",
    returnToWorkProcess: "Fitness-for-duty form required"
  },
  
  cobra: {
    administrator: "WEX Benefits",
    qualifyingEventWindow: 60
  }
};
```

### Per-bot demo notes

**Ask BeneBot** (`/demo/ask`)
- Full conversational chat interface
- System prompt: use the existing `ASK_SYSTEM_PROMPT` from `worker/index.js`, adapted for Acme profile above
- Calls the existing Worker proxy (`VITE_WORKER_TOKEN` + Worker URL)
- Show suggested questions panel on first load: "What's the difference between the HDHP and PPO?", "How much does Acme put in my HSA?", "I just had a baby — what do I do?", "When is open enrollment?"

**Stewardship Studio** (`/demo/stewardship`)
- Section picker (Executive Summary, Claims Analysis, Market Benchmarking, etc.)
- "Generate draft" button → calls Worker with stewardship-specific system prompt
- Show Acme data (enrollment totals, cost drivers) in a sidebar panel
- Pre-populate with fictional Acme claims data for demo realism

**Plan Compare** (`/demo/plan-compare`)
- Pre-load HDHP vs PPO comparison (Acme's two plans)
- Employee profile selector: Low utilizer / Family with expected care / Chronic condition
- Show cost math with Acme's actual deductibles/copays/limits

**OE Coach** (`/demo/oe-coach`)
- Short questionnaire: expected care tier, family status, budget preference, HSA familiarity
- Returns recommendation + HSA/FSA contribution strategy
- Pre-populated with Acme plan data

**LOA Navigator** (`/demo/loa-navigator`)
- Dual-mode toggle: Employee mode / HR Admin mode
- State picker (default: show CA, NY, WA since those are Acme's covered jurisdictions)
- FMLA/CFRA basics, company parental leave overlay (6 weeks paid), STD/LTD info
- Every response ends with "What to ask HR" checklist
- Guardrail: will NOT calculate specific dates, amounts, or give legal advice — only education

---

## Change 2 — Remove Pricing, Add Capabilities Section (P1)

### Remove

Delete `Pricing.tsx` entirely and remove it from `pages/Home.tsx`.

### Replace with: "Built for your practice" section

New component: `src/components/Capabilities.tsx`

**Purpose:** Show that BeneBots is a modular, configurable platform — not a fixed product with fixed pricing. Prospects should leave understanding they can pick the bots they need, built around their client data.

**Suggested structure:**

```
Section header:
  "Built around your clients. Not a generic chatbot."
  
  Subhead: "Every BeneBot is grounded in the specific plans of the specific 
  client you're working with. You choose which bots your practice needs."

[3-column grid — the 3 "use types"]
  Column 1: For independent consultants
    - Ask + OE Coach for client-facing employee support
    - Stewardship Studio for renewal prep
    
  Column 2: For mid-size brokerages  
    - Full 5-bot suite per client
    - Multi-client dashboard
    - White-label ready
    
  Column 3: For HR teams
    - Ask + LOA Navigator embedded in your portal
    - Custom escalation rules
    - Client-specific SPD grounding

[CTA row]
  "Tell me what your practice looks like →" [mailto: link]
  "See any bot in action →" [links to /demo/ask as default]
```

**Voice notes for this section:**
- Do NOT say "powerful," "seamless," "flexible," or "scalable"
- Do say: "grounded in your client's actual plans," "built for how benefits consulting actually works," "picks up where the SPD leaves off"
- No price anchoring. No "starting at." Just capabilities.

---

## Change 3 — Copy Audit (P1)

Work through every component. Reference voice rules from `branding/IAS_Brand_Identity_Guide_v1.docx` and the notes below.

### Voice rules (non-negotiable)

**Never use:** powerful, seamless, cutting-edge, innovative, game-changing, reimagine, revolutionize, disrupt, empower, leverage, robust, scalable, next-generation, AI-powered (as a standalone adjective)

**Always sound like:** A 20-year benefits insider who is tired of bad chatbot demos and has answered these questions ten thousand times. Warm, direct, a little dry. Trusts the reader.

**Do:**
- Use real benefit terms without explaining them (SPD, QLE, ICHRA, FMLA, COBRA — trust the reader)
- Concrete numbers over abstractions
- Short sentences. Punchy clauses.
- Let the demo do the selling — copy just needs to get out of the way

### Component-by-component notes

**`Hero.tsx`**
- Headline: current version likely too generic — should feel like a benefits insider wrote it, not a SaaS copywriter
- Stat chip: update `4` → `5` bots (covered in S4 P1 tasks)
- Remove "See Demo" CTA — the bot cards are now the entry point
- Keep subhead tight: one sentence max

**`Features.tsx`**
- Section header: "Four Agents" → "Five Agents" (S4 P1 task)
- Add LOA Navigator card (S4 P1 task)
- Each bot description: max 2 sentences. Lead with what it does, not how it works.
  - Good: "Answers employee benefits questions grounded in your client's actual plan. Cites the SPD page. Admits when the answer isn't there."
  - Bad: "Leverages AI to provide powerful, seamless benefits guidance."
- Each card should NOT have a generic demo button — the card itself becomes the entry point (see Change 1)

**`HowItWorks.tsx`**
- Steps should reflect real consultant workflow: onboard a client → configure the bots → deploy to employees / use in renewals
- Avoid "in just 3 easy steps" framing — benefits consultants will find that condescending
- Should feel like a product walkthrough, not a marketing pitch

**`FAQ.tsx`**
- Review HIPAA copy carefully — only commit to what you'll actually stand behind on a call
- Remove any specific pricing from FAQ answers
- Add a FAQ about customization: "What if I need something specific to my practice?"
- Add: "Is this a generic AI chatbot?" — answer should directly address the grounding differentiator

**`Footer.tsx` / `Navbar.tsx`**
- Remove any pricing nav links
- Contact should be `mailto:ty@infiniteawesomestudio.com` — not a form yet

---

## File reference

```
benebots/src/
├── components/
│   ├── Hero.tsx          ← copy audit, remove generic demo CTA
│   ├── Features.tsx      ← add LOA Navigator, make cards clickable, copy audit
│   ├── HowItWorks.tsx    ← copy audit
│   ├── Pricing.tsx       ← DELETE
│   ├── Capabilities.tsx  ← NEW — replace Pricing
│   ├── FAQ.tsx           ← copy audit, remove pricing refs
│   ├── Navbar.tsx        ← remove pricing nav link if present
│   └── Footer.tsx        ← copy audit
├── pages/
│   ├── Home.tsx          ← remove Pricing import, add Capabilities import
│   └── Demo.tsx          ← NEW — demo route handler
├── data/
│   └── acmeProfile.ts    ← NEW — Acme client data used across all demos
├── demo/                 ← NEW folder
│   ├── AskDemo.tsx
│   ├── StewardshipDemo.tsx
│   ├── PlanCompareDemo.tsx
│   ├── OECoachDemo.tsx
│   └── LOANavigatorDemo.tsx
└── App.tsx               ← add /demo/:botId routes
```

---

## Source reference

The original demo components live at `benebots/benebots.tsx` (kept for reference). The Acme data and system prompts are there. Adapt — don't rewrite from scratch.

The original `ASK_SYSTEM_PROMPT` is in `worker/index.js`. The demo pages should call the same Worker proxy (already deployed and secured).

---

## First prompt for Session 5

```
Read docs/MASTER_TRACKER.md and docs/SESSION5_SPEC.md for full context.

Today's work is the BeneBots marketing site at benebots.pages.dev.

Priority order:
1. Create src/data/acmeProfile.ts with the Acme client profile from the spec
2. Add React Router routes for /demo/:botId in App.tsx
3. Build src/pages/Demo.tsx as the route handler
4. Build AskDemo.tsx first — it's the most important demo and uses the existing Worker
5. Make Features.tsx bot cards clickable (navigate to /demo/{slug})
6. Delete Pricing.tsx, build Capabilities.tsx as replacement
7. Copy audit — Hero.tsx first, then Features, then the rest

Reference: benebots/benebots.tsx has all original demo logic. Adapt it, don't rebuild from scratch.
Workflow: edit locally → git push → Cloudflare auto-deploys in 60s.
```

---
*Every benefit. Every penny. Delivered awesomely.*
