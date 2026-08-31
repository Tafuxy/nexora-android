package com.nexora.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.hardware.biometrics.BiometricManager;
import android.hardware.fingerprint.FingerprintManager;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.CancellationSignal;
import android.util.Base64;
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

import androidx.credentials.Credential;
import androidx.credentials.CredentialManager;
import androidx.credentials.CredentialManagerCallback;
import androidx.credentials.CustomCredential;
import androidx.credentials.GetCredentialRequest;
import androidx.credentials.GetCredentialResponse;
import androidx.credentials.exceptions.GetCredentialException;

import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption;
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential;
import com.google.android.libraries.identity.googleid.GoogleIdTokenParsingException;

import org.json.JSONObject;

import java.security.SecureRandom;
import java.util.concurrent.Executor;

public class MainActivity extends Activity {
    private static final String PREFS = "nexora_security";
    private static final String PREF_BIOMETRIC = "biometric_enabled";
    private static final String PREF_REQUIRE_AUTH = "require_auth";
    private static final String PREF_ACCOUNT_EMAIL = "account_email";
    private static final String PREF_ACCOUNT_NAME = "account_name";
    private static final String PREF_ACCOUNT_ID = "account_id";
    private static final String PREF_ACCOUNT_PHOTO = "account_photo";

    private WebView webView;
    private FrameLayout root;
    private SharedPreferences prefs;
    private CredentialManager credentialManager;
    private final SecureRandom secureRandom = new SecureRandom();
    private boolean pageReady = false;
    private String launchAuthMode = "none";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        setTheme(R.style.Theme_Nexora);
        super.onCreate(savedInstanceState);

        prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        credentialManager = CredentialManager.create(this);

