# Nexora Bank Sync Worker

Cloudflare Worker that proxies Nexora's bank-account-data requests to GoCardless Bank Account Data.

The mobile apps never receive the GoCardless secret ID or secret key.

## Worker secrets

- `GOCARDLESS_SECRET_ID`
- `GOCARDLESS_SECRET_KEY`
- `NEXORA_SESSION_SECRET` — use a stable random 32+ byte value

The repository includes the manual GitHub workflow **Deploy Nexora Bank Backend**. It expects Cloudflare and GoCardless values as GitHub Actions repository secrets.

After deployment, copy the public `https://...workers.dev` Worker URL into the GitHub repository secret `NEXORA_BANK_API_URL`, then rebuild Android/iOS.

## Routes

- `GET /health`
- `GET /api/banks?country=EE`
- `POST /api/connect`
- `POST /api/sync`
- `POST /api/disconnect`
- `GET /bank/callback`

Bank authorization redirects back to `nexora://bank-connected`. Both Android and iOS register this scheme and re-authenticate the user before bank data is shown.
