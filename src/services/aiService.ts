import { AnalysisResult, ContentType } from "../types";

export async function analyzeContent(type: ContentType, content: string): Promise<AnalysisResult> {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, content }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    return await response.json() as AnalysisResult;
  } catch (e: any) {
    console.error("Analysis Error:", e);
    throw new Error(e.message || "Analysis failed. Please try again.");
  }
}
