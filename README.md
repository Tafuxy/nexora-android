# Nexora Android

Installable Android wrapper for the Nexora Planner + Money + Garage app.

## Fastest way to get the APK

1. Create a new GitHub repository.
2. Upload **all files and folders from this project** to the repository root.
3. Open the repository's **Actions** tab.
4. Open **Build Nexora APK**.
5. If the workflow did not already run after your push, choose **Run workflow**.
6. When the run is green, open it and download the artifact named **Nexora-APK**.
7. Unzip the artifact and install `Nexora.apk` on Android.

Android may ask you to allow installation from your browser/files app the first time.

## Notes

- Package ID: `com.nexora.app`
- Version: `0.1.0`
- Minimum Android: Android 8.0 (API 26)
- App data currently lives locally in the Android WebView/localStorage.
- The current APK does not yet include Nexora cloud accounts/sync.
- The GitHub Action builds a debug-signed APK, which is directly installable for testing.
