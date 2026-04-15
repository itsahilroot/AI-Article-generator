"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  Check,
  Download,
  Loader2,
  ChevronRight,
  ExternalLink,
  ArrowLeft,
  BarChart2,
  AlertCircle,
} from "lucide-react";
import Shell from "@/components/Shell";
import { useApp } from "@/context/AppContext";

export default function ResultsPage() {
  const router = useRouter();
  const app = useApp();
  const [extracting, setExtracting] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);
  const [error, setError] = useState("");

  const allUrls = app.serpResults.map((r) => r.url);

  function toggleAll() {
    if (app.selectedUrls.length === allUrls.length) {
      app.setSelectedUrls([]);
    } else {
      app.setSelectedUrls(allUrls);
    }
  }

  async function handleExtractAndAnalyze() {
    if (app.selectedUrls.length === 0) {
      setError("Please select at least one URL");
      return;
    }
    setError("");
    setExtracting(true);
    setExtractProgress(10);

    try {
      // Step 1: Extract
      const extractRes = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: app.selectedUrls }),
      });
      setExtractProgress(50);
      const extractData = await extractRes.json();
      if (!extractData.success) throw new Error(extractData.error || "Extraction failed");

      app.setExtractedContent(
        extractData.articles.map(
          (a: { url: string; content: string }) => ({ url: a.url, content: a.content })
        )
      );
      setExtractProgress(70);

      // Step 2: Analyze
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articles: extractData.articles,
          keyword: app.keyword,
        }),
      });
      setExtractProgress(90);
      const analyzeData = await analyzeRes.json();
      if (!analyzeData.success) throw new Error(analyzeData.error || "Analysis failed");

      app.setAnalysis(analyzeData.analysis);
      app.setCurrentStep(3);
      setExtractProgress(100);

      setTimeout(() => router.push("/editor"), 300);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setExtracting(false);
    }
  }

  if (app.serpResults.length === 0) {
    return (
      <Shell>
        <div
          style={{ maxWidth: 600, margin: "80px auto", textAlign: "center" }}
        >
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔍</div>
          <h2 style={{ marginBottom: 12 }}>No SERP Results</h2>
          <p style={{ color: "var(--color-text-muted)", marginBottom: 24 }}>
            Go back and search for a keyword first.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => router.push("/")}
          >
            <ArrowLeft size={16} />
            Back to Search
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="fade-in-up" style={{ maxWidth: 900, margin: "0 auto" }}>
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
              onClick={() => router.push("/")}
              style={{ marginBottom: 8, padding: "6px 0" }}
            >
              <ArrowLeft size={15} />
              Back
            </button>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
              SERP Results
            </h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
              Keyword:{" "}
              <strong style={{ color: "var(--color-brand-light)" }}>
                {app.keyword}
              </strong>{" "}
              — {app.serpResults.length} results found
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div className="tag">
              <Check size={11} />
              {app.selectedUrls.length} selected
            </div>
            <button
              id="extract-btn"
              className="btn btn-primary"
              onClick={handleExtractAndAnalyze}
              disabled={extracting || app.selectedUrls.length === 0}
            >
              {extracting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Extracting... {extractProgress}%
                </>
              ) : (
                <>
                  <Download size={15} />
                  Extract & Analyze
                  <ChevronRight size={15} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {extracting && (
          <div className="progress-bar" style={{ marginBottom: 20 }}>
            <div
              className="progress-fill"
              style={{ width: `${extractProgress}%` }}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              marginBottom: 20,
              padding: "12px 16px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: 10,
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

        {/* Select All */}
        <div
          className="glass"
          style={{
            padding: "12px 20px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <button
            id="select-all-btn"
            className="btn btn-ghost"
            onClick={toggleAll}
            style={{ padding: "6px 12px", fontSize: "0.85rem" }}
          >
            <div
              className={`checkbox-custom ${app.selectedUrls.length === allUrls.length ? "checked" : ""}`}
            >
              {app.selectedUrls.length === allUrls.length && (
                <Check size={11} color="white" />
              )}
            </div>
            Select All ({allUrls.length})
          </button>
          <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
            <BarChart2
              size={13}
              style={{ display: "inline", marginRight: 4 }}
            />
            Select competitor pages to analyze and use as reference
          </div>
        </div>

        {/* Results List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {app.serpResults.map((result, i) => {
            const isSelected = app.selectedUrls.includes(result.url);
            return (
              <div
                key={result.url}
                id={`result-${i}`}
                className="glass glass-hover"
                style={{
                  padding: "16px 20px",
                  cursor: "pointer",
                  borderColor: isSelected
                    ? "var(--color-brand)"
                    : "var(--color-border)",
                  background: isSelected
                    ? "rgba(108, 99, 255, 0.08)"
                    : undefined,
                  transition: "all 0.2s",
                }}
                onClick={() => app.toggleUrl(result.url)}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                  }}
                >
                  {/* Checkbox */}
                  <div
                    className={`checkbox-custom ${isSelected ? "checked" : ""}`}
                    style={{ marginTop: 2 }}
                  >
                    {isSelected && <Check size={11} color="white" />}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          background: "var(--color-surface-4)",
                          borderRadius: 6,
                          padding: "1px 7px",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          color: "var(--color-text-muted)",
                        }}
                      >
                        #{result.rank || i + 1}
                      </span>
                      <Globe size={13} color="var(--color-text-muted)" />
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-text-muted)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: 300,
                        }}
                      >
                        {
                          (() => {
                            try { return new URL(result.url).hostname; } catch { return result.url; }
                          })()
                        }
                      </span>
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        marginBottom: 6,
                        color: isSelected
                          ? "var(--color-brand-light)"
                          : "var(--color-text)",
                      }}
                    >
                      {result.title || "Untitled"}
                    </div>
                    {result.description && (
                      <div
                        style={{
                          fontSize: "0.82rem",
                          color: "var(--color-text-muted)",
                          lineHeight: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {result.description}
                      </div>
                    )}
                  </div>

                  {/* External link */}
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      color: "var(--color-text-muted)",
                      padding: 6,
                      borderRadius: 6,
                      transition: "color 0.2s",
                    }}
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        {app.selectedUrls.length > 0 && (
          <div
            style={{
              marginTop: 24,
              padding: "16px 20px",
              background: "rgba(108, 99, 255, 0.1)",
              border: "1px solid var(--color-brand)",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>
                {app.selectedUrls.length} page
                {app.selectedUrls.length !== 1 ? "s" : ""} selected
              </div>
              <div
                style={{ fontSize: "0.82rem", color: "var(--color-text-muted)" }}
              >
                Jina Reader will extract and analyze competitor content
              </div>
            </div>
            <button
              className="btn btn-primary"
              onClick={handleExtractAndAnalyze}
              disabled={extracting}
            >
              {extracting ? (
                <>
                  <Loader2 size={15} />
                  Processing...
                </>
              ) : (
                <>
                  <Download size={15} />
                  Extract & Generate
                  <ChevronRight size={15} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </Shell>
  );
}
