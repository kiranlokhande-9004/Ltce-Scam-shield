import { ArrowRight } from "lucide-react";
import RiskBadge from "./RiskBadge";
import { useLang } from "../../i18nContext";

export function scanTypeLabel(type) {
  return String(type || "").toUpperCase();
}

export default function RecentScans({
  scans,
  onView,
  onViewAll,
  showViewAll = true,
}) {
  const { t } = useLang();

  return (
    <section className="ss-card p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ink">
          {t("recentScans")}
        </h2>
        {showViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-semibold text-primary transition hover:border-primary/40"
          >
            {t("viewAll")}
            <ArrowRight size={13} />
          </button>
        )}
      </div>

      {/* Desktop table */}
      <div className="mt-4 hidden overflow-hidden rounded-2xl border border-line md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-app/70 text-[11px] uppercase tracking-[0.12em] text-muted">
              <th className="px-5 py-3 font-semibold">{t("colType")}</th>
              <th className="px-5 py-3 font-semibold">{t("colPreview")}</th>
              <th className="px-5 py-3 font-semibold">{t("colDate")}</th>
              <th className="px-5 py-3 font-semibold">{t("colRisk")}</th>
              <th className="px-5 py-3 font-semibold text-right">
                {t("colAction")}
              </th>
            </tr>
          </thead>
          <tbody>
            {scans.map((scan) => (
              <tr
                key={scan.id}
                className="border-t border-line/70 transition hover:bg-app/50"
              >
                <td className="px-5 py-4">
                  <span className="rounded-lg bg-app px-2.5 py-1 text-[11px] font-bold tracking-wide text-primary">
                    {scanTypeLabel(scan.type)}
                  </span>
                </td>
                <td className="max-w-[260px] truncate px-5 py-4 text-ink">
                  {scan.preview}
                </td>
                <td className="px-5 py-4 text-muted">{scan.date}</td>
                <td className="px-5 py-4">
                  <RiskBadge verdict={scan.verdict} />
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onView?.(scan)}
                    className="text-xs font-semibold text-primary hover:text-gold"
                  >
                    {t("viewAction")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="mt-4 grid gap-3 md:hidden">
        {scans.map((scan) => (
          <button
            key={scan.id}
            type="button"
            onClick={() => onView?.(scan)}
            className="rounded-2xl border border-line p-4 text-left transition hover:bg-app/50"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-app px-2.5 py-1 text-[11px] font-bold text-primary">
                {scanTypeLabel(scan.type)}
              </span>
              <RiskBadge verdict={scan.verdict} />
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-ink">{scan.preview}</p>
            <p className="mt-1 text-xs text-muted">{scan.date}</p>
          </button>
        ))}
      </div>
    </section>
  );
}