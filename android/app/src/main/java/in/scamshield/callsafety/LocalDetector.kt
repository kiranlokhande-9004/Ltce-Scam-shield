package in.scamshield.callsafety

// Deterministic, zero-cost fraud indicator detector. Mirrors server/callAnalyze.js.
object LocalDetector {
    private val rules: List<Pair<String, List<Regex>>> = listOf(
        "OTP request" to listOf(r("\\botp\\b"), r("one.?time password")),
        "PIN request" to listOf(r("\\bpin\\b"), r("atm pin")),
        "CVV request" to listOf(r("\\bcvv\\b"), r("card number")),
        "Password request" to listOf(r("password"), r("net.?banking")),
        "UPI/payment request" to listOf(r("\\bupi\\b"), r("transfer"), r("pay now"), r("send money"), r("rupees"), r("₹")),
        "Screen-sharing request" to listOf(r("screen shar")),
        "Remote-access request" to listOf(r("anydesk"), r("teamviewer"), r("remote access"), r("quick ?support")),
        "KYC threat" to listOf(r("\\bkyc\\b")),
        "Account blocking threat" to listOf(r("account.{0,20}block"), r("account.{0,20}suspend"), r("will be blocked")),
        "Police/legal threat" to listOf(r("police"), r("arrest"), r("\\bfir\\b"), r("legal action")),
        "Prize/refund scam" to listOf(r("prize"), r("lottery"), r("refund")),
        "Urgency" to listOf(r("immediately"), r("right now"), r("today"), r("urgent")),
        "Fear or intimidation" to listOf(r("block"), r("suspend"), r("penalty"), r("freeze"), r("expire")),
        "Install app request" to listOf(r("install.{0,20}(app|application)"), r("download.{0,20}(app|application)")),
        "Impersonation" to listOf(r("calling from"), r("your bank"), r("customer care")),
        "Banking information request" to listOf(r("account number"), r("debit card"), r("credit card")),
    )

    private val credentialLabels = setOf(
        "OTP request", "PIN request", "CVV request", "Password request",
        "Banking information request",
    )
    private val paymentLabels = setOf("UPI/payment request")

    private fun r(pattern: String) = Regex(pattern, RegexOption.IGNORE_CASE)

    fun detect(text: String): List<String> =
        rules.filter { (_, patterns) -> patterns.any { it.containsMatchIn(text) } }
            .map { it.first }

    fun hasCredentialRisk(labels: Collection<String>) = labels.any { it in credentialLabels }

    fun hasPaymentRisk(labels: Collection<String>) = labels.any { it in paymentLabels }
}