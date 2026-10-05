package in.scamshield.callsafety

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat

private val Danger = Color(0xFFFF5470)
private val Warn = Color(0xFFFFB020)
private val Good = Color(0xFF35C878)
private val Accent = Color(0xFF5B8CFF)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val prefs = getSharedPreferences("scamshield", Context.MODE_PRIVATE)
        CallSafetyState.backendUrl =
            prefs.getString("backend", CallSafetyState.backendUrl)
                ?: CallSafetyState.backendUrl
        CallSafetyState.language = prefs.getString("lang", "en") ?: "en"
        CallSafetyState.callerNumber = prefs.getString("caller", "") ?: ""

        setContent {
            MaterialTheme(colorScheme = darkColorScheme()) {
                val context = androidx.compose.ui.platform.LocalContext.current
                var refresh by remember { mutableStateOf(0) }

                val launcher = rememberLauncherForActivityResult(
                    ActivityResultContracts.RequestMultiplePermissions(),
                ) { refresh += 1 }

                fun persist() {
                    prefs.edit()
                        .putString("backend", CallSafetyState.backendUrl)
                        .putString("lang", CallSafetyState.language)
                        .putString("caller", CallSafetyState.callerNumber)
                        .apply()
                }

                Surface(
                    color = MaterialTheme.colorScheme.background,
                    modifier = Modifier.fillMaxSize(),
                ) {
                    SafetyScreen(
                        context = context,
                        refresh = refresh,
                        onGrant = {
                            launcher.launch(Permissions.required().toTypedArray())
                        },
                        onStartDemo = {
                            persist()
                            ContextCompat.startForegroundService(
                                context,
                                Intent(context, CallSafetyService::class.java)
                                    .setAction(CallSafetyService.ACTION_START_DEMO),
                            )
                        },
                        onStartCall = {
                            persist()
                            ContextCompat.startForegroundService(
                                context,
                                Intent(context, CallSafetyService::class.java)
                                    .setAction(CallSafetyService.ACTION_START_CALL),
                            )
                        },
                        onStop = {
                            context.startService(
                                Intent(context, CallSafetyService::class.java)
                                    .setAction(CallSafetyService.ACTION_STOP),
                            )
                        },
                        onSave = { persist() },
                        onOpen = { url ->
                            context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                        },
                        onDial = { number ->
                            context.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse("tel:$number")))
                        },
                    )
                }
            }
        }
    }
}

@Composable
private fun SafetyScreen(
    context: Context,
    refresh: Int,
    onGrant: () -> Unit,
    onStartDemo: () -> Unit,
    onStartCall: () -> Unit,
    onStop: () -> Unit,
    onSave: () -> Unit,
    onOpen: (String) -> Unit,
    onDial: (String) -> Unit,
) {
    // `refresh` is read so the permission status re-evaluates after a grant.
    val lang = CallSafetyState.language
    val risk = CallSafetyState.risk()
    val severe = risk == "HIGH" || risk == "CRITICAL"

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text(
            "🛡️ ${I18n.t(lang, "app")}",
            fontSize = 26.sp,
            fontWeight = FontWeight.Bold,
        )
        Text(I18n.t(lang, "subtitle"), color = Color(0xFF93A1C0))

        LanguageRow(lang = lang, onSave = onSave)

        PermissionsCard(context = context, refresh = refresh, onGrant = onGrant)

        Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF141C30))) {
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(I18n.t(lang, "backend"), fontWeight = FontWeight.Bold)
                OutlinedTextField(
                    value = CallSafetyState.backendUrl,
                    onValueChange = { CallSafetyState.backendUrl = it },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                )
                Text(I18n.t(lang, "modeMic"), color = Color(0xFF93A1C0), fontSize = 13.sp)
                Text(I18n.t(lang, "modePhone"), color = Color(0xFF93A1C0), fontSize = 13.sp)

                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    if (!CallSafetyState.monitoring) {
                        Button(
                            onClick = { onSave(); onStartDemo() },
                            modifier = Modifier.weight(1f),
                            enabled = Permissions.has(context, android.Manifest.permission.RECORD_AUDIO),
                        ) {
                            Text("▶ ${I18n.t(lang, "start")}")
                        }
                    } else {
                        Button(
                            onClick = onStop,
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(containerColor = Danger),
                        ) {
                            Text("⏹ ${I18n.t(lang, "stop")}")
                        }
                    }
                }

                TextButton(onClick = { onSave(); onStartCall() }) {
                    Text("📞 ${I18n.t(lang, "modePhone")}")
                }

                Text(
                    if (CallSafetyState.monitoring) {
                        "🔴 ${I18n.t(lang, "privacy")}"
                    } else {
                        "⚪ ${I18n.t(lang, "stopped")}"
                    },
                    color = Color(0xFF93A1C0),
                    fontSize = 13.sp,
                )
            }
        }

        DemoScriptCard(lang)

        if (severe) {
            DangerBanner(lang = lang, onStop = onStop)
        }

        StatRow(lang = lang)

        SectionCard("🗣️ ${I18n.t(lang, "liveTranscript")}") {
            if (CallSafetyState.transcript.isEmpty()) {
                Text(
                    if (CallSafetyState.monitoring) I18n.t(lang, "listening")
                    else I18n.t(lang, "stopped"),
                    color = Color(0xFF93A1C0),
                )
            } else {
                CallSafetyState.transcript.forEach { line ->
                    Text("“${line.text}”", modifier = Modifier.padding(vertical = 3.dp))
                }
            }
        }

        SectionCard("⚠️ ${I18n.t(lang, "indicators")}") {
            if (CallSafetyState.indicators.isEmpty()) {
                Text("—", color = Color(0xFF93A1C0))
            } else {
                CallSafetyState.indicators.forEach { label ->
                    Text("• $label", color = Danger, modifier = Modifier.padding(vertical = 2.dp))
                }
            }
        }

        CallSafetyState.analysis?.let { analysis ->
            SectionCard("✅ ${I18n.t(lang, "recommended")}") {
                Text(analysis.recommendedAction)
                Spacer(Modifier.height(6.dp))
                Text(analysis.explanation, color = Color(0xFF93A1C0), fontSize = 13.sp)
            }
        }

        OfficialCard(lang = lang, onOpen = onOpen)
        HelpCard(lang = lang, onOpen = onOpen, onDial = onDial)
        TimelineCard(lang = lang)
        MetricsCard(lang = lang)
    }

    if (CallSafetyState.frictionVisible) {
        PaymentFrictionDialog(lang = lang)
    }
}

