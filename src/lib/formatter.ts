import { ContentFormat } from "@/types/article";
import { marked } from "marked";

/**
 * Convert plain markdown text to WordPress Gutenberg blocks
 */
function markdownToWordPress(markdown: string): string {
  const lines = markdown.split("\n");
  const blocks: string[] = [];
  let inList = false;
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push(
        `<!-- wp:list -->\n<ul class="wp-block-list">${listItems.map((li) => `<li>${li}</li>`).join("")}</ul>\n<!-- /wp:list -->`
      );
      listItems = [];
      inList = false;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }

    // H1
    if (/^#\s+/.test(trimmed)) {
      flushList();
      const text = trimmed.replace(/^#\s+/, "");
      blocks.push(
        `<!-- wp:heading {"level":1} -->\n<h1 class="wp-block-heading">${text}</h1>\n<!-- /wp:heading -->`
      );
    }
    // H2
    else if (/^##\s+/.test(trimmed)) {
      flushList();
      const text = trimmed.replace(/^##\s+/, "");
      blocks.push(
        `<!-- wp:heading -->\n<h2 class="wp-block-heading">${text}</h2>\n<!-- /wp:heading -->`
      );
    }
    // H3
    else if (/^###\s+/.test(trimmed)) {
      flushList();
      const text = trimmed.replace(/^###\s+/, "");
      blocks.push(
        `<!-- wp:heading {"level":3} -->\n<h3 class="wp-block-heading">${text}</h3>\n<!-- /wp:heading -->`
      );
    }
    // List item
    else if (/^[-*]\s+/.test(trimmed)) {
      inList = true;
      listItems.push(trimmed.replace(/^[-*]\s+/, ""));
    }
    // Image placeholder 
    else if (/^\[IMAGE:\s*(.+?)\]/i.test(trimmed)) {
      flushList();
      const alt = trimmed.match(/^\[IMAGE:\s*(.+?)\]/i)?.[1] || "Image Placeholder";
      blocks.push(
        `<!-- wp:image {"align":"center"} -->\n<figure class="wp-block-image aligncenter"><img src="https://via.placeholder.com/800x400?text=${encodeURIComponent(alt)}" alt="${alt}"/></figure>\n<!-- /wp:image -->`
      );
    }
    // Markdown image
    else if (/^!\[(.*?)\]\((.*?)\)/.test(trimmed)) {
      flushList();
      const match = trimmed.match(/^!\[(.*?)\]\((.*?)\)/);
      const alt = match?.[1] || "Image";
      const src = match?.[2] || "https://via.placeholder.com/800x400";
      blocks.push(
        `<!-- wp:image {"align":"center"} -->\n<figure class="wp-block-image aligncenter"><img src="${src}" alt="${alt}"/></figure>\n<!-- /wp:image -->`
      );
    }
    // Ordered list item
    else if (/^\d+\.\s+/.test(trimmed)) {
      // treat as paragraph for now
      flushList();
      const text = trimmed.replace(/^\d+\.\s+/, "");
      blocks.push(`<!-- wp:paragraph -->\n<p>${text}</p>\n<!-- /wp:paragraph -->`);
    }
    // Paragraph
    else {
      flushList();
      // Bold
      const html = trimmed
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/`(.+?)`/g, "<code>$1</code>");
      blocks.push(
        `<!-- wp:paragraph -->\n<p>${html}</p>\n<!-- /wp:paragraph -->`
      );
    }
  }
  flushList();
  return blocks.join("\n\n");
}

/**
 * Convert plain markdown to clean HTML5
 */
function markdownToHtml(markdown: string): string {
  return marked.parse(markdown) as string;
}

/**
 * Format article content into the desired output format
 */
export function formatArticle(content: string, format: ContentFormat): string {
  // If the content was already generated in the target format, return as-is
  // (detect by checking for wp: comments or html tags)
  const isAlreadyWordPress = content.includes("<!-- wp:");
  const isAlreadyHtml =
    content.includes("<h1") ||
    content.includes("<h2") ||
    content.includes("<p>");
  const isAlreadyJson = content.trim().startsWith("{");

  switch (format) {
    case "wordpress":
      if (isAlreadyWordPress) return content;
      if (isAlreadyHtml) return content; // passthrough
      return markdownToWordPress(content);

    case "html":
      if (isAlreadyHtml && !isAlreadyWordPress) return content;
      if (isAlreadyWordPress) {
        // Strip wp: block comments
        return content
          .replace(/<!-- wp:[^\-]+-->/g, "")
          .replace(/<!-- \/wp:[^\-]+-->/g, "")
          .trim();
      }
      return markdownToHtml(content);

    case "markdown":
      if (isAlreadyWordPress) {
        // Convert wp blocks to markdown
        let md = content;
        md = md.replace(/<!-- wp:heading \{"level":1\} -->\s*<h1[^>]*>([\s\S]+?)<\/h1>\s*<!-- \/wp:heading -->/g, "# $1\n");
        md = md.replace(/<!-- wp:heading -->\s*<h2[^>]*>([\s\S]+?)<\/h2>\s*<!-- \/wp:heading -->/g, "## $1\n");
        md = md.replace(/<!-- wp:heading \{"level":3\} -->\s*<h3[^>]*>([\s\S]+?)<\/h3>\s*<!-- \/wp:heading -->/g, "### $1\n");
        md = md.replace(/<!-- wp:paragraph -->\s*<p>([\s\S]+?)<\/p>\s*<!-- \/wp:paragraph -->/g, "$1\n\n");
        md = md.replace(/<!-- [^>]+-->/g, "").trim();
        return md;
      }
      if (!isAlreadyHtml && !isAlreadyWordPress) return content; // already markdown
      return content;

    case "json":
      if (isAlreadyJson) return content;
      // Build a JSON object from markdown content
      try {
        const sections: { heading: string; level: number; content: string }[] = [];
        const lines = content.split("\n");
        let currentSection: { heading: string; level: number; content: string } | null = null;

        for (const line of lines) {
          const h2 = line.match(/^##\s+(.+)/);
          const h3 = line.match(/^###\s+(.+)/);
          if (h2) {
            if (currentSection) sections.push(currentSection);
            currentSection = { heading: h2[1], level: 2, content: "" };
          } else if (h3) {
            if (currentSection) sections.push(currentSection);
            currentSection = { heading: h3[1], level: 3, content: "" };
          } else if (currentSection && line.trim()) {
            currentSection.content += " " + line.trim();
          }
        }
        if (currentSection) sections.push(currentSection);

        const jsonObj = {
          sections: sections.map((s) => ({
            heading: s.heading,
            level: s.level,
            content: s.content.trim(),
          })),
        };
        return JSON.stringify(jsonObj, null, 2);
      } catch {
        return content;
      }

    default:
      return content;
  }
}
