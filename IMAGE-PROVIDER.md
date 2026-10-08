# GIMA AI Studio — Image Provider Integration Guide

## 1. Provider-Neutral Architecture
The Create Creative interface communicates exclusively with an abstracted service: `imageProvider.generate(request)`.

The UI neither knows nor cares which provider generates the image.

---

## 2. Request Schema
Every generation request passed to the provider implements `GenerationRequest`:

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
  date?: string;
  location?: string;
  audience: string;
  offer?: string;
  language: string;
  brandEmphasis: string;
  variationsCount: number;
  referenceImages: AssetItem[];
  extraPrompt: string;
  retrievedKnowledge: KnowledgeItem[];
  brandInstructions: string[];
  createdAt: string;
}
```

---

## 3. Progress Lifecycle States
The UI supports 8 distinct states:
- `idle`: Initial ready state.
- `preparing`: Validating parameters and format constraints.
- `retrieving`: Querying clinical knowledge and course summaries.
- `building_brief`: Applying brand guidelines, typography rules, and director prompts.
- `generating`: Calling the image synthesis engine.
- `review`: Post-processing, aspect-ratio cropping, contrast check.
- `success`: Presenting generated variations for review & project saving.
- `error`: User-friendly recovery state with retry action.

---

## 4. Phase 2 Connection Instructions

### Connecting Google Gemini (Imagen 3)
1. Add `GEMINI_API_KEY` to your `.env.local` or Vercel environment variables.
2. In `src/lib/imageProvider.ts`, implement `GeminiImageProvider`:
```typescript
import { GoogleGenAI } from '@google/genai';

export class GeminiImageProvider implements ImageGenerationProvider {
  id = 'gemini';
  name = 'Google Gemini Imagen 3';
  version = '3.0';
  isConnected = true;

  async generate(request: GenerationRequest): Promise<GeneratedVariation[]> {
    // Call Gemini Image API using request.headline, request.extraPrompt, request.style, etc.
  }
}
```
3. Update `currentProvider = new GeminiImageProvider();`.
4. The Create page automatically uses Gemini without modifying any UI components!
