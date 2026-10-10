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
import {
  composeGenerationPrompt,
  mapAspectRatioToGemini,
  composePollinationsImagePrompt
} from '@/lib/promptComposer';
import { composeFreeBackgroundPrompt } from '@/lib/freePromptComposer';

export const runtime = 'nodejs';
export const maxDuration = 120; // 120s max duration for serverless compute on Vercel

/**
 * Validates and sanitizes asset URLs to prevent SSRF
 */
function isApprovedAssetUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  if (
    url.startsWith('data:image/png;base64,') ||
    url.startsWith('data:image/jpeg;base64,') ||
    url.startsWith('data:image/jpg;base64,') ||
    url.startsWith('data:image/webp;base64,')
  ) {
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
 * Converts approved asset to base64 inlineData part
 */
async function resolveAssetToPart(asset: AssetItem): Promise<{ inlineData: { mimeType: string; data: string } } | null> {
  const url = asset.url;
  if (!isApprovedAssetUrl(url)) {
    console.warn(`[Asset Security] Rejected unapproved asset URL: ${url}`);
    return null;
  }

  if (url.startsWith('data:')) {
    const matches = url.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      return {
        inlineData: {
          mimeType: matches[1],
          data: matches[2]
        }
      };
    }
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'GIMA-AI-Studio/1.0' }
    });
    clearTimeout(timeout);

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
 * Maps aspect ratio to pixel dimensions for Pollinations API
 */
function mapAspectRatioToPixelSize(aspectRatio: string): { width: number; height: number; sizeStr: string } {
  switch (aspectRatio) {
    case '1:1':
      return { width: 1024, height: 1024, sizeStr: '1024x1024' };
    case '4:5':
      return { width: 1024, height: 1280, sizeStr: '1024x1280' };
    case '16:9':
      return { width: 1280, height: 720, sizeStr: '1280x720' };
    case '9:16':
      return { width: 720, height: 1280, sizeStr: '720x1280' };
    case 'A4':
      return { width: 1024, height: 1448, sizeStr: '1024x1448' };
    default:
      return { width: 1024, height: 1024, sizeStr: '1024x1024' };
  }
}

/**
 * GET /api/generate-image
 * Inspects provider status and configuration without exposing secrets
 */
export async function GET(): Promise<NextResponse<ApiProviderStatus>> {
  const hasPollinations = Boolean(process.env.POLLINATIONS_API_KEY && process.env.POLLINATIONS_API_KEY.trim().length > 0);
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN?.trim();
  const hasCloudflare = Boolean(cloudflareAccountId && cloudflareApiToken);
  const cloudflareModel = process.env.CLOUDFLARE_IMAGE_MODEL?.trim() || '@cf/black-forest-labs/flux-2-klein-9b';

  let pollinationsBalance: number | undefined;
  if (hasPollinations) {
    try {
      const bRes = await fetch('https://gen.pollinations.ai/account/balance', {
        headers: { Authorization: `Bearer ${process.env.POLLINATIONS_API_KEY}` },
        cache: 'no-store'
      });
      if (bRes.ok) {
        const bData = await bRes.json();
        pollinationsBalance = typeof bData.balance === 'number' ? bData.balance : bData.accountBalance?.total;
      }
    } catch {}
  }

  const defaultPollinationsModel = process.env.POLLINATIONS_IMAGE_MODEL || 'tongyi-mai/z-image-turbo';

  let statusMessage = '';
  if (hasCloudflare) {
    statusMessage = `Cloudflare Workers AI is active (${cloudflareModel}) • Free daily allowance (10,000 Neurons/day ~7 free images/day with FLUX.2 Klein 9B).`;
  } else if (hasPollinations) {
    statusMessage = `Pollinations AI is active (${defaultPollinationsModel}${typeof pollinationsBalance === 'number' ? `, Balance: ${pollinationsBalance} Pollen` : ''}). Real image generation ready.`;
  } else if (hasGemini) {
    statusMessage = 'Gemini API key is configured. Google Free Tier limits image model requests to 0. Gemini Pro Web Handoff is active.';
  } else {
    statusMessage = 'No API key configured on server. Operating in Demo Preview mode.';
  }

  return NextResponse.json({
    configured: hasCloudflare || hasPollinations || hasGemini,
    provider: hasCloudflare ? 'Cloudflare Workers AI' : (hasPollinations ? 'Pollinations AI' : 'Google Gemini'),
    model: hasCloudflare ? cloudflareModel : (hasPollinations ? defaultPollinationsModel : (process.env.GEMINI_IMAGE_MODEL || 'gemini-nano-banana-2.1')),
    size: '1024x1024',
    mode: (hasCloudflare || hasPollinations || hasGemini) ? 'real' : 'demo',
    imageQuotaAvailable: hasCloudflare || hasPollinations,
    recommendedMode: hasCloudflare ? 'free-models' : (hasPollinations ? 'pollinations' : 'gemini-web-handoff'),
    pollinationsConfigured: hasPollinations,
    pollinationsBalance,
    cloudflareConfigured: hasCloudflare,
    cloudflareModel,
    cloudflareDailyQuota: '10,000 Neurons/day included on Free plan (~7 images/day with FLUX.2 Klein 9B)',
    message: statusMessage,
  });
}

