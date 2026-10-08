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
    `Create a premium, professional, human-designed promotional ${(request.creativeType || 'Creative').toLowerCase()} for the campaign: "${request.campaignType || 'Promotion'}".`,
    `Target platform: ${Array.isArray(request.platforms) ? request.platforms.join(', ') : (request.platforms || 'Instagram')}. Target aspect ratio: ${mappedRatio} (formatted for ${request.aspectRatio || '1:1'}).`,
    ``,
    `=== GIMA BRAND IDENTITY & ACCREDITATION ===`,
    `Organization: ${brandConfig.brandName} (${brandConfig.acronym})`,
    `Tagline: "${brandConfig.tagline}"`,
    `Accredited Designations: ${(brandConfig.accreditationDesignations || []).join(', ')}.`,
    `Compliance Guardrail: Designed exclusively for regulated/licensed Healthcare Professionals (Chiropractors, NDs, Nurses, MDs). Do not fabricate medical cures or miraculous claims.`,
    ``,
    `=== VERIFIED COURSE & CLINICAL KNOWLEDGE ===`,
    `Target Course: ${request.course}`,
    `Verified Clinical Topics: ${topicsList || 'Cellular metabolism, orthomolecular medicine, clinical nutrition'}`,
    `Authoritative Course Material:`,
    sourceSummaries,
    ``,
    `=== VISUAL DIRECTION & STYLE ===`,
    `Style Direction: ${request.style || 'Clinical Editorial'}`,
    `Visual Tokens: ${styleGuidelines}`,
    ``,
    `=== MANDATORY TYPOGRAPHY & COPY ===`,
    `Headline: "${request.headline || 'Excellence in Integrative Medicine'}"`,
    `Call to Action (CTA): "${request.cta || 'Learn More'}"`,
    `Target Audience: "${request.audience || 'Healthcare Professionals'}"`,
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

  const summary = `${request.course} | ${request.style || 'Clinical Editorial'} | ${request.creativeType || 'Creative'} (${mappedRatio}) | Target: ${(request.audience || 'Healthcare Professionals').slice(0, 40)}`;

  return {
    systemPrompt,
    userPrompt,
    mappedAspectRatio: mappedRatio,
    summary,
  };
}

/**
 * Summarizes the concise titles/filenames of retrieved knowledge sources
 * for display in the Gemini Handoff Ready panel.
 */
export function getKnowledgeSourcesSummary(retrievedKnowledge: KnowledgeItem[]): string[] {
  if (!retrievedKnowledge || retrievedKnowledge.length === 0) {
    return ['GIMA Curriculum Foundation', 'Official Website Data'];
  }
  const sources = new Set<string>();
  retrievedKnowledge.forEach((k) => {
    if (k.documentName) {
      sources.add(k.documentName);
    } else if (k.sourceTitle) {
      sources.add(k.sourceTitle);
    }
  });
  return Array.from(sources).slice(0, 5);
}

/**
 * Builds the authoritative, structured Gemini Pro Web Handoff prompt.
 * Ready for one-click copy & paste into gemini.google.com/app.
 * Does NOT contain any secrets or API keys.
 */
