import { PollinationsModelItem } from './types';

export interface RankedModelItem extends PollinationsModelItem {
  rank: number;
  qualityCategory: 'Premium' | 'High Quality' | 'Balanced' | 'Fast Draft' | 'Free';
  costPerImageEstimate: number | null; // null if variable or unknown
  costEstimateText: string;
  isZeroPrice: boolean;
  referenceSupportText: string;
  matchReason?: string;
}

/**
 * Curated GIMA Image Quality Ranking Patterns (highest recommended quality first)
 * Rule: Match against canonical model ID, name, or aliases from live catalog.
 */
const GIMA_QUALITY_PRIORITY: {
  pattern: RegExp;
  category: 'Premium' | 'High Quality' | 'Balanced' | 'Fast Draft';
  qualityNote: string;
}[] = [
  // 1. OpenAI GPT Image 2.5 Sunburst
  {
    pattern: /gpt-image-2\.5-sunburst/i,
    category: 'Premium',
    qualityNote: 'Flagship photorealistic clinical fidelity & balanced prompt adherence',
  },
  // 2. Gemini 3 Pro Image (Nano Banana Pro)
  {
    pattern: /(gemini-3-pro-image|nano-banana-pro)/i,
    category: 'Premium',
    qualityNote: 'Studio-grade typographic rendering & academic medical hierarchy',
  },
  // 3. Ideogram 4.0/4.5 Quality
  {
    pattern: /ideogram.*quality/i,
    category: 'Premium',
    qualityNote: 'Industry-leading poster typography, layout margins & clean text',
  },
  // 4. OpenAI GPT Image 2.5 Flare
  {
    pattern: /gpt-image-2\.5-flare/i,
    category: 'Premium',
    qualityNote: 'High visual dynamic range, crisp medical accents & contrast',
  },
  // 5. Seedream 5.0 Pro
  {
    pattern: /seedream-5\.0-pro/i,
    category: 'Premium',
    qualityNote: 'Refined editorial composition & clinical healthcare realism',
  },
  // 6. FLUX.2 Max
  {
    pattern: /flux\.2-max/i,
    category: 'High Quality',
    qualityNote: 'Maximum diffusion parameter capacity with high asset fidelity',
  },
  // 7. Microsoft MAI Image 2.6
  {
    pattern: /mai-image-2\.6(?!-flash)/i,
    category: 'High Quality',
    qualityNote: 'Enterprise medical aesthetic with natural skin tones & lighting',
  },
  // 8. Recraft V4.1 Pro Vector
  {
    pattern: /recraft-v4\.1-vector/i,
    category: 'High Quality',
    qualityNote: 'Exceptional brand iconography, vector clean lines & infographics',
  },
  // 9. Gemini 3.1 Flash Image (Nano Banana 2)
  {
    pattern: /(gemini-3\.1-flash-image|nano-banana-2(?!-lite))/i,
    category: 'High Quality',
    qualityNote: 'Fast high-definition multimodal visual generation with clinical precision',
  },
  // 10. FLUX.2 Pro
  {
    pattern: /flux\.2-pro/i,
    category: 'High Quality',
    qualityNote: 'Balanced professional output with faithful aspect-ratio composition',
  },
  // 11. OpenAI GPT Image 2
  {
    pattern: /gpt-image-2$/i,
    category: 'High Quality',
    qualityNote: 'Consistent multimodal styling with verified reference conditioning',
  },
  // 12. FLUX.1.1 Pro
  {
    pattern: /flux\.1\.1-pro/i,
    category: 'High Quality',
    qualityNote: 'Established clinical editorial foundation with dependable contrast',
  },
  // 13. Ideogram 4.0 Balanced
  {
    pattern: /ideogram.*balanced/i,
    category: 'Balanced',
    qualityNote: 'Balanced typography with moderate generation latency',
  },
  // 14. Recraft V4.1 Flash
  {
    pattern: /recraft.*flash/i,
    category: 'Balanced',
    qualityNote: 'Fast vector & clinical badge layout rendering',
  },
  // 15. MAI Image 2.6 Flash
  {
    pattern: /mai-image-2\.6-flash/i,
    category: 'Fast Draft',
    qualityNote: 'Rapid draft generation with single reference image support',
  },
  // 16. Z-Image Turbo
  {
    pattern: /z-image-turbo/i,
    category: 'Fast Draft',
    qualityNote: 'Ultra-fast draft ideation (~9s) with minimal Pollen consumption',
  },
  // 17. FLUX.1 Schnell
  {
    pattern: /flux\.1-schnell/i,
    category: 'Fast Draft',
    qualityNote: 'Budget-friendly 4-step diffusion for rapid concept exploration',
  },
];

