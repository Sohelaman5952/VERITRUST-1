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
    parts.push({ text: `Analyze this ${type} for signs of manipulation, deepfakes, or misinformation. Provide a forensic breakdown. Return the analysis in the specified JSON format.` });
  } else {
    parts.push({ text: `Analyze this ${type} content: ${content}. Return the analysis in the specified JSON format.` });
  }

  // Create a new instance right before the call to ensure we have the latest API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please ensure it is set in the environment.");
  }
  const ai = new GoogleGenAI({ apiKey });

  try {
    const tools: any[] = [];
    if (type === 'url') {
      tools.push({ urlContext: {} });
    }
    // Always add Google Search for fact-checking
    tools.push({ googleSearch: {} });

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview", // Using Pro for more complex forensic analysis
      config: {
        tools: tools,
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
        
        Provide a rigorous, unbiased analysis. ALWAYS return the result in the specified JSON format.`,
      },
      contents: [
        {
          parts: parts
        }
      ],
    });

    if (!response.text) {
      const finishReason = response.candidates?.[0]?.finishReason;
      if (finishReason === 'SAFETY') {
        throw new Error("The content could not be analyzed due to safety filters.");
      }
      throw new Error("The AI failed to generate a response. Please try again.");
    }

    return JSON.parse(response.text) as AnalysisResult;
  } catch (e: any) {
    console.error("Gemini API Error:", e);
    if (e.message?.includes("API_KEY_INVALID") || e.message?.includes("API key not valid")) {
      throw new Error("Invalid API Key. Please check your configuration.");
    }
    if (e.message?.includes("quota") || e.message?.includes("429")) {
      throw new Error("API quota exceeded. Please try again later.");
    }
    throw new Error(e.message || "Analysis failed. Please try again.");
  }
}
