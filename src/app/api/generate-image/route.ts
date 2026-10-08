import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import {
  GenerationRequest,
  ApiGenerationResponse,
  ApiProviderStatus,
  KnowledgeItem,
  AssetItem
} from '@/lib/types';
import { getBrandConfig, getKnowledgeForCourse, searchKnowledge } from '@/lib/knowledge';
import { composeGenerationPrompt, mapAspectRatioToGemini } from '@/lib/promptComposer';

export const runtime = 'nodejs';
export const maxDuration = 60; // Allow sufficient time for multi-variation generation

/**
 * Validates and sanitizes asset URLs to prevent SSRF
 */
function isApprovedAssetUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('data:image/png;base64,') ||
      url.startsWith('data:image/jpeg;base64,') ||
      url.startsWith('data:image/jpg;base64,') ||
      url.startsWith('data:image/webp;base64,')) {
    return true;
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    // Block local/internal networks
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      host.startsWith('172.16.') ||
      host.endsWith('.internal') ||
      host.endsWith('.local')
    ) {
      return false;
    }
    // Allow authoritative GIMA domain
    return host === 'gim-academy.com' || host.endsWith('.gim-academy.com');
  } catch {
    return false;
  }
}

/**
 * Converts approved asset to base64 inlineData part for Gemini
 */
async function resolveAssetToPart(asset: AssetItem): Promise<{ inlineData: { mimeType: string; data: string } } | null> {
  const url = asset.url;
  if (!isApprovedAssetUrl(url)) {
    console.warn(`[Asset Security] Rejected unapproved asset URL: ${url}`);
    return null;
  }

  // Handle data URLs directly
  if (url.startsWith('data:image/')) {
    const matches = url.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (matches && matches[1] && matches[2]) {
      return {
        inlineData: {
          mimeType: matches[1],
          data: matches[2]
        }
      };
    }
  }

  // Handle approved remote HTTPS URLs
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'GIMA-AI-Studio/0.2 (Internal Marketing Suite)',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    return {
      inlineData: {
        mimeType: contentType.split(';')[0],
        data: base64
      }
    };
  } catch (err) {
    console.warn(`[Asset Fetch] Failed to resolve asset ${asset.name}:`, err);
    return null;
  }
}

/**
 * GET /api/generate-image
 * Inspects provider status and configuration without exposing secrets
 */
export async function GET(): Promise<NextResponse<ApiProviderStatus>> {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-nano-banana-2.1';
  const size = process.env.GEMINI_IMAGE_SIZE || '1K';

  return NextResponse.json({
    configured: hasKey,
    provider: 'Google Gemini',
    model,
    size,
    mode: hasKey ? 'real' : 'demo',
    message: hasKey
      ? `Gemini is configured via server environment (${model}). Real image generation active.`
      : 'GEMINI_API_KEY is not configured on the server. Operating in Deterministic Preview mode.'
  });
}

/**
 * POST /api/generate-image
 * Executes server-side GIMA knowledge retrieval, prompt composition, and Gemini image generation
 */
