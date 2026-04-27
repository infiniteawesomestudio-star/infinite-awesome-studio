# BeneBots Marketing Site — Session 6 Handoff
**Date:** April 26, 2026 (written end of Session 5)
**For:** Claude Code Session 6
**Repo:** https://github.com/infiniteawesomestudio-star/infinite-awesome-studio
**Live site:** https://benebots.pages.dev

Read `docs/Master Trackers/MASTER_TRACKER4.26.26.md` first for full project state. This doc governs Session 6 work only.

---

## What Shipped in Session 5

All five demo pages are live and working at `benebots.pages.dev/demo/{slug}`:

| Route | Component | Status |
|-------|-----------|--------|
| `/demo/ask` | AskDemo.tsx | ✅ Live — calls Worker, Acme system prompt, suggested questions |
| `/demo/stewardship` | StewardshipDemo.tsx | ✅ Live — section picker, Acme claims sidebar, canned + live drafts |
| `/demo/plan-compare` | PlanCompareDemo.tsx | ✅ Live — HDHP vs PPO, 3 employee profiles, cost math |
| `/demo/oe-coach` | OECoachDemo.tsx | ✅ Live — 4-step questionnaire → recommendation |
| `/demo/loa-navigator` | LOANavigatorDemo.tsx | ✅ Live — employee/HR mode, CA/NY/WA picker, guardrails |

Other S5 ships:
- React Router 7 + `/demo/:botId` routing + `public/_redirects` for Cloudflare SPA
- `src/data/acmeProfile.ts` — full Acme Industries client profile
- Features.tsx — 5 bot cards, all clickable, LOA Navigator added
- Hero.tsx — "AI agents that know the plan. Not just the topic." — 5 bots
- Capabilities.tsx — replaced Pricing, 3 use-type columns
- Navbar/Footer — Pricing removed, contact updated to `ty@infiniteawesomestudio.com`
- Worker CORS bug fixed — all error responses now include CORS headers
- AskDemo viewport-locked — chat scrolls internally, page doesn't jump

---

## Active Config (needed to understand state)

**Worker:** `https://benebots-proxy.infiniteawesomestudio.workers.dev/`
**WORKER_TOKEN (current):** `benebots-demo-2026` — weak, set manually during S5 debugging
**VITE_WORKER_URL:** Set in Cloudflare Pages production env (Production only, not preview)
**VITE_WORKER_TOKEN:** Set in Cloudflare Pages production env — matches worker

> ⚠️ The worker token is weak and was set manually. Rotate it to a strong random value in S6.

---

## Session 6 Priority Order

### P0 — Fix before any demo calls

**1. Revert error message to user-friendly copy**

File: `benebots/src/demo/AskDemo.tsx` line ~119
Current (debug): `setError(\`Worker error: \${msg}\`)`
Should be: `setError('The demo isn\'t responding right now. Try again in a moment.')`

**2. Rotate WORKER_TOKEN to a strong value**
- Generate: `openssl rand -hex 32` in terminal
- Update in: benebots-proxy Worker → Settings → Variables and Secrets → WORKER_TOKEN
- Update in: benebots Pages → Settings → Variables and Secrets → VITE_WORKER_TOKEN
- Push empty commit to trigger Pages rebuild

**3. Fix remaining worker CORS gaps**

File: `worker/index.js` — lines 13, 23, 33, 36 still return errors without CORS headers. (Line 17 was fixed in S5 — the auth 401.) The rest are low-risk but should be fixed for consistency.

```js
// Line 13 — already has fix needed:
return new Response("Method not allowed", { status: 405, headers: corsHeaders(request) });
// Line 23:
return new Response("Invalid JSON", { status: 400, headers: corsHeaders(request) });
// Lines 33, 36 (system prompt validation):
return new Response("system must be a string", { status: 400, headers: corsHeaders(request) });
return new Response("system prompt too long", { status: 400, headers: corsHeaders(request) });
```

After editing worker/index.js, deploy via Cloudflare dashboard (Edit code → Deploy) until wrangler CI/CD is set up.

---

### P1 — Session 6 Core Work

**4. Copy audit — HowItWorks.tsx**
File: `benebots/src/components/HowItWorks.tsx`
- Steps should reflect real consultant workflow: onboard a client → configure bots → deploy
- Avoid "3 easy steps" framing — benefits consultants find it condescending
- Keep the diagnostics callout at the bottom — it's good

