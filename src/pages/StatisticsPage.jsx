import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import StatisticsChart from "../components/dashboard/StatisticsChart";
import { ACTIVITY_SERIES } from "../dashboardData";

export default function StatisticsPage() {
  const totalScanned = ACTIVITY_SERIES.reduce((sum, d) => sum + d.scanned, 0);
  const peak = ACTIVITY_SERIES.reduce((best, d) => (d.scanned > best.scanned ? d : best));
  const avg = Math.round(totalScanned / ACTIVITY_SERIES.length);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="ss-card p-5">
          <p className="ss-label">Scanned This Week</p>
          <p className="mt-1 font-display text-2xl font-bold text-ink">{totalScanned}</p>
        </div>
        <div className="ss-card p-5">
          <p className="ss-label">Daily Average</p>
          <p className="mt-1 font-display text-2xl font-bold text-ink">{avg}</p>
        </div>
        <div className="ss-card p-5">
          <p className="ss-label">Busiest Day</p>
          <p className="mt-1 font-display text-2xl font-bold text-ink">
            {peak.day} · {peak.scanned}
          </p>
        </div>
      </div>

      <StatisticsChart />

      <section className="ss-card p-6 sm:p-7">
        <h2 className="font-display text-lg font-semibold text-ink">
          Scan Volume Trend
        </h2>
        <div className="mt-5 h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ACTIVITY_SERIES}>
              <defs>
                <linearGradient id="scanFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#365856" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#365856" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#E3EDEC" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#7A8A89", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={28}
                tick={{ fill: "#7A8A89", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 14,
                  border: "1px solid #E3EDEC",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="scanned"
                stroke="#365856"
                strokeWidth={2.5}
                fill="url(#scanFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}