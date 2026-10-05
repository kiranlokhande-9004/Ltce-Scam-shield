// ---------------------------------------------------------------------------
// scamCallData.js — local, hard-coded simulated scam-call script + indicator
// detection. Entirely client-side: NO telephony, NO real calls, NO Kimi.
// ---------------------------------------------------------------------------

// `delay` is the milliseconds to wait AFTER the previous line before showing it.
export const CALL_SCRIPT = [
  {
    speaker: "caller",
    text: "Hello, am I speaking with Mr. Sharma?",
    delay: 900,
  },
  {
    speaker: "caller",
    text: "Sir, I am calling from the State Bank of India customer care.",
    delay: 2400,
  },
  {
    speaker: "caller",
    text: "Your KYC has expired and your account will be blocked today.",
    delay: 3000,
  },
  {
    speaker: "caller",
    text: "You must verify your identity immediately or the account will be suspended.",
    delay: 3000,
  },
  {
    speaker: "caller",
    text: "Please tell me the OTP you just received on your phone.",
    delay: 3400,
  },
  {
    speaker: "caller",
    text: "Also confirm your 4-digit ATM PIN.",
    delay: 3200,
  },
  {
    speaker: "caller",
    text: "And share the CVV number printed on the back of your card.",
    delay: 3400,
  },
  {
    speaker: "caller",
    text: "Or just transfer 4999 rupees to this account to reactivate your KYC.",
    delay: 3600,
  },
];

// Scam indicators, each mapped to an i18n label key.
const INDICATOR_DEFS = [
  {
    key: "impersonation",
    labelKey: "indicatorImpersonation",
    patterns: [
      /calling from/i,
      /state bank of india/i,
      /your bank/i,
      /customer care/i,
      /\bbank\b/i,
    ],
  },
  {
    key: "accountThreat",
    labelKey: "indicatorAccountThreat",
    patterns: [
      /blocked/i,
      /suspend/i,
      /deactivat/i,
      /closed/i,
      /freeze/i,
      /expire/i,
    ],
  },
  {
    key: "urgency",
    labelKey: "indicatorUrgency",
    patterns: [
      /today/i,
      /immediately/i,
      /right now/i,
      /within\s+\d+/i,
      /urgent/i,
      /as soon as possible/i,
    ],
  },
  {
    key: "otp",
    labelKey: "indicatorOtp",
    patterns: [/\botp\b/i, /one.?time password/i],
  },
  {
    key: "pin",
    labelKey: "indicatorPin",
    patterns: [/\bpin\b/i, /atm pin/i],
  },
  {
    key: "cvv",
    labelKey: "indicatorCvv",
    patterns: [/\bcvv\b/i, /card number/i],
  },
  {
    key: "password",
    labelKey: "indicatorPassword",
    patterns: [/password/i, /net.?banking/i],
  },
  {
    key: "payment",
    labelKey: "indicatorPayment",
    patterns: [/transfer/i, /pay\b/i, /rupees/i, /₹/i, /\bamount\b/i],
  },
];

// Return the indicator keys detected in a single line of transcript.
export function detectIndicators(text) {
  if (!text) return [];
  return INDICATOR_DEFS.filter((def) =>
    def.patterns.some((pattern) => pattern.test(text))
  ).map((def) => def.key);
}

// Resolve an indicator key to its i18n label key.
export function indicatorLabelKey(key) {
  const def = INDICATOR_DEFS.find((entry) => entry.key === key);
  return def ? def.labelKey : key;
}

// The 4-step attack chain shown after detection (Phase 9).
export const ATTACK_CHAIN_STEP_KEYS = [
  "callChain1",
  "callChain2",
  "callChain3",
  "callChain4",
];