/**
 * GIMA AI Studio — Hybrid Poster Composition Engine
 * 
 * Deterministically composes publication-grade marketing posters matching
 * the official GIMA reference standards:
 * - High-resolution photographic visual plate (from verified free model)
 * - Vector-sharp official GIMA logo & caduceus emblem
 * - ROHP / RNCP accreditation seals
 * - Bold two-tone clinical typography (teal category prefix + navy headline)
 * - Structured 4-column Program Highlights cards with icons
 * - High-impact CTA button with arrow container
 * - Full-width dark navy official contact footer bar
 * 
 * Runs client-side on HTML5 Canvas (zero server dependencies, 60fps, crisp export).
 */

import { GenerationRequest, BrandConfig } from './types';

export interface PosterCompositionOptions {
  backgroundUrl: string;
  request: GenerationRequest;
  brandConfig: BrandConfig;
  template?: 'clinical-editorial' | 'premium-academic' | 'modern-healthcare' | 'minimal-luxury' | 'bold-campaign';
  discountText?: string;
  customInstructor?: string;
}

/**
 * Loads an image URL into an HTMLImageElement with cross-origin handling
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Retry through internal proxy if direct CORS fails
      if (!url.startsWith('data:') && !url.includes('/api/download-asset')) {
        const proxyUrl = `/api/download-asset?url=${encodeURIComponent(url)}`;
        const fallbackImg = new Image();
        fallbackImg.crossOrigin = 'anonymous';
        fallbackImg.onload = () => resolve(fallbackImg);
        fallbackImg.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        fallbackImg.src = proxyUrl;
      } else {
        reject(new Error(`Failed to load image: ${url}`));
      }
    };
    img.src = url;
  });
}

/**
 * Draws rounded rectangle path
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Wraps text into lines based on maximum width
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Draws GIMA Caduceus & Globe Logo
 */
