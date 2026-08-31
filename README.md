# Nexora 1.5.1

Nexora combines Planner, Money, Bills and Garage in one mobile app, with optional Open Banking sync.

## Security

After first-time setup, app authentication is mandatory and cannot be disabled from Nexora settings.

- Android prefers fingerprint / face unlock and allows the device screen lock as fallback.
- iOS uses Face ID / Touch ID with iPhone passcode fallback through LocalAuthentication.
- The WebView is hidden immediately when the app leaves the foreground so personal and financial information is not left visible in the recent-apps snapshot.
- Returning from bank authorization requires authentication again before the bank sync result is shown.
- Android backups are disabled for the app.
- GoCardless/Cloudflare API secrets are never embedded in APK or IPA builds.

## Finance flow

Money is centered around bank sync rather than manual entry:

- Connect an Estonian bank through the bank provider.
- Import balances and transactions.
- Automatically classify common transaction types such as salary, food, fuel, utilities, subscriptions, insurance and car costs.
- Salary detected from a bank transaction can populate monthly income when the user has not set one yet.
- Manual `Add expense/income` remains available for cash and missing transactions.
- Bills remain available as a dedicated recurring-payments view.
- Statistics show total income, spending, bills and car costs.

## Bank backend

`backend/` contains a Cloudflare Worker for GoCardless Bank Account Data. The Worker keeps provider secrets outside the mobile builds.

Required GitHub repository secrets for deploying the Worker:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `GOCARDLESS_SECRET_ID`
- `GOCARDLESS_SECRET_KEY`
- `NEXORA_SESSION_SECRET`

Run **Deploy Nexora Bank Backend** in GitHub Actions. After Cloudflare returns the Worker URL, add it as:

- `NEXORA_BANK_API_URL`

Then Android and iOS build workflows inject only the public Worker URL into the app. The banking provider keys remain server-side.

## Android

Workflow: **Build Nexora APK**

Artifact: `Nexora-APK` → `Nexora.apk`

- package: `com.nexora.app`
- version: `1.5.1`
- version code: `9`

## iOS

Workflow: **Build Nexora iOS IPA**

Artifact: `Nexora-iOS-IPA` → `Nexora-unsigned.ipa`

The GitHub workflow builds an unsigned IPA. Apple still requires the IPA to be signed before installation, e.g. with an Apple Developer signing setup or a sideloading tool.

- bundle id: `com.nexora.app`
- version: `1.5.1`
- build: `9`

## First launch

The initial setup asks for:

1. Name, language and appearance
2. Monthly income, monthly spending limit and savings
3. Optional vehicle details
4. Focus areas and security information

A phone screen lock / biometric security must be configured before setup can be completed.
