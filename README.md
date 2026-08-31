# Nexora Android

Nexora combines Planner, Money and Garage into one mobile app.

## First launch

The app opens a four-step setup:
1. Name, language and appearance
2. Monthly budget and savings
3. Optional vehicle setup
4. Focus areas and app lock

No online account is required. Planner, Money and Garage data are stored locally on the phone.

## Security

Nexora can lock on launch using Android's built-in authentication:
- fingerprint or face unlock where available
- device screen lock/PIN as fallback when supported

The app never receives or stores fingerprint data. Android handles biometric verification.

## Build

The repository includes `.github/workflows/build-apk.yml`.

Push to `main`, or open GitHub Actions and run **Build Nexora APK** manually. The finished artifact is named `Nexora-APK` and contains `Nexora.apk`.

No Google OAuth configuration, client ID or repository secret is required.

## Version

- Version name: 1.3.0
- Version code: 6
- Package: `com.nexora.app`
