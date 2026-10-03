import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { analyzeScreenshot } from "./analyze.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "..", "dist");

const app = express();
const PORT = process.env.PORT || 8787;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
});

app.use(cors());
app.use(express.json({ limit: "20mb" }));

app.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "ScamShield API",
    status: "running",
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