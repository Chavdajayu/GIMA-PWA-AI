import { GenerationRequest, BrandConfig, KnowledgeItem } from './types';

/**
 * Composes dedicated visual background prompts for Free Models mode.
 * 
 * CRITICAL RULE: Never request typography, headlines, CTAs, phone numbers,
 * or layout borders in the visual prompt. Free diffusion models attempt to render
 * folded brochures and alien pseudo-text when asked for "posters with text".
 * 
 * Instead, this composer directs the free model to generate clean, high-resolution
 * photographic healthcare artwork with deliberate negative space, which GIMA AI Studio's
 * Poster Composition Engine subsequently finishes into a publication-grade poster.
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
    visualTheme = 'Cellular Biology & Longevity Research';
    const variations = [
      'A photorealistic high-power scientific microscope visualization of cellular biology, subtle luminous DNA helix structures, glowing mitochondrial organelles, and cellular longevity research in a modern integrative medical laboratory.',
      'A distinguished female healthcare researcher in a crisp white clinical lab coat examining biological longevity cultures under a high-resolution laboratory microscope, elegant medical research facility with soft teal ambient lighting.',
      'Close-up clinical scientific photography of cellular biology research, glass petri dishes with botanical nutrient compounds, precision micropipettes, and clean laboratory bench with natural depth of field.',
      'A distinguished clinical healthcare professional in white medical attire analyzing longevity biomarkers at an advanced clinical workstation, modern medical academy setting with realistic soft daylight.'
    ];
    visualSubject = variations[variationIndex % variations.length];
  } else if (courseLower.includes('brain') || courseLower.includes('neuro') || topicLower.includes('neuro')) {
    visualTheme = 'Nutritional Neurology & Cognitive Health';
    const variations = [
      'A professional healthcare practitioner in clinical white coat consulting a digital tablet displaying neural pathway biochemistry, modern clinical office setting with clean anatomical scientific models and soft natural illumination.',
      'Photorealistic medical science composition featuring synaptic neural networks and essential fatty acid molecular models on a pristine clinical glass desk, soft clinical teal and navy accents.',
      'An authoritative male clinical practitioner in white lab coat with stethoscope, engaging in neurological research at an elegant medical laboratory desk with scientific glassware and botanical nutritional extracts.',
      'High-end medical photography of cognitive neuroscience laboratory, realistic medical practitioner reviewing clinical brain metabolic data, shallow depth of field, natural skin tones.'
    ];
    visualSubject = variations[variationIndex % variations.length];
  } else if (courseLower.includes('metabol') || courseLower.includes('nutrition') || courseLower.includes('digestive')) {
    visualTheme = 'Orthomolecular Nutritional Medicine';
    const variations = [
      'A professional healthcare practitioner in white clinical coat holding a medical clipboard in an authentic integrative healthcare clinic, natural daylight, sophisticated laboratory glassware with medicinal herbs and micronutrient capsules in background.',
      'A realistic composition of clinical nutritional medicine research: precision mortar and pestle with fresh medicinal herbs, clinical amber glass bottles, biochemical cellular imagery, elegant soft studio lighting.',
      'A compassionate female healthcare doctor in white lab coat with stethoscope around neck, seated at a modern medical consultation desk, clean contemporary clinic setting with clinical nutrition reference manuals.',
      'Photorealistic medical-scientific visual: healthy cellular biochemistry plate with nutrient-rich botanical ingredients, glass scientific beakers, clean teal-navy lighting, professional medical editorial aesthetic.'
    ];
    visualSubject = variations[variationIndex % variations.length];
  } else {
    // Flagship ROHP / RNCP Qualifying Program
    visualTheme = 'Regulated Healthcare Professional Education';
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
    : 'Vertical 4:5 portrait composition, carefully reserved negative space on the left side for subsequently typeset medical copy.';

  // Build the complete prompt with absolute negative constraints
  const promptParts = [
    visualSubject,
    orientationCue,
    `Authentic healthcare professional setting for an accredited medical academy. Natural anatomy, realistic human hands and facial features, credible clinical wardrobe, elegant navy and teal visual palette, professional studio lighting, shallow depth of field, 8k resolution photographic quality.`,
    `STRICT NEGATIVE INSTRUCTIONS: No text, no letters, no words, no numbers, no alphabet symbols, no typography, no brochure mockup, no folded leaflet, no tri-fold paper, no book spread, no catalogue, no split panels, no multi-image collage, no borders, no frames, no fake logos, no watermarks, no distorted anatomy.`
  ];

  const prompt = promptParts.join(' ');
  const summary = `Free Visual Plate: ${visualTheme} (Var ${variationIndex + 1})`;

  return { prompt, summary, visualTheme };
}
