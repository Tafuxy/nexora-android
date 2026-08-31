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

import org.json.JSONObject;

import java.util.concurrent.Executor;

public class MainActivity extends Activity {
    private static final String PREFS = "nexora_security";
    private static final String PREF_BIOMETRIC = "biometric_enabled";
    private static final String PREF_REQUIRE_AUTH = "require_auth";
    private static final String PREF_SETUP_COMPLETE = "setup_complete";
    private static final int REQUEST_DEVICE_CREDENTIAL = 4102;

    private WebView webView;
    private FrameLayout root;
    private SharedPreferences prefs;
    private boolean pageReady = false;
    private boolean launchAuthPending = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        setTheme(R.style.Theme_Nexora);
        super.onCreate(savedInstanceState);

        prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        configureSystemBars();
        setupContent();
        setupWebView();

        if (shouldAuthenticateOnLaunch()) {
            launchAuthPending = true;
            webView.setVisibility(View.INVISIBLE);
            authenticateForLaunch();
        }

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            webView.loadUrl("file:///android_asset/www/index.html");
        }
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
                        scheme.equals("mailto") || scheme.equals("tel")
                )) {
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

    private boolean shouldAuthenticateOnLaunch() {
        return prefs.getBoolean(PREF_SETUP_COMPLETE, false)
                && prefs.getBoolean(PREF_REQUIRE_AUTH, true);
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

    private void authenticateForLaunch() {
        boolean preferBiometric = prefs.getBoolean(PREF_BIOMETRIC, false);
        if (preferBiometric && isBiometricAvailableInternal()) {
            showBiometricPrompt(true);
        } else if (isDeviceSecure()) {
            showDeviceCredential();
        } else {
            finishLaunchAuthentication();
        }
    }

    private void showBiometricPrompt(boolean launchUnlock) {
        Executor executor = getMainExecutor();
        CancellationSignal cancellationSignal = new CancellationSignal();
        android.hardware.biometrics.BiometricPrompt.Builder builder =
                new android.hardware.biometrics.BiometricPrompt.Builder(this)
                        .setTitle("Nexora")
                        .setSubtitle("Unlock Nexora");

        if (launchUnlock && Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && isDeviceSecure()) {
            builder.setDeviceCredentialAllowed(true);
        } else {
            builder.setNegativeButton(
                    launchUnlock && isDeviceSecure() ? "Use phone unlock" : "Cancel",
                    executor,
                    (DialogInterface dialog, int which) -> {
                        if (launchUnlock && isDeviceSecure()) {
                            showDeviceCredential();
                        } else if (!launchUnlock) {
                            emitBiometricResult(false, "cancelled");
                        } else {
                            finishAndRemoveTask();
                        }
                    }
            );
        }

        android.hardware.biometrics.BiometricPrompt prompt = builder.build();
        prompt.authenticate(cancellationSignal, executor, new android.hardware.biometrics.BiometricPrompt.AuthenticationCallback() {
            @Override
            public void onAuthenticationSucceeded(android.hardware.biometrics.BiometricPrompt.AuthenticationResult result) {
                super.onAuthenticationSucceeded(result);
                if (launchUnlock) {
                    finishLaunchAuthentication();
                } else {
                    prefs.edit().putBoolean(PREF_BIOMETRIC, true).apply();
                    emitBiometricResult(true, "enabled");
                    emitNativeState();
                }
            }

            @Override
            public void onAuthenticationError(int errorCode, CharSequence errString) {
                super.onAuthenticationError(errorCode, errString);
                if (launchUnlock) {
                    if (isDeviceSecure() && Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
                        showDeviceCredential();
                    } else {
                        finishAndRemoveTask();
                    }
                } else {
                    emitBiometricResult(false, "cancelled");
                }
            }
        });
    }

    private void showDeviceCredential() {
        KeyguardManager km = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
        if (km == null || !km.isDeviceSecure()) {
            finishLaunchAuthentication();
            return;
        }
        Intent intent = km.createConfirmDeviceCredentialIntent("Nexora", "Unlock Nexora");
        if (intent != null) {
            startActivityForResult(intent, REQUEST_DEVICE_CREDENTIAL);
        } else {
            finishLaunchAuthentication();
        }
    }

    private void finishLaunchAuthentication() {
        launchAuthPending = false;
        if (webView != null) webView.setVisibility(View.VISIBLE);
        emitNativeState();
    }

    private void emitNativeState() {
        if (!pageReady || webView == null) return;
        JSONObject state = new JSONObject();
        try {
            state.put("authPending", launchAuthPending);
            state.put("biometricAvailable", isBiometricAvailableInternal());
            state.put("biometricEnabled", prefs.getBoolean(PREF_BIOMETRIC, false));
            state.put("requireAuth", prefs.getBoolean(PREF_REQUIRE_AUTH, true));
            state.put("setupComplete", prefs.getBoolean(PREF_SETUP_COMPLETE, false));
            state.put("deviceSecure", isDeviceSecure());
        } catch (Exception ignored) {
        }
        evaluate("window.NexoraApp && window.NexoraApp.onNativeState(" + state + ");");
    }

    private void emitBiometricResult(boolean enabled, String status) {
        JSONObject result = new JSONObject();
        try {
            result.put("enabled", enabled);
            result.put("status", status);
        } catch (Exception ignored) {
        }
        evaluate("window.NexoraApp && window.NexoraApp.onBiometricResult(" + result + ");");
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
            return prefs.getBoolean(PREF_BIOMETRIC, false);
        }

        @JavascriptInterface
        public boolean isAuthRequired() {
            return prefs.getBoolean(PREF_REQUIRE_AUTH, true);
        }

        @JavascriptInterface
        public void enableBiometric() {
            runOnUiThread(() -> {
                if (isBiometricAvailableInternal()) showBiometricPrompt(false);
                else emitBiometricResult(false, "unavailable");
            });
        }

        @JavascriptInterface
        public void disableBiometric() {
            prefs.edit().putBoolean(PREF_BIOMETRIC, false).apply();
            emitBiometricResult(false, "disabled");
            emitNativeState();
        }

        @JavascriptInterface
        public void setRequireAuth(boolean enabled) {
            prefs.edit().putBoolean(PREF_REQUIRE_AUTH, enabled).apply();
            emitNativeState();
        }

        @JavascriptInterface
        public void setSetupComplete(boolean complete) {
            prefs.edit().putBoolean(PREF_SETUP_COMPLETE, complete).apply();
            emitNativeState();
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQUEST_DEVICE_CREDENTIAL) {
            if (resultCode == RESULT_OK) finishLaunchAuthentication();
            else finishAndRemoveTask();
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
