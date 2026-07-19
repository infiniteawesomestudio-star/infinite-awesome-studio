# IW Front Desk — Live Call Scenario Pack

Companion to [DEMO-SCRIPT.md](./DEMO-SCRIPT.md). That file gets ONE deposit link on screen; this file gives you **the whole process, end to end** — inquiry → approve → mint → pay → **booking confirms itself** — plus the "what if" scenarios a client will ask about, all runnable live in Stripe **test mode**.

## The arc you're demoing (say this up top)

> "A customer messages Vic. My Front Desk agent triages the request, gathers the details, and drafts a quote — but it never charges anyone. **Vic approves**, and only then does the agent mint a deposit link. The customer pays, and the booking confirms itself and drops onto the calendar — no one re-typing anything. Let me show you the money spine of that live, in test mode, so we can 'pay' with a fake card right here."

**One honesty note for you:** the *conversational* intake (the DM/quote chat) lives in the ManyChat + Make brain, separate from this money worker by design (a human approves before any money moves). On the call you **narrate** the intake ("the agent collected this and proposed $1,600"), then **run** the money spine below. Don't claim the worker itself chats.

---

## One-time setup (5 min, before the call)

You need the base setup from [DEMO-SCRIPT.md](./DEMO-SCRIPT.md) (Node, wrangler, `.dev.vars` with `WORKER_TOKEN` + a **test** `STRIPE_SECRET_KEY`). Then add the webhook half:

1. Add ONE line to `worker/.dev.vars` (a local demo value — not a real Stripe secret):
   ```
   STRIPE_WEBHOOK_SECRET=whsec_localdemo
   ```
   Leave `MAKE_WEBHOOK_URL` **unset** — that keeps the webhook in *verify-and-echo* mode, so it prints the confirmation event instead of forwarding to Make.

2. **Terminal 1** — start the worker (loads `.dev.vars` automatically):
   ```bash
   cd "…/iw-frontdesk/worker" && npx wrangler dev
   ```
   Wait for `http://localhost:8787`.

3. **Terminal 2** — load the token off-screen (from DEMO-SCRIPT step 2):
   ```bash
   cd "…/iw-frontdesk/worker"
   export WORKER_TOKEN=$(grep '^WORKER_TOKEN' .dev.vars | cut -d '=' -f2- | tr -d '"'"'"' ')
   ```

4. **Pre-call smoke test** (do this before Vic joins — proves both halves are wired):
   ```bash
   ./fire-webhook.sh
   ```
   You want to see `{"received": true, "forwarded": false, "event": {"type": "deposit_paid", …}}`. If you see `{"error":"Invalid signature."}` the secret/restart didn't take; if `{"error":"Webhook not configured…"}` the `.dev.vars` line or restart is missing.

> `fire-webhook.sh` sends a **validly-signed** `checkout.session.completed` to your worker. It signs with the same secret the worker checks, so it runs the *real* verification + normalization code — the exact path Stripe drives in production. It just lets you trigger it on demand instead of waiting on Stripe's servers.

---

## Scenario 1 — The happy path, end to end (your hero demo)

**Story:** New client DMs Vic for a full-day black & grey sleeve. Agent proposes **$1,600**; Vic approves.

1. **Agent mints the deposit link** (Terminal 2):
   ```bash
   curl -sS http://localhost:8787/ \
     -H "Authorization: Bearer $WORKER_TOKEN" -H "Content-Type: application/json" \
     -d '{"action":"create_deposit","quoteAmount":1600,"depositPct":0.30,"clientId":"vic","description":"Full-day black & grey realism sleeve","leadId":"recDEMO123"}' | jq .
   ```
   → `depositAmount: 480`, `testMode: true`, a `cs_test_…` **url**.

2. **Client pays.** Open the `url`, pay with **4242 4242 4242 4242**, any future expiry / any CVC / any ZIP. Land on the success page.

3. **The booking confirms itself.** Fire the paid event (Terminal 2):
   ```bash
   ./fire-webhook.sh
   ```
   → the worker returns a clean **`deposit_paid`** event: `leadId`, `clientId: "vic"`, `quoteAmount: 1600`, `depositPct: 0.3`, **`amountPaid: 480`**, `sessionId`, `paymentIntentId`.

**The line:** "That `deposit_paid` event is what flips the booking to **Confirmed** in Airtable and drops the hold on Vic's Google Calendar — automatically. In production Stripe fires it the instant the customer pays; here I fired it so you could see it."

---

## Scenario 2 — Different job, different deposit (flexibility)

**Story:** A walk-in wants a small **$400** flash piece; Vic takes a **50%** deposit on small work.

