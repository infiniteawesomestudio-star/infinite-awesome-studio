#!/usr/bin/env bash
# ─── fire-webhook.sh ─────────────────────────────────────────────────────────
# Fire a validly-signed Stripe `checkout.session.completed` at the LOCAL Front
# Desk worker so you can demo the "deposit paid → booking confirmed" step WITHOUT
# the Stripe CLI. It signs the event with the SAME STRIPE_WEBHOOK_SECRET the
# worker verifies with (read from .dev.vars, never printed), so it exercises the
# worker's real signature-verification + normalization code — the identical path
# Stripe drives in production when a real deposit is paid.
#
# Setup once: add a line to worker/.dev.vars  →  STRIPE_WEBHOOK_SECRET=whsec_localdemo
# then restart `npx wrangler dev`. (Leave MAKE_WEBHOOK_URL unset so the worker runs
# in verify-and-echo mode and prints the normalized deposit_paid event.)
#
# Usage:
#   ./fire-webhook.sh                       # Scenario 1 defaults: $1600 quote / 30% / $480 paid
#   QUOTE=400 PCT=0.5 AMOUNT_PAID_CENTS=20000 ./fire-webhook.sh   # Scenario 2: $400 flash, 50%
set -euo pipefail
cd "$(dirname "$0")"

URL="${URL:-http://localhost:8787/webhook}"

# Read the local webhook secret from .dev.vars (never printed to screen).
SECRET="$(grep '^STRIPE_WEBHOOK_SECRET' .dev.vars 2>/dev/null | cut -d= -f2- | tr -d '"'"'"' ')"
if [ -z "${SECRET:-}" ]; then
  echo "ERROR: no STRIPE_WEBHOOK_SECRET in worker/.dev.vars." >&2
  echo "Add a line:  STRIPE_WEBHOOK_SECRET=whsec_localdemo   then restart 'npx wrangler dev'." >&2
  exit 1
fi

# Deposit details — override any via env. Defaults match Scenario 1.
LEAD_ID="${LEAD_ID:-recDEMO123}"
CLIENT_ID="${CLIENT_ID:-vic}"
QUOTE="${QUOTE:-1600.00}"
PCT="${PCT:-0.3}"
AMOUNT_PAID_CENTS="${AMOUNT_PAID_CENTS:-48000}"
EMAIL="${EMAIL:-client@example.com}"
SESSION_ID="${SESSION_ID:-cs_test_demo_$(date +%s)}"

TS="$(date +%s)"
# One-line JSON body — the worker reads the raw bytes, so this exact string is
# what gets signed and sent.
BODY="{\"id\":\"evt_demo_${TS}\",\"object\":\"event\",\"type\":\"checkout.session.completed\",\"livemode\":false,\"data\":{\"object\":{\"id\":\"${SESSION_ID}\",\"object\":\"checkout.session\",\"payment_status\":\"paid\",\"amount_total\":${AMOUNT_PAID_CENTS},\"currency\":\"usd\",\"client_reference_id\":\"${LEAD_ID}\",\"customer_details\":{\"email\":\"${EMAIL}\"},\"payment_intent\":\"pi_test_demo_${TS}\",\"metadata\":{\"type\":\"deposit\",\"clientId\":\"${CLIENT_ID}\",\"leadId\":\"${LEAD_ID}\",\"quoteAmount\":\"${QUOTE}\",\"depositPct\":\"${PCT}\"}}}}"

SIG="$(printf '%s' "${TS}.${BODY}" | openssl dgst -sha256 -hmac "$SECRET" -r | cut -d' ' -f1)"

printf '→ POST %s  (checkout.session.completed, $%d.%02d paid)\n' "$URL" "$((AMOUNT_PAID_CENTS/100))" "$((AMOUNT_PAID_CENTS%100))"
curl -sS "$URL" \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: t=${TS},v1=${SIG}" \
  -d "$BODY" | jq .