**5. Copy audit — FAQ.tsx**
File: `benebots/src/components/FAQ.tsx`
- Remove any specific pricing refs
- Add: "Is this a generic AI chatbot?" — answer should directly address grounding differentiator
- Add: "What if I need something specific to my practice?" — customization FAQ
- Review HIPAA answer carefully — only commit to what you'd stand behind on a call
- The LOA Navigator FAQ item (`botColor: '#00a868'`) has the wrong color — should be `#A78BFA` to match the new purple

**6. Set up wrangler CI/CD for worker**

Right now the worker deploys manually via the Cloudflare dashboard. This is fragile. Add GitHub Actions to auto-deploy the worker on push:

```yaml
# .github/workflows/deploy-worker.yml
name: Deploy Worker
on:
  push:
    branches: [main]
    paths: [worker/**]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          workingDirectory: worker
```

Requires: `wrangler.toml` in `worker/` and `CLOUDFLARE_API_TOKEN` secret in GitHub repo settings.

**7. IAS Landing Page — wire remaining CTAs**
File: `landing/index.html` (or wherever the landing page lives)
Tasks:
- 1.1: Wire all CTA href="#" → `mailto:ty@infiniteawesomestudio.com`
- 1.4: Wire "View Live Demo" CTA → `https://benebots.pages.dev`
- 1.7: Mobile nav hamburger menu (nav links hide below 900px)

---

### P2 — If Time Allows

**8. Testimonials.tsx — stub or remove**
The `Testimonials` component is in `Home.tsx` but likely has placeholder content. Either add real quotes (even one strong one) or remove it from the page until real testimonials are available.

**9. Demo suggested questions UX improvement**
In `AskDemo.tsx`, after the user sends the first message, the suggested questions panel disappears. Consider keeping 2-3 suggested follow-ups visible below the chat after first response.

**10. benebots.com domain**
- Porkbun — ~$12-15/yr
- Point to benebots.pages.dev via CNAME once acquired

---

## File Map (what changed in S5)

```
benebots/
├── public/_redirects              ← NEW — Cloudflare SPA routing
├── src/
│   ├── App.tsx                    ← Updated — BrowserRouter + /demo/:botId routes
│   ├── data/
│   │   └── acmeProfile.ts         ← NEW — full Acme client profile
│   ├── demo/                      ← NEW folder
│   │   ├── AskDemo.tsx            ← Live chat + Worker calls
│   │   ├── StewardshipDemo.tsx    ← Section picker + drafts
│   │   ├── PlanCompareDemo.tsx    ← HDHP vs PPO comparison
│   │   ├── OECoachDemo.tsx        ← 4-step questionnaire
│   │   └── LOANavigatorDemo.tsx   ← Dual-mode leave guide
│   ├── pages/
│   │   ├── Home.tsx               ← Updated — Capabilities replaces Pricing
│   │   └── Demo.tsx               ← NEW — route handler, viewport-locked layout
│   └── components/
│       ├── Capabilities.tsx       ← NEW — "Built for your practice" section
│       ├── Features.tsx           ← Updated — 5 bots, clickable, LOA Navigator
│       ├── Hero.tsx               ← Updated — new headline, 5 bot faces
│       ├── Navbar.tsx             ← Updated — Pricing removed
│       └── Footer.tsx             ← Updated — contact email, Pricing removed
worker/
└── index.js                       ← Updated — CORS headers on auth 401 response
```

---

## Dev Quick-Start (Session 6)

```bash
cd "/Users/tyboogie/Documents/Career Plans/Inifinte Awesome Studio/Claude Code Safe/infinite-awesome-studio"
git pull origin main
cd benebots && npm run dev    # http://localhost:5173
```

**Workflow:** Edit → `git add . && git commit -m "..." && git push origin main` → auto-deploys in ~60s

**Worker changes:** Edit `worker/index.js` → go to Cloudflare dashboard → Workers & Pages → benebots-proxy → Edit code → paste updated code → Deploy

---

## Session 6 Starting Prompt

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
7. Set up wrangler CI/CD for worker via GitHub Actions (so worker deploys on git push like Pages does)

Live site: benebots.pages.dev
Workflow: edit locally → git push → Cloudflare auto-deploys in ~60s
Worker deploys manually via Cloudflare dashboard until CI/CD is wired (item 7)
```

---

## Open Decisions Carried Forward

| Decision | Status |
|----------|--------|
| Pricing timing and structure | Not publishing — finalize after real client conversations |
| HIPAA / data tenancy FAQ | Confirm with compliance before any pilot |
| BeneBots domain — benebots.com vs subdirectory | Undecided |
| Contact mechanism — mailto now, form later | mailto for now |
| "14 hours saved per stewardship" stat | Validate against real sales story before publishing |
| Testimonials — placeholder or real | Need real quote before publishing |

---

*Every benefit. Every penny. Delivered awesomely.*
