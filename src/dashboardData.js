// Realistic demo data for the ScamShield dashboard.

export const DEMO_SCANS = [
  {
    id: "demo-1",
    type: "SMS",
    preview: "Your SBI account will be blocked today. Verify your KYC now...",
    date: "Today",
    verdict: "DANGEROUS",
    riskScore: 92,
    summary: "High-risk scam indicators detected.",
    indicators: [
      "Urgency / pressure tactics",
      "Request for sensitive information",
      "Suspicious link",
      "Impersonation of a trusted organization",
    ],
    recommendation:
      "Do not click the link or share your personal information. Verify the request through SBI's official website or app.",
  },
  {
    id: "demo-2",
    type: "WhatsApp",
    preview: "Congratulations! You have won ₹25,00,000. Claim your prize...",
    date: "Yesterday",
    verdict: "DANGEROUS",
    riskScore: 88,
    summary: "Prize scam with a payment request.",
    indicators: [
      "Unexpected prize or lottery",
      "Request for a processing fee",
      "Suspicious link",
    ],
    recommendation:
      "Legitimate lotteries never ask for an upfront fee. Do not pay or share details.",
  },
  {
    id: "demo-3",
    type: "IRCTC",
    preview: "Your train ticket booking is confirmed. PNR 452...",
    date: "2 days ago",
    verdict: "SAFE",
    riskScore: 8,
    summary: "No major scam indicators detected.",
    indicators: [
      "No suspicious payment request",
      "No threatening language",
      "No suspicious URL",
      "No request for sensitive credentials",
    ],
    recommendation:
      "This message appears low risk, but remain cautious with unexpected requests.",
  },
  {
    id: "demo-4",
    type: "Email",
    preview: "Your KYC verification is pending. Update before 24 hours...",
    date: "3 days ago",
    verdict: "SUSPICIOUS",
    riskScore: 58,
    summary: "Some potentially risky indicators were detected.",
    indicators: [
      "Deadline / time pressure",
      "Mentions account or KYC details",
      "Unverified sender domain",
    ],
    recommendation:
      "Confirm through the organization's official app or helpline before acting.",
  },
  {
    id: "demo-5",
    type: "URL",
    preview: "http://claim-reward-now.xyz/verify",
    date: "4 days ago",
    verdict: "DANGEROUS",
    riskScore: 95,
    summary: "Phishing domain that imitates a brand.",
    indicators: [
      "Non-official domain (.xyz)",
      "Brand-lookalike hostname",
      "No HTTPS",
    ],
    recommendation:
      "Never open this link. Use the official app or type the official domain manually.",
  },
];

export const ACTIVITY_SERIES = [
  { day: "Mon", scanned: 12, safe: 6, suspicious: 4, dangerous: 2 },
  { day: "Tue", scanned: 18, safe: 9, suspicious: 5, dangerous: 4 },
  { day: "Wed", scanned: 10, safe: 5, suspicious: 3, dangerous: 2 },
  { day: "Thu", scanned: 24, safe: 12, suspicious: 7, dangerous: 5 },
  { day: "Fri", scanned: 16, safe: 8, suspicious: 5, dangerous: 3 },
  { day: "Sat", scanned: 30, safe: 15, suspicious: 9, dangerous: 6 },
  { day: "Sun", scanned: 18, safe: 9, suspicious: 5, dangerous: 4 },
];

export const TOP_THREATS = [
  { label: "Bank impersonation", value: 78 },
  { label: "OTP / credential theft", value: 64 },
  { label: "Fake links", value: 52 },
  { label: "Prize / refund scams", value: 37 },
];