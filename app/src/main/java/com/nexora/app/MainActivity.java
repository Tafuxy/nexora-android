package com.nexora.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.KeyguardManager;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.hardware.biometrics.BiometricManager;
import android.hardware.fingerprint.FingerprintManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.CancellationSignal;
import android.provider.Settings;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

import org.json.JSONObject;

import java.util.concurrent.Executor;

public class MainActivity extends Activity {
    private static final String PREFS = "nexora_security";
    private static final String PREF_BIOMETRIC = "biometric_enabled";
    private static final String PREF_SETUP_COMPLETE = "setup_complete";
    private static final int REQUEST_DEVICE_CREDENTIAL = 4102;

    private WebView webView;
    private FrameLayout root;
    private SharedPreferences prefs;
    private boolean pageReady = false;
    private boolean authPending = false;
    private boolean authenticationInProgress = false;
    private boolean authenticatedForForeground = false;
    private boolean bankReturnPending = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        setTheme(R.style.Theme_Nexora);
        super.onCreate(savedInstanceState);

        prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        configureSystemBars();
        setupContent();
        setupWebView();

        captureBankReturn(getIntent());
        if (isSetupComplete()) lockForPrivacy();

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            webView.loadUrl("file:///android_asset/www/index.html");
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (isSetupComplete() && !authenticatedForForeground && !authenticationInProgress) {
            authenticateForLaunch();
        }
    }

    @Override
    protected void onPause() {
        // Hide all personal and bank data before Android captures the recent-apps snapshot.
        if (isSetupComplete() && !authenticationInProgress) {
            authenticatedForForeground = false;
            lockForPrivacy();
        }
        super.onPause();
    }

    private boolean isSetupComplete() {
        return prefs.getBoolean(PREF_SETUP_COMPLETE, false);
    }

    private void configureSystemBars() {
        getWindow().setStatusBarColor(Color.rgb(9, 11, 15));
        getWindow().setNavigationBarColor(Color.rgb(9, 11, 15));
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            getWindow().getDecorView().setSystemUiVisibility(0);
        }
    }

    private void setupContent() {
        root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(9, 11, 15));
        root.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));

        root.setOnApplyWindowInsetsListener((view, insets) -> {
            int top;
            int bottom;
            int left;
            int right;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                android.graphics.Insets bars = insets.getInsets(WindowInsets.Type.systemBars());
                top = bars.top;
                bottom = bars.bottom;
                left = bars.left;
                right = bars.right;
            } else {
                top = insets.getSystemWindowInsetTop();
                bottom = insets.getSystemWindowInsetBottom();
                left = insets.getSystemWindowInsetLeft();
                right = insets.getSystemWindowInsetRight();
            }
            view.setPadding(left, top, right, bottom);
            return insets;
        });

        setContentView(root);
    }

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    private void setupWebView() {
        webView = new WebView(this);
        webView.setLayoutParams(new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
        ));
        webView.setBackgroundColor(Color.rgb(9, 11, 15));
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.addJavascriptInterface(new NativeBridge(), "NexoraNative");

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setTextZoom(100);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setSupportMultipleWindows(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.setSafeBrowsingEnabled(true);
        }

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String scheme = uri.getScheme();
                if (scheme != null && (
                        scheme.equals("http") || scheme.equals("https") ||
                        scheme.equals("mailto") || scheme.equals("tel") || scheme.equals("nexora")
                )) {
                    if (scheme.equals("nexora")) {
                        // The bank authorization browser redirects back here. The app remains locked
                        // until Android authentication succeeds again.
                        return true;
                    }
                    try {
                        startActivity(new Intent(Intent.ACTION_VIEW, uri));
                    } catch (ActivityNotFoundException ignored) {
                    }
                    return true;
                }
                return false;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                pageReady = true;
                emitNativeState();
            }
        });
        webView.setWebChromeClient(new WebChromeClient());
        root.addView(webView);
        root.requestApplyInsets();
    }

    private boolean isBiometricAvailableInternal() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            BiometricManager manager = (BiometricManager) getSystemService(Context.BIOMETRIC_SERVICE);
            return manager != null && manager.canAuthenticate() == BiometricManager.BIOMETRIC_SUCCESS;
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            FingerprintManager manager = (FingerprintManager) getSystemService(Context.FINGERPRINT_SERVICE);
            return manager != null && manager.isHardwareDetected() && manager.hasEnrolledFingerprints();
        }
        return false;
    }

    private boolean isDeviceSecure() {
        KeyguardManager km = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
        return km != null && km.isDeviceSecure();
    }

    private void lockForPrivacy() {
        authPending = true;
        if (webView != null) webView.setVisibility(View.INVISIBLE);
        emitNativeState();
    }

    private void authenticateForLaunch() {
        lockForPrivacy();
        authenticationInProgress = true;

        // Always prefer fingerprint / face unlock. Device PIN/pattern is only a fallback.
        if (isBiometricAvailableInternal()) {
            showBiometricPrompt();
        } else if (isDeviceSecure()) {
            showDeviceCredential();
        } else {
            authenticationInProgress = false;
            showSecurityRequired();
        }
    }

    private void showBiometricPrompt() {
        Executor executor = getMainExecutor();
        CancellationSignal cancellationSignal = new CancellationSignal();
        android.hardware.biometrics.BiometricPrompt.Builder builder =
                new android.hardware.biometrics.BiometricPrompt.Builder(this)
                        .setTitle("Nexora")
                        .setSubtitle("Unlock Nexora");

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && isDeviceSecure()) {
            builder.setDeviceCredentialAllowed(true);
        } else {
            builder.setNegativeButton(
                    isDeviceSecure() ? "Use phone unlock" : "Cancel",
                    executor,
                    (DialogInterface dialog, int which) -> {
                        if (isDeviceSecure()) showDeviceCredential();
                        else lockAndClose();
                    }
            );
        }

        android.hardware.biometrics.BiometricPrompt prompt = builder.build();
        prompt.authenticate(cancellationSignal, executor, new android.hardware.biometrics.BiometricPrompt.AuthenticationCallback() {
            @Override
            public void onAuthenticationSucceeded(android.hardware.biometrics.BiometricPrompt.AuthenticationResult result) {
                super.onAuthenticationSucceeded(result);
                finishLaunchAuthentication();
            }

            @Override
            public void onAuthenticationError(int errorCode, CharSequence errString) {
                super.onAuthenticationError(errorCode, errString);
                if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q && isDeviceSecure()) {
                    showDeviceCredential();
                } else {
                    lockAndClose();
                }
            }
        });
    }

    private void showDeviceCredential() {
        KeyguardManager km = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
        if (km == null || !km.isDeviceSecure()) {
            authenticationInProgress = false;
            showSecurityRequired();
            return;
        }
        Intent intent = km.createConfirmDeviceCredentialIntent("Nexora", "Unlock Nexora");
        if (intent != null) {
            startActivityForResult(intent, REQUEST_DEVICE_CREDENTIAL);
        } else {
            authenticationInProgress = false;
            showSecurityRequired();
        }
    }

    private void showSecurityRequired() {
        lockForPrivacy();
        Toast.makeText(this, "Set up fingerprint, face unlock or a phone screen lock to use Nexora.", Toast.LENGTH_LONG).show();
        try {
            Intent intent = new Intent(Settings.ACTION_SECURITY_SETTINGS);
            startActivity(intent);
        } catch (Exception ignored) {
            finishAndRemoveTask();
        }
    }

    private void finishLaunchAuthentication() {
        authenticationInProgress = false;
        authenticatedForForeground = true;
        authPending = false;
        prefs.edit().putBoolean(PREF_BIOMETRIC, isBiometricAvailableInternal()).apply();
        if (webView != null) webView.setVisibility(View.VISIBLE);
        emitNativeState();
        if (bankReturnPending) {
            bankReturnPending = false;
            evaluate("window.NexoraApp && window.NexoraApp.onBankReturn && window.NexoraApp.onBankReturn();");
        }
    }

    private void lockAndClose() {
        authenticationInProgress = false;
        authenticatedForForeground = false;
        lockForPrivacy();
        finishAndRemoveTask();
    }

    private void emitNativeState() {
        if (!pageReady || webView == null) return;
        JSONObject state = new JSONObject();
        try {
            state.put("authPending", authPending);
            state.put("biometricAvailable", isBiometricAvailableInternal());
            state.put("biometricEnabled", isBiometricAvailableInternal());
            state.put("requireAuth", true);
            state.put("setupComplete", isSetupComplete());
            state.put("deviceSecure", isDeviceSecure());
        } catch (Exception ignored) {
        }
        evaluate("window.NexoraApp && window.NexoraApp.onNativeState(" + state + ");");
    }

    private void evaluate(String script) {
        runOnUiThread(() -> {
            if (webView != null && pageReady) webView.evaluateJavascript(script, null);
        });
    }

    public class NativeBridge {
        @JavascriptInterface
        public boolean isBiometricAvailable() {
            return isBiometricAvailableInternal();
        }

        @JavascriptInterface
        public boolean isBiometricEnabled() {
            return isBiometricAvailableInternal();
        }

        @JavascriptInterface
        public boolean isAuthRequired() {
            return true;
        }

        @JavascriptInterface
        public boolean isDeviceSecure() {
            return MainActivity.this.isDeviceSecure();
        }

        // Kept for compatibility with older bundled UI. Security cannot be disabled.
        @JavascriptInterface
        public void enableBiometric() {
            prefs.edit().putBoolean(PREF_BIOMETRIC, isBiometricAvailableInternal()).apply();
            emitNativeState();
        }

        @JavascriptInterface
        public void disableBiometric() {
            emitNativeState();
        }

        @JavascriptInterface
        public void setRequireAuth(boolean enabled) {
            emitNativeState();
        }

        @JavascriptInterface
        public void setSetupComplete(boolean complete) {
            prefs.edit().putBoolean(PREF_SETUP_COMPLETE, complete).apply();
            if (!complete) {
                authenticatedForForeground = false;
                authPending = false;
                if (webView != null) webView.setVisibility(View.VISIBLE);
            }
            emitNativeState();
        }
    }


    private void captureBankReturn(Intent intent) {
        if (intent == null) return;
        Uri data = intent.getData();
        if (data != null && "nexora".equalsIgnoreCase(data.getScheme()) && "bank-connected".equalsIgnoreCase(data.getHost())) {
            bankReturnPending = true;
            authenticatedForForeground = false;
            lockForPrivacy();
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        captureBankReturn(intent);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQUEST_DEVICE_CREDENTIAL) {
            if (resultCode == RESULT_OK) finishLaunchAuthentication();
            else lockAndClose();
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        if (webView != null) webView.saveState(outState);
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            root.removeView(webView);
            webView.removeJavascriptInterface("NexoraNative");
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
