# Nexora V10

Nexora V10 is a long-term reliability and usability release for the Android and iOS personal finance, planning and vehicle app.

## V10 highlights
- Bank sync keeps the last trustworthy balance when a bank temporarily returns missing or partial account data.
- Partial account lists no longer make the total balance suddenly drop; temporarily missing accounts are marked as using their last saved state.
- Transfers between the user's own bank accounts are excluded from income and expense statistics.
- Bank transaction category and internal-transfer status can be corrected manually and those corrections survive later syncs.
- Fuel-station spending is shown under one user-facing category: **Tankla** (English: **Petrol station**).
- Category rows are interactive. The Tankla detail view ranks station chains by current-month spend and shows total, transaction count, share and average purchase.
- Tank-station recognition includes common Estonian chains and fuel MCC 5541/5542.
- Completed one-off tasks leave the active planner and move to a dated completion history with completion time.
- Daily, weekly and monthly recurring tasks create a history entry and automatically advance to the next useful occurrence.
- Tasks can have reminders. Android uses local alarms and restores them after reboot; iOS schedules local notifications.
- Local app state keeps a previous valid snapshot so a damaged primary localStorage payload does not force the app to start empty.
- Disconnecting a bank also removes its server-side push registration when possible.
- Android and iOS versioning is unified at **10.0.0** / build **26**.

## Bank backend
The Cloudflare Worker in `backend/` must be deployed when `backend/src.js` changes. Required secrets and routes are documented in `backend/README.md`.

## Android build
The GitHub Actions workflow `.github/workflows/build-apk.yml` builds the Android APK.

## iOS build
The GitHub Actions workflow `.github/workflows/build-ios.yml` syncs the shared web UI into the iOS bundle, generates the Xcode project with XcodeGen and builds an unsigned IPA.

## Release
Version: **10.0.0**  
Android versionCode / iOS build: **26**
