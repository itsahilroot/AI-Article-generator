import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Jina AI Writer — SERP‑Powered SEO Content Generator",
  description:
    "Analyze top-ranking competitor pages with Jina Reader, then generate fully optimized SEO articles in WordPress, HTML, Markdown or JSON — in one click.",
  keywords:
    "AI content writer, SEO article generator, SERP analysis, Jina Reader, WordPress content",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={jakarta.variable}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
