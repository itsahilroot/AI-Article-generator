import { NextResponse } from "next/server";
import { jinaSearch } from "@/lib/jinaSearch";
import { SerpResult } from "@/types/serp";
import axios from "axios";
import * as cheerio from "cheerio";

// Fallback search using DuckDuckGo HTML parser
async function fallbackSearch(keyword: string): Promise<SerpResult[]> {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(keyword)}`;
  const res = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    },
    timeout: 15000,
  });

  const $ = cheerio.load(res.data);
  const results: SerpResult[] = [];

  $(".result__body").each((i, el) => {
    const titleEl = $(el).find(".result__title .result__a");
    const title = titleEl.text().trim();
    // DuckDuckGo uses a proxy URL for result__a href, so we get the direct URL from result__url
    const resultUrlText = $(el).find(".result__url").text().trim();
    
    // Attempt to reconstruct real URL
    let url = titleEl.attr("href") || "";
    if (url.startsWith("//duckduckgo.com/l/?uddg=")) {
      try {
        const urlParams = new URLSearchParams(url.split("?")[1]);
        url = decodeURIComponent(urlParams.get("uddg") || "");
      } catch {
        // Fallback
        url = `https://${resultUrlText.trim()}`;
      }
    } else if (url && !url.startsWith("http")) {
      url = `https://${resultUrlText.trim()}`;
    }

    const description = $(el).find(".result__snippet").text().trim();

    if (title && url && !url.includes("duckduckgo.com")) {
      results.push({
        title,
        url,
        description,
        rank: i + 1,
      });
    }
  });

  return results.filter(r => r.url.startsWith("http")).slice(0, 15);
}

export async function POST(req: Request) {
  try {
    const { keyword } = await req.json();

    if (!keyword || typeof keyword !== "string") {
      return NextResponse.json(
        { success: false, error: "Keyword is required" },
        { status: 400 }
      );
    }

    let results: SerpResult[] = [];
    let usedFallback = false;

    // Try Jina Search if API key exists
    if (process.env.JINA_API_KEY) {
      try {
        const raw = await jinaSearch(keyword.trim());
        
        if (typeof raw === "object" && raw !== null) {
          const data = raw as Record<string, unknown>;
          const items = (
            Array.isArray(data) ? data :
            Array.isArray(data.data) ? data.data :
            Array.isArray(data.results) ? data.results :
            Array.isArray(data.items) ? data.items :
            []
          ) as Array<Record<string, unknown>>;
    
          items.forEach((item, i) => {
            const url = (item.url as string) || (item.link as string) || "";
            if (!url) return;
            results.push({
              title:
                (item.title as string) ||
                (item.name as string) ||
                `Result ${i + 1}`,
              url,
              description:
                (item.description as string) ||
                (item.snippet as string) ||
                ((item.content as string) || "").slice(0, 300),
              rank: i + 1,
            });
          });
        }
      } catch (err: unknown) {
        console.warn("Jina search failed, falling back to free search:", err instanceof Error ? err.message : "Unknown error");
        usedFallback = true;
      }
    } else {
      // No key, automatically use fallback
      usedFallback = true;
    }

    // Use Fallback Search if needed
    if (usedFallback || results.length === 0) {
      console.log(`Using free fallback search (DuckDuckGo HTML) for: ${keyword}`);
      results = await fallbackSearch(keyword.trim());
    }

    if (results.length === 0) {
      return NextResponse.json(
        { success: false, error: "No relevant SERP results found. Try a different keyword." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      keyword,
      results: results.slice(0, 12),
    });
  } catch (error: unknown) {
    console.error("Search API error:", error);
    const message = error instanceof Error ? error.message : "Search failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
