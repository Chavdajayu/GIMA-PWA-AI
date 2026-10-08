import { NextResponse } from 'next/server';
import { PollinationsModelItem } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse<{ models: PollinationsModelItem[]; count: number }>> {
  const apiKey = process.env.POLLINATIONS_API_KEY?.trim();

  const headers: Record<string, string> = {
    'User-Agent': 'GIMA-AI-Studio/1.0',
    Accept: 'application/json',
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  try {
    const res = await fetch('https://gen.pollinations.ai/image/models', {
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Upstream returned ${res.status}: ${res.statusText}`);
    }

    const rawList = await res.json();
    if (!Array.isArray(rawList)) {
      throw new Error('Unexpected non-array response from model catalog');
    }

    const normalizedModels: PollinationsModelItem[] = rawList.map((m: any) => {
      const id = m.name || m.id;
      const inputModalities = Array.isArray(m.input_modalities) ? m.input_modalities : ['text'];
      const maxRefs = typeof m.max_reference_images === 'number' ? m.max_reference_images : 0;
      const supportsReference = inputModalities.includes('image') || maxRefs > 0;

      return {
        id,
        name: m.title || id,
        publisher: m.publisher || 'Community',
        aliases: Array.isArray(m.aliases) ? m.aliases : [],
        description: m.description || '',
        pricing: m.pricing
          ? {
              currency: m.pricing.currency || 'pollen',
              completionImageTokens: m.pricing.completionImageTokens,
              promptTextTokens: m.pricing.promptTextTokens,
              promptImageTokens: m.pricing.promptImageTokens,
            }
          : undefined,
        inputModalities,
        outputModalities: Array.isArray(m.output_modalities) ? m.output_modalities : ['image'],
        supportsReferenceImages: supportsReference,
        maxReferenceImages: maxRefs,
        health: m.health?.status || 'unknown',
        paidOnly: Boolean(m.paid_only),
      };
    });

    return NextResponse.json({
      models: normalizedModels,
      count: normalizedModels.length,
    });
  } catch (err: any) {
    console.error('[Pollinations Models Error]:', err);
    // Return safe fallback list based on live discovered models
    const fallbackModels: PollinationsModelItem[] = [
      {
        id: 'tongyi-mai/z-image-turbo',
        name: 'Z-Image Turbo',
        publisher: 'Alibaba',
        aliases: ['z-image-turbo', 'zimage'],
        description: 'Instant, budget-friendly images with crisp upscaled output',
        pricing: { currency: 'pollen', completionImageTokens: '0.004' },
        inputModalities: ['text'],
        outputModalities: ['image'],
        supportsReferenceImages: false,
        maxReferenceImages: 0,
        health: 'healthy',
      },
      {
        id: 'openai/gpt-image-2',
        name: 'GPT Image 2',
        publisher: 'OpenAI',
        aliases: [],
        description: 'Advanced multimodal image generation and reference image styling',
        pricing: { currency: 'pollen', completionImageTokens: '0.0000225' },
        inputModalities: ['text', 'image'],
        outputModalities: ['image'],
        supportsReferenceImages: true,
        maxReferenceImages: 16,
        health: 'healthy',
      },
      {
        id: 'microsoft/mai-image-2.6-flash',
        name: 'MAI Image 2.6 Flash',
        publisher: 'Microsoft',
        aliases: [],
        description: 'High-speed photorealistic generation with single reference image',
        pricing: { currency: 'pollen', completionImageTokens: '0.00001425' },
        inputModalities: ['text', 'image'],
        outputModalities: ['image'],
        supportsReferenceImages: true,
        maxReferenceImages: 1,
        health: 'healthy',
      },
      {
        id: 'black-forest-labs/flux.1-schnell',
        name: 'FLUX.1 Schnell',
        publisher: 'Black Forest Labs',
        aliases: [],
        description: 'Ultra-fast open-weight generation with reproducible seeds',
        pricing: { currency: 'pollen', completionImageTokens: '0.002' },
        inputModalities: ['text'],
        outputModalities: ['image'],
        supportsReferenceImages: false,
        maxReferenceImages: 0,
        health: 'healthy',
      },
    ];

    return NextResponse.json({
      models: fallbackModels,
      count: fallbackModels.length,
    });
  }
}
