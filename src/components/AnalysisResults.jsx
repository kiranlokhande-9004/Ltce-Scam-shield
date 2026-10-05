import { useEffect, useState } from "react";
import { riskLabel } from "../i18n";
import {
  buildExplanation,
  speak,
  stopSpeaking,
  speechSupported,
} from "../voice";

const RISK_META = {
  HIGH: { className: "risk-high", icon: "🚨" },
  MEDIUM: { className: "risk-medium", icon: "⚠️" },
  LOW: { className: "risk-low", icon: "🟢" },
  SAFE: { className: "risk-safe", icon: "✅" },
};

function riskMeta(level) {
  return (
    RISK_META[String(level || "").toUpperCase()] || {
      className: "risk-medium",
      icon: "❔",
    }
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value || "—"}</span>
    </div>
  );
}

function BulletList({ items, emptyText }) {
  if (!items || items.length === 0) {
    return <p className="muted">{emptyText}</p>;
  }

  return (
    <ul className="bullet-list">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function StatusBadge({ status, t }) {
  const key = String(status || "UNKNOWN").toUpperCase();
  const label =
    key === "SAFE"
      ? t("statusSafe")
      : key === "SUSPICIOUS"
        ? t("statusSuspicious")
        : t("statusUnknown");
  const cls =
    key === "SAFE"
      ? "badge badge-safe"
      : key === "SUSPICIOUS"
        ? "badge badge-bad"
        : "badge badge-warn";

  return <span className={cls}>{label}</span>;
}

function OfficialLink({ url, t }) {
  if (!url) return null;
  return (
    <a
      className="btn-link"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      🔗 {t("visitOfficial")}
    </a>
  );
}

export default function AnalysisResults({ analysis, lang, t }) {
  const [speaking, setSpeaking] = useState(false);
  const supported = speechSupported();

  // Never keep talking after unmount / language change.
  useEffect(() => () => stopSpeaking(), []);
  useEffect(() => {
    stopSpeaking();
    setSpeaking(false);
  }, [lang]);

  const meta = riskMeta(analysis.riskLevel);
  const risk = String(analysis.riskLevel || "").toUpperCase();
  const highRisk = risk === "HIGH" || risk === "CRITICAL";

  const org = analysis.organizationVerification;

  const fallbackChain = [
    t("callChain1"),
    t("callChain2"),
    t("callChain3"),
    t("callChain4"),
  ];
  const chain = analysis.attackChain?.length
    ? analysis.attackChain
    : fallbackChain;

  const fallbackActions = [
    t("doNotClick"),
    t("doNotShareOtp"),
    t("doNotSharePin"),
    t("doNotShareCvv"),
    t("doNotSharePassword"),
    t("verifyOfficial"),
    t("contactOfficialNumber"),
    t("report1930"),
  ];
  const safeActions = analysis.safeActions?.length
    ? analysis.safeActions
    : fallbackActions;

  const urls = analysis.urlVerification || [];

  function toggleVoice() {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }

    const text = buildExplanation(analysis, lang);
    const started = speak(text, lang, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });

    if (!started) setSpeaking(false);
  }

  return (
    <section className="results">
      {/* 1. Risk header + voice explanation */}
      <div className={`card risk-card ${meta.className}`}>
        <div className="risk-icon">{meta.icon}</div>
        <div className="risk-body">
          <span className="risk-label">{t("verdict")}</span>
          <h2 className="risk-title">{riskLabel(lang, analysis.riskLevel)}</h2>
        </div>
        <div className="voice-actions">
          <button
            type="button"
            className={`btn-voice${speaking ? " btn-voice-active" : ""}`}
            onClick={toggleVoice}
            disabled={!supported}
            title={t("voiceTitle")}
          >
            {speaking ? `⏹ ${t("stop")}` : `🔊 ${t("listen")}`}
          </button>
        </div>
      </div>

      {!supported && (
        <p className="muted voice-note">🔇 {t("voiceUnsupported")}</p>
      )}

      {/* 2. Organization + official website verification */}
      <div className="card">
        <h2>🏦 {t("organization")}</h2>
        <p className="org-name">{analysis.organization}</p>

        {org && org.identified ? (
          <div className="official-block">
            <InfoRow label={t("officialWebsite")} value={org.officialWebsite} />
            {org.messageUrl && (
              <InfoRow label={t("detectedUrl")} value={org.messageUrl} />
            )}
            <div className="info-row">
              <span className="info-label">{t("result")}</span>
              <span className="info-value">
                <StatusBadge status={org.status} t={t} />
              </span>
            </div>
            <p className="muted">{org.reason}</p>
            <OfficialLink url={org.officialWebsite} t={t} />
          </div>
        ) : (
          <p className="muted">{t("orgNotConfident")}</p>
        )}
      </div>

      {/* 3 & 4. What the message claims / what the attacker wants */}
      <div className="card">
        <h2>📋 {t("summary")}</h2>
        <InfoRow label={t("claim")} value={analysis.claim} />
        <InfoRow label={t("requestedAction")} value={analysis.requestedAction} />
        <InfoRow label={t("urgency")} value={analysis.urgency} />
      </div>

      {/* 5. Suspicious evidence */}
      <div className="card">
        <h2>🔎 {t("suspiciousEvidence")}</h2>
        <BulletList
          items={analysis.suspiciousPhrases}
          emptyText={t("noEvidence")}
        />

        <h3>{t("whySuspicious")}</h3>
        <BulletList items={analysis.reasons} emptyText={t("noReason")} />
      </div>

      {/* 6. Attack chain */}
      <div className="card">
        <h2>⛓️ {t("attackChain")}</h2>
        {chain.length ? (
          <ol className="chain">
            {chain.map((step, i) => (
              <li key={i}>
                <span className="chain-dot">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="muted">{t("noChain")}</p>
        )}
      </div>

      {/* 7 & 8. URL verification */}
      <div className="card">
        <h2>🌐 {t("urlVerification")}</h2>

        {urls.length ? (
          urls.map((item, i) => (
            <div
              className={`url ${
                item.isOfficial
                  ? "url-good"
                  : item.impersonation
                    ? "url-bad"
                    : "url-warn"
              }`}
              key={i}
            >
              <div className="url-head">
                <span className="url-title">{t("detectedUrl")}</span>
                <StatusBadge status={item.status} t={t} />
              </div>
              <p className="url-value">{item.url}</p>
              <InfoRow
                label={t("officialDomain")}
                value={item.officialWebsite || t("orgUnknown")}
              />
              <InfoRow
                label={t("reason")}
                value={item.assessment || t("verifyUnavailable")}
              />
              <OfficialLink url={item.officialWebsite} t={t} />
            </div>
          ))
        ) : (
          <p className="muted">{t("noUrl")}</p>
        )}
      </div>

      {/* 9. Safe actions */}
      <div className="card safe">
        <h2>✅ {t("safeActions")}</h2>
        <ul className="bullet-list safe-list">
          {safeActions.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      {/* 11. Indian cybercrime reporting */}
      <div className={`card help-card${highRisk ? " help-high" : ""}`}>
        <h2>{highRisk ? "🚨" : "ℹ️"} {t("needHelp")}</h2>
        <div className="help-row">
          <span className="help-label">{t("cyberHelpline")}</span>
          <a className="help-phone" href="tel:1930">
            📞 1930
          </a>
        </div>
        <p className="muted">{t("cyberNote")}</p>
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
    </section>
  );
}