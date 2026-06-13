# Infinite Awesome Studio

**A solo-founded, AI-native product studio building practical AI for the people who need it most — starting with employee benefits.**

Built by [Ty Mosher](https://www.linkedin.com/in/ty-mosher-77a45529/), a 20+ year employee-benefits operator who designs, builds and ships AI. Not a generalist who read about benefits, and not a benefits person who read about AI: someone who has shipped working AI inside real benefits operations and is now productizing it.

This repo is the studio's product monorepo — the web properties, the live-Claude career platform, the BeneBots front end and the Cloudflare Worker that fronts every live-AI call.

---

## The studio model

IAS is a studio, not a single-product company: one repeatable production system (a structured Obsidian vault plus an automation pipeline) that stands up one product, validates it, then reuses the same infrastructure to launch the next. The benefits-domain depth is the moat; the production system is the multiplier.

```
Infinite Awesome Studio (parent — IP, brand, production system)
├── BeneBots ............ B2B roster of specialized benefits AI agents
│   └── MyBenefitsGuy ... consumer education persona + content engine (top of funnel)
├── Infinite Workflows .. AI workflow automation for small-business owners
├── Infinite Careers .... Claude-powered career-intelligence platform   ⭐ flagship code
└── Infinite Pantry ..... AI meal-planning & smart-grocery assistant (early)
```

---

## Products

| Product | What it is | Status | Link |
|---|---|---|---|
| **Infinite Careers** | Claude-powered career-intelligence platform (fit scoring, ATS, gap analysis, resume optimization, bias analysis) | Live | [infiniteawesomestudio.com/infinite-careers](https://infiniteawesomestudio.com/infinite-careers/) |
| **BeneBots** | Roster of specialized, domain-specific benefits AI agents (COBRA, HSA, leave, plan comparison, claims, open enrollment, compliance) | Live | [benebots.infiniteawesomestudio.com](https://benebots.infiniteawesomestudio.com) |
| **Infinite Workflows** | Done-with-you AI workflow automation for small-business owners | Live | [infiniteawesomestudio.com/infinite-workflows](https://infiniteawesomestudio.com/infinite-workflows/) |
| **MBG Content Engine** | Knowledge-grounded, multi-platform content-automation pipeline (below) | Live (production) | — |
| **Infinite Pantry** | AI meal-planning + pantry-aware grocery assistant | Early build | _separate repo_ |

> Main site: **[infiniteawesomestudio.com](https://infiniteawesomestudio.com)**

---

## ⭐ Infinite Careers (flagship)

The deployable evolution of a live-Claude career-intelligence tool, and the best single read in this repo for how IAS builds.

- **Stack:** React + Vite single-page app.
- **Server-side AI:** every live Claude call routes through a **Cloudflare Workers proxy** (`/worker`), so the API key stays server-side and the public build ships zero secrets.
- **Schema-first prompting** drives a 10-tab feature set: fit scoring, ATS keyword analysis, gap analysis, resume optimization, interview coaching, market intel and a bias & fairness engine.
- **Secure-by-default demo/live split:** the public build runs in demo mode with no network calls; live mode is localhost-only and hits the worker. A stray build can never leak the worker token.

Source: [`infinite-careers/`](infinite-careers/)

---

## The MBG Content Engine

A production content-automation pipeline for the MyBenefitsGuy brand — the kind of multi-tool, domain-grounded workflow IAS exists to build.

- **Knowledge-grounded generation.** Before any content with a hard fact (a contribution limit, a deadline, an election window) ships, every claim is verified against a curated benefits knowledge base and tagged confirmed / unverified / conflict, with an audit trail. Facts are grounded, not guessed — which is non-negotiable in a regulated domain.
- **Character-consistency system.** Locked personality and visual profiles keep a roster of brand agents coherent across hundreds of generated posts.
- **One-to-many repurposing.** A single concept is adapted into platform-tailored assets for Instagram, TikTok, Facebook and Threads.
- **Metadata-driven automation.** YAML-frontmatter routing moves generated files through a structured pipeline (draft → staged → published) with logging.

Publishing is currently human-in-the-loop by design; full automated publishing (Make/Airtable) is built and gated during the hands-on phase.

---

## Repository structure

```
infinite-awesome-studio/
├── infinite-careers/   ⭐ React/Vite career-intelligence SPA (live Claude via worker)
├── worker/             Cloudflare Worker proxy — server-side key management for all live-AI calls
├── benebots/           BeneBots product front end
├── landing/            IAS landing + product pages (incl. Infinite Workflows)
├── studio/             Studio site assets
├── branding/           Logos, palette, visual system
└── docs/               Project docs and handoffs
```

---

## Tech stack

**Frontend:** React · Vite · JavaScript
**AI:** Claude API (Anthropic) · schema-first prompting
**Infrastructure:** Cloudflare Workers · Cloudflare Pages
**Production system:** Obsidian knowledge base · metadata-driven content automation (Make / Airtable)

---

## About

Infinite Awesome Studio is founded and built by **Ty Mosher** — 20+ years in employee benefits (USI, NRG Energy, Horizon BCBS, PwC), licensed Health & Life producer (MD, VA, DC), and the builder behind every product above.

📍 Washington DC–Baltimore Area · [LinkedIn](https://www.linkedin.com/in/ty-mosher-77a45529/)

> *The benefits industry is still digging with its hands. AI is the shovel.*
