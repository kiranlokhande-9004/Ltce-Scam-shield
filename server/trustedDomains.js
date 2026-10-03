// ---------------------------------------------------------------------------
// trustedDomains.js
//
// Deterministic domain verification. This layer does NOT trust the AI model:
// it extracts every URL mentioned in the analysis and checks each host against
// a curated list of official brand domains. This is what turns a soft "maybe"
// from the vision model into a hard, verifiable signal, and lets us escalate
// risk when a known brand is impersonated on a look-alike domain.
// ---------------------------------------------------------------------------

// Brand keyword -> list of official domains. Keywords are matched against the
// hostname with all non-alphanumeric characters removed (so "Cash App" matches
// "cashapp" and "bank of america" matches "bankofamerica").
const TRUSTED_DOMAINS = {
  // Banks
  "bank of america": ["bankofamerica.com"],
  "wells fargo": ["wellsfargo.com"],
  "capital one": ["capitalone.com"],
  "state bank of india": ["sbi.co.in", "onlinesbi.sbi"],
  "chase": ["chase.com"],
  "citi": ["citi.com"],
  "hsbc": ["hsbc.com", "hsbc.co.uk"],
  "barclays": ["barclays.co.uk", "barclays.com"],
  "hdfc": ["hdfcbank.com"],
  "icici": ["icicibank.com"],
  "sbi": ["sbi.co.in", "onlinesbi.sbi"],
  "axis": ["axisbank.com"],
  "kotak": ["kotak.com"],
  "federal bank": ["federalbank.co.in"],
  "canara": ["canarabank.com"],

  // Payments / fintech
  "cash app": ["cash.app"],
  "google pay": ["pay.google.com"],
  "apple pay": ["apple.com"],
  "phonepe": ["phonepe.com"],
  "paypal": ["paypal.com"],
  "venmo": ["venmo.com"],
  "zelle": ["zellepay.com"],
  "stripe": ["stripe.com"],
  "razorpay": ["razorpay.com"],
  "paytm": ["paytm.com"],
  "upi": ["npci.org.in"],

  // Tech / services
  "google": ["google.com", "accounts.google.com"],
  "gmail": ["gmail.com", "google.com"],
  "apple": ["apple.com", "icloud.com"],
  "icloud": ["icloud.com", "apple.com"],
  "microsoft": ["microsoft.com", "live.com", "outlook.com"],
  "outlook": ["outlook.com", "live.com", "microsoft.com"],
  "amazon": ["amazon.com", "amazon.in", "amazon.co.uk"],
  "netflix": ["netflix.com"],
  "meta": ["meta.com", "facebook.com"],
  "facebook": ["facebook.com"],
  "instagram": ["instagram.com"],
  "whatsapp": ["whatsapp.com"],
  "twitter": ["twitter.com", "x.com"],
  "linkedin": ["linkedin.com"],
  "dropbox": ["dropbox.com"],

  // Shipping / government
  "dhl": ["dhl.com"],
  "fedex": ["fedex.com"],
  "ups": ["ups.com"],
  "usps": ["usps.com"],
  "irs": ["irs.gov"],
};

// Common top-level domains we accept when a bare domain (no scheme) is found.
const TLD_PATTERN =
  "com|net|org|io|co|in|ai|gov|edu|us|uk|ca|au|de|fr|ru|xyz|top|info|biz|" +
  "online|site|shop|app|dev|me|cc|live|link|click|pw|club|store|website|" +
  "space|icu|vip|tk|ml|ga|cf|gq|to|ws|su|cz";

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

// Longest keywords first so "cash app" wins over "app", "google pay" over
// "google", etc.
const BRANDS = Object.entries(TRUSTED_DOMAINS)
  .map(([brand, domains]) => ({
    brand,
    key: brand.replace(/[^a-z0-9]/g, ""),
    domains,
  }))
  .filter((entry) => entry.key.length > 0)
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
function normalizeHost(input) {
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
    impersonation: false,
    assessment:
      "Domain is not on the verified official-domain list. Treat it with caution.",
  };

  if (!host) return result;

  for (const { brand, key, domains } of BRANDS) {
    if (!hostNoSeparators.includes(key)) continue;

    const officialDomain = domains.find((domain) =>
      isSubdomainOf(host, domain)
    );

    if (officialDomain) {
      result.isOfficial = true;
      result.matchedBrand = brand;
      result.assessment = `Verified as an official ${brand} domain.`;
    } else {
      result.impersonation = true;
      result.matchedBrand = brand;
      result.assessment = `Impersonates "${brand}" but is NOT an official ${brand} domain (official: ${domains.join(
        ", "
      )}).`;
    }

    return result;
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