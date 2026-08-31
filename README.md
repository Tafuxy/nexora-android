# Nexora 1.7.0

Nexora combines Planner, Money, Bills and Garage with Enable Banking account sync, mandatory device authentication and native reminders.

## What changed in 1.7.0

- Bank account cards prefer the exact bank-provided account nickname/description (for example `PEAMINE-KONTO` or `Estland Development`) and show the account type separately.
- Money values tween smoothly when balances, income or spending change.
- Bank sync remains automatic after unlock, when opening Money and while Money is active.
- Android background bank checks run periodically even when Nexora is not open and can notify about new incoming/outgoing transactions.
- iOS uses Background Fetch for best-effort bank checks when the app is not open.
- Native reminders for monthly bills, spending-limit thresholds, vehicle service mileage, insurance and inspection dates.
- Notification settings allow incoming money, outgoing money, bills, vehicles and spending-limit alerts to be toggled independently.
- Lock-screen privacy defaults to hiding bank amounts/details. Full details are opt-in in Nexora Settings.
- `/privacy` and `/terms` remain available from the Cloudflare Worker.

## Existing GitHub secrets

Keep the same secrets you already configured:

- `ENABLEBANKING_APP_ID`
- `ENABLEBANKING_PRIVATE_KEY`
- `NEXORA_SESSION_SECRET`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `NEXORA_BANK_API_URL`

No new API account or secret is required for 1.7.0.

## Update order

1. Replace the repository files with this package and push to `main`.
2. Run **Deploy Nexora Bank Backend** once so the latest Worker/legal endpoints are deployed.
3. Build **Nexora APK** and/or **Nexora iOS IPA**.
4. Install the new build over the existing Nexora app.
5. On first launch after updating, allow notifications when Android/iOS asks.

## Notification behavior

### Android

Android uses the platform JobScheduler. The bank is checked in the background on an OS-managed schedule with a target interval of about 15 minutes. Android can delay jobs to save battery. Opening Nexora still triggers the normal immediate sync.

### iOS

iOS uses Background Fetch and local notifications. Apple decides when background refresh is allowed, so bank-activity notifications are best-effort and may not be immediate. Bill and dated vehicle reminders are scheduled locally and do not require Nexora to be open at the due time.

For true real-time iOS banking push later, APNs server-side push can be added when Nexora has an Apple Developer production setup.

## Security

- Nexora still requires fingerprint/face/device credential every time protected app content is reopened.
- iOS uses Face ID / Touch ID / passcode.
- Bank details remain hidden in the recent-apps/app-switcher snapshot.
- Bank API private keys stay only in Cloudflare/GitHub secrets, never inside the APK/IPA.
