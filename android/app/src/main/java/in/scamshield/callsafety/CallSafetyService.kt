package in.scamshield.callsafety

import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Bundle
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import androidx.core.app.ServiceCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

// Foreground service: permitted microphone transcription + call-state handling.
class CallSafetyService : Service() {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val main = Handler(Looper.getMainLooper())

    private var recognizer: SpeechRecognizer? = null
    private var monitor: CallStateMonitor? = null
    private var debounce: Job? = null

    private val buffer = StringBuilder()
    private var lastAnalyzed = ""
    private var analyzing = false
    private var pending = false
    private var restartWanted = false
    private var autoStopOnIdle = false

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        ScamWarning.ensureChannel(this)
        Speaker.init(this)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_STOP -> {
                stopEverything()
                return START_NOT_STICKY
            }
            ACTION_START_CALL -> startMonitoring(autoStop = true)
            else -> startMonitoring(autoStop = false)
        }
        return START_STICKY
    }

    private fun startMonitoring(autoStop: Boolean) {
        autoStopOnIdle = autoStop
        CallSafetyState.begin()
        CallSafetyState.addEvent(I18n.t(CallSafetyState.language, "incoming"), "info")
        ServiceCompat.startForeground(
            this,
            ScamWarning.MONITOR_ID,
            ScamWarning.monitoringNotification(this, getString(R.string.monitoring_text)),
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
                ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE
            } else {
                0
            },
        )
        startCallStateMonitor()
        startRecognizer()
    }

    private fun startCallStateMonitor() {
        monitor = CallStateMonitor(this) { state ->
            main.post {
                CallSafetyState.callState = state
                when (state) {
                    "RINGING" ->
                        CallSafetyState.addEvent(I18n.t(lang(), "incoming"), "info")
                    "OFFHOOK" ->
                        CallSafetyState.addEvent(I18n.t(lang(), "active"), "ok")
                    "IDLE" ->
                        if (autoStopOnIdle && CallSafetyState.monitoring) stopEverything()
                }
            }
        }
        monitor?.start()
    }

    private fun startRecognizer() {
        main.post {
            if (recognizer == null) {
                recognizer = SpeechRecognizer.createSpeechRecognizer(this)
                recognizer?.setRecognitionListener(recognitionListener)
            }
            restartWanted = true
            startListening()
        }
    }

    private fun startListening() {
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(
                RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                RecognizerIntent.LANGUAGE_MODEL_FREE_FORM,
            )
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, localeFor(CallSafetyState.language))
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
        }
        try {
            recognizer?.startListening(intent)
        } catch (_: Exception) {
            // Recognizer temporarily busy; will retry on error/end.
        }
    }

    private val recognitionListener = object : RecognitionListener {
        override fun onResults(results: Bundle?) {
            val text = results
                ?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                ?.firstOrNull()
                ?.trim()
                .orEmpty()
            if (text.isNotEmpty()) onFinalSpeech(text)
            if (restartWanted) main.post { startListening() }
        }

        override fun onError(error: Int) {
            if (restartWanted) main.postDelayed({ startListening() }, 400)
        }

        override fun onPartialResults(partialResults: Bundle?) = Unit
        override fun onReadyForSpeech(params: Bundle?) = Unit
        override fun onBeginningOfSpeech() = Unit
        override fun onRmsChanged(rmsdB: Float) = Unit
        override fun onBufferReceived(buffer: ByteArray?) = Unit
        override fun onEndOfSpeech() = Unit
        override fun onEvent(eventType: Int, params: Bundle?) = Unit
    }

    private fun onFinalSpeech(text: String) {
        main.post {
            CallSafetyState.addTranscript(text)
            CallSafetyState.addEvent(text, "speech")

            val startedAt = System.currentTimeMillis()
            val found = LocalDetector.detect(text)
            CallSafetyState.addLocalTime(System.currentTimeMillis() - startedAt)

            if (found.isNotEmpty()) {
                CallSafetyState.addIndicators(found)
                found.forEach { CallSafetyState.addEvent("⚠️ $it", "bad") }
            }

            buffer.append(' ').append(text)
            scheduleAnalysis()
        }
    }

    private fun scheduleAnalysis() {
        debounce?.cancel()
        debounce = scope.launch {
            delay(3000)
            runAnalysis()
        }
    }

    private suspend fun runAnalysis() {
        val text = buffer.toString().trim()
        if (text.isEmpty() || text == lastAnalyzed) return
        if (analyzing) {
            pending = true
            return
        }

        analyzing = true
        val startedAt = System.currentTimeMillis()

        try {
            val result = CallAnalyzer.analyze(
                CallSafetyState.backendUrl,
                text,
                CallSafetyState.callerNumber,
                "Unknown",
            )
            val aiMs = System.currentTimeMillis() - startedAt

            main.post {
                CallSafetyState.analysis = result
                lastAnalyzed = text
                CallSafetyState.addIndicators(result.indicators)
                CallSafetyState.setAiTime(aiMs)

                val severe = result.risk == "HIGH" || result.risk == "CRITICAL"
                CallSafetyState.addEvent(
                    "🧠 ${I18n.t(lang(), "aiMs")} · ${result.risk}",
                    if (severe) "bad" else "info",
                )

                if ((result.paymentRisk || result.credentialRisk) &&
                    !CallSafetyState.frictionVisible
                ) {
                    CallSafetyState.frictionVisible = true
                }

                if (severe) {
                    ScamWarning.notifyWarning(
                        this,
                        I18n.t(lang(), "warning"),
                        I18n.t(lang(), "possibleFraud"),
                    )
                    Speaker.speak(lang(), I18n.t(lang(), "possibleFraud"))
                }
            }
        } catch (error: Exception) {
            main.post {
                CallSafetyState.addEvent("⚠️ ${error.message ?: "AI unavailable"}", "warn")
            }
        } finally {
            analyzing = false
            if (pending) {
                pending = false
                scheduleAnalysis()
            }
        }
    }

    private fun stopEverything() {
        restartWanted = false
        debounce?.cancel()

        main.post {
            try {
                recognizer?.stopListening()
                recognizer?.cancel()
                recognizer?.destroy()
            } catch (_: Exception) {
                // ignore
            }
            recognizer = null
        }

        monitor?.stop()
        monitor = null

        if (CallSafetyState.monitoring) CallSafetyState.end()

        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    override fun onDestroy() {
        restartWanted = false
        monitor?.stop()
        try {
            recognizer?.destroy()
        } catch (_: Exception) {
            // ignore
        }
        Speaker.shutdown()
        super.onDestroy()
    }

    private fun lang() = CallSafetyState.language

    private fun localeFor(lang: String) = when (lang) {
        "hi" -> "hi-IN"
        "mr" -> "mr-IN"
        else -> "en-IN"
    }

    companion object {
        const val ACTION_START_DEMO = "in.scamshield.callsafety.START_DEMO"
        const val ACTION_START_CALL = "in.scamshield.callsafety.START_CALL"
        const val ACTION_STOP = "in.scamshield.callsafety.STOP"
    }
}