import { Mail, Link2, MessageSquare, FileText } from "lucide-react";
import ScanCard from "../components/dashboard/ScanCard";
import AnalysisResult from "../components/dashboard/AnalysisResult";
import QuickActionCard from "../components/dashboard/QuickActionCard";
import RecentScans from "../components/dashboard/RecentScans";
import StatisticsChart from "../components/dashboard/StatisticsChart";

export default function DashboardPage({ scanner, scans, onNavigate, onView }) {
  return (
    <div className="space-y-5">
      <ScanCard
        type={scanner.type}
        onTypeChange={scanner.setType}
        value={scanner.content}
        onValueChange={scanner.setContent}
        onAnalyze={scanner.analyze}
        loading={scanner.loading}
        error={scanner.error}
        onScreenshot={scanner.analyzeScreenshot}
        screenshotLoading={scanner.screenshotLoading}
      />

      {scanner.result && (
        <AnalysisResult result={scanner.result} onReset={scanner.reset} />
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <QuickActionCard
          icon={MessageSquare}
          title="Scan Message"
          description="Analyze suspicious SMS or WhatsApp messages"
          tone="primary"
          onClick={() => onNavigate("scan-message")}
        />
        <QuickActionCard
          icon={Link2}
          title="Check URL"
          description="Detect suspicious or phishing links"
          tone="gold"
          onClick={() => onNavigate("scan-url")}
        />
        <QuickActionCard
          icon={Mail}
          title="Analyze Email"
          description="Check emails for scam indicators"
          tone="safe"
          onClick={() => onNavigate("scan-message")}
        />
        <QuickActionCard
          icon={FileText}
          title="View Reports"
          description="Review your previous security scans"
          tone="soft"
          onClick={() => onNavigate("reports")}
        />
      </div>

      <RecentScans
        scans={scans.slice(0, 5)}
        onView={onView}
        onViewAll={() => onNavigate("history")}
      />

      <StatisticsChart />
    </div>
  );
}