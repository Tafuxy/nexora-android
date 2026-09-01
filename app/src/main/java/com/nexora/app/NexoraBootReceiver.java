package com.nexora.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

public class NexoraBootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || !Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) return;
        SharedPreferences prefs = context.getSharedPreferences(BackgroundSyncJobService.PREFS, Context.MODE_PRIVATE);
        String config = prefs.getString(BackgroundSyncJobService.CONFIG, "{}");
        BackgroundSyncJobService.schedule(context);
        TaskReminderScheduler.scheduleFromConfig(context, config);
    }
}
