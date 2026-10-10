# GIMA AI Studio — Creative Generation Architecture (Phase 3.5: Cloudflare Workers AI & Hybrid Poster Engine)

## 1. Multi-Provider Architecture

The Create Creative studio operates on a modular, multi-provider model:

1. **Cloudflare Workers AI (Zero Out-of-Pocket Hosted Image Generation)**:
   - Direct, server-side inference on Cloudflare Workers AI REST API:
     `https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/{MODEL_ID}`
   - **Candidate Models**:
     - `@cf/black-forest-labs/flux-2-klein-9b` (Primary recommended high-quality clinical candidate)
     - `@cf/black-forest-labs/flux-2-klein-4b` (Fast 4-step alternative)
     - `@cf/black-forest-labs/flux-1-schnell` (Commercially relevant open-weight alternative)
   - **Daily Free Allowance**: 10,000 Neurons per day included on Cloudflare Free Workers plan (~7 images/day for Klein 9B).
   - Authenticated with server-side secrets (`CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`) in `.env.local` or Vercel Environment Variables.
   - Server-side multipart `FormData` invocation returning binary image buffers.
   - Coupled with the **Deterministic Hybrid Poster Composition Engine** to guarantee perfect typography, official logos, and course-specific curriculum points.

2. **Pollinations AI (Phase 3 Real-Image Provider)**:
   - Direct, server-side real AI image generation via `https://gen.pollinations.ai`.
   - Authenticated with server-side secret key (`POLLINATIONS_API_KEY`) stored exclusively in `.env.local` or Vercel Environment Variables.
   - Dynamic model discovery from the live catalog (16 models currently available, including `openai/gpt-image-2`, `tongyi-mai/z-image-turbo`, `microsoft/mai-image-2.6-flash`, `black-forest-labs/flux.1-schnell`).
   - Pollen balance verification (`/account/balance`).
   - In-app refinement with prompt chips and one-click re-generation.

3. **Gemini Pro Web Handoff (Phase 2B ₹0 Workflow)**:
   - Uses the user's signed-in **Jio Google AI Pro** account at `gemini.google.com/app`.
   - GIMA AI Studio handles all clinical knowledge retrieval (RAG from 12 Free-Course PDFs + website crawl), asset resolution, compliance guardrails, and structured prompt engineering.
   - **Zero API Billing / ₹0 Cost**.

4. **Deterministic Demo Preview**:
   - Generates high-fidelity preview compositions using authentic GIMA logos, Dr. Meschino portraits, and clinical curriculum citations.
   - Transparently labeled: *"Demo Preview — not AI-generated"*.

---

## 2. Gemini Pro Web Handoff Workflow & Security

```
┌────────────────────────────────────────────────────────┐
│               GIMA AI Studio (Create Page)             │
│  - Select Course, Platform, Format, Style, References  │
│  - GIMA Knowledge Engine retrieves 12 PDF citations   │
└──────────────────────────┬─────────────────────────────┘
                           │ Click [ PREPARE IN GEMINI ]
                           ▼
┌────────────────────────────────────────────────────────┐
│                GEMINI PRO HANDOFF PANEL                │
│  - Status: Ready (Google Gemini Pro)                   │
│  - [ COPY GEMINI PROMPT ]                              │
│  - [ OPEN GEMINI ] -> Opens gemini.google.com/app     │
│  - [ Download Selected References ]                    │
└──────────────────────────┬─────────────────────────────┘
                           │ User pastes prompt in Gemini
                           ▼
┌────────────────────────────────────────────────────────┐
│        Google Gemini Pro (gemini.google.com/app)       │
│  - User generates creative using Jio AI Pro account    │
│  - User copies or downloads the generated image        │
└──────────────────────────┬─────────────────────────────┘
                           │ Return to Studio
                           ▼
┌────────────────────────────────────────────────────────┐
│             GEMINI RESULT IMPORT (STUDIO)              │
│  - Drag & Drop / File Picker / Ctrl+V Clipboard Paste  │
│  - MIME type and size validation (PNG/JPG/WEBP <= 15MB)│
│  - Badge: "Generated in Gemini Pro"                    │
│  - Actions: Download, Save to Projects, Refine        │
└────────────────────────────────────────────────────────┘
```

### Absolute Security & Terms Compliance:
- **No Headless Automation**: No Playwright, Puppeteer, Selenium, or CDP automation of `gemini.google.com`.
- **Zero Credential Capture**: Never accesses or extracts Google cookies, session tokens, or browser logins.
- **Human-in-the-Loop**: The user retains full control and oversight over their Google account.
- **Truthful Attribution**: Imported images display `"Source: Gemini Pro Web Handoff"`.

---

## 3. Reference Asset Export

Approved GIMA assets can be exported directly for input into Gemini Pro:
- **API Endpoint**: `GET /api/download-asset?url=...&filename=...`
- **SSRF Sanitization**: Rejects unapproved origins and private IP ranges.
- **Clean Filenames**: `GIMA-Logo.png`, `GIMA-Dr-James-Meschino.png`.

---

## 4. Structured Web Prompt Engineering

Prompts generated by `buildGeminiWebPrompt()` follow a clinical editorial hierarchy:

```
=== ROLE ===
You are creating a professional marketing visual for Global Integrative Medicine Academy (GIMA).

=== SOURCE (AUTHORITATIVE GIMA CLINICAL MATERIAL) ===
Target Course: Theories of Aging
Verified Clinical Topics: Cellular metabolism, longevity pathways, orthomolecular medicine...
Authoritative Material:
• [Theories of Aging.pdf]: Summary of cellular senescence, free radicals...

=== OBJECTIVE & AUDIENCE ===
Campaign Objective: Free Course Promotion
Target Audience: Licensed Healthcare Professionals

=== FORMAT & ASPECT RATIO ===
Platform: Instagram
Format: 4:5 aspect ratio (Render as 3:4 composition)
Creative Type: Poster

=== STYLE & VISUAL DIRECTION ===
Visual Style: Clinical Editorial
Visual Tokens: Deep navy foundation (#1e3a5f), warm gold accents, clinical margins...

=== MANDATORY TEXT & COPY ===
Headline: "Theories of Aging: Cellular Mechanisms & Longevity Science"
Call to Action (CTA): "Enroll Free Today"

=== BRAND IDENTITY ===
Organization: Global Integrative Medicine Academy (GIMA)
Accreditations: Board of Integrative Medicine (BOIM), Canadian Examining Board

=== QUALITY DIRECTIVES ===
Premium, polished, human-designed, professional, realistic, strong hierarchy...

=== NEGATIVE CONSTRAINTS ===
No fake medical claims, no invented credentials, no generic AI-looking neon aesthetics.
```

---

## 5. Iteration & Refinement in Gemini

When a creative is imported, the user can click **Refine in Gemini** to input custom adjustments (e.g., *"Make the headline more prominent and soften background clinical contrast"*). The studio generates an updated prompt with `buildGeminiRefinementPrompt()` and provides one-click copy and navigation back to Gemini.

---

## 6. Phase 3.1: Progressive Generation & Skeleton UX Architecture

### 1. True Progressive Execution
Rather than waiting sequentially for all variations before rendering (`N × 9.5s ≈ 38s`), Phase 3.1 executes variations as **independent, concurrent client-driven requests**:
- **1 requested**: 1 immediate skeleton slot -> 1 request.
- **2 requested**: 2 immediate skeleton slots -> 2 concurrent requests.
- **4 requested**: 4 immediate skeleton slots -> 4 concurrent requests.

### 2. Time-to-First-Image (TTFI) Benchmark
Measured in automated live tests against Pollinations `tongyi-mai/z-image-turbo`:
- **Single Variation**: 11.22s.
- **2 Concurrent Variations**:
  - **Time-to-First-Image (TTFI)**: **8,676 ms (8.68s)**.
  - **Second Image Ready**: **9,671 ms (9.67s)**.
  - **All Variations Ready**: **9,686 ms (9.69s)**.
Perceived latency is reduced from ~20s down to **~8.7 seconds**.

### 3. Aspect-Ratio Matching Skeletons
Skeleton cards precisely match the target creative format:
- `4:5` -> `aspect-[4/5]`
- `1:1` -> `aspect-square`
- `16:9` -> `aspect-video`
- `9:16` -> `aspect-[9/16]`
- `A4` -> `aspect-[1/1.414]`

Includes subtle CSS shimmer (`@keyframes shimmer`), small sparkle icon, "Creating visual...", and no fake progress percentages.

### 4. Slot Invariant & Partial Failure Isolation
- **Fixed Slot Order**: Slot 1 always represents Variation 1, Slot 2 represents Variation 2. Completed requests replace *only* their specific slot skeleton without shifting or reordering.
- **Partial Failure Isolation**: If Variation 3 fails, Slots 1, 2, and 4 remain fully visible. Slot 3 displays `Variation 3 Failed [Retry Slot]` for one-click independent re-generation.

### 5. Visual Dominance & Clean Creative Output
- Removed long prompt paragraphs and dense knowledge dumps around creative images.
- Images visually dominate with floating glass action overlays on hover:
  - **Download**: Instant PNG download.
  - **Fullscreen**: Lightbox viewer with ESC key support.
  - **Save to Projects**: Local PWA project store archiving.
  - **Use as Reference**: Pipes image into the reference asset drawer for subsequent generations.
  - **Refine**: Quick suggestion chips and re-generation.
- Collapsible **Live Brief & Clinical Sources** bar keeps metadata accessible without pushing the creative grid below the fold.

### 6. Controlled Poster Copy
`composePollinationsImagePrompt` uses structured, clean art direction with quoted headline/subheadline/CTA and explicit negative constraints (`no fake medical claims, no invented credentials, no gibberish text`) to prevent diffusion models from painting distorted paragraph blocks directly onto the graphic.