1. Mint:
   ```bash
   curl -sS http://localhost:8787/ \
     -H "Authorization: Bearer $WORKER_TOKEN" -H "Content-Type: application/json" \
     -d '{"action":"create_deposit","quoteAmount":400,"depositPct":0.50,"clientId":"vic","description":"Flash piece — forearm","leadId":"recFLASH7"}' | jq .
   ```
   → `depositAmount: 200`. The percentage is per-job; Vic's default is 30% but he sets it per booking.

2. (Optional) Confirm it end to end:
   ```bash
   QUOTE=400 PCT=0.5 AMOUNT_PAID_CENTS=20000 LEAD_ID=recFLASH7 ./fire-webhook.sh
   ```
   → `deposit_paid` with `amountPaid: 200`.

**The line:** "Same engine, any job size, any deposit rule — set once per booking."

---

## Scenario 3 — The card declines (it does NOT false-confirm)

**Story:** Client's card fails. A client will ask "what if they don't actually pay?"

1. Mint a link (reuse Scenario 1's curl, or a fresh `leadId`).
2. Open the `url`, pay with the Stripe **decline** card **4000 0000 0000 0002**. Checkout shows the card declined; the customer never reaches the success page.
3. **Nothing to confirm.** No completed payment means Stripe never fires `checkout.session.completed`, so **no `deposit_paid` event, no booking flip.** (You simply don't run `fire-webhook.sh` — there was no payment.)

**The line:** "No deposit, no booking. The calendar hold just expires. The system never marks someone confirmed who didn't actually pay."

*(Optional extra: `4000 0000 0000 9995` = insufficient funds, if you want a second failure mode.)*

---

## Scenario 4 — "Can it be gamed?" (the trust close)

Run these to show the guardrails. All are live, all in test mode.

- **The agent can't invent a charge.** Sneak in fake amount fields — they're ignored:
  ```bash
  curl -sS http://localhost:8787/ \
    -H "Authorization: Bearer $WORKER_TOKEN" -H "Content-Type: application/json" \
    -d '{"action":"create_deposit","quoteAmount":1600,"depositPct":0.30,"clientId":"vic","amount":5,"chargeAmount":999999,"depositAmount":1}' | jq .
  ```
  → still `depositAmount: 480`. The deposit is **always** the percentage of the quote.

- **Bad inputs are refused, not guessed:**
  ```bash
  # percentage sent as 30 instead of 0.30
  curl -sS http://localhost:8787/ -H "Authorization: Bearer $WORKER_TOKEN" -H "Content-Type: application/json" \
    -d '{"action":"create_deposit","quoteAmount":1600,"depositPct":30,"clientId":"vic"}' | jq .
  # → 400 "depositPct must be between 0 and 1."
  ```

- **No token, no entry:**
  ```bash
  curl -sS http://localhost:8787/ -H "Content-Type: application/json" \
    -d '{"action":"create_deposit","quoteAmount":1600,"clientId":"vic"}' | jq .
  # → 401 "Unauthorized"
  ```

- **Forged payment notifications bounce.** Show the webhook rejects an unsigned/wrong-signed event:
  ```bash
  curl -sS http://localhost:8787/webhook -H "Content-Type: application/json" \
    -H "Stripe-Signature: t=1,v1=deadbeef" -d '{"type":"checkout.session.completed"}' | jq .
  # → 400 "Invalid signature."
  ```

**The honest framing (don't overstate):** the real security boundary is the **secret token** plus a **max-quote cap** — a trusted approval flow holds the token; the worker validates and computes, and only Stripe-signed payment events can confirm a booking. Test mode means zero real money the whole time.

---

## Scenario 5 — One engine, every artist (optional, if it comes up)

If the prospect asks "does this only work for one shop?" — the same worker routes each client's deposits to **their own** Stripe via a per-request connected account:
```bash
curl -sS http://localhost:8787/ \
  -H "Authorization: Bearer $WORKER_TOKEN" -H "Content-Type: application/json" \
  -d '{"action":"create_deposit","quoteAmount":1600,"depositPct":0.30,"clientId":"artist2","stripeAccountId":"acct_EXAMPLE1234"}' | jq .
```
→ the response **echoes `stripeAccountId`**, showing the deposit is routed to that artist's account (needs a real test Connect account to actually complete). One licensed engine, many artists — Vic is client #0.

---

## Between runs / if something hangs

- Each `create_deposit` uses a fresh `leadId` so events don't collide — bump the number.
- `curl: (7) Failed to connect` → Terminal 1's `wrangler dev` stopped; restart it.
- Full troubleshooting table is in [DEMO-SCRIPT.md](./DEMO-SCRIPT.md).
- Reset is trivial: nothing persists locally — every run is independent.

---

*Accurate to `worker/index.js` as of 2026-07-18 (webhook logic lines 213-311, echo mode 286-287, signature check 318-342). The `fire-webhook.sh` signature was verified to match the worker's WebCrypto HMAC. Everything here runs in Stripe test mode; swapping the live key at go-live changes nothing in these commands.*
