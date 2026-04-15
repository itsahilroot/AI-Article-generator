import { AnalysisResult } from "@/types/serp";

export function analyzeContent(
  content: string,
  keyword: string
): AnalysisResult {
  // Extract headings (H2 and H3)
  const h2Headings = content.match(/^##\s+(.+)/gm) || [];
  const h3Headings = content.match(/^###\s+(.+)/gm) || [];
  const allHeadings = [...h2Headings, ...h3Headings].map((h) =>
    h.replace(/^#{2,3}\s+/, "")
  );

  // Word count
  const words = content.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Extract keyword frequency and related terms
  const keywordLower = keyword.toLowerCase();
  const keywordParts = keywordLower.split(/\s+/);

  const wordFreq: Record<string, number> = {};
  words.forEach((word) => {
    const clean = word.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (clean.length > 3) {
      wordFreq[clean] = (wordFreq[clean] || 0) + 1;
    }
  });

  // Get top keywords by frequency (excluding very common words)
  const stopWords = new Set([
    "this",
    "that",
    "with",
    "from",
    "have",
    "will",
    "your",
    "they",
    "their",
    "what",
    "when",
    "where",
    "which",
    "there",
    "been",
    "also",
    "into",
    "more",
    "some",
    "than",
    "then",
    "them",
    "were",
    "these",
    "those",
  ]);

  const keywords = Object.entries(wordFreq)
    .filter(([word]) => !stopWords.has(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word]) => word);

  // Build suggested structure from headings + keyword
  const suggestedStructure: string[] = [];

  // Always include introduction
  suggestedStructure.push(`What is ${keyword}?`);

  // Pull best headings from analysis
  if (allHeadings.length > 0) {
    const unique = [...new Set(allHeadings)].slice(0, 8);
    suggestedStructure.push(...unique);
  } else {
    suggestedStructure.push(
      `Features of ${keyword}`,
      `How to Download ${keyword}`,
      `How to Install ${keyword}`,
      `${keyword} vs Official Version`,
      `Is ${keyword} Safe?`,
      `Frequently Asked Questions`
    );
  }

  // Always include FAQs
  if (!suggestedStructure.some((h) => /faq|question/i.test(h))) {
    suggestedStructure.push("Frequently Asked Questions");
  }

  return {
    headings: allHeadings,
    wordCount,
    keywords,
    avgWordCount: wordCount,
    suggestedStructure,
  };
}

export function aggregateAnalysis(
  articles: { content: string }[],
  keyword: string
): AnalysisResult {
  if (articles.length === 0) {
    return {
      headings: [],
      wordCount: 0,
      keywords: [],
      avgWordCount: 0,
      suggestedStructure: [],
    };
  }

  const allResults = articles.map((a) => analyzeContent(a.content, keyword));

  // Aggregate headings (by frequency across articles)
  const headingFreq: Record<string, number> = {};
  allResults.forEach((r) => {
    r.headings.forEach((h) => {
      const key = h.toLowerCase().trim();
      headingFreq[key] = (headingFreq[key] || 0) + 1;
    });
  });

  const topHeadings = Object.entries(headingFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([heading]) => heading);

  // Aggregate keywords
  const keywordFreq: Record<string, number> = {};
  allResults.forEach((r) => {
    r.keywords.forEach((k, i) => {
      keywordFreq[k] = (keywordFreq[k] || 0) + (15 - i); // weight by rank
    });
  });

  const topKeywords = Object.entries(keywordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([keyword]) => keyword);

  // Average word count
  const totalWords = allResults.reduce((sum, r) => sum + r.wordCount, 0);
  const avgWordCount = Math.round(totalWords / allResults.length);

  // Build suggested structure
  const suggestedStructure = [
    `What is ${keyword}?`,
    ...topHeadings.slice(0, 7),
    "Frequently Asked Questions",
    "Conclusion",
  ];

  return {
    headings: topHeadings,
    wordCount: totalWords,
    keywords: topKeywords,
    avgWordCount,
    suggestedStructure: [...new Set(suggestedStructure)],
  };
}
