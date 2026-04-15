"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Zap,
  ChevronRight,
  Settings2,
  AlignLeft,
  Grid2X2,
  Image,
  Globe,
} from "lucide-react";
import Shell from "@/components/Shell";
import { useApp } from "@/context/AppContext";
import { ContentType, ContentLength, ContentFormat } from "@/types/article";

const contentTypes: ContentType[] = [
  "MOD APK",
  "App Review",
  "How-To Guide",
  "Comparison",
  "Listicle",
  "News",
  "General SEO",
];

const lengths: { value: ContentLength; label: string; words: string }[] = [
  { value: "short", label: "Short", words: "~600 words" },
  { value: "medium", label: "Medium", words: "~1,200 words" },
  { value: "long", label: "Long", words: "~2,500 words" },
  { value: "extra-long", label: "Extra Long", words: "~4,000 words" },
];

const formats: { value: ContentFormat; label: string; desc: string }[] = [
  { value: "wordpress", label: "WordPress Blocks", desc: "Gutenberg-ready" },
  { value: "html", label: "HTML", desc: "Clean HTML5" },
  { value: "markdown", label: "Markdown", desc: "GitHub flavored" },
  { value: "json", label: "JSON", desc: "Structured data" },
];

const exampleKeywords = [
  "Spotify MOD APK",
  "GBWhatsApp APK",
  "Netflix MOD APK Premium",
  "Minecraft PE Free Download",
  "How to install Kali Linux",
  "Best Android emulators 2025",
];

export default function HomePage() {
  const router = useRouter();
  const app = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!app.keyword.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: app.keyword }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Search failed");
      app.setSerpResults(data.results || []);
      app.setCurrentStep(2);
      router.push("/results");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell>
      <div className="fade-in-up" style={{ maxWidth: 760, margin: "0 auto" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div
            className="tag"
            style={{ display: "inline-flex", marginBottom: 20 }}
          >
            <Zap size={11} />
            AI-Powered SERP → Content Pipeline
          </div>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              marginBottom: 16,
            }}
          >
            Generate{" "}
            <span className="gradient-text">SEO-Optimized</span>
            <br />
            Content at Scale
          </h1>
          <p
            style={{
              color: "var(--color-text-muted)",
              fontSize: "1.05rem",
              maxWidth: 520,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Enter a keyword → Analyze top competitor pages with Jina Reader →
            Generate fully optimized articles in seconds.
          </p>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSearch}>
          <div
            className="glass"
            style={{ padding: "32px", marginBottom: 24 }}
          >
            {/* Keyword Input */}
            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: "var(--color-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                }}
              >
                <Search size={13} style={{ display: "inline", marginRight: 6 }} />
                Target Keyword
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="keyword-input"
                  className="input"
                  style={{ paddingLeft: 44, fontSize: "1.05rem", height: 52 }}
                  placeholder="e.g. Spotify MOD APK latest version"
                  value={app.keyword}
                  onChange={(e) => app.setKeyword(e.target.value)}
                  required
                />
                <Globe
                  size={18}
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--color-text-muted)",
                  }}
                />
              </div>
              {/* Quick examples */}
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                }}
              >
                {exampleKeywords.map((kw) => (
                  <button
                    type="button"
                    key={kw}
                    className="btn btn-ghost"
                    style={{
                      fontSize: "0.73rem",
                      padding: "4px 10px",
                      borderRadius: 20,
                      border: "1px solid var(--color-border)",
                    }}
                    onClick={() => app.setKeyword(kw)}
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Content Type */}
              <div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 8,
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    color: "var(--color-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  <Settings2 size={13} />
                  Content Type
                </label>
                <select
                  id="content-type"
                  className="input"
                  value={app.contentType}
                  onChange={(e) =>
                    app.setContentType(e.target.value as ContentType)
                  }
                >
                  {contentTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Format */}
              <div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 8,
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    color: "var(--color-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  <Grid2X2 size={13} />
                  Output Format
                </label>
                <select
                  id="output-format"
                  className="input"
                  value={app.format}
                  onChange={(e) =>
                    app.setFormat(e.target.value as ContentFormat)
                  }
                >
                  {formats.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label} — {f.desc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Length + Images */}
            <div style={{ marginTop: 20 }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 12,
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  color: "var(--color-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                }}
              >
                <AlignLeft size={13} />
                Article Length
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {lengths.map((l) => (
                  <button
                    type="button"
                    key={l.value}
                    id={`length-${l.value}`}
                    onClick={() => app.setLength(l.value)}
                    style={{
                      flex: 1,
                      padding: "12px 8px",
                      borderRadius: 10,
                      border: `1px solid ${app.length === l.value ? "var(--color-brand)" : "var(--color-border)"}`,
                      background:
                        app.length === l.value
                          ? "rgba(108, 99, 255, 0.15)"
                          : "var(--color-surface-3)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        color:
                          app.length === l.value
                            ? "var(--color-brand-light)"
                            : "var(--color-text)",
                      }}
                    >
                      {l.label}
                    </div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--color-text-muted)",
                        marginTop: 2,
                      }}
                    >
                      {l.words}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Images toggle */}
            <div
              style={{
                marginTop: 20,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                background: "var(--color-surface-3)",
                borderRadius: 10,
                border: "1px solid var(--color-border)",
                cursor: "pointer",
              }}
              onClick={() => app.setIncludeImages(!app.includeImages)}
            >
              <div
                style={{
                  width: 40,
                  height: 22,
                  borderRadius: 11,
                  background: app.includeImages
                    ? "var(--color-brand)"
                    : "var(--color-surface-4)",
                  position: "relative",
                  transition: "background 0.2s",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    width: 16,
                    height: 16,
                    top: 3,
                    left: app.includeImages ? 21 : 3,
                    borderRadius: "50%",
                    background: "white",
                    transition: "left 0.2s",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                  }}
                />
              </div>
              <Image size={16} color="var(--color-text-muted)" />
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                  Include Image Placeholders
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                  AI will suggest [IMAGE: alt text] where visuals help
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  marginTop: 16,
                  padding: "12px 16px",
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: 10,
                  color: "#ef4444",
                  fontSize: "0.875rem",
                }}
              >
                {error}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            id="search-btn"
            className="btn btn-primary pulse-glow"
            disabled={loading || !app.keyword.trim()}
            style={{ width: "100%", justifyContent: "center", height: 52, fontSize: "1rem" }}
          >
            {loading ? (
              <>
                <div className="spinner" />
                Searching SERP with Jina...
              </>
            ) : (
              <>
                <Search size={18} />
                Analyze SERP Results
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Feature Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginTop: 40,
          }}
        >
          {[
            {
              icon: "🔍",
              title: "SERP Analysis",
              desc: "Fetch top-ranking pages via Jina Search API",
            },
            {
              icon: "📄",
              title: "Content Extraction",
              desc: "Scrape competitor articles using Jina Reader",
            },
            {
              icon: "✍️",
              title: "AI Generation",
              desc: "Gemini 2.5 Flash writes SEO-optimized content",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="glass glass-hover"
              style={{ padding: "20px 18px", textAlign: "center" }}
            >
              <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>
                {card.icon}
              </div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 6 }}>
                {card.title}
              </div>
              <div
                style={{
                  fontSize: "0.78rem",
                  color: "var(--color-text-muted)",
                  lineHeight: 1.5,
                }}
              >
                {card.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
