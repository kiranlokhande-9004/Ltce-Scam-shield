// ---------------------------------------------------------------------------
// callDetect.js — local, deterministic call-fraud indicator detection.
//
// Runs instantly in the browser (no AI) so the UI can react the moment a
// sensitive phrase is heard. Mirrors server/callAnalyze.js. Supports English,
// Hindi and Marathi keyword forms.
// ---------------------------------------------------------------------------

const LOCAL_RULES = [
  { key: "indOtp", patterns: [/otp/i, /ओटीपी/i, /ओ\.?\s?टी\.?\s?पी/i] },
  { key: "indPin", patterns: [/\bpin\b/i, /पिन/i] },
  { key: "indCvv", patterns: [/\bcvv\b/i, /c\.?\s?v\.?\s?v/i, /सीवीवी/i] },
  { key: "indPassword", patterns: [/password/i, /net.?banking/i, /पासवर्ड/i] },
  {
    key: "indUpi",
    patterns: [
      /\bupi\b/i,
      /transfer/i,
      /pay now/i,
      /send money/i,
      /rupees/i,
      /₹/i,
      /पैसे/i,
      /रुपये/i,
    ],
  },
  { key: "indScreenShare", patterns: [/screen shar/i, /स्क्रीन शेयर/i] },
  {
    key: "indRemoteAccess",
    patterns: [/anydesk/i, /teamviewer/i, /remote access/i, /quick ?support/i],
  },
  { key: "indKyc", patterns: [/\bkyc\b/i, /केवाईसी/i] },
  {
    key: "indAccountBlock",
    patterns: [
      /account.{0,20}(block|suspend|deactivat|closed|freeze)/i,
      /will be blocked/i,
      /खाता.{0,10}(बंद|ब्लॉक)/i,
    ],
  },
  { key: "indPolice", patterns: [/police/i, /arrest/i, /\bfir\b/i, /legal action/i, /पुलिस/i, /गिरफ्तार/i] },
  { key: "indPrize", patterns: [/prize/i, /lottery/i, /refund/i, /इनाम/i] },
  {
    key: "indUrgency",
    patterns: [/immediately/i, /right now/i, /today/i, /\burgent/i, /तुरंत/i, /आज ही/i],
  },
  {
    key: "indFear",
    patterns: [/block/i, /suspend/i, /penalty/i, /freeze/i, /expire/i, /धमकी/i],
  },
  { key: "indInstallApp", patterns: [/install.{0,20}(app|application)/i, /download.{0,20}(app|application)/i] },
  { key: "indImpersonation", patterns: [/calling from/i, /your bank/i, /customer care/i, /बैंक से/i] },
  {
    key: "indBankingInfo",
    patterns: [/account number/i, /debit card/i, /credit card/i, /net banking/i, /खाता संख्या/i],
  },
];

// Which indicators affect credential / payment risk.
const CREDENTIAL_KEYS = new Set([
  "indOtp",
  "indPin",
  "indCvv",
  "indPassword",
  "indBankingInfo",
]);
const PAYMENT_KEYS = new Set(["indUpi"]);

// Return the set of i18n indicator keys found in a piece of text.
export function detectLocal(text) {
  const source = String(text || "");
  const found = new Set();

  for (const rule of LOCAL_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(source))) {
      found.add(rule.key);
    }
  }

  return [...found];
}

export function hasCredentialRisk(keys) {
  return [...keys].some((key) => CREDENTIAL_KEYS.has(key));
}

export function hasPaymentRisk(keys) {
  return [...keys].some((key) => PAYMENT_KEYS.has(key));
}

// Map an AI-returned indicator string (English) to an i18n key.
// Falls back to null so unknown labels are shown verbatim.
export function indicatorKeyForLabel(label) {
  const text = String(label || "").toLowerCase();

  if (text.includes("otp") || text.includes("one time")) return "indOtp";
  if (text.includes("cvv")) return "indCvv";
  if (text.includes("pin")) return "indPin";
  if (text.includes("password") || text.includes("net banking")) return "indPassword";
  if (text.includes("upi") || text.includes("payment") || text.includes("transfer")) return "indUpi";
  if (text.includes("screen")) return "indScreenShare";
  if (text.includes("remote") || text.includes("anydesk") || text.includes("teamviewer")) return "indRemoteAccess";
  if (text.includes("kyc")) return "indKyc";
  if (text.includes("block") || text.includes("suspend") || text.includes("account")) return "indAccountBlock";
  if (text.includes("police") || text.includes("legal") || text.includes("arrest")) return "indPolice";
  if (text.includes("prize") || text.includes("refund") || text.includes("lottery")) return "indPrize";
  if (text.includes("urgency") || text.includes("urgent")) return "indUrgency";
  if (text.includes("fear") || text.includes("intimidat") || text.includes("threat")) return "indFear";
  if (text.includes("install") || text.includes("app")) return "indInstallApp";
  if (text.includes("impersonat")) return "indImpersonation";
  if (text.includes("banking information") || text.includes("account number")) return "indBankingInfo";

  return null;
}