@Composable
private fun LanguageRow(lang: String, onSave: () -> Unit) {
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        I18n.languages.forEach { (code, label) ->
            val selected = code == lang
            TextButton(onClick = { CallSafetyState.language = code; onSave() }) {
                Text(
                    label,
                    color = if (selected) Accent else Color(0xFF93A1C0),
                    fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
                )
            }
        }
    }
}

@Composable
private fun PermissionsCard(context: Context, refresh: Int, onGrant: () -> Unit) {
    val lang = CallSafetyState.language
    val all = refresh.let { Permissions.allGranted(context) }

    Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF141C30))) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text(I18n.t(lang, "permTitle"), fontWeight = FontWeight.Bold)
            Text(I18n.t(lang, "permIntro"), color = Color(0xFF93A1C0), fontSize = 13.sp)

            PermissionLine(
                I18n.t(lang, "permPhone"),
                Permissions.has(context, android.Manifest.permission.READ_PHONE_STATE),
            )
            PermissionLine(
                I18n.t(lang, "permMic"),
                Permissions.has(context, android.Manifest.permission.RECORD_AUDIO),
            )

            if (!all) {
                Text(
                    "❌ ${I18n.t(lang, "required")}",
                    color = Warn,
                    fontWeight = FontWeight.Bold,
                )
                Button(onClick = onGrant) { Text(I18n.t(lang, "grant")) }
            } else {
                Text("✓ ${I18n.t(lang, "granted")}", color = Good)
            }
        }
    }
}

@Composable
private fun PermissionLine(label: String, granted: Boolean) {
    Text(
        if (granted) "✓ $label" else "✗ $label",
        color = if (granted) Good else Warn,
    )
}

@Composable
private fun DemoScriptCard(lang: String) {
    val script = listOf(
        "Hello sir, I am calling from your bank.",
        "Your KYC has expired.",
        "Your account will be blocked today.",
        "Please tell me the OTP you received.",
    )
    SectionCard("📜 ${I18n.t(lang, "demoScript")}") {
        script.forEach { Text("“$it”", modifier = Modifier.padding(vertical = 2.dp)) }
    }
}

@Composable
private fun DangerBanner(lang: String, onStop: () -> Unit) {
    Card(colors = CardDefaults.cardColors(containerColor = Color(0x33FF5470))) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text("🚨 ${I18n.t(lang, "warning")}", fontWeight = FontWeight.Bold)
            Text(I18n.t(lang, "possibleFraud"), fontSize = 20.sp, fontWeight = FontWeight.Bold)
            Text("${I18n.t(lang, "doNotShare")} OTP · PIN · CVV · Password", color = Danger)
            Button(
                onClick = onStop,
                colors = ButtonDefaults.buttonColors(containerColor = Danger),
            ) {
                Text("🛑 ${I18n.t(lang, "endCall")}")
            }
        }
    }
}

