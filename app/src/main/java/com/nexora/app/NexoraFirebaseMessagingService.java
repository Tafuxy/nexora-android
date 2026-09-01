package com.nexora.app;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Map;

public class NexoraFirebaseMessagingService extends FirebaseMessagingService {
    @Override
    public void onNewToken(String token) {
        super.onNewToken(token);
        PushRegistration.saveToken(this, token);
    }

    @Override
    public void onMessageReceived(RemoteMessage message) {
        super.onMessageReceived(message);
        String title = "Nexora";
        String body = "";

        if (message.getNotification() != null) {
            if (message.getNotification().getTitle() != null) title = message.getNotification().getTitle();
            if (message.getNotification().getBody() != null) body = message.getNotification().getBody();
        }

        Map<String, String> data = message.getData();
        if (data != null) {
            if ((title == null || title.isEmpty()) && data.get("title") != null) title = data.get("title");
            if ((body == null || body.isEmpty()) && data.get("body") != null) body = data.get("body");
        }

        String key = data == null ? "push" : data.getOrDefault("bank_key", data.getOrDefault("event_id", "push"));
        NotificationHelper.showRemotePush(this, title == null ? "Nexora" : title, body == null ? "" : body, key);
    }
}
