export interface SerpResult {
  title: string;
  url: string;
  description?: string;
  rank?: number;
}

export interface SerpResponse {
  success: boolean;
  keyword: string;
  results: SerpResult[];
  error?: string;
}

export interface ExtractedArticle {
  url: string;
  title?: string;
  content: string;
  wordCount?: number;
}

export interface ExtractResponse {
  success: boolean;
  articles: ExtractedArticle[];
  error?: string;
}

export interface AnalysisResult {
  headings: string[];
  wordCount: number;
  keywords: string[];
  avgWordCount: number;
  suggestedStructure: string[];
}

export interface AnalyzeResponse {
  success: boolean;
  analysis: AnalysisResult;
  error?: string;
}
