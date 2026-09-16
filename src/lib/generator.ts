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

// ─────────────────────────────────────────────
// HUMANIZATION ENGINE
// ─────────────────────────────────────────────

/** 1. Comprehensive AI vocabulary replacement */
const AI_WORD_MAP: Record<string, string[]> = {
  // Transitions
  "\\bFurthermore,?\\b": ["And", "Plus", "On top of that", "What's more", "Also"],
  "\\bMoreover,?\\b": ["Plus", "Also", "And another thing", "Beyond that"],
  "\\bAdditionally,?\\b": ["Also", "And", "On top of that", "What's more"],
  "\\bIn conclusion,?\\b": ["So", "In the end", "All said and done", "When you boil it down"],
  "\\bTo summarize,?\\b": ["In short", "The short version", "To put it simply"],
  "\\bIn summary,?\\b": ["In short", "The bottom line", "Simply put"],
  "\\bIn addition,?\\b": ["Also", "Plus", "And", "On top of that"],
  "\\bConsequently,?\\b": ["So", "As a result", "That's why", "Which means"],
  "\\bTherefore,?\\b": ["So", "That's why", "Which is why", "And that means"],
  "\\bHowever,?\\b": ["But", "Still", "That said", "Even so"],
  "\\bNevertheless,?\\b": ["Still", "Even so", "But here's the thing"],
  "\\bNonetheless,?\\b": ["Still", "That said", "Even so"],
  "\\bThus,?\\b": ["So", "That's why", "Which means"],
  "\\bHence,?\\b": ["So", "That's why", "This is why"],

  // Overused AI adjectives/verbs
  "\\bcrucial\\b": ["important", "key", "essential", "critical"],
  "\\bCrucial\\b": ["Important", "Key", "Essential", "Critical"],
  "\\bvital\\b": ["key", "critical", "essential", "really important"],
  "\\bVital\\b": ["Key", "Critical", "Essential", "Really important"],
  "\\bmeticulous(?:ly)?\\b": ["careful", "thorough", "precise", "detailed"],
  "\\bMeticulous(?:ly)?\\b": ["Careful", "Thorough", "Precise", "Detailed"],
  "\\bcomprehensive\\b": ["thorough", "complete", "full", "in-depth"],
  "\\bComprehensive\\b": ["Thorough", "Complete", "Full", "In-depth"],
  "\\brobust\\b": ["strong", "solid", "reliable", "powerful"],
  "\\bRobust\\b": ["Strong", "Solid", "Reliable", "Powerful"],
  "\\bintricate\\b": ["complex", "detailed", "layered", "nuanced"],
  "\\bIntricate\\b": ["Complex", "Detailed", "Layered", "Nuanced"],
  "\\bpivotal\\b": ["key", "major", "defining", "game-changing"],
  "\\bPivotal\\b": ["Key", "Major", "Defining", "Game-changing"],
  "\\bprofound\\b": ["deep", "significant", "real", "meaningful"],
  "\\bProfound\\b": ["Deep", "Significant", "Real", "Meaningful"],

  // "Delve" family
  "\\bDelv(?:ing|e) into\\b": ["Looking at", "Getting into", "Digging into", "Exploring"],
  "\\bdelv(?:ing|e) into\\b": ["looking at", "getting into", "digging into", "exploring"],

  // Landscape / realm / journey
  "\\blandscape\\b": ["world", "space", "scene", "field"],
  "\\bLandscape\\b": ["World", "Space", "Scene", "Field"],
  "\\brealm\\b": ["world", "space", "area", "domain"],
  "\\bRealm\\b": ["World", "Space", "Area", "Domain"],
  "\\bembark(?:ing)? on\\b": ["start", "begin", "kick off", "dive into"],
  "\\bEmbark(?:ing)? on\\b": ["Start", "Begin", "Kick off", "Dive into"],
  "\\bjourney\\b": ["process", "path", "experience", "ride"],
  "\\bJourney\\b": ["Process", "Path", "Experience", "Ride"],

  // Buzzwords
  "\\bunleash\\b": ["use", "tap into", "unlock", "release"],
  "\\bUnleash\\b": ["Use", "Tap into", "Unlock", "Release"],
  "\\belevate\\b": ["improve", "boost", "lift", "upgrade"],
  "\\bElevate\\b": ["Improve", "Boost", "Lift", "Upgrade"],
  "\\brevolutionize\\b": ["change", "transform", "shake up", "overhaul"],
  "\\bRevolutionize\\b": ["Change", "Transform", "Shake up", "Overhaul"],
  "\\bsynergy\\b": ["teamwork", "collaboration", "connection", "combined effect"],
  "\\bSynergy\\b": ["Teamwork", "Collaboration", "Connection", "Combined effect"],
  "\\bseamless(?:ly)?\\b": ["smooth", "easy", "effortless", "natural"],
  "\\bSeamless(?:ly)?\\b": ["Smooth", "Easy", "Effortless", "Natural"],
  "\\btapestry\\b": ["mix", "blend", "collection", "combination"],
  "\\bTapestry\\b": ["Mix", "Blend", "Collection", "Combination"],
  "\\bbeacon\\b": ["guide", "light", "example", "model"],
  "\\bBeacon\\b": ["Guide", "Light", "Example", "Model"],
  "\\bfostering\\b": ["encouraging", "building", "growing", "supporting"],
  "\\bFostering\\b": ["Encouraging", "Building", "Growing", "Supporting"],
  "\\bparadigm shift\\b": ["big change", "turning point", "shift", "major change"],
  "\\bParadigm shift\\b": ["Big change", "Turning point", "Shift", "Major change"],
  "\\bcutting-edge\\b": ["new", "modern", "latest", "advanced"],
  "\\bCutting-edge\\b": ["New", "Modern", "Latest", "Advanced"],
  "\\bstate-of-the-art\\b": ["modern", "advanced", "top-tier", "latest"],
  "\\bState-of-the-art\\b": ["Modern", "Advanced", "Top-tier", "Latest"],
  "\\bgroundbreaking\\b": ["new", "major", "significant", "fresh"],
  "\\bGroundbreaking\\b": ["New", "Major", "Significant", "Fresh"],
  "\\btransformative\\b": ["powerful", "game-changing", "big", "meaningful"],
  "\\bTransformative\\b": ["Powerful", "Game-changing", "Big", "Meaningful"],
  "\\binnovative\\b": ["new", "fresh", "creative", "different"],
  "\\bInnovative\\b": ["New", "Fresh", "Creative", "Different"],
  "\\bshed light on\\b": ["explain", "clarify", "unpack", "show"],
  "\\bShed light on\\b": ["Explain", "Clarify", "Unpack", "Show"],
  "\\bIt is important to note(?: that)?\\b": [
    "Worth mentioning",
    "Keep in mind",
    "One thing to know",
    "Remember",
  ],
  "\\bIt's important to note(?: that)?\\b": [
    "Worth mentioning",
    "Keep in mind",
    "One thing to know",
    "Remember",
  ],
  "\\bIt is worth noting(?: that)?\\b": ["Worth knowing", "Interestingly", "Note that"],
  "\\bIt's worth noting(?: that)?\\b": ["Worth knowing", "Interestingly", "Note that"],
  "\\bone must\\b": ["you should", "you need to", "it's smart to"],
  "\\bOne must\\b": ["You should", "You need to", "It's smart to"],
  "\\bin today's world\\b": ["these days", "right now", "today"],
  "\\bIn today's world\\b": ["These days", "Right now", "Today"],
  "\\bin today's digital age\\b": ["these days", "in 2025", "now"],
  "\\bIn today's digital age\\b": ["These days", "In 2025", "Now"],
  "\\bwhen it comes to\\b": ["with", "regarding", "for", "about"],
  "\\bWhen it comes to\\b": ["With", "Regarding", "For", "About"],
};

