package in.scamshield.callsafety

import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

// Talks to the EXISTING ScamShield backend. The AI key never touches the app.
object CallAnalyzer {
    fun analyze(
        baseUrl: String,
        transcript: String,
        callerNumber: String,
        callerName: String,
    ): CallAnalysis {
        val endpoint = URL(baseUrl.trim().trimEnd('/') + "/api/call-analyze")

        val connection = (endpoint.openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            connectTimeout = 15_000
            readTimeout = 30_000
            doOutput = true
            setRequestProperty("Content-Type", "application/json; charset=utf-8")
        }

        val payload = JSONObject().apply {
            put("transcript", transcript)
            put("callerNumber", callerNumber)
            put("callerName", callerName)
        }.toString()

        connection.outputStream.use { it.write(payload.toByteArray(Charsets.UTF_8)) }

        val code = connection.responseCode
        val stream = if (code in 200..299) connection.inputStream else connection.errorStream
        val body = stream?.bufferedReader(Charsets.UTF_8)?.use { it.readText() } ?: ""

        if (code !in 200..299) {
            throw IllegalStateException("Backend error $code")
        }

        val analysis = JSONObject(body).getJSONObject("analysis")
        val indicatorsArray = analysis.optJSONArray("indicators")
        val indicators = buildList {
            if (indicatorsArray != null) {
                for (i in 0 until indicatorsArray.length()) add(indicatorsArray.getString(i))
            }
        }

        return CallAnalysis(
            risk = analysis.optString("risk", "LOW"),
            fraudScore = analysis.optInt("fraudScore", 0),
            impersonatedOrganization = analysis.optString("impersonatedOrganization", "Unknown"),
            officialWebsite = analysis.optString("officialWebsite", "").ifBlank { null },
            indicators = indicators,
            explanation = analysis.optString("explanation", ""),
            recommendedAction = analysis.optString("recommendedAction", ""),
            paymentRisk = analysis.optBoolean("paymentRisk", false),
            credentialRisk = analysis.optBoolean("credentialRisk", false),
            model = analysis.optString("model", ""),
        )
    }
}