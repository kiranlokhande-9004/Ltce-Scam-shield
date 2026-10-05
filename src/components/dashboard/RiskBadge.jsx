import { useLang } from "../../i18nContext";

// Risk verdict badge + shared verdict metadata.
export const VERDICT = {
  SAFE: {
    label: "SAFE",
    labelKey: "verdictSafe",
    text: "text-safe",
    chip: "bg-safe/10 text-safe ring-1 ring-safe/25",
    dot: "bg-safe",
    bar: "bg-safe",
  },
  SUSPICIOUS: {
    label: "SUSPICIOUS",
    labelKey: "verdictSuspicious",
    text: "text-warn",
    chip: "bg-warn/10 text-warn ring-1 ring-warn/25",
    dot: "bg-warn",
    bar: "bg-warn",
  },
  DANGEROUS: {
    label: "DANGEROUS",
    labelKey: "verdictDangerous",
    text: "text-danger",
    chip: "bg-danger/10 text-danger ring-1 ring-danger/25",
    dot: "bg-danger",
    bar: "bg-danger",
  },
};

export function verdictMeta(verdict) {
  return VERDICT[String(verdict || "").toUpperCase()] || VERDICT.SUSPICIOUS;
}

export default function RiskBadge({ verdict, className = "" }) {
  const { t } = useLang();
  const meta = verdictMeta(verdict);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.12em] ${meta.chip} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {t(meta.labelKey)}
    </span>
  );
}