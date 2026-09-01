# Nexora v1.8.9 — Bank Sync Reliability Fix

This release fixes the intermittent €0 / missing balance problem.

## Fixed
- Missing/null balance values from Enable Banking are no longer coerced to `0`.
- If a balance request fails temporarily, Nexora keeps the last trustworthy balance.
- The total bank balance no longer displays a fake `0 €` when the provider returned no balance data.
- Foreground/user-triggered account details, balances and transactions now all forward PSU headers consistently.
- Bank/API rate-limit errors no longer silently replace a good balance; a friendly warning is shown instead.
- Automatic foreground bank refresh is capped to once per 5 minutes to reduce repeated bank requests and battery/network use. Manual Sync still works immediately.
- Balance parsing accepts both current snake_case and alternate camelCase Enable Banking balance field names.
- Android versionCode is 25, so it installs over v1.8.8/versionCode 24 without uninstalling.

## Deploy
Because `backend/src.js` changed, deploy the bank backend and then build the APK.