export async function POST(req: NextRequest): Promise<NextResponse<ApiGenerationResponse>> {
  const startTime = Date.now();

  try {
    const body: GenerationRequest = await req.json();

    // 1. Validation
    if (!body || !body.course) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Target course specification is required.',
            retryable: false
          }
        },
        { status: 400 }
      );
    }

    // 2. Server-side Knowledge Retrieval
    const brandConfig = getBrandConfig();
    let retrievedKnowledge: KnowledgeItem[] = [];

    // Prioritize Free Course PDFs when applicable
    if (body.course.toLowerCase().includes('theories') || body.campaignType === 'Free Course Promotion') {
      retrievedKnowledge = searchKnowledge(body.topic || '', { course: 'Theories of Aging' }).slice(0, 5);
    } else {
      retrievedKnowledge = getKnowledgeForCourse(body.course).slice(0, 5);
    }

    if (retrievedKnowledge.length === 0) {
      retrievedKnowledge = searchKnowledge(body.course).slice(0, 3);
    }

    // 3. Structured Prompt Composition
    const promptComposition = composeGenerationPrompt(body, brandConfig, retrievedKnowledge);
    const mappedRatio = promptComposition.mappedAspectRatio;

    // 4. Resolve Approved Reference Assets (up to 4 assets to prevent payload explosion)
    const assetParts: { inlineData: { mimeType: string; data: string } }[] = [];
    if (body.referenceImages && Array.isArray(body.referenceImages)) {
      const topAssets = body.referenceImages.slice(0, 4);
      for (const asset of topAssets) {
        const part = await resolveAssetToPart(asset);
        if (part) {
          assetParts.push(part);
        }
      }
    }

    // 5. Check API Key
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_IMAGE_MODEL || 'gemini-nano-banana-2.1';

    // If API key is not configured, return clear structured status allowing client demo fallback
    if (!apiKey || apiKey.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MISSING_API_KEY',
          message: 'Gemini is not connected yet. Configure GEMINI_API_KEY in server environment variables.',
          retryable: false
        }
      }, { status: 400 });
    }

    // 6. Execute Real Gemini Generation via @google/genai
    const ai = new GoogleGenAI({ apiKey });

    // Construct multimodal content payload
    const contents: any[] = [
      ...assetParts,
      { text: promptComposition.userPrompt }
    ];

    const targetVariations = Math.max(1, Math.min(4, body.variationsCount || 1));
    const generatedVariations: {
      id: string;
      imageDataUrl: string;
      mimeType: string;
      promptSummary?: string;
    }[] = [];

    // Controlled generation loop for requested variations
    for (let i = 0; i < targetVariations; i++) {
      try {
        console.log(`[Gemini API] Requesting variation ${i + 1}/${targetVariations} with model ${modelName}...`);

        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            responseModalities: ['IMAGE'],
            imageConfig: {
              aspectRatio: mappedRatio,
              imageSize: process.env.GEMINI_IMAGE_SIZE || '1K',
            }
          }
        });

        // Find image parts in response
        const candidate = response.candidates?.[0];
        let foundImage = false;

        if (candidate?.content?.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData && part.inlineData.data) {
              const mime = part.inlineData.mimeType || 'image/png';
              const dataUrl = `data:${mime};base64,${part.inlineData.data}`;
              generatedVariations.push({
                id: `var-${Date.now()}-${i + 1}`,
                imageDataUrl: dataUrl,
                mimeType: mime,
                promptSummary: promptComposition.summary
              });
              foundImage = true;
              break;
            }
          }
        }

        if (!foundImage) {
          console.warn(`[Gemini API] No inlineData image part found in variation ${i + 1} response.`);
        }
      } catch (callErr: any) {
        console.error(`[Gemini API] Error during generation call ${i + 1}:`, callErr);
        // If first variation failed, rethrow to be caught by outer error handler
        if (i === 0) {
          throw callErr;
        }
        // If secondary variations failed due to rate limit, stop and return what succeeded
        break;
      }
    }

    if (generatedVariations.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_IMAGE_RESPONSE',
            message: 'Gemini model did not return image data for the requested brief.',
            retryable: true
          }
        },
        { status: 502 }
      );
    }

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      provider: {
        id: 'gemini',
        model: modelName
      },
      variations: generatedVariations,
      metadata: {
        course: body.course,
        creativeType: body.creativeType,
        aspectRatio: body.aspectRatio,
        generationTimeMs: duration
      }
    });

  } catch (error: any) {
    console.error('[Generate Image Route Error]:', error);

    const errorMsg = error?.message || 'An unexpected error occurred during creative generation.';
    let errorCode = 'UNKNOWN';
    let retryable = false;

    if (errorMsg.includes('API key') || errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('unauthenticated')) {
      errorCode = 'INVALID_API_KEY';
      retryable = false;
    } else if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('rate limit')) {
      errorCode = 'RATE_LIMITED';
      retryable = true;
    } else if (errorMsg.includes('model') && (errorMsg.includes('not found') || errorMsg.includes('unsupported'))) {
      errorCode = 'MODEL_UNAVAILABLE';
      retryable = false;
    } else if (errorMsg.includes('safety') || errorMsg.includes('blocked') || errorMsg.includes('content policy')) {
      errorCode = 'CONTENT_REJECTED';
      retryable = false;
    } else if (errorMsg.includes('timeout') || errorMsg.includes('ETIMEDOUT')) {
      errorCode = 'TIMEOUT';
      retryable = true;
    } else if (errorMsg.includes('network') || errorMsg.includes('fetch failed')) {
      errorCode = 'NETWORK_ERROR';
      retryable = true;
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: errorCode,
          message: errorMsg,
          retryable
        }
      },
      { status: 500 }
    );
  }
}
