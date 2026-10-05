import { ShieldAlert, ShieldCheck, TrendingUp } from "lucide-react";
import StatisticsChart from "../components/dashboard/StatisticsChart";
import { TOP_THREATS } from "../dashboardData";
import { useLang } from "../i18nContext";

const THREAT_KEYS = {
  "Bank impersonation": "threatBankImpersonation",
  "OTP / credential theft": "threatOtpTheft",
  "Fake links": "threatFakeLinks",
  "Prize / refund scams": "threatPrizeScams",
};

function StatCard({ icon: Icon, label, value, tone }) {
  const tones = {
    primary: "bg-primary text-gold-soft",
    danger: "bg-danger text-white",
    safe: "bg-safe text-white",
  };
  return (
    <div className="ss-card flex items-center gap-4 p-5">
      <span className={`grid h-11 w-11 place-items-center rounded-2xl ${tones[tone]}`}>
        <Icon size={19} />
      </span>
      <div>
        <p className="ss-label">{label}</p>
        <p className="mt-1 font-display text-xl font-bold text-ink">{value}</p>
      </div>
    </div>
  );
}

export default function ReportsPage({ scans }) {
  const { t } = useLang();
  const total = scans.length;
  const dangerous = scans.filter((scan) => scan.verdict === "DANGEROUS").length;
  const safe = scans.filter((scan) => scan.verdict === "SAFE").length;
  const safeRate = total ? Math.round((safe / total) * 100) : 0;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={TrendingUp} label={t("reportsTotalScans")} value={total} tone="primary" />
        <StatCard icon={ShieldAlert} label={t("reportsThreatsFound")} value={dangerous} tone="danger" />
        <StatCard icon={ShieldCheck} label={t("reportsSafeRate")} value={`${safeRate}%`} tone="safe" />
      </div>

      <StatisticsChart />

      <section className="ss-card p-6 sm:p-7">
        <h2 className="font-display text-lg font-semibold text-ink">
          {t("reportsMostCommonThreats")}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {t("reportsBasedOnScans")}
        </p>
        <div className="mt-5 space-y-4">
          {TOP_THREATS.map((threat) => (
            <div key={threat.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink">
                  {t(THREAT_KEYS[threat.label]) || threat.label}
                </span>
                <span className="text-muted">{threat.value}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-app">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${threat.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}