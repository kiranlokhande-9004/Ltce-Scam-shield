import { analyzeCallTranscript, KIMI_MODEL } from "./kimi.js";
import { findOrganization } from "./trustedDomains.js";

// Re-export so the API layer can report the real configured model.
export { KIMI_MODEL };

// ---------------------------------------------------------------------------
// Local, deterministic fraud-indicator detection.
// Zero AI cost. Used to badge the UI instantly and to back-fill the AI result.
// ---------------------------------------------------------------------------
const INDICATOR_RULES = [
  { label: "OTP request", patterns: [/\botp\b/i, /one.?time password/i] },
  { label: "PIN request", patterns: [/\bpin\b/i, /atm pin/i] },
  { label: "CVV request", patterns: [/\bcvv\b/i, /card number/i] },
  { label: "Password request", patterns: [/password/i, /net.?banking/i] },
  {
    label: "UPI/payment request",
    patterns: [/\bupi\b/i, /transfer/i, /pay now/i, /send money/i, /rupees/i, /₹/i],
  },
  { label: "Screen-sharing request", patterns: [/screen shar/i] },
  {
    label: "Remote-access request",
    patterns: [/anydesk/i, /teamviewer/i, /remote access/i, /quick ?support/i],
  },
  { label: "KYC threat", patterns: [/\bkyc\b/i] },
  {
    label: "Account blocking threat",
    patterns: [
      /account will be blocked/i,
      /account.{0,20}block/i,
      /account.{0,20}suspend/i,
      /account.{0,20}(deactivat|closed|freeze)/i,
    ],
  },
  {
    label: "Police/legal threat",
    patterns: [/police/i, /arrest/i, /fir\b/i, /legal action/i, /court/i],
  },
  { label: "Prize/refund scam", patterns: [/prize/i, /lottery/i, /refund/i] },
  {
    label: "Urgency",
    patterns: [/immediately/i, /right now/i, /today/i, /\burgent/i, /within\s+\d+\s*(hour|minute|min)/i],
  },
  {
    label: "Fear or intimidation",
    patterns: [/block/i, /suspend/i, /penalty/i, /fine\b/i, /freeze/i, /expire/i],
  },
  {
    label: "Install app request",
    patterns: [/install.{0,20}(app|application)/i, /download.{0,20}(app|application)/i],
  },
  { label: "Impersonation", patterns: [/calling from/i, /your bank/i, /customer care/i] },
  {
    label: "Banking information request",
    patterns: [/account number/i, /debit card/i, /credit card/i, /net banking/i],
  },
];

const CREDENTIAL_LABELS = new Set([
  "OTP request",
  "PIN request",
  "CVV request",
  "Password request",
  "Banking information request",
]);

const PAYMENT_LABELS = new Set(["UPI/payment request"]);

export function localDetect(transcript) {
  const text = String(transcript || "");

  const indicators = INDICATOR_RULES.filter((rule) =>
    rule.patterns.some((pattern) => pattern.test(text))
  ).map((rule) => rule.label);

  const credentialRisk = indicators.some((label) =>
    CREDENTIAL_LABELS.has(label)
  );
  const paymentRisk = indicators.some((label) => PAYMENT_LABELS.has(label));

  return { indicators, credentialRisk, paymentRisk };
}

function normalizeRisk(value) {
  const raw = String(value || "").toUpperCase();
  if (raw.includes("CRITICAL")) return "CRITICAL";
  if (raw.includes("HIGH")) return "HIGH";
  if (raw.includes("MEDIUM") || raw.includes("MODERATE")) return "MEDIUM";
  if (raw.includes("LOW")) return "LOW";
  return "";
}

function clampScore(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return Math.max(0, Math.min(100, Math.round(num)));
}

// Deterministic risk from the local indicator set (used when AI is unavailable
// and as a floor so obvious scams are never under-scored).
function localRisk(local, hasImpersonation) {
  if (local.credentialRisk || (local.paymentRisk && hasImpersonation)) {
    return "CRITICAL";
  }
  if (local.indicators.length >= 2) return "HIGH";
  if (local.indicators.length === 1) return "MEDIUM";
  return "LOW";
}

/**
 * Analyze a call transcript. Reuses the existing Kimi/Astra infrastructure.
 * The response is normalized, back-filled and verified deterministically so
 * the AI can never invent an official website or over/under-state risk.
 */
export async function analyzeCall({ transcript, callerNumber, callerName }) {
  const text = String(transcript || "").trim();

  if (!text) {
    throw new Error("Transcript is empty.");
  }

  const local = localDetect(text);
  const org = findOrganization(text);
  const hasImpersonation =
    local.indicators.includes("Impersonation") || Boolean(org);

  let ai = null;
  let aiError = null;

  try {
    ai = await analyzeCallTranscript(text, { callerNumber, callerName });
  } catch (error) {
    aiError = error.message;
    console.error("Call AI analysis failed, using local detection:", aiError);
  }

  // Local indicators are always included (deterministic).
  const aiIndicators = Array.isArray(ai?.indicators)
    ? ai.indicators.map((item) => String(item).trim()).filter(Boolean)
    : [];
  const indicators = [...new Set([...aiIndicators, ...local.indicators])];

  // Risk: take the more severe of AI and local, so obvious scams are a floor.
  const order = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
  const aiRisk = normalizeRisk(ai?.risk);
  const detRisk = localRisk(local, hasImpersonation);
  const risk =
    (order[aiRisk] ?? -1) >= (order[detRisk] ?? -1) ? aiRisk || detRisk : detRisk;

  // Organization: AI's value when meaningful, else deterministic match.
  const aiOrg = String(ai?.impersonatedOrganization || "").trim();
  const impersonatedOrganization =
    aiOrg && !/^unknown$/i.test(aiOrg)
      ? aiOrg
      : org
        ? org.name
        : "Unknown";

  // Official website is ALWAYS from the local trusted DB, never the AI.
  const resolvedOrg =
    org || findOrganization(impersonatedOrganization) || null;
  const officialWebsite = resolvedOrg?.website || null;

  const paymentRisk = Boolean(ai?.paymentRisk) || local.paymentRisk;
  const credentialRisk = Boolean(ai?.credentialRisk) || local.credentialRisk;

  // Score: prefer a valid AI score; otherwise derive deterministically.
  const aiScore = clampScore(ai?.fraudScore);
  const derivedScore = { LOW: 15, MEDIUM: 45, HIGH: 75, CRITICAL: 95 }[risk] ?? 50;

  return {
    risk,
    fraudScore: aiScore === null ? derivedScore : Math.max(aiScore, derivedScore),
    impersonatedOrganization,
    officialWebsite,
    indicators,
    explanation:
      (ai?.explanation && String(ai.explanation).trim()) ||
      (indicators.length
        ? "Suspicious phrases were detected in the live call transcript."
        : "No strong scam indicators were detected in the transcript so far."),
    recommendedAction:
      (ai?.recommendedAction && String(ai.recommendedAction).trim()) ||
      (risk === "CRITICAL" || risk === "HIGH"
        ? "Do not share OTP, PIN, CVV or passwords, and do not make any payment. End the call and contact the organization using its official number."
        : "Continue to stay cautious. Never share OTP, PIN, CVV or passwords."),
    paymentRisk,
    credentialRisk,
    aiUsed: Boolean(ai),
    aiError,
    model: KIMI_MODEL,
  };
}