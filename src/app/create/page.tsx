'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  BookOpen,
  Layers,
  Upload,
  Check,
  ChevronDown,
  RefreshCw,
  FolderPlus,
  Info,
  Sliders,
  Maximize2,
  FileText,
  AlertCircle,
  Eye,
  CheckCircle2,
  Share2,
  Download
} from 'lucide-react';
import {
  CampaignType,
  PlatformType,
  CreativeType,
  AspectRatioType,
  VisualStyleType,
  AssetItem,
  KnowledgeItem,
  GenerationRequest,
  GenerationState,
  GeneratedVariation,
  ProjectRecord
} from '@/lib/types';
import {
  getBrandConfig,
  getKnowledgeForCourse,
  searchKnowledge
} from '@/lib/knowledge';
import { getImageProvider } from '@/lib/imageProvider';
import { saveProject } from '@/lib/projects';
import { logActivity } from '@/lib/activity';
import { AssetPickerModal } from '@/components/AssetPickerModal';

const campaignOptions: CampaignType[] = [
  'Course Promotion',
  'Free Course Promotion',
  'Educational Awareness',
  'Event Promotion',
  'Social Media Campaign',
  'Brand Awareness',
  'Custom',
];

const platformOptions: PlatformType[] = [
  'Instagram',
  'Facebook',
  'LinkedIn',
  'Website',
  'Email',
  'Print',
  'Story',
];

const creativeTypeOptions: CreativeType[] = [
  'Poster',
  'Social Post',
  'Carousel Cover',
  'Banner',
  'Advertisement',
  'Story',
  'Course Promotion',
  'Event Graphic',
  'Educational Graphic',
];

const aspectRatioOptions: { label: string; value: AspectRatioType; desc: string }[] = [
  { label: '1:1 Square', value: '1:1', desc: 'Feed & Multi-platform' },
  { label: '4:5 Portrait', value: '4:5', desc: 'Instagram Feed Optimized' },
  { label: '16:9 Landscape', value: '16:9', desc: 'Web Banner & Presentation' },
  { label: '9:16 Vertical', value: '9:16', desc: 'Stories & Reels' },
  { label: 'A4 Document', value: 'A4', desc: 'Clinical Posters & Handouts' },
  { label: 'Custom', value: 'Custom', desc: 'Free Aspect Ratio' },
];

const visualStyles: { title: VisualStyleType; desc: string; previewBadge: string }[] = [
  {
    title: 'Clinical Editorial',
    desc: 'Deep navy foundation, restrained gold typography, peer-reviewed clinical authority.',
    previewBadge: 'Preferred for ROHP',
  },
  {
    title: 'Premium Academic',
    desc: 'Structured serif headers, balanced hierarchy, academic medical institution feel.',
    previewBadge: 'Curriculum Focus',
  },
  {
    title: 'Modern Healthcare',
    desc: 'Crisp clinical teal accents, clean white surfaces, contemporary medical design.',
    previewBadge: 'High Contrast',
  },
  {
    title: 'Minimal Luxury',
    desc: 'Generous whitespace, refined micro-borders, quiet sophistication.',
    previewBadge: 'Executive',
  },
  {
    title: 'Educational Infographic',
    desc: 'Structured focal callouts, molecular/metabolic highlights, evidence-based graphics.',
    previewBadge: 'Data Rich',
  },
  {
    title: 'Bold Campaign',
    desc: 'Dominant headline contrast, high urgency, primary registration emphasis.',
    previewBadge: 'High Conversion',
  },
];

const examplePrompts = [
  'Use a premium clinical look with Dr. Meschino on the right and course title on the left.',
  'Make the headline dominant and keep the GIMA logo subtle and refined at top center.',
  'Emphasize evidence-based clinical studies, not generic healthcare stock imagery.',
  'Highlight that this qualifies for ROHP / RNCP accreditation for regulated healthcare practitioners.',
];

