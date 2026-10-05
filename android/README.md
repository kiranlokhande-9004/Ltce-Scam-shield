# ScamShield — Android Call Safety Companion

Real, native Android companion app for the ScamShield web MVP. It does **not**
replace the screenshot analyzer; it adds real-time call protection that talks to
the **existing** backend (`POST /api/call-analyze`), which reuses the same
Kimi/Astra configuration (`KIMI_BASE_URL`, `KIMI_MODEL`, `KIMI_API_KEY`).
The API key lives **only** on the server — never in the Android app.

## What it really does

| Capability | Implementation |
|---|---|
| Call state detection | `CallStateMonitor` via `TelephonyCallback` (API 31+) / `PhoneStateListener` |
| Live transcription | Android `SpeechRecognizer` (on-device speech-to-text) |
| Local fraud detection | `LocalDetector` (OTP/PIN/CVV/UPI/KYC/threats…) — instant, no AI |
| AI analysis | Debounced POST to `/api/call-analyze` (one request at a time, deduped) |
| Warning | Compose banner + native high-priority notification + TTS |
| Official website | Deterministic, from the backend trusted-domain DB |
| Cybercrime | Real `tel:1930` dial intent + `cybercrime.gov.in` browser intent |
| Payment friction | 3-second countdown before "Proceed Anyway" |
| Languages | English / हिंदी / मराठी (`I18n.kt`) |

## Honest audio limitation (read this)

A normal Android app **cannot** silently capture both sides of every phone call
on every device. Android and OEMs restrict call-audio capture. This app therefore
supports two modes and is explicit about which is active:

- **Mode A · Real call monitoring** — uses `READ_PHONE_STATE` for call state and
  the permitted microphone path while a call is active. Availability depends on
  the device/OEM.
- **Mode B · Live microphone demo** — the judge/you speaks (or plays) the scam
  conversation into the phone microphone; `SpeechRecognizer` produces a real
  transcript. This is **real speech recognition, not a canned animation.**

The app never claims to intercept a call it did not, never secretly records, and
never uploads raw audio. Only the transcript text is sent to the backend.

## Permissions (only what is needed)

- `RECORD_AUDIO` — microphone transcription
- `READ_PHONE_STATE` — call state (RINGING / OFFHOOK / IDLE)
- `POST_NOTIFICATIONS` — the monitoring + warning notifications
- `FOREGROUND_SERVICE` (+ `_MICROPHONE`) — visible foreground mic service

No contacts, SMS, storage, location, accessibility or device-admin permissions.

## Build & run

Requirements: **JDK 17**, Android SDK (API 35), Android Studio (or Gradle 8.9+).

1. Start the ScamShield backend on your computer:
   ```bash
   npm start        # serves http://<your-lan-ip>:8787
   ```
2. Open the `android/` folder in Android Studio (it will create the Gradle
   wrapper automatically), or run:
   ```bash
   cd android
   gradle wrapper --gradle-version 8.9   # only needed once
   ./gradlew assembleDebug
   ```
3. Install `app/build/outputs/apk/debug/app-debug.apk` on the device.
4. In the app, set **Backend URL** to `http://<your-lan-ip>:8787` (phone and
   computer must be on the same network), tap **Grant Permission**, then
   **Start Live Call Demo**.

> Cleartext HTTP is enabled for the demo (`usesCleartextTraffic="true"`). Use
> HTTPS in production.

## Judge demo flow

1. Home tab **🛡️ Call Safety** in the web app shows the same dashboard.
2. Tap **Start Live Call Demo** → permission prompt → notification appears
   (“ScamShield · Call Safety Monitoring”).
3. Read the **Demo Script** aloud:
   > “Hello sir, I am calling from your bank. Your KYC has expired. Your account
   > will be blocked today. Please tell me the OTP you received.”
4. Watch: live transcript → ⚠️ KYC / account-threat indicators → 🚨 OTP request →
   **CRITICAL** warning banner + notification + spoken warning → timeline +
   honest local/AI timings.
5. **End Call** stops the microphone and the foreground service immediately.

## Source map

```
android/app/src/main/java/in/scamshield/callsafety/
  MainActivity.kt        Compose UI (dashboard, warning, friction, timeline)
  CallSafetyService.kt   Foreground service: mic + speech + call state + backend
  CallStateMonitor.kt    Real call-state detection
  CallAnalyzer.kt        HTTP client for /api/call-analyze (no API key)
  LocalDetector.kt       Instant local fraud detection
  CallSafetyState.kt     Observable shared state
  ScamWarning.kt         Native notifications
  Speaker.kt             TTS warnings (en-IN / hi-IN / mr-IN)
  Permissions.kt         Minimal permission set
  I18n.kt                en / hi / mr strings
```