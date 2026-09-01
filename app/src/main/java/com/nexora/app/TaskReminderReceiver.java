package com.nexora.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class TaskReminderReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;
        String key = intent.getStringExtra("key");
        String title = intent.getStringExtra("title");
        String body = intent.getStringExtra("body");
        if (title == null || title.isEmpty()) title = "Nexora";
        if (body == null) body = "";
        NotificationHelper.showReminder(context, title, body, key == null ? "task" : key);
    }
}
