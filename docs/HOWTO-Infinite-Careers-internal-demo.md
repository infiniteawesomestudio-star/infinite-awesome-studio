# How to run Infinite Careers (live modes + build safety)

> **Purpose (updated 2026-07-06):** the public site now ships **LIVE** — this reverses the 2026-06-28 "canned permanently" decision. The public build uses a **tokenless worker route** (Turnstile + hard origin lock + per-IP hourly cap + global daily spend cap), so it contains **no secrets by construction**. Internal live mode (worker token, localhost) still exists for Ty's content production and Ty-mediated runs. Ops/cockpit companion: `00-Studio-Ops/Infinite-Careers-LiveMode-Runbook.md` in the IAS vault — keep the two consistent.

**Three modes, one codebase:**

- **Public build (the site):** LIVE via the tokenless route. Built with the committed `infinite-careers/.env.production` (`VITE_DEMO_MODE=false`, `VITE_PUBLIC_LIVE=true`, worker URL, Turnstile **site** key — all public-by-design values, nothing secret). Anonymous users pass an invisible Turnstile challenge; abuse is bounded server-side by the origin lock, a per-IP hourly cap and a global daily spend cap (KV counters on the worker).
- **Internal live mode (your machine only):** real Claude analysis through the worker's shared-secret token path. Dev-server only, never deployed.
- **Canned demo:** still reachable on the live site via "See a sample report" (zero API calls), and still the fallback if a build is made with no env at all.

## Pilot access (magic links)

Named pilot testers get `?access=<code>` links. The code is checked against the worker's `PILOT_CODES` secret and bypasses Turnstile and both caps (still burst rate-limited). Codes + links + PII rules: `02-Products/Infinite-Careers/02-pilot-access.md` in the IAS vault (private, not in this repo). Rotate/revoke by editing the `PILOT_CODES` secret (comma-separated). Pilot codes also unlock localhost origins on the public route, so Ty-mediated runs work against the deployed worker without the token file.

## Running internal live mode

1. Creds live in `infinite-careers/.env.development.local` (gitignored, loaded only by `npm run dev`, never by `vite build`). It needs:

   ```
   VITE_DEMO_MODE=false
   VITE_WORKER_URL=<the benebots-proxy worker URL>
   VITE_WORKER_TOKEN=<current rotated worker token>
   ```

   Edit this file in your editor only. Never paste the token on a command line. See `.env.example` for the shape. If `WORKER_TOKEN` is rotated on the worker, re-sync BOTH `infinite-careers/.env.development.local` and `benebots/.env.development.local` or live mode returns 401.

2. Run it:

   ```bash
   cd infinite-careers
   npm install   # first time only
   npm run dev   # Vite dev server, URL prints in the terminal
   ```

3. Paste a real resume + job description and run the analysis. Requires Anthropic credits on the account.

## Building + shipping the public site

```bash
cd infinite-careers
npm run build   # loads .env.production → LIVE public build into landing/infinite-careers/
```

Then the secret scan (rule updated 2026-07-06: `workers.dev` is expected now — the worker URL is public by design; the scan targets actual secrets):

```bash
curl -s <live-bundle-url> | grep -cE "sk-ant|Bearer |VITE_WORKER_TOKEN"   # want 0
```

Also confirm no pilot code ever lands in a bundle (they live only in the worker secret and the private vault note).

## Rules

- Never put worker creds in `.env`, `.env.local` or `.env.production`. Vite inlines those into builds. Dev-only secrets go in `.env.development.local` and nowhere else. The Turnstile **site** key in `.env.production` is public; the Turnstile **secret** key is a worker secret only.
- The worker route for the public site accepts `botId: "job-analyzer"` only, batches at most 2 calls per request, and fails closed if `TURNSTILE_SECRET` or the `PUBLIC_KV` binding is missing.
- Spend knobs live in `worker/wrangler.toml`: `PUBLIC_IP_HOURLY_LIMIT` (default 5 requests/IP/hour) and `PUBLIC_DAILY_CAP` (default 60 requests/day, all IPs). One full analysis = 1 request; Resume AI / interview coaching = 1 request each.
- Run the secret scan after every rebuild of `landing/infinite-careers/`, before anything touches DNS.

## Known issues

- ~~Live-mode full analysis sometimes returns invalid JSON (ClickUp 86baa228f).~~ **Fixed 2026-06-25, hardened 2026-07-06:** maxTokens now 8000 client / 8192 worker ceiling, prompts carry explicit output budgets, and parse failures log `stop_reason`/token counts to the console plus a `sessionStorage["ic-last-run"]` breadcrumb (door, ok/error — no content) for debugging tester reports.

## External tester workflow (real job-search journeys)

Named pilots use the magic links above. For anyone else without a code, **Ty-mediated runs** remain the default: they send resume + job description privately, Ty runs live mode and returns the analysis. Tester materials are PII: keep them out of the repo, out of ClickUp and out of any build-in-public content unless they explicitly opt in (anonymous by default).
