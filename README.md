# Jina AI Writer — SERP → Scrape → Analyze → Generate

A production-ready Next.js SEO content generator that uses Jina AI APIs to:
1. **Search** — Fetch competitor pages from SERP via `s.jina.ai`
2. **Extract** — Scrape competitor content as Markdown via `r.jina.ai`
3. **Analyze** — Extract headings, keywords, and word count patterns
4. **Generate** — Create SEO-optimized articles using OpenAI GPT-4o-mini
5. **Export** — Output in WordPress Blocks, HTML, Markdown, or JSON

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Add your OpenAI API key
Edit `.env.local`:
```
OPENAI_API_KEY=sk-your-key-here
NEXT_PUBLIC_HAS_OPENAI_KEY=true
```

### 3. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              ← Step 1: Keyword + Config UI
│   ├── results/page.tsx      ← Step 2: SERP results + URL selection
│   ├── editor/page.tsx       ← Step 3: Article generator + editor
│   └── api/
│       ├── search/route.ts   ← POST /api/search  (Jina SERP)
│       ├── extract/route.ts  ← POST /api/extract (Jina Reader)
│       ├── analyze/route.ts  ← POST /api/analyze (NLP analysis)
│       └── generate/route.ts ← POST /api/generate (OpenAI)
├── lib/
│   ├── jinaSearch.ts         ← Jina Search API wrapper
│   ├── jinaReader.ts         ← Jina Reader API wrapper
│   ├── analyzer.ts           ← Heading/keyword extractor
│   ├── generator.ts          ← OpenAI prompt builder
│   └── formatter.ts          ← WP/HTML/Markdown/JSON formatter
├── types/
│   ├── serp.ts               ← SERP/extract types
│   └── article.ts            ← Article/config types
└── context/
    └── AppContext.tsx         ← Global state store
```

---

## 🔧 API Endpoints

| Endpoint | Method | Body | Returns |
|---|---|---|---|
| `/api/search` | POST | `{ keyword }` | SERP results array |
| `/api/extract` | POST | `{ urls[] }` | Extracted markdown content |
| `/api/analyze` | POST | `{ articles[], keyword }` | Headings, keywords, word count |
| `/api/generate` | POST | `{ config, extractedContent }` | Generated article |

---

## ✨ Features

- **No Jina API key needed** — Jina SERP and Reader are free-to-use
- **OpenAI GPT-4o-mini** — Cost-efficient, high-quality generation
- **4 output formats** — WordPress Blocks, HTML, Markdown, JSON
- **4 article lengths** — Short (600w) to Extra Long (4000w)
- **7 content types** — MOD APK, How-To, Comparison, Listicle, etc.
- **Competitor analysis** — Aggregates headings/keywords from top pages
- **Editable structure** — Customize H2 headings before generation
- **Preview + Raw** — Toggle between formatted preview and raw output
- **Copy & Download** — One-click copy or download as file

---

## 🛠 Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript**
- **Tailwind CSS v4**
- **Jina AI** (s.jina.ai + r.jina.ai)
- **OpenAI** (gpt-4o-mini)
- **Lucide React** (icons)
- **Axios**
- **marked** (Markdown parser)
