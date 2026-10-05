import { motion } from "framer-motion";
import { CheckCircle2, RefreshCw, ShieldAlert } from "lucide-react";
import RiskBadge, { verdictMeta } from "./RiskBadge";

export default function AnalysisResult({ result, onReset }) {
  const meta = verdictMeta(result.verdict);
  const score = Math.max(0, Math.min(100, Number(result.riskScore) || 0));

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="ss-card overflow-hidden p-6 sm:p-7"
    >
      <div className="flex items-center justify-between">
        <p className="ss-label">Scan Result</p>
        <RiskBadge verdict={result.verdict} />
      </div>

      <h2 className={`mt-3 font-display text-2xl font-bold ${meta.text}`}>
        {meta.label}
      </h2>
      <p className="mt-1 text-sm text-muted">{result.summary}</p>

      {/* Risk score */}
      <div className="mt-5 rounded-2xl bg-app/70 p-5">
        <div className="flex items-end justify-between">
          <span className="ss-label">Risk Score</span>
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
        <p className="ss-label">Detected Indicators</p>
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
        <p className="ss-label text-primary">Recommendation</p>
        <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-ink">
          <ShieldAlert size={16} className="mt-0.5 shrink-0 text-gold" />
          {result.recommendation}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-bold tracking-[0.14em] text-white transition hover:brightness-110"
        >
          <RefreshCw size={14} />
          ANALYZE ANOTHER MESSAGE
        </button>
        {result.model && (
          <span className="text-xs text-muted">Model: {result.model}</span>
        )}
        {result.source && (
          <span className="text-xs text-muted">
            Source: {result.source === "ai" ? "ScamShield AI" : "Local engine"}
          </span>
        )}
      </div>
    </motion.section>
  );
}