/**
 * POST /api/generate-image
 * Executes server-side GIMA knowledge retrieval, prompt composition, and real image generation
 */
export async function POST(req: NextRequest): Promise<NextResponse<ApiGenerationResponse>> {
  const startTime = Date.now();

  try {
    const body: GenerationRequest & { provider?: string; model?: string } = await req.json();

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

    // Determine target provider:
    const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
    const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN?.trim();
    const hasCloudflare = Boolean(cloudflareAccountId && cloudflareApiToken);
    const pollinationsKey = process.env.POLLINATIONS_API_KEY?.trim();

    // ========================================================
    // PATH 0: CLOUDFLARE WORKERS AI (FLUX.2 KLEIN 9B / 4B / FLUX.1 SCHNELL)
    // Zero out-of-pocket cost via included 10,000 Neurons/day free allowance
    // ========================================================
    if (body.provider === 'cloudflare' || (body.provider === 'free-models' && hasCloudflare)) {
      if (!hasCloudflare) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'MISSING_CLOUDFLARE_CREDENTIALS',
              message: 'Cloudflare Workers AI credentials missing. Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in .env.local to enable FLUX.2 Klein 9B (~7 free images/day on Free Plan).',
              retryable: false,
            },
          },
          { status: 400 }
        );
      }

      const defaultCfModel = process.env.CLOUDFLARE_IMAGE_MODEL?.trim() || '@cf/black-forest-labs/flux-2-klein-9b';
      const selectedCfModel = (body.model?.startsWith('@cf/') ? body.model : defaultCfModel).trim();
      const pixelSize = mapAspectRatioToPixelSize(body.aspectRatio);

      const isSpecificVariation = typeof body.variationIndex === 'number';
      const targetIndices: number[] = isSpecificVariation
        ? [body.variationIndex as number]
        : Array.from({ length: Math.max(1, Math.min(4, body.variationsCount || 1)) }, (_, i) => i);

      console.log(`[Cloudflare Workers AI] Generating ${targetIndices.length} variation(s) using model: ${selectedCfModel}`);

      const generateSingleCf = async (idx: number) => {
        const { prompt: cleanPrompt, summary: promptSummary } = composeFreeBackgroundPrompt(
          body,
          brandConfig,
          retrievedKnowledge,
          idx
        );

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 90000);

        try {
          const formData = new FormData();
          formData.append('prompt', cleanPrompt);
          formData.append('width', pixelSize.width.toString());
          formData.append('height', pixelSize.height.toString());

          const cfRes = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/ai/run/${selectedCfModel}`,
            {
              method: 'POST',
              signal: controller.signal,
              headers: {
                Authorization: `Bearer ${cloudflareApiToken}`,
                'User-Agent': 'GIMA-AI-Studio/1.0',
              },
              body: formData,
            }
          );
          clearTimeout(timeout);

          if (!cfRes.ok) {
            const errText = await cfRes.text();
            let parsedErr: any = null;
            try { parsedErr = JSON.parse(errText); } catch {}
            const msg = parsedErr?.errors?.[0]?.message || parsedErr?.error || errText || `Cloudflare error (HTTP ${cfRes.status})`;

            if (cfRes.status === 401 || cfRes.status === 403) {
              throw new Error(`INVALID_API_KEY: Cloudflare API token or Account ID was rejected. Check CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID in .env.local.`);
            } else if (cfRes.status === 429) {
              throw new Error(`RATE_LIMITED: Cloudflare daily free allowance reached (10,000 Neurons/day). Quota resets at 00:00 UTC.`);
            } else {
              throw new Error(`CLOUDFLARE_ERROR (${cfRes.status}): ${msg}`);
            }
          }

          const contentType = cfRes.headers.get('content-type') || '';
          let imageDataUrl = '';

          if (contentType.includes('application/json')) {
            const json = await cfRes.json();
            const b64 = json.result?.image || json.result;
            if (!b64) throw new Error('Cloudflare JSON response contained no image data');
            imageDataUrl = b64.startsWith('data:') ? b64 : `data:image/png;base64,${b64}`;
          } else {
            const buffer = await cfRes.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            const mime = contentType.split(';')[0] || 'image/png';
            imageDataUrl = `data:${mime};base64,${base64}`;
          }

          return {
            id: `var-cf-${Date.now()}-${idx + 1}`,
            imageUrl: imageDataUrl,
            imageDataUrl,
            mimeType: 'image/png',
            width: pixelSize.width,
            height: pixelSize.height,
            promptSummary,
          };
        } finally {
          clearTimeout(timeout);
        }
      };

      const settleResults = await Promise.allSettled(targetIndices.map((idx) => generateSingleCf(idx)));
      const generatedVariations: any[] = [];
      let firstError: Error | null = null;

      for (const res of settleResults) {
        if (res.status === 'fulfilled') {
          generatedVariations.push(res.value);
        } else if (!firstError) {
          firstError = res.reason;
        }
      }

      if (generatedVariations.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'GENERATION_FAILED',
              message: firstError?.message || 'Cloudflare Workers AI did not return image data.',
              retryable: true,
            },
          },
          { status: 502 }
        );
      }

      const duration = Date.now() - startTime;
      return NextResponse.json({
        success: true,
        provider: {
          id: 'cloudflare',
          model: selectedCfModel,
        },
        variations: generatedVariations,
        metadata: {
          course: body.course,
          creativeType: body.creativeType,
          aspectRatio: body.aspectRatio,
          generationTimeMs: duration,
        },
      });
    }

    const usePollinations = (body.provider === 'pollinations' || body.provider === 'free-models' || (!body.provider && Boolean(pollinationsKey))) && Boolean(pollinationsKey);

    // ========================================================
    // PATH A: POLLINATIONS REAL IMAGE GENERATION (PHASE 3 / 3.1)
    // ========================================================
    if (usePollinations && pollinationsKey) {
      const selectedModel = (body.model || process.env.POLLINATIONS_IMAGE_MODEL || 'tongyi-mai/z-image-turbo').trim();
      const pixelSize = mapAspectRatioToPixelSize(body.aspectRatio);

      // Check if this request is for a specific variation index (from progressive client)
      const isSpecificVariation = typeof body.variationIndex === 'number';
      const targetIndices: number[] = isSpecificVariation
        ? [body.variationIndex as number]
        : Array.from({ length: Math.max(1, Math.min(4, body.variationsCount || 1)) }, (_, i) => i);

      console.log(`[Pollinations API] Generating ${targetIndices.length} variation(s) (indices: ${targetIndices.join(',')}) using model: ${selectedModel}`);

      // Helper function to generate a single variation
      const generateSingle = async (idx: number) => {
        const isFreeMode = body.provider === 'free-models' || selectedModel.toLowerCase().includes('sdxl-lightning-free');
        const { prompt: cleanPrompt, summary: promptSummary } = isFreeMode
          ? composeFreeBackgroundPrompt(body, brandConfig, retrievedKnowledge, idx)
          : composePollinationsImagePrompt(body, brandConfig, retrievedKnowledge, idx);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 90000); // 90s generous timeout guard

        try {
          const reqPayload: any = {
            model: selectedModel,
            prompt: cleanPrompt,
            n: 1,
            size: pixelSize.sizeStr,
            response_format: 'url',
          };

          const pollRes = await fetch('https://gen.pollinations.ai/v1/images/generations', {
            method: 'POST',
            signal: controller.signal,
            headers: {
              Authorization: `Bearer ${pollinationsKey}`,
              'Content-Type': 'application/json',
              'User-Agent': 'GIMA-AI-Studio/1.0',
            },
            body: JSON.stringify(reqPayload),
          });
          clearTimeout(timeout);

          if (!pollRes.ok) {
            const errText = await pollRes.text();
            let parsedErr: any = null;
            try { parsedErr = JSON.parse(errText); } catch {}
            const msg = parsedErr?.error?.message || parsedErr?.message || errText || `Pollinations error (HTTP ${pollRes.status})`;

            if (pollRes.status === 401) {
              throw new Error(`INVALID_API_KEY: Pollinations API key was rejected. Verify server configuration.`);
            } else if (pollRes.status === 402) {
              throw new Error(`INSUFFICIENT_BALANCE: Your Pollinations balance is insufficient. Current balance can be viewed in Settings.`);
            } else if (pollRes.status === 429) {
              throw new Error(`RATE_LIMITED: Pollinations rate limit exceeded. Please wait a moment.`);
            } else if (pollRes.status === 404) {
              throw new Error(`MODEL_NOT_FOUND: Model "${selectedModel}" is unavailable in Pollinations catalog.`);
            } else {
              throw new Error(`POLLINATIONS_ERROR (${pollRes.status}): ${msg}`);
            }
          }

          const pollData = await pollRes.json();
          const item = pollData.data?.[0];

          let imageUrl: string | null = null;
          let imageDataUrl: string | null = null;

          if (item?.url) {
            imageUrl = item.url;
            imageDataUrl = item.url;
          } else if (item?.b64_json) {
            imageDataUrl = `data:image/png;base64,${item.b64_json}`;
            imageUrl = imageDataUrl;
          }

          if (!imageUrl && !imageDataUrl) {
            throw new Error(`NO_IMAGE_DATA: Pollinations returned empty image payload for variation ${idx + 1}.`);
          }

          return {
            id: `var-poll-${Date.now()}-${idx + 1}`,
            imageUrl: imageUrl || imageDataUrl!,
            imageDataUrl: imageDataUrl || imageUrl!,
            mimeType: item?.media_type || 'image/jpeg',
            width: pixelSize.width,
            height: pixelSize.height,
            promptSummary,
          };
        } finally {
          clearTimeout(timeout);
        }
      };

      // Run variations concurrently with Promise.allSettled
      const settleResults = await Promise.allSettled(targetIndices.map((idx) => generateSingle(idx)));

      const generatedVariations: {
        id: string;
        imageUrl?: string;
        imageDataUrl: string;
        mimeType: string;
        width?: number;
        height?: number;
        promptSummary?: string;
      }[] = [];

      let firstError: Error | null = null;
      for (const res of settleResults) {
        if (res.status === 'fulfilled') {
          generatedVariations.push(res.value);
        } else if (!firstError) {
          firstError = res.reason;
        }
      }

      if (generatedVariations.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'GENERATION_FAILED',
              message: firstError?.message || 'Pollinations did not return image data for the requested prompt.',
              retryable: true,
            },
          },
          { status: 502 }
        );
      }

      const duration = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        provider: {
          id: 'pollinations',
          model: selectedModel,
        },
        variations: generatedVariations,
        metadata: {
          course: body.course,
          creativeType: body.creativeType,
          aspectRatio: body.aspectRatio,
          generationTimeMs: duration,
        },
      });
    }

    // ========================================================
    // PATH B: GOOGLE GEMINI API GENERATION (PHASE 2)
    // ========================================================
    // 4. Resolve Approved Reference Assets (up to 4 assets)
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

    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_IMAGE_MODEL || 'gemini-nano-banana-2.1';

    if (!apiKey || apiKey.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_API_KEY',
            message: 'Neither Pollinations nor Gemini API key is configured. Use Gemini Pro Web Handoff or Demo Preview.',
            retryable: false,
          },
        },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
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
            },
          },
        });

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
                promptSummary: promptComposition.summary,
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
        if (i === 0) {
          throw callErr;
        }
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
            retryable: true,
          },
        },
        { status: 502 }
      );
    }

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      provider: {
        id: 'gemini',
        model: modelName,
      },
      variations: generatedVariations,
      metadata: {
        course: body.course,
        creativeType: body.creativeType,
        aspectRatio: body.aspectRatio,
        generationTimeMs: duration,
      },
    });
  } catch (error: any) {
    console.error('[Generate Image Route Error]:', error);

    let displayMessage = error?.message || 'An unexpected error occurred during creative generation.';
    try {
      if (typeof displayMessage === 'string' && displayMessage.trim().startsWith('{')) {
        const parsed = JSON.parse(displayMessage);
        if (parsed?.error?.message) {
          displayMessage = parsed.error.message;
        }
      }
    } catch {}

    let errorCode = 'UNKNOWN';
    let retryable = false;

    if (displayMessage.includes('INVALID_API_KEY') || displayMessage.includes('API key') || displayMessage.includes('unauthenticated')) {
      errorCode = 'INVALID_API_KEY';
      if (displayMessage.includes('Cloudflare')) {
        displayMessage = 'Cloudflare API token or Account ID was rejected. Check CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID in .env.local.';
      } else {
        displayMessage = 'API key is invalid or not authorized. Check your configuration in .env.local.';
      }
      retryable = false;
    } else if (displayMessage.includes('INSUFFICIENT_BALANCE') || displayMessage.includes('402')) {
      errorCode = 'INSUFFICIENT_BALANCE';
      displayMessage = 'Your Pollinations account balance is insufficient for image generation. Check balance in Settings.';
      retryable = false;
    } else if (displayMessage.includes('429') || displayMessage.includes('quota') || displayMessage.includes('rate limit') || displayMessage.includes('RESOURCE_EXHAUSTED')) {
      errorCode = 'RATE_LIMITED';
      if (displayMessage.includes('Cloudflare')) {
        displayMessage = 'Cloudflare daily free allowance reached (10,000 Neurons/day). Quota resets at 00:00 UTC.';
      } else if (displayMessage.includes('limit: 0')) {
        displayMessage = 'Google Gemini image generation model has quota limit: 0 on Free-Tier projects. Switch to Pollinations AI or Gemini Pro Web Handoff.';
      } else {
        displayMessage = 'Rate limit exceeded. Please retry in a moment or switch to Gemini Pro Web Handoff.';
      }
      retryable = true;
    } else if (displayMessage.includes('MODEL_NOT_FOUND') || displayMessage.includes('model')) {
      errorCode = 'MODEL_UNAVAILABLE';
      displayMessage = 'Selected model is unavailable. Choose another model from the live catalog.';
      retryable = false;
    } else if (displayMessage.includes('timeout') || displayMessage.includes('ETIMEDOUT')) {
      errorCode = 'TIMEOUT';
      retryable = true;
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: errorCode,
          message: displayMessage,
          retryable,
        },
      },
      { status: 500 }
    );
  }
}
