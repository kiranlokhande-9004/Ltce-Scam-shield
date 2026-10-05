package in.scamshield.callsafety

data class TranscriptLine(val timeMs: Long, val text: String)

data class TimelineEvent(val timeMs: Long, val text: String, val tone: String)

data class CallAnalysis(
    val risk: String = "LOW",
    val fraudScore: Int = 0,
    val impersonatedOrganization: String = "Unknown",
    val officialWebsite: String? = null,
    val indicators: List<String> = emptyList(),
    val explanation: String = "",
    val recommendedAction: String = "",
    val paymentRisk: Boolean = false,
    val credentialRisk: Boolean = false,
    val model: String = "",
)

data class Metrics(val localMs: Long = 0, val aiMs: Long = 0, val totalMs: Long = 0)