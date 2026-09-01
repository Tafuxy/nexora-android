package com.nexora.app;

import android.app.job.JobInfo;
import android.app.job.JobParameters;
import android.app.job.JobScheduler;
import android.app.job.JobService;
import android.content.ComponentName;
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
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class BackgroundSyncJobService extends JobService {
    static final String PREFS = "nexora_background";
    static final String CONFIG = "notification_config";
    private static final String SEEN = "seen_bank_keys";
    private static final String REMINDER_KEYS = "reminder_keys";
    private static final String SEEDED = "bank_seeded";
    private static final int PERIODIC_JOB = 77101;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    static void saveConfig(Context context, String json) {
        String safeJson = json == null ? "{}" : json;
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(CONFIG, safeJson).apply();
        schedule(context);
        TaskReminderScheduler.scheduleFromConfig(context, safeJson);
    }

    static void schedule(Context context) {
        JobScheduler scheduler = (JobScheduler) context.getSystemService(Context.JOB_SCHEDULER_SERVICE);
        if (scheduler == null) return;

        // Bills / vehicle / budget reminders are day-level events. A 12-hour, OS-batched
        // job is enough and avoids waking the app repeatedly. Bank activity push is handled
        // by the Cloudflare + FCM backend, so this job performs no bank network polling.
        if (scheduler.getPendingJob(PERIODIC_JOB) != null) return;

        ComponentName component = new ComponentName(context, BackgroundSyncJobService.class);
        JobInfo periodic = new JobInfo.Builder(PERIODIC_JOB, component)
                .setPeriodic(12 * 60 * 60 * 1000L)
                .setPersisted(true)
                .setRequiresBatteryNotLow(true)
                .build();
        scheduler.schedule(periodic);
    }

    @Override
    public boolean onStartJob(JobParameters params) {
        executor.execute(() -> {
            try { runSync(); } catch (Exception ignored) {}
            jobFinished(params, false);
        });
        return true;
    }

    @Override
    public boolean onStopJob(JobParameters params) {
        return true;
    }

    private void runSync() throws Exception {
        SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        JSONObject config = new JSONObject(prefs.getString(CONFIG, "{}"));
        JSONObject settings = config.optJSONObject("notifications");
        if (settings == null) settings = new JSONObject();
        String lang = config.optString("language", "et");

        // Bank transaction push is handled server-side through FCM.
        // Local background work is reserved for bills, vehicles and budget reminders.
        checkBills(config, settings, lang, prefs);
        checkVehicles(config, settings, lang, prefs);
        checkBudget(config, settings, lang, prefs);
    }

    private void checkBank(JSONObject config, JSONObject settings, String lang, SharedPreferences prefs) {
        JSONObject bank = config.optJSONObject("bank");
        String api = config.optString("bankApiUrl", "").replaceAll("/$", "");
        if (bank == null || api.isEmpty()) return;
        String install = bank.optString("installId", "");
        String handle = bank.optString("handle", "");
        if (install.isEmpty() || handle.isEmpty()) return;

        try {
            JSONObject body = new JSONObject().put("install_id", install).put("bank_handle", handle);
            JSONObject response = postJson(api + "/api/sync", body);
            if (!response.optBoolean("connected", false)) return;

            Map<String, String> accountNames = new HashMap<>();
            JSONArray accounts = response.optJSONArray("accounts");
            if (accounts != null) {
                for (int i = 0; i < accounts.length(); i++) {
                    JSONObject a = accounts.optJSONObject(i);
                    if (a == null) continue;
                    String name = a.optString("display_name", "");
                    if (name.isEmpty()) name = a.optString("name", "");
                    accountNames.put(a.optString("id", ""), name);
                }
            }

            Set<String> seen = readStringSet(prefs, SEEN);
            JSONArray known = config.optJSONArray("knownBankKeys");
            if (known != null) for (int i = 0; i < known.length(); i++) seen.add(known.optString(i));
            boolean seeded = prefs.getBoolean(SEEDED, false) || !seen.isEmpty();
            JSONArray txs = response.optJSONArray("transactions");
            List<JSONObject> newTxs = new ArrayList<>();
            if (txs != null) {
                for (int i = txs.length() - 1; i >= 0; i--) {
                    JSONObject tx = txs.optJSONObject(i);
                    if (tx == null) continue;
                    String key = tx.optString("bank_key", "");
                    if (key.isEmpty()) continue;
                    if (!seen.contains(key) && seeded && isRecent(tx.optString("date", ""))) newTxs.add(tx);
                    seen.add(key);
                }
            }

            if (!seeded) seeded = true;
            trimSet(seen, 2000);
            prefs.edit().putString(SEEN, new JSONArray(seen).toString()).putBoolean(SEEDED, seeded).apply();

            for (JSONObject tx : newTxs) {
                String accountName = accountNames.getOrDefault(tx.optString("account_id", ""), "");
                NotificationHelper.showBankActivity(this, tx, accountName, settings, lang);
            }
        } catch (Exception ignored) {}
    }

    private boolean isRecent(String date) {
        try {
            LocalDate d = LocalDate.parse(date.substring(0, 10));
            long diff = Math.abs(ChronoUnit.DAYS.between(d, LocalDate.now()));
            return diff <= 2;
        } catch (Exception e) {
            return true;
        }
    }

    private void checkBills(JSONObject config, JSONObject settings, String lang, SharedPreferences prefs) {
        if (!settings.optBoolean("bills", true)) return;
        JSONArray bills = config.optJSONArray("bills");
        if (bills == null) return;
        Set<String> notified = readStringSet(prefs, REMINDER_KEYS);
        boolean et = "et".equalsIgnoreCase(lang);
        LocalDate today = LocalDate.now();

        for (int i = 0; i < bills.length(); i++) {
            JSONObject bill = bills.optJSONObject(i);
            if (bill == null || bill.optBoolean("paidThisMonth", false)) continue;
            int dueDay = Math.max(1, Math.min(31, bill.optInt("dueDay", 1)));
            YearMonth ym = YearMonth.from(today);
            int validDay = Math.min(dueDay, ym.lengthOfMonth());
            LocalDate due = ym.atDay(validDay);
            long days = ChronoUnit.DAYS.between(today, due);
            if (days < 0) {
                String key = "bill-overdue:" + bill.optString("id") + ":" + ym;
                if (notified.add(key)) NotificationHelper.showReminder(this,
                        et ? "Arve on tähtajast üle" : "Bill is overdue",
                        bill.optString("name") + " · " + formatAmount(bill.optDouble("amount", 0), lang), key);
                continue;
            }
            if (days == 7 || days == 3 || days == 1 || days == 0) {
                String key = "bill:" + bill.optString("id") + ":" + ym + ":" + days;
                if (notified.add(key)) {
                    String title = days == 0 ? (et ? "Arve tähtaeg on täna" : "Bill due today")
                            : (et ? "Arve tähtaeg läheneb" : "Bill due soon");
                    String body = bill.optString("name") + " · " + formatAmount(bill.optDouble("amount", 0), lang)
                            + (days > 0 ? (et ? " · " + days + " päeva pärast" : " · in " + days + " days") : "");
                    NotificationHelper.showReminder(this, title, body, key);
                }
            }
        }
        prefs.edit().putString(REMINDER_KEYS, new JSONArray(notified).toString()).apply();
    }

    private void checkVehicles(JSONObject config, JSONObject settings, String lang, SharedPreferences prefs) {
        if (!settings.optBoolean("vehicles", true)) return;
        JSONArray vehicles = config.optJSONArray("vehicles");
        if (vehicles == null) return;
        Set<String> notified = readStringSet(prefs, REMINDER_KEYS);
        boolean et = "et".equalsIgnoreCase(lang);
        LocalDate today = LocalDate.now();

        for (int i = 0; i < vehicles.length(); i++) {
            JSONObject v = vehicles.optJSONObject(i);
            if (v == null) continue;
            String id = v.optString("id", String.valueOf(i));
            String name = v.optString("name", et ? "Auto" : "Vehicle");
            checkVehicleDate(notified, id, name, "inspection", v.optString("inspectionDate", ""), today, et,
                    et ? "Ülevaatuse tähtaeg läheneb" : "Vehicle inspection due soon");
            checkVehicleDate(notified, id, name, "insurance", v.optString("insuranceDate", ""), today, et,
                    et ? "Kindlustus vajab uuendamist" : "Insurance renewal is coming up");

            long next = v.optLong("nextServiceKm", 0);
            long odo = v.optLong("odometer", 0);
            if (next > 0) {
                long left = next - odo;
                int bucket = left <= 0 ? 0 : left <= 100 ? 100 : left <= 500 ? 500 : left <= 1000 ? 1000 : -1;
                if (bucket >= 0) {
                    String key = "service:" + id + ":" + next + ":" + bucket;
                    if (notified.add(key)) {
                        String body = left <= 0 ? (et ? name + " hooldus on käes" : name + " service is due")
                                : (et ? name + " · hoolduseni umbes " + left + " km" : name + " · about " + left + " km to service");
                        NotificationHelper.showReminder(this, et ? "Auto hooldus" : "Vehicle service", body, key);
                    }
                }
            }
        }
        prefs.edit().putString(REMINDER_KEYS, new JSONArray(notified).toString()).apply();
    }

    private void checkVehicleDate(Set<String> notified, String id, String name, String kind, String raw, LocalDate today, boolean et, String title) {
        if (raw == null || raw.length() < 10) return;
        try {
            LocalDate due = LocalDate.parse(raw.substring(0, 10));
            long days = ChronoUnit.DAYS.between(today, due);
            if (!(days == 30 || days == 14 || days == 7 || days == 1 || days == 0)) return;
            String key = kind + ":" + id + ":" + raw + ":" + days;
            if (!notified.add(key)) return;
            String body = days == 0 ? (et ? name + " · tähtaeg on täna" : name + " · due today")
                    : (et ? name + " · " + days + " päeva pärast" : name + " · in " + days + " days");
            NotificationHelper.showReminder(this, title, body, key);
        } catch (Exception ignored) {}
    }

    private void checkBudget(JSONObject config, JSONObject settings, String lang, SharedPreferences prefs) {
        if (!settings.optBoolean("budget", true)) return;
        JSONObject budget = config.optJSONObject("budget");
        if (budget == null) return;
        double limit = budget.optDouble("limit", 0);
        double spent = budget.optDouble("spent", 0);
        if (limit <= 0) return;
        double ratio = spent / limit;
        int threshold = ratio >= 1 ? 100 : ratio >= .9 ? 90 : ratio >= .8 ? 80 : 0;
        if (threshold == 0) return;
        String key = "budget:" + YearMonth.now() + ":" + threshold;
        Set<String> notified = readStringSet(prefs, REMINDER_KEYS);
        if (!notified.add(key)) return;
        boolean et = "et".equalsIgnoreCase(lang);
        String title = threshold >= 100 ? (et ? "Kuu kululimiit on täis" : "Monthly spending limit reached")
                : (et ? "Kuu kululimiit hakkab täituma" : "Approaching your spending limit");
        String body = et ? "Oled kasutanud " + threshold + "% kuu kululimiidist." : "You have used " + threshold + "% of your monthly spending limit.";
        NotificationHelper.showReminder(this, title, body, key);
        prefs.edit().putString(REMINDER_KEYS, new JSONArray(notified).toString()).apply();
    }

    private JSONObject postJson(String url, JSONObject body) throws Exception {
        HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
        connection.setRequestMethod("POST");
        connection.setConnectTimeout(12_000);
        connection.setReadTimeout(25_000);
        connection.setDoOutput(true);
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setRequestProperty("Accept", "application/json");
        connection.setRequestProperty("User-Agent", "Nexora Android Background Sync");
        byte[] bytes = body.toString().getBytes(StandardCharsets.UTF_8);
        try (OutputStream os = connection.getOutputStream()) { os.write(bytes); }
        int code = connection.getResponseCode();
        BufferedReader reader = new BufferedReader(new InputStreamReader(code >= 200 && code < 300 ? connection.getInputStream() : connection.getErrorStream(), StandardCharsets.UTF_8));
        StringBuilder text = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) text.append(line);
        reader.close();
        if (code < 200 || code >= 300) throw new Exception("HTTP " + code);
        return new JSONObject(text.toString());
    }

    private Set<String> readStringSet(SharedPreferences prefs, String key) {
        Set<String> out = new HashSet<>();
        try {
            JSONArray arr = new JSONArray(prefs.getString(key, "[]"));
            for (int i = 0; i < arr.length(); i++) {
                String value = arr.optString(i, "");
                if (!value.isEmpty()) out.add(value);
            }
        } catch (Exception ignored) {}
        return out;
    }

    private void trimSet(Set<String> set, int max) {
        if (set.size() <= max) return;
        List<String> list = new ArrayList<>(set);
        set.clear();
        for (int i = Math.max(0, list.size() - max); i < list.size(); i++) set.add(list.get(i));
    }

    private String formatAmount(double amount, String lang) {
        return String.format("%s%.2f €", amount < 0 ? "−" : "", Math.abs(amount)).replace('.', ',');
    }
}
