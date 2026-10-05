import { ShieldCheck } from "lucide-react";

export default function Logo({ withText = true }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gold text-primary-dark shadow-gold">
        <ShieldCheck size={20} strokeWidth={2.5} />
      </span>
      {withText && (
        <div className="leading-tight">
          <p className="font-display text-[13px] font-bold tracking-[0.18em] text-white">
            SCAMSHIELD
          </p>
          <p className="text-[9px] font-medium tracking-[0.28em] text-white/45">
            AI SECURITY
          </p>
        </div>
      )}
    </div>
  );
}