import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }
    openaiClient = new OpenAI({ apiKey: key });
  }
  return openaiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for base64 images/videos
  app.use(express.json({ limit: '50mb' }));

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/analyze", async (req, res) => {
    try {
      const { type, content } = req.body;
      const openai = getOpenAI();

      const messages: any[] = [];
      const systemInstruction = `You are an expert fact-checker and digital forensics analyst. 
Your task is to analyze the provided content (text, image, video, or URL) for signs of misinformation, deepfakes, or fake news.

For TEXT: Check for logical fallacies, emotional manipulation, lack of citations, and cross-reference with known facts.
For IMAGES/VIDEOS: Look for visual artifacts, unnatural lighting, inconsistent shadows, blending issues, or context mismatch.
For URLs: Analyze the source credibility and content consistency.

Provide a rigorous, unbiased analysis. ALWAYS return the result as a JSON object with the following exact structure:
{
  "score": number (0 to 100),
  "label": string (must be one of: "Authentic", "Suspicious", "Likely Fake", "Satire", "Inconclusive"),
  "confidence": number (0 to 1),
  "summary": string (brief summary of findings),
  "redFlags": array of strings (list of detected anomalies),
  "details": string (detailed explanation in markdown)
}`;

      messages.push({ role: "system", content: systemInstruction });

      const isMedia = type === 'image' || type === 'video';
      
      if (isMedia && content.startsWith('data:')) {
        // OpenAI supports image_url for images. For video, we'll treat it as an image frame or text if it's not supported, 
        // but gpt-4o supports images.
        messages.push({
          role: "user",
          content: [
            { type: "text", text: `Analyze this ${type} for signs of manipulation, deepfakes, or misinformation. Provide a forensic breakdown.` },
            { type: "image_url", image_url: { url: content } }
          ]
        });
      } else {
        messages.push({
          role: "user",
          content: `Analyze this ${type} content: ${content}`
        });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages,
        response_format: { type: "json_object" },
        // We can enforce JSON schema if we want, but json_object with instructions usually works well.
        // Let's provide the schema in the system prompt to be safe.
      });

      const responseText = response.choices[0]?.message?.content;
      if (!responseText) {
        throw new Error("No response from OpenAI");
      }

      // We expect the result to match AnalysisResult
      const result = JSON.parse(responseText);
      
      // Ensure required fields
      if (!result.score || !result.label || !result.confidence || !result.summary || !result.redFlags || !result.details) {
        // Provide defaults if OpenAI missed something
        result.score = result.score || 50;
        result.label = result.label || "Inconclusive";
        result.confidence = result.confidence || 0.5;
        result.summary = result.summary || "Analysis completed, but some fields were missing.";
        result.redFlags = result.redFlags || [];
        result.details = result.details || "No detailed breakdown provided.";
      }

      res.json(result);
    } catch (error: any) {
      console.error("OpenAI API Error:", error);
      res.status(500).json({ error: error.message || "An error occurred during analysis" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:\${PORT}`);
  });
}

startServer();
