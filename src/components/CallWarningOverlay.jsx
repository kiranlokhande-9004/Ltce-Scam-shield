import { riskLabel } from "../i18n";

// Prominent scam warning shown above the dashboard when risk is HIGH/CRITICAL.
export default function CallWarningOverlay({
  t,
  lang,
  risk,
  organization,
  officialWebsite,
  credentialRisk,
  paymentRisk,
  onEndCall,
  onVerify,
}) {
  if (risk !== "HIGH" && risk !== "CRITICAL") return null;

  const credentialLine = credentialRisk
    ? t("indOtp")
    : t("sensitiveDetected");

  return (
    <div className={`call-warning ${risk === "CRITICAL" ? "critical" : "high"}`}>
      <div className="call-warning-head">
        🚨 {t("scamshieldWarning")}
      </div>

      <h2 className="call-warning-title">{t("possibleFraudCall")}</h2>

      <p className="call-warning-risk">
        {t("risk")}: <strong>{riskLabel(lang, risk)}</strong>
      </p>

      <p className="call-warning-reason">
        {organization && organization !== "Unknown"
          ? `${t("indImpersonation")} · ${organization}`
          : credentialLine}
      </p>

      <div className="call-warning-block">
        <span className="call-warning-block-title">{t("doNotShareList")}</span>
        <div className="chip-row">
          <span className="chip">OTP</span>
          <span className="chip">PIN</span>
          <span className="chip">CVV</span>
          <span className="chip">{t("indPassword")}</span>
        </div>
        {paymentRisk && (
          <p className="call-warning-pay">🚫 {t("actionDoNotPay")}</p>
        )}
      </div>

      <div className="call-warning-actions">
        <button className="btn-decline" onClick={onEndCall}>
          {t("endCall")}
        </button>
        <button className="btn-ghost" onClick={onVerify}>
          {t("verifyOrganization")}
        </button>
      </div>
    </div>
  );
}