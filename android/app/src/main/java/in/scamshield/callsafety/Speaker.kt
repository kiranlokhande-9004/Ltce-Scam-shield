package in.scamshield.callsafety

import android.content.Context
import android.speech.tts.TextToSpeech
import java.util.Locale

// Spoken warnings using the device TTS engine (English / Hindi / Marathi).
object Speaker {
    private var tts: TextToSpeech? = null
    private var ready = false

    fun init(context: Context) {
        if (tts != null) return
        tts = TextToSpeech(context) { status ->
            ready = status == TextToSpeech.SUCCESS
        }
    }

    fun speak(lang: String, text: String) {
        val engine = tts ?: return
        if (!ready) return
        engine.language = when (lang) {
            "hi" -> Locale("hi", "IN")
            "mr" -> Locale("mr", "IN")
            else -> Locale("en", "IN")
        }
        engine.speak(text, TextToSpeech.QUEUE_FLUSH, null, "scamshield")
    }

    fun shutdown() {
        tts?.stop()
        tts?.shutdown()
        tts = null
        ready = false
    }
}