import { GoogleGenAI } from "@google/genai";
import { GenerateConfig, GeneratedArticle } from "@/types/article";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

const lengthMap = {
  short: { words: 600, sections: 3 },
  medium: { words: 1200, sections: 5 },
  long: { words: 2500, sections: 8 },
  "extra-long": { words: 4000, sections: 12 },
};



export async function generateArticle(
  config: GenerateConfig,
  extractedContent: string = ""
): Promise<GeneratedArticle> {
  const { keyword, contentType, length, format, includeImages, structure } =
    config;
  const lengthConfig = lengthMap[length];


  const systemPrompt = `You are an expert SEO content writer specializing in ${contentType} content. 
You write comprehensive, well-researched articles that rank highly on Google.
Your writing is engaging, informative, and optimized for both humans and search engines.
Always write in a neutral, professional tone while being conversational where appropriate.`;

  const contentContext =
    extractedContent.length > 100
      ? `\n\nHere is research from competitor articles to inform your writing (do NOT copy, use as reference only):\n${extractedContent.slice(0, 3000)}`
      : "";

  const userPrompt = `Write a ${lengthConfig.words}-word ${contentType} SEO article about "${keyword}".

Required headings to cover:
${structure.headings.slice(0, 10).map((h, i) => `${i + 1}. ${h}`).join("\n")}

Requirements to achieve 100/100 RankMath SEO Score:
- Target length: ~${lengthConfig.words} words
- Keyword Density: Use the exact focus keyword "${keyword}" roughly once per 100 words (approx ${Math.ceil(lengthConfig.words / 100)} times).
- Keyword placement: MUST appear in the very first sentence of the first paragraph (first 10% of content).
- Keyword in H2/H3: The exact keyword "${keyword}" MUST appear in at least two subheadings.
- Images & Alt Text: ${includeImages ? `Include image placeholders. The exact keyword "${keyword}" MUST appear in at least one image alt attribute.` : "No images needed."}
- External Links: Include at least 2 DoFollow external links to high-authority, relevant resources (e.g., Wikipedia, official sites).
- Internal Links: Include at least 2 internal link placeholders like [Internal Link: related topic].
- Readability: MUST be high readability (Grade 6 to 8 reading level). Use simple vocabulary. Make it easily understandable for anyone.
- Formatting: Use very short paragraphs (maximum 2-3 sentences per paragraph). Use bullet points and lists to break up text.
- Table of Contents: Include a brief Table of Contents right after the introduction.
- Avoid AI words: Do NOT use generic AI words like: "Moreover", "Furthermore", "In conclusion", "Tapestry", "Delve", "Beacon", "Testament", "Crucial". Sound 100% human, conversational, and direct.
- FINAL PROTOCOL: The article content MUST be written entirely in standard Markdown (using #, ##, ### for headings, - or * for lists, ** for bold, [IMAGE: alt text] for images). Let the application handle any further formatting. Do NOT output HTML or JSON unless asked.

You MUST provide the following metadata at the VERY TOP of your response, each on a new line:
TITLE: Primary click-worthy title. MUST start with the exact phrase "${keyword}". MUST contain a Number (e.g., 2025, Top 10) AND a sentiment/power word (e.g., Best, Amazing, Proven, Secret, Ultimate).
ALT_TITLES: Title 1 | Title 2 | Title 3 | Title 4 | Title 5
META: Compelling meta description (140-155 chars). MUST contain the exact focus keyword "${keyword}".
KEYWORDS: ${keyword}, related keyword 1, related keyword 2, related keyword 3, related keyword 4


${contentContext}

Start immediately with the TITLE line, followed by the other metadata lines, then a blank line, then the formatted article. Make it comprehensive and genuinely useful.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      { role: "user", parts: [{ text: systemPrompt + "\n\n" + userPrompt }] },
    ],
    config: {
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  });

  const raw = response.text || "";

  // Parse Metadata
  const titleMatch = raw.match(/TITLE:\s*(.+)/i);
  const altTitlesMatch = raw.match(/ALT_TITLES:\s*(.+)/i);
  const metaMatch = raw.match(/META:\s*(.+)/i);
  const keywordsMatch = raw.match(/KEYWORDS:\s*(.+)/i);

  const title = titleMatch ? titleMatch[1].trim() : keyword;
  const altTitles = altTitlesMatch
    ? altTitlesMatch[1].split("|").map((t) => t.trim()).filter(Boolean)
    : [];
  const metaDescription = metaMatch
    ? metaMatch[1].trim()
    : `Read our comprehensive guide about ${keyword}.`;
  const rankMathKeywords = keywordsMatch
    ? keywordsMatch[1].split(",").map((k) => k.trim()).filter(Boolean)
    : [keyword];

  // Remove metadata lines from content
  let content = raw
    .replace(/TITLE:\s*.+\n?/i, "")
    .replace(/ALT_TITLES:\s*.+\n?/i, "")
    .replace(/META:\s*.+\n?/i, "")
    .replace(/KEYWORDS:\s*.+\n?/i, "")
    .trim();

  // Strip accidental markdown codeblocks (e.g. ```html ... ```)
  content = content.replace(/^```(html|markdown|json)?\n?/i, "").replace(/\n?```$/i, "").trim();

  // Count words
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return {
    title,
    altTitles,
    content,
    format,
    wordCount,
    metaDescription,
    focusKeyword: keyword,
    rankMathKeywords,
  };
}