function drawGimaLogo(ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1.0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // 1. Emblem circle (radius 36)
  const cx = 36;
  const cy = 36;
  const r = 34;

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = '#0d9488';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Globe latitude & longitude lines
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r - 1.5, 0, Math.PI * 2);
  ctx.clip();

  ctx.strokeStyle = 'rgba(13, 148, 136, 0.4)';
  ctx.lineWidth = 1.5;

  // Horizontal equator & tropics
  ctx.beginPath();
  ctx.moveTo(cx - r, cy);
  ctx.lineTo(cx + r, cy);
  ctx.moveTo(cx - r + 6, cy - 14);
  ctx.lineTo(cx + r - 6, cy - 14);
  ctx.moveTo(cx - r + 6, cy + 14);
  ctx.lineTo(cx + r - 6, cy + 14);
  ctx.stroke();

  // Vertical meridian ellipse
  ctx.beginPath();
  ctx.ellipse(cx, cy, 16, r, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Central Caduceus Staff (in Gold #c59b27)
  ctx.strokeStyle = '#c59b27';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 24);
  ctx.lineTo(cx, cy + 24);
  ctx.stroke();

  // Top knob
  ctx.fillStyle = '#c59b27';
  ctx.beginPath();
  ctx.arc(cx, cy - 25, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Intertwined serpents (in Teal #0d9488)
  ctx.strokeStyle = '#0d9488';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  // Serpent wave 1
  ctx.moveTo(cx - 10, cy + 12);
  ctx.bezierCurveTo(cx - 2, cy + 6, cx + 2, cy - 4, cx + 10, cy - 10);
  // Serpent wave 2
  ctx.moveTo(cx + 10, cy + 12);
  ctx.bezierCurveTo(cx + 2, cy + 6, cx - 2, cy - 4, cx - 10, cy - 10);
  ctx.stroke();

  // Small wings at staff top
  ctx.fillStyle = '#c59b27';
  ctx.beginPath();
  ctx.moveTo(cx, cy - 20);
  ctx.lineTo(cx - 10, cy - 26);
  ctx.lineTo(cx - 4, cy - 18);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx, cy - 20);
  ctx.lineTo(cx + 10, cy - 26);
  ctx.lineTo(cx + 4, cy - 18);
  ctx.closePath();
  ctx.fill();

  // 2. Brand Typography
  const textX = 86;
  ctx.fillStyle = '#0f233a';
  ctx.font = 'bold 36px "Inter", -apple-system, sans-serif';
  ctx.fillText('GIMA', textX, 33);

  ctx.fillStyle = '#1e3a5f';
  ctx.font = '700 12px "Inter", sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText('GLOBAL INTEGRATIVE MEDICINE ACADEMY', textX, 52);

  ctx.fillStyle = '#0d9488';
  ctx.font = 'italic 11px "Inter", sans-serif';
  ctx.letterSpacing = '0px';
  ctx.fillText('Online Nutrition Certification for Regulated Healthcare Professionals', textX, 68);

  ctx.restore();
}

/**
 * Draws ROHP or RNCP circular accreditation seals with laurel wreaths
 */
function drawAccreditationSeal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  code: 'ROHP' | 'RNCP',
  subtitle: string
) {
  ctx.save();
  const r = 36;

  // Double circle ring
  ctx.strokeStyle = '#0f233a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#c59b27';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 4, 0, Math.PI * 2);
  ctx.stroke();

  // Laurel wreath dots/leaves
  ctx.fillStyle = '#c59b27';
  for (let i = 0; i < 12; i++) {
    const angle1 = Math.PI * 0.6 + (i * Math.PI * 0.8) / 11;
    const lx1 = cx + (r - 7) * Math.cos(angle1);
    const ly1 = cy + (r - 7) * Math.sin(angle1);
    ctx.beginPath();
    ctx.arc(lx1, ly1, 1.8, 0, Math.PI * 2);
    ctx.fill();

    const angle2 = Math.PI * 1.6 + (i * Math.PI * 0.8) / 11;
    const lx2 = cx + (r - 7) * Math.cos(angle2);
    const ly2 = cy + (r - 7) * Math.sin(angle2);
    ctx.beginPath();
    ctx.arc(lx2, ly2, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Inner Code
  ctx.fillStyle = '#0f233a';
  ctx.font = '800 16px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(code, cx, cy - 2);

  // Micro designation label underneath
  ctx.fillStyle = '#0d9488';
  ctx.font = '700 8px "Inter", sans-serif';
  ctx.fillText(code === 'ROHP' ? 'ORTHOMOLECULAR' : 'NUTRITIONAL', cx, cy + 13);

  // Subtitle under seal
  ctx.fillStyle = '#64748b';
  ctx.font = '600 8.5px "Inter", sans-serif';
  ctx.fillText(subtitle, cx, cy + r + 13);

  ctx.restore();
}

/**
 * Draws Open Access Clinical Seal for Free Courses (no unverified ROHP claims)
 */
function drawOpenAccessSeal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  code: string,
  micro: string,
  subtitle: string
) {
  ctx.save();
  const r = 36;

  // Double circle ring in teal and gold
  ctx.strokeStyle = '#0d9488';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#c59b27';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 4, 0, Math.PI * 2);
  ctx.stroke();

  // Subtle decorative dots
  ctx.fillStyle = '#0d9488';
  for (let i = 0; i < 12; i++) {
    const angle1 = Math.PI * 0.6 + (i * Math.PI * 0.8) / 11;
    const lx1 = cx + (r - 7) * Math.cos(angle1);
    const ly1 = cy + (r - 7) * Math.sin(angle1);
    ctx.beginPath();
    ctx.arc(lx1, ly1, 1.8, 0, Math.PI * 2);
    ctx.fill();

    const angle2 = Math.PI * 1.6 + (i * Math.PI * 0.8) / 11;
    const lx2 = cx + (r - 7) * Math.cos(angle2);
    const ly2 = cy + (r - 7) * Math.sin(angle2);
    ctx.beginPath();
    ctx.arc(lx2, ly2, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Inner Code
  ctx.fillStyle = '#0f233a';
  ctx.font = '800 13px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(code, cx, cy - 3);

  // Micro designation label underneath
  ctx.fillStyle = '#0d9488';
  ctx.font = '700 7.5px "Inter", sans-serif';
  ctx.fillText(micro, cx, cy + 11);

  // Subtitle under seal
  ctx.fillStyle = '#64748b';
  ctx.font = '600 8.5px "Inter", sans-serif';
  ctx.fillText(subtitle, cx, cy + r + 13);

  ctx.restore();
}

/**
 * Draws single Program Highlight card with icon, title, and description
 */
function drawHighlightCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  iconSymbol: string,
  title: string,
  desc: string
) {
  ctx.save();

  // Card background
  roundRect(ctx, x, y, w, h, 14);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Top decorative icon badge (circle radius 18)
  const ix = x + 28;
  const iy = y + 28;

  ctx.beginPath();
  ctx.arc(ix, iy, 16, 0, Math.PI * 2);
  ctx.fillStyle = '#e6fffa';
  ctx.fill();
  ctx.strokeStyle = '#0d9488';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Icon symbol
  ctx.fillStyle = '#0d9488';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 15px "Inter", sans-serif';
  ctx.fillText(iconSymbol, ix, iy);

  // Card Title
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#0f233a';
  ctx.font = 'bold 13px "Inter", sans-serif';
  ctx.fillText(title, x + 16, y + 54);

  // Card Description
  ctx.fillStyle = '#64748b';
  ctx.font = '500 11px "Inter", sans-serif';
  const lines = wrapText(ctx, desc, w - 32);
  lines.slice(0, 3).forEach((line, i) => {
    ctx.fillText(line, x + 16, y + 74 + i * 16);
  });

  ctx.restore();
}

/**
 * Main Poster Composition Function
 * Single source of truth: request.course, request.campaignType, request.headline
 */
export async function composePoster(options: PosterCompositionOptions): Promise<string> {
  const { backgroundUrl, request, brandConfig, discountText } = options;

  // Determine course identity strictly from request
  const courseStr = request.course || '';
  const courseLower = courseStr.toLowerCase();
  const isTheoriesOfAging = courseLower.includes('theories') || courseLower.includes('aging') || courseLower.includes('senescence');
  const isBrainDev = courseLower.includes('brain') || courseLower.includes('neurolog');
  const isFreeCourse = request.campaignType === 'Free Course Promotion' || isTheoriesOfAging || isBrainDev;
  const isRohpProgram = courseLower.includes('rohp') || courseLower.includes('qualifying') || courseLower.includes('rncp');

  // 1. Establish canvas dimensions based on requested aspect ratio
  let canvasW = 1200;
  let canvasH = 1500; // 4:5 portrait default

  if (request.aspectRatio === '1:1') {
    canvasW = 1200;
    canvasH = 1200;
  } else if (request.aspectRatio === '9:16') {
    canvasW = 1080;
    canvasH = 1920;
  } else if (request.aspectRatio === '16:9') {
    canvasW = 1920;
    canvasH = 1080;
  } else if (request.aspectRatio === 'A4') {
    canvasW = 1240;
    canvasH = 1754;
  }

  // Create offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize 2D canvas context');

  // Load generated background visual artwork
  let bgImg: HTMLImageElement | null = null;
  try {
    bgImg = await loadImage(backgroundUrl);
  } catch (err) {
    console.warn('[PosterComposer] Background image load failed, drawing elegant fallback plate:', err);
  }

  // 2. Clear & paint pristine clinical backdrop
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasW, canvasH);

  // 3. Top Header Area (y: 28 to 125)
  drawGimaLogo(ctx, 45, 36, 1.05);

  // Right Top Header Badges / Seals
  if (isFreeCourse) {
    ctx.fillStyle = '#0d9488';
    ctx.font = '700 10px "Inter", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('GIMA OPEN CLINICAL CURRICULUM', canvasW - 45, 34);

    drawOpenAccessSeal(ctx, canvasW - 145, 78, 'FREE', '12 GUIDES', 'OPEN ACCESS');
    drawOpenAccessSeal(ctx, canvasW - 55, 78, 'GIMA', 'CLINICAL', 'PEER-REVIEWED');
  } else {
    ctx.fillStyle = '#64748b';
    ctx.font = '700 10px "Inter", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('ACCREDITED DESIGNATIONS', canvasW - 45, 34);

    drawAccreditationSeal(ctx, canvasW - 145, 78, 'ROHP', 'HEALTH PRACTITIONER');
    drawAccreditationSeal(ctx, canvasW - 55, 78, 'RNCP', 'CONSULTANT PRACTITIONER');
  }

  // Header separator line
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(45, 136);
  ctx.lineTo(canvasW - 45, 136);
  ctx.stroke();

  // 4. Hero Visual Plate (Right side: x: 645 to 1155, y: 155 to 855)
  const plateX = 645;
  const plateY = 155;
  const plateW = canvasW - 45 - plateX;
  const plateH = 700;

  ctx.save();
  // Clip visual plate with rounded corners
  roundRect(ctx, plateX, plateY, plateW, plateH, 24);
  ctx.clip();

  if (bgImg) {
    // Fill & cover background artwork
    const imgRatio = bgImg.width / bgImg.height;
    const plateRatio = plateW / plateH;
    let sx = 0, sy = 0, sw = bgImg.width, sh = bgImg.height;

    if (imgRatio > plateRatio) {
      sw = bgImg.height * plateRatio;
      sx = (bgImg.width - sw) / 2;
    } else {
      sh = bgImg.width / plateRatio;
      sy = (bgImg.height - sh) / 2;
    }

    ctx.drawImage(bgImg, sx, sy, sw, sh, plateX, plateY, plateW, plateH);
  } else {
    // Fallback gradient if background artwork unavailable
    const grad = ctx.createLinearGradient(plateX, plateY, plateX + plateW, plateY + plateH);
    grad.addColorStop(0, '#0d9488');
    grad.addColorStop(1, '#0f233a');
    ctx.fillStyle = grad;
    ctx.fillRect(plateX, plateY, plateW, plateH);
  }

  // Subtle bottom vignette over visual for faculty badge legibility
  const vigGrad = ctx.createLinearGradient(plateX, plateY + plateH - 220, plateX, plateY + plateH);
  vigGrad.addColorStop(0, 'rgba(15, 35, 58, 0)');
  vigGrad.addColorStop(1, 'rgba(15, 35, 58, 0.85)');
  ctx.fillStyle = vigGrad;
  ctx.fillRect(plateX, plateY + plateH - 220, plateW, 220);

  ctx.restore();

  // Draw 1.5px subtle border around visual plate
  roundRect(ctx, plateX, plateY, plateW, plateH, 24);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Faculty Director Box over bottom of visual plate
  const facultyW = plateW - 40;
  const facultyH = 82;
  const facultyX = plateX + 20;
  const facultyY = plateY + plateH - facultyH - 20;

  ctx.save();
  roundRect(ctx, facultyX, facultyY, facultyW, facultyH, 16);
  ctx.fillStyle = 'rgba(15, 35, 58, 0.94)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px "Inter", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Dr. James Meschino', facultyX + 18, facultyY + 14);

  ctx.fillStyle = '#38bdf8';
  ctx.font = '600 11.5px "Inter", sans-serif';
  if (isFreeCourse) {
    ctx.fillText('DC, MS, ROHP — Director of Education', facultyX + 18, facultyY + 36);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 10px "Inter", sans-serif';
    ctx.fillText('Author & Academic Director, GIMA Clinical Series', facultyX + 18, facultyY + 54);
  } else {
    ctx.fillText('DC, MS, ROHP, RNCP, DABFM, DABFH', facultyX + 18, facultyY + 36);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 10px "Inter", sans-serif';
    ctx.fillText('Founder & Director of Education, GIMA', facultyX + 18, facultyY + 54);
  }
  ctx.restore();

  // Top-right badge on visual plate
  // CRITICAL RULE: Never draw a discount badge for free courses!
  if (isFreeCourse) {
    // Elegant emerald/gold Open Access badge
    const sealCx = plateX + plateW - 65;
    const sealCy = plateY + 65;
    const sealR = 50;

    ctx.save();
    ctx.beginPath();
    ctx.arc(sealCx, sealCy, sealR, 0, Math.PI * 2);
    const sealGrad = ctx.createLinearGradient(sealCx - sealR, sealCy - sealR, sealCx + sealR, sealCy + sealR);
    sealGrad.addColorStop(0, '#0d9488');
    sealGrad.addColorStop(1, '#0f766e');
    ctx.fillStyle = sealGrad;
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.arc(sealCx, sealCy, sealR - 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 8.5px "Inter", sans-serif';
    ctx.fillText('OPEN ACCESS', sealCx, sealCy - 18);

    ctx.font = '800 15px "Inter", sans-serif';
    ctx.fillText('100% FREE', sealCx, sealCy);

    ctx.font = '600 8.5px "Inter", sans-serif';
    ctx.fillText('12 PDF GUIDES', sealCx, sealCy + 17);
    ctx.restore();
  } else if (discountText) {
    // Only render discount seal when an explicit offer/discount is provided
    const sealCx = plateX + plateW - 65;
    const sealCy = plateY + 65;
    const sealR = 50;

    ctx.save();
    ctx.beginPath();
    ctx.arc(sealCx, sealCy, sealR, 0, Math.PI * 2);
    const sealGrad = ctx.createLinearGradient(sealCx - sealR, sealCy - sealR, sealCx + sealR, sealCy + sealR);
    sealGrad.addColorStop(0, '#c59b27');
    sealGrad.addColorStop(1, '#997316');
    ctx.fillStyle = sealGrad;
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.arc(sealCx, sealCy, sealR - 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 9px "Inter", sans-serif';
    ctx.fillText('ENROLL TODAY', sealCx, sealCy - 20);

    ctx.font = '600 11px "Inter", sans-serif';
    ctx.fillText('GET', sealCx, sealCy - 6);

    ctx.font = '900 19px "Inter", sans-serif';
    ctx.fillText(discountText, sealCx, sealCy + 14);
    ctx.restore();
  }

  // 5. Left Hero Content Column (x: 45 to 615, y: 165 to 855)
  const contentW = 570;

  // Teal Category / Course Kicker (strictly course-specific)
  ctx.fillStyle = '#0d9488';
  ctx.font = '800 22px "Inter", -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  let courseCategory = 'GIMA Clinical Curriculum:';
  if (isTheoriesOfAging) {
    courseCategory = 'GIMA Open Clinical Curriculum • Longevity Science:';
  } else if (isBrainDev) {
    courseCategory = 'GIMA Open Clinical Curriculum • Nutritional Neurology:';
  } else if (isFreeCourse) {
    courseCategory = 'GIMA Open Clinical Curriculum • Free Course Series:';
  } else if (isRohpProgram) {
    courseCategory = 'Advanced Nutritional Medicine for Health Practitioners:';
  } else if (courseStr) {
    courseCategory = courseStr.includes(':') ? courseStr.split(':')[0] + ':' : `${courseStr}:`;
  }
  ctx.fillText(courseCategory, 45, 165);

  // Dominant Dark Navy Headline
  ctx.fillStyle = '#0f233a';
  ctx.font = '800 37px "Inter", -apple-system, sans-serif';
  const headlineText = request.headline || (
    isTheoriesOfAging
      ? 'Theories of Aging: Cellular Mechanisms & Longevity Science'
      : isBrainDev
      ? 'Nutritional Medicine in Brain Development'
      : `${courseStr} — Clinical Excellence`
  );
  const headlineLines = wrapText(ctx, headlineText, contentW);

  headlineLines.slice(0, 4).forEach((line, i) => {
    ctx.fillText(line, 45, 204 + i * 46);
  });

  const nextY = 204 + Math.min(headlineLines.length, 4) * 46 + 18;

  // Target Audience pill with icon
  ctx.save();
  const audY = nextY;
  const audText = `Audience: ${request.audience || 'Integrative Practitioners, Nutritionists, Healthcare Students'}`;
  roundRect(ctx, 45, audY, contentW, 40, 10);
  ctx.fillStyle = '#f0fdf4';
  ctx.fill();
  ctx.strokeStyle = '#bbf7d0';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#166534';
  ctx.font = '700 12.5px "Inter", sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(`👥  ${audText}`, 60, audY + 20);
  ctx.restore();

  // Program / Curriculum Card
  const cardY = audY + 54;
  roundRect(ctx, 45, cardY, contentW, 114, 16);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  if (isFreeCourse) {
    // Open Access Clinical Knowledge Initiative Card
    ctx.fillStyle = '#0d9488';
    ctx.font = 'bold 24px "Inter", sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillText('🧬', 62, cardY + 22);

    ctx.fillStyle = '#0f233a';
    ctx.font = '800 14px "Inter", sans-serif';
    ctx.fillText('GIMA OPEN CLINICAL KNOWLEDGE INITIATIVE', 104, cardY + 18);

    ctx.fillStyle = '#0d9488';
    ctx.font = '700 12px "Inter", sans-serif';
    ctx.fillText('12 EVIDENCE-BASED CLINICAL GUIDES & CASE MONOGRAPHS', 104, cardY + 38);

    ctx.fillStyle = '#64748b';
    ctx.font = '500 11px "Inter", sans-serif';
    ctx.fillText('Curated by Dr. James Meschino, DC, MS, ROHP • Free Academic Resource', 104, cardY + 60);
    ctx.fillText('Peer-Reviewed Cellular Biology, Longevity Pathways & Clinical Protocols', 104, cardY + 78);

    // Curriculum Focus Quote / Note
    const quoteY = cardY + 130;
    ctx.fillStyle = '#475569';
    ctx.font = 'italic 12.5px "Inter", sans-serif';
    ctx.fillText(`Curriculum Focus: Evidence-based nutritional protocols & cellular metabolism.`, 45, quoteY);
    ctx.fillText(`Open Educational Access: Provided by GIMA to empower healthcare clinicians worldwide.`, 45, quoteY + 20);
  } else {
    // ROHP / RNCP Certification Program Card
    ctx.fillStyle = '#0d9488';
    ctx.font = 'bold 24px "Inter", sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillText('🛡️', 62, cardY + 22);

    ctx.fillStyle = '#0f233a';
    ctx.font = '800 14px "Inter", sans-serif';
    ctx.fillText('REGISTERED ORTHOMOLECULAR HEALTH PRACTITIONER PROGRAM', 104, cardY + 18);

    ctx.fillStyle = '#0d9488';
    ctx.font = '700 12px "Inter", sans-serif';
    ctx.fillText('ROHP®  |  RNCP®  QUALIFYING PROGRAM', 104, cardY + 38);

    ctx.fillStyle = '#64748b';
    ctx.font = '500 11px "Inter", sans-serif';
    ctx.fillText('Online Nutrition Certification for Regulated Healthcare Professionals', 104, cardY + 60);
    ctx.fillText('Earn Accredited Designations • Faculty Directed by Leading Clinical Authority', 104, cardY + 78);

    // Curriculum Focus Quote / Note
    const quoteY = cardY + 130;
    ctx.fillStyle = '#475569';
    ctx.font = 'italic 12.5px "Inter", sans-serif';
    ctx.fillText(`Curriculum Focus: Evidence-based nutritional protocols & cellular metabolism.`, 45, quoteY);
    ctx.fillText(`Accreditation: Recognized by the International Organization of Nutritional Consultants.`, 45, quoteY + 20);
  }

  // 6. Program Highlights 4-Card Grid (y: 885 to 1120)
  const hGridY = 885;
  const hCardW = (canvasW - 90 - 45) / 4; // ~266px each
  const hCardH = 220;

  if (isTheoriesOfAging) {
    drawHighlightCard(
      ctx,
      45,
      hGridY,
      hCardW,
      hCardH,
      '🧬',
      'CELLULAR SENESCENCE',
      'Mitochondrial biology, free radical theories & telomere shortening dynamics.'
    );

    drawHighlightCard(
      ctx,
      45 + hCardW + 15,
      hGridY,
      hCardW,
      hCardH,
      '🔬',
      'METABOLIC PATHWAYS',
      'Nutritional modulation of mTOR, AMPK, sirtuins & cellular autophagy.'
    );

    drawHighlightCard(
      ctx,
      45 + (hCardW + 15) * 2,
      hGridY,
      hCardW,
      hCardH,
      '📚',
      '12 CLINICAL MODULES',
      'Comprehensive digital PDF guides with evidence-informed clinical interventions.'
    );

    drawHighlightCard(
      ctx,
      45 + (hCardW + 15) * 3,
      hGridY,
      hCardW,
      hCardH,
      '🌐',
      'OPEN ACCESS RESOURCE',
      '100% open educational resource for licensed healthcare professionals.'
    );
  } else if (isBrainDev) {
    drawHighlightCard(
      ctx,
      45,
      hGridY,
      hCardW,
      hCardH,
      '🧠',
      'NEURODEVELOPMENT',
      'Micronutrient and essential fatty acid biochemistry in cognitive maturation.'
    );

    drawHighlightCard(
      ctx,
      45 + hCardW + 15,
      hGridY,
      hCardW,
      hCardH,
      '🎯',
      'CLINICAL APPLICATION',
      'Evidence-based dietary protocols for neurological and pediatric wellness.'
    );

    drawHighlightCard(
      ctx,
      45 + (hCardW + 15) * 2,
      hGridY,
      hCardW,
      hCardH,
      '💻',
      'FLEXIBLE STUDY',
      'Self-paced clinical monographs, biochemical charts, and digital references.'
    );

    drawHighlightCard(
      ctx,
      45 + (hCardW + 15) * 3,
      hGridY,
      hCardW,
      hCardH,
      '📖',
      'OPEN CLINICAL MONOGRAPHS',
      'Authoritative educational modules accessible without subscription barrier.'
    );
  } else {
    drawHighlightCard(
      ctx,
      45,
      hGridY,
      hCardW,
      hCardH,
      '📖',
      'EVIDENCE-INFORMED CURRICULUM',
      'Science-based nutrition education tailored exclusively for regulated healthcare professionals.'
    );

    drawHighlightCard(
      ctx,
      45 + hCardW + 15,
      hGridY,
      hCardW,
      hCardH,
      '🎯',
      'CLINICAL APPLICATION',
      'Practical tools and protocols to assess, support, and guide measurable patient outcomes.'
    );

    drawHighlightCard(
      ctx,
      45 + (hCardW + 15) * 2,
      hGridY,
      hCardW,
      hCardH,
      '💻',
      'FLEXIBLE ONLINE LEARNING',
      'Study at your own pace with expert-led modules, clinical slides, and digital reference toolkits.'
    );

    drawHighlightCard(
      ctx,
      45 + (hCardW + 15) * 3,
      hGridY,
      hCardW,
      hCardH,
      '🏅',
      'PROFESSIONAL DESIGNATIONS',
      'Earn your prestigious ROHP® or RNCP® credential and advance your clinical practice.'
    );
  }

  // 7. Call To Action & Guarantee Row (y: 1145 to 1345)
  const ctaBarY = 1145;

  if (isFreeCourse) {
    drawOpenAccessSeal(ctx, 110, ctaBarY + 58, 'FREE', '100% OPEN', 'ACADEMIC RESOURCE');
    drawOpenAccessSeal(ctx, 210, ctaBarY + 58, 'GIMA', 'CURRICULUM', 'PEER-REVIEWED');

    ctx.fillStyle = '#0f233a';
    ctx.font = '800 15px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('GIMA OPEN CLINICAL KNOWLEDGE INITIATIVE', 270, ctaBarY + 28);

    ctx.fillStyle = '#64748b';
    ctx.font = '500 12px "Inter", sans-serif';
    ctx.fillText('Authoritative nutrition monographs for regulated healthcare clinicians.', 270, ctaBarY + 50);
    ctx.fillText('Immediate open access • 12 complete PDF clinical guides.', 270, ctaBarY + 68);
  } else {
    drawAccreditationSeal(ctx, 110, ctaBarY + 58, 'ROHP', 'ORTHOMOLECULAR');
    drawAccreditationSeal(ctx, 210, ctaBarY + 58, 'RNCP', 'NUTRITIONAL');

    ctx.fillStyle = '#0f233a';
    ctx.font = '800 15px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('PROFESSIONAL ACCREDITATION GUARANTEE', 270, ctaBarY + 28);

    ctx.fillStyle = '#64748b';
    ctx.font = '500 12px "Inter", sans-serif';
    ctx.fillText('Official certification recognized for regulated clinicians.', 270, ctaBarY + 50);
    ctx.fillText('Enroll with confidence • Immediate access upon registration.', 270, ctaBarY + 68);
  }

  // Right side: High-Impact Clinical Teal CTA Pill Button
  const btnW = 500;
  const btnH = 92;
  const btnX = canvasW - 45 - btnW;
  const btnY = ctaBarY + 12;

  ctx.save();
  roundRect(ctx, btnX, btnY, btnW, btnH, 26);
  const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY + btnH);
  btnGrad.addColorStop(0, '#0d9488');
  btnGrad.addColorStop(1, '#0f766e');
  ctx.fillStyle = btnGrad;
  ctx.fill();

  // Subtle golden border
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // White circular arrow container
  const arrowCx = btnX + 54;
  const arrowCy = btnY + btnH / 2;
  ctx.beginPath();
  ctx.arc(arrowCx, arrowCy, 24, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.fillStyle = '#0d9488';
  ctx.font = 'bold 22px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('➔', arrowCx, arrowCy - 1);

  // CTA Text
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = '800 23px "Inter", sans-serif';

  let ctaMain = request.cta;
  if (!ctaMain) {
    ctaMain = isFreeCourse ? 'Access Free Course • Download Guides' : 'Enroll Today • Elevate Practice';
  }
  ctx.fillText(ctaMain, btnX + 96, btnY + 22);

  ctx.fillStyle = '#ccfbf1';
  ctx.font = '600 12px "Inter", sans-serif';
  if (isFreeCourse) {
    ctx.fillText('Global Integrative Medicine Academy  |  Open Educational Resource', btnX + 96, btnY + 54);
  } else {
    ctx.fillText('Global Integrative Medicine Academy  |  Official Fast-Track Certification', btnX + 96, btnY + 54);
  }
  ctx.restore();

  // 8. Official Dark Navy Footer Bar (y: 1375 to 1500)
  const footerY = 1375;
  const footerH = canvasH - footerY;

  ctx.fillStyle = '#0f233a';
  ctx.fillRect(0, footerY, canvasW, footerH);

  // Upper row of footer (y: 1405)
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 12.5px "Inter", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  if (isFreeCourse) {
    ctx.fillText('GIMA OPEN CLINICAL KNOWLEDGE SERIES  •  THEORIES OF AGING', 45, footerY + 36);
  } else {
    ctx.fillText('REGISTERED ORTHOMOLECULAR HEALTH PRACTITIONER PROGRAM', 45, footerY + 36);
  }

  // Contact points
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '600 12px "Inter", sans-serif';
  ctx.textAlign = 'right';

  const contactText = '📞  747-269-1192      ✉️  info@gim-academy.com      🌐  gim-academy.com';
  ctx.fillText(contactText, canvasW - 45, footerY + 36);

  // Sub-footer bottom bar
  const subFooterY = footerY + 70;
  ctx.fillStyle = '#091827';
  ctx.fillRect(0, subFooterY, canvasW, canvasH - subFooterY);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 10.5px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    'EMPOWERING HEALTHCARE PROFESSIONALS  •  ADVANCING PATIENT CARE THROUGH NUTRITION  •  GIM-ACADEMY.COM',
    canvasW / 2,
    subFooterY + (canvasH - subFooterY) / 2
  );

  // Export full-resolution crisp PNG data URL
  return canvas.toDataURL('image/png', 0.98);
}

