# BeneBots Marketing Site — Handoff Document
**Date:** April 25, 2026  
**Prepared by:** Claude Code (Sonnet 4.6)  
**Session:** Claude Code Safe / benebots-site  
**Status:** Built, locally verified, ready to push to GitHub

---

## What Was Built Today

Two separate BeneBots projects were completed in parallel today. This document covers the **marketing site**. See the companion handoff in `BeneBots/` for the app.

---

## Project 1 — BeneBots App (Claude.ai Artifact)
**Location:** `/Users/tyboogie/Documents/Career Plans/Inifinte Awesome Studio/BeneBots/`  
**File:** `benebots.jsx` (1,708 lines) + `BeneBots.zip`  
**What it is:** The working product. A single-file React component that runs inside Claude.ai as an artifact. Four AI agents (Ask BeneBot, Stewardship Studio, Plan Compare, OE Coach) powered by the live Anthropic API, grounded in a shared client profile JSON.  
**Deployment:** Claude.ai artifact viewer — no build step, no hosting required.  
**Production path:** Lift `benebots.jsx` into a Vite project → add Node/Fastify backend for API key handling → Clerk/Auth.js → Postgres. See `ARCHITECTURE.md` in the zip.

---

## Project 2 — BeneBots Marketing Site (This Repo)
**Location:** `/Users/tyboogie/Documents/Career Plans/Inifinte Awesome Studio/Claude Code Safe/benebots-site/`  
**What it is:** A static React/TypeScript marketing site that acquires leads and directs them to the app. No AI functionality — a brochure site with contact form, pricing, FAQ, and proof points.  
**Deployment target:** `https://benebots.github.io` via GitHub Actions → GitHub Pages.

---

## Repository Setup (One-Time)

```bash
cd benebots-site
git init
git add .
git commit -m "Initial commit: BeneBots marketing site"
git remote add origin https://github.com/benebots/benebots.github.io.git
git branch -M main
git push -u origin main
```

Then in GitHub: **Settings → Pages → Source: GitHub Actions → Save.**

Every future `git push origin main` auto-builds and deploys. Track runs at:  
`https://github.com/benebots/benebots.github.io/actions`

---

## File Structure

```
benebots-site/
├── .github/
│   └── workflows/
│       └── deploy.yml              # Type-check → build → smoke tests → deploy
├── public/
│   ├── CNAME                       # Set to benebots.ai (update when domain purchased)
│   └── favicon.svg                 # Mint green robot "B" icon
├── src/
│   ├── components/
│   │   ├── Navbar.tsx              # Sticky nav, mobile hamburger, scroll-aware
│   │   ├── Hero.tsx                # Headline, 4-bot constellation, 3 stats
   │   ├── Features.tsx            # 4 BeneBot cards (2×2 grid), proof point bar
│   │   ├── HowItWorks.tsx         # 3-step process, diagnostics suite callout
│   │   ├── Pricing.tsx            # Studio/Agency/Enterprise + 2 add-ons
│   │   ├── Testimonials.tsx       # 4 proof point cards + closing pull quote
│   │   ├── FAQ.tsx                # Accordion, each bot answers its category
│   │   └── Footer.tsx             # Contact form, newsletter, ecosystem links
│   ├── pages/
│   │   └── Home.tsx               # Page layout assembling all sections
│   ├── App.tsx
│   ├── index.css                  # Tailwind + custom animations/utilities
│   └── main.tsx
├── index.html                     # GA4 placeholder, OG tags, fonts
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── .gitignore
├── README.md                      # Full setup + deploy + DNS instructions
└── HANDOFF.md                     # This file
```

---

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| React | 18.2 | UI framework |
| TypeScript | 5.2 | Type safety |
| Vite | 5.0 | Build tool + dev server |
| Tailwind CSS | 3.4 | Utility-first styling |
| Lucide React | 0.294 | Icons |
| FormSubmit | — | Form backend (no server needed on GitHub Pages) |
| GitHub Actions | — | CI/CD pipeline |
| GitHub Pages | — | Hosting |

---

## Content — Source of Truth

All copy, stats, pricing, and positioning come from the **BeneBots handoff documents** (April 19, 2026):

| Section | Source |
|---------|--------|
| 4 agents (not 5) | `README.md` in `BeneBots.zip` |
| "40 min stewardship report" | `README.md` — "six hours to forty minutes" |
| "Grounded, not guessing" | `GO_TO_MARKET.md` — proof points |
| Studio $199/mo pricing | `GO_TO_MARKET.md` — pricing table |
| Agency $500/client/mo | `GO_TO_MARKET.md` — pricing table |
| Done-for-you $2,500/client | `GO_TO_MARKET.md` — secondary revenue |
| Custom bot $15K+ | `GO_TO_MARKET.md` — secondary revenue |
| Diagnostics suite callout | `ARCHITECTURE.md` — Section 3.5 |
| Ty's closing pitch | `GO_TO_MARKET.md` — "one sentence to close" |

**Stats not used** (removed per `IAS_Brand_Identity_Guide_v1.pdf` §10 — "removed pending validation"):
- ~~14 hours saved per enrollment cycle~~ 
- ~~4–8 week deployment guarantee~~

---

## Sections Summary

### Hero
- Headline: "Meet BeneBots: AI Agents for Benefits Admin"
- Positioning: "The AI platform for employee benefits, built by a benefits expert who writes code."
- Brand voice: "Each BeneBot knows every plan detail like the back of its hand. Never sleeps, never sighs."
- Stats: **4 agents** / **40 min** stewardship / **0** generic answers
- CTAs: See Demo → `#demo` | Schedule Consultation → `#contact`