/** Pick a random replacement from alternatives */
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Replace AI vocabulary with randomised human alternatives */
function replaceAIVocab(text: string): string {
  let result = text;
  for (const [pattern, replacements] of Object.entries(AI_WORD_MAP)) {
    const regex = new RegExp(pattern, "g");
    result = result.replace(regex, () => pickRandom(replacements));
  }
  return result;
}

/** 2. Sentence-level burstiness: insert short punchy sentences after long ones */
function injectBurstiness(text: string): string {
  // Split on paragraph boundaries
  const paragraphs = text.split(/\n{2,}/);
  const fillers = [
    "Seriously.",
    "No joke.",
    "It really is.",
    "I mean it.",
    "And that matters.",
    "Think about that.",
    "Worth it.",
    "Every time.",
    "Trust me on this.",
    "It shows.",
    "That's the reality.",
    "Not kidding.",
  ];
  return paragraphs
    .map((para) => {
      // Only inject into prose paragraphs (not headings, lists, or code)
      if (
        para.startsWith("#") ||
        para.startsWith("-") ||
        para.startsWith("*") ||
        para.startsWith("|") ||
        para.startsWith("```")
      ) {
        return para;
      }
      const sentences = para.split(/(?<=[.?!])\s+/);
      if (sentences.length > 3) {
        // After the 2nd sentence randomly inject a punchy one
        const insertAt = 2;
        sentences.splice(insertAt, 0, pickRandom(fillers));
      }
      return sentences.join(" ");
    })
    .join("\n\n");
}

