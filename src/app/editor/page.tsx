"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Wand2,
  Copy,
  Download,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Eye,
  Code2,
  FileJson,
  Edit3,
  Trash2,
  RefreshCw,
  Hash,
  AlignLeft,
  Tag,
  AlertCircle,
  Loader2,
  BarChart2,
} from "lucide-react";
import Shell from "@/components/Shell";
import { useApp } from "@/context/AppContext";
import { ContentFormat } from "@/types/article";
import { marked } from "marked";

const formatLabels: Record<ContentFormat, string> = {
  wordpress: "WordPress Blocks",
  html: "HTML",
  markdown: "Markdown",
  json: "JSON",
};

const formatIcons: Record<ContentFormat, React.ReactNode> = {
  wordpress: <span style={{ fontSize: "1rem" }}>📦</span>,
  html: <Code2 size={15} />,
  markdown: <Hash size={15} />,
  json: <FileJson size={15} />,
};

export default function EditorPage() {
  const router = useRouter();
  const app = useApp();

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"raw" | "preview">("raw");
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [customHeadings, setCustomHeadings] = useState<string[]>([]);
  const [initializedHeadings, setInitializedHeadings] = useState(false);
  const [editingHeadings, setEditingHeadings] = useState(false);
  const [headingInput, setHeadingInput] = useState("");

  useEffect(() => {
    if (app.analysis && !initializedHeadings) {
      setCustomHeadings(
        app.analysis.suggestedStructure?.length 
          ? app.analysis.suggestedStructure 
          : app.analysis.headings || []
      );
      setInitializedHeadings(true);
    }
  }, [app.analysis, initializedHeadings]);

  const effectiveHeadings = customHeadings;

  async function handleGenerate() {
    setGenerating(true);
    setError("");

    try {
      const combinedContent = app.extractedContent
        .map((a) => a.content)
        .join("\n\n---\n\n")
        .slice(0, 8000);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: {
            keyword: app.keyword,
            contentType: app.contentType,
            length: app.length,
            format: app.format,
            includeImages: app.includeImages,
            structure: {
              headings: effectiveHeadings,
              wordCount: app.analysis?.avgWordCount || 1500,
            },
          },
          extractedContent: combinedContent,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Generation failed");
      app.setGeneratedArticle(data.article);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  const handleCopy = useCallback(async () => {
    if (!app.generatedArticle?.content) return;
    await navigator.clipboard.writeText(app.generatedArticle.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [app.generatedArticle]);

  function handleDownload() {
    if (!app.generatedArticle?.content) return;
    const extMap: Record<ContentFormat, string> = {
      wordpress: "html",
      html: "html",
      markdown: "md",
      json: "json",
    };
    const ext = extMap[app.format];
    const blob = new Blob([app.generatedArticle.content], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${app.keyword.replace(/\s+/g, "-").toLowerCase()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function addHeading() {
    if (!headingInput.trim()) return;
    setCustomHeadings((prev) => [...prev, headingInput.trim()]);
    setHeadingInput("");
  }

  function removeHeading(idx: number) {
    setCustomHeadings((prev) => prev.filter((_, i) => i !== idx));
  }

  const isReady = app.keyword && (app.analysis || true);

  return (
    <Shell>
      <div className="fade-in-up" style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 28,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <button
              className="btn btn-ghost"
              onClick={() => router.push("/results")}
              style={{ marginBottom: 8, padding: "6px 0" }}
            >
              <ArrowLeft size={15} />
              Back to SERP
            </button>
            <h1
              style={{
                fontSize: "1.6rem",
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              Article Editor
            </h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
              Keyword:{" "}
              <strong style={{ color: "var(--color-brand-light)" }}>
                {app.keyword}
              </strong>
              {app.generatedArticle &&
                ` · ${app.generatedArticle.wordCount.toLocaleString()} words`}
            </p>
          </div>

          {app.generatedArticle && (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                id="copy-btn"
                className="btn btn-secondary"
                onClick={handleCopy}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                id="download-btn"
                className="btn btn-secondary"
                onClick={handleDownload}
              >
                <Download size={15} />
                Download
              </button>
              <button
                id="regenerate-btn"
                className="btn btn-primary"
                onClick={handleGenerate}
                disabled={generating}
              >
                <RefreshCw size={15} />
                Regenerate
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-5">
          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Analysis */}
            {app.analysis && (
              <div className="glass" style={{ padding: "20px" }}>
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-text)",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    marginBottom: showAnalysis ? 16 : 0,
                  }}
                  onClick={() => setShowAnalysis(!showAnalysis)}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <BarChart2 size={16} />
                    Competitor Analysis
                  </span>
                  {showAnalysis ? (
                    <ChevronUp size={16} color="var(--color-text-muted)" />
                  ) : (
                    <ChevronDown size={16} color="var(--color-text-muted)" />
                  )}
                </button>
                {showAnalysis && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* Stats */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 10,
                      }}
                    >
                      {[
                        {
                          label: "Avg Words",
                          value: app.analysis.avgWordCount.toLocaleString(),
                          icon: <AlignLeft size={13} />,
                        },
                        {
                          label: "Headings",
                          value: app.analysis.headings.length,
                          icon: <Hash size={13} />,
                        },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          style={{
                            background: "var(--color-surface-3)",
                            borderRadius: 8,
                            padding: "10px 12px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                              color: "var(--color-text-muted)",
                              fontSize: "0.72rem",
                              marginBottom: 4,
                            }}
                          >
                            {stat.icon}
                            {stat.label}
                          </div>
                          <div
                            style={{
                              fontWeight: 800,
                              fontSize: "1.1rem",
                              color: "var(--color-brand-light)",
                            }}
                          >
                            {stat.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Keywords */}
                    {app.analysis.keywords.length > 0 && (
                      <div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: "var(--color-text-muted)",
                            textTransform: "uppercase",
                            letterSpacing: "0.07em",
                            marginBottom: 8,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Tag size={12} />
                          Top Keywords
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                          {app.analysis.keywords.slice(0, 12).map((kw) => (
                            <span key={kw} className="tag" style={{ fontSize: "0.7rem" }}>
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Article Structure */}
            <div className="glass" style={{ padding: "20px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Hash size={15} color="var(--color-brand-light)" />
                  Article Structure
                </span>
                <button
                  className="btn btn-ghost"
                  style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                  onClick={() => setEditingHeadings(!editingHeadings)}
                >
                  <Edit3 size={12} />
                  {editingHeadings ? "Done" : "Edit"}
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {effectiveHeadings.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      background: "var(--color-surface-3)",
                      borderRadius: 8,
                      fontSize: "0.82rem",
                    }}
                  >
                    <span
                      style={{
                        color: "var(--color-brand)",
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        width: 20,
                        textAlign: "center",
                        flexShrink: 0,
                      }}
                    >
                      H2
                    </span>
                    <span style={{ flex: 1, lineHeight: 1.4 }}>{h}</span>
                    {editingHeadings && (
                      <button
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--color-text-muted)",
                          padding: 2,
                        }}
                        onClick={() => removeHeading(i)}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {editingHeadings && (
                <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
                  <input
                    className="input"
                    style={{ fontSize: "0.82rem", padding: "7px 10px" }}
                    placeholder="Add heading..."
                    value={headingInput}
                    onChange={(e) => setHeadingInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addHeading()}
                  />
                  <button
                    className="btn btn-secondary"
                    style={{ padding: "7px 12px", flexShrink: 0 }}
                    onClick={addHeading}
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Config summary */}
            <div className="glass" style={{ padding: "18px" }}>
              <div
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "var(--color-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: 12,
                }}
              >
                Generation Config
              </div>
              {[
                { label: "Type", value: app.contentType },
                { label: "Length", value: app.length },
                { label: "Format", value: formatLabels[app.format] },
                { label: "Images", value: app.includeImages ? "Yes" : "No" },
                { label: "URLs scraped", value: app.extractedContent.length },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    fontSize: "0.83rem",
                  }}
                >
                  <span style={{ color: "var(--color-text-muted)" }}>
                    {item.label}
                  </span>
                  <span style={{ fontWeight: 600 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Main Editor */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Format selector + view toggle */}
            <div
              className="glass"
              style={{
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              {/* Format tabs */}
              <div style={{ display: "flex", gap: 6 }}>
                {(
                  ["wordpress", "html", "markdown", "json"] as ContentFormat[]
                ).map((fmt) => (
                  <button
                    key={fmt}
                    id={`format-${fmt}`}
                    className="btn btn-ghost"
                    style={{
                      padding: "6px 12px",
                      fontSize: "0.8rem",
                      borderRadius: 8,
                      border: `1px solid ${app.format === fmt ? "var(--color-brand)" : "var(--color-border)"}`,
                      background:
                        app.format === fmt
                          ? "rgba(108, 99, 255, 0.15)"
                          : "transparent",
                      color:
                        app.format === fmt
                          ? "var(--color-brand-light)"
                          : "var(--color-text-muted)",
                    }}
                    onClick={() => app.setFormat(fmt)}
                  >
                    {formatIcons[fmt]}
                    {formatLabels[fmt]}
                  </button>
                ))}
              </div>

              {/* View toggle */}
              {app.generatedArticle && (
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    background: "var(--color-surface-3)",
                    borderRadius: 8,
                    padding: 3,
                  }}
                >
                  {(["raw", "preview"] as const).map((mode) => (
                    <button
                      key={mode}
                      id={`view-${mode}`}
                      className="btn btn-ghost"
                      style={{
                        padding: "5px 12px",
                        fontSize: "0.78rem",
                        borderRadius: 6,
                        background:
                          viewMode === mode
                            ? "var(--color-surface-4)"
                            : "transparent",
                        color:
                          viewMode === mode
                            ? "var(--color-text)"
                            : "var(--color-text-muted)",
                      }}
                      onClick={() => setViewMode(mode)}
                    >
                      {mode === "raw" ? <Code2 size={13} /> : <Eye size={13} />}
                      {mode === "raw" ? "Raw" : "Preview"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  padding: "14px 18px",
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: 12,
                  color: "#ef4444",
                  fontSize: "0.875rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Content area */}
            {!app.generatedArticle ? (
              <div
                className="glass"
                style={{
                  minHeight: 500,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 20,
                  textAlign: "center",
                }}
              >
                {generating ? (
                  <>
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        background:
                          "linear-gradient(135deg, rgba(108,99,255,0.2), rgba(147,51,234,0.2))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid var(--color-brand)",
                      }}
                      className="pulse-glow"
                    >
                      <Loader2
                        size={28}
                        color="var(--color-brand-light)"
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                    </div>
                    <div>
                      <div
                        style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 8 }}
                      >
                        Generating your article...
                      </div>
                      <div
                        style={{
                          color: "var(--color-text-muted)",
                          fontSize: "0.88rem",
                        }}
                      >
                        Gemini is crafting an SEO-optimized article based on
                        competitor research
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: "3rem" }}>✍️</div>
                    <div>
                      <div
                        style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: 8 }}
                      >
                        Ready to Generate
                      </div>
                      <p
                        style={{
                          color: "var(--color-text-muted)",
                          maxWidth: 380,
                          lineHeight: 1.6,
                          fontSize: "0.9rem",
                          marginBottom: 24,
                        }}
                      >
                        Click{" "}
                        <strong style={{ color: "var(--color-brand-light)" }}>
                          Generate Article
                        </strong>{" "}
                        to create a{" "}
                        {app.length} SEO article about{" "}
                        <strong>{app.keyword}</strong> in{" "}
                        {formatLabels[app.format]} format.
                      </p>
                      <button
                        id="generate-btn"
                        className="btn btn-primary pulse-glow"
                        onClick={handleGenerate}
                        disabled={!isReady || generating}
                        style={{ fontSize: "1rem", padding: "12px 28px" }}
                      >
                        <Wand2 size={18} />
                        Generate Article
                      </button>
                      {!process.env.NEXT_PUBLIC_HAS_GEMINI_KEY && (
                        <div
                          style={{
                            marginTop: 16,
                            padding: "10px 14px",
                            background: "rgba(245, 158, 11, 0.1)",
                            border: "1px solid rgba(245, 158, 11, 0.3)",
                            borderRadius: 8,
                            fontSize: "0.78rem",
                            color: "#f59e0b",
                          }}
                        >
                          ⚠️ Add GEMINI_API_KEY to .env.local to enable generation
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                {/* Meta & Keyword info bars */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                  {app.generatedArticle.metaDescription && (
                    <div
                      style={{
                        padding: "12px 16px",
                        background: "rgba(34, 197, 94, 0.08)",
                        border: "1px solid rgba(34, 197, 94, 0.2)",
                        borderRadius: 10,
                        fontSize: "0.82rem",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          color: "var(--color-success)",
                          marginRight: 8,
                        }}
                      >
                        META DESC:
                      </span>
                      {app.generatedArticle.metaDescription}
                    </div>
                  )}

                  {/* Rank Math Keywords */}
                  {app.generatedArticle.rankMathKeywords && app.generatedArticle.rankMathKeywords.length > 0 && (
                    <div
                      style={{
                        padding: "12px 16px",
                        background: "rgba(108, 99, 255, 0.08)",
                        border: "1px solid rgba(108, 99, 255, 0.2)",
                        borderRadius: 10,
                        fontSize: "0.82rem",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          color: "var(--color-brand-light)",
                          marginRight: 8,
                        }}
                      >
                        TARGET KEYWORDS (For Rank Math):
                      </span>
                      {app.generatedArticle.rankMathKeywords.join(", ")}
                    </div>
                  )}
                  
                  {/* Alternative Titles */}
                  {app.generatedArticle.altTitles && app.generatedArticle.altTitles.length > 0 && (
                    <div
                      style={{
                        padding: "12px 16px",
                        background: "rgba(147, 51, 234, 0.08)",
                        border: "1px solid rgba(147, 51, 234, 0.2)",
                        borderRadius: 10,
                        fontSize: "0.82rem",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          color: "#c084fc",
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        ALTERNATIVE TITLES (Choose the best CTR):
                      </span>
                      <ul style={{ margin: 0, paddingLeft: 20, color: "var(--color-text-muted)" }}>
                        {app.generatedArticle.altTitles.map((t, idx) => (
                          <li key={idx} style={{ marginBottom: 4 }}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Article content */}
                {viewMode === "raw" ? (
                  <div className="glass" style={{ padding: 0, overflow: "hidden" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--color-text-muted)",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Code2 size={13} />
                        {formatLabels[app.format]} Output ·{" "}
                        {app.generatedArticle.wordCount.toLocaleString()} words
                      </span>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                        onClick={handleCopy}
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? "Copied!" : "Copy all"}
                      </button>
                    </div>
                    <textarea
                      id="article-output"
                      readOnly
                      value={app.generatedArticle.content}
                      style={{
                        width: "100%",
                        minHeight: 560,
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        padding: "16px",
                        color: "var(--color-text)",
                        fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                        fontSize: "0.82rem",
                        lineHeight: 1.7,
                        resize: "vertical",
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="glass"
                    style={{ padding: "28px 32px", minHeight: 560 }}
                  >
                    <div
                      id="article-preview"
                      style={{ lineHeight: 1.8, maxWidth: "none" }}
                      dangerouslySetInnerHTML={{
                        __html: renderPreview(
                          app.generatedArticle.content,
                          app.format
                        ),
                      }}
                    />
                  </div>
                )}

                {/* Action bar */}
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    justifyContent: "flex-end",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    className="btn btn-secondary"
                    onClick={handleCopy}
                  >
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                    Copy Content
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={handleDownload}
                  >
                    <Download size={15} />
                    Download File
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleGenerate}
                    disabled={generating}
                  >
                    {generating ? (
                      <Loader2 size={15} />
                    ) : (
                      <RefreshCw size={15} />
                    )}
                    Regenerate
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}

// Simple icon component
function BarChart2Icon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function renderPreview(content: string, format: ContentFormat): string {
  if (format === "json") {
    return `<pre style="font-size:0.82rem;line-height:1.6;white-space:pre-wrap;word-break:break-word;">${escHtml(content)}</pre>`;
  }

  if (format === "wordpress") {
    // Strip wp: comments for preview
    return content
      .replace(/<!-- wp:[^\-]*-->/g, "")
      .replace(/<!-- \/wp:[^\-]*-->/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  if (format === "markdown") {
    // Safely render markdown using marked to avoid regex glitches
    try {
      return marked.parse(content) as string;
    } catch {
      return content;
    }
  }

  return content;
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
