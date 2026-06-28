# Post-Launch Handoff — IAS.com is LIVE

**Date:** 2026-06-13 · **Carry this to a fresh chat to close out the post-launch loose ends.**
**Lead item this session: LinkedIn profile overhaul.** Everything below it is queued, not started.

---

## Context: the launch is done

`infiniteawesomestudio.com` went live 2026-06-13. Cloudflare zone created, Porkbun nameservers switched (elias/linda.ns.cloudflare.com), three proxied CNAMEs and Pages custom domains live with active SSL: apex, `www`, and `benebots.infiniteawesomestudio.com` (the BeneBots demo app now sits on a real subdomain, not pages.dev). All paths verified HTTP/2 200 over HTTPS. README finalized and pushed (`e5f37eb`). ClickUp DNS task `86b9vdta0` closed.

So all the "once DNS is live" gates are now open. The Featured links, demo URLs, and IAS.com link in the items below all resolve.

---

## 1. LinkedIn profile overhaul ← START HERE

**This is Ty's action — editing a live public profile and account settings. Claude provides the script and the copy; Ty makes the changes in the LinkedIn UI.**

Full source: [`LinkedIn-Overhaul-Playbook.md`](../../../../../Library/CloudStorage/OneDrive-Personal/Obsidian/Infinite%20Awesome%20Studio/Infinite%20Awesome%20Studio/3-Go-To-Market/LinkedIn-Overhaul-Playbook.md) in the vault (`Infinite Awesome Studio / 3-Go-To-Market /`). Built from a full read of the live profile on 2026-06-09.

**The core diagnosis:** the Experience bullets are already strong on benefits depth. The problem is the builder identity is invisible everywhere recruiters filter — headline, skills, no IAS entry, no Featured, no Projects. This is a reframe + add, not a rewrite of the work history.

Execute it as one coordinated push so the profile and the launch reinforce each other. The seven edits, in order:

1. **Headline (the #1 fix).** Currently says "Account Manager" six ways, zero builder signal. Replace with:
   > Benefits Domain Expert Who Builds & Ships AI · Founder, Infinite Awesome Studio · Claude/LLM Apps · People Analytics · 20+ yrs Employee Benefits

   Softer backup: "Benefits & HR Technology Leader · AI Product Builder · 20+ yrs Employee Benefits".

2. **About — relead, keep his voice.** Lead line 1 with the builder thesis, not benefits ops. Open with something like: "I am a 20-year benefits operator who builds and ships production AI. Benefits is where I'm from; building the tools is what I do now." Then the human story, then proof (the apps), then licenses/compliance depth. Keep the authentic "friendly neighborhood benefits guy who learned to build" voice.

3. **Experience — ADD Infinite Awesome Studio.** New entry, Founder & Builder, 2025 to Present. Pull the resume's Selected AI Products bullets (Infinite Careers, MBG Content Engine, Infinite Pantry, BeneBots, the stack line). Keep USI + NRG as-is.

4. **Skills — full rebuild (biggest gap).** Current list is ~10 endorsed skills with ZERO AI/build/analytics. Add the full set from the playbook (LinkedIn allows 50). **Pin top 3: Generative AI · Employee Benefits · Prompt Engineering.** After adding, go into each Experience role and check the relevant skill chips so they show as "used here." (Full categorized list — AI/Build, Data/Analytics, Benefits/Funding, Compliance, Systems — is in the playbook.)

5. **Featured — now unblocked.** Add: IAS.com (live), the GitHub repo, the Infinite Careers demo, the BeneBots demo (`benebots.infiniteawesomestudio.com`), and the best build-in-public post (the "Licensed" post hit 1,027 impressions; the "joined USI" post hit 1,704 — pin the one that signals builder, not just milestone).

6. **Projects.** Add Infinite Careers, BeneBots, MBG Content Engine, Infinite Pantry. One line each, link to the live demo.

7. **License fix.** Licenses & certifications currently shows Maryland only. Add VA and DC (USI completed those apps). Resume already says MD, VA, DC; LinkedIn must match.

**Settings / housekeeping:** "Open to work" → recruiters-only (no public green banner while at USI). Location DC-Baltimore Area is fine. Custom URL already clean (`/in/ty-mosher-77a45529`).

**Live demo URLs for Featured/Projects:**
- Site: `https://infiniteawesomestudio.com`
- Infinite Careers: `https://infiniteawesomestudio.com/infinite-careers/`
- Infinite Workflows: `https://infiniteawesomestudio.com/infinite-workflows/`
- BeneBots: `https://benebots.infiniteawesomestudio.com`

---

## 2. Infinite Workflows 30-day campaign — date rebase

~50 ClickUp tasks in the IW 30-day campaign (content calendar + outreach) have due dates anchored to a June 1 start that slipped. Rebase them to the actual launch day (2026-06-13). This is a bulk date-shift across the campaign tasks in the Infinite Awesome Studio space. Flagged for Ty as his call on the new anchor date.

## 3. External tester onboarding

ClickUp task `86badm1jt`. Friend's husband tests Infinite Careers on his real job hunt. Start with Ty-mediated runs (he sends resume + JD, Ty runs live mode). Strict PII rules: never in repo or ClickUp, anonymous-by-default in content. Becomes a second braid case study.

## 4. Internal live-mode token (Ty, editor only)

Paste the rotated `WORKER_TOKEN` into both `benebots/.env.development.local` and `infinite-careers/.env.development.local` so `npm run dev` live mode stops 401ing. **Editor only — never on a command line.** Public site does not use this token at all, so this is dev-convenience, not a launch blocker.

## 5. Revoke the launch API token (security cleanup)

During the cutover Ty created a scoped Cloudflare token named `ias-launch`. The local copy was deleted after use. **Revoke it in the Cloudflare dashboard** (Profile → API Tokens → ias-launch → Delete) — it is no longer needed.

---

## Reminders for whoever picks this up

- Brand voice: no Oxford comma, no em-dashes, `·` separators. Never "powerful / seamless / innovative / game-changer".
- Items 1, 4, 5 are **Ty's hands** (live profile, secrets, account settings). Claude scripts and drafts; Ty executes.
- Deploy commands and full launch/security history live in [`project-ias-launch-state`](memory) and the S20→S21 trackers.
