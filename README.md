# GIMA AI STUDIO (V0.1)
> **AI-Powered Creative Intelligence for Global Integrative Medicine Academy (GIMA)**

An internal administrative and marketing workspace for generating promotional campaigns, posters, and social creatives from authoritative, verified GIMA clinical knowledge.

---

## 🏛️ Project Vision & Purpose

This is an **internal marketing and administrative tool** for GIMA staff, **not a student chatbot or LMS**. 

- **Primary Mission**: Enable GIMA marketing and executive admins to produce high-impact, brand-compliant promotional assets grounded strictly in GIMA's real curriculum, accredited designations (**ROHP / RNCP**), and clinical research.
- **Phase 1 Milestone**: Complete production-grade PWA interface + authoritative GIMA knowledge foundation + asset registry + deterministic preview composition engine + future-ready provider abstraction.
- **Phase 2 Ready**: Seamless plug-in for Gemini Imagen 3, OpenAI, or local image models without altering UI workflows.

---

## 📁 Repository Structure

```
E:\OFFICE-TECHFORBS\GIMA-PWA-AI\
├── Free-Course-PDF'S/           # Authoritative local PDF sources (12 clinical documents)
│   └── THEORIES-OF-AGING/
├── data/
│   ├── raw/                    # Raw ingest captures
│   ├── processed/
│   │   ├── pdfs/               # Extracted per-document JSONs with page-level previews
│   │   └── site/               # Crawled public website route content
│   ├── knowledge/
│   │   ├── master-knowledge-index.json  # 39 Unified clinical source records
│   │   └── site-knowledge-index.json
│   ├── metadata/
│   │   └── gima-brand.json     # Authoritative brand guidelines, courses & rules
│   ├── site-map/
│   │   └── routes.json         # 27 Verified public URLs
│   ├── assets/
│   │   └── asset-registry.json # 45 Registered GIMA media assets & logos
│   └── free-courses/
│       └── theories-of-aging-index.json
├── public/
│   ├── manifest.json           # Web App Manifest for PWA installation
│   ├── sw.js                   # Service Worker for offline shell caching
│   ├── icon-192.png            # Maskable PWA icon
│   └── icon-512.png
├── scripts/
│   ├── ingest_pdfs.py          # Python extractor for Free-Course PDFs
│   ├── ingest_site.py          # Crawler for public gim-academy.com routes
│   └── build_master_index.py   # Master synthesizer & brand configuration builder
├── src/
│   ├── app/                    # Next.js App Router (Dashboard, Create, Projects, Knowledge, Assets, Activity, Settings)
│   ├── components/             # Sidebar, Header, AssetPickerModal, PwaRegister
│   └── lib/                    # Types, knowledge retrieval, asset registry, provider abstraction, projects, activity
└── package.json
```

---

## ⚡ Quickstart

### 1. Prerequisites
- **Node.js**: v18+ (tested on v24)
- **Python**: 3.10+ (for ingestion scripts)

### 2. Installation
```bash
npm install
```

### 3. Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build & Test
```bash
npm run build
npm start
```

---

## 🔬 Knowledge Ingestion Workflow

To re-ingest all authoritative sources:
```bash
# Ingest local Free-Course PDFs (12 files)
npm run ingest:pdfs

# Crawl public GIMA website routes (27 routes)
npm run ingest:site

# Run all ingestions and compile master index
npm run ingest:all
```

---

## 🔌 Connecting Image Providers in Phase 2

The generation layer is abstracted behind `imageProvider.generate(request)` in `src/lib/imageProvider.ts`. 

To connect Google Gemini or OpenAI in Phase 2:
1. Add your API keys to `.env.local` (see `.env.example`).
2. Implement the API call in `GeminiImageProvider` or `OpenAIImageProvider` inside `src/lib/imageProvider.ts`.
3. Set the active provider in `src/lib/imageProvider.ts`.

See [IMAGE-PROVIDER.md](file:///E:/OFFICE-TECHFORBS/GIMA-PWA-AI/IMAGE-PROVIDER.md) for full instructions and schemas.

---

## ☁️ Deploying to Vercel

This application is 100% compatible with standard Vercel Next.js deployments:
1. Push to your Git repository (GitHub / GitLab).
2. Connect the repository in Vercel.
3. Framework Preset: **Next.js**.
4. Root Directory: `./`.
5. Deploy!
