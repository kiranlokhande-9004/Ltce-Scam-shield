import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ACTIVITY_SERIES } from "../../dashboardData";

const LEGEND = [
  { label: "Safe", color: "#4F9D69" },
  { label: "Suspicious", color: "#D9A52B" },
  { label: "Dangerous", color: "#C95757" },
];

export default function StatisticsChart({ data = ACTIVITY_SERIES, showScanned = true }) {
  return (
    <section className="ss-card p-6 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">
            Your Security Activity
          </h2>
          <p className="mt-1 text-sm text-muted">
            Messages scanned and their risk breakdown.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {LEGEND.map((item) => (
            <span key={item.label} className="flex items-center gap-2 text-xs text-muted">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={22}>
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
              cursor={{ fill: "rgba(54,88,86,0.05)" }}
              contentStyle={{
                borderRadius: 14,
                border: "1px solid #E3EDEC",
                boxShadow: "0 16px 40px -24px rgba(38,58,57,0.4)",
                fontSize: 12,
              }}
            />
            {showScanned && (
              <Bar dataKey="scanned" fill="#365856" radius={[6, 6, 0, 0]} />
            )}
            <Bar dataKey="safe" stackId="risk" fill="#4F9D69" radius={[0, 0, 0, 0]} />
            <Bar dataKey="suspicious" stackId="risk" fill="#D9A52B" />
            <Bar dataKey="dangerous" stackId="risk" fill="#C95757" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}