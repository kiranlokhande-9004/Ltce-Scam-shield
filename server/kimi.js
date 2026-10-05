import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Always load the project-root ".env" (independent of the process CWD) so the
// backend reads the correct Kimi credentials. NOTE: .env is only read at
// startup, so the server must be restarted for changes to take effect.
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const KIMI_BASE_URL = (process.env.KIMI_BASE_URL ||
  "https://rookery.dropcode.in/api/kimi/v1").replace(/\/+$/, "");

const KIMI_MODEL = process.env.KIMI_MODEL || "gpt-astra";

const KIMI_API_KEY =
  process.env.KIMI_API_KEY || process.env.OPENAI_API_KEY;

// Surface the real underlying reason whenever the Kimi endpoint rejects a
// request (e.g. the "insufficient balance / payment required" body behind an
// HTTP 402) so failures are debuggable from the server logs. The error message
// returned to the client is intentionally left unchanged so the frontend
// error handling/design stays exactly the same.
function logKimiApiError(context, status, rawText) {
  let detail = "";

  try {
    const parsed = JSON.parse(rawText);
    const err = parsed?.error;
    detail =
      (typeof err === "string" && err) ||
      err?.message ||
      parsed?.message ||
      "";
  } catch {
    detail = rawText || "";
  }

  detail = String(detail).trim();

  console.error(
    `[${context}] Kimi API returned HTTP ${status}` +
      (detail ? `: ${detail}` : ": (no error detail in response body).")
  );

  if (status === 402) {
    console.error(
      "[Kimi] HTTP 402 means the configured API key has no remaining " +
        "balance/quota for this request. Verify KIMI_API_KEY (and " +
        "KIMI_BASE_URL / KIMI_MODEL) in .env, then restart the backend so " +
        "the current values are loaded."
    );
  }
}

const SYSTEM_PROMPT = `
You are ScamShield, an AI system for detecting suspicious SMS
messages, payment scams, phishing attempts, impersonation and
social-engineering attacks.

Analyze the uploaded screenshot carefully.

Return ONLY valid JSON. Do not wrap it in markdown.

Use exactly this structure:

{
  "risk": "HIGH | MEDIUM | LOW | SAFE",
  "organization": "identified organization or Unknown",
  "claim": "main claim made by the message",
  "requestedAction": "what the victim is asked to do",
  "urgency": "deadline or urgency mentioned",
  "suspiciousEvidence": [
    "specific suspicious evidence"
  ],
  "whySuspicious": [
    "specific reason"
  ],
  "attackChain": [
    "step 1",
    "step 2"
  ],
  "urlVerification": {
    "detected": true,
    "urls": [],
    "assessment": "No URL detected"
  },
  "safeActions": [
    "specific safe action"
  ]
}

Be evidence-based. Do not invent information that is not visible or
reasonably supported by the screenshot. If there is no URL, set
"detected" to false and clearly say that no URL was detected. Focus on
protecting the user from fraud.
`.trim();

export async function analyzeImageWithKimi(
  base64Image,
  mimeType = "image/jpeg"
) {
  if (!KIMI_API_KEY) {
    throw new Error("KIMI_API_KEY is missing from the .env file.");
  }

  if (!base64Image) {
    throw new Error("No image data supplied to Kimi.");
  }

  const endpoint = `${KIMI_BASE_URL}/chat/completions`;

  console.log("=================================");
  console.log("Sending image to Kimi...");
  console.log("Model:", KIMI_MODEL);
  console.log("Endpoint:", endpoint);
  console.log("=================================");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${KIMI_API_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: KIMI_MODEL,
        temperature: 0.1,
        max_tokens: 3000,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this screenshot and identify whether it is a scam.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
      }),
    });

    clearTimeout(timeout);

    console.log("Kimi HTTP status:", response.status);

    const rawText = await response.text();
    console.log("Response length:", rawText.length);

    if (!response.ok) {
      logKimiApiError("Screenshot analysis", response.status, rawText);
      throw new Error(`Kimi API returned ${response.status}.`);
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error("Kimi returned invalid JSON:", rawText);
      throw new Error("Kimi returned an invalid API response.");
    }

    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      console.error("Full Kimi response:", data);
      throw new Error("Kimi returned no analysis content.");
    }

    console.log("Kimi content received.");

    return parseKimiResult(content);
  } catch (error) {
    clearTimeout(timeout);

    if (error.name === "AbortError") {
      throw new Error("Kimi analysis timed out after 60 seconds.");
    }

    throw error;
  }
}

export function parseKimiResult(content) {
  let cleaned = String(content).trim();

  // Remove markdown JSON fences if the model added them.
  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Fall back to extracting the first {...} block.
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        // fall through
      }
    }

    // Last resort: repair JSON that was cut off by the token limit
    // (unterminated strings / unclosed braces or brackets).
    const candidate = start !== -1 ? cleaned.slice(start) : cleaned;
    const repaired = repairTruncatedJson(candidate);

    if (repaired) {
      try {
        return JSON.parse(repaired);
      } catch {
        // fall through
      }
    }

    console.error("Kimi returned unparsable content:");
    console.error(cleaned);

    throw new Error(
      "Kimi returned analysis, but it was not valid JSON."
    );
  }
}

// Attempt to close unterminated strings and unbalanced brackets/braces that
// result when the model's output is truncated mid-JSON.
function repairTruncatedJson(text) {
  const stack = [];
  let inString = false;
  let escaped = false;

  for (const char of text) {
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }

    if (char === '"') inString = true;
    else if (char === "{") stack.push("}");
    else if (char === "[") stack.push("]");
    else if ((char === "}" || char === "]") && stack.length) stack.pop();
  }

  let repaired = text;

  // Close an open string.
  if (inString) repaired += '"';

  // Drop a dangling `"key":` or trailing comma left by the truncation.
  repaired = repaired
    .replace(/,\s*"[^"]*"\s*:\s*$/, "")
    .replace(/,\s*$/, "");

  // Close any remaining containers.
  while (stack.length) repaired += stack.pop();

  return repaired;
}

