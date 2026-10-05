import { useEffect, useMemo, useRef, useState } from "react";
import { riskLabel, speechLang } from "../i18n";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import {
  detectLocal,
  hasCredentialRisk,
  hasPaymentRisk,
  indicatorKeyForLabel,
} from "../callDetect";
import CallTimeline from "./CallTimeline";
import CallWarningOverlay from "./CallWarningOverlay";
import SafetyFrictionModal from "./SafetyFrictionModal";

const RISK_ORDER = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };

const DEMO_SCRIPT = [
  "Hello sir, I am calling from your bank.",
  "Your KYC has expired.",
  "Your account will be blocked today.",
  "Please tell me the OTP you received.",
];

const ANALYZE_DEBOUNCE_MS = 3000;

function maxRisk(a, b) {
  return (RISK_ORDER[a] ?? -1) >= (RISK_ORDER[b] ?? -1) ? a || b : b;
}

export default function CallSafetyDashboard({ lang, t }) {
  const [mode, setMode] = useState("mic");
  const [monitoring, setMonitoring] = useState(false);
  const [entries, setEntries] = useState([]);
  const [indicators, setIndicators] = useState(() => new Set());
  const [events, setEvents] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [metrics, setMetrics] = useState({ localMs: 0, aiMs: 0 });
  const [error, setError] = useState("");
  const [showScript, setShowScript] = useState(false);
  const [showFriction, setShowFriction] = useState(false);

  const startTimeRef = useRef(0);
  const finalTextRef = useRef("");
  const lastAnalyzedRef = useRef("");
  const inFlightRef = useRef(false);
  const pendingRef = useRef(false);
  const timerRef = useRef(null);
  const frictionShownRef = useRef(false);
  const officialRef = useRef(null);
  const localMsRef = useRef(0);
  const langRef = useRef(lang);

  const recognition = useSpeechRecognition({
    lang: speechLang(lang),
    onFinal: handleFinal,
  });

  // ----- helpers -----
  function timeLabel() {
    const base = startTimeRef.current || Date.now();
    const totalSeconds = Math.floor((Date.now() - base) / 1000);
    const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const ss = String(totalSeconds % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }

  function pushEvent(text, tone) {
    setEvents((prev) => [...prev, { time: timeLabel(), text, tone }]);
  }

  // Called for every FINAL speech result (real on-device transcription).
  function handleFinal(text) {
    const clean = String(text || "").trim();
    if (!clean) return;

    setEntries((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, time: timeLabel(), text: clean },
    ]);

    finalTextRef.current = `${finalTextRef.current} ${clean}`.trim();
    pushEvent(clean, "speech");

    // ---- LOCAL detection (instant, no AI) ----
    const t0 = performance.now();
    const keys = detectLocal(clean);
    const localMs = Math.round(performance.now() - t0);
    localMsRef.current += localMs;

    if (keys.length) {
      setIndicators((prev) => {
        const next = new Set(prev);
        keys.forEach((key) => next.add(key));
        return next;
      });
      keys.forEach((key) =>
        pushEvent(`⚠️ ${t(key)}`, "bad")
      );
    }

    setMetrics((prev) => ({ ...prev, localMs: localMsRef.current }));
    scheduleAnalysis();
  }

  // Debounced + deduped AI analysis.
  function scheduleAnalysis() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(runAnalysis, ANALYZE_DEBOUNCE_MS);
  }

  async function runAnalysis() {
    const text = finalTextRef.current.trim();
    if (!text) return;

    // Do not re-analyze the same transcript.
    if (text === lastAnalyzedRef.current) return;

    // Never run two AI requests at once.
    if (inFlightRef.current) {
      pendingRef.current = true;
      return;
    }

    inFlightRef.current = true;
    const started = performance.now();

    try {
      const response = await fetch("/api/call-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text, callerName: "", callerNumber: "" }),
      });

      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.error || "Call analysis failed.");
      }

      const result = data.analysis;
      const aiMs = Math.round(performance.now() - started);

      setAnalysis(result);
      lastAnalyzedRef.current = text;

      if (Array.isArray(result.indicators)) {
        setIndicators((prev) => {
          const next = new Set(prev);
          result.indicators.forEach((label) => {
            next.add(indicatorKeyForLabel(label) || label);
          });
          return next;
        });
      }

      setMetrics((prev) => ({
        localMs: prev.localMs,
        aiMs,
        totalMs: prev.localMs + aiMs,
      }));

      pushEvent(
        `🧠 ${t("aiAnalysis")} · ${riskLabel(lang, result.risk)}`,
        result.risk === "HIGH" || result.risk === "CRITICAL" ? "bad" : "info"
      );

      if (
        (result.paymentRisk || result.credentialRisk) &&
        !frictionShownRef.current
      ) {
        frictionShownRef.current = true;
        setShowFriction(true);
      }
    } catch (err) {
      setError(err.message || "Call analysis failed.");
      pushEvent(`⚠️ ${t("aiUnavailable")}`, "warn");
    } finally {
      inFlightRef.current = false;
      if (pendingRef.current) {
        pendingRef.current = false;
        scheduleAnalysis();
      }
    }
  }

  // ----- monitoring lifecycle -----
  function startMonitoring() {
    setError("");
    setEntries([]);
    setIndicators(new Set());
    setEvents([]);
    setAnalysis(null);
    setMetrics({ localMs: 0, aiMs: 0 });
    setShowScript(true);
    frictionShownRef.current = false;
    finalTextRef.current = "";
    lastAnalyzedRef.current = "";
    pendingRef.current = false;
    localMsRef.current = 0;
    startTimeRef.current = Date.now();

    pushEvent(`📞 ${t("incomingCallDetected")}`, "info");
    pushEvent(t("unknownCaller"), "info");

    const ok = recognition.start();
    setMonitoring(ok);

    if (ok) {
      pushEvent(`● ${t("monitoringActive")}`, "ok");
    } else {
      setError(t("micUnsupported"));
    }
  }

  function stopMonitoring() {
    recognition.stop();
    if (timerRef.current) clearTimeout(timerRef.current);
    setMonitoring(false);
    pushEvent(t("monitoringStopped"), "info");
  }

  function endCall() {
    stopMonitoring();
    setShowFriction(false);
  }

  function verifyOfficially() {
    if (officialRef.current) {
      officialRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  // Restart recognition when the language changes mid-monitoring.
  useEffect(() => {
    if (langRef.current === lang) return;
    langRef.current = lang;

    if (monitoring) {
      recognition.stop();
      const ok = recognition.start();
      setMonitoring(ok);
    }
  }, [lang, monitoring, recognition]);

  // Clean up timers on unmount.
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  // ----- derived values -----
  const indicatorList = useMemo(() => [...indicators], [indicators]);
  const credentialRisk = Boolean(analysis?.credentialRisk) || hasCredentialRisk(indicatorList);
  const paymentRisk = Boolean(analysis?.paymentRisk) || hasPaymentRisk(indicatorList);

  const localRisk = useMemo(() => {
    const count = indicatorList.length;
    if (credentialRisk) return "CRITICAL";
    if (paymentRisk && hasPaymentRisk(indicatorList) && indicatorList.length >= 2) {
      return "CRITICAL";
    }
    if (count >= 2) return "HIGH";
    if (count === 1) return "MEDIUM";
    return "LOW";
  }, [indicatorList, credentialRisk, paymentRisk]);

  const risk = analysis
    ? maxRisk(analysis.risk, localRisk)
    : indicatorList.length
      ? localRisk
      : null;

  const organization = analysis?.impersonatedOrganization || "Unknown";
  const officialWebsite = analysis?.officialWebsite || null;
  const score = analysis?.fraudScore ?? 0;
  const model = analysis?.model || "";

  const stageText =
    risk === "CRITICAL"
      ? t("otpCritical")
      : risk === "HIGH"
        ? t("urgencyDetected")
        : indicatorList.length
          ? t("sensitiveDetected")
          : "";

  const recommendedActions = [
    t("actionEndCall"),
    t("actionDoNotShare"),
    t("actionDoNotPay"),
    t("actionVerify"),
    t("actionReport"),
  ];

  return (
    <section className="call-safety">
      <p className="muted sim-note">🛡️ {t("callSafetyIntro")}</p>

      {/* Control panel */}
      <div className="card cs-controls">
        <div className="cs-controls-head">
          <span className={`pill ${monitoring ? "pill-live" : "pill-idle"}`}>
            {monitoring ? `🔴 ${t("monitoringActive")}` : `⚪ ${t("idle")}`}
          </span>
          <span className="cs-model">
            {model ? `${t("aiModel")}: ${model}` : ""}
          </span>
        </div>

        <div className="cs-mode">
          <label className={`cs-mode-option${mode === "mic" ? " active" : ""}`}>
            <input
              type="radio"
              name="cs-mode"
              checked={mode === "mic"}
              onChange={() => setMode("mic")}
            />
            <span>
              <strong>{t("modeB")}</strong>
              <em>{t("demoModeNote")}</em>
            </span>
          </label>
          <label className={`cs-mode-option${mode === "phone" ? " active" : ""}`}>
            <input
              type="radio"
              name="cs-mode"
              checked={mode === "phone"}
              onChange={() => setMode("phone")}
            />
            <span>
              <strong>{t("modeA")}</strong>
              <em>{t("callSafetyIntro")}</em>
            </span>
          </label>
        </div>

        <div className="actions">
          {!monitoring ? (
            <button
              className="btn-primary"
              onClick={startMonitoring}
              disabled={!recognition.supported}
            >
              ▶ {t("startLiveDemo")}
            </button>
          ) : (
            <button className="btn-decline" onClick={stopMonitoring}>
              ⏹ {t("stopMonitoring")}
            </button>
          )}
          <button
            className="btn-ghost"
            onClick={() => setShowScript((value) => !value)}
          >
            📜 {t("demoScript")}
          </button>
        </div>

        {!recognition.supported && (
          <div className="error" role="alert">
            ⚠️ {t("micUnsupported")}
          </div>
        )}

        <p className="muted cs-privacy">
          {monitoring ? `🔴 ${t("audioPrivacy")}` : `⚪ ${t("monitoringStoppedNote")}`}
        </p>
      </div>

      {/* Demo script */}
      {showScript && (
        <div className="card demo-script">
          <h2>📜 {t("demoScript")}</h2>
          <p className="muted">{t("demoReadAloud")}</p>
          <ol className="script-lines">
            {DEMO_SCRIPT.map((line, i) => (
              <li key={i}>“{line}”</li>
            ))}
          </ol>
        </div>
      )}

      {error && (
        <div className="error" role="alert">
          ⚠️ {error}
        </div>
      )}

      {/* Warning overlay */}
      <CallWarningOverlay
        t={t}
        lang={lang}
        risk={risk}
        organization={organization}
        officialWebsite={officialWebsite}
        credentialRisk={credentialRisk}
        paymentRisk={paymentRisk}
        onEndCall={endCall}
        onVerify={verifyOfficially}
      />

      {/* Dashboard stat cards */}
      <div className="cs-grid">
        <div className="card cs-stat">
          <span className="cs-stat-label">{t("caller")}</span>
          <span className="cs-stat-value">📱 {t("unknownCaller")}</span>
        </div>
        <div className="card cs-stat">
          <span className="cs-stat-label">{t("callStatus")}</span>
          <span className={`cs-stat-value ${monitoring ? "live" : ""}`}>
            {monitoring ? `● ${t("active")}` : `○ ${t("idle")}`}
          </span>
        </div>
        <div className="card cs-stat">
          <span className="cs-stat-label">{t("risk")}</span>
          <span className={`cs-stat-value ${risk ? `risk-${String(risk).toLowerCase()}` : ""}`}>
            {risk ? riskLabel(lang, risk) : "—"}
          </span>
        </div>
        <div className="card cs-stat">
          <span className="cs-stat-label">{t("aiAnalysis")}</span>
          <span className="cs-stat-value">{score}/100</span>
        </div>
      </div>

      {stageText && (
        <div className={`stage-banner stage-${String(risk || "low").toLowerCase()}`}>
          {stageText}
        </div>
      )}

      {/* Live transcript */}
      <div className="card">
        <h2>🗣️ {t("liveTranscript")}</h2>
        <div className="transcript live">
          {entries.length === 0 && !recognition.interim ? (
            <p className="muted">
              {monitoring ? t("transcriptPlaceholder") : t("monitoringStopped")}
            </p>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="bubble bubble-user">
                <span className="bubble-speaker">
                  {entry.time} · {t("caller")}
                </span>
                <span className="bubble-text">{entry.text}</span>
              </div>
            ))
          )}
          {recognition.interim && (
            <div className="bubble bubble-user interim">
              <span className="bubble-text">{recognition.interim}…</span>
            </div>
          )}
        </div>
      </div>

      {/* Indicators */}
      <div className="card">
        <h2>⚠️ {t("detectedIndicators")}</h2>
        {indicatorList.length === 0 ? (
          <p className="muted">{t("noIndicatorsYet")}</p>
        ) : (
          <div className="chip-row">
            {indicatorList.map((token) => (
              <span key={token} className="chip chip-bad">
                {token.startsWith("ind") ? t(token) : token}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Recommended action */}
      <div className="card safe">
        <h2>✅ {t("recommendedAction")}</h2>
        <ul className="bullet-list safe-list">
          {recommendedActions.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        {analysis?.explanation && (
          <p className="muted">🧠 {analysis.explanation}</p>
        )}
      </div>

      {/* Official verification */}
      <div className="card" ref={officialRef}>
        <h2>🔎 {t("verifyOrganization")}</h2>
        <p className="org-name">{organization}</p>
        {officialWebsite ? (
          <>
            <div className="info-row">
              <span className="info-label">{t("officialWebsite")}</span>
              <span className="info-value">{officialWebsite}</span>
            </div>
            <a
              className="btn-link"
              href={officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
            >
              🔗 {t("verifyOfficially")}
            </a>
          </>
        ) : (
          <p className="muted">{t("officialWebsiteUnavailable")}</p>
        )}
      </div>

      {/* Cybercrime response */}
      <div className={`card help-card${risk === "HIGH" || risk === "CRITICAL" ? " help-high" : ""}`}>
        <h2>🚨 {t("needHelp")}</h2>
        <div className="help-row">
          <span className="help-label">{t("cyberHelpline")}</span>
          <a className="help-phone" href="tel:1930">📞 1930</a>
        </div>
        <div className="help-actions">
          <a className="btn-link help-report" href="tel:1930">
            {t("call1930")}
          </a>
          <a
            className="btn-link help-report"
            href="https://www.cybercrime.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("reportCyber")}
          </a>
        </div>
      </div>

      {/* Timeline */}
      <CallTimeline events={events} t={t} />

      {/* Honest metrics */}
      <div className="card metrics">
        <h2>⚡ {t("monitoring")}</h2>
        <div className="metrics-grid">
          <span>{t("localDetection")}</span>
          <strong>{metrics.localMs} ms</strong>
          <span>{t("aiAnalysis")}</span>
          <strong>{metrics.aiMs} ms</strong>
          <span>{t("total")}</span>
          <strong>{(metrics.localMs || 0) + (metrics.aiMs || 0)} ms</strong>
          {model && (
            <>
              <span>{t("aiModel")}</span>
              <strong>{model}</strong>
            </>
          )}
        </div>
      </div>

      <SafetyFrictionModal
        t={t}
        open={showFriction}
        onCancel={() => setShowFriction(false)}
        onProceed={() => setShowFriction(false)}
      />
    </section>
  );
}