### Features (4 Agents)
| Agent | Color | Tagline |
|-------|-------|---------|
| Ask BeneBot | Mint `#00C47A` | Every plan detail, plain language |
| Stewardship Studio | Blue `#5B8FFF` | Broker-quality narratives in 40 minutes |
| Plan Compare | Gold `#F7D154` | Side-by-side, with the math shown |
| OE Coach | Coral `#FF6F61` | Open enrollment, one step at a time |

### How It Works
Three steps: Assessment → Design → Deployment.  
Diagnostics suite callout replaces the removed guarantee banner.

### Pricing
| Tier | Price | Audience |
|------|-------|---------|
| Studio | $199/mo | Solo consultants, 1–5 clients |
| Agency | $500/client/mo | Mid-size brokerages, 6–50 clients |
| Enterprise | Custom | National brokerages, TPAs |

Add-ons: Done-for-You Onboarding ($2,500/client) · Custom Bot Development ($15K+)

### Testimonials
Three user proof points + Ty's founding story as the fourth card.  
Closing pull quote: *"The moat is the person writing the prompts. Twenty years of pattern recognition — turned into software."*

### FAQ (Bot Personas Answer)
| Question Category | Bot Answering |
|------------------|---------------|
| HIPAA / data security | ComplianceBot |
| HSA limits 2026 | Ask BeneBot |
| COBRA duration | Ask BeneBot |
| Missed OE window | OE Coach |
| vs. ChatGPT | Plan Compare |
| FMLA / state leave | LOA Navigator |
| Setup timeline | Ask BeneBot |

> **Note:** LOA Navigator appears in FAQ only (as an answering persona) but is not listed as a current product in the Features section. Align when LOA Navigator ships.

### Footer
- Contact form via FormSubmit (no backend, works on GitHub Pages)
- Calendly link (placeholder — update with real URL)
- Newsletter email capture via FormSubmit
- Links: MyBenefitsGuy Hub · Infinite Awesome Studio

---

## GitHub Actions Pipeline (`deploy.yml`)

Three jobs run on every push to `main`:

1. **Build** — `tsc` type-check → `vite build` → upload artifact
2. **Smoke tests** — verify `index.html` exists, JS bundles > 100 bytes, FormSubmit endpoint present
3. **Deploy** — `actions/deploy-pages` → posts URL to GitHub Step Summary

Permissions required (set automatically): `pages: write`, `id-token: write`

---

## Placeholders to Replace Before Launch

| File | Line | Placeholder | Replace With |
|------|------|-------------|--------------|
| `index.html` | 17 | `G-XXXXXXXXXX` | GA4 Measurement ID |
| `Footer.tsx` | 3 | `hello@benebots.ai` | Actual contact email |
| `Footer.tsx` | Calendly link | `https://calendly.com/benebots/discovery` | Real Calendly URL |
| `Navbar.tsx` | App link | `https://benebots.ai` | Live app URL |
| `public/CNAME` | 1 | `benebots.ai` | Confirm domain when purchased |

---

## Custom Domain (`benebots.ai`)

`public/CNAME` is pre-set to `benebots.ai`. When purchased, add these DNS records:

| Type | Host | Value |
|------|------|-------|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | benebots.github.io |

Then: **GitHub → Settings → Pages → Custom domain → `benebots.ai` → Enforce HTTPS.**

> **Domain note:** `IAS_Brand_Identity_Guide_v1.pdf` targets `benebots.com`. `GO_TO_MARKET.md` mentions `benebots.ai` or `benebots.co`. Confirm preferred domain before purchasing. `benebots.com` is ~$12–15/yr per brand guide.

---

## Local Development

```bash
cd benebots-site
npm install
npm run dev          # → http://localhost:5174
npm run build        # production build → dist/
npm run preview      # preview production build locally
```

Build output: `dist/index.html` (1.7KB) + `dist/assets/index.js` (~197KB / 60KB gzipped).

---

## Relationship Between the Two Projects

```
Visitor lands on benebots.github.io (marketing site)
    ↓
Reads proof points, sees pricing, submits form
    ↓
Onboarding call → access to benebots app (Claude.ai artifact / future: Vite app)
    ↓
Uses 4 agents daily against real client data
```

The marketing site and the app are **two legs of the same funnel**. Neither replaces the other.

---

## Open Items / Next Decisions

| Item | Decision Needed |
|------|----------------|
| Domain | `benebots.ai` vs `benebots.com` vs `benebots.co` — purchase before launch |
| LOA Navigator | Ship as 5th agent or keep at 4? (currently in FAQ only) |
| Calendly | Set up real booking link |
| GA4 | Create property, add Measurement ID to `index.html` |
| FormSubmit activation | First real form submission activates the endpoint — FormSubmit emails a confirmation to `hello@benebots.ai` |
| Real testimonials | Replace placeholder quotes with pilot client quotes once USI pilots complete |
| App URL | Update Navbar "App ↗" link when app has a live URL |
| Brand guide update | `IAS_Brand_Identity_Guide_v1.pdf` is behind — update §10 (brand promise) once pilots establish defensible baselines |

---

## Build Verification (April 25, 2026)

```
✓ tsc — 0 errors
✓ vite build — 1.81s
✓ dist/index.html — 1.73KB
✓ dist/assets/index.js — 196.79KB (59.55KB gzip)
✓ dist/assets/index.css — 20.50KB (4.99KB gzip)
✓ Preview verified: Hero, Features, HowItWorks, Pricing, Testimonials, FAQ, Footer
```

---

*Built by Claude Code (Sonnet 4.6) in collaboration with Ty Mosher · Infinite Awesome Studio · April 25, 2026*  
*Every benefit. Every penny. Delivered awesomely.*
