# Nexora Bank Backend — V10

Cloudflare Worker for Nexora's Enable Banking connection and bank-activity push notifications.

## Required Worker secrets
- `ENABLEBANKING_APP_ID`
- `ENABLEBANKING_PRIVATE_KEY`
- `NEXORA_SESSION_SECRET`

Push notifications also require the Firebase service-account configuration expected by `src.js`.

## Main routes
- `/health`
- `/privacy`
- `/terms`
- `/api/banks`
- `/api/connect`
- `/bank/callback`
- `/api/sync`
- `/api/disconnect`
- `/api/push/register`
- `/api/push/status`
- `/api/push/test`

## V10 reliability notes
- Missing bank balances are treated as unknown, not as zero.
- Own-account transfers can be excluded from push spend/income events when both endpoints are known.
- Bank disconnect attempts to remove the installation from the push registry so stale polling does not continue.
- `/health` reports backend version `10.1.0`.
