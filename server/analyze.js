import { analyzeImageWithKimi } from "./kimi.js";
import {
  extractUrls,
  verifyUrls,
  hasImpersonation,
  verifyOrganization,
} from "./trustedDomains.js";

// Coerce a value that might be a string, an array, a free-text blob or null
// into a clean array of strings.
function toArray(value) {
  if (value === null || value === undefined) return [];

  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === "string" ? item : JSON.stringify(item)
      )
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    // Split multi-line answers into separate bullet points.
    return trimmed
      .split(/\n+/)
      .map((line) => line.replace(/^[-•*\d.)\s]+/, "").trim())
      .filter(Boolean);
  }

  return [String(value)];
}

function normalizeRisk(value) {
  const raw = String(value || "").toUpperCase();
  if (raw.includes("HIGH") || raw.includes("CRITICAL")) return "HIGH";
  if (raw.includes("MEDIUM") || raw.includes("MODERATE")) return "MEDIUM";
  if (raw.includes("SAFE")) return "SAFE";
  if (raw.includes("LOW")) return "LOW";
  return "MEDIUM";
}

// Deterministic fallback chain used when the AI does not provide one.
function fallbackAttackChain() {
  return [
    "Impersonate a trusted organization",
    "Create fear or urgency",
    "Ask for sensitive information",
    "Attempt account takeover or financial fraud",
  ];
}

// Deterministic fallback safe actions used when the AI returns none.
function fallbackSafeActions() {
  return [
    "Do not click suspicious links",
    "Do not share OTP",
    "Do not share PIN",
    "Do not share CVV",
    "Do not share passwords",
    "Verify through the organization's official website",
    "Contact the organization using an official number",
    "Report financial cyber fraud through 1930 if money was lost",
  ];
}

// Pull every candidate URL out of the model's response, wherever it hid them.
function collectUrlCandidates(raw, textFields) {
  const candidates = new Set();

  const addAll = (text) => {
    extractUrls(text).forEach((url) => candidates.add(url));
  };

  const verification = raw.urlVerification;

  if (verification && typeof verification === "object") {
    toArray(verification.urls).forEach((entry) => addAll(entry));
    if (typeof verification.assessment === "string") {
      addAll(verification.assessment);
    }
  } else if (typeof verification === "string") {
    addAll(verification);
  }

  textFields.forEach((field) => addAll(String(field || "")));

  return [...candidates];
}

/**
 * Run the vision model and normalize + verify its output into the exact shape
 * the frontend renders. Domain verification is deterministic and can escalate
 * the risk level to HIGH when a known brand is impersonated.
 */
export async function analyzeScreenshot(
  imageBuffer,
  mimeType = "image/jpeg"
) {
  if (!imageBuffer || !imageBuffer.length) {
    throw new Error("Image data is empty.");
  }

  console.log("Preparing image for Kimi...");

  const base64Image = imageBuffer.toString("base64");
  const raw = await analyzeImageWithKimi(base64Image, mimeType);

  const suspiciousPhrases = toArray(
    raw.suspiciousEvidence ?? raw.suspiciousPhrases
  );
  const aiReasons = toArray(raw.whySuspicious ?? raw.reasons);
  let attackChain = toArray(raw.attackChain);
  let safeActions = toArray(raw.safeActions);

  const urlCandidates = collectUrlCandidates(raw, [
    raw.organization,
    raw.claim,
    raw.requestedAction,
    raw.urgency,
    ...suspiciousPhrases,
    ...aiReasons,
    ...safeActions,
  ]);

  const urlVerification = verifyUrls(urlCandidates);

  const organization = raw.organization || "Not identified";

  // Deterministic official-website verification for the claimed organization.
  const organizationVerification = verifyOrganization(
    organization,
    urlVerification
  );

  let riskLevel = normalizeRisk(raw.risk ?? raw.riskLevel);

  // Deterministic escalation: a confirmed brand impersonation is always HIGH.
  if (hasImpersonation(urlVerification) && riskLevel !== "HIGH") {
    console.log("Escalating risk to HIGH: detected brand impersonation.");
    riskLevel = "HIGH";
  }

  // Deterministic fallbacks so the UI is never empty (esp. for high risk).
  if (!attackChain.length && (riskLevel === "HIGH" || riskLevel === "MEDIUM")) {
    attackChain = fallbackAttackChain();
  }

  if (!safeActions.length) {
    safeActions = fallbackSafeActions();
  }

  // Reasons: keep the AI's reasoning, but add a deterministic reason when an
  // official-domain mismatch was found.
  const reasons = [...aiReasons];
  if (organizationVerification?.status === "SUSPICIOUS") {
    const note = `The message URL does not match the official ${organizationVerification.name} domain (${organizationVerification.officialWebsite}).`;
    if (!reasons.includes(note)) reasons.push(note);
  }

  return {
    riskLevel,
    organization,
    claim: raw.claim || "Not identified",
    requestedAction: raw.requestedAction || "Not identified",
    urgency: raw.urgency || "Not applicable",
    suspiciousPhrases,
    reasons,
    attackChain,
    urlVerification,
    organizationVerification,
    safeActions,
  };
}