@Composable
private fun StatRow(lang: String) {
    val analysis = CallSafetyState.analysis
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
        Stat(lang, "caller", "📱 ${I18n.t(lang, "unknown")}", Modifier.weight(1f))
        Stat(
            lang,
            "callStatus",
            if (CallSafetyState.monitoring) "● ${I18n.t(lang, "active")}" else "○ ${I18n.t(lang, "idle")}",
            Modifier.weight(1f),
        )
    }
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
        Stat(lang, "risk", riskLabel(lang, CallSafetyState.risk()), Modifier.weight(1f))
        Stat(lang, "aiScore", "${analysis?.fraudScore ?: 0}/100", Modifier.weight(1f))
    }
}

@Composable
private fun Stat(lang: String, labelKey: String, value: String, modifier: Modifier) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color(0xFF141C30)),
        modifier = modifier,
    ) {
        Column(Modifier.padding(12.dp)) {
            Text(I18n.t(lang, labelKey), color = Color(0xFF93A1C0), fontSize = 12.sp)
            Text(value, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun OfficialCard(lang: String, onOpen: (String) -> Unit) {
    val analysis = CallSafetyState.analysis
    SectionCard("🔎 ${I18n.t(lang, "officialWebsite")}") {
        Text(analysis?.impersonatedOrganization ?: "Unknown", fontWeight = FontWeight.Bold)
        val website = analysis?.officialWebsite
        if (website != null) {
            Text(website, color = Color(0xFF93A1C0))
            Button(onClick = { onOpen(website) }) { Text(I18n.t(lang, "verify")) }
        } else {
            Text(I18n.t(lang, "noOfficial"), color = Color(0xFF93A1C0))
        }
    }
}

@Composable
private fun HelpCard(lang: String, onOpen: (String) -> Unit, onDial: (String) -> Unit) {
    SectionCard("🚨 ${I18n.t(lang, "help")}") {
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Button(onClick = { onDial("1930") }) { Text("📞 ${I18n.t(lang, "call1930")}") }
            Button(onClick = { onOpen("https://www.cybercrime.gov.in/") }) {
                Text(I18n.t(lang, "report"))
            }
        }
    }
}

@Composable
private fun TimelineCard(lang: String) {
    SectionCard("🕒 ${I18n.t(lang, "timeline")}") {
        if (CallSafetyState.timeline.isEmpty()) {
            Text(I18n.t(lang, "stopped"), color = Color(0xFF93A1C0))
        } else {
            CallSafetyState.timeline.forEach { event ->
                val seconds = (event.timeMs / 1000).toInt()
                val label = "%02d:%02d".format(seconds / 60, seconds % 60)
                Row {
                    Text(label, color = Color(0xFF93A1C0), modifier = Modifier.padding(end = 10.dp))
                    Text(event.text)
                }
            }
        }
    }
}

@Composable
private fun MetricsCard(lang: String) {
    SectionCard("⚡ ${I18n.t(lang, "monitoring")}") {
        Text("${I18n.t(lang, "localMs")}: ${CallSafetyState.metrics.localMs} ms")
        Text("${I18n.t(lang, "aiMs")}: ${CallSafetyState.metrics.aiMs} ms")
        Text("${I18n.t(lang, "total")}: ${CallSafetyState.metrics.totalMs} ms")
        CallSafetyState.analysis?.model?.let {
            if (it.isNotBlank()) Text("Model: $it", color = Color(0xFF93A1C0), fontSize = 13.sp)
        }
    }
}

@Composable
private fun PaymentFrictionDialog(lang: String) {
    var countdown by remember { mutableStateOf(3) }
    androidx.compose.runtime.LaunchedEffect(Unit) {
        while (countdown > 0) {
            kotlinx.coroutines.delay(1000)
            countdown -= 1
        }
    }

    AlertDialog(
        onDismissRequest = { CallSafetyState.frictionVisible = false },
        title = { Text("💰 ${I18n.t(lang, "paymentCheck")}") },
        text = { Text(I18n.t(lang, "paymentQ")) },
        confirmButton = {
            TextButton(
                onClick = { CallSafetyState.frictionVisible = false },
                enabled = countdown == 0,
            ) {
                Text(
                    I18n.t(lang, "proceed") + if (countdown > 0) " ($countdown)" else "",
                    color = Danger,
                )
            }
        },
        dismissButton = {
            TextButton(onClick = { CallSafetyState.frictionVisible = false }) {
                Text(I18n.t(lang, "cancel"))
            }
        },
    )
}

@Composable
private fun SectionCard(title: String, content: @Composable () -> Unit) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color(0xFF141C30)),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text(title, fontWeight = FontWeight.Bold, fontSize = 17.sp)
            content()
        }
    }
}

private fun riskLabel(lang: String, risk: String): String = when (risk) {
    "CRITICAL" -> I18n.t(lang, "riskCritical")
    "HIGH" -> I18n.t(lang, "riskHigh")
    "MEDIUM" -> I18n.t(lang, "riskMedium")
    else -> I18n.t(lang, "riskLow")
}