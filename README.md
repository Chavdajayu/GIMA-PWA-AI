# GIMA AI STUDIO (V0.3.1 — Phase 3.1 Progressive Image Generation & Skeleton UX)
> **AI-Powered Creative Intelligence for Global Integrative Medicine Academy (GIMA)**

An internal administrative and marketing workspace for generating promotional campaigns, posters, and social creatives from authoritative, verified GIMA clinical knowledge and modern AI engines.

---

## 🏛️ Project Vision & Purpose

This is an **internal marketing and administrative tool** for GIMA staff, **not a student chatbot or LMS**. 

* **Primary Mission**: Enable GIMA marketing and executive admins to produce high-impact, brand-compliant promotional assets grounded strictly in GIMA's real curriculum, accredited designations (**ROHP / RNCP**), and clinical research.
* **Phase 3.1 Progressive Architecture**:
  1. **Pollinations AI (Phase 3.1 Primary Real Generation)**: Direct, server-side real AI image generation via `https://gen.pollinations.ai`. Powered by the authenticated multi-model catalog (defaulting to fast `tongyi-mai/z-image-turbo`). Implements **true progressive client concurrency** with **Time-to-First-Image (TTFI) ~8.7s**, matching aspect-ratio skeleton cards, isolated error retries, and floating hover actions without visual clutter.
  2. **Gemini Pro Web Handoff (Phase 2B ₹0 Mode)**: Uses the user's logged-in Jio Google AI Pro account at `gemini.google.com/app`. GIMA AI Studio prepares verified clinical briefs from 12 Free-Course PDFs and 27 website routes, generates structured prompts, exports reference assets, and imports the generated images back into the studio via Drag & Drop, File Picker, or Ctrl+V paste.
  3. **Google Gemini API**: Server-side `@google/genai` integration with `gemini-nano-banana-2.1`. Detects Free-Tier limit: 0 quota conditions cleanly.
  4. **Deterministic Demo Preview**: Local offline mockup engine using authentic GIMA brand guidelines.

---

## 📁 Repository Structure

```
E:\OFFICE-TECHFORBS\GIMA-PWA-AI\
├── Free-Course-PDF'S/           # Authoritative local PDF sources (12 clinical documents)
│   └── THEORIES-OF-AGING/
├── data/
│   ├── processed/
│   │   ├── pdfs/               # Extracted per-document JSONs with page-level previews
│   │   └── site/               # Crawled public website route content
│   ├── knowledge/
│   │   └── master-knowledge-index.json  # 39 Unified clinical source records
│   ├── metadata/
│   │   └── gima-brand.json     # Authoritative brand guidelines, courses & rules
│   ├── site-map/
│   │   └── routes.json         # 27 Verified public URLs
│   └── assets/
│       └── asset-registry.json # 45 Registered GIMA media assets & logos
├── public/
│   ├── manifest.json           # Web App Manifest for PWA installation
│   ├── sw.js                   # Service Worker for offline shell caching
│   ├── icon-192.png            # Maskable PWA icon
│   └── icon-512.png
├── src/
│   ├── app/
│   │   ├── api/download-asset/ # Secure asset attachment download route
│   │   ├── api/generate-image/ # Server-side Gemini API route with SSRF protection
│   │   ├── create/             # Create Studio (Gemini Web Handoff, Dropzone, Ctrl+V, Lightbox)
│   │   ├── projects/           # Projects workspace & status management
│   │   ├── knowledge/          # Clinical source & PDF explorer
│   │   ├── assets/             # GIMA media asset library
│   │   ├── activity/           # Operational timeline
│   │   └── settings/           # Multi-provider status diagnostics
│   ├── components/             # Sidebar, Header, AssetPickerModal, PwaRegister
│   └── lib/                    # Types, knowledge retrieval, promptComposer, imageProvider
└── package.json
```

---

## ⚡ Quickstart

### 1. Prerequisites
* **Node.js**: v18+ (tested on v24)
* **Python**: 3.10+ (for ingestion scripts)

### 2. Run Locally
```bash
cd E:\OFFICE-TECHFORBS\GIMA-PWA-AI
npm install
npm run build
npm start
```
Open [http://localhost:3000](http://localhost:3000) in Google Chrome or any modern browser.

---

## 🚀 Production Deployment (GitHub & Vercel)

### 1. Repository Setup (Private GitHub)
The project repository is configured as a private repository on GitHub:
- **Repository**: [https://github.com/Chavdajayu/GIMA-PWA-AI](https://github.com/Chavdajayu/GIMA-PWA-AI)
- **Branch**: `main`

### 2. Environment Variables Configuration
For both local development (`.env.local`) and production hosting (Vercel Project Settings → Environment Variables):

| Variable | Description | Scope | Sample Value |
|---|---|---|---|
| `POLLINATIONS_API_KEY` | Server-side secret key from Pollinations AI | Production, Preview, Dev | `your-server-secret` |
| `POLLINATIONS_IMAGE_MODEL` | Default production model | Production, Preview, Dev | `tongyi-mai/z-image-turbo` |
| `POLLINATIONS_IMAGE_SIZE` | Default image dimensions | Production, Preview, Dev | `1024x1024` |
| `POLLINATIONS_IMAGE_WIDTH` | Width in pixels | Production, Preview, Dev | `1024` |
| `POLLINATIONS_IMAGE_HEIGHT` | Height in pixels | Production, Preview, Dev | `1024` |
| `NEXT_PUBLIC_APP_NAME` | Client-facing application name | Production, Preview, Dev | `GIMA AI STUDIO` |
| `NEXT_PUBLIC_APP_ENV` | Environment identifier | Production / Dev | `production` |

> 🔒 **Security Notice**: All API keys are strictly server-side secrets. They are never prefixed with `NEXT_PUBLIC_`, never exposed to the client bundle, and `.env.local` is excluded via `.gitignore`.

### 3. Vercel Deployment Workflow
1. Connect / import the GitHub repository: `Chavdajayu/GIMA-PWA-AI`
2. Framework Preset: **Next.js** (Auto-detected)
3. Root Directory: `./`
4. Build Command: `next build`
5. Output Directory: `.next`
6. Configure the server-side environment variables (`POLLINATIONS_API_KEY`, `POLLINATIONS_IMAGE_MODEL`, `POLLINATIONS_IMAGE_SIZE`) under Vercel Settings → Environment Variables.
7. Deploy.

---

## 🔒 Security & Terms Compliance
* **Zero Headless Automation**: No Playwright, Puppeteer, Selenium, or CDP automation of `gemini.google.com`.
* **Zero Credential Capture**: Never accesses or extracts Google cookies, session tokens, or browser logins.
* **Human-in-the-Loop**: The user stays in control of the Gemini website interaction at all times.
* **Truthful Attribution**: Imported creatives explicitly display `"Source: Gemini Pro Web Handoff"`.
* **Private Clinical Data**: Source PDFs are parsed offline into lightweight indexes (`data/`); raw PDFs and secrets are never committed to version control.

