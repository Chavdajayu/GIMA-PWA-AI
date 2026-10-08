import { GenerationRequest, GeneratedVariation } from './types';

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
 * Deterministic Demo Provider (Phase 1 Milestone)
 * Produces structured, realistic preview compositions with verified GIMA reference assets.
 * Clearly identified as Demo Preview while maintaining full architecture readiness for Phase 2.
 */
class DeterministicDemoProvider implements ImageGenerationProvider {
  id = 'demo-preview';
  name = 'GIMA Creative Intelligence Preview Engine';
  version = '0.1.0';
  isConnected = true;

  async generate(
    request: GenerationRequest,
    onProgress?: GenerationProgressCallback
  ): Promise<GeneratedVariation[]> {
    // 1. Preparing context
    onProgress?.('preparing', 'Validating creative constraints and aspect ratio specifications...', 15);
    await new Promise((r) => setTimeout(r, 600));

    // 2. Retrieving GIMA Knowledge
    const docCount = request.retrievedKnowledge.length;
    onProgress?.(
      'retrieving',
      `Synthesizing ${docCount} authoritative GIMA clinical sources & course modules...`,
      40
    );
    await new Promise((r) => setTimeout(r, 800));

    // 3. Building Creative Brief
    onProgress?.(
      'building_brief',
      `Applying GIMA brand compliance guidelines and editorial style tokens (${request.style})...`,
      70
    );
    await new Promise((r) => setTimeout(r, 700));

    // 4. Generating Compositions
    onProgress?.('generating', 'Compounding visual typography hierarchy and image composition layers...', 90);
    await new Promise((r) => setTimeout(r, 900));

    // 5. Finalizing Review
    onProgress?.('review', 'Running final readability contrast and platform crop checks...', 100);
    await new Promise((r) => setTimeout(r, 400));

    // Selected image asset fallback
    const leadImage = request.referenceImages[0]?.url || 
      'https://gim-academy.com/wp-content/plugins/gima-course-details/assets/images/Online-Training.jpg';
    
    const instructorImage = 'https://gim-academy.com/wp-content/plugins/gima-course-details/assets/images/dr-meschino.png';

    const variations: GeneratedVariation[] = [];
    const count = Math.max(1, Math.min(4, request.variationsCount || 2));

    for (let i = 1; i <= count; i++) {
      let subhead = `Designed exclusively for Healthcare Professionals | ${request.course}`;
      if (request.extraPrompt) {
        subhead = `${request.course} — Directed by custom prompt: "${request.extraPrompt.slice(0, 60)}..."`;
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
        notes: `Variation ${i} | Visual Direction: ${request.style} | Platforms: ${request.platforms.join(', ')}`
      });
    }

    return variations;
  }
}

/**
 * Future Phase 2 Image Generation Providers (Placeholders ready to connect)
 */
export class GeminiImageProvider implements ImageGenerationProvider {
  id = 'gemini';
  name = 'Google Gemini Creative Vision';
  version = '2.0';
  isConnected = false;

  async generate(): Promise<GeneratedVariation[]> {
    throw new Error('Gemini Image Engine is not connected in Phase 1. Enable in Settings with GEMINI_API_KEY.');
  }
}

export class OpenAIImageProvider implements ImageGenerationProvider {
  id = 'openai';
  name = 'OpenAI DALL-E / GPT Vision';
  version = '3.0';
  isConnected = false;

  async generate(): Promise<GeneratedVariation[]> {
    throw new Error('OpenAI Image Engine is not connected in Phase 1. Enable in Settings with OPENAI_API_KEY.');
  }
}

// Active provider registry
let currentProvider: ImageGenerationProvider = new DeterministicDemoProvider();

export function getImageProvider(): ImageGenerationProvider {
  return currentProvider;
}

export function setImageProvider(provider: ImageGenerationProvider) {
  currentProvider = provider;
}
