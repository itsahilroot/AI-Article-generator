import { NextResponse } from "next/server";
import { aggregateAnalysis } from "@/lib/analyzer";
import { ExtractedArticle } from "@/types/serp";

export async function POST(req: Request) {
  try {
    const { articles, keyword } = await req.json() as {
      articles: ExtractedArticle[];
      keyword: string;
    };

    if (!Array.isArray(articles) || articles.length === 0) {
      return NextResponse.json(
        { success: false, error: "Articles array is required" },
        { status: 400 }
      );
    }

    const validArticles = articles.filter(
      (a) => a.content && a.content.length > 50
    );

    const analysis = aggregateAnalysis(
      validArticles.map((a) => ({ content: a.content })),
      keyword || "content"
    );

    return NextResponse.json({ success: true, analysis });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
