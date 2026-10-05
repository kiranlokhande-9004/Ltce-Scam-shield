import {
  LayoutDashboard,
  ShieldAlert,
  Link2,
  History,
  FileText,
  BarChart3,
  PhoneCall,
  Settings,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import Logo from "./Logo";
import { useLang } from "../../i18nContext";

export const NAV_ITEMS = [
  { id: "dashboard", labelKey: "navDashboard", icon: LayoutDashboard },
  { id: "scan-message", labelKey: "navScanMessage", icon: ShieldAlert },
  { id: "scan-url", labelKey: "navScanUrl", icon: Link2 },
  { id: "history", labelKey: "navHistory", icon: History },
  { id: "reports", labelKey: "navReports", icon: FileText },
  { id: "statistics", labelKey: "navStatistics", icon: BarChart3 },
  { id: "call-safety", labelKey: "navCallSafety", icon: PhoneCall },
  { id: "settings", labelKey: "navSettings", icon: Settings },
];

function SidebarContent({ page, onNavigate }) {
  const { t } = useLang();

  return (
    <div className="flex h-full flex-col">
      <div className="px-2 pb-6">
        <Logo />
      </div>

      <div className="mb-6 flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-soft font-display text-sm font-bold text-primary-dark">
          AJ
        </span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold text-white">Alex Johnson</p>
          <p className="truncate text-[11px] text-white/45">
            alex.johnson@email.com
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = page === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`ss-nav-item ${
                active ? "ss-nav-item-active" : ""
              } text-left`}
            >
              <Icon size={17} strokeWidth={2} />
              <span className="font-medium">{t(item.labelKey)}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-6 rounded-2xl bg-white/5 p-4">
        <p className="text-[10px] font-semibold tracking-[0.18em] text-white/40">
          {t("securityStatus")}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-safe opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-safe" />
          </span>
          <span className="text-sm font-semibold text-white">
            {t("protectionActive")}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ page, onNavigate, open, onClose }) {
  const { t } = useLang();

  function navigate(id) {
    onNavigate(id);
    onClose?.();
  }

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-[250px] shrink-0 rounded-xl4 bg-primary px-4 py-6 shadow-card lg:block">
        <SidebarContent page={page} onNavigate={navigate} />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-primary-dark/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "tween", duration: 0.25 }}
            className="absolute left-0 top-0 h-full w-[270px] rounded-r-xl4 bg-primary px-4 py-6 shadow-card"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-5 text-white/60 hover:text-white"
              aria-label={t("headerCloseMenu")}
            >
              <X size={18} />
            </button>
            <SidebarContent page={page} onNavigate={navigate} />
          </motion.aside>
        </div>
      )}
    </>
  );
}