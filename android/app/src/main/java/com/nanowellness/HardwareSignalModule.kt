package com.nanowellness

import android.app.usage.UsageStatsManager
import android.app.usage.UsageEvents
import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.provider.Settings
import android.os.BatteryManager
import android.os.Process
import com.facebook.react.bridge.*
import java.util.*

class HardwareSignalModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "HardwareSignalModule"

    @ReactMethod
    fun openUsageSettings() {
        try {
            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            if (intent.resolveActivity(reactApplicationContext.packageManager) != null) {
                reactApplicationContext.startActivity(intent)
            } else {
                val fallbackIntent = Intent(Settings.ACTION_SETTINGS)
                fallbackIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactApplicationContext.startActivity(fallbackIntent)
            }
        } catch (e: Exception) {
            try {
                val intent = Intent(Settings.ACTION_SETTINGS)
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactApplicationContext.startActivity(intent)
            } catch (ex: Exception) {}
        }
    }

    @ReactMethod
    fun openNotificationSettings() {
        try {
            val intent = Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS")
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            if (intent.resolveActivity(reactApplicationContext.packageManager) != null) {
                reactApplicationContext.startActivity(intent)
            } else {
                val fallbackIntent = Intent(Settings.ACTION_SETTINGS)
                fallbackIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactApplicationContext.startActivity(fallbackIntent)
            }
        } catch (e: Exception) {
            try {
                val intent = Intent(Settings.ACTION_SETTINGS)
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactApplicationContext.startActivity(intent)
            } catch (ex: Exception) {}
        }
    }

    @ReactMethod
    fun checkUsageStatsPermission(promise: Promise) {
        try {
            val appOps = reactApplicationContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
            val mode = appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                reactApplicationContext.packageName
            )
            promise.resolve(mode == AppOpsManager.MODE_ALLOWED)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun checkNotificationListenerPermission(promise: Promise) {
        try {
            val flat = Settings.Secure.getString(
                reactApplicationContext.contentResolver,
                "enabled_notification_listeners"
            )
            promise.resolve(flat?.contains(reactApplicationContext.packageName) == true)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun getAppUsageStats(promise: Promise) {
        try {
            val usageStatsManager = reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val endTime = System.currentTimeMillis()
            val startTime = endTime - 3600000L // Past hour

            // Use queryUsageStats as requested
            val queryUsageStats = usageStatsManager.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, startTime, endTime)
            
            val result = Arguments.createArray()
            val statsList = queryUsageStats.toMutableList()
            statsList.sortByDescending { it.totalTimeInForeground }
            
            for (i in 0 until Math.min(statsList.size, 15)) {
                val app = statsList[i]
                if (app.totalTimeInForeground > 0) {
                    val map = Arguments.createMap()
                    map.putString("packageName", app.packageName)
                    map.putDouble("totalTime", app.totalTimeInForeground.toDouble())
                    map.putDouble("lastTimeUsed", app.lastTimeUsed.toDouble())
                    result.pushMap(map)
                }
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("USAGE_STATS_ERROR", e.message)
        }
    }

    @ReactMethod
    fun getHistoricalUnlockCount(promise: Promise) {
        try {
            val usageStatsManager = reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val endTime = System.currentTimeMillis()
            val startTime = endTime - 3600000L // Past hour

            val events = usageStatsManager.queryEvents(startTime, endTime)
            var unlockCount = 0
            val event = UsageEvents.Event()
            
            while (events.hasNextEvent()) {
                events.getNextEvent(event)
                // KEYGUARD_HIDDEN (type 11) is the official way to track unlocks historically
                if (event.eventType == 11 || event.eventType == UsageEvents.Event.SCREEN_INTERACTIVE) {
                    unlockCount++
                }
            }
            
            // If queryEvents is restricted, fallback to the prefs counter we already have
            if (unlockCount == 0) {
                val prefs = reactApplicationContext.getSharedPreferences("NanoWellnessPrefs", Context.MODE_PRIVATE)
                unlockCount = prefs.getInt("screen_unlock_count", 0)
            }
            
            promise.resolve(unlockCount)
        } catch (e: Exception) {
            promise.resolve(0)
        }
    }

    @ReactMethod
    fun getNativeTemperature(promise: Promise) {
        try {
            val intent = reactApplicationContext.registerReceiver(null, android.content.IntentFilter(Intent.ACTION_BATTERY_CHANGED))
            val batteryTemp = intent?.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, 0) ?: 0
            promise.resolve(batteryTemp / 10.0)
        } catch (e: Exception) {
            promise.resolve(0.0)
        }
    }

    @ReactMethod
    fun getUnlockCount(promise: Promise) {
        // Legacy method, redirects to historical
        getHistoricalUnlockCount(promise)
    }

    @ReactMethod
    fun getNotificationCount(promise: Promise) {
        val prefs = reactApplicationContext.getSharedPreferences("NanoWellnessPrefs", Context.MODE_PRIVATE)
        val timestampsStr = prefs.getString("notification_timestamps", "") ?: ""
        
        if (timestampsStr.isEmpty()) {
            // Fallback to total if needed, but best to return 0 if no recent
            // Check legacy
            val count = prefs.getInt("notification_count_total", 0)
            if (count > 0 && timestampsStr.isEmpty()) { // Only return legacy if timestamps string was never set up and we have counts
               // It's safer to just return 0 if no recent timestamps
            }
            promise.resolve(0)
            return
        }

        val oneHourAgo = System.currentTimeMillis() - 3600000L
        val recentCount = timestampsStr.split(",")
            .mapNotNull { it.toLongOrNull() }
            .count { it > oneHourAgo }

        promise.resolve(recentCount)
    }

    @ReactMethod
    fun resetUnlockCount() {
        val prefs = reactApplicationContext.getSharedPreferences("NanoWellnessPrefs", Context.MODE_PRIVATE)
        prefs.edit().putInt("screen_unlock_count", 0).apply()
    }

    @ReactMethod
    fun resetNotificationCount() {
        val prefs = reactApplicationContext.getSharedPreferences("NanoWellnessPrefs", Context.MODE_PRIVATE)
        prefs.edit().putInt("notification_count_total", 0).putString("notification_timestamps", "").apply()
    }
}
