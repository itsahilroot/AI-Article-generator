"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { SerpResult, AnalysisResult } from "@/types/serp";
import {
  ContentType,
  ContentLength,
  ContentFormat,
  GeneratedArticle,
} from "@/types/article";

interface AppState {
  // Step 1: keyword config
  keyword: string;
  contentType: ContentType;
  length: ContentLength;
  format: ContentFormat;
  includeImages: boolean;

  // Step 2: SERP results
  serpResults: SerpResult[];
  selectedUrls: string[];

  // Step 3: Extracted content
  extractedContent: { url: string; content: string }[];

  // Step 4: Analysis
  analysis: AnalysisResult | null;

  // Step 5: Generated article
  generatedArticle: GeneratedArticle | null;

  // Workflow step
  currentStep: number;
}

interface AppActions {
  setKeyword: (v: string) => void;
  setContentType: (v: ContentType) => void;
  setLength: (v: ContentLength) => void;
  setFormat: (v: ContentFormat) => void;
  setIncludeImages: (v: boolean) => void;
  setSerpResults: (v: SerpResult[]) => void;
  setSelectedUrls: (v: string[]) => void;
  toggleUrl: (url: string) => void;
  setExtractedContent: (v: { url: string; content: string }[]) => void;
  setAnalysis: (v: AnalysisResult | null) => void;
  setGeneratedArticle: (v: GeneratedArticle | null) => void;
  setCurrentStep: (v: number) => void;
  reset: () => void;
}

const defaultState: AppState = {
  keyword: "",
  contentType: "MOD APK",
  length: "long",
  format: "wordpress",
  includeImages: true,
  serpResults: [],
  selectedUrls: [],
  extractedContent: [],
  analysis: null,
  generatedArticle: null,
  currentStep: 1,
};

const AppContext = createContext<(AppState & AppActions) | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);

  const update = (partial: Partial<AppState>) =>
    setState((prev) => ({ ...prev, ...partial }));

  const actions: AppActions = {
    setKeyword: (v) => update({ keyword: v }),
    setContentType: (v) => update({ contentType: v }),
    setLength: (v) => update({ length: v }),
    setFormat: (v) => update({ format: v }),
    setIncludeImages: (v) => update({ includeImages: v }),
    setSerpResults: (v) => update({ serpResults: v }),
    setSelectedUrls: (v) => update({ selectedUrls: v }),
    toggleUrl: (url) =>
      setState((prev) => ({
        ...prev,
        selectedUrls: prev.selectedUrls.includes(url)
          ? prev.selectedUrls.filter((u) => u !== url)
          : [...prev.selectedUrls, url],
      })),
    setExtractedContent: (v) => update({ extractedContent: v }),
    setAnalysis: (v) => update({ analysis: v }),
    setGeneratedArticle: (v) => update({ generatedArticle: v }),
    setCurrentStep: (v) => update({ currentStep: v }),
    reset: () => setState(defaultState),
  };

  return (
    <AppContext.Provider value={{ ...state, ...actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
