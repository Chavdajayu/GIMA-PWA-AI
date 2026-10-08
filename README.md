# GIMA AI STUDIO (V0.2 — Phase 2 Gemini Integration)
> **AI-Powered Creative Intelligence for Global Integrative Medicine Academy (GIMA)**

An internal administrative and marketing workspace for generating promotional campaigns, posters, and social creatives from authoritative, verified GIMA clinical knowledge and Google Gemini.

---

## 🏛️ Project Vision & Purpose

This is an **internal marketing and administrative tool** for GIMA staff, **not a student chatbot or LMS**. 

* **Primary Mission**: Enable GIMA marketing and executive admins to produce high-impact, brand-compliant promotional assets grounded strictly in GIMA's real curriculum, accredited designations (**ROHP / RNCP**), and clinical research.
* **Phase 2 Complete**: Real Google Gemini image generation (`@google/genai`) using **`gemini-nano-banana-2.1`** (and configurable `gemini-3-pro-image`) connected through secure server-side route `/api/generate-image` with SSRF protection, reference asset ingestion, and prompt composition.

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
│   │   ├── api/generate-image/ # Server-side Gemini API route with SSRF protection
│   │   ├── create/             # Create Studio (Two-column layout, lightbox, download)
│   │   ├── projects/           # Projects workspace & status management
│   │   ├── knowledge/          # Clinical source & PDF explorer
│   │   ├── assets/             # GIMA media asset library
│   │   ├── activity/           # Operational timeline
│   │   └── settings/           # Provider status diagnostics
│   ├── components/             # Sidebar, Header, AssetPickerModal, PwaRegister
│   └── lib/                    # Types, knowledge retrieval, promptComposer, imageProvider
└── package.json
```

---

## ⚡ Quickstart

### 1. Prerequisites
* **Node.js**: v18+ (tested on v24)
* **Python**: 3.10+ (for ingestion scripts)

### 2. Configure Environment
Create `.env.local` in project root:
```env
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_IMAGE_MODEL="gemini-nano-banana-2.1"
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build & Deployment
```bash
npm run build
npm start
```

---

## 🔒 Security & Architecture

* **Server-Side Only Credentials**: `GEMINI_API_KEY` is never bundled into client-side JS or prefixed with `NEXT_PUBLIC_`.
* **SSRF Defense**: The backend verifies all reference asset URLs, only accepting approved GIMA domains (`gim-academy.com`) and validated client base64 uploads.
* **Deterministic Fallback**: If no API key is present, the app gracefully operates in Demo Preview mode, clearly stating provider status without faking AI output.
