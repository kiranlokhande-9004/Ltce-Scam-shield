import { useEffect } from "react";
import ScanCard from "../components/dashboard/ScanCard";
import AnalysisResult from "../components/dashboard/AnalysisResult";
import RecentScans from "../components/dashboard/RecentScans";

export default function ScanPage({ scanner, scans, onView, onNavigate, defaultType }) {
  useEffect(() => {
    if (defaultType) scanner.setType(defaultType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultType]);

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

      <RecentScans
        scans={scans.slice(0, 4)}
        onView={onView}
        onViewAll={() => onNavigate("history")}
      />
    </div>
  );
}