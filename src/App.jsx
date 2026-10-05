import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { translate } from "./i18n";
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

// Per-page header copy.
const HEADERS = {
  dashboard: {
    greeting: "Good morning, Alex",
    title: "Stay protected from scams.",
    support:
      "Analyze suspicious messages, links and emails with ScamShield AI.",
  },
  "scan-message": {
    greeting: "Scan Message",
    title: "Check a suspicious message.",
    support: "Paste an SMS, WhatsApp or email message to analyze it.",
  },
  "scan-url": {
    greeting: "Scan URL",
    title: "Inspect a suspicious link.",
    support: "Paste any link and ScamShield will check it for phishing signals.",
  },
  history: {
    greeting: "Scan History",
    title: "Every scan, in one place.",
    support: "Review the messages, links and emails you have analyzed.",
  },
  reports: {
    greeting: "Reports",
    title: "Your security report.",
    support: "A summary of your scan activity and the threats you avoid.",
  },
  statistics: {
    greeting: "Statistics",
    title: "Your security activity.",
    support: "Track how many messages you scan and their risk breakdown.",
  },
  settings: {
    greeting: "Settings",
    title: "Manage your ScamShield.",
    support: "Profile, language and demo preferences.",
  },
  "call-safety": {
    greeting: "Call Safety",
    title: "Real-time call protection.",
    support: "Monitor a live conversation for fraud indicators.",
  },
};

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState("en");
  const [scans, setScans] = useState(() => loadScans());

  // Translator retained for the (bilingual) Call Safety screen.
  const t = useMemo(() => (key, vars) => translate(lang, key, vars), [lang]);

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

  const header = HEADERS[page] || HEADERS.dashboard;

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