import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { useLang } from "../../i18nContext";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const { t } = useLang();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3 shadow-soft ring-1 ring-line transition hover:ring-primary/30"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary font-display text-xs font-bold text-gold-soft">
          AJ
        </span>
        <span className="hidden text-sm font-semibold text-ink sm:block">
          Alex
        </span>
        <ChevronDown size={14} className="text-muted" />
      </button>

      {open && (
        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            key="profile-menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-2xl bg-white p-1.5 shadow-card ring-1 ring-line"
          >
            {[
              { icon: User, labelKey: "pmProfile" },
              { icon: Settings, labelKey: "pmPreferences" },
              { icon: LogOut, labelKey: "pmSignOut" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.labelKey}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink transition hover:bg-app"
                >
                  <Icon size={15} className="text-muted" />
                  {t(item.labelKey)}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}