function CreateCreativeContent() {
  const searchParams = useSearchParams();
  const brandConfig = useMemo(() => getBrandConfig(), []);

  // Form State
  const [campaignType, setCampaignType] = useState<CampaignType>(
    (searchParams.get('campaignType') as CampaignType) || 'Course Promotion'
  );
  const [course, setCourse] = useState<string>(
    searchParams.get('course') || 'Theories of Aging'
  );
  const [topic, setTopic] = useState<string>('Mitochondria & Cellular Senescence');
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>([
    'Instagram',
    'LinkedIn',
  ]);
  const [creativeType, setCreativeType] = useState<CreativeType>('Poster');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('4:5');
  const [style, setStyle] = useState<VisualStyleType>('Clinical Editorial');
  const [headline, setHeadline] = useState<string>(
    'Master Orthomolecular Medicine & Theories of Aging'
  );
  const [cta, setCta] = useState<string>('Enroll in Free Course');
  const [audience, setAudience] = useState<string>(
    'Regulated Healthcare Professionals (Chiropractors, NDs, Nurses, MDs)'
  );
  const [extraPrompt, setExtraPrompt] = useState<string>('');
  const [variationsCount, setVariationsCount] = useState<number>(2);
  const [selectedAssets, setSelectedAssets] = useState<AssetItem[]>([
    {
      id: 'asset-logo-main',
      name: 'GIMA Official Logo',
      category: 'Logos',
      url: 'https://gim-academy.com/wp-content/uploads/2023/11/GLOBAL_IMA_LOGO_ALT_ALT-1-1600x362-1.png',
      description: 'Primary GIMA logo',
    },
    {
      id: 'asset-instructor-dr-meschino',
      name: 'Dr. James Meschino (Lead Instructor)',
      category: 'Instructor imagery',
      url: 'https://gim-academy.com/wp-content/plugins/gima-course-details/assets/images/dr-meschino.png',
      description: 'Dr. James Meschino, DC, MS, ROHP',
    },
  ]);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);

  // Generation Lifecycle State
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [generatedVariations, setGeneratedVariations] = useState<GeneratedVariation[]>([]);
  const [activeVariationIdx, setActiveVariationIdx] = useState<number>(0);
  const [savedProjectSuccess, setSavedProjectSuccess] = useState<boolean>(false);

  // Synchronize dynamic retrieved knowledge whenever course changes
  const retrievedKnowledge = useMemo(() => {
    return getKnowledgeForCourse(course).slice(0, 5);
  }, [course]);

  // Available courses list derived from authoritative brand configuration
  const allCourses = useMemo(() => {
    const list: { label: string; code?: string; type: string }[] = [
      { label: 'Theories of Aging', code: 'FREE-TOA', type: 'Free Course (12 PDFs)' },
      { label: 'Nutritional Medicine in Brain Development', code: 'FREE-BRAIN', type: 'Free Course' },
      { label: 'ROHP / RNCP Qualifying Program', code: 'ROHP', type: 'Certification Program' },
      ...brandConfig.curriculumCourses.map((c) => ({
        label: c.title,
        code: c.code,
        type: 'Core Curriculum',
      })),
    ];
    return list;
  }, [brandConfig]);

  const togglePlatform = (p: PlatformType) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const handleToggleAsset = (asset: AssetItem) => {
    setSelectedAssets((prev) => {
      const exists = prev.some((a) => a.id === asset.id);
      if (exists) {
        return prev.filter((a) => a.id !== asset.id);
      } else {
        return [...prev, asset];
      }
    });
  };

  // Execution handler
  const handleGenerate = async () => {
    setGenerationState('preparing');
    setProgressMsg('Initiating creative generation engine...');
    setProgressPercent(10);
    setSavedProjectSuccess(false);

    const request: GenerationRequest = {
      id: `gen-${Date.now()}`,
      title: headline || `${course} Promotional Creative`,
      campaignType,
      course,
      topic,
      platforms: selectedPlatforms,
      creativeType,
      aspectRatio,
      style,
      headline,
      cta,
      audience,
      language: 'English',
      brandEmphasis: 'Clinical Authority',
      variationsCount,
      referenceImages: selectedAssets,
      extraPrompt,
      retrievedKnowledge,
      brandInstructions: brandConfig.complianceRules,
      createdAt: new Date().toISOString(),
    };

    try {
      const provider = getImageProvider();
      const results = await provider.generate(request, (step, message, pct) => {
        setGenerationState(step as GenerationState);
        setProgressMsg(message);
        setProgressPercent(pct);
      });

      setGeneratedVariations(results);
      setGenerationState('success');
      logActivity({
        type: 'creative_draft',
        title: `Generated Creative: ${request.title}`,
        description: `Produced ${results.length} variations for ${course} (${style})`,
        metadata: { course, style, count: results.length },
      });
    } catch (err: any) {
      console.error(err);
      setGenerationState('error');
      setProgressMsg(err.message || 'Error occurred during creative generation.');
    }
  };

  const handleSaveToProjects = () => {
    if (!generatedVariations.length) return;

    const currentVar = generatedVariations[activeVariationIdx] || generatedVariations[0];
    const projectRecord: ProjectRecord = {
      id: `proj-${Date.now()}`,
      name: headline || `${course} ${creativeType}`,
      course,
      campaignType,
      creativeType,
      format: aspectRatio,
      platforms: selectedPlatforms,
      status: 'Draft',
      lastEdited: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      thumbnail: currentVar.previewImageUrl,
      request: {
        id: `req-${Date.now()}`,
        title: headline,
        campaignType,
        course,
        topic,
        platforms: selectedPlatforms,
        creativeType,
        aspectRatio,
        style,
        headline,
        cta,
        audience,
        language: 'English',
        brandEmphasis: 'Clinical Authority',
        variationsCount,
        referenceImages: selectedAssets,
        extraPrompt,
        retrievedKnowledge,
        brandInstructions: brandConfig.complianceRules,
        createdAt: new Date().toISOString(),
      },
      variations: generatedVariations,
    };

    saveProject(projectRecord);
    setSavedProjectSuccess(true);
    logActivity({
      type: 'project_created',
      title: `Saved Project: ${projectRecord.name}`,
      description: `Project archived with ${generatedVariations.length} variations.`,
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Page Title & Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900 uppercase tracking-wide">
              Studio Workspace
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-gima-navy">
              GIMA Intelligence Pipeline Active
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Creative Generation Studio
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure promotional specifications backed by authoritative GIMA clinical sources.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCourse('Theories of Aging');
              setHeadline('Evidence-Based Cellular Aging & Longevity Nutrition');
              setCta('Access Free Course Material');
              setExtraPrompt('Focus on Dr. Meschino lecture slides and glutathione cellular synthesis.');
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Load Free Course Preset
          </button>
        </div>
      </div>

      {/* Two-Column Desktop Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ======================================================== */}
        {/* LEFT COLUMN: CREATION FORM (7 COLS ON DESKTOP)          */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Primary Parameters */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gima-navy text-[11px] text-white font-semibold">
                  1
                </span>
                Campaign & Educational Focus
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Step 1 of 3</span>
            </div>

            {/* A. Campaign Type */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                A. Campaign Type
              </label>
              <select
                value={campaignType}
                onChange={(e) => setCampaignType(e.target.value as CampaignType)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:border-gima-navy focus:bg-white focus:outline-none transition-colors"
              >
                {campaignOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* B. Course / Topic */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                B. Target Course / Program
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:border-gima-navy focus:bg-white focus:outline-none transition-colors"
              >
                {allCourses.map((c) => (
                  <option key={c.label} value={c.label}>
                    {c.label} ({c.type})
                  </option>
                ))}
              </select>

              {/* Course Context Pill */}
              {course.includes('Theories of Aging') && (
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200/80 px-3 py-2 text-xs text-amber-900">
                  <BookOpen className="h-4 w-4 shrink-0 text-amber-700" />
                  <span>
                    Linked to <strong>12 Free Course PDFs</strong>. High-priority clinical retrieval active.
                  </span>
                </div>
              )}
            </div>

            {/* C. Platform (Multi-select) */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                C. Distribution Platforms
              </label>
              <div className="flex flex-wrap gap-2">
                {platformOptions.map((p) => {
                  const isChecked = selectedPlatforms.includes(p);
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => togglePlatform(p)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        isChecked
                          ? 'bg-gima-navy text-white shadow-subtle ring-1 ring-gima-navy'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {isChecked && <Check className="inline h-3 w-3 mr-1 stroke-[3]" />}
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* D. Creative Type & E. Aspect Ratio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  D. Creative Format
                </label>
                <select
                  value={creativeType}
                  onChange={(e) => setCreativeType(e.target.value as CreativeType)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:border-gima-navy focus:bg-white focus:outline-none transition-colors"
                >
                  {creativeTypeOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  E. Aspect Ratio
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as AspectRatioType)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:border-gima-navy focus:bg-white focus:outline-none transition-colors"
                >
                  {aspectRatioOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} — {opt.desc}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Card: Visual Style Selection */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gima-navy text-[11px] text-white font-semibold">
                  2
                </span>
                F. Visual Style Direction
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Selectable Style Tokens</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {visualStyles.map((vs) => {
                const isSelected = style === vs.title;
                return (
                  <div
                    key={vs.title}
                    onClick={() => setStyle(vs.title)}
                    className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                      isSelected
                        ? 'border-gima-navy bg-slate-50/80 ring-2 ring-gima-navy/20 shadow-subtle'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{vs.title}</span>
                      <span className="rounded bg-slate-200/80 px-1.5 py-0.5 text-[9px] font-semibold text-slate-700">
                        {vs.previewBadge}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                      {vs.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card: Reference Assets & Custom Prompt */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gima-navy text-[11px] text-white font-semibold">
                  3
                </span>
                G & H. Reference Assets & Direction
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Creative Controls</span>
            </div>

            {/* G. Reference Assets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800">
                  G. Reference Assets ({selectedAssets.length} Selected)
                </label>
                <button
                  type="button"
                  onClick={() => setIsAssetModalOpen(true)}
                  className="rounded-lg bg-gima-navy/10 px-2.5 py-1 text-xs font-semibold text-gima-navy hover:bg-gima-navy/20 transition-colors"
                >
                  + Use GIMA source assets
                </button>
              </div>

              {/* Selected Assets Preview Row */}
              <div className="flex flex-wrap gap-2.5 rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                {selectedAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm pr-3"
                  >
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="h-8 w-8 rounded object-cover border border-slate-100"
                    />
                    <div className="max-w-[140px] truncate">
                      <p className="text-[11px] font-semibold text-slate-800 truncate">
                        {asset.name}
                      </p>
                      <p className="text-[9px] text-slate-400 truncate">{asset.category}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleAsset(asset)}
                      className="text-slate-400 hover:text-red-500 text-xs ml-1"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* H. EXTRA REFERENCE PROMPT (High Importance) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800">
                  H. EXTRA REFERENCE PROMPT
                </label>
                <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                  Director Prompt
                </span>
              </div>
              <textarea
                rows={3}
                value={extraPrompt}
                onChange={(e) => setExtraPrompt(e.target.value)}
                placeholder="Tell GIMA AI exactly how you want the creative to look..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-gima-navy focus:bg-white focus:outline-none transition-colors"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Optional — add your creative direction, composition, mood, or specific visual requirements.
              </p>

              {/* Clickable prompt helpers */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {examplePrompts.map((p, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setExtraPrompt(p)}
                    className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors text-left"
                  >
                    &ldquo;{p.slice(0, 45)}...&rdquo;
                  </button>
                ))}
              </div>
            </div>

            {/* I. Structured Controls */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <span className="block text-xs font-bold text-slate-800">
                I. Creative Requirements & Copy
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Dominant Headline
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-gima-navy focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Call To Action (CTA)
                  </label>
                  <input
                    type="text"
                    value={cta}
                    onChange={(e) => setCta(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-gima-navy focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-gima-navy focus:outline-none"
                />
              </div>

              {/* J. Variations count */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-semibold text-slate-700">
                  J. Number of Variations
                </span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setVariationsCount(num)}
                      className={`h-7 w-7 rounded-lg text-xs font-bold transition-all ${
                        variationsCount === num
                          ? 'bg-gima-navy text-white shadow-sm'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* K. Generate Creative Button */}
            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generationState !== 'idle' && generationState !== 'success' && generationState !== 'error'}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gima-navy to-gima-navy-dark px-6 py-3.5 text-sm font-bold text-white shadow-elevated hover:from-gima-navy-light hover:to-gima-navy transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4 text-gima-gold-light" />
                <span>Generate Creative ({variationsCount} Variations)</span>
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: LIVE BRIEF & GENERATION PREVIEW (5 COLS)   */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 space-y-6">
          {/* Dynamic Creative Brief Summary (Updates Live!) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gima-navy" />
                <h3 className="text-sm font-bold text-slate-900">Live Creative Brief</h3>
              </div>
              <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                Live Sync
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Campaign:</span>
                <span className="font-semibold text-slate-800">{campaignType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Target Course:</span>
                <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">{course}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Platforms:</span>
                <span className="font-semibold text-slate-800">{selectedPlatforms.join(', ')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Format:</span>
                <span className="font-semibold text-slate-800">{creativeType} ({aspectRatio})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Visual Style:</span>
                <span className="font-semibold text-slate-800">{style}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Audience:</span>
                <span className="font-semibold text-slate-800 text-right max-w-[180px] truncate">{audience}</span>
              </div>
              {extraPrompt && (
                <div className="pt-1 text-slate-600 bg-amber-50/50 p-2 rounded-lg border border-amber-200/50 text-[11px]">
                  <span className="font-bold text-amber-900 block mb-0.5">Custom Direction:</span>
                  &ldquo;{extraPrompt}&rdquo;
                </div>
              )}
            </div>
          </div>

          {/* Retrieved GIMA Knowledge Snippets */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-gima-gold-dark" />
                <h4 className="text-xs font-bold text-slate-900">
                  Retrieved GIMA Clinical Knowledge ({retrievedKnowledge.length})
                </h4>
              </div>
              <span className="text-[10px] text-slate-400">Authoritative</span>
            </div>

            <div className="space-y-2">
              {retrievedKnowledge.length > 0 ? (
                retrievedKnowledge.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-slate-100 bg-slate-50/50 p-2.5 text-xs hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 truncate max-w-[180px]">
                        {item.sourceTitle}
                      </span>
                      <span className="rounded bg-white border border-slate-200 px-1.5 py-0.2 text-[9px] font-semibold text-slate-600">
                        {item.sourceType.toUpperCase()}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                    {item.topics && item.topics.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {item.topics.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-medium text-blue-700"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No specific documents matched course query.</p>
              )}
            </div>
          </div>

          {/* Generation Preview Area / Lifecycle States */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Generation Preview</h3>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                Phase 1 Demo Engine
              </span>
            </div>

            {/* State: Idle */}
            {generationState === 'idle' && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                <Sparkles className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-700">Awaiting Generation Trigger</p>
                <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                  Adjust parameters on the left and click &ldquo;Generate Creative&rdquo; to build high-fidelity composition previews.
                </p>
              </div>
            )}

            {/* State: Processing (Preparing / Retrieving / Generating / Review) */}
            {(generationState === 'preparing' ||
              generationState === 'retrieving' ||
              generationState === 'building_brief' ||
              generationState === 'generating' ||
              generationState === 'review') && (
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-6 text-center space-y-3 animate-fade-in">
                <div className="h-2 w-full overflow-hidden rounded-full bg-blue-100">
                  <div
                    className="h-full bg-gima-navy transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-gima-navy" />
                  <p className="text-xs font-bold text-gima-navy">{progressMsg}</p>
                </div>
                <p className="text-[10px] text-slate-500">
                  Applying authentic GIMA brand tokens & clinical source references...
                </p>
              </div>
            )}

            {/* State: Error */}
            {generationState === 'error' && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle className="h-4 w-4" />
                  <span>Creative generation service notice</span>
                </div>
                <p>{progressMsg}</p>
                <button
                  onClick={handleGenerate}
                  className="rounded-lg bg-red-700 px-3 py-1.5 text-white font-semibold text-[11px] hover:bg-red-800"
                >
                  Retry Generation
                </button>
              </div>
            )}

            {/* State: Success / Demo Preview */}
            {generationState === 'success' && generatedVariations.length > 0 && (
              <div className="space-y-4 animate-fade-in">
                {/* Variation Tabs */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5">
                    {generatedVariations.map((v, idx) => (
                      <button
                        key={v.id}
                        onClick={() => setActiveVariationIdx(idx)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                          activeVariationIdx === idx
                            ? 'bg-gima-navy text-white shadow-subtle'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Variation {v.variationNumber}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Ready
                  </span>
                </div>

                {/* Composition Card Preview */}
                {(() => {
                  const current = generatedVariations[activeVariationIdx];
                  return (
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900 text-white shadow-card">
                      {/* Visual Header / Lead asset */}
                      <div className="relative aspect-video w-full overflow-hidden bg-slate-800">
                        <img
                          src={current.previewImageUrl}
                          alt="Creative Lead"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
                        
                        {/* Style Badge */}
                        <div className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold text-gima-gold-light border border-white/10">
                          {current.style}
                        </div>

                        {/* Format tag */}
                        <div className="absolute top-3 right-3 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold text-slate-200 border border-white/10">
                          {current.aspectRatio}
                        </div>
                      </div>

                      {/* Content Composition Area */}
                      <div className="p-5 space-y-3 bg-gradient-to-b from-slate-950 to-slate-900">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gima-gold-light">
                          {brandConfig.acronym} CERTIFIED CURRICULUM
                        </span>

                        <h4 className="text-base font-extrabold text-white leading-snug">
                          {current.compositionHeadline}
                        </h4>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {current.compositionSubhead}
                        </p>

                        <div className="pt-2 flex items-center justify-between">
                          <span className="inline-flex items-center rounded-lg bg-gima-gold px-3 py-1.5 text-xs font-bold text-gima-navy-dark shadow-sm">
                            {current.ctaText}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {audience.slice(0, 30)}...
                          </span>
                        </div>
                      </div>

                      {/* Phase 1 Notice Bar */}
                      <div className="border-t border-white/10 bg-black/40 px-4 py-2 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Deterministic Preview Composition</span>
                        <span className="text-amber-300">Phase 2 Provider Ready</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Actions: Save to Projects, Retry */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleSaveToProjects}
                    disabled={savedProjectSuccess}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                      savedProjectSuccess
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gima-navy text-white hover:bg-gima-navy-light shadow-subtle'
                    }`}
                  >
                    {savedProjectSuccess ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Saved in Projects!</span>
                      </>
                    ) : (
                      <>
                        <FolderPlus className="h-4 w-4" />
                        <span>Save to Project Workspace</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleGenerate}
                    className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
                    title="Regenerate variations"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Asset Picker Modal */}
      <AssetPickerModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        selectedAssets={selectedAssets}
        onToggleAsset={handleToggleAsset}
      />
    </div>
  );
}

export default function CreateCreativePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-gima-navy" />
        </div>
      }
    >
      <CreateCreativeContent />
    </Suspense>
  );
}
