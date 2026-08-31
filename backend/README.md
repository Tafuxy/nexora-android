# Nexora Bank Backend — Enable Banking

This Cloudflare Worker keeps all open-banking credentials outside the Android/iOS apps.

Provider: Enable Banking Accounts API.

Required Worker secrets for live bank sync:
- `ENABLEBANKING_APP_ID` — Enable Banking API application ID (`kid`)
- `ENABLEBANKING_PRIVATE_KEY` — PKCS#8 PEM private key generated for the Enable Banking application
- `NEXORA_SESSION_SECRET` — random long secret used by Nexora to sign local bank-connection handles

Cloudflare deployment also needs these GitHub repository secrets:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Endpoints used by the app:
- `GET /health`
- `GET /api/banks?country=EE`
- `POST /api/connect`
- `GET /bank/callback`
- `POST /api/sync`
- `POST /api/disconnect`

## Individual / non-commercial setup

Enable Banking supports restricted production applications linked to your own bank accounts. This is suitable for evaluating Nexora with your own real account without having a company or a full production agreement.

1. Deploy the Worker once with the Cloudflare secrets + `NEXORA_SESSION_SECRET`.
2. Note the Worker URL, e.g. `https://nexora-bank.<subdomain>.workers.dev`.
3. In Enable Banking Control Panel create a **Production** API application.
4. Add this exact redirect URL:
   `https://nexora-bank.<subdomain>.workers.dev/bank/callback`
5. Let Enable Banking generate the private key and save the downloaded `.pem` file securely.
6. Activate the Production application by linking your own bank account in Enable Banking Control Panel (restricted mode).
7. Add the application ID and the entire PEM private key as GitHub secrets:
   - `ENABLEBANKING_APP_ID`
   - `ENABLEBANKING_PRIVATE_KEY`
8. Re-run `Deploy Nexora Bank Backend`.
9. Verify `/health` returns `"configured": true`.

Restricted mode only permits retrieval from accounts linked to your Enable Banking application. Supporting arbitrary public users later requires a production agreement with the provider.
