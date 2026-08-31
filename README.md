# Nexora Android 1.2.0

Nexora combines a daily planner, personal money tracking and a vehicle garage in one Android app.

## What changed in 1.2.0

- Google-first account entry flow using Android Credential Manager
- biometric unlock on supported Android devices
- authentication required on launch by default
- four-step first-use setup for language/theme, budget/savings, vehicle and focus areas
- account and security controls in Settings
- Estonian and English UI
- no sample transactions, fake balances, fake vehicles or sample tasks
- Nexora icon, splash branding and wordmark integrated throughout the app
- Android system-bar insets retained for Android 15
- fixed, repository-provided debug signing key so the debug SHA-1 stays stable between GitHub Actions builds
- Credential Manager dependencies pinned to compatible versions and legacy Kotlin jdk7/jdk8 artifacts excluded to prevent duplicate-class builds

## Google sign-in setup

Google requires your own Google Auth Platform project before Sign in with Google can work in a distributed Android app.

Create both OAuth clients in the same Google Cloud project:

1. **Android OAuth client**
   - Package name: `com.nexora.app`
   - Debug SHA-1: `9E:43:AD:07:81:1E:99:8A:9C:BA:97:D9:C9:BF:D3:B6:70:06:59:CB`

2. **Web application OAuth client**
   - Copy its client ID.
   - In GitHub open the Nexora repository → **Settings → Secrets and variables → Actions → New repository secret**.
   - Name: `GOOGLE_WEB_CLIENT_ID`
   - Value: the Web application OAuth client ID.

The GitHub workflow injects that ID into the APK at build time. The OAuth client ID itself is not a password, but keeping environment-specific configuration out of source keeps the repository cleaner.

For a Play Store release, use a private release signing key and add its SHA-1/SHA-256 as an additional Android OAuth client. Do not use the included debug key as the production signing key.

## Build APK

GitHub → Actions → **Build Nexora APK** → **Run workflow**.

After a successful build, download the `Nexora-APK` artifact and extract `Nexora.apk`.

## Authentication model

- First use: user signs in with Google, then completes Nexora setup.
- Returning user with biometrics enabled: biometric/device authentication appears before the app is shown.
- Returning user without biometrics: Nexora asks for Google confirmation before opening.
- The Google ID token is not stored in WebView/localStorage.
- Only basic local account metadata (name, email and profile image URL) is retained for the local signed-in experience.

### Cloud sync note

Version 1.2.0 establishes the account, onboarding and local security flow. Planner, Money and Garage data still live locally on the phone. Before cross-device sync is enabled, Nexora needs a backend that validates Google ID tokens server-side and stores each user's data under their verified account ID. The client is intentionally not treating an unverified local ID token as cloud authorization.

## Data and privacy

- Android app backup is disabled.
- Clear Data keeps the Google account/session settings but removes local Planner, Money and Garage content.
- Signing out removes the local Nexora account link.
- The app does not contain sample financial data.
