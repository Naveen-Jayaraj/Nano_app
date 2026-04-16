package com.nanowellness

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class ScreenReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_USER_PRESENT) {
            val prefs = context.getSharedPreferences("NanoWellnessPrefs", Context.MODE_PRIVATE)
            val currentCount = prefs.getInt("screen_unlock_count", 0)
            prefs.edit().putInt("screen_unlock_count", currentCount + 1).apply()
        }
    }
}
