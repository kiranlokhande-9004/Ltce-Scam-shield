import { analyzeMessageText, KIMI_MODEL } from "./kimi.js";
import {
  extractUrls,
  verifyUrls,
  hasImpersonation,
  findOrganization,
  verifyOrganization,
} from "./trustedDomains.js";

// Deterministic local engine — mirrors src/services/analyzeContent.js.
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
      /block/i,
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

const ORDER = { SAFE: 0, SUSPICIOUS: 1, DANGEROUS: 2 };

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

  if (credential && impersonation) score += 8;
  if (link && score > 30) score += 6;
  if (type === "url" && link) score = Math.max(score, 72);
  score = Math.min(100, Math.round(score));

  const verdict = score <= 25 ? "SAFE" : score <= 60 ? "SUSPICIOUS" : "DANGEROUS";

  return {
    verdict,
    riskScore: score,
    summary: SUMMARY[verdict],
    indicators: verdict === "SAFE" ? SAFE_INDICATORS : indicators,
    recommendation: RECOMMENDATION[verdict],
  };
}

function moreSevere(a, b) {
  return (ORDER[a] ?? -1) >= (ORDER[b] ?? -1) ? a : b;
}

/**
 * Analyze pasted content. Local detection always runs; the AI may refine it.
 * Deterministic URL/domain verification is applied so the AI can never invent
 * an official domain.
 */
export async function scanText({ content, type = "message" }) {
  const text = String(content || "").trim();
  if (!text) throw new Error("Content is empty.");

  const local = localScan(text, type);

  let ai = null;
  let aiError = null;
  try {
    ai = await analyzeMessageText(text, type);
  } catch (error) {
    aiError = error.message;
    console.error("Scan AI failed, using local engine:", aiError);
  }

  const aiVerdict = ["SAFE", "SUSPICIOUS", "DANGEROUS"].includes(
    String(ai?.verdict || "").toUpperCase()
  )
    ? String(ai.verdict).toUpperCase()
    : null;

  const verdict = aiVerdict ? moreSevere(aiVerdict, local.verdict) : local.verdict;

  const aiScore = Number.isFinite(Number(ai?.riskScore))
    ? Math.max(0, Math.min(100, Math.round(Number(ai.riskScore))))
    : null;
  const riskScore = aiScore === null ? local.riskScore : Math.max(aiScore, local.riskScore);

  const aiIndicators = Array.isArray(ai?.indicators)
    ? ai.indicators.map((item) => String(item).trim()).filter(Boolean)
    : [];
  let indicators = [...new Set([...aiIndicators, ...local.indicators])];

  // Deterministic domain verification (never invented by the AI).
  const urlVerification = verifyUrls(extractUrls(text));
  const organization = findOrganization(text)?.name || "Not identified";
  const organizationVerification = verifyOrganization(text, urlVerification);
  let brandNote = "";
  if (hasImpersonation(urlVerification)) {
    const hit = urlVerification.find((entry) => entry.impersonation);
    brandNote = `The link does not match the official ${hit.organization} domain (${hit.officialWebsite}).`;
  }

  if (verdict === "SAFE") {
    indicators = SAFE_INDICATORS;
  }

  const recommendation =
    (ai?.recommendation && String(ai.recommendation).trim()) ||
    local.recommendation;

  return {
    verdict,
    riskScore,
    summary:
      (ai?.summary && String(ai.summary).trim()) || local.summary,
    indicators,
    recommendation: brandNote
      ? `${recommendation} ${brandNote}`
      : recommendation,
    urlVerification,
    organization,
    organizationVerification,
    model: KIMI_MODEL,
    source: ai ? "ai" : "local",
    aiError,
  };
}