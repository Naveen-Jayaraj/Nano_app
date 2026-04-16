package com.nanowellness

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.content.Context

class NotificationService : NotificationListenerService() {

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        // We only count notifications here
        val prefs = getSharedPreferences("NanoWellnessPrefs", Context.MODE_PRIVATE)
        val currentCount = prefs.getInt("notification_count_total", 0)
        
        // Save timestamp
        val timestampsStr = prefs.getString("notification_timestamps", "") ?: ""
        val oneHourAgo = System.currentTimeMillis() - 3600000L
        val currentList = if (timestampsStr.isEmpty()) mutableListOf() else timestampsStr.split(",").toMutableList()
        currentList.add(System.currentTimeMillis().toString())
        
        // Clean up old ones (>1 hour) to keep the list small
        val recentList = currentList.filter { (it.toLongOrNull() ?: 0L) > oneHourAgo }

        prefs.edit()
            .putInt("notification_count_total", currentCount + 1)
            .putString("notification_timestamps", recentList.joinToString(","))
            .apply()
        
        // Also track per app if needed
        val pkg = sbn.packageName
        val pkgCount = prefs.getInt("notifications_$pkg", 0)
        prefs.edit().putInt("notifications_$pkg", pkgCount + 1).apply()
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification) {
        // Optional: track dismissal if needed
    }
}