        configureSystemBars();
        setupContent();
        setupWebView();
        prepareLaunchAuthentication();

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
        settings.setMediaPlaybackRequiresUserGesture(false);
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
                emitStoredGoogleAccount();
            }
        });
        webView.setWebChromeClient(new WebChromeClient());

        root.addView(webView);
        root.requestApplyInsets();
    }

    private void prepareLaunchAuthentication() {
        boolean requireAuth = prefs.getBoolean(PREF_REQUIRE_AUTH, true);
        boolean biometricEnabled = prefs.getBoolean(PREF_BIOMETRIC, false);

        if (!requireAuth) {
            launchAuthMode = "none";
            return;
        }

        if (biometricEnabled && isBiometricAvailableInternal()) {
            launchAuthMode = "pending";
            webView.setVisibility(View.INVISIBLE);
            authenticateBiometric(true);
        } else {
            launchAuthMode = "google_required";
        }
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

    private void authenticateBiometric(boolean launchUnlock) {
        if (!isBiometricAvailableInternal()) {
            if (launchUnlock) {
                launchAuthMode = "google_required";
                webView.setVisibility(View.VISIBLE);
                emitNativeState();
            } else {
                emitBiometricResult(false, "unavailable");
            }
            return;
        }

        Executor executor = getMainExecutor();
        CancellationSignal cancellationSignal = new CancellationSignal();
        android.hardware.biometrics.BiometricPrompt.Builder builder =
                new android.hardware.biometrics.BiometricPrompt.Builder(this)
                        .setTitle("Nexora")
                        .setSubtitle("Unlock your personal dashboard");

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            builder.setDeviceCredentialAllowed(true);
        } else {
            builder.setNegativeButton("Use Google", executor, (DialogInterface dialog, int which) -> {
                if (launchUnlock) {
                    launchAuthMode = "google_required";
                    webView.setVisibility(View.VISIBLE);
                    emitNativeState();
                } else {
                    emitBiometricResult(false, "cancelled");
                }
            });
        }

        android.hardware.biometrics.BiometricPrompt prompt = builder.build();
        prompt.authenticate(cancellationSignal, executor, new android.hardware.biometrics.BiometricPrompt.AuthenticationCallback() {
            @Override
            public void onAuthenticationSucceeded(android.hardware.biometrics.BiometricPrompt.AuthenticationResult result) {
                super.onAuthenticationSucceeded(result);
                if (launchUnlock) {
                    launchAuthMode = "authenticated";
                    webView.setVisibility(View.VISIBLE);
                    emitNativeState();
                } else {
                    prefs.edit().putBoolean(PREF_BIOMETRIC, true).apply();
                    emitBiometricResult(true, "enabled");
                }
            }

            @Override
            public void onAuthenticationError(int errorCode, CharSequence errString) {
                super.onAuthenticationError(errorCode, errString);
                if (launchUnlock) {
                    launchAuthMode = "google_required";
                    webView.setVisibility(View.VISIBLE);
                    emitNativeState();
                } else {
                    emitBiometricResult(false, "cancelled");
                }
            }
        });
    }

    private void startGoogleSignInInternal() {
        if (BuildConfig.GOOGLE_WEB_CLIENT_ID == null || BuildConfig.GOOGLE_WEB_CLIENT_ID.trim().isEmpty()) {
            emitGoogleError("configuration");
            return;
        }

        String nonce = generateNonce();
        GetSignInWithGoogleOption option = new GetSignInWithGoogleOption.Builder(BuildConfig.GOOGLE_WEB_CLIENT_ID)
                .setNonce(nonce)
                .build();

        GetCredentialRequest request = new GetCredentialRequest.Builder()
                .addCredentialOption(option)
                .build();

        credentialManager.getCredentialAsync(
                this,
                request,
                null,
                getMainExecutor(),
                new CredentialManagerCallback<GetCredentialResponse, GetCredentialException>() {
                    @Override
                    public void onResult(GetCredentialResponse result) {
                        handleGoogleCredential(result);
                    }

                    @Override
                    public void onError(GetCredentialException e) {
                        emitGoogleError("cancelled");
                    }
                }
        );
    }

    private void handleGoogleCredential(GetCredentialResponse response) {
        Credential credential = response.getCredential();
        if (!(credential instanceof CustomCredential)) {
            emitGoogleError("unsupported");
            return;
        }

        CustomCredential customCredential = (CustomCredential) credential;
        if (!GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL.equals(customCredential.getType())) {
            emitGoogleError("unsupported");
            return;
        }

        try {
            GoogleIdTokenCredential google = GoogleIdTokenCredential.createFrom(customCredential.getData());
            String email = google.getEmail();
            String name = google.getDisplayName() == null ? "" : google.getDisplayName();
            String photo = google.getProfilePictureUri() == null ? "" : google.getProfilePictureUri().toString();

            // The Google ID token should be verified by Nexora's backend before
            // it is used for cloud authorization. The local app stores only
            // non-sensitive profile metadata; the token is never persisted.
            String stableId = google.getUniqueId();

            prefs.edit()
                    .putString(PREF_ACCOUNT_EMAIL, email)
                    .putString(PREF_ACCOUNT_NAME, name)
                    .putString(PREF_ACCOUNT_ID, stableId)
                    .putString(PREF_ACCOUNT_PHOTO, photo)
                    .apply();

            launchAuthMode = "authenticated";
            emitGoogleAccount(email, name, stableId, photo);
            emitNativeState();
        } catch (GoogleIdTokenParsingException e) {
            emitGoogleError("invalid_response");
        }
    }


    private String generateNonce() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.encodeToString(bytes, Base64.NO_WRAP | Base64.URL_SAFE | Base64.NO_PADDING);
    }

    private void emitNativeState() {
        if (!pageReady || webView == null) return;
        JSONObject state = new JSONObject();
        try {
            state.put("launchAuthMode", launchAuthMode);
            state.put("biometricAvailable", isBiometricAvailableInternal());
            state.put("biometricEnabled", prefs.getBoolean(PREF_BIOMETRIC, false));
            state.put("requireAuth", prefs.getBoolean(PREF_REQUIRE_AUTH, true));
            state.put("googleConfigured", BuildConfig.GOOGLE_WEB_CLIENT_ID != null && !BuildConfig.GOOGLE_WEB_CLIENT_ID.trim().isEmpty());
        } catch (Exception ignored) {
        }
        evaluate("window.NexoraApp && window.NexoraApp.onNativeState(" + state + ");");
    }

    private void emitStoredGoogleAccount() {
        if (!pageReady) return;
        String email = prefs.getString(PREF_ACCOUNT_EMAIL, "");
        if (email == null || email.isEmpty()) return;
        emitGoogleAccount(
                email,
                prefs.getString(PREF_ACCOUNT_NAME, ""),
                prefs.getString(PREF_ACCOUNT_ID, ""),
                prefs.getString(PREF_ACCOUNT_PHOTO, "")
        );
    }

    private void emitGoogleAccount(String email, String name, String id, String photo) {
        JSONObject account = new JSONObject();
        try {
            account.put("provider", "google");
            account.put("email", email == null ? "" : email);
            account.put("name", name == null ? "" : name);
            account.put("id", id == null ? "" : id);
            account.put("photo", photo == null ? "" : photo);
        } catch (Exception ignored) {
        }
        evaluate("window.NexoraApp && window.NexoraApp.onGoogleAccount(" + account + ");");
    }

    private void emitGoogleError(String code) {
        evaluate("window.NexoraApp && window.NexoraApp.onGoogleSignInError(" + JSONObject.quote(code) + ");");
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
            if (webView != null && pageReady) {
                webView.evaluateJavascript(script, null);
            }
        });
    }

    private void signOutInternal() {
        prefs.edit()
                .remove(PREF_ACCOUNT_EMAIL)
                .remove(PREF_ACCOUNT_NAME)
                .remove(PREF_ACCOUNT_ID)
                .remove(PREF_ACCOUNT_PHOTO)
                .apply();
        launchAuthMode = "google_required";
        emitNativeState();
        evaluate("window.NexoraApp && window.NexoraApp.onSignedOut();");
    }

    public class NativeBridge {
        @JavascriptInterface
        public void startGoogleSignIn() {
            runOnUiThread(() -> startGoogleSignInInternal());
        }

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
            runOnUiThread(() -> authenticateBiometric(false));
        }

        @JavascriptInterface
        public void disableBiometric() {
            prefs.edit().putBoolean(PREF_BIOMETRIC, false).apply();
            emitBiometricResult(false, "disabled");
        }

        @JavascriptInterface
        public void setRequireAuth(boolean enabled) {
            prefs.edit().putBoolean(PREF_REQUIRE_AUTH, enabled).apply();
            emitNativeState();
        }

        @JavascriptInterface
        public void signOut() {
            runOnUiThread(() -> signOutInternal());
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        if (webView != null) {
            webView.saveState(outState);
        }
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
