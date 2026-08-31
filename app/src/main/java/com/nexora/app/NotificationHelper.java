package com.nexora.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import org.json.JSONObject;

import java.text.NumberFormat;
import java.util.Locale;

final class NotificationHelper {
    static final String CHANNEL_BANK = "nexora_bank_activity";
    static final String CHANNEL_REMINDERS = "nexora_reminders";

    private NotificationHelper() {}

    static void createChannels(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        NotificationChannel bank = new NotificationChannel(CHANNEL_BANK, "Bank activity", NotificationManager.IMPORTANCE_DEFAULT);
        bank.setDescription("Money received and spent through connected bank accounts");
        bank.setLockscreenVisibility(Notification.VISIBILITY_PRIVATE);
        NotificationChannel reminders = new NotificationChannel(CHANNEL_REMINDERS, "Reminders", NotificationManager.IMPORTANCE_DEFAULT);
        reminders.setDescription("Bills, spending limits and vehicle reminders");
        reminders.setLockscreenVisibility(Notification.VISIBILITY_PRIVATE);
        nm.createNotificationChannel(bank);
        nm.createNotificationChannel(reminders);
    }

    static void showBankActivity(Context context, JSONObject tx, String accountName, JSONObject settings, String lang) {
        boolean income = "income".equalsIgnoreCase(tx.optString("type"));
        if (income && !settings.optBoolean("moneyReceived", true)) return;
        if (!income && !settings.optBoolean("moneySpent", true)) return;

        double amount = tx.optDouble("amount", 0d);
        String merchant = tx.optString("merchant", tx.optString("note", ""));
        String privacy = settings.optString("privacy", "hideAmount");
        boolean et = "et".equalsIgnoreCase(lang);
        String title;
        String body;

        if ("generic".equals(privacy)) {
            title = et ? "Uus pangategevus" : "New bank activity";
            body = et ? "Ava Nexora üksikasjade vaatamiseks." : "Open Nexora to view the details.";
        } else if ("hideAmount".equals(privacy)) {
            title = income ? (et ? "Raha laekus" : "Money received") : (et ? "Raha läks kontolt" : "Money spent");
            body = et ? "Ava Nexora üksikasjade vaatamiseks." : "Open Nexora to view the details.";
        } else {
            String formatted = formatMoney(amount, lang);
            title = income ? (et ? "+" + formatted + " laekus" : "+" + formatted + " received") : (et ? "−" + formatted + " kontolt" : "−" + formatted + " spent");
            body = join(accountName, merchant);
        }
        notify(context, CHANNEL_BANK, title, body, tx.optString("bank_key", title + body).hashCode());
    }

    static void showReminder(Context context, String title, String body, String key) {
        notify(context, CHANNEL_REMINDERS, title, body, key.hashCode());
    }

    private static String join(String a, String b) {
        if (a == null) a = "";
        if (b == null) b = "";
        if (!a.isEmpty() && !b.isEmpty()) return a + " · " + b;
        return !a.isEmpty() ? a : b;
    }

    private static String formatMoney(double amount, String lang) {
        Locale locale = "et".equalsIgnoreCase(lang) ? Locale.forLanguageTag("et-EE") : Locale.UK;
        NumberFormat f = NumberFormat.getCurrencyInstance(locale);
        f.setCurrency(java.util.Currency.getInstance("EUR"));
        return f.format(Math.abs(amount));
    }

    private static void notify(Context context, String channel, String title, String body, int id) {
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        createChannels(context);

        Intent launch = new Intent(context, MainActivity.class)
                .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pi = PendingIntent.getActivity(
                context, id, launch,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        Notification.Builder b = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? new Notification.Builder(context, channel)
                : new Notification.Builder(context);
        b.setSmallIcon(R.drawable.ic_notification)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new Notification.BigTextStyle().bigText(body))
                .setAutoCancel(true)
                .setContentIntent(pi)
                .setVisibility(Notification.VISIBILITY_PRIVATE)
                .setCategory(Notification.CATEGORY_STATUS);
        nm.notify(id, b.build());
    }
}
