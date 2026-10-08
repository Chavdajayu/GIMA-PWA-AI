# GIMA AI Studio — System Architecture

## 1. Architectural Philosophy
GIMA AI Studio is built with an **editorial, clinical-grade design system** and a **strict source-of-truth knowledge architecture**. The application avoids generic AI SaaS patterns, fake marketing claims, or decorative fluff, maintaining strict fidelity to GIMA's real accredited programs (**ROHP / RNCP**).

---

## 2. Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Presentation Layer                    │
│   (Next.js App Router, Tailwind CSS, Accessible Semantic UI)│
│   ├── Dashboard (Overview & Quick Create)                   │
│   ├── Create Studio (Two-Column Interactive Workspace)      │
│   ├── Projects Workspace (Saved Briefs & Variations)        │
│   ├── Knowledge Explorer (Sources & PDF Previews)           │
│   ├── Asset Registry (45 Real GIMA Brand Assets)            │
│   ├── Operational Timeline (Pipeline Events)                │
│   └── Settings & Providers (Phase 2 Placeholders)           │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    Service & Retrieval Layer                │
│   ├── searchKnowledge(query, filters)                       │
│   ├── getKnowledgeForCourse(courseName)                     │
│   ├── getRegisteredAssets(category, query)                  │
│   ├── getBrandConfig()                                      │
│   └── getLocalProjects() / saveProject()                    │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                 Image Provider Abstraction                  │
│   ├── ImageGenerationProvider Interface                     │
│   ├── DeterministicDemoProvider (Phase 1 Active)            │
│   ├── GeminiImageProvider (Phase 2 Plug-in Slot)            │
│   └── OpenAIImageProvider (Phase 2 Plug-in Slot)            │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                  Ingestion & Knowledge Store                │
│   ├── Free-Course PDFs (12 PDFs from Theories of Aging)     │
│   ├── Crawled Public Routes (27 gim-academy.com pages)      │
│   ├── Verified Brand Metadata (gima-brand.json)             │
│   └── Master Knowledge Index (master-knowledge-index.json)  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. High-Priority Free-Course PDF Retrieval
When marketing materials for **Theories of Aging** or **Anti-Aging Nutrition** are requested, the retrieval layer automatically gives **higher priority** (`priority: 100`) to the extracted PDFs authored by Dr. James Meschino over generic web summaries.

---

## 4. PWA & Offline Support
- **Service Worker (`public/sw.js`)**: Employs cache-first strategy for app shell navigation and core static assets, falling back gracefully if offline.
- **Web App Manifest (`public/manifest.json`)**: Configured with standalone display, maskable icons, and GIMA brand theme colors (`#1e3a5f`).
- **PwaRegister Component**: Captures standard `beforeinstallprompt` to present an unobtrusive, native installation prompt.
