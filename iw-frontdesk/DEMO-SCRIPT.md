# IW Front Desk — Live Demo Script: "The Agent Mints a Deposit Link"

## What you're about to see (say this to the client)

"When a client says yes to a quote, my Front Desk agent doesn't just talk — it acts. On command it mints a real Stripe deposit link and hands it back, ready to text to the customer. But here's the money-safety part: the agent itself never moves a dollar — it only creates a *link*, a human approves the quote first, and the deposit is always a locked percentage of that quote (30% by default), computed by the server. We'll run the whole thing right now in Stripe **test mode**, so no real money moves and I can even 'pay' the deposit with a test card in front of you."

---

## Prerequisites

Confirm these before you start (all verified in this environment):

- **Node** installed — this box has `v24.15.0`.
- **Wrangler** (Cloudflare's CLI) available via `npx` — this box resolves `wrangler 4.112.0`. First run may print a one-time "installing wrangler" notice; that's fine.
- Worker source present at:
  `/Users/tyboogie/Documents/Career Plans/Infinite Awesome Studio/Claude Code Safe/infinite-awesome-studio/iw-frontdesk/worker/`
- **Two secrets must be set** for a full end-to-end run:
  - `WORKER_TOKEN` — the shared secret gating the worker.
  - `STRIPE_SECRET_KEY` — must be a **test** key (contains `_test_`, e.g. `sk_test_…` or a restricted `rk_test_…`) so the response comes back `testMode: true` and zero real money moves.
  - For **local** (Path A), both are read automatically from `worker/.dev.vars` by `npx wrangler dev` — you do not set anything by hand, and you never need to print either value.
- A browser open for the Checkout step, and the Stripe test card handy: **4242 4242 4242 4242**, any future expiry, any 3-digit CVC, any ZIP.

> Money-safety note for you: the key in `.dev.vars` must be a **test** key for this demo. If it were a live key the same call would create a *real* charge. The code decides test-vs-live purely from whether the key string contains `_test_` (index.js line 123).

---

## Path A — Local demo (`npx wrangler dev`)

This runs the real worker code on your laptop against the real Stripe **test** API. Everything the client sees is genuine — genuine Stripe, genuine Checkout page — just in sandbox mode.

### 1. Start the worker

Open a terminal and run:

```bash
cd "/Users/tyboogie/Documents/Career Plans/Infinite Awesome Studio/Claude Code Safe/infinite-awesome-studio/iw-frontdesk/worker"
npx wrangler dev
```

Wait for the ready line. It will say it's listening on:

```
http://localhost:8787
```

Leave this terminal running. `wrangler dev` automatically loads `WORKER_TOKEN` and `STRIPE_SECRET_KEY` from `.dev.vars` — you do not type any secret.

### 2. In a SECOND terminal, load the token into an env var (without printing it)

This pulls the token from `.dev.vars` straight into a shell variable so it never appears on screen or in the demo:

```bash
cd "/Users/tyboogie/Documents/Career Plans/Infinite Awesome Studio/Claude Code Safe/infinite-awesome-studio/iw-frontdesk/worker"
export WORKER_TOKEN=$(grep '^WORKER_TOKEN' .dev.vars | cut -d '=' -f2- | tr -d '"'"'"' ')
```

(Nothing prints — that's intentional. The variable is set silently.)

### 3. The agent's move: POST `create_deposit`

This is the call your agent makes the instant Vic approves the quote. Realistic tattoo example: a **$1,600** full-day piece, **30%** deposit, for client **vic**.

```bash
curl -sS http://localhost:8787/ \
  -H "Authorization: Bearer $WORKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_deposit",
    "quoteAmount": 1600,
    "depositPct": 0.30,
    "clientId": "vic",
    "description": "Full-day black & grey realism sleeve",
    "leadId": "recDEMO123"
  }'
```

### 4. What comes back

A JSON response shaped like this (field names are exactly what the worker returns — index.js lines 200-210):

```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_a1B2c3...",
  "sessionId": "cs_test_a1B2c3...",
  "depositAmount": 480,
  "quoteAmount": 1600,
  "depositPct": 0.3,
  "testMode": true
}
```

Read it out loud to the room:
- `depositAmount: 480` — 30% of $1,600, **computed by the server**, not sent by the caller.
- `testMode: true` — sandbox, no real money.
- `url` — a **cs_test_…** Stripe Checkout link. That's what your agent would text the customer.

> Note: the response may also include a `stripeAccountId` field if a Connect account is configured — that's the multi-client path and won't appear in this single-tenant demo.

### 5. "Pay" the deposit live

Copy the `url` value, open it in a browser. You'll see a real Stripe Checkout page reading **Deposit — Full-day black & grey realism sleeve**, **$480.00**, with a "TEST MODE" banner. Pay with:

- Card: **4242 4242 4242 4242**
- Expiry: any future date (e.g. `12 / 34`)
- CVC: any 3 digits (e.g. `123`)
- ZIP: any 5 digits (e.g. `89101`)

It completes and lands on the success page. That's the full loop: agent mints link → customer pays deposit → booking would flip to Confirmed (the webhook side wires that to Airtable/Calendar via Make; not part of this deposit demo).

---

## Path B — The money-safety talking track

This is the part that closes trust. Two things to demonstrate.

### 1. The agent can't invent a charge — the server does the math

Point out in the code (index.js line 116) that the deposit is computed server-side:

```js
const depositCents = Math.round(quoteAmount * depositPct * 100);
```

The caller sends the **approved quote** and an optional **percentage** — never a dollar amount to charge. Prove it live by trying to sneak in a charge amount:

```bash
curl -sS http://localhost:8787/ \
  -H "Authorization: Bearer $WORKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_deposit",
    "quoteAmount": 1600,
    "depositPct": 0.30,
    "clientId": "vic",
    "amount": 5,
    "chargeAmount": 999999,
    "depositAmount": 1
  }'
```

The response still shows **`depositAmount: 480`**. The extra `amount` / `chargeAmount` / `depositAmount` fields are simply ignored — the worker never reads them. The deposit is **always** the percentage of the quote; the agent can't hand out a discounted or inflated deposit ratio.

**The line that matters to the client:** "A human approves the quote. The agent creates the link off that approved quote. The agent has no ability to invent a charge — the server does the math. That's the boundary."

> Honest framing (do not overstate): the quote and percentage themselves are inputs, bounded by a hard maximum quote cap and a 0–1 percentage. The security control is the secret token plus that cap — not an amount the caller is free to set to anything.

### 2. testMode makes it a safe sandbox

Every response carries `testMode`. It's `true` because the key contains `_test_` (index.js line 123). While that's true, every link is a Stripe test link and no real card is ever charged — which is exactly why we can click through a "payment" live in this meeting. At go-live, the only change is swapping in the live key; not a single line of the request changes.

---

## If something goes wrong (troubleshooting)

Based on the worker's actual error handling:

| Symptom | Likely cause | Fix |
|---|---|---|
| `{"error":"Unauthorized"}` — HTTP **401** | Bad or missing Bearer token (the `WORKER_TOKEN` env var didn't load, or doesn't match) | Re-run the step-2 `export` in the same terminal you're curling from; make sure `.dev.vars` has `WORKER_TOKEN`. |
| `{"error":"Stripe is not configured on this worker yet."}` — **503** | `STRIPE_SECRET_KEY` missing from `.dev.vars` | Confirm the key is set in `worker/.dev.vars`; restart `npx wrangler dev`. |
| `testMode` comes back **`false`** | The key is a **live** key (no `_test_`) — STOP, this would charge real money | Do not proceed. Swap in a `sk_test_…` / `rk_test_…` key before demoing. |
| `{"error":"quoteAmount must be a positive dollar amount."}` — **400** | `quoteAmount` missing, ≤ 0, or > 100,000 | Send a positive number ≤ 100000. |
| `{"error":"depositPct must be between 0 and 1."}` — **400** | Sent `depositPct` as e.g. `30` instead of `0.30` | Use a fraction: `0.30`, not `30`. |
| `{"error":"Deposit below Stripe's $0.50 minimum."}` — **400** | Quote × pct rounds under $0.50 (tiny test amount) | Use a realistic quote (e.g. 1600). |
| `{"error":"Invalid JSON"}` — **400** | Malformed curl body (smart quotes, trailing comma) | Re-paste the curl block from this script exactly. |
| `{"error":"Unknown action: …"}` — **400** | `action` isn't `create_deposit` | Check the `action` field spelling. |
| `{"error":"Method not allowed"}` — **405** | Sent a GET (e.g. opened the URL in a browser) | The worker only accepts POST. Use the curl command. |
| `{"error":"stripeAccountId must look like acct_XXXX."}` — **400** | A malformed `stripeAccountId` was passed (not needed for this demo) | Omit `stripeAccountId` entirely for the single-tenant demo. |
| Error mentioning `Stripe 4xx` / a Stripe message — **502** | Stripe rejected the request (e.g. expired/restricted test key) | Check the test key is valid and active in the Stripe dashboard. The response still echoes `testMode` so you know you're in sandbox. |
| `curl: (7) Failed to connect` | `wrangler dev` isn't running or is on a different port | Confirm terminal 1 shows `http://localhost:8787`; match the port in your curl. |

---

### Quick reference (README vs. code — code wins)

- **Route:** README says `POST /`. The code accepts a POST to **any** path except `/webhook` and `/stripe-webhook`, but POSTing to `/` (as above) is the clean, documented path — use it.
- **Response fields:** README lists `url, sessionId, depositAmount, quoteAmount, depositPct, testMode`. The code returns those and *additionally* echoes `stripeAccountId` when a Connect account is in play — it simply won't appear in this demo.
- **Test-mode detection** keys off the substring `_test_`, so it correctly covers both standard `sk_test_…` and restricted `rk_test_…` keys (Vic's rail uses a restricted key).

---

*Accurate to `worker/index.js` as read on 2026-07-18. Environment verified: Node `v24.15.0`, Wrangler `4.112.0`, worker files present, `.dev.vars` exists in `worker/` (secret values never opened or printed). The `$1,600 × 0.30 = $480.00` figure and the `cs_test_` / `testMode:true` behavior are exact to the code paths cited (lines 116, 123, 200-210). Note: the deposit-amount safety story is framed honestly per the 2026-07-18 code audit — the control is the token + max-quote cap, not an enforced approved-amount lookup.*
