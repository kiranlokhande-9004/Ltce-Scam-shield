// ---------------------------------------------------------------------------
// trustedDomains.js
//
// Deterministic trusted-organization database + URL verification.
//
// This layer does NOT trust the AI model to invent official websites. It maps
// recognized Indian (and some international) organizations to their OFFICIAL
// domains, extracts every URL from the analysis, and reports whether a claimed
// organization's message URL matches its official domain.
//
// The AI is only used for reasoning/reading the screenshot, never for deciding
// what an official website is.
// ---------------------------------------------------------------------------

// Organization -> official website. Only well-known, high-confidence domains.
// `aliases` are matched against the hostname / organization text.
export const TRUSTED_ORGANIZATIONS = {
  "State Bank of India": {
    name: "State Bank of India",
    website: "https://sbi.co.in",
    domains: ["sbi.co.in", "onlinesbi.sbi", "sbiyono.sbi", "sbicard.com"],
    aliases: ["state bank of india", "sbi", "onlinesbi", "yono"],
  },
  MSEDCL: {
    name: "MSEDCL (Maharashtra State Electricity Distribution Co.)",
    website: "https://www.mahadiscom.in",
    domains: ["mahadiscom.in", "mahadiscom.co.in"],
    aliases: ["msedcl", "mahadiscom", "maharashtra electricity", "mseb"],
  },
  "Tata Power": {
    name: "Tata Power",
    website: "https://www.tatapower.com",
    domains: ["tatapower.com"],
    aliases: ["tata power"],
  },
  "Adani Electricity": {
    name: "Adani Electricity Mumbai",
    website: "https://www.adanielectricity.com",
    domains: ["adanielectricity.com"],
    aliases: ["adani electricity"],
  },
  BESCOM: {
    name: "BESCOM (Bangalore Electricity Supply Company)",
    website: "https://bescom.karnataka.gov.in",
    domains: ["bescom.karnataka.gov.in", "bescom.co.in"],
    aliases: ["bescom"],
  },
  RBI: {
    name: "Reserve Bank of India",
    website: "https://www.rbi.org.in",
    domains: ["rbi.org.in"],
    aliases: ["rbi", "reserve bank of india"],
  },
  UIDAI: {
    name: "UIDAI (Aadhaar)",
    website: "https://uidai.gov.in",
    domains: ["uidai.gov.in"],
    aliases: ["uidai", "aadhaar", "aadhar"],
  },
  "Income Tax Department": {
    name: "Income Tax Department",
    website: "https://www.incometax.gov.in",
    domains: ["incometax.gov.in", "incometaxindia.gov.in", "tin-nsdl.com"],
    aliases: ["income tax", "incometax", "itr", "pan card", "pan"],
  },
  IRCTC: {
    name: "IRCTC",
    website: "https://www.irctc.co.in",
    domains: ["irctc.co.in", "irctc.com"],
    aliases: ["irctc", "indian railway", "railway"],
  },
  "Amazon India": {
    name: "Amazon India",
    website: "https://www.amazon.in",
    domains: ["amazon.in", "amazon.com"],
    aliases: ["amazon"],
  },
  Flipkart: {
    name: "Flipkart",
    website: "https://www.flipkart.com",
    domains: ["flipkart.com"],
    aliases: ["flipkart"],
  },
  "HDFC Bank": {
    name: "HDFC Bank",
    website: "https://www.hdfcbank.com",
    domains: ["hdfcbank.com", "hdfc.com"],
    aliases: ["hdfc"],
  },
  "ICICI Bank": {
    name: "ICICI Bank",
    website: "https://www.icicibank.com",
    domains: ["icicibank.com"],
    aliases: ["icici"],
  },
  "Axis Bank": {
    name: "Axis Bank",
    website: "https://www.axisbank.com",
    domains: ["axisbank.com"],
    aliases: ["axis bank", "axis"],
  },
  "Kotak Mahindra Bank": {
    name: "Kotak Mahindra Bank",
    website: "https://www.kotak.com",
    domains: ["kotak.com"],
    aliases: ["kotak"],
  },
  "Punjab National Bank": {
    name: "Punjab National Bank",
    website: "https://www.pnbindia.in",
    domains: ["pnbindia.in"],
    aliases: ["punjab national", "pnb"],
  },
  "Bank of Baroda": {
    name: "Bank of Baroda",
    website: "https://www.bankofbaroda.in",
    domains: ["bankofbaroda.in"],
    aliases: ["bank of baroda", "bob"],
  },
  "Canara Bank": {
    name: "Canara Bank",
    website: "https://canarabank.com",
    domains: ["canarabank.com", "canarabank.in"],
    aliases: ["canara"],
  },
  "Union Bank of India": {
    name: "Union Bank of India",
    website: "https://www.unionbankofindia.bank.in",
    domains: ["unionbankofindia.bank.in", "unionbankofindia.co.in"],
    aliases: ["union bank"],
  },
  Paytm: {
    name: "Paytm",
    website: "https://paytm.com",
    domains: ["paytm.com", "paytmbank.in"],
    aliases: ["paytm"],
  },
  PhonePe: {
    name: "PhonePe",
    website: "https://www.phonepe.com",
    domains: ["phonepe.com"],
    aliases: ["phonepe", "phone pe"],
  },
  "Google Pay": {
    name: "Google Pay",
    website: "https://pay.google.com",
    domains: ["pay.google.com", "google.com"],
    aliases: ["google pay", "gpay"],
  },
  NPCI: {
    name: "NPCI (UPI)",
    website: "https://www.npci.org.in",
    domains: ["npci.org.in"],
    aliases: ["npci", "upi", "bhim"],
  },
  "Bharti Airtel": {
    name: "Airtel",
    website: "https://www.airtel.in",
    domains: ["airtel.in"],
    aliases: ["airtel"],
  },
  "Reliance Jio": {
    name: "Jio",
    website: "https://www.jio.com",
    domains: ["jio.com"],
    aliases: ["jio", "reliance jio"],
  },
  "Vodafone Idea": {
    name: "Vi (Vodafone Idea)",
    website: "https://www.myvi.in",
    domains: ["myvi.in", "vodafone.in"],
    aliases: ["vodafone", "myvi", "vi "],
  },
  EPFO: {
    name: "EPFO",
    website: "https://www.epfindia.gov.in",
    domains: ["epfindia.gov.in"],
    aliases: ["epfo", "pf", "provident fund"],
  },
  "Digital India": {
    name: "Digital India",
    website: "https://www.digitalindia.gov.in",
    domains: ["digitalindia.gov.in"],
    aliases: ["digital india"],
  },
  GST: {
    name: "GST Portal",
    website: "https://www.gst.gov.in",
    domains: ["gst.gov.in"],
    aliases: ["gst"],
  },
  "India Post": {
    name: "India Post",
    website: "https://www.indiapost.gov.in",
    domains: ["indiapost.gov.in"],
    aliases: ["india post", "speed post"],
  },
  "Amazon": {
    name: "Amazon",
    website: "https://www.amazon.in",
    domains: ["amazon.in", "amazon.com", "amazon.co.uk"],
    aliases: ["amazon"],
  },
  Netflix: {
    name: "Netflix",
    website: "https://www.netflix.com",
    domains: ["netflix.com"],
    aliases: ["netflix"],
  },
  "Apple": {
    name: "Apple",
    website: "https://www.apple.com",
    domains: ["apple.com", "icloud.com"],
    aliases: ["apple", "icloud"],
  },
  Microsoft: {
    name: "Microsoft",
    website: "https://www.microsoft.com",
    domains: ["microsoft.com", "live.com", "outlook.com"],
    aliases: ["microsoft", "outlook"],
  },
  WhatsApp: {
    name: "WhatsApp",
    website: "https://www.whatsapp.com",
    domains: ["whatsapp.com"],
    aliases: ["whatsapp"],
  },
};

