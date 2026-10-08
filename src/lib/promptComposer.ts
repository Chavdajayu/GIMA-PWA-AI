import { GenerationRequest, KnowledgeItem, BrandConfig, AspectRatioType } from './types';

export interface ComposedPromptResult {
  systemPrompt: string;
  userPrompt: string;
  mappedAspectRatio: '1:1' | '3:4' | '4:3' | '16:9' | '9:16';
  summary: string;
}

/**
 * Maps application aspect ratios to Gemini-supported aspect ratios:
 * Supported: "1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9"
 */
export function mapAspectRatioToGemini(aspectRatio: AspectRatioType): '1:1' | '3:4' | '4:3' | '16:9' | '9:16' {
  switch (aspectRatio) {
    case '1:1':
      return '1:1';
    case '4:5':
      // 3:4 is the closest supported vertical ratio for feed portrait
      return '3:4';
    case '16:9':
      return '16:9';
    case '9:16':
      return '9:16';
    case 'A4':
      // 3:4 is the closest standard aspect ratio for A4 portrait document layout
      return '3:4';
    case 'Custom':
    default:
      return '1:1';
  }
}

/**
 * Composes a structured, deterministic creative generation prompt
 * ensuring 100% adherence to authentic GIMA clinical knowledge.
 */
export function composeGenerationPrompt(
  request: GenerationRequest,
  brandConfig: BrandConfig,
  retrievedKnowledge: KnowledgeItem[]
): ComposedPromptResult {
  const mappedRatio = mapAspectRatioToGemini(request.aspectRatio);

  // Extract verified clinical topics from retrieved knowledge
  const uniqueTopics = new Set<string>();
  retrievedKnowledge.forEach((item) => {
    item.topics?.forEach((t) => uniqueTopics.add(t));
  });
  const topicsList = Array.from(uniqueTopics).slice(0, 8).join(', ');

  // Extract core summary passages (limiting length to prevent token bloat)
  const sourceSummaries = retrievedKnowledge
    .slice(0, 3)
    .map((k) => `• [${k.sourceTitle}]: ${k.summary.slice(0, 220)}...`)
    .join('\n');

  // Build style specific directives
  let styleGuidelines = '';
  switch (request.style) {
    case 'Clinical Editorial':
      styleGuidelines =
        'Deep navy foundation (#1e3a5f), restrained warm gold (#c99a2c) accents, crisp editorial typography, peer-reviewed clinical authority, clean margins, sophisticated medical journal aesthetic.';
      break;
    case 'Premium Academic':
      styleGuidelines =
        'Academic medical institution layout, dignified serif headlines, clear hierarchy, restrained color balance, scholarly elegance.';
      break;
    case 'Modern Healthcare':
      styleGuidelines =
        'Clean white medical surfaces, crisp clinical teal (#0d9488) accents, modern high-contrast typography, contemporary clinical design.';
      break;
    case 'Minimal Luxury':
      styleGuidelines =
        'Generous intentional whitespace, refined subtle borders, restrained typography, understated luxury medical aesthetic.';
      break;
    case 'Educational Infographic':
      styleGuidelines =
        'Structured layout with molecular/cellular callout accents, evidence-based focus, high visual information clarity without clutter.';
      break;
    case 'Bold Campaign':
      styleGuidelines =
        'High contrast headline hierarchy, urgent clinical relevance, dominant primary visual focal point with clear CTA container.';
      break;
  }

  const promptSections = [
    `=== ROLE & OBJECTIVE ===`,
    `You are the visual creative director for Global Integrative Medicine Academy (GIMA).`,
    `Create a premium, professional, human-designed promotional ${request.creativeType.toLowerCase()} for the campaign: "${request.campaignType}".`,
    `Target platform: ${request.platforms.join(', ')}. Target aspect ratio: ${mappedRatio} (formatted for ${request.aspectRatio}).`,
    ``,
    `=== GIMA BRAND IDENTITY & ACCREDITATION ===`,
    `Organization: ${brandConfig.brandName} (${brandConfig.acronym})`,
    `Tagline: "${brandConfig.tagline}"`,
    `Accredited Designations: ${brandConfig.accreditationDesignations.join(', ')}.`,
    `Compliance Guardrail: Designed exclusively for regulated/licensed Healthcare Professionals (Chiropractors, NDs, Nurses, MDs). Do not fabricate medical cures or miraculous claims.`,
    ``,
    `=== VERIFIED COURSE & CLINICAL KNOWLEDGE ===`,
    `Target Course: ${request.course}`,
    `Verified Clinical Topics: ${topicsList || 'Cellular metabolism, orthomolecular medicine, clinical nutrition'}`,
    `Authoritative Course Material:`,
    sourceSummaries,
    ``,
    `=== VISUAL DIRECTION & STYLE ===`,
    `Style Direction: ${request.style}`,
    `Visual Tokens: ${styleGuidelines}`,
    ``,
    `=== MANDATORY TYPOGRAPHY & COPY ===`,
    `Headline: "${request.headline}"`,
    `Call to Action (CTA): "${request.cta}"`,
    `Target Audience: "${request.audience}"`,
    `Typography Rules: High legibility, crisp rendered text, professional typographic hierarchy, no nonsensical pseudo-text. Headline must be the dominant textual element.`,
    ``,
    `=== REFERENCE ASSET INSTRUCTIONS ===`,
    request.referenceImages && request.referenceImages.length > 0
      ? `Use the provided reference image(s). Seamlessly integrate the official GIMA logo and instructor portrait (Dr. James Meschino) into the composition. Preserve the recognizable likeness, colors, and proportions of official GIMA assets.`
      : `Feature refined GIMA branding with elegant gold emblem and deep navy palette.`,
    ``,
    `=== ADMIN CUSTOM DIRECTION ===`,
    request.extraPrompt && request.extraPrompt.trim().length > 0
      ? `Director Instruction: "${request.extraPrompt.trim()}"`
      : `Director Instruction: Maintain premium medical editorial layout with balanced human-designed composition.`,
    ``,
    `=== QUALITY & NEGATIVE CONSTRAINTS ===`,
    `Strict quality rules: Avoid generic AI purple/neon aesthetics. Avoid random gradient clutter. Avoid low-resolution artifacts, illegible typography, distorted anatomy, or generic stock-photo clichés. Deliver a state-of-the-art, publication-grade promotional visual worthy of an accredited medical institution.`
  ];

  const userPrompt = promptSections.join('\n');
  const systemPrompt =
    'You are a senior clinical art director and graphic designer for Global Integrative Medicine Academy (GIMA). Generate high-resolution, authoritative educational marketing visuals with precise typography and flawless brand fidelity.';

  const summary = `${request.course} | ${request.style} | ${request.creativeType} (${mappedRatio}) | Target: ${request.audience.slice(0, 40)}`;

  return {
    systemPrompt,
    userPrompt,
    mappedAspectRatio: mappedRatio,
    summary,
  };
}
