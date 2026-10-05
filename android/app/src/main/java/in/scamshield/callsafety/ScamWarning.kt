package in.scamshield.callsafety

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationCompat

// Native Android notification for the monitoring foreground service and the
// high-risk warning. No accessibility service is used to bypass restrictions.
object ScamWarning {
    const val CHANNEL = "scamshield_call"
    const val MONITOR_ID = 4242
    private const val WARNING_ID = 4243

    fun ensureChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val manager = context.getSystemService(NotificationManager::class.java)
            if (manager.getNotificationChannel(CHANNEL) == null) {
                manager.createNotificationChannel(
                    NotificationChannel(
                        CHANNEL,
                        context.getString(R.string.channel_name),
                        NotificationManager.IMPORTANCE_HIGH,
                    ).apply {
                        description = context.getString(R.string.channel_desc)
                    }
                )
            }
        }
    }

    fun monitoringNotification(context: Context, text: String): Notification {
        ensureChannel(context)
        return NotificationCompat.Builder(context, CHANNEL)
            .setSmallIcon(R.drawable.ic_scamshield)
            .setContentTitle(context.getString(R.string.monitoring_title))
            .setContentText(text)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    fun notifyWarning(context: Context, title: String, body: String) {
        ensureChannel(context)
        val notification = NotificationCompat.Builder(context, CHANNEL)
            .setSmallIcon(R.drawable.ic_scamshield)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setAutoCancel(true)
            .build()

        try {
            context.getSystemService(NotificationManager::class.java)
                .notify(WARNING_ID, notification)
        } catch (_: SecurityException) {
            // POST_NOTIFICATIONS not granted.
        }
    }
}