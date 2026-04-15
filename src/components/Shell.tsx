"use client";
import React from "react";
import { useApp } from "@/context/AppContext";
import { Zap, Search, Globe, FileText, Check, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const steps = [
  { label: "Keyword", href: "/", icon: Search, step: 1 },
  { label: "SERP", href: "/results", icon: Globe, step: 2 },
  { label: "Editor", href: "/editor", icon: FileText, step: 3 },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const { currentStep } = useApp();
  const pathname = usePathname();
  const [theme, setTheme] = React.useState<"dark" | "light">("light");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      setTheme("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      setTheme("light");
      document.documentElement.removeAttribute("data-theme");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  };

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      {/* Background orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: "1px solid var(--color-border)",
          background: "var(--glass-header)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div
              className="gradient-bg"
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <Zap size={18} color="var(--color-surface)" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1rem", letterSpacing: "-0.02em" }}>
                <span className="gradient-text">Jina AI Writer</span>
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginTop: -2 }}>
                SERP → Scrape → Generate
              </div>
            </div>
          </Link>

          {/* Step Indicator */}
          <div className="step-indicator" style={{ gap: 0 }}>
            {steps.map((s, i) => {
              const isDone = currentStep > s.step;
              const isActive = currentStep === s.step || pathname === s.href;
              const Icon = s.icon;
              return (
                <div key={s.href} style={{ display: "flex", alignItems: "center" }}>
                  <Link href={s.href} style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div className={`step-dot ${isDone ? "done" : isActive ? "active" : ""}`}>
                      {isDone ? <Check size={14} /> : <Icon size={13} />}
                    </div>
                    <span style={{ fontSize: "0.65rem", color: isActive ? "var(--color-brand-light)" : "var(--color-text-muted)", fontWeight: 600 }}>
                      {s.label}
                    </span>
                  </Link>
                  {i < steps.length - 1 && (
                    <div className={`step-line ${isDone ? "done" : ""}`} style={{ width: 48 }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Badge & Theme Toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="tag" style={{ display: "none" }}>
              {/* Desktop only tag maybe, or just keep it */}
            </div>
            <div className="tag">
              <Zap size={11} />
              Powered by Jina AI
            </div>
            
            {mounted && (
              <button
                onClick={toggleTheme}
                className="btn btn-ghost"
                style={{
                  padding: "8px",
                  borderRadius: "50%",
                  color: "var(--color-text-muted)"
                }}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        {children}
      </main>
    </div>
  );
}