export function buildGeminiWebPrompt(
  request: GenerationRequest,
  brandConfig: BrandConfig,
  retrievedKnowledge: KnowledgeItem[],
  variationStyleOverride?: string
): string {
  const mappedRatio = mapAspectRatioToGemini(request.aspectRatio);
  const platforms = Array.isArray(request.platforms) ? request.platforms.join(', ') : (request.platforms || 'Instagram');
  const activeStyle = variationStyleOverride || request.style || 'Clinical Editorial';

  // Extract verified clinical topics from retrieved knowledge
  const uniqueTopics = new Set<string>();
  retrievedKnowledge.forEach((item) => {
    item.topics?.forEach((t) => uniqueTopics.add(t));
  });
  const topicsList = Array.from(uniqueTopics).slice(0, 8).join(', ');

  // Extract core summary passages (limiting length to prevent token bloat)
  const sourceSummaries = retrievedKnowledge
    .slice(0, 3)
    .map((k) => `• [${k.documentName || k.sourceTitle}]: ${k.summary.slice(0, 240)}...`)
    .join('\n');

  // Reference direction text
  let referenceDesc = 'Feature refined GIMA branding with elegant gold emblem and deep navy palette.';
  if (request.referenceImages && request.referenceImages.length > 0) {
    const assetNames = request.referenceImages.map((a) => a.name).join(' & ');
    referenceDesc = `Incorporate provided GIMA reference asset(s): ${assetNames}. Maintain recognizable likeness, logo geometry, and proportion of official GIMA seal and Dr. James Meschino portrait.`;
  }

  const promptSections = [
    `=== ROLE ===`,
    `You are creating a professional marketing visual for Global Integrative Medicine Academy (GIMA).`,
    ``,
    `=== SOURCE (AUTHORITATIVE GIMA CLINICAL MATERIAL) ===`,
    `Use only the verified GIMA curriculum information supplied below:`,
    `Target Course: ${request.course}`,
    `Verified Clinical Topics: ${topicsList || 'Cellular metabolism, longevity pathways, orthomolecular medicine, clinical nutrition'}`,
    `Authoritative Material:`,
    sourceSummaries || `• Global Integrative Medicine Academy (GIMA) ROHP Clinical Nutrition Program`,
    ``,
    `=== OBJECTIVE & AUDIENCE ===`,
    `Campaign Objective: ${request.campaignType || 'Course Promotion'}`,
    `Target Audience: ${request.audience || 'Licensed Healthcare Professionals (Chiropractors, NDs, MDs, Registered Dietitians, Nutritionists)'}`,
    ``,
    `=== FORMAT & ASPECT RATIO ===`,
    `Platform: ${platforms}`,
    `Format: ${request.aspectRatio || '4:5'} aspect ratio (Render as ${mappedRatio} composition)`,
    `Creative Type: ${request.creativeType || 'Promotional Poster'}`,
    ``,
    `=== STYLE & VISUAL DIRECTION ===`,
    `Visual Style: ${activeStyle}`,
    `Visual Tokens: Deep navy foundation (#1e3a5f), restrained warm gold accents, clean clinical margins, high-contrast typography, peer-reviewed clinical journal elegance.`,
    ``,
    `=== MANDATORY TEXT & COPY ===`,
    `Headline: "${request.headline || `Master ${request.course} with GIMA`}"`,
    `Call to Action (CTA): "${request.cta || 'Enroll in Free Course'}"`,
    `Typography Hierarchy: Crisp, legible typography. The headline must be the dominant textual element. No nonsensical pseudo-text.`,
    ``,
    `=== BRAND IDENTITY ===`,
    `Organization: ${brandConfig.brandName} (${brandConfig.acronym})`,
    `Tagline: "${brandConfig.tagline}"`,
    `Accreditations: ${(brandConfig.accreditationDesignations || []).join(', ')}`,
    `Preserve the supplied GIMA identity and logo.`,
    ``,
    `=== REFERENCE DIRECTION ===`,
    referenceDesc,
    ``,
    `=== ADMIN CREATIVE DIRECTION ===`,
    request.extraPrompt && request.extraPrompt.trim().length > 0
      ? `"${request.extraPrompt.trim()}"`
      : `Create a premium, professional promotional poster for GIMA's ${request.course}. Use a sophisticated clinical editorial aesthetic, strong visual hierarchy, professional healthcare imagery, accurate readable typography, and the supplied GIMA identity.`,
    ``,
    `=== QUALITY DIRECTIVES ===`,
    `Premium, polished, human-designed, professional, realistic, strong hierarchy, clean typography, sophisticated composition worthy of an accredited medical institution.`,
    ``,
    `=== NEGATIVE CONSTRAINTS ===`,
    `No fake medical claims, no invented credentials, no random pseudo-text, no distorted logo, no generic AI-looking neon or purple gradients, no low-resolution artifacts.`
  ];

  return promptSections.join('\n');
}

/**
 * Builds variation-specific prompts for multi-variation requests in Gemini Web Handoff mode.
 */
export function buildGeminiVariationPrompts(
  request: GenerationRequest,
  brandConfig: BrandConfig,
  retrievedKnowledge: KnowledgeItem[]
): { variationNumber: number; title: string; styleDescription: string; prompt: string }[] {
  const variationsCount = Math.max(1, Math.min(4, request.variationsCount || 3));

  const styles = [
    {
      title: 'Clinical Editorial Composition',
      desc: 'Deep navy foundation, restrained gold typography, peer-reviewed clinical authority with prominent headline hierarchy.',
      styleOverride: 'Clinical Editorial'
    },
    {
      title: 'Premium Academic Composition',
      desc: 'Structured medical institution layout, dignified serif headlines, scholarly elegance with balanced white space.',
      styleOverride: 'Premium Academic'
    },
    {
      title: 'Modern Healthcare Composition',
      desc: 'Crisp clinical teal accents, clean white surfaces, high-contrast typography, contemporary clinical design.',
      styleOverride: 'Modern Healthcare'
    },
    {
      title: 'Bold Campaign Composition',
      desc: 'High contrast headline hierarchy, urgent clinical relevance, dominant primary visual focal point with clear CTA container.',
      styleOverride: 'Bold Campaign'
    }
  ];

  return Array.from({ length: variationsCount }, (_, idx) => {
    const styleInfo = styles[idx % styles.length];
    return {
      variationNumber: idx + 1,
      title: styleInfo.title,
      styleDescription: styleInfo.desc,
      prompt: buildGeminiWebPrompt(request, brandConfig, retrievedKnowledge, styleInfo.styleOverride)
    };
  });
}

