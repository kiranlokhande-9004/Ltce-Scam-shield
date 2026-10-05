import RecentScans from "../components/dashboard/RecentScans";
import RiskBadge from "../components/dashboard/RiskBadge";
import { useLang } from "../i18nContext";

export default function ScanHistoryPage({ scans, onView }) {
  const { t } = useLang();
  const counts = scans.reduce(
    (acc, scan) => {
      acc[scan.verdict] = (acc[scan.verdict] || 0) + 1;
      return acc;
    },
    { SAFE: 0, SUSPICIOUS: 0, DANGEROUS: 0 }
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        {Object.entries(counts).map(([verdict, count]) => (
          <div key={verdict} className="ss-card flex items-center justify-between p-5">
            <div>
              <p className="ss-label">
                {t(
                  verdict === "SAFE"
                    ? "verdictSafe"
                    : verdict === "DANGEROUS"
                      ? "verdictDangerous"
                      : "verdictSuspicious"
                )}
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-ink">{count}</p>
            </div>
            <RiskBadge verdict={verdict} />
          </div>
        ))}
      </div>

      <RecentScans scans={scans} onView={onView} showViewAll={false} />
    </div>
  );
}