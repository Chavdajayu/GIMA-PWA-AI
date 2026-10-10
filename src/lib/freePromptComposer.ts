import { GenerationRequest, BrandConfig, KnowledgeItem } from './types';

/**
 * Composes dedicated visual background prompts for Free Models mode.
 * 
 * CRITICAL RULE: Never request typography, headlines, CTAs, phone numbers,
 * or layout borders in the visual prompt. Free diffusion models attempt to render
 * folded brochures and alien pseudo-text when asked for "posters with text".
 * 
 * Instead, this composer directs the free model (FLUX.2 Klein / SDXL) to generate
 * clean, high-resolution photographic healthcare artwork with deliberate negative space,
 * which GIMA AI Studio's Poster Composition Engine subsequently finishes into a
 * publication-grade poster.
 */
export function composeFreeBackgroundPrompt(
  request: GenerationRequest,
  brandConfig: BrandConfig,
  retrievedKnowledge: KnowledgeItem[],
  variationIndex: number = 0
): { prompt: string; summary: string; visualTheme: string } {
  const courseLower = (request.course || '').toLowerCase();
  const topicLower = (request.topic || '').toLowerCase();

  // Determine specific clinical subject matter based on verified course context
  let visualSubject = '';
  let visualTheme = '';

  if (courseLower.includes('theories') || courseLower.includes('aging') || topicLower.includes('senescence')) {
    visualTheme = 'Cellular Longevity & Senescence Biology';
    const variations = [
      'A realistic healthcare researcher working carefully at a modern clinical microscope in a credible laboratory, examining cellular longevity specimens, natural skin texture, anatomically correct hands, realistic professional lab coat, soft directional light, premium editorial photography, subtle teal and navy details, restrained highlights.',
      'A photorealistic high-power scientific laboratory visualization of cellular biology, subtle luminous mitochondrial organelles and cellular longevity research in a modern integrative medical laboratory, natural depth of field, premium editorial lighting.',
      'A distinguished female healthcare doctor in crisp white clinical attire analyzing cellular longevity biomarkers at an advanced research workstation, modern clinical medical academy setting with realistic soft daylight.',
      'Close-up clinical scientific photography of cellular biology research, precision micropipettes, glass culture vessels with pure nutrient compounds on a pristine laboratory bench, shallow depth of field, authentic medical laboratory aesthetic.'
    ];
    visualSubject = variations[variationIndex % variations.length];
  } else if (courseLower.includes('brain') || courseLower.includes('neuro') || topicLower.includes('neuro')) {
    visualTheme = 'Nutritional Neurology & Brain Development';
    const variations = [
      'A professional healthcare neurologist in a tailored clinical white coat consulting a digital tablet displaying neural pathway biochemistry, modern clinical office setting with clean anatomical scientific models and soft natural illumination.',
      'Photorealistic medical science composition featuring synaptic neural networks and essential fatty acid molecular models on a pristine clinical glass desk, subtle clinical teal and navy accents, authentic editorial photography.',
      'An authoritative male clinical practitioner in white lab coat with stethoscope, engaging in neurological research at an elegant medical laboratory desk with scientific glassware and botanical nutritional extracts.',
      'High-end medical photography of a cognitive neuroscience laboratory, realistic medical practitioner reviewing clinical brain metabolic data, natural skin tones, soft directional lighting.'
    ];
    visualSubject = variations[variationIndex % variations.length];
  } else if (courseLower.includes('metabol') || courseLower.includes('nutrition') || courseLower.includes('digestive')) {
    visualTheme = 'Orthomolecular Nutritional Medicine';
    const variations = [
      'A realistic composition of clinical nutritional medicine research: precision mortar and pestle with fresh medicinal herbs, clinical amber glass bottles, biochemical cellular imagery, elegant soft directional studio lighting.',
      'A compassionate female healthcare doctor in white lab coat with stethoscope around neck, seated at a modern medical consultation desk, clean contemporary clinic setting with clinical nutrition reference manuals.',
      'A professional healthcare practitioner in white clinical coat holding a medical clipboard in an authentic integrative healthcare clinic, natural daylight, sophisticated laboratory glassware with medicinal herbs and micronutrient capsules in background.',
      'Photorealistic medical-scientific visual: healthy cellular biochemistry plate with nutrient-rich botanical ingredients, glass scientific beakers, clean teal-navy lighting, professional medical editorial aesthetic.'
    ];
    visualSubject = variations[variationIndex % variations.length];
  } else {
    // Flagship ROHP / RNCP Qualifying Program
    visualTheme = 'Regulated Healthcare Clinical Education';
    const variations = [
      'An authoritative, photorealistic healthcare practitioner in a tailored white clinical coat with stethoscope, standing in a contemporary medical center laboratory, modern diagnostic instruments, confident academic expression, professional portrait lighting.',
      'A female doctor of chiropractic in professional clinical lab coat with glasses, holding an academic digital tablet in front of a modern medical microscope and laboratory glassware, natural skin texture, authentic healthcare environment.',
      'A distinguished senior clinical professor in medical white coat seated in a premier academic medical institution, clean clinical desk with scientific research documents and medical instruments, realistic soft lighting.',
      'High-end medical editorial photography of a healthcare professional in a state-of-the-art integrative medicine clinic, pristine scientific background, soft teal and navy depth, human art-directed composition.'
    ];
    visualSubject = variations[variationIndex % variations.length];
  }

  // Format orientation cues
  const orientationCue = request.aspectRatio === '1:1'
    ? 'Square 1:1 balanced photographic composition.'
    : request.aspectRatio === '16:9'
    ? 'Horizontal 16:9 cinematic clinical laboratory composition.'
    : request.aspectRatio === '9:16'
    ? 'Vertical 9:16 full-height portrait medical composition.'
    : 'Vertical 4:5 portrait composition, balanced negative space reserved for a later poster headline.';

  // Build the complete prompt with absolute negative constraints
  const promptParts = [
    `Create a sophisticated, photorealistic healthcare education campaign visual for an established integrative medicine academy.`,
    orientationCue,
    visualSubject,
    `One coherent scene with genuine photographic depth. Natural skin texture, anatomically correct hands, realistic professional clothing, soft directional light, premium editorial photography, subtle teal and navy details, restrained highlights.`,
    `STRICT NEGATIVE INSTRUCTIONS: No text, no letters, no words, no numbers, no typography, no brochure mockup, no folded leaflet, no tri-fold paper, no book spread, no catalogue, no split panels, no multi-image collage, no borders, no frames, no fake logos, no watermarks, no distorted anatomy.`
  ];

  const prompt = promptParts.join(' ');
  const summary = `Free Visual Plate: ${visualTheme} (Var ${variationIndex + 1})`;

  return { prompt, summary, visualTheme };
}

