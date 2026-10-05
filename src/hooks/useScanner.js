import { useState } from "react";
import { analyzeContent } from "../services/analyzeContent";

const RISK_TO_VERDICT = { HIGH: "DANGEROUS", MEDIUM: "SUSPICIOUS", LOW: "SAFE", SAFE: "SAFE" };
const RISK_TO_SCORE = { HIGH: 90, MEDIUM: 58, LOW: 18, SAFE: 8 };

// Shared scan workflow used by the dashboard and the Scan Message / Scan URL pages.
export function useScanner({ onScanComplete } = {}) {
  const [content, setContent] = useState("");
  const [type, setType] = useState("message");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    if (!content.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const analysis = await analyzeContent(content, type);
      setResult(analysis);
      onScanComplete?.(analysis);
    } catch (err) {
      setError(err.message || "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  // Preserved screenshot/photo flow (POST /api/analyze), mapped into the
  // dashboard result shape so it renders in the same result card.
  async function analyzeScreenshot(file) {
    if (!file || screenshotLoading) return;
    setScreenshotLoading(true);
    setError("");
    setResult(null);

    try {
      const form = new FormData();
      form.append("image", file);

      const response = await fetch("/api/analyze", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.error || "Analysis failed.");
      }

      const analysis = data.analysis || {};
      const verdict = RISK_TO_VERDICT[analysis.riskLevel] || "SUSPICIOUS";
      const indicators = [
        ...(analysis.suspiciousPhrases || []),
        ...(analysis.reasons || []),
      ].slice(0, 6);

      const mapped = {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : String(Date.now()),
        type: "SCREENSHOT",
        preview: (analysis.claim || "Uploaded screenshot").slice(0, 90),
        date: "Just now",
        verdict,
        riskScore: RISK_TO_SCORE[analysis.riskLevel] ?? 58,
        summary:
          verdict === "DANGEROUS"
            ? "High-risk scam indicators detected."
            : verdict === "SUSPICIOUS"
              ? "Some potentially risky indicators were detected."
              : "No major scam indicators detected.",
        indicators:
          indicators.length
            ? indicators
            : ["No specific suspicious indicators were extracted."],
        recommendation:
          (analysis.safeActions || []).join(" ") ||
          "Verify through the organization's official website or app.",
        // Deterministic (server) verification data reused by URL-mismatch UI
        // and the local voice summary. No extra AI call is made for these.
        organization: analysis.organization,
        requestedAction: analysis.requestedAction,
        reasons: analysis.reasons,
        safeActions: analysis.safeActions,
        organizationVerification: analysis.organizationVerification,
        urlVerification: analysis.urlVerification,
        source: "ai",
        model: "",
      };

      setResult(mapped);
      onScanComplete?.(mapped);
    } catch (err) {
      setError(
        `Screenshot analysis is temporarily unavailable. ${err.message || ""}`.trim()
      );
    } finally {
      setScreenshotLoading(false);
    }
  }

  function reset() {
    setContent("");
    setResult(null);
    setError("");
  }

  function loadScan(scan) {
    setResult(scan);
    setContent(scan.preview || "");
    setError("");
  }

  return {
    content,
    setContent,
    type,
    setType,
    result,
    loading,
    screenshotLoading,
    error,
    analyze,
    analyzeScreenshot,
    reset,
    loadScan,
  };
}