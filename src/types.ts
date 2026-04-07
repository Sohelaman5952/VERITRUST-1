export type ContentType = 'text' | 'image' | 'video' | 'url';

export interface AnalysisResult {
  score: number; // 0 to 100 (100 = definitely true, 0 = definitely fake)
  label: 'Authentic' | 'Suspicious' | 'Likely Fake' | 'Satire' | 'Inconclusive';
  confidence: number;
  summary: string;
  redFlags: string[];
  details: string;
}

export interface AnalysisRequest {
  type: ContentType;
  content: string; // Text, URL, or Base64
  metadata?: Record<string, any>;
}
