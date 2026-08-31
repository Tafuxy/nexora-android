# Nexora 1.6.0

Nexora combines Planner, Money, Bills and Garage in one mobile app, with optional bank sync through Enable Banking.

## Security

After first-time setup, app authentication is mandatory and cannot be disabled from Nexora settings.

- Android prefers fingerprint / face unlock and allows the device screen lock as fallback.
- iOS uses Face ID / Touch ID with iPhone passcode fallback through LocalAuthentication.
- The WebView is hidden immediately when the app leaves the foreground so personal and financial information is not left visible in the recent-apps snapshot.
- Returning from bank authorization requires authentication again before the bank sync result is shown.
- Android backups are disabled for the app.
- Enable Banking and Cloudflare secrets are never embedded in APK or IPA builds.

## Finance flow

Money is centered around bank sync rather than manual entry:

- Connect an Estonian bank through Enable Banking.
- Import balances and transactions.
- Automatically classify common transaction types such as salary, food, fuel, utilities, subscriptions, insurance and car costs.
- Salary detected from a bank transaction can populate monthly income when the user has not set one yet.
- Manual `Add expense/income` remains available for cash and missing transactions.
- Bills remain available as a dedicated recurring-payments view.
- Statistics show total income, spending, bills and car costs.

## Enable Banking for individual use

Enable Banking supports restricted Production applications linked to the developer's own bank accounts. This is suitable for individual non-commercial use and real-account evaluation without a company. A restricted application can only retrieve data from accounts linked to that application in the Enable Banking Control Panel. Supporting arbitrary public Nexora users later requires a production agreement with Enable Banking.

## Bank backend

`backend/` contains a Cloudflare Worker. It signs Enable Banking API requests server-side with the application's RSA private key and keeps the key outside the mobile builds.

GitHub repository secrets:

### Cloudflare
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `NEXORA_SESSION_SECRET`

### Enable Banking
- `ENABLEBANKING_APP_ID`
- `ENABLEBANKING_PRIVATE_KEY`

### Mobile builds
- `NEXORA_BANK_API_URL`

## Recommended setup order

### 1. Deploy an empty bank Worker first

Add these GitHub repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `NEXORA_SESSION_SECRET`

Run **Deploy Nexora Bank Backend** in GitHub Actions. The workflow can deploy before Enable Banking credentials exist.

Note the Worker base URL, for example:

`https://nexora-bank.<your-subdomain>.workers.dev`

The Enable Banking callback will be:

`https://nexora-bank.<your-subdomain>.workers.dev/bank/callback`

### 2. Create an Enable Banking account and Production API application

Sign in to Enable Banking Control Panel with your email. Create a **Production** API application and add the Worker callback URL above as an allowed redirect URL.

Let the browser generate the application's private key. Save the downloaded `.pem` file securely. The private key must not be committed to Git.

### 3. Activate restricted mode with your own account

In Enable Banking Control Panel choose **Activate by linking accounts** for the Production application and link your own bank account. The application becomes active in restricted mode.

### 4. Add Enable Banking credentials to GitHub

Add:

- `ENABLEBANKING_APP_ID` — the application ID / `kid`
- `ENABLEBANKING_PRIVATE_KEY` — paste the complete generated `-----BEGIN PRIVATE KEY----- ... -----END PRIVATE KEY-----` PEM content

Re-run **Deploy Nexora Bank Backend**.

Open:

`https://nexora-bank.<your-subdomain>.workers.dev/health`

It should return `"configured": true` and provider `"enable-banking"`.

### 5. Configure Android / iOS builds

Add GitHub secret:

- `NEXORA_BANK_API_URL` = the Worker base URL without `/health` or `/bank/callback`

Then run the Android or iOS build workflow.

## Android

Workflow: **Build Nexora APK**

Artifact: `Nexora-APK` → `Nexora.apk`

- package: `com.nexora.app`
- version: `1.6.0`
- version code: `11`

## iOS

Workflow: **Build Nexora iOS IPA**

Artifact: `Nexora-iOS-IPA` → `Nexora-unsigned.ipa`

The GitHub workflow builds an unsigned IPA. Apple requires the IPA to be signed before installation.

- bundle id: `com.nexora.app`
- version: `1.6.0`
- build: `11`

## Bank authorization flow

1. Nexora fetches personal-account banks available in Estonia from Enable Banking.
2. The user chooses a bank.
3. The Worker starts Enable Banking authorization and Nexora opens the bank authorization page.
4. Enable Banking redirects to the Worker callback with an authorization code.
5. The Worker exchanges the code for an Enable Banking session and returns a signed session handle to Nexora through `nexora://bank-connected`.
6. Nexora locks again and requires fingerprint / face / passcode authentication.
7. Only after successful unlock does Nexora request balances and transactions from the Worker.

No bank password is stored by Nexora.