/** 3. Remove uniform markdown bolding (AI detection fingerprint) */
function removeBolding(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "$1");
}

/** 4. Vary heading levels — AI tends to use H2 for everything */
function varyHeadingLevels(text: string): string {
  let h2count = 0;
  return text.replace(/^## (.+)$/gm, (match, content) => {
    h2count++;
    // Every 3rd H2 → make it an H3 for natural hierarchy feel
    return h2count % 3 === 0 ? `### ${content}` : `## ${content}`;
  });
}

/** 5. Contractions normaliser — expand where missing, add contractions */
function fixContractions(text: string): string {
  const expansions: Record<string, string> = {
    "\\bdo not\\b": "don't",
    "\\bwill not\\b": "won't",
    "\\bcannot\\b": "can't",
    "\\bdoes not\\b": "doesn't",
    "\\bdid not\\b": "didn't",
    "\\bshould not\\b": "shouldn't",
    "\\bwould not\\b": "wouldn't",
    "\\bcould not\\b": "couldn't",
    "\\bis not\\b": "isn't",
    "\\bare not\\b": "aren't",
    "\\bwas not\\b": "wasn't",
    "\\bwere not\\b": "weren't",
    "\\bI am\\b": "I'm",
    "\\bI have\\b": "I've",
    "\\bI will\\b": "I'll",
    "\\bI would\\b": "I'd",
    "\\bYou are\\b": "You're",
    "\\bYou have\\b": "You've",
    "\\bYou will\\b": "You'll",
    "\\bWe are\\b": "We're",
    "\\bWe have\\b": "We've",
    "\\bWe will\\b": "We'll",
    "\\bThey are\\b": "They're",
    "\\bThey have\\b": "They've",
    "\\bIt is\\b": "It's",
    "\\bThat is\\b": "That's",
    "\\bThere is\\b": "There's",
    "\\bHere is\\b": "Here's",
    "\\bThere are\\b": "There are", // keep
  };
  let result = text;
  for (const [pattern, contraction] of Object.entries(expansions)) {
    result = result.replace(new RegExp(pattern, "g"), contraction);
  }
  return result;
}

/** 6. Passive voice softener — flag and rewrite common patterns */
function softenPassiveVoice(text: string): string {
  return text
    .replace(/\bIt can be seen that\b/gi, "You can see that")
    .replace(/\bIt has been shown that\b/gi, "Research shows that")
    .replace(/\bIt should be noted that\b/gi, "Worth noting:")
    .replace(/\bIt was found that\b/gi, "We found that")
    .replace(/\bIt is believed that\b/gi, "Many people think")
    .replace(/\bIt is widely known that\b/gi, "Most people know")
    .replace(/\bIt is often said that\b/gi, "People often say");
}

/** 7. Paragraph length randomiser — break up suspiciously uniform para lengths */
function randomiseParagraphLengths(text: string): string {
  const paras = text.split(/\n{2,}/);
  const result: string[] = [];
  for (let i = 0; i < paras.length; i++) {
    const para = paras[i];
    // Skip non-prose blocks
    if (
      para.startsWith("#") ||
      para.startsWith("-") ||
      para.startsWith("*") ||
      para.startsWith("|") ||
      para.startsWith("[") ||
      para.startsWith("```") ||
      para.trim().length < 60
    ) {
      result.push(para);
      continue;
    }
    const sentences = para.split(/(?<=[.?!])\s+/);
    // If para is very long (>5 sentences), split it
    if (sentences.length > 5 && Math.random() > 0.4) {
      const mid = Math.floor(sentences.length / 2);
      result.push(sentences.slice(0, mid).join(" "));
      result.push(sentences.slice(mid).join(" "));
    } else {
      result.push(para);
    }
  }
  return result.join("\n\n");
}

