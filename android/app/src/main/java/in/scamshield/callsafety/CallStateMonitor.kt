package in.scamshield.callsafety

import android.annotation.SuppressLint
import android.content.Context
import android.os.Build
import android.telephony.PhoneStateListener
import android.telephony.TelephonyCallback
import android.telephony.TelephonyManager

// Real Android call-state detection: IDLE / RINGING / OFFHOOK.
class CallStateMonitor(
    private val context: Context,
    private val onState: (String) -> Unit,
) {
    private val telephony =
        context.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager

    private var callback: TelephonyCallback? = null

    @Suppress("DEPRECATION")
    private var listener: PhoneStateListener? = null

    @SuppressLint("MissingPermission")
    fun start() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val cb = object : TelephonyCallback(), TelephonyCallback.CallStateListener {
                override fun onCallStateChanged(state: Int) = onState(map(state))
            }
            callback = cb
            try {
                telephony.registerTelephonyCallback(context.mainExecutor, cb)
            } catch (_: SecurityException) {
                // READ_PHONE_STATE not granted; monitoring still works in mic mode.
            }
        } else {
            @Suppress("DEPRECATION")
            val ls = object : PhoneStateListener() {
                @Suppress("DEPRECATION")
                override fun onCallStateChanged(state: Int, phoneNumber: String?) =
                    onState(map(state))
            }
            listener = ls
            try {
                @Suppress("DEPRECATION")
                telephony.listen(ls, PhoneStateListener.LISTEN_CALL_STATE)
            } catch (_: SecurityException) {
                // ignore
            }
        }
    }

    fun stop() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            callback?.let {
                try {
                    telephony.unregisterTelephonyCallback(it)
                } catch (_: Exception) {
                    // ignore
                }
            }
        } else {
            listener?.let {
                try {
                    @Suppress("DEPRECATION")
                    telephony.listen(it, PhoneStateListener.LISTEN_NONE)
                } catch (_: Exception) {
                    // ignore
                }
            }
        }
        callback = null
        listener = null
    }

    private fun map(state: Int): String = when (state) {
        TelephonyManager.CALL_STATE_RINGING -> "RINGING"
        TelephonyManager.CALL_STATE_OFFHOOK -> "OFFHOOK"
        else -> "IDLE"
    }
}