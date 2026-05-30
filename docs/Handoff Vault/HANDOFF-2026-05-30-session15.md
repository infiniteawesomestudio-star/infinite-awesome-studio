# Session 15 Handoff — Positioning v2 + BeneBots Page

**Date:** 2026-05-30
**Session Focus:** Retooled IAS positioning (Infinite Workflows front door, benefits expertise as proof not apology), applied it across the homepage, built a dedicated BeneBots page with full character intros + MyBenefitsGuy socials, and cleaned up risky benefits-platform language.
**Branch:** main | **Deploy:** Cloudflare Pages (auto on push)

---

## Strategy: Positioning v2

New doc: `docs/IAS_Positioning_v2.md` (supersedes Sections 1/5/6 of the Downloads `IAS_Website_Revamp_Plan.md`).

- **Reframe:** benefits/HR expertise is the wedge, not a liability. Stop apologizing for it; make it *proof of method*, never the product. Tagline: "Benefits is where I'm from. Workflows is what I do for you."
- **Two-engine, two-audience model:**
  - **Infinite Workflows** (sub-brand) → general small-business owners. The paid front-door engine.
  - **BeneBots / Automation** (sub-brand) → benefits-adjacent buyers (brokers, HR, agencies = Ty's warm network).
  - **MyBenefitsGuy** → public campaign / trust engine, feeds the benefits-adjacent funnel.
  - BeneBots does double duty: proof-of-method on the homepage; a real product on its own page.

---

## What Was Completed

### Homepage (`landing/index.html`)
- **CTA hierarchy → "Book a Workflow Review"** (Calendly) in nav, mobile menu, and hero primary. Removed "Explore BeneBots" from the hero.
- **Offensive tone:** hero subhead now leads broad then lands the benefits-forged proof line; About headline flipped to "I learned to tame chaos in the most paperwork-heavy corner of business there is."
- **BeneBots section legal cleanup** (all removed): "compliance-ready," "set it and forget it," "drop BeneBots into your HR portal," "grounded in your plan data," "personalized plan picks," "claims and appeals," "carrier negotiation / plan design," "employee coaching." Section reframed as proof-of-method; all six bot descriptions rewritten legal-safe; "Plan-grounded" pill → "Approved-source."
- **Character art** replaces the six emoji icons on the bot cards (transparent PNGs).
- **"Follow MyBenefitsGuy & the crew" social strip** above the bot grid (IG/TikTok/FB/Threads, `@mybenefitsguy`).
- **"Meet the full crew →"** button linking to `/benebots/`.
- **Footer:** new tagline ("Practical AI workflows. Plain-English education. Built for the little guy."), sitewide general-education disclaimer, and IAS social links.
- **BeneBots logo two-tone fixed** — wrapper background set to `#FBFAF6` to match the logo PNG's baked cream (closes the carried Session 14/15 logo item for the homepage section).

### New BeneBots page (`landing/benebots/index.html`)
Standalone IAS-branded page (reuses the `articles.html` shell: nav, mobile menu, footer, v2 CTA + disclaimer):
- Hero (crew shot) with the proof-of-method headline.
- "Two ways BeneBots work" — public campaign vs. client-facing asset layer.
- **Full character roster** — six bots with art, personality intro, and audience tag, each in its own accent color (Ask `#00C47A`, Stewardship `#5B8FFF`, Compare `#F7D154`, OE `#FF6F61`, LOA `#A78BFA`, Claims `#F97316`).
- **MyBenefitsGuy social feature** — deep-forest panel, transparent MBG cutout, follow links. (Cast-row of HSA/COBRA/Retirement was added then removed per Ty.)
- **Disclaimer** section (Ty's copy) + 12 "do not provide" tags.
- Final CTA.

### Assets
- Copied transparent character PNGs from `benebots/public/` into `landing/assets/` (only `landing/` is served by Pages).
- **Generated `MyBenefitsGuy_Full_Transparent.png`** via edge-in flood-fill cutout. Reason: every full-body MBG file in the library (`MyBenefitsGuy_Full_TP.png`, `_Half_TP`, vault `..._Full_Transparent.png`) is flat RGB with a **white/checkerboard background baked in** — none were actually transparent. The product bots and cast bots (`*_TP.png`) ARE genuinely transparent.

---

## Files Changed / Added
```
docs/IAS_Positioning_v2.md                         — NEW: positioning v2
landing/index.html                                 — v2 homepage edits (CTAs, tone, BeneBots cleanup, art, socials, footer, logo fix)
landing/benebots/index.html                        — NEW: dedicated BeneBots page
landing/assets/{AskBot_Duo,ComplianceBot,CompareBot,OEBot,LOABot,ClaimBot}_TP.png — NEW: character art
landing/assets/BeneBots-Crew.png                   — NEW: crew hero (PLACEHOLDER, see open items)
landing/assets/MyBenefitsGuy_Full_Transparent.png  — NEW: generated transparent cutout
docs/Master Trackers/MASTER_TRACKER-2026-05-30-session15.md — NEW
docs/Handoff Vault/HANDOFF-2026-05-30-session15.md          — NEW (this file)
```
Copied-but-unused (left untracked for later): `HSABot_TP.png`, `COBRABot_TP.png`, `RetirementBot_TP.png`, `MyBenefitsGuy_Full_TP.png` (the bad checkerboard one).

---

## Open for Session 16
| Item | Notes |
|------|-------|
| **Regenerate the BeneBots crew hero image** | `landing/assets/BeneBots-Crew.png` is a placeholder. Regenerate to use the **updated BeneBots logo** and **include FSABot**, then replace the file. |
| **Verify IAS social handles** | Used slug `infiniteawesomestudio` and a guessed LinkedIn company URL. `@mybenefitsguy` is confirmed; IAS handles need checking (LinkedIn especially). |
| **Point nav "BeneBots" to `/benebots/`** | Currently the homepage `#benebots` anchor; discovery is via the "Meet the full crew" button. |
| **Homepage `#mybenefitsguy` image** | Likely uses a baked-checkerboard MBG image — swap to the transparent cutout. |
| Optional: reorder bento so the Infinite Workflows card leads | Front-door thesis polish. |
| Deeper v2 | `/infinite-workflows/` page alignment; sub-brand identities (lockup/accent/tagline); homepage "Start Here" routing split by engine. |
| **Uncommitted churn to review** | Working tree had a pre-existing docs reorg + `branding/MyBenefitsGuy4.png` deletion + `package-lock.json` — left OUT of this session's commit. Ty to review/commit separately. |
| Carried (Session 13/14) | prompt-library navbar link, Stewardship/group images, /about-ty, DNS Porkbun, replace Acme sample data, publish first real blog post. |

---

## Brand Reminders
- Never use: "powerful," "seamless," "innovative," "game-changer." Em dashes as sparingly as possible; title separators use `·`.
- Shovel analogy is the through-line.
- Bot colors: Ask `#00C47A` · Stewardship `#5B8FFF` · Compare `#F7D154` · OE Coach `#FF6F61` · LOA `#A78BFA` · Claims `#F97316`.
- Secrets only at hidden prompts, never on a command line.
