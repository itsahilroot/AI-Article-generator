import { NextResponse } from "next/server";
import { generateArticle } from "@/lib/generator";
import { formatArticle } from "@/lib/formatter";
import { GenerateConfig } from "@/types/article";

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Gemini API key not configured. Please set GEMINI_API_KEY in your .env.local file.",
        },
        { status: 500 }
      );
    }

    const { config, extractedContent } = await req.json() as {
      config: GenerateConfig;
      extractedContent?: string;
    };

    if (!config?.keyword) {
      return NextResponse.json(
        { success: false, error: "Config with keyword is required" },
        { status: 400 }
      );
    }

    // Generate the article
    const article = await generateArticle(config, extractedContent || "");

    // Apply format conversion if needed
    const formattedContent = formatArticle(article.content, config.format);

    return NextResponse.json({
      success: true,
      article: {
        ...article,
        content: formattedContent,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
