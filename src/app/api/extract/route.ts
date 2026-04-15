import { NextResponse } from "next/server";
import { jinaRead } from "@/lib/jinaReader";
import { ExtractedArticle } from "@/types/serp";

export async function POST(req: Request) {
  try {
    const { urls } = await req.json();

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { success: false, error: "URLs array is required" },
        { status: 400 }
      );
    }

    const articles: ExtractedArticle[] = [];

    for (const url of urls.slice(0, 8)) {
      try {
        const content = await jinaRead(url);
        const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

        // Try to extract title from content
        const titleMatch =
          content.match(/^#\s+(.+)/m) ||
          content.match(/Title:\s*(.+)/i);
        const title = titleMatch ? titleMatch[1].trim() : undefined;

        articles.push({
          url,
          title,
          content: content.slice(0, 15000), // limit per article
          wordCount,
        });
      } catch (err) {
        console.error(`Failed to extract ${url}:`, err);
        articles.push({
          url,
          content: "",
          wordCount: 0,
          title: "Failed to extract",
        });
      }
    }

    return NextResponse.json({ success: true, articles });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Extraction failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
