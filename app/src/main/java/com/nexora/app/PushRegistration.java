package com.nexora.app;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

final class PushRegistration {
    private static final String PREFS = "nexora_push";
    private static final String FID = "firebase_fid";
    private static final String CONFIG = "push_config";
    private static final ExecutorService EXECUTOR = Executors.newSingleThreadExecutor();

    private PushRegistration() {}

    static void saveFid(Context context, String fid) {
        if (fid == null || fid.trim().isEmpty()) return;
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .edit().putString(FID, fid.trim()).apply();
        registerIfReady(context.getApplicationContext());
    }

    static void clearFid(Context context, String fid) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String current = prefs.getString(FID, "");
        if (fid == null || fid.equals(current)) prefs.edit().remove(FID).apply();
    }

    static void updateConfig(Context context, String json) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .edit().putString(CONFIG, json == null ? "{}" : json).apply();
        registerIfReady(context.getApplicationContext());
    }

    static void registerIfReady(Context context) {
        EXECUTOR.execute(() -> {
            try {
                SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
                String fid = prefs.getString(FID, "");
                JSONObject config = new JSONObject(prefs.getString(CONFIG, "{}"));
                String api = config.optString("bankApiUrl", "").replaceAll("/$", "");
                JSONObject bank = config.optJSONObject("bank");
                if (fid.isEmpty() || api.isEmpty() || bank == null) return;

                String installId = bank.optString("installId", "");
                String handle = bank.optString("handle", "");
                if (installId.isEmpty() || handle.isEmpty()) return;

                JSONObject body = new JSONObject()
                        .put("install_id", installId)
                        .put("bank_handle", handle)
                        .put("fid", fid)
                        .put("platform", "android")
                        .put("language", config.optString("language", "et"));

                JSONObject notifications = config.optJSONObject("notifications");
                body.put("notifications", notifications == null ? new JSONObject() : notifications);
                JSONArray known = config.optJSONArray("knownBankKeys");
                body.put("known_bank_keys", known == null ? new JSONArray() : known);

                postJson(api + "/api/push/register", body);
            } catch (Exception ignored) {
                // Registration is best-effort and will be retried on the next FCM registration,
                // app state update or bank sync.
            }
        });
    }

    private static JSONObject postJson(String url, JSONObject body) throws Exception {
        HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
        connection.setRequestMethod("POST");
        connection.setConnectTimeout(12_000);
        connection.setReadTimeout(20_000);
        connection.setDoOutput(true);
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setRequestProperty("Accept", "application/json");
        connection.setRequestProperty("User-Agent", "Nexora Android Push Registration");
        byte[] bytes = body.toString().getBytes(StandardCharsets.UTF_8);
        try (OutputStream os = connection.getOutputStream()) { os.write(bytes); }
        int code = connection.getResponseCode();
        BufferedReader reader = new BufferedReader(new InputStreamReader(
                code >= 200 && code < 300 ? connection.getInputStream() : connection.getErrorStream(),
                StandardCharsets.UTF_8));
        StringBuilder text = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) text.append(line);
        reader.close();
        if (code < 200 || code >= 300) throw new Exception("HTTP " + code + ": " + text);
        return text.length() == 0 ? new JSONObject() : new JSONObject(text.toString());
    }
}
