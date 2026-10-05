import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, RefreshCw, ShieldAlert } from "lucide-react";
import RiskBadge, { verdictMeta } from "./RiskBadge";
import { buildExplanation, speak, stopSpeaking, speechSupported } from "../../voice";
import { useLang } from "../../i18nContext";

// Map the dashboard verdict to the risk levels the shared voice module uses.
const VERDICT_TO_RISK = {
  DANGEROUS: "HIGH",
  SUSPICIOUS: "MEDIUM",
  SAFE: "SAFE",
};

// Deterministic official-website status derived purely from the server result
// (local trusted-domain database). Never guesses, never opens the message URL.
function officialWebsiteInfo(result) {
  const org = result.organizationVerification || null;
  const urls = Array.isArray(result.urlVerification) ? result.urlVerification : [];
  const impersonated = urls.find((entry) => entry && entry.impersonation) || null;

  const name = org?.name || impersonated?.organization || null;
  const officialWebsite =
    org?.officialWebsite || impersonated?.officialWebsite || null;
  const messageUrl =
    org?.messageUrl || impersonated?.url || urls[0]?.url || null;

  if (!name || !officialWebsite) {
    return { status: "UNKNOWN", name, officialWebsite: null, messageUrl };
  }
  if (org?.status === "SUSPICIOUS" || (!org && impersonated)) {
    return { status: "MISMATCH", name, officialWebsite, messageUrl };
  }
  if (org?.status === "SAFE") {
    return { status: "VERIFIED", name, officialWebsite, messageUrl };
  }
  // Organization identified but there was no URL to compare against.
  return { status: "IDENTIFIED", name, officialWebsite, messageUrl };
}

export default function AnalysisResult({ result, onReset }) {
  const { lang, t } = useLang();
  const meta = verdictMeta(result.verdict);
  const score = Math.max(0, Math.min(100, Number(result.riskScore) || 0));

  const voiceSupported = speechSupported();
  const [speaking, setSpeaking] = useState(false);

  // Never keep talking after the component unmounts.
  useEffect(() => () => stopSpeaking(), []);

  function handleListen() {
    // Reuse the shared voice module: builds a short explanation from the
    // EXISTING result and speaks it in the selected app language.
    // No AI call is made for voice.
    const speakable = {
      ...result,
      riskLevel: VERDICT_TO_RISK[String(result.verdict || "").toUpperCase()],
    };
    const text = buildExplanation(speakable, lang);
    speak(text, lang, {
      onStart: () => setSpeaking(true),
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  }

  function handleStop() {
    stopSpeaking();
    setSpeaking(false);
  }

  const official = officialWebsiteInfo(result);
  const hasOfficialBlock =
    official.status !== "UNKNOWN" || Boolean(result.urlVerification?.length);

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="ss-card overflow-hidden p-6 sm:p-7"
    >
      <div className="flex items-center justify-between">
        <p className="ss-label">{t("scanResult")}</p>
        <RiskBadge verdict={result.verdict} />
      </div>

      <h2 className={`mt-3 font-display text-2xl font-bold ${meta.text}`}>
        {t(meta.labelKey)}
      </h2>
      <p className="mt-1 text-sm text-muted">{result.summary}</p>

      {/* Simple speaking assistant — browser Web Speech API only, no AI call. */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {voiceSupported ? (
          <>
            <button
              type="button"
              onClick={handleListen}
              disabled={speaking}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-xs font-semibold text-primary transition hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              🔊 {t("listen")}
            </button>
            <button
              type="button"
              onClick={handleStop}
              disabled={!speaking}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-xs font-semibold text-primary transition hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ⏹ {t("stop")}
            </button>
          </>
        ) : (
          <p className="text-xs text-muted">{t("voiceUnsupported")}</p>
        )}
      </div>

      {/* Risk score */}
      <div className="mt-5 rounded-2xl bg-app/70 p-5">
        <div className="flex items-end justify-between">
          <span className="ss-label">{t("riskScore")}</span>
          <span className="font-display text-xl font-bold text-ink">
            {score}
            <span className="text-sm font-medium text-muted"> / 100</span>
          </span>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full ${meta.bar}`}
          />
        </div>
      </div>

      {/* Indicators */}
      <div className="mt-6">
        <p className="ss-label">{t("detectedIndicators")}</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {result.indicators?.map((item, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
              className="flex items-start gap-2 rounded-xl bg-app/60 px-3 py-2.5 text-sm text-ink"
            >
              <CheckCircle2
                size={16}
                className={`mt-0.5 shrink-0 ${meta.text}`}
              />
              {item}
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Recommendation */}
      <div className="mt-6 rounded-2xl border border-gold/25 bg-gold/10 p-5">
        <p className="ss-label text-primary">{t("recommendationTitle")}</p>
        <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-ink">
          <ShieldAlert size={16} className="mt-0.5 shrink-0 text-gold" />
          {result.recommendation}
        </p>
      </div>

      {/* Official website + deterministic URL mismatch check */}
      {hasOfficialBlock && (
        <div className="mt-6 rounded-2xl border border-line bg-app/60 p-5">
          <p className="ss-label">{t("officialWebsite")}</p>

          {official.status === "MISMATCH" && (
            <div className="mt-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3">
              <p className="text-sm font-bold text-danger">
                ⚠️ {t("urlMismatchTitle")}
              </p>
              <p className="mt-1 text-sm text-ink">{t("urlMismatchBody")}</p>
            </div>
          )}

          {official.status === "VERIFIED" && (
            <p className="mt-3 text-sm text-safe">{t("linkMatchesOfficial")}</p>
          )}

          {official.officialWebsite ? (
            <>
              <div className="mt-3 flex flex-col gap-1">
                <span className="text-xs text-muted">
                  {official.name
                    ? t("officialWebsiteOf", { name: official.name })
                    : t("officialWebsitePlain")}
                </span>
                <span className="text-sm font-semibold text-ink">
                  {official.officialWebsite}
                </span>
              </div>
              {official.messageUrl && (
                <p className="mt-2 text-xs text-muted">
                  {t("linkFoundInMessage")}{" "}
                  <span className="font-medium text-ink/80">
                    {official.messageUrl}
                  </span>{" "}
                  ({t("neverOpenedAutomatically")})
                </p>
              )}
              <a
                href={official.officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold tracking-[0.12em] text-white transition hover:brightness-110"
              >
                🔗 {t("visitOfficialWebsite")}
              </a>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted">{t("unableToVerify")}</p>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-bold tracking-[0.14em] text-white transition hover:brightness-110"
        >
          <RefreshCw size={14} />
          {t("analyzeAnother")}
        </button>
        {result.model && (
          <span className="text-xs text-muted">
            {t("modelLabel")}: {result.model}
          </span>
        )}
        {result.source && (
          <span className="text-xs text-muted">
            {t("sourceLabel")}:{" "}
            {result.source === "ai" ? t("sourceAi") : t("sourceLocal")}
          </span>
        )}
      </div>
    </motion.section>
  );
}