# How to run the Infinite Careers internal demo (live mode)

**Two modes, one codebase:**

- **Public build (the site):** canned. `VITE_DEMO_MODE` defaults to true unless explicitly set to the string `"false"`, so any clean build ships with zero network calls and zero secrets. This is by design, do not "fix" it.
- **Internal live mode (your machine only):** real Claude analysis through the Cloudflare worker. Dev-server only, never deployed.

## Running live mode

1. Creds live in `infinite-careers/.env.development.local` (gitignored, loaded only by `npm run dev`, never by `vite build`). It needs:

   ```
   VITE_DEMO_MODE=false
   VITE_WORKER_URL=<the benebots-proxy worker URL>
   VITE_WORKER_TOKEN=<current rotated worker token>
   ```

   Edit this file in your editor only. Never paste the token on a command line. See `.env.example` for the shape.

   ⚠️ **As of 2026-06-11 this file still holds the pre-rotation token, so live mode returns 401.** Paste the current token from the password manager to fix. Same applies to `benebots/.env.development.local`.

2. Run it:

   ```bash
   cd infinite-careers
   npm install   # first time only
   npm run dev   # Vite dev server, URL prints in the terminal
   ```

3. Paste a real resume + job description and run the analysis. Requires Anthropic credits on the account.

## Rules

- Never put worker creds in `.env` or `.env.local`. Vite inlines those into production builds. Dev-only secrets go in `.env.development.local` and nowhere else.
- Never deploy a build made with `VITE_DEMO_MODE=false`. The deploy flow (build then `wrangler pages deploy`) is canned-by-default, keep it that way.
- After any rebuild that touches `landing/infinite-careers/`, verify the LIVE bundle is secret-free before DNS work:

  ```bash
  curl -s <live-bundle-url> | grep -cE "sk-ant|workers\.dev|Bearer "   # want 0
  ```

## Known issues

- Live-mode full analysis sometimes returns invalid JSON (ClickUp 86baa228f, open). Re-run usually succeeds.

## External tester workflow (real job-search journeys)

For testers without repo access (e.g. the friend's-husband pilot), default to **Ty-mediated runs**: they send resume + job description privately, Ty runs live mode and returns the analysis. Their materials are PII: keep them out of the repo, out of ClickUp and out of any build-in-public content unless they explicitly opt in (anonymous by default).
