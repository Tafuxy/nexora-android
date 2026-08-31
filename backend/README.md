# Nexora Bank Backend

Cloudflare Worker for Nexora's Enable Banking connection.

Required Worker secrets:
- ENABLEBANKING_APP_ID
- ENABLEBANKING_PRIVATE_KEY
- NEXORA_SESSION_SECRET

Routes include `/health`, `/privacy`, `/terms`, `/api/banks`, `/api/connect`, `/bank/callback`, `/api/sync` and `/api/disconnect`.
