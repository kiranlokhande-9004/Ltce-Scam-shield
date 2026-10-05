import { motion } from "framer-motion";
import { Activity, ShieldCheck, TrendingUp } from "lucide-react";
import { TOP_THREATS } from "../../dashboardData";

function Donut({ value }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);

  return (
    <div className="relative mx-auto h-[150px] w-[150px]">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="11"
        />
        <motion.circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#D8A928"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="font-display text-3xl font-bold text-white">{value}%</p>
          <p className="mt-0.5 text-[10px] font-semibold tracking-[0.16em] text-white/50">
            PROTECTION SCORE
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SecurityOverview({ threats = 24, scanned = 128, score = 94 }) {
  return (
    <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-[300px]">
      <div className="flex h-full flex-col rounded-xl4 bg-primary p-6 text-white shadow-card">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10">
            <ShieldCheck size={17} className="text-gold-soft" />
          </span>
          <h2 className="font-display text-sm font-semibold tracking-wide">
            Security Overview
          </h2>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-white/45">
              THREATS DETECTED
            </p>
            <p className="mt-2 font-display text-2xl font-bold text-gold-soft">
              {threats}
            </p>
          </div>
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-white/45">
              MESSAGES SCANNED
            </p>
            <p className="mt-2 font-display text-2xl font-bold">{scanned}</p>
          </div>
        </div>

        <div className="mt-6">
          <Donut value={score} />
        </div>
        <p className="mt-4 text-center text-xs leading-relaxed text-white/60">
          ScamShield is actively monitoring your recent scans.
        </p>

        <div className="my-6 h-px bg-white/10" />

        <div className="flex items-center justify-between text-[10px] font-semibold tracking-[0.14em] text-white/45">
          <span className="flex items-center gap-1.5">
            <Activity size={12} className="text-gold-soft" /> LAST 24H
          </span>
          <span className="flex items-center gap-1.5">
            <TrendingUp size={12} className="text-gold-soft" /> TRENDING
          </span>
        </div>

        <div className="mt-4 space-y-4">
          {TOP_THREATS.map((threat, index) => (
            <div key={threat.label}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/70">{threat.label}</span>
                <span className="text-white/45">{threat.value}%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${threat.value}%` }}
                  transition={{ duration: 0.9, delay: 0.1 * index }}
                  className="h-full rounded-full bg-gold-soft"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}