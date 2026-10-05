import { motion } from "framer-motion";

export default function QuickActionCard({
  icon: Icon,
  title,
  description,
  tone = "primary",
  onClick,
}) {
  const tones = {
    primary: "bg-primary text-gold-soft",
    gold: "bg-gold text-primary-dark",
    safe: "bg-safe text-white",
    soft: "bg-app text-primary",
  };

  return (
    <motion.button
      type="button"
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      onClick={onClick}
      className="ss-card group flex h-full flex-col items-start gap-3 p-5 text-left transition-shadow hover:shadow-soft"
    >
      <span
        className={`grid h-11 w-11 place-items-center rounded-2xl ${tones[tone]}`}
      >
        <Icon size={19} strokeWidth={2.1} />
      </span>
      <div>
        <p className="font-display text-sm font-semibold text-ink">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p>
      </div>
    </motion.button>
  );
}