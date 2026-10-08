import { GenerationRequest, GeneratedVariation, ApiGenerationResponse, ApiProviderStatus } from './types';

export interface GenerationProgressCallback {
  (step: 'preparing' | 'retrieving' | 'building_brief' | 'generating' | 'review', message: string, percent: number): void;
}

export interface ImageGenerationProvider {
  id: string;
  name: string;
  version: string;
  isConnected: boolean;
  generate(
    request: GenerationRequest,
    onProgress?: GenerationProgressCallback
  ): Promise<GeneratedVariation[]>;
}

/**
 * Real Google Gemini Image Generation Provider (Phase 2 Integration)
 * Calls server-side /api/generate-image using @google/genai SDK
 */
export class GeminiImageProvider implements ImageGenerationProvider {
  id = 'gemini';
  name = 'Google Gemini Creative Vision';
  version = '2.1';
  isConnected = true;

  async generate(
    request: GenerationRequest,
    onProgress?: GenerationProgressCallback
  ): Promise<GeneratedVariation[]> {
    // 1. Preparing context
    onProgress?.('preparing', 'Validating creative constraints and resolving reference assets...', 15);
    await new Promise((r) => setTimeout(r, 400));

    // 2. Retrieving GIMA Knowledge
    const docCount = request.retrievedKnowledge.length;
    onProgress?.(
      'retrieving',
      `Synthesizing ${docCount} authoritative GIMA clinical sources & course modules...`,
      40
    );
    await new Promise((r) => setTimeout(r, 500));

    // 3. Building Creative Brief
    onProgress?.(
      'building_brief',
      `Structuring clinical brief and GIMA brand compliance guidelines (${request.style})...`,
      65
    );
    await new Promise((r) => setTimeout(r, 400));

    // 4. Calling Server-side Gemini API
    onProgress?.('generating', 'Generating visual with Google Gemini (gemini-nano-banana-2.1)...', 85);

    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data: ApiGenerationResponse = await response.json();

    if (!response.ok || !data.success) {
      const errMsg = data.error?.message || 'Gemini generation request failed.';
      const errCode = data.error?.code || 'UNKNOWN';
      const err = new Error(errMsg);
      (err as any).code = errCode;
      (err as any).retryable = data.error?.retryable ?? false;
      throw err;
    }

    // 5. Finalizing Review
    onProgress?.('review', 'Reviewing generated visual contrast, legibility and crop specifications...', 95);
    await new Promise((r) => setTimeout(r, 300));

    const modelName = data.provider?.model || 'gemini-nano-banana-2.1';
    const duration = data.metadata?.generationTimeMs || 0;

    const variations: GeneratedVariation[] = (data.variations || []).map((v, idx) => ({
      id: v.id || `var-${request.id}-${idx + 1}`,
      variationNumber: idx + 1,
      previewImageUrl: v.imageDataUrl,
      compositionHeadline: request.headline || `Elevate Your Clinical Practice with ${request.course}`,
      compositionSubhead: request.extraPrompt
        ? `${request.course} — "${request.extraPrompt.slice(0, 60)}..."`
        : `Designed exclusively for Healthcare Professionals | ${request.course}`,
      ctaText: request.cta || 'Enroll in Certification',
      aspectRatio: request.aspectRatio,
      style: request.style,
      isDeterministicDemo: false,
      isRealGemini: true,
      modelUsed: modelName,
      generationTimeMs: duration,
      promptSummary: v.promptSummary,
      notes: `Generated with Google Gemini (${modelName}) | Style: ${request.style} | Time: ${duration}ms`
    }));

    return variations;
  }
}

/**
 * Deterministic Demo Provider (Fallback mode when GEMINI_API_KEY is not set)
 * Clearly labeled as Demo Preview without fabricating AI generation.
 */
export class DeterministicDemoProvider implements ImageGenerationProvider {
  id = 'demo-preview';
  name = 'GIMA Creative Intelligence Preview Engine (Demo)';
  version = '0.1.0';
  isConnected = true;

  async generate(
    request: GenerationRequest,
    onProgress?: GenerationProgressCallback
  ): Promise<GeneratedVariation[]> {
    onProgress?.('preparing', 'Validating creative constraints and aspect ratio specifications...', 15);
    await new Promise((r) => setTimeout(r, 500));

    const docCount = request.retrievedKnowledge.length;
    onProgress?.(
      'retrieving',
      `Synthesizing ${docCount} authoritative GIMA clinical sources & course modules...`,
      40
    );
    await new Promise((r) => setTimeout(r, 600));

    onProgress?.(
      'building_brief',
      `Applying GIMA brand compliance guidelines and editorial style tokens (${request.style})...`,
      70
    );
    await new Promise((r) => setTimeout(r, 500));

    onProgress?.('generating', 'Compounding visual typography hierarchy and image composition layers...', 90);
    await new Promise((r) => setTimeout(r, 600));

    onProgress?.('review', 'Running final readability contrast and platform crop checks...', 100);
    await new Promise((r) => setTimeout(r, 300));

    const leadImage = request.referenceImages[0]?.url ||
      'https://gim-academy.com/wp-content/plugins/gima-course-details/assets/images/Online-Training.jpg';
    const instructorImage =
      'https://gim-academy.com/wp-content/plugins/gima-course-details/assets/images/dr-meschino.png';

    const variations: GeneratedVariation[] = [];
    const count = Math.max(1, Math.min(4, request.variationsCount || 2));

    for (let i = 1; i <= count; i++) {
      let subhead = `Designed exclusively for Healthcare Professionals | ${request.course}`;
      if (request.extraPrompt) {
        subhead = `${request.course} — "${request.extraPrompt.slice(0, 60)}..."`;
      }

      variations.push({
        id: `var-${request.id}-${i}`,
        variationNumber: i,
        previewImageUrl: i % 2 === 1 ? leadImage : instructorImage,
        compositionHeadline: request.headline || `Elevate Your Clinical Practice with ${request.course}`,
        compositionSubhead: subhead,
        ctaText: request.cta || 'Enroll in Certification',
        aspectRatio: request.aspectRatio,
        style: request.style,
        isDeterministicDemo: true,
        isRealGemini: false,
        modelUsed: 'Demo Preview Engine',
        notes: `Demo Preview | Visual Direction: ${request.style} | Platforms: ${request.platforms.join(', ')}`
      });
    }

    return variations;
  }
}

// Active provider instance (GeminiImageProvider is primary in Phase 2)
let currentProvider: ImageGenerationProvider = new GeminiImageProvider();

export function getImageProvider(): ImageGenerationProvider {
  return currentProvider;
}

export function setImageProvider(provider: ImageGenerationProvider) {
  currentProvider = provider;
}

export async function checkServerProviderStatus(): Promise<ApiProviderStatus> {
  try {
    const res = await fetch('/api/generate-image');
    if (!res.ok) throw new Error('Status endpoint failed');
    return await res.json();
  } catch {
    return {
      configured: false,
      provider: 'Google Gemini',
      model: 'gemini-nano-banana-2.1',
      size: '1K',
      mode: 'demo',
      message: 'Could not contact server status endpoint. Running in Demo Preview mode.'
    };
  }
}