/**
 * Parses live catalog pricing metadata and calculates estimated Pollen cost per image.
 * Uses Pollen currency exclusively (never tokens).
 */
export function parseModelPricing(pricing: any): {
  costPerImage: number | null;
  displayCostText: string;
  isZeroPrice: boolean;
} {
  if (!pricing) {
    return {
      costPerImage: null,
      displayCostText: 'Variable (usage-based)',
      isZeroPrice: false,
    };
  }

  // Check for explicit zero price
  const compVal = pricing.completionImageTokens ? Number(pricing.completionImageTokens) : null;
  const promptVal = pricing.promptTextTokens ? Number(pricing.promptTextTokens) : null;

  if (compVal === 0 && (promptVal === 0 || promptVal === null)) {
    return {
      costPerImage: 0,
      displayCostText: 'Free (0 Pollen)',
      isZeroPrice: true,
    };
  }

  // Flat per-image cost in Pollen (e.g. "0.03", "0.004", "0.1", "0.09")
  if (compVal !== null && !isNaN(compVal) && compVal >= 0.0005) {
    let formatted: string;
    if (compVal >= 0.1) {
      formatted = `${compVal.toFixed(2)} Pollen/image`;
    } else if (compVal >= 0.01) {
      formatted = `${compVal.toFixed(3).replace(/0$/, '')} Pollen/image`;
    } else {
      formatted = `${compVal.toFixed(4).replace(/0+$/, '')} Pollen/image`;
    }
    return {
      costPerImage: compVal,
      displayCostText: formatted,
      isZeroPrice: false,
    };
  }

  // Token-based multimodal pricing (e.g. OpenAI GPT Image 2 where completionImageTokens = 0.0000225)
  if (promptVal !== null && compVal !== null) {
    // Typical prompt ~1000 tokens + typical image generation tokens
    // Approximate typical baseline usage in Pollen
    const typicalPollen = 0.035;
    return {
      costPerImage: typicalPollen,
      displayCostText: '~0.035 Pollen (Usage-based)',
      isZeroPrice: false,
    };
  }

  return {
    costPerImage: null,
    displayCostText: 'Variable (usage-based)',
    isZeroPrice: false,
  };
}

/**
 * Checks if a live model qualifies as a verified zero-cost model under current catalog terms.
 */
export function isVerifiedZeroCostModel(model: PollinationsModelItem): boolean {
  if (model.paidOnly === true) return false;
  if (!model.pricing) return false;
  
  const comp = model.pricing.completionImageTokens;
  const prompt = model.pricing.promptTextTokens;
  
  if (comp !== undefined && Number(comp) === 0 && (prompt === undefined || Number(prompt) === 0)) {
    return true;
  }
  
  // Model explicitly designated as free without image tokens
  if (model.id.toLowerCase().includes('free') && (!comp || Number(comp) === 0)) {
    return true;
  }

  return false;
}

/**
 * Applies GIMA Quality Ranking to raw live models from Pollinations.
 * Guaranteed to keep canonical IDs and aliases from the actual live catalog.
 */
