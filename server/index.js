import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { analyzeScreenshot } from "./analyze.js";
import { analyzeCall, KIMI_MODEL } from "./callAnalyze.js";
import { scanText } from "./scanText.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load the project-root ".env" explicitly so the correct Kimi credentials and
// PORT are used regardless of the current working directory. A restart is
// required after editing .env because env vars are read only once at startup.
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const distDir = path.resolve(__dirname, "..", "dist");

const app = express();
const PORT = process.env.PORT || 8787;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
});

// Cap transcript size so a single request can never bloat the AI call.
const MAX_TRANSCRIPT_CHARS = 4000;

// Simple in-memory sliding-window rate limiter (per IP) for the call endpoint.
const callHits = new Map();
const CALL_WINDOW_MS = 60_000;
const CALL_MAX_PER_WINDOW = 30;

function rateLimitCall(req, res, next) {
  const key = req.ip || "unknown";
  const now = Date.now();
  const hits = (callHits.get(key) || []).filter(
    (t) => now - t < CALL_WINDOW_MS
  );

  if (hits.length >= CALL_MAX_PER_WINDOW) {
    return res.status(429).json({
      success: false,
      error: "Too many call-analysis requests. Please slow down.",
    });
  }

  hits.push(now);
  callHits.set(key, hits);
  next();
}

app.use(cors());
app.use(express.json({ limit: "20mb" }));

app.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "ScamShield API",
    status: "running",
  });
});

// Reports the real configured AI model (never the key) for honest UI metrics.
app.get("/api/config", (req, res) => {
  res.json({
    success: true,
    model: KIMI_MODEL,
  });
});

app.post("/api/analyze", upload.single("image"), async (req, res) => {
  console.log("\n==============================");
  console.log("SCAMSHIELD ANALYSIS REQUEST");
  console.log("==============================");

  try {
    let imageBuffer;
    let mimeType;

    // FormData upload
    if (req.file) {
      console.log("Image received:", req.file.originalname);

      imageBuffer = req.file.buffer;
      mimeType = req.file.mimetype;
    }

    // JSON/base64 fallback
    else if (req.body?.imageBase64) {
      console.log("Base64 image received");

      let base64 = req.body.imageBase64;

      const match = base64.match(/^data:(image\/[^;]+);base64,(.*)$/);

      if (match) {
        mimeType = match[1];
        base64 = match[2];
      } else {
        mimeType = req.body.mimeType || "image/jpeg";
      }

      imageBuffer = Buffer.from(base64, "base64");
    }

    if (!imageBuffer || !imageBuffer.length) {
      console.log("ERROR: No image received");

      return res.status(400).json({
        success: false,
        error: "No image received. Please upload a screenshot.",
      });
    }

    console.log("Image size:", imageBuffer.length);
    console.log("Image type:", mimeType);
    console.log("Starting analysis...");

    const analysis = await analyzeScreenshot(imageBuffer, mimeType);

    console.log("Analysis completed. Risk:", analysis.riskLevel);

    return res.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Analysis error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Analysis failed.",
    });
  }
});

app.post("/api/call-analyze", rateLimitCall, async (req, res) => {
  console.log("\n==============================");
  console.log("SCAMSHIELD CALL-ANALYZE REQUEST");
  console.log("==============================");

  try {
    const transcript = req.body?.transcript;

    if (typeof transcript !== "string" || !transcript.trim()) {
      return res.status(400).json({
        success: false,
        error: "No transcript provided.",
      });
    }

    if (transcript.length > MAX_TRANSCRIPT_CHARS) {
      return res.status(413).json({
        success: false,
        error: `Transcript too large. Limit is ${MAX_TRANSCRIPT_CHARS} characters.`,
      });
    }

    console.log("Caller:", req.body?.callerNumber || "unknown");
    console.log("Transcript length:", transcript.length);

    const analysis = await analyzeCall({
      transcript,
      callerNumber: req.body?.callerNumber,
      callerName: req.body?.callerName,
    });

    console.log(
      "Call analysis completed. Risk:",
      analysis.risk,
      "| AI used:",
      analysis.aiUsed
    );

    return res.json({ success: true, analysis });
  } catch (error) {
    console.error("Call analysis error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Call analysis failed.",
    });
  }
});

// Cap pasted content so a single request can never bloat the AI call.
const MAX_SCAN_CHARS = 5000;

app.post("/api/scan-text", rateLimitCall, async (req, res) => {
  console.log("\n==============================");
  console.log("SCAMSHIELD SCAN-TEXT REQUEST");
  console.log("==============================");

  try {
    const content = req.body?.content;
    const type =
      typeof req.body?.type === "string" ? req.body.type : "message";

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: "No content provided.",
      });
    }

    if (content.length > MAX_SCAN_CHARS) {
      return res.status(413).json({
        success: false,
        error: `Content too large. Limit is ${MAX_SCAN_CHARS} characters.`,
      });
    }

    console.log("Type:", type, "| Length:", content.length);

    const analysis = await scanText({ content, type });

    console.log("Scan completed. Verdict:", analysis.verdict);

    return res.json({ success: true, analysis });
  } catch (error) {
    console.error("Scan error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Scan failed.",
    });
  }
});

// Unknown API route
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    error: "API endpoint not found.",
  });
});

// Serve the built client (after `npm run build`) when it exists.
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));

  app.get("*", (req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log("--------------------------------");
  console.log(`ScamShield API running on http://localhost:${PORT}`);
  console.log("--------------------------------");
});