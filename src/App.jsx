import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./components/dashboard/Sidebar";
import Header from "./components/dashboard/Header";
import SecurityOverview from "./components/dashboard/SecurityOverview";
import DashboardPage from "./pages/DashboardPage";
import ScanPage from "./pages/ScanPage";
import ScanHistoryPage from "./pages/ScanHistoryPage";
import ReportsPage from "./pages/ReportsPage";
import StatisticsPage from "./pages/StatisticsPage";
import SettingsPage from "./pages/SettingsPage";
import CallSafetyPage from "./pages/CallSafetyPage";
import { useScanner } from "./hooks/useScanner";
import { loadScans, prependScan, resetScans } from "./services/scanStore";
import { useLang } from "./i18nContext";

// Per-page header copy (translation keys, resolved with the active language).
const HEADER_KEYS = {
  dashboard: {
    greeting: "hdrDashboardGreeting",
    title: "hdrDashboardTitle",
    support: "hdrDashboardSupport",
  },
  "scan-message": {
    greeting: "hdrScanMessageGreeting",
    title: "hdrScanMessageTitle",
    support: "hdrScanMessageSupport",
  },
  "scan-url": {
    greeting: "hdrScanUrlGreeting",
    title: "hdrScanUrlTitle",
    support: "hdrScanUrlSupport",
  },
  history: {
    greeting: "hdrHistoryGreeting",
    title: "hdrHistoryTitle",
    support: "hdrHistorySupport",
  },
  reports: {
    greeting: "hdrReportsGreeting",
    title: "hdrReportsTitle",
    support: "hdrReportsSupport",
  },
  statistics: {
    greeting: "hdrStatisticsGreeting",
    title: "hdrStatisticsTitle",
    support: "hdrStatisticsSupport",
  },
  settings: {
    greeting: "hdrSettingsGreeting",
    title: "hdrSettingsTitle",
    support: "hdrSettingsSupport",
  },
  "call-safety": {
    greeting: "hdrCallSafetyGreeting",
    title: "hdrCallSafetyTitle",
    support: "hdrCallSafetySupport",
  },
};

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scans, setScans] = useState(() => loadScans());

  // App-wide language + translator (shared with every screen and the voice).
  const { lang, setLang, t } = useLang();

  const scanner = useScanner({
    onScanComplete: (scan) => setScans((prev) => prependScan(scan, prev)),
  });

  function navigate(nextPage) {
    setPage(nextPage);
    setMenuOpen(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function viewScan(scan) {
    scanner.loadScan(scan);
    setPage("scan-message");
  }

  function handleReset() {
    setScans(resetScans());
  }

  const headerKeys = HEADER_KEYS[page] || HEADER_KEYS.dashboard;
  const header = {
    greeting: t(headerKeys.greeting),
    title: t(headerKeys.title),
    support: t(headerKeys.support),
  };

  const threats = scans.filter((scan) => scan.verdict === "DANGEROUS").length;
  const safeCount = scans.filter((scan) => scan.verdict === "SAFE").length;
  const protectionScore = scans.length
    ? Math.round((safeCount / scans.length) * 100)
    : 94;

  function renderPage() {
    switch (page) {
      case "scan-message":
        return (
          <ScanPage
            scanner={scanner}
            scans={scans}
            onView={viewScan}
            onNavigate={navigate}
            defaultType="message"
          />
        );
      case "scan-url":
        return (
          <ScanPage
            scanner={scanner}
            scans={scans}
            onView={viewScan}
            onNavigate={navigate}
            defaultType="url"
          />
        );
      case "history":
        return <ScanHistoryPage scans={scans} onView={viewScan} />;
      case "reports":
        return <ReportsPage scans={scans} />;
      case "statistics":
        return <StatisticsPage />;
      case "settings":
        return (
          <SettingsPage lang={lang} setLang={setLang} onReset={handleReset} />
        );
      case "call-safety":
        return <CallSafetyPage lang={lang} t={t} />;
      default:
        return (
          <DashboardPage
            scanner={scanner}
            scans={scans}
            onNavigate={navigate}
            onView={viewScan}
          />
        );
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[1440px] gap-6 p-4 sm:p-6">
      <Sidebar
        page={page}
        onNavigate={navigate}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-6 lg:flex-row">
        <div className="min-w-0 flex-1">
          <Header
            greeting={header.greeting}
            title={header.title}
            support={header.support}
            onMenu={() => setMenuOpen(true)}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>

        {(page === "dashboard" || page === "statistics") && (
          <SecurityOverview
            threats={threats}
            scanned={scans.length}
            score={protectionScore}
          />
        )}
      </div>
    </div>
  );
}