export function rankPollinationsModels(liveModels: PollinationsModelItem[]): RankedModelItem[] {
  // Only keep models that actually output images and not pure video
  const imageModels = liveModels.filter((m) => {
    const outs = m.outputModalities || ['image'];
    return outs.includes('image') && !outs.includes('video');
  });

  const matchedRanked: RankedModelItem[] = [];
  const unmatched: PollinationsModelItem[] = [...imageModels];

  // Match curated priority list in exact rank order
  for (const prio of GIMA_QUALITY_PRIORITY) {
    const foundIdx = unmatched.findIndex((m) => {
      const matchId = prio.pattern.test(m.id);
      const matchName = prio.pattern.test(m.name);
      const matchAlias = m.aliases?.some((a) => prio.pattern.test(a));
      return matchId || matchName || matchAlias;
    });

    if (foundIdx !== -1) {
      const model = unmatched.splice(foundIdx, 1)[0];
      const pricing = parseModelPricing(model.pricing);
      const isZero = isVerifiedZeroCostModel(model);

      matchedRanked.push({
        ...model,
        rank: matchedRanked.length + 1,
        qualityCategory: isZero ? 'Free' : prio.category,
        costPerImageEstimate: pricing.costPerImage,
        costEstimateText: pricing.displayCostText,
        isZeroPrice: isZero,
        referenceSupportText: model.supportsReferenceImages
          ? `Reference images supported (${model.maxReferenceImages || 'multi'})`
          : 'Text-to-image only (Reference assets styling guides prompt)',
      });
    }
  }

  // Append remaining valid live image models in balanced order
  for (const model of unmatched) {
    const pricing = parseModelPricing(model.pricing);
    const isZero = isVerifiedZeroCostModel(model);
    let category: 'Premium' | 'High Quality' | 'Balanced' | 'Fast Draft' | 'Free' = 'Balanced';

    if (isZero) {
      category = 'Free';
    } else if (model.id.includes('turbo') || model.id.includes('schnell') || model.id.includes('fast')) {
      category = 'Fast Draft';
    } else if (model.id.includes('pro') || model.id.includes('quality') || model.id.includes('max')) {
      category = 'High Quality';
    }

    matchedRanked.push({
      ...model,
      rank: matchedRanked.length + 1,
      qualityCategory: category,
      costPerImageEstimate: pricing.costPerImage,
      costEstimateText: pricing.displayCostText,
      isZeroPrice: isZero,
      referenceSupportText: model.supportsReferenceImages
        ? `Reference images supported (${model.maxReferenceImages || 'multi'})`
        : 'Text-to-image only (Reference assets styling guides prompt)',
    });
  }

  return matchedRanked;
}

/**
 * Calculates pre-generation Pollen cost estimation for N variations.
 */
export function calculatePreGenerationCost(
  model: RankedModelItem | null,
  variationsCount: number,
  availableBalance: number | null
): {
  perImagePollen: number | null;
  perImageText: string;
  totalPollen: number | null;
  totalText: string;
  remainingPollen: number | null;
  remainingText: string;
  isSufficientBalance: boolean;
  isVariable: boolean;
} {
  if (!model || model.costPerImageEstimate === null) {
    return {
      perImagePollen: null,
      perImageText: model?.costEstimateText || 'Variable (usage-based)',
      totalPollen: null,
      totalText: 'Variable — final usage depends on generation',
      remainingPollen: availableBalance,
      remainingText: availableBalance !== null ? `${availableBalance.toFixed(4)} Pollen` : 'Unknown',
      isSufficientBalance: availableBalance === null ? true : availableBalance > 0.005,
      isVariable: true,
    };
  }

  const perImage = model.costPerImageEstimate;
  const total = perImage * Math.max(1, variationsCount);
  const remaining = availableBalance !== null ? availableBalance - total : null;
  const isSufficient = availableBalance === null || remaining === null || remaining >= 0;

  return {
    perImagePollen: perImage,
    perImageText: `${perImage.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')} Pollen`,
    totalPollen: total,
    totalText: `${total.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')} Pollen`,
    remainingPollen: remaining,
    remainingText: remaining !== null ? `${Math.max(0, remaining).toFixed(4)} Pollen` : 'Unknown',
    isSufficientBalance: isSufficient,
    isVariable: false,
  };
}