// Common top-level domains we accept when a bare domain (no scheme) is found.
const TLD_PATTERN =
  "com|net|org|io|co|in|ai|gov|edu|us|uk|ca|au|de|fr|ru|xyz|top|info|biz|" +
  "online|site|shop|app|dev|me|cc|live|link|click|pw|club|store|website|" +
  "space|icu|vip|tk|ml|ga|cf|gq|to|ws|su|cz|bank|sbi";

const URL_PATTERN = new RegExp(
  `(?:https?:\\/\\/[^\\s"'<>()]+)|` +
    `(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+(?:${TLD_PATTERN})\\b(?:\\/[^\\s"'<>()]*)?)`,
  "gi"
);

// File extensions that look like domains but are not.
const FILE_EXTENSIONS = new Set([
  "jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "heic",
  "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "csv",
  "mp3", "mp4", "mov", "avi", "wav", "css", "js", "jsx", "json",
  "html", "htm", "txt", "xml", "exe", "zip", "rar",
]);

const ORGS = Object.entries(TRUSTED_ORGANIZATIONS).map(([key, org]) => ({
  key,
  ...org,
}));

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Each alias keeps two forms:
//   key     -> alphanumeric-only, used to match hostnames (sbi-online.xyz)
//   pattern -> word-aware regex, used to match free text ("State Bank of India")
// Longest-first so "google pay" beats "google", "axis bank" beats "bank".
const ALIASES = ORGS.flatMap((org) =>
  org.aliases.map((alias) => {
    const raw = String(alias).trim().toLowerCase();
    const flexible = raw
      .split(/\s+/)
      .map(escapeRegex)
      .join("[\\s\\-_]*");

    return {
      alias: raw,
      key: raw.replace(/[^a-z0-9]/g, ""),
      pattern: new RegExp(
        `(^|[^a-z0-9])${flexible}([^a-z0-9]|$)`
      ),
      org,
    };
  })
)
  .filter((entry) => entry.key.length >= 2)
  .sort((a, b) => b.key.length - a.key.length);

// Extract bare and full URLs from arbitrary text.
export function extractUrls(text) {
  if (!text) return [];

  const matches = String(text).match(URL_PATTERN) || [];
  const found = new Set();

  for (let match of matches) {
    match = match.replace(/[.,;:)\]}]+$/, "").trim();
    if (!match) continue;

    const extension = match.split(".").pop().toLowerCase().split("/")[0];
    if (FILE_EXTENSIONS.has(extension)) continue;

    found.add(match);
  }

  return [...found];
}

// Turn any URL-ish string into a clean lowercase hostname.
export function normalizeHost(input) {
  let value = String(input || "").trim();
  if (!value) return "";

  if (!/^https?:\/\//i.test(value)) {
    value = `http://${value}`;
  }

  try {
    const { hostname } = new URL(value);
    return hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return value
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0];
  }
}

function isSubdomainOf(host, domain) {
  return host === domain || host.endsWith(`.${domain}`);
}

// Find the trusted organization referenced by a free-text name (AI output).
export function findOrganization(text) {
  if (!text) return null;

  const haystack = String(text).toLowerCase();

  for (const { pattern, org } of ALIASES) {
    // Word-aware match so "sbi" doesn't match "sbixyz" inside words, while
    // "State Bank of India" still matches across spaces.
    if (pattern.test(haystack)) return org;
  }

  return null;
}

// Find a trusted organization from a hostname (e.g. sbi.co.in -> SBI).
export function findOrganizationByHost(host) {
  const cleanHost = normalizeHost(host);
  if (!cleanHost) return null;

  for (const org of ORGS) {
    const match = org.domains.find((domain) => isSubdomainOf(cleanHost, domain));
    if (match) return org;
  }

  return null;
}

// Verify a single URL against the trusted-domain list.
export function verifyUrl(rawUrl) {
  const original = String(rawUrl || "").trim();
  const host = normalizeHost(original);
  const hostNoSeparators = host.replace(/[^a-z0-9]/g, "");

  const result = {
    url: original,
    host,
    isOfficial: false,
    matchedBrand: null,
    organization: null,
    officialWebsite: null,
    status: "UNKNOWN", // SAFE | SUSPICIOUS | UNKNOWN
    impersonation: false,
    assessment:
      "Domain is not on the verified official-domain list. Treat it with caution.",
  };

  if (!host) return result;

  // 1. Exact official match?
  const officialOrg = findOrganizationByHost(host);
  if (officialOrg) {
    return {
      ...result,
      isOfficial: true,
      matchedBrand: officialOrg.name,
      organization: officialOrg.name,
      officialWebsite: officialOrg.website,
      status: "SAFE",
      assessment: `Verified as the official ${officialOrg.name} domain.`,
    };
  }

  // 2. Does the host imitate a known organization on a look-alike domain?
  for (const { key, org } of ALIASES) {
    if (!hostNoSeparators.includes(key)) continue;

    return {
      ...result,
      impersonation: true,
      matchedBrand: org.name,
      organization: org.name,
      officialWebsite: org.website,
      status: "SUSPICIOUS",
      assessment:
        `Impersonates "${org.name}" but is NOT an official domain ` +
        `(official: ${org.domains[0]}).`,
    };
  }

  return result;
}

// Verify a list of URLs, de-duplicating by hostname.
export function verifyUrls(urls) {
  const seen = new Set();
  const results = [];

  for (const url of urls || []) {
    const verification = verifyUrl(url);
    if (!verification.host || seen.has(verification.host)) continue;

    seen.add(verification.host);
    results.push(verification);
  }

  return results;
}

// True when at least one URL impersonates a known brand.
export function hasImpersonation(verifications = []) {
  return verifications.some((entry) => entry.impersonation);
}

// Build the deterministic "official website" block for the claimed org.
// Returns null when the organization cannot be confidently identified.
export function verifyOrganization(organizationText, urlVerifications = []) {
  const org =
    findOrganization(organizationText) ||
    urlVerifications
      .map((entry) =>
        entry.organization ? findOrganization(entry.organization) : null
      )
      .find(Boolean) ||
    null;

  if (!org) return null;

  const messageUrl =
    urlVerifications.find((entry) => entry.status === "SUSPICIOUS") ||
    urlVerifications.find((entry) => !entry.isOfficial) ||
    urlVerifications[0] ||
    null;

  const urlIsOfficial = messageUrl ? messageUrl.isOfficial : null;
  const matched =
    urlIsOfficial === true ||
    (messageUrl &&
      org.domains.some((domain) =>
        isSubdomainOf(messageUrl.host, domain)
      ));

  let status;
  let reason;

  if (!messageUrl) {
    status = "UNKNOWN";
    reason = "No URL was found in the message to compare against.";
  } else if (matched) {
    status = "SAFE";
    reason = "The message URL matches the official domain.";
  } else {
    status = "SUSPICIOUS";
    reason = "The message URL does not match the trusted official domain.";
  }

  return {
    identified: true,
    name: org.name,
    officialWebsite: org.website,
    claimedOrganization: organizationText || org.name,
    messageUrl: messageUrl ? messageUrl.url : null,
    status,
    reason,
  };
}