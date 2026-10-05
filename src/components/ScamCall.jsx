import { useEffect, useRef, useState } from "react";
import {
  CALL_SCRIPT,
  detectIndicators,
  indicatorLabelKey,
  ATTACK_CHAIN_STEP_KEYS,
} from "../scamCallData";

// Screens of the simulated call.
const PHASE = {
  IDLE: "idle",
  RINGING: "ringing",
  ACTIVE: "active",
  DETECTED: "detected",
  ENDED: "ended",
};

export default function ScamCall({ t }) {
  const [phase, setPhase] = useState(PHASE.IDLE);
  const [messages, setMessages] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const timersRef = useRef([]);
  const bodyRef = useRef(null);

  function clearTimers() {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
  }

  // Clean up any pending timers on unmount.
  useEffect(() => () => clearTimers(), []);

  // Auto-scroll the transcript as lines arrive.
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages]);

  function startRinging() {
    clearTimers();
    setMessages([]);
    setIndicators([]);
    setPhase(PHASE.RINGING);
  }

  function answer() {
    clearTimers();
    setMessages([]);
    setIndicators([]);
    setPhase(PHASE.ACTIVE);

    let elapsed = 500;

    CALL_SCRIPT.forEach((line) => {
      elapsed += line.delay;

      const id = setTimeout(() => {
        setMessages((prev) => [...prev, line]);

        const found = detectIndicators(line.text);
        if (found.length) {
          setIndicators((prev) => {
            const merged = new Set([...prev, ...found]);
            return [...merged];
          });
        }
      }, elapsed);

      timersRef.current.push(id);
    });

    // After the last line, reveal the scam-detected verdict.
    const detectId = setTimeout(() => {
      setPhase(PHASE.DETECTED);
    }, elapsed + 1200);
    timersRef.current.push(detectId);
  }

  function endCall() {
    clearTimers();
    setPhase(PHASE.ENDED);
  }

  function restart() {
    clearTimers();
    setMessages([]);
    setIndicators([]);
    setPhase(PHASE.IDLE);
  }

  const sensitive = [
    t("doNotShareOtp"),
    t("doNotSharePin"),
    t("doNotShareCvv"),
    t("doNotSharePassword"),
  ];

  return (
    <section className="call-mode">
      <p className="muted sim-note">🛡️ {t("simulateNote")}</p>

      {/* ---- Idle ---- */}
      {phase === PHASE.IDLE && (
        <div className="card call-card">
          <div className="call-icon">📞</div>
          <h2>{t("modeCall")}</h2>
          <button className="btn-primary" onClick={startRinging}>
            {t("simulateCall")}
          </button>
        </div>
      )}

      {/* ---- Ringing ---- */}
      {phase === PHASE.RINGING && (
        <div className="card call-card ringing">
          <div className="call-icon pulse">📞</div>
          <span className="call-status">📞 {t("incomingCall")}</span>
          <p className="call-number">{t("unknownNumber")}</p>
          <p className="call-number">+91 XXXXX XXXXX</p>
          <span className="badge badge-bad">⚠️ {t("possibleFraud")}</span>
          <div className="call-actions">
            <button className="btn-decline" onClick={restart}>
              {t("decline")}
            </button>
            <button className="btn-answer" onClick={answer}>
              {t("answer")}
            </button>
          </div>
        </div>
      )}

      {/* ---- Active / Detected ---- */}
      {(phase === PHASE.ACTIVE || phase === PHASE.DETECTED) && (
        <div className="card call-card">
          <div className="call-head">
            <span className="call-icon small">📞</span>
            <div>
              <span className="call-status">
                {t("callInProgress")} · {t("unknownNumber")}
              </span>
              <p className="call-org">
                {t("claimedOrganization")}: <strong>State Bank of India</strong>
              </p>
            </div>
          </div>

          <div className="transcript" ref={bodyRef}>
            {messages.map((line, i) => (
              <div key={i} className={`bubble bubble-${line.speaker}`}>
                <span className="bubble-speaker">
                  {line.speaker === "caller" ? t("caller") : t("you")}
                </span>
                <span className="bubble-text">{line.text}</span>
              </div>
            ))}
          </div>

          {indicators.length > 0 && (
            <div className="indicators">
              {indicators.map((key) => (
                <span key={key} className="badge badge-bad">
                  ⚠️ {t(indicatorLabelKey(key))}
                </span>
              ))}
            </div>
          )}

          {phase === PHASE.DETECTED && (
            <>
              <div className="scam-detected">
                <h2>🚨 {t("scamDetected")}</h2>
                <div className="indicators">
                  {indicators.map((key) => (
                    <span key={key} className="badge badge-bad">
                      ⚠️ {t(indicatorLabelKey(key))}
                    </span>
                  ))}
                </div>
              </div>

              <div className="do-not-share">
                <h3>🛑 {t("doNotShare")}</h3>
                <ul className="bullet-list safe-list">
                  {sensitive.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="card chain-card">
                <h2>⛓️ {t("callChainTitle")}</h2>
                <ol className="chain">
                  {ATTACK_CHAIN_STEP_KEYS.map((key, i) => (
                    <li key={key}>
                      <span className="chain-dot">{i + 1}</span>
                      <span>{t(key)}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </>
          )}

          <div className="call-actions">
            <button className="btn-decline" onClick={endCall}>
              {t("endCall")}
            </button>
          </div>
        </div>
      )}

      {/* ---- Ended ---- */}
      {phase === PHASE.ENDED && (
        <div className="card call-card">
          <div className="call-icon">📵</div>
          <h2>{t("callEnded")}</h2>
          <p className="muted">{t("callEndedNote")}</p>
          <button className="btn-primary" onClick={restart}>
            {t("restartCall")}
          </button>
        </div>
      )}
    </section>
  );
}