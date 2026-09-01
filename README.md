# Nexora 1.8.0 — Android FCM push + bank sync

This package adds server-triggered Android push notifications through Firebase Cloud Messaging (FCM), while keeping Nexora's existing Enable Banking + Cloudflare architecture.

## Important bank limitation

Enable Banking documents that many ASPSPs limit genuine background account-information fetches to roughly four requests per day. Nexora therefore **does not fake PSU headers and does not poll the bank every minute**. The Cloudflare Worker checks in the background on a six-hour schedule. When the user is actively using/unlocking Nexora, normal app sync remains immediate.

FCM delivery itself is immediate once the Worker has discovered a new transaction.

## One-time Firebase setup

1. Create a Firebase project named Nexora.
2. Add an Android app with package `com.nexora.app`.
3. Download `google-services.json` and put it at `app/google-services.json` before committing, **or** store its complete JSON as GitHub repository secret `FIREBASE_GOOGLE_SERVICES_JSON`.
4. In Firebase Project settings → Service accounts, generate a private key JSON file. Keep it private. Store the **complete JSON content** as GitHub repository secret `FIREBASE_SERVICE_ACCOUNT_JSON`.
5. Push the repository files.
6. GitHub Actions → `Deploy Nexora Bank Backend` → Run workflow.
7. Check `https://nexora-bank.stennapsep253.workers.dev/health`. `push_configured` should be `true`.
8. GitHub Actions → `Build Nexora APK` → Run workflow and install the generated APK.
9. Open Nexora, unlock it and allow notifications. Nexora uploads its Firebase Installation ID (FID) to the Worker together with the existing signed bank connection handle.

## Existing secrets still required

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `ENABLEBANKING_APP_ID`
- `ENABLEBANKING_PRIVATE_KEY`
- `NEXORA_SESSION_SECRET`
- `NEXORA_BANK_API_URL`

New secret:

- `FIREBASE_SERVICE_ACCOUNT_JSON`

Optional alternative to committing the non-secret Firebase Android config:

- `FIREBASE_GOOGLE_SERVICES_JSON`

## Security

- Firebase service-account credentials stay in Cloudflare/GitHub secrets and are never bundled into the APK.
- The Android app registers a Firebase Installation ID (FID), not a Firebase service credential.
- Bank handles remain signed by `NEXORA_SESSION_SECRET`.
- FCM notifications respect Nexora's lock-screen privacy setting.
- Nexora remains biometric/device-lock protected before financial data is shown.
