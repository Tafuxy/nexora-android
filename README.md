# Nexora Android 1.1.0

Public-ready Android build of Nexora.

## Included
- Nexora branded launcher icon and splash screen
- Nexora wordmark inside Settings
- Estonian and English language selection
- Empty first launch: no demo tasks, money or vehicles
- Android system-bar inset handling so content stays below status/navigation bars
- Local-only data storage inside Android WebView
- Android backup disabled for local personal finance/garage data
- No AndroidX/Kotlin runtime dependencies (prevents Kotlin duplicate-class build failures)

## Build APK on GitHub
1. Upload/replace the repository files with this package.
2. Commit and push to `main`.
3. GitHub → Actions → **Build Nexora APK** → **Run workflow**.
4. Open the successful run and download **Nexora-APK** from Artifacts.
5. Extract the ZIP and install `Nexora.apk`.

Version: 1.1.0 (versionCode 4)