// ---------------------------------------------------------------------------
// Call-transcript analysis (ScamShield Call Safety AI)
// ---------------------------------------------------------------------------

const CALL_SYSTEM_PROMPT = `
You are ScamShield Call Safety AI.

Analyze a phone conversation transcript for fraud, phishing, impersonation,
social engineering and financial scams.

Look for:

1. Organization impersonation
2. OTP requests
3. PIN requests
4. CVV requests
5. Password requests
6. UPI/payment requests
7. Screen-sharing requests
8. Remote-access requests
9. KYC threats
10. Account blocking threats
11. Police/legal threats
12. Prize/refund scams
13. Urgency
14. Fear or intimidation
15. Requests to install applications
16. Requests to transfer money
17. Requests to reveal banking information

Return ONLY valid JSON. Do not wrap it in markdown. Use exactly this structure:

{
  "risk": "LOW | MEDIUM | HIGH | CRITICAL",
  "fraudScore": 0,
  "impersonatedOrganization": "",
  "indicators": [],
  "explanation": "",
  "recommendedAction": "",
  "paymentRisk": false,
  "credentialRisk": false
}

Risk rules:

LOW: No meaningful scam indicators.
MEDIUM: Suspicious behavior but insufficient evidence of fraud.
HIGH: Multiple strong scam indicators.
CRITICAL: Requests for OTP/PIN/CVV/password/payment combined with
impersonation, threats, urgency or account takeover attempts.

Do not claim certainty when evidence is insufficient.

If the organization is unknown, set "impersonatedOrganization" to "Unknown".
If no payment request is present, set "paymentRisk" to false.
If no OTP/PIN/CVV/password request is present, set "credentialRisk" to false.
Only report indicators that are actually supported by the transcript.
`.trim();

export async function analyzeCallTranscript(transcript, meta = {}) {
  if (!KIMI_API_KEY) {
    throw new Error("KIMI_API_KEY is missing from the .env file.");
  }

  const text = String(transcript || "").trim();
  if (!text) {
    throw new Error("No transcript supplied for call analysis.");
  }

  const endpoint = `${KIMI_BASE_URL}/chat/completions`;
  const caller = [meta.callerName, meta.callerNumber]
    .filter(Boolean)
    .join(" / ");

  const userContent =
    `Caller: ${caller || "Unknown"}\n\n` +
    `Conversation transcript so far:\n${text}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${KIMI_API_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: KIMI_MODEL,
        temperature: 0,
        max_tokens: 900,
        messages: [
          { role: "system", content: CALL_SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
      }),
    });

    clearTimeout(timeout);

    const rawText = await response.text();

    if (!response.ok) {
      logKimiApiError("Call analysis", response.status, rawText);
      throw new Error(`Kimi API returned ${response.status}.`);
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error("Kimi returned an invalid API response.");
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Kimi returned no call analysis content.");
    }

    return parseKimiResult(content);
  } catch (error) {
    clearTimeout(timeout);

    if (error.name === "AbortError") {
      throw new Error("Kimi call analysis timed out after 30 seconds.");
    }

    throw error;
  }
}

export { KIMI_MODEL };

// ---------------------------------------------------------------------------
// Text / URL / email scam analysis (ScamShield message scanner)
// ---------------------------------------------------------------------------

const SCAN_SYSTEM_PROMPT = `
You are ScamShield, an AI that detects scam and phishing content in messages,
URLs and emails.

Return ONLY valid JSON. Do not wrap it in markdown. Use exactly this structure:

{
  "verdict": "SAFE | SUSPICIOUS | DANGEROUS",
  "riskScore": 0,
  "summary": "",
  "indicators": [],
  "recommendation": ""
}

Rules:
SAFE: no meaningful scam indicators.
SUSPICIOUS: some risky signals but not conclusive.
DANGEROUS: clear scam/phishing with strong indicators.
riskScore is an integer 0-100 aligned with the verdict.

Only report indicators that are actually supported by the content.
Do not invent details. Keep "summary" and "recommendation" short and practical.
Never claim to know an organization's official website.
`.trim();

export async function analyzeMessageText(content, type = "message") {
  if (!KIMI_API_KEY) {
    throw new Error("KIMI_API_KEY is missing from the .env file.");
  }

  const text = String(content || "").trim();
  if (!text) {
    throw new Error("No content supplied for analysis.");
  }

  const endpoint = `${KIMI_BASE_URL}/chat/completions`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${KIMI_API_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: KIMI_MODEL,
        temperature: 0,
        max_tokens: 700,
        messages: [
          { role: "system", content: SCAN_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Content type: ${type}\n\nContent to analyze:\n${text}`,
          },
        ],
      }),
    });

    clearTimeout(timeout);

    const rawText = await response.text();

    if (!response.ok) {
      logKimiApiError("Text/URL scan", response.status, rawText);
      throw new Error(`Kimi API returned ${response.status}.`);
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error("Kimi returned an invalid API response.");
    }

    const messageContent = data?.choices?.[0]?.message?.content;
    if (!messageContent) {
      throw new Error("Kimi returned no analysis content.");
    }

    return parseKimiResult(messageContent);
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === "AbortError") {
      throw new Error("Kimi text analysis timed out after 30 seconds.");
    }
    throw error;
  }
}