/**
 * Generates an updated refinement prompt for Gemini when the user wants to refine an existing image.
 */
export function buildGeminiRefinementPrompt(
  originalPrompt: string,
  refinementInstruction: string,
  previousContext?: string
): string {
  return [
    `=== GEMINI PRO REFINEMENT DIRECTIVE ===`,
    `Please revise and refine the previously generated creative based on the following specific director instructions:`,
    ``,
    `DIRECTOR REFINEMENT INSTRUCTION:`,
    `"${refinementInstruction.trim()}"`,
    ``,
    previousContext ? `PREVIOUS CREATIVE CONTEXT:\n${previousContext}\n` : '',
    `=== ORIGINAL GIMA SPECIFICATIONS ===`,
    originalPrompt
  ].filter(Boolean).join('\n');
}

/**
 * Composes a focused, art-directed visual prompt for Pollinations image generation models.
 * Avoids verbose markdown text dumps that confuse image models into painting pseudo-text.
 * Explicitly controls exact short copy (Headline, CTA), visual composition, and negative constraints.
 */
export function composePollinationsImagePrompt(
  request: GenerationRequest,
  brandConfig: BrandConfig,
  retrievedKnowledge: KnowledgeItem[],
  variationIndex: number = 0
): { prompt: string; summary: string } {
  // Extract key topic terms from retrieved knowledge
  const topics: string[] = [];
  retrievedKnowledge.forEach((item) => {
    item.topics?.forEach((t) => {
      if (!topics.includes(t)) topics.push(t);
    });
  });
  const clinicalContext = topics.slice(0, 4).join(', ') || 'cellular mechanisms of aging, longevity science';

  // Variation-specific art direction nuance
  const variationAesthetics = [
    'Sophisticated clinical editorial composition, deep navy blue foundation (#1e3a5f) with restrained warm gold (#c99a2c) accents, elegant medical journal aesthetic, balanced whitespace, professional studio lighting.',
    'Premium academic medical institution layout, dignified typography hierarchy, clean structured margins, authoritative healthcare aesthetic with clinical depth.',
    'Modern healthcare visual design, crisp clinical teal accents, clean high-contrast medical surfaces, contemporary scientific art direction.',
    'Bold campaign visual hierarchy, strong focal emphasis, clear clinical contrast, prominent eye-level focal point.'
  ];
  const aesthetic = variationAesthetics[variationIndex % variationAesthetics.length];

  const formatName = (request.creativeType || 'Poster').toLowerCase();
  const courseName = request.course || 'Theories of Aging';
  const cleanHeadline = (request.headline || `${courseName}`).slice(0, 60);
  const cleanCta = (request.cta || 'Enroll Free Today').slice(0, 30);

  // Compact, highly effective image prompt
  const promptParts = [
    `A high-end professional healthcare education ${formatName} for Global Integrative Medicine Academy (GIMA).`,
    `${aesthetic}`,
    `Subject: Evidence-based clinical education on ${courseName}. Visual theme: ${clinicalContext}.`,
    `Realistic clinical laboratory or medical-scientific imagery, elegant balanced composition, human art-directed layout.`,
  ];

  if (cleanHeadline) {
    promptParts.push(`Clean typography headline reading: "${cleanHeadline}".`);
  }
  if (cleanCta) {
    promptParts.push(`Call to action badge: "${cleanCta}".`);
  }

  if (request.extraPrompt && request.extraPrompt.trim().length > 0) {
    promptParts.push(`Art direction: "${request.extraPrompt.trim().slice(0, 140)}".`);
  }

  // Explicit negative guardrails to avoid garbled text and stock clichés
  promptParts.push(
    `Crisp typography, no misspelled words, no gibberish pseudo-text, no distorted letters, no generic purple or neon gradients, no cluttered overlays, high resolution 8k photography quality.`
  );

  const prompt = promptParts.join(' ');
  const summary = `${courseName} (${request.style || 'Clinical Editorial'}) — Var ${variationIndex + 1}`;

  return { prompt, summary };
}

