import { NextResponse } from 'next/server';
import { PollinationsModelItem } from '@/lib/types';
import { rankPollinationsModels, RankedModelItem } from '@/lib/modelRanking';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse<{ models: RankedModelItem[]; count: number }>> {
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

    // Apply curated GIMA image quality ranking and pricing calculations
    const rankedModels = rankPollinationsModels(normalizedModels);

    return NextResponse.json({
      models: rankedModels,
      count: rankedModels.length,
    });
  } catch (err: any) {
    console.error('[Pollinations Models Error]:', err);
    // Return safe fallback list based on live discovered models
    const fallbackModels: PollinationsModelItem[] = [
      {
        id: 'openai/gpt-image-2.5-sunburst',
        name: 'GPT Image 2.5 Sunburst',
        publisher: 'OpenAI',
        aliases: [],
        description: 'Flagship photorealistic clinical fidelity & balanced prompt adherence',
        pricing: { currency: 'pollen', promptTextTokens: '0.00000375', completionImageTokens: '0.0000225' },
        inputModalities: ['text', 'image'],
        outputModalities: ['image'],
        supportsReferenceImages: true,
        maxReferenceImages: 16,
        health: 'healthy',
        paidOnly: true,
      },
      {
        id: 'google/gemini-3-pro-image',
        name: 'Gemini 3 Pro Image',
        publisher: 'Google',
        aliases: ['nano-banana-pro'],
        description: 'Studio-grade typographic rendering & academic medical hierarchy',
        pricing: { currency: 'pollen', promptTextTokens: '0.00000211', completionImageTokens: '0.0001266' },
        inputModalities: ['text', 'image'],
        outputModalities: ['image'],
        supportsReferenceImages: true,
        maxReferenceImages: 4,
        health: 'healthy',
        paidOnly: true,
      },
      {
        id: 'ideogram-ai/ideogram-v4-quality',
        name: 'Ideogram 4.0 Quality',
        publisher: 'Ideogram AI',
        aliases: [],
        description: 'Industry-leading poster typography, layout margins & clean text',
        pricing: { currency: 'pollen', completionImageTokens: '0.1' },
        inputModalities: ['text'],
        outputModalities: ['image'],
        supportsReferenceImages: false,
        maxReferenceImages: 0,
        health: 'healthy',
        paidOnly: true,
      },
      {
        id: 'openai/gpt-image-2.5-flare',
        name: 'GPT Image 2.5 Flare',
        publisher: 'OpenAI',
        aliases: [],
        description: 'High visual dynamic range, crisp medical accents & contrast',
        pricing: { currency: 'pollen', promptTextTokens: '0.00000375', completionImageTokens: '0.0000225' },
        inputModalities: ['text', 'image'],
        outputModalities: ['image'],
        supportsReferenceImages: true,
        maxReferenceImages: 16,
        health: 'healthy',
        paidOnly: true,
      },
      {
        id: 'bytedance/seedream-5.0-pro',
        name: 'Seedream 5.0 Pro',
        publisher: 'ByteDance',
        aliases: [],
        description: 'Refined editorial composition & clinical healthcare realism',
        pricing: { currency: 'pollen', completionImageTokens: '0.09' },
        inputModalities: ['text', 'image'],
        outputModalities: ['image'],
        supportsReferenceImages: true,
        maxReferenceImages: 2,
        health: 'healthy',
        paidOnly: true,
      },
      {
        id: 'black-forest-labs/flux.2-max',
        name: 'FLUX.2 Max',
        publisher: 'Black Forest Labs',
        aliases: [],
        description: 'Maximum diffusion parameter capacity with high asset fidelity',
        pricing: { currency: 'pollen', promptImageTokens: '0.03', completionImageTokens: '0.03' },
        inputModalities: ['text', 'image'],
        outputModalities: ['image'],
        supportsReferenceImages: true,
        maxReferenceImages: 1,
        health: 'healthy',
        paidOnly: true,
      },
      {
        id: 'microsoft/mai-image-2.6',
        name: 'MAI Image 2.6',
        publisher: 'Microsoft',
        aliases: [],
        description: 'Enterprise medical aesthetic with natural skin tones & lighting',
        pricing: { currency: 'pollen', promptTextTokens: '0.00000375', completionImageTokens: '0.0000285' },
        inputModalities: ['text', 'image'],
        outputModalities: ['image'],
        supportsReferenceImages: true,
        maxReferenceImages: 1,
        health: 'healthy',
        paidOnly: false,
      },
      {
        id: 'recraft/recraft-v4.1-vector',
        name: 'Recraft V4.1 Vector',
        publisher: 'Recraft',
        aliases: [],
        description: 'Exceptional brand iconography, vector clean lines & infographics',
        pricing: { currency: 'pollen', completionImageTokens: '0.0844' },
        inputModalities: ['text', 'image'],
        outputModalities: ['image'],
        supportsReferenceImages: true,
        maxReferenceImages: 1,
        health: 'healthy',
        paidOnly: true,
      },
      {
        id: 'openai/gpt-image-2',
        name: 'GPT Image 2',
        publisher: 'OpenAI',
        aliases: [],
        description: 'Consistent multimodal styling with verified reference conditioning',
        pricing: { currency: 'pollen', promptTextTokens: '0.00000375', completionImageTokens: '0.0000225' },
        inputModalities: ['text', 'image'],
        outputModalities: ['image'],
        supportsReferenceImages: true,
        maxReferenceImages: 16,
        health: 'healthy',
        paidOnly: false,
      },
      {
        id: 'black-forest-labs/flux.1.1-pro',
        name: 'FLUX 1.1 Pro',
        publisher: 'Black Forest Labs',
        aliases: [],
        description: 'Established clinical editorial foundation with dependable contrast',
        pricing: { currency: 'pollen', completionImageTokens: '0.03' },
        inputModalities: ['text'],
        outputModalities: ['image'],
        supportsReferenceImages: false,
        maxReferenceImages: 0,
        health: 'healthy',
        paidOnly: false,
      },
      {
        id: 'tongyi-mai/z-image-turbo',
        name: 'Z-Image Turbo',
        publisher: 'Alibaba',
        aliases: ['z-image-turbo', 'zimage'],
        description: 'Ultra-fast draft ideation (~9s) with minimal Pollen consumption',
        pricing: { currency: 'pollen', completionImageTokens: '0.004' },
        inputModalities: ['text'],
        outputModalities: ['image'],
        supportsReferenceImages: false,
        maxReferenceImages: 0,
        health: 'healthy',
        paidOnly: false,
      },
      {
        id: 'black-forest-labs/flux.1-schnell',
        name: 'FLUX.1 Schnell',
        publisher: 'Black Forest Labs',
        aliases: [],
        description: 'Budget-friendly 4-step diffusion for rapid concept exploration',
        pricing: { currency: 'pollen', completionImageTokens: '0.002' },
        inputModalities: ['text'],
        outputModalities: ['image'],
        supportsReferenceImages: false,
        maxReferenceImages: 0,
        health: 'healthy',
        paidOnly: false,
      },
    ];

    const rankedFallback = rankPollinationsModels(fallbackModels);

    return NextResponse.json({
      models: rankedFallback,
      count: rankedFallback.length,
    });
  }
}
