package in.scamshield.callsafety

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue

// Shared observable state between the foreground service and the Compose UI.
object CallSafetyState {
    var monitoring by mutableStateOf(false)
    var callState by mutableStateOf("IDLE")
    var callerNumber by mutableStateOf("")
    var backendUrl by mutableStateOf("http://192.168.1.10:8787")
    var language by mutableStateOf("en")
    var frictionVisible by mutableStateOf(false)
    var analysis by mutableStateOf<CallAnalysis?>(null)
    var metrics by mutableStateOf(Metrics())

    val transcript = mutableStateListOf<TranscriptLine>()
    val timeline = mutableStateListOf<TimelineEvent>()
    val indicators = mutableStateListOf<String>()

    private var startTime = 0L
    private var localMsAccum = 0L

    fun begin() {
        transcript.clear()
        timeline.clear()
        indicators.clear()
        analysis = null
        metrics = Metrics()
        frictionVisible = false
        localMsAccum = 0L
        startTime = System.currentTimeMillis()
        monitoring = true
    }

    fun end() {
        monitoring = false
        callState = "DISCONNECTED"
        addEvent(I18n.t(language, "stopped"), "info")
    }

    fun elapsedMs(): Long =
        if (startTime == 0L) 0L else System.currentTimeMillis() - startTime

    fun timeLabel(): String {
        val seconds = (elapsedMs() / 1000).toInt()
        return "%02d:%02d".format(seconds / 60, seconds % 60)
    }

    fun addTranscript(text: String) {
        transcript.add(TranscriptLine(elapsedMs(), text))
    }

    fun addEvent(text: String, tone: String = "info") {
        timeline.add(TimelineEvent(elapsedMs(), text, tone))
    }

    fun addIndicators(labels: List<String>) {
        for (label in labels) if (label !in indicators) indicators.add(label)
    }

    fun addLocalTime(ms: Long) {
        localMsAccum += ms
        metrics = metrics.copy(localMs = localMsAccum)
    }

    fun setAiTime(ms: Long) {
        metrics = metrics.copy(aiMs = ms, totalMs = metrics.localMs + ms)
    }

    fun risk(): String {
        val keys = indicators.toList()
        val local = when {
            LocalDetector.hasCredentialRisk(keys) -> "CRITICAL"
            keys.size >= 2 -> "HIGH"
            keys.size == 1 -> "MEDIUM"
            else -> "LOW"
        }
        val ai = analysis?.risk ?: "LOW"
        return if (rank(ai) >= rank(local)) ai else local
    }

    private fun rank(risk: String) = when (risk) {
        "CRITICAL" -> 3
        "HIGH" -> 2
        "MEDIUM" -> 1
        else -> 0
    }
}