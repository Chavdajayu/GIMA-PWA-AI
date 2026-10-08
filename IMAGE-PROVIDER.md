# GIMA AI Studio — Image Provider Architecture (Phase 2)

## 1. Provider-Neutral Architecture
The Create Creative interface communicates exclusively with an abstracted service: `imageProvider.generate(request)`.

The UI neither knows nor cares whether generation is handled by the real Google Gemini API or the deterministic demo preview engine.

---

## 2. Gemini Integration (Current @google/genai SDK)

The application uses Google's official `@google/genai` JavaScript SDK with the modern **Nano Banana** family:

* **Default High-Efficiency Workhorse Model**: `gemini-nano-banana-2.1`
* **Configurable Premium Model**: `gemini-3-pro-image`
* **Method**: `ai.models.generateContent(...)` with `{ responseModalities: ['IMAGE'], imageConfig: { aspect_ratio: ... } }`

> **Note**: Stale references to legacy "Imagen 3" integrations have been replaced with the modern Gemini image generation architecture.

---

## 3. Server-Side Security & Architecture

```
Browser (Create Studio)
      │
      │ POST /api/generate-image
      ▼
Server-side Route (src/app/api/generate-image/route.ts)
      ├── Validates Request & Checks Cooldown
      ├── Server-side GIMA Knowledge Retrieval (master index + 12 PDFs)
      ├── SSRF-Safe Asset Resolution (gim-academy.com + uploaded data URLs)
      ├── Structured Prompt Composition (GIMA clinical brand guardrails)
      │
      ▼
Google Gemini API (@google/genai)
      │
      ▼
Server parses inlineData image parts
      │
      ▼
Browser receives generated image as Data URL + metadata
```

### Security Guardrails:
* **Zero Client Secret Exposure**: `GEMINI_API_KEY` is strictly server-side. Never prefixed with `NEXT_PUBLIC_`.
* **SSRF Protection**: Resolves only approved `gim-academy.com` domains and validated client data URLs. Arbitrary internal/network URLs are rejected.
* **Double-Click & Cooldown Protection**: Prevents duplicate submissions and payload explosions.

---

## 4. Request & Response Schemas

### Request: `GenerationRequest`
```typescript
export interface GenerationRequest {
  id: string;
  title: string;
  campaignType: CampaignType;
  course: string;
  topic: string;
  platforms: PlatformType[];
  creativeType: CreativeType;
  aspectRatio: AspectRatioType;
  style: VisualStyleType;
  headline: string;
  cta: string;
  audience: string;
  referenceImages: AssetItem[];
  extraPrompt: string;
  retrievedKnowledge: KnowledgeItem[];
  brandInstructions: string[];
  variationsCount: number;
  createdAt: string;
}
```

### Response: `ApiGenerationResponse`
```typescript
export interface ApiGenerationResponse {
  success: boolean;
  provider?: {
    id: string;
    model: string;
  };
  variations?: {
    id: string;
    imageDataUrl: string;
    mimeType: string;
    promptSummary?: string;
  }[];
  metadata?: {
    course: string;
    creativeType: string;
    aspectRatio: string;
    generationTimeMs?: number;
  };
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}
```

---

## 5. Environment Variables & Setup

Create `.env.local` in the project root:

```env
# Required for real generation
GEMINI_API_KEY="AIzaSy..."

# Configurable Model (Defaults to gemini-nano-banana-2.1)
GEMINI_IMAGE_MODEL="gemini-nano-banana-2.1"

# Configurable Resolution (1K, 2K, 4K)
GEMINI_IMAGE_SIZE="1K"
```

If `GEMINI_API_KEY` is not present, the application automatically operates in **Deterministic Demo Mode**, displaying verified clinical compositions using real GIMA brand assets without pretending to be AI-generated.
