# IW Front Desk worker

The Front Desk **product-line** worker. One engine for every Front Desk client (Vic = client #0). Kept isolated from `benebots-proxy` so a deploy here can never touch the demos, Blog Studio, or Infinite Careers, and so each client system gets its own secrets, token, and billing attribution. IAS owns this engine and licenses it to the JV.

## What it does today (Phase 2 — the money spine)

One endpoint: mint a Stripe Checkout Session for a **variable deposit** (default 30% of an approved quote) *after Vic approves*. The agent never moves money — a human approves, then a deposit link is created.

`POST /` (single route, action-dispatched), header `Authorization: Bearer <WORKER_TOKEN>`:

```json
{
  "action": "create_deposit",
  "quoteAmount": 1600,          // full approved quote, in dollars
  "depositPct": 0.30,           // optional, defaults to 0.30
  "clientId": "vic",
  "stripeAccountId": "acct_XXXX", // optional, the client's Connect account (see multi-client)
  "leadId": "recXXXX",          // optional, Airtable lead id for webhook reconciliation
  "description": "Full-day black & grey realism",
  "customerEmail": "client@example.com",   // optional
  "successUrl": "https://…", "cancelUrl": "https://…"   // optional
}
```

Returns `{ url, sessionId, depositAmount, quoteAmount, depositPct, testMode }`. Send `url` to the client. `testMode` is `true` whenever the key is `sk_test_…`.

**Trust model (honest version).** The charge is `quoteAmount × depositPct`, computed server-side — but the caller supplies *both* inputs, so a token holder can choose the charge up to `maxQuote × MAX_DEPOSIT_PCT`. `maxQuote` is a **per-client** ceiling (default **$5,000**, overridable via `CLIENT_MAX_QUOTE`), so by default a leaked token caps out at a **$2,500** deposit — not $50k. The worker deliberately holds **no Airtable token** (that's Make's job — it's what keeps the worker entity-independent), so it can't re-derive the "approved" amount itself. The real controls are therefore: **(1)** the `WORKER_TOKEN` gate — only Make/Ty can call this, and the approval lookup happens in Make against Airtable *before* the call; and **(2)** the per-client `maxQuote` + `MAX_DEPOSIT_PCT` ceilings, which cap the blast radius if the token leaks. The `maxQuote` cap is **server-side only** — a caller can't raise their own ceiling. `depositPct` is optional (defaults to 0.30) and is rejected above 0.50. If stronger control is ever needed, give the worker a read-only Airtable lookup keyed on `leadId` — accepting the added token custody that trades away.

> **[VIC] open question:** $5,000 is a placeholder default. Ask Vic what his real top-end / usual max quote is (his full-day is ~$1,600, but multi-session or large custom pieces may run higher) and set `CLIENT_MAX_QUOTE` = `{"vic": <his number>}` before go-live so a legitimate big quote isn't rejected while the cap stays tight.

Each `create_deposit` call carries a Stripe **`Idempotency-Key`** derived from `clientId + leadId + deposit-cents + account`, so an approval that re-fires (Make retry, double-click) collapses onto **one** payable link instead of minting duplicates.

## Setup (Ty)

1. **Create/log into Stripe**, grab the **test** secret key (`sk_test_…`) from the Stripe dashboard → Developers → API keys.
2. From `iw-frontdesk/worker/`:
   ```
   # leading space keeps these out of zsh history; paste the value at the hidden prompt
    npx wrangler secret put WORKER_TOKEN        # make up a fresh strong token (NOT the benebots one)
    npx wrangler secret put STRIPE_SECRET_KEY   # paste the sk_test_… key
   ```
3. `npx wrangler deploy`
4. Ping J5 — I'll run a `create_deposit` test call and confirm a real Stripe **test** Checkout URL comes back (use a Stripe test card `4242 4242 4242 4242` to click through it).
5. **Go-live:** replace the test key with **Vic's live** `sk_live_…` (or move to Connect, below). Nothing else changes.

I do not enter Stripe keys — that's your side of the wheel. The hidden-prompt above means the key never lands in your shell history.

## Payment webhook (built — Phase 2b)

`POST /webhook` (also `/stripe-webhook`). Stripe calls this when a Checkout Session completes. **Authed by the Stripe signature, not the `WORKER_TOKEN`** — so it lives on its own route, outside the Bearer gate.

What it does:
1. Verifies the `Stripe-Signature` (HMAC-SHA256 over `t.payload`, via Web Crypto) with a 5-min timestamp tolerance (replay guard). Bad/stale/missing sig → `400`.
2. Acts only on a **paid deposit**: event type `checkout.session.completed` **or** `checkout.session.async_payment_succeeded` (delayed methods like ACH), **and** `payment_status: paid`, **and** `metadata.type == "deposit"` (ignores any other Checkout on the account). If the client is bound to a connected account server-side (see below), the paid session must have landed on that account or it's ignored. Everything else gets a `200` ack so Stripe stops retrying.
3. Normalizes the stamped metadata into a clean `deposit_paid` event: `{ leadId, clientId, stripeAccountId, quoteAmount, depositPct, amountPaid, customerEmail, sessionId, paymentIntentId, livemode }`.
4. Forwards it to `MAKE_WEBHOOK_URL` with an `X-Frontdesk-Token` header Make can check. That header carries `MAKE_SHARED_SECRET` — a **dedicated, least-privilege outbound secret**, not the root `WORKER_TOKEN` (which would ship the master auth secret to Make on every payment). Falls back to `WORKER_TOKEN` only if `MAKE_SHARED_SECRET` is unset. **Make** owns the Airtable + Google Calendar connections, so Make does the actual "flip booking to **Confirmed** + drop the GCal hold." Keeping those writes in Make means this worker never custodies an Airtable token or GCal creds — and it stays entity-independent (no LLC needed to run it).

If the Make forward fails, the worker returns `502` so Stripe **retries** (up to ~3 days). The Make scenario must therefore make the Airtable write **idempotent** — match on `sessionId` / `leadId` so a retry can't double-confirm or double-drop. With no `MAKE_WEBHOOK_URL` set, the worker verifies + echoes the normalized payload (test/echo mode).

Two more secrets (plus one recommended):
```
 npx wrangler secret put STRIPE_WEBHOOK_SECRET   # whsec_… from the Stripe dashboard webhook endpoint
 npx wrangler secret put MAKE_WEBHOOK_URL        # the Make custom-webhook URL (or set once wired)
 npx wrangler secret put MAKE_SHARED_SECRET      # dedicated outbound token for the Make forward (see below)
```
In the Stripe dashboard, add a webhook endpoint pointing at `https://<worker-url>/webhook`, subscribe it to **`checkout.session.completed`** and **`checkout.session.async_payment_succeeded`**, and paste its signing secret above. For Connect clients, use a **Connect** webhook so events on the connected account are delivered (the event's `account` field and the stamped `stripeAccountId` both identify whose deposit it was).

**`MAKE_SHARED_SECRET`** authenticates the worker → Make forward (`X-Frontdesk-Token`). Make it a *fresh* value, distinct from `WORKER_TOKEN`, and set the Make scenario to check it. If unset, the worker falls back to `WORKER_TOKEN` (so existing deploys keep working), but that ships the master auth secret to Make on every payment — set the dedicated one before go-live.

Verified via a 24-case harness (auth/JSON/null-body guards; `depositPct` cap; account-binding + mismatch; idempotency-key stability; webhook good/tampered/type-filter/async/unpaid/account-mismatch; MAKE_SHARED_SECRET forward) **plus a real Stripe test-mode mint + idempotent-retry** ($1,600 → $480 `cs_test_`, retry returns the same session id).

## Still to wire (next)

- **Make scenario** — (a) Vic approves in Airtable → Make calls `create_deposit` → writes the returned `url` back / sends it; (b) `/webhook` `deposit_paid` → Airtable booking **Confirmed** + drop the GCal hold (idempotent on `sessionId`).
- **Intake page hook** — the intake page stays in demo mode until the Make side lands; the deposit link is minted after Vic's approval, not at intake submit.
- **Deploy** — `[TY]` set `STRIPE_SECRET_KEY` (`sk_test_…`) + `STRIPE_WEBHOOK_SECRET` + `MAKE_WEBHOOK_URL`, then `npx wrangler deploy` and ping J5 for the end-to-end test.

## Multi-client graduation: Stripe Connect

For client #2+, do **not** hold each client's secret key. Have each client connect their Stripe to the IW Front Desk platform (Stripe Connect) and store their `acct_…` id in their Airtable **Clients** row.

**Server-side account binding (`CLIENT_ACCOUNTS`) — the secure default.** Bind each client's `acct_…` to their `clientId` *server-side* so the account is never taken on a caller's say-so:
```
 npx wrangler secret put CLIENT_ACCOUNTS   # JSON: {"vic":"","studioB":"acct_123..."}
```
An empty string pins that client to a **direct charge** on the worker's own key (Vic's lighthouse setup); an `acct_…` routes on-behalf-of that connected account. When a client is in this map the binding is **authoritative** — a caller-supplied `stripeAccountId` is ignored, and *rejected* (`400`) if it disagrees — so a token holder can't reroute one client's deposit into an arbitrary account. The `/webhook` handler enforces the same binding: a paid session that didn't land on the bound account is ignored.

**Legacy per-request account (unmapped clients only):** for a client *not* in `CLIENT_ACCOUNTS`, Make may still pass `stripeAccountId` on the `create_deposit` call (validated to `acct_…` shape so a bad value can't inject a header). The `STRIPE_ACCOUNT_ID` env remains the single-tenant fallback when no per-request value is sent. Prefer binding via `CLIENT_ACCOUNTS` for anything handling real money.

Requires a **platform** Stripe account (IAS-owned, per the IP guardrail) with Connect enabled to mint each client's onboarding link — gated on the IAS entity being formed. Until then, a single client can run on their own `sk_live_…` key (or `sk_test_…`) via `STRIPE_SECRET_KEY` with no account id.
