import dotenv from "dotenv";

dotenv.config();

const KIMI_BASE_URL = (process.env.KIMI_BASE_URL ||
  "https://rookery.dropcode.in/api/kimi/v1").replace(/\/+$/, "");

const KIMI_MODEL = process.env.KIMI_MODEL || "gpt-astra";

const KIMI_API_KEY =
  process.env.KIMI_API_KEY || process.env.OPENAI_API_KEY;

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
        max_tokens: 1800,
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
      console.error("Kimi API error:", rawText);
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

function parseKimiResult(content) {
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

    throw new Error(
      "Kimi returned analysis, but it was not valid JSON."
    );
  }
}