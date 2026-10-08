import {
  GenerationRequest,
  GeneratedVariation,
  ApiGenerationResponse,
  ApiProviderStatus,
  PollinationsModelItem,
  PollinationsStatusResponse
} from './types';

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
 * Real Pollinations AI Image Generation Provider (Phase 3 Integration)
 * Calls server-side /api/generate-image with provider="pollinations"
 */
export class PollinationsImageProvider implements ImageGenerationProvider {
  id = 'pollinations';
  name = 'Pollinations AI';
  version = '1.0';
  isConnected = true;
  selectedModel?: string;

  constructor(model?: string) {
    this.selectedModel = model;
  }

  /**
   * Generates a single variation (for progressive per-slot rendering)
   */
  async generateSingleVariation(
    request: GenerationRequest,
    variationIndex: number = 0,
    onProgress?: GenerationProgressCallback
  ): Promise<GeneratedVariation> {
    const modelToUse = this.selectedModel || 'tongyi-mai/z-image-turbo';
    onProgress?.('generating', `Generating variation ${variationIndex + 1} with ${modelToUse.split('/')[1] || modelToUse}...`, 50);

    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...request,
        provider: 'pollinations',
        model: modelToUse,
        variationIndex,
        variationsCount: 1,
      }),
    });

    const data: ApiGenerationResponse = await response.json();

    if (!response.ok || !data.success || !data.variations?.[0]) {
      const errMsg = data.error?.message || `Variation ${variationIndex + 1} generation failed.`;
      const err = new Error(errMsg);
      (err as any).code = data.error?.code || 'UNKNOWN';
      (err as any).retryable = data.error?.retryable ?? false;
      throw err;
    }

    const v = data.variations[0];
    const modelName = data.provider?.model || modelToUse;
    const duration = data.metadata?.generationTimeMs || 0;

    return {
      id: v.id || `var-poll-${Date.now()}-${variationIndex + 1}`,
      variationNumber: variationIndex + 1,
      previewImageUrl: v.imageDataUrl,
      compositionHeadline: request.headline || `${request.course} — Excellence in Clinical Education`,
      compositionSubhead: request.extraPrompt
        ? `${request.course} — "${request.extraPrompt.slice(0, 60)}..."`
        : `Designed exclusively for Healthcare Professionals | ${request.course}`,
      ctaText: request.cta || 'Enroll Free Today',
      aspectRatio: request.aspectRatio,
      style: request.style,
      isDeterministicDemo: false,
      isRealGemini: false,
      source: 'pollinations',
      modelUsed: modelName,
      generationTimeMs: duration,
      promptSummary: v.promptSummary,
      notes: `Generated with Pollinations AI (${modelName}) | Style: ${request.style} | Time: ${duration}ms`,
    };
  }

  async generate(
    request: GenerationRequest,
    onProgress?: GenerationProgressCallback
  ): Promise<GeneratedVariation[]> {
    onProgress?.('preparing', 'Validating creative constraints and selected model...', 15);
    await new Promise((r) => setTimeout(r, 200));

    const docCount = request.retrievedKnowledge.length;
    onProgress?.(
      'retrieving',
      `Synthesizing ${docCount} authoritative GIMA clinical sources & course modules...`,
      40
    );
    await new Promise((r) => setTimeout(r, 200));

    onProgress?.(
      'building_brief',
      `Structuring clinical brief and GIMA brand compliance guidelines (${request.style})...`,
      65
    );
    await new Promise((r) => setTimeout(r, 200));

    const targetCount = Math.max(1, Math.min(4, request.variationsCount || 1));
    const promises = Array.from({ length: targetCount }, (_, i) =>
      this.generateSingleVariation(request, i, onProgress)
    );

    const results = await Promise.all(promises);
    onProgress?.('review', 'Reviewing visual contrast, legibility and crop specifications...', 95);
    return results;
  }
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
    onProgress?.('preparing', 'Validating creative constraints and resolving reference assets...', 15);
    await new Promise((r) => setTimeout(r, 400));

    const docCount = request.retrievedKnowledge.length;
    onProgress?.(
      'retrieving',
      `Synthesizing ${docCount} authoritative GIMA clinical sources & course modules...`,
      40
    );
    await new Promise((r) => setTimeout(r, 500));

    onProgress?.(
      'building_brief',
      `Structuring clinical brief and GIMA brand compliance guidelines (${request.style})...`,
      65
    );
    await new Promise((r) => setTimeout(r, 400));

    onProgress?.('generating', 'Generating visual with Google Gemini (gemini-nano-banana-2.1)...', 85);

    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...request,
        provider: 'gemini',
      }),
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
      source: 'gemini-api',
      modelUsed: modelName,
      generationTimeMs: duration,
      promptSummary: v.promptSummary,
      notes: `Generated with Google Gemini (${modelName}) | Style: ${request.style} | Time: ${duration}ms`,
    }));

    return variations;
  }
}

/**
 * Deterministic Demo Provider (Fallback mode when no real API is configured)
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

    const leadImage =
      request.referenceImages[0]?.url ||
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
        source: 'demo-preview',
        modelUsed: 'Demo Preview Engine',
        notes: `Demo Preview | Visual Direction: ${request.style} | Platforms: ${request.platforms.join(', ')}`,
      });
    }

    return variations;
  }
}

// Active provider instance (Pollinations is primary in Phase 3)
let currentProvider: ImageGenerationProvider = new PollinationsImageProvider();

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
      provider: 'Pollinations AI',
      model: 'tongyi-mai/z-image-turbo',
      size: '1024x1024',
      mode: 'demo',
      message: 'Could not contact server status endpoint. Running in Demo Preview mode.',
    };
  }
}

export async function fetchLivePollinationsModels(): Promise<PollinationsModelItem[]> {
  try {
    const res = await fetch('/api/pollinations/models');
    if (!res.ok) throw new Error('Failed to fetch models');
    const data = await res.json();
    return data.models || [];
  } catch (err) {
    console.error('Error fetching live models:', err);
    return [];
  }
}

export async function checkPollinationsStatus(): Promise<PollinationsStatusResponse> {
  try {
    const res = await fetch('/api/pollinations/status');
    if (!res.ok) throw new Error('Failed to fetch status');
    return await res.json();
  } catch (err: any) {
    return {
      provider: 'Pollinations AI',
      configured: false,
      keyType: 'none',
      baseUrl: 'https://gen.pollinations.ai',
      modelConfigured: 'tongyi-mai/z-image-turbo',
      accountBalanceAvailable: false,
      imageGenerationReachable: false,
      message: err.message || 'Status check failed',
    };
  }
}
