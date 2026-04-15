export type ContentFormat = "wordpress" | "html" | "markdown" | "json";
export type ContentLength = "short" | "medium" | "long" | "extra-long";
export type ContentType =
  | "MOD APK"
  | "App Review"
  | "How-To Guide"
  | "Comparison"
  | "Listicle"
  | "News"
  | "General SEO";

export interface GenerateConfig {
  keyword: string;
  contentType: ContentType;
  length: ContentLength;
  format: ContentFormat;
  includeImages: boolean;
  structure: {
    headings: string[];
    wordCount: number;
  };
}

export interface GeneratedArticle {
  title: string;
  content: string;
  format: ContentFormat;
  wordCount: number;
  metaDescription?: string;
  focusKeyword?: string;
  altTitles?: string[];
  rankMathKeywords?: string[];
}

export interface GenerateResponse {
  success: boolean;
  article?: GeneratedArticle;
  error?: string;
}
