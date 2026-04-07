import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ContentType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeContent(type: ContentType, content: string): Promise<AnalysisResult> {
  const isMedia = type === 'image' || type === 'video';
  
  const parts: any[] = [];
  
  if (isMedia && content.startsWith('data:')) {
    const [mimeInfo, base64Data] = content.split(',');
    const mimeType = mimeInfo.split(':')[1].split(';')[0];
    parts.push({
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    });
    parts.push({ text: `Analyze this ${type} for signs of manipulation, deepfakes, or misinformation. Provide a forensic breakdown.` });
  } else {
    parts.push({ text: `Analyze this ${type} content: ${content}` });
  }

  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER, description: "Truth score from 0 to 100" },
          label: { type: Type.STRING, enum: ["Authentic", "Suspicious", "Likely Fake", "Satire", "Inconclusive"] },
          confidence: { type: Type.NUMBER, description: "Confidence in analysis from 0 to 1" },
          summary: { type: Type.STRING },
          redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
          details: { type: Type.STRING, description: "Detailed explanation in markdown" },
        },
        required: ["score", "label", "confidence", "summary", "redFlags", "details"],
      },
      systemInstruction: `You are an expert fact-checker and digital forensics analyst. 
      Your task is to analyze the provided content (text, image, video, or URL) for signs of misinformation, deepfakes, or fake news.
      
      For TEXT: Check for logical fallacies, emotional manipulation, lack of citations, and cross-reference with known facts.
      For IMAGES/VIDEOS: Look for visual artifacts, unnatural lighting, inconsistent shadows, blending issues, or context mismatch.
      For URLs: Analyze the source credibility and content consistency.
      
      Provide a rigorous, unbiased analysis.`,
    },
    contents: [
      {
        parts: parts
      }
    ],
  });

  const response = await model;
  try {
    return JSON.parse(response.text || "{}") as AnalysisResult;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("Analysis failed. Please try again.");
  }
}