/** 8. Add rhetorical questions to improve engagement and reduce AI flatness */
function injectRhetoricalQuestions(text: string, keyword: string): string {
  const questions = [
    `Have you ever wondered why ${keyword} matters so much?`,
    `So what makes ${keyword} worth your time?`,
    `Here's something most people don't ask: is ${keyword} really that different?`,
    `Why does ${keyword} keep coming up in every conversation?`,
    `But is that enough when you're dealing with ${keyword}?`,
  ];
  const paras = text.split(/\n{2,}/);
  // Inject 1–2 rhetorical questions at strategic positions
  const positions = [Math.floor(paras.length * 0.3), Math.floor(paras.length * 0.65)];
  positions.forEach((pos, idx) => {
    if (paras[pos] && !paras[pos].startsWith("#")) {
      paras[pos] = questions[idx % questions.length] + "\n\n" + paras[pos];
    }
  });
  return paras.join("\n\n");
}

/** 9. Strip markdown code fences accidentally wrapping article */
function stripCodeFences(text: string): string {
  return text
    .replace(/^```(html|markdown|json|md)?\n?/i, "")
    .replace(/\n?```$/i, "")
    .trim();
}

/** 10. Fix list formatting — remove AI's "* **Title:** description" pattern */
function fixListFormatting(text: string): string {
  // Remove bold from list headings
  return text
    .replace(/^(\s*[-*+]\s+)\*\*([^*]+)\*\*:/gm, "$1$2 —")
    .replace(/^(\s*\d+\.\s+)\*\*([^*]+)\*\*:/gm, "$1$2 —");
}

/** 11. Remove repetitive sentence starters (AI loves starting with "The") */
function fixRepetitiveStarters(text: string): string {
  const starters: Record<string, string[]> = {
    "^The ": ["This ", "A ", "One ", "Your "],
    "^This is ": ["Here's ", "It's ", "That's "],
    "^You need to ": ["It helps to ", "Try to ", "Consider "],
    "^There are ": ["You'll find ", "A few ", "Several "],
  };
  const paras = text.split(/\n{2,}/);
  return paras
    .map((para) => {
      if (para.startsWith("#") || para.startsWith("-") || para.startsWith("*")) return para;
      let result = para;
      for (const [starter, alts] of Object.entries(starters)) {
        // Only fix if more than 2 consecutive same starter in para
        const sentences = result.split(/(?<=[.?!])\s+/);
        let count = 0;
        result = sentences
          .map((s) => {
            if (new RegExp(starter).test(s)) {
              count++;
              if (count > 2) {
                count = 0;
                return s.replace(new RegExp(starter), pickRandom(alts));
              }
            } else {
              count = 0;
            }
            return s;
          })
          .join(" ");
      }
      return result;
    })
    .join("\n\n");
}

