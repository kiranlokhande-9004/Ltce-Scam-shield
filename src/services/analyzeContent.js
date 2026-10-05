// ---------------------------------------------------------------------------
// analyzeContent(content, type)
//
// Single entry point for scam analysis. It calls the real ScamShield backend
// (`POST /api/scan-text`) and transparently falls back to the deterministic
// local engine if the API is unavailable — so the UI always works and the AI
// can be swapped/connected later without touching components.
// ---------------------------------------------------------------------------

const TYPE_LABEL = { message: "SMS", url: "URL", email: "EMAIL" };

const RULES = [
  {
    label: "Urgency / pressure tactics",
    weight: 16,
    patterns: [
      /immediately/i,
      /urgent/i,
      /\btoday\b/i,
      /right now/i,
      /within\s+\d+/i,
      /\d+\s*(hour|hrs|minute|min)s?\b/i,
      /expir/i,
      /last chance/i,
    ],
  },
  {
    label: "Request for sensitive information",
    weight: 22,
    patterns: [
      /\botp\b/i,
      /\bpin\b/i,
      /\bcvv\b/i,
      /password/i,
      /aadhaar|aadhar/i,
      /\bpan\b/i,
      /net\s?banking/i,
      /account number/i,
      /card number/i,
    ],
  },
  {
    label: "Suspicious link",
    weight: 16,
    patterns: [
      /bit\.ly|tinyurl|t\.co|goo\.gl/i,
      /\.(xyz|top|icu|click|link|live|buzz|rest)\b/i,
      /claim-|verify-|secure-|update-|login-/i,
      /https?:\/\/[^\s]*(verify|kyc|login|secure|claim|reward)/i,
      /http:\/\//i,
    ],
  },
  {
    label: "Impersonation of a trusted organization",
    weight: 22,
    patterns: [
      /\bbank\b/i,
      /\bsbi\b/i,
      /\bhdfc\b/i,
      /\bicici\b/i,
      /\baxis\b/i,
      /\brbi\b/i,
      /\bkyc\b/i,
      /\buidai\b/i,
      /\birctc\b/i,
      /amazon/i,
      /flipkart/i,
      /paytm|phonepe|gpay/i,
      /netflix|apple|microsoft/i,
      /\bincome tax\b/i,
      /\bepfo?\b/i,
    ],
  },
  {
    label: "Payment or money request",
    weight: 14,
    patterns: [
      /\bupi\b/i,
      /transfer/i,
      /send money/i,
      /pay\s*(now|us|₹|rs)/i,
      /processing fee/i,
      /refund/i,
      /\bprize\b|\blottery\b|\bwon\b/i,
    ],
  },
  {
    label: "Threatening language",
    weight: 12,
    patterns: [
      /blocked|blocked/i,
      /suspend/i,
      /legal action/i,
      /police|arrest/i,
      /penalty|\bfine\b/i,
      /deactivat|freeze/i,
    ],
  },
];

const SAFE_INDICATORS = [
  "No suspicious payment request",
  "No threatening language",
  "No suspicious URL",
  "No request for sensitive credentials",
];

const SUMMARY = {
  SAFE: "No major scam indicators detected.",
  SUSPICIOUS: "Some potentially risky indicators were detected.",
  DANGEROUS: "High-risk scam indicators detected.",
};

const RECOMMENDATION = {
  SAFE: "This message appears low risk, but remain cautious with unexpected requests.",
  SUSPICIOUS:
    "Verify the sender through the organization's official website, app or helpline before acting.",
  DANGEROUS:
    "Do not click the link or share your personal information. Verify the request through the organization's official website or app.",
};

const RECOMMENDATION_MONEY =
  "Do not make any payment. Legitimate organizations never demand payment to fix an account problem.";

// Deterministic local engine (mirrors server/scanText.js). Used for instant
// feedback and as the graceful fallback when the API is unreachable.
export function localScan(content, type = "message") {
  const text = String(content || "");
  const indicators = [];
  let score = 0;

  for (const rule of RULES) {
    if (rule.patterns.some((pattern) => pattern.test(text))) {
      indicators.push(rule.label);
      score += rule.weight;
    }
  }

  const credential = indicators.includes("Request for sensitive information");
  const impersonation = indicators.includes(
    "Impersonation of a trusted organization"
  );
  const link = indicators.includes("Suspicious link");
  const money = indicators.includes("Payment or money request");

  if (credential && impersonation) score += 8;
  if (link && score > 30) score += 6;
  if (type === "url" && link) score = Math.max(score, 72);
  score = Math.min(100, Math.round(score));

  const verdict = score <= 25 ? "SAFE" : score <= 60 ? "SUSPICIOUS" : "DANGEROUS";
  const moneyRisk = money && verdict !== "SAFE";

  return {
    verdict,
    riskScore: score,
    summary: SUMMARY[verdict],
    indicators: verdict === "SAFE" ? SAFE_INDICATORS : indicators,
    recommendation: moneyRisk
      ? RECOMMENDATION_MONEY
      : RECOMMENDATION[verdict],
    source: "local",
  };
}

function normalize(raw, type, source) {
  const verdict = ["SAFE", "SUSPICIOUS", "DANGEROUS"].includes(
    String(raw.verdict || "").toUpperCase()
  )
    ? String(raw.verdict).toUpperCase()
    : "SUSPICIOUS";

  const indicators = Array.isArray(raw.indicators)
    ? raw.indicators.map((item) => String(item).trim()).filter(Boolean)
    : [];

  return {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now()),
    type: TYPE_LABEL[type] || "SMS",
    preview: String(raw.preview || "").slice(0, 90),
    date: "Just now",
    verdict,
    riskScore: Math.max(0, Math.min(100, Math.round(Number(raw.riskScore) || 0))),
    summary: raw.summary || SUMMARY[verdict],
    indicators: indicators.length
      ? indicators
      : verdict === "SAFE"
        ? SAFE_INDICATORS
        : [],
    recommendation: raw.recommendation || RECOMMENDATION[verdict],
    organization: raw.organization || "",
    organizationVerification: raw.organizationVerification || null,
    urlVerification: Array.isArray(raw.urlVerification)
      ? raw.urlVerification
      : [],
    source,
    model: raw.model || "",
  };
}

export async function analyzeContent(content, type = "message") {
  const text = String(content || "").trim();

  if (!text) {
    throw new Error("Please paste a message, link or email to analyze.");
  }

  try {
    const response = await fetch("/api/scan-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text, type }),
    });

    if (!response.ok) throw new Error(`Backend ${response.status}`);

    const data = await response.json();
    if (!data?.success || !data.analysis) throw new Error("Bad response");

    return normalize(
      { ...data.analysis, preview: text },
      type,
      "ai"
    );
  } catch {
    // Graceful, deterministic fallback — never a blank screen.
    const fallback = localScan(text, type);
    return normalize({ ...fallback, preview: text }, type, "local");
  }
}