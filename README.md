# Nexora v1.8.3

Personal finance, planner and garage app for Android/iOS.

## v1.8.3 reliability + battery fixes

- **No synthetic bank income/expense.** Nexora no longer converts a balance delta into a guessed transaction.
- Older `bank-provisional` / `balance-delta:*` rows created by earlier builds are removed automatically during state migration.
- A temporary bank/API failure can no longer overwrite the last trustworthy account list or balances with empty/null data.
- Bank account balances keep the latest known good value if a sync returns a temporary missing balance.
- Failed syncs show a warning while the last good bank state remains visible.
- Successful account state is cached as `lastGoodAccounts` for resilience.
- Foreground 60-second polling was removed. Bank sync is now event-driven: unlock/resume and opening Money, plus manual sync.
- Android local reminder work is OS-batched every ~12 hours and only when battery is not low. It does **not** poll the bank.
- Cloudflare + FCM remains responsible for bank-activity push polling on the PSD2-safe server interval.
- Native notification config updates are deduplicated so normal UI/localStorage changes do not repeatedly wake native scheduling or FCM registration.
- iOS background fetch minimum changed from Apple's minimum interval to 6 hours; local notification schedules are rebuilt only when reminder-relevant settings actually change.
- Settings → Notifications now shows push diagnostics: phone registration, local FCM token state, registration time, last server bank poll, next poll and last push error.
- Test notification remains available.

## Versions

- Android: 1.8.3 (`versionCode 19`)
- iOS: 1.8.3 (`build 19`)

## Existing configuration retained

No existing secrets need to be recreated:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `ENABLEBANKING_APP_ID`
- `ENABLEBANKING_PRIVATE_KEY`
- `NEXORA_SESSION_SECRET`
- `NEXORA_BANK_API_URL`
- `FIREBASE_SERVICE_ACCOUNT_JSON`

`app/google-services.json` remains included.

## Update order

1. Replace repository files with this package.
2. Commit and push.
3. Run **Deploy Nexora Bank Backend** (push diagnostics endpoint changed).
4. Run **Build Nexora APK**.
5. Install/update Nexora.
6. Open Nexora once and unlock it.
7. Settings → Notifications: check the push status and use **Send test notification**.

A transient bank sync error should now leave the last good balances on screen and must never create a fake expense/income.