/** 12. Transition sentence variety — replace common transition patterns */
function diversifyTransitions(text: string): string {
  const transitions: [RegExp, string[]][] = [
    [
      /^(Let's|Let us) (talk about|discuss|look at|explore)/gm,
      ["Here's the thing about", "Now, about", "Moving on to", "Next up:"],
    ],
    [
      /^(In this section|This section)/gm,
      ["Here", "Below", "Now let's cover", "Next"],
    ],
    [
      /^(As (mentioned|discussed) (above|earlier|before))/gm,
      ["Going back to what I said", "Remember", "As I pointed out", "Earlier I mentioned"],
    ],
  ];
  let result = text;
  for (const [pattern, alts] of transitions) {
    result = result.replace(pattern, () => pickRandom(alts));
  }
  return result;
}

// ─────────────────────────────────────────────
// MASTER HUMANIZATION PIPELINE
// ─────────────────────────────────────────────

function humanize(text: string, keyword: string): string {
  let out = text;
  out = stripCodeFences(out);
  out = removeBolding(out);
  out = fixListFormatting(out);
  out = replaceAIVocab(out);
  out = softenPassiveVoice(out);
  out = fixContractions(out);
  out = fixRepetitiveStarters(out);
  out = diversifyTransitions(out);
  out = varyHeadingLevels(out);
  out = randomiseParagraphLengths(out);
  out = injectBurstiness(out);
  out = injectRhetoricalQuestions(out, keyword);
  return out.trim();
}

// ─────────────────────────────────────────────
// MAIN GENERATOR
// ─────────────────────────────────────────────

export async function generateArticle(
  config: GenerateConfig,
  extractedContent: string = ""
): Promise<GeneratedArticle> {
  const { keyword, contentType, length, format, includeImages, structure } = config;
  const lengthConfig = lengthMap[length];

  const systemPrompt = `You are a seasoned human blogger and editor with 15+ years of experience writing for major publications. Your articles are known for their raw authenticity, relatable voice, and natural imperfections that make readers feel like they're talking to a real person—not reading a robot.

Your writing has HIGH burstiness: you mix very short punchy 3-word sentences with longer more complex multi-clause ones that breathe and flow naturally. Your vocabulary has HIGH perplexity: unpredictable word choices, specific anecdotes, unexpected angles.

You write in first-person. You use contractions everywhere. You start sentences with "And", "But", "Because" often. Your paragraphs vary wildly in length—some are one line, some are four. You never sound formal or robotic.`;

  const contentContext =
    extractedContent.length > 100
      ? `\n\nResearch reference (paraphrase only, do NOT copy):\n${extractedContent.slice(0, 3000)}`
      : "";

  const userPrompt = `Write a ~${lengthConfig.words}-word ${contentType} SEO article about "${keyword}".

Headings to cover:
${structure.headings
      .slice(0, 10)
      .map((h: string, i: number) => `${i + 1}. ${h}`)
      .join("\n")}

CRITICAL WRITING RULES:
- Write entirely in standard Markdown.
- First-person voice: "I", "we", "my". Contractions everywhere.
- Start sentences with conjunctions (And, But, Because) at least 5 times.
- Mix paragraph lengths: 1-sentence paragraphs mixed with 3-4 sentence ones.
- Use natural idioms and colloquialisms.
- Never use: Moreover, Furthermore, In conclusion, Tapestry, Delve, Beacon, Testament, Crucial, Vital, Navigating, Landscape, Realm, Embark, Unleash, Elevate, Revolutionize, Synergy, Seamlessly, Meticulous, Comprehensive, Paradigm, Groundbreaking, Transformative.
- Never bold list headings.
- Keyword "${keyword}" in the very first sentence.
- Keyword "${keyword}" appears ~${Math.ceil(lengthConfig.words / 100)} times naturally.
- Exact keyword in at least 2 subheadings.
- Table of Contents right after the intro.
- 2+ DoFollow external links to authority sources.
- 2+ internal link placeholders like [Internal Link: related topic].
- Reading level: Grade 6-8.
${includeImages ? `- Image placeholders with keyword "${keyword}" in at least one alt attribute.` : "- No images needed."}
- Do NOT write a "Conclusion" heading. End naturally and conversationally.

OUTPUT FORMAT — start your response with these exact metadata lines:
TITLE: [Title that starts with "${keyword}", has a number, has a power word]
ALT_TITLES: Title 1 | Title 2 | Title 3 | Title 4 | Title 5
META: [140-155 char meta description containing "${keyword}"]
KEYWORDS: ${keyword}, related keyword 1, related keyword 2, related keyword 3, related keyword 4

Then a blank line, then the article.
${contentContext}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      { role: "user", parts: [{ text: systemPrompt + "\n\n" + userPrompt }] },
    ],
    config: {
      temperature: 1.0, // Higher temperature = more unpredictable/human-like
      maxOutputTokens: 8192,
    },
  });

  const raw = response.text || "";

  // ── Parse metadata ──
  const titleMatch = raw.match(/TITLE:\s*(.+)/i);
  const altTitlesMatch = raw.match(/ALT_TITLES:\s*(.+)/i);
  const metaMatch = raw.match(/META:\s*(.+)/i);
  const keywordsMatch = raw.match(/KEYWORDS:\s*(.+)/i);

  const title = titleMatch ? titleMatch[1].trim() : keyword;
  const altTitles = altTitlesMatch
    ? altTitlesMatch[1]
      .split("|")
      .map((t) => t.trim())
      .filter(Boolean)
    : [];
  const metaDescription = metaMatch
    ? metaMatch[1].trim()
    : `Read our comprehensive guide about ${keyword}.`;
  const rankMathKeywords = keywordsMatch
    ? keywordsMatch[1]
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean)
    : [keyword];

  // ── Strip metadata from body ──
  let content = raw
    .replace(/TITLE:\s*.+\n?/i, "")
    .replace(/ALT_TITLES:\s*.+\n?/i, "")
    .replace(/META:\s*.+\n?/i, "")
    .replace(/KEYWORDS:\s*.+\n?/i, "")
    .trim();

  // ── Run full humanization pipeline ──
  content = humanize(content, keyword);

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