package com.nexora.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONObject;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.HashSet;
import java.util.Set;

final class TaskReminderScheduler {
    private static final String PREF_KEYS = "scheduled_task_alarm_keys";

    private TaskReminderScheduler() {}

    static void scheduleFromConfig(Context context, String rawJson) {
        AlarmManager alarm = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarm == null) return;
        SharedPreferences prefs = context.getSharedPreferences(BackgroundSyncJobService.PREFS, Context.MODE_PRIVATE);

        // Remove task alarms that belonged to the previous config before creating the new set.
        Set<String> oldKeys = prefs.getStringSet(PREF_KEYS, new HashSet<>());
        if (oldKeys != null) {
            for (String key : oldKeys) {
                PendingIntent pi = pendingIntent(context, key, "", "");
                alarm.cancel(pi);
                pi.cancel();
            }
        }

        Set<String> scheduled = new HashSet<>();
        try {
            JSONObject config = new JSONObject(rawJson == null ? "{}" : rawJson);
            JSONObject settings = config.optJSONObject("notifications");
            if (settings != null && !settings.optBoolean("tasks", true)) {
                prefs.edit().putStringSet(PREF_KEYS, scheduled).apply();
                return;
            }
            JSONArray tasks = config.optJSONArray("tasks");
            if (tasks == null) {
                prefs.edit().putStringSet(PREF_KEYS, scheduled).apply();
                return;
            }
            boolean et = "et".equalsIgnoreCase(config.optString("language", "et"));
            long now = System.currentTimeMillis();
            int max = Math.min(tasks.length(), 128);
            for (int i = 0; i < max; i++) {
                JSONObject task = tasks.optJSONObject(i);
                if (task == null || !task.optBoolean("reminder", true)) continue;
                String dateRaw = task.optString("date", "");
                if (dateRaw.length() < 10) continue;
                LocalDate date;
                try { date = LocalDate.parse(dateRaw.substring(0, 10)); } catch (Exception e) { continue; }
                LocalTime time = LocalTime.of(9, 0);
                String timeRaw = task.optString("time", "");
                if (timeRaw.matches("\\d{2}:\\d{2}.*")) {
                    try { time = LocalTime.parse(timeRaw.substring(0, 5)); } catch (Exception ignored) {}
                }
                long fireAt = LocalDateTime.of(date, time).atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
                if (fireAt <= now) continue;
                String id = task.optString("id", String.valueOf(i));
                String key = "task:" + id + ":" + date + ":" + time;
                String title = et ? "Ülesande meeldetuletus" : "Task reminder";
                String body = task.optString("title", et ? "Sul on ülesanne" : "You have a task");
                PendingIntent pi = pendingIntent(context, key, title, body);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarm.canScheduleExactAlarms()) {
                    alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, fireAt, pi);
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarm.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, fireAt, pi);
                } else {
                    alarm.setExact(AlarmManager.RTC_WAKEUP, fireAt, pi);
                }
                scheduled.add(key);
            }
        } catch (Exception ignored) {}
        prefs.edit().putStringSet(PREF_KEYS, scheduled).apply();
    }

    private static PendingIntent pendingIntent(Context context, String key, String title, String body) {
        Intent intent = new Intent(context, TaskReminderReceiver.class)
                .setAction("com.nexora.app.TASK_REMINDER")
                .putExtra("key", key)
                .putExtra("title", title)
                .putExtra("body", body);
        return PendingIntent.getBroadcast(
                context,
                key.hashCode(),
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );
    }
}
