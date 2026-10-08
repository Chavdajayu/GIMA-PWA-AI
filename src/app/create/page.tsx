'use client';

import React, { useState, useEffect, useMemo, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  BookOpen,
  Layers,
  Upload,
  Check,
  ChevronDown,
  ChevronUp,
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
  Download,
  X,
  ZoomIn,
  MessageSquare,
  PlusCircle,
  Cpu,
  Copy,
  ExternalLink,
  FileDown,
  ClipboardPaste,
  ImageIcon,
  ArrowRight,
  Trash2,
  ExternalLink as LinkIcon
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
  ProjectRecord,
  ApiProviderStatus,
  GenerationMode,
  PollinationsModelItem,
  PollinationsStatusResponse,
  GenerationSlot,
  SlotStatus
} from '@/lib/types';
import {
  getBrandConfig,
  getKnowledgeForCourse,
  searchKnowledge
} from '@/lib/knowledge';
import {
  getImageProvider,
  setImageProvider,
  GeminiImageProvider,
  DeterministicDemoProvider,
  PollinationsImageProvider,
  checkServerProviderStatus,
  fetchLivePollinationsModels,
  checkPollinationsStatus
} from '@/lib/imageProvider';
import {
  composeGenerationPrompt,
  buildGeminiWebPrompt,
  buildGeminiVariationPrompts,
  buildGeminiRefinementPrompt,
  getKnowledgeSourcesSummary
} from '@/lib/promptComposer';
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

const creativeTypes: CreativeType[] = [
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
  'Create a premium, professional promotional poster for GIMA\'s Theories of Aging free course. Use a sophisticated clinical editorial aesthetic, strong visual hierarchy, professional healthcare imagery, accurate readable typography, and the supplied GIMA identity. Focus on the educational theme of healthy aging and cellular mechanisms using only the supplied GIMA information. Make it look like a professionally art-directed human marketing campaign, not a generic AI image.',
  'Use a premium clinical editorial look with Dr. Meschino on the right and course title on the left.',
  'Make the headline dominant and keep the GIMA logo subtle and refined at top center.',
  'Emphasize evidence-based clinical studies on glutathione synthesis, not generic stock imagery.',
];

function CreateCreativeContent() {
  const searchParams = useSearchParams();
  const brandConfig = useMemo(() => getBrandConfig(), []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Provider & Generation Mode State (Default is pollinations if configured, fallback to gemini-web-handoff)
  const [generationMode, setGenerationMode] = useState<GenerationMode>('pollinations');
  const [providerStatus, setProviderStatus] = useState<ApiProviderStatus | null>(null);
  const [pollinationsModels, setPollinationsModels] = useState<PollinationsModelItem[]>([]);
  const [selectedPollinationsModel, setSelectedPollinationsModel] = useState<string>('openai/gpt-image-2');
  const [pollinationsStatus, setPollinationsStatus] = useState<PollinationsStatusResponse | null>(null);

  // Form State
  const [campaignType, setCampaignType] = useState<CampaignType>(
    (searchParams.get('campaignType') as CampaignType) || 'Free Course Promotion'
  );
  const [course, setCourse] = useState<string>(
    searchParams.get('course') || 'Theories of Aging'
  );
  const [topic, setTopic] = useState<string>('Cellular Senescence, Free Radicals & Glycation');
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>([
    'Instagram',
  ]);
  const [creativeType, setCreativeType] = useState<CreativeType>('Poster');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('4:5');
  const [style, setStyle] = useState<VisualStyleType>('Clinical Editorial');
  const [headline, setHeadline] = useState<string>(
    'Theories of Aging: Cellular Mechanisms & Longevity Science'
  );
  const [cta, setCta] = useState<string>('Enroll Free Today');
  const [audience, setAudience] = useState<string>(
    'Integrative Practitioners, Nutritionists, Healthcare Students'
  );
  const [extraPrompt, setExtraPrompt] = useState<string>(
    'Create a premium, professional promotional poster for GIMA\'s Theories of Aging free course. Use a sophisticated clinical editorial aesthetic, clear visual hierarchy, refined healthcare imagery, accurate readable typography, and the supplied GIMA identity. Focus on the educational theme of healthy aging and cellular mechanisms using only the supplied GIMA information. Make it look like a professionally art-directed human marketing campaign, not a generic AI image.'
  );
  const [variationsCount, setVariationsCount] = useState<number>(1);
  const [selectedAssets, setSelectedAssets] = useState<AssetItem[]>([
    {
      id: 'asset-logo-main',
      name: 'GIMA Official Logo',
      category: 'Logos',
      url: 'https://gim-academy.com/wp-content/uploads/2023/11/GLOBAL_IMA_LOGO_ALT_ALT-1-1600x362-1.png',
      description: 'Primary GIMA logo with gold emblem and deep navy typography.',
    },
    {
      id: 'asset-instructor-dr-meschino',
      name: 'Dr. James Meschino (Lead Faculty)',
      category: 'Instructor imagery',
      url: 'https://gim-academy.com/wp-content/plugins/gima-course-details/assets/images/dr-meschino.png',
      description: 'Dr. James Meschino, DC, MS, ROHP - Academic Director & Lead Faculty.',
    },
  ]);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);

  // Generation & Handoff Lifecycle State
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [generatedVariations, setGeneratedVariations] = useState<GeneratedVariation[]>([]);
  const [activeVariationIdx, setActiveVariationIdx] = useState<number>(0);
  const [savedProjectSuccess, setSavedProjectSuccess] = useState<boolean>(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  // Progressive Slots & Performance Metrics (Phase 3.1)
  const [slots, setSlots] = useState<GenerationSlot[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [timeToFirstImage, setTimeToFirstImage] = useState<number | null>(null);
  const [totalGenerationTime, setTotalGenerationTime] = useState<number | null>(null);
  const [selectedLightboxSlot, setSelectedLightboxSlot] = useState<GenerationSlot | null>(null);
  const [isBriefExpanded, setIsBriefExpanded] = useState<boolean>(false);

  // Gemini Handoff specifics
  const [preparedWebPrompt, setPreparedWebPrompt] = useState<string>('');
  const [preparedVariationPrompts, setPreparedVariationPrompts] = useState<{ variationNumber: number; title: string; styleDescription: string; prompt: string }[]>([]);
  const [activeVariationPromptTab, setActiveVariationPromptTab] = useState<number>(0);
  const [copiedPromptStatus, setCopiedPromptStatus] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Refinement drawer state
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [refinementInput, setRefinementInput] = useState<string>('');
  const [copiedRefinementStatus, setCopiedRefinementStatus] = useState<boolean>(false);

  // Check server configuration and load live Pollinations models on mount
  useEffect(() => {
    checkServerProviderStatus().then((status) => {
      setProviderStatus(status);
      if (status.pollinationsConfigured) {
        setGenerationMode('pollinations');
      } else {
        setGenerationMode('gemini-web-handoff');
      }
    });

    checkPollinationsStatus().then((pollStatus) => {
      setPollinationsStatus(pollStatus);
    });

    fetchLivePollinationsModels().then((models) => {
      if (models && models.length > 0) {
        setPollinationsModels(models);
        const preferred = models.find((m) => m.id === 'openai/gpt-image-2') || models[0];
        setSelectedPollinationsModel(preferred.id);
      }
    });
  }, []);

  // Synchronize dynamic retrieved knowledge whenever course changes
  const retrievedKnowledge = useMemo(() => {
    if (course.toLowerCase().includes('theories') || campaignType === 'Free Course Promotion') {
      return searchKnowledge(topic || '', { course: 'Theories of Aging' }).slice(0, 5);
    }
    return getKnowledgeForCourse(course).slice(0, 5);
  }, [course, campaignType, topic]);

  // Derived list of source documents used
  const knowledgeSourcesUsed = useMemo(() => {
    return getKnowledgeSourcesSummary(retrievedKnowledge);
  }, [retrievedKnowledge]);

  // Global paste handler for Ctrl+V image import
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      // Only handle paste if we are in handoff_ready, waiting_gemini, or success state
      if (generationMode !== 'gemini-web-handoff') return;
      if (generationState !== 'handoff_ready' && generationState !== 'waiting_gemini' && generationState !== 'success') {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      let foundImage = false;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            foundImage = true;
            processImportedImageFile(file);
            break;
          }
        }
      }

      if (!foundImage && e.clipboardData?.getData('text')) {
        // If user pasted text in an input/textarea, do not show error
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
          return;
        }
        setImportError('Clipboard contains text, not an image. Please copy or download the generated image from Gemini.');
        setTimeout(() => setImportError(null), 4000);
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [generationMode, generationState, headline, course, extraPrompt, cta, aspectRatio, style, generatedVariations]);

  // ESC key closes fullscreen lightbox modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedLightboxSlot(null);
        setIsLightboxOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Available courses list
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

  // Helper to build a current request object
  const buildCurrentRequest = (): GenerationRequest => ({
    id: `req-${Date.now()}`,
    title: headline || `${course} ${creativeType}`,
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
  });

  // Download Generated Image
  const handleDownload = (dataUrl: string, varNum: number) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `GIMA-${course.replace(/[^a-zA-Z0-9]/g, '_')}-var${varNum}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add generated image to reference assets
  const handleUseAsReference = (dataUrl: string) => {
    const newAsset: AssetItem = {
      id: `asset-gen-${Date.now()}`,
      name: `Generated: ${headline.slice(0, 25)}...`,
      category: 'Uploaded references',
      url: dataUrl,
      description: `Imported from Gemini Pro for ${course}`,
    };
    setSelectedAssets((prev) => [...prev, newAsset]);
    alert('Added generated composition to Reference Assets for further iteration!');
  };

  // Download reference assets individually or as batch with clean names
  const handleDownloadReference = (asset: AssetItem) => {
    const filename = asset.name.toLowerCase().includes('logo')
      ? 'GIMA-Logo.png'
      : asset.name.toLowerCase().includes('meschino')
      ? 'GIMA-Dr-James-Meschino.png'
      : `${asset.name.replace(/[^a-zA-Z0-9]/g, '-')}.png`;

    const downloadUrl = `/api/download-asset?url=${encodeURIComponent(asset.url)}&filename=${encodeURIComponent(filename)}`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAllReferences = async () => {
    for (let i = 0; i < selectedAssets.length; i++) {
      handleDownloadReference(selectedAssets[i]);
      await new Promise((r) => setTimeout(r, 400));
    }
    logActivity({
      type: 'references_exported',
      title: 'Reference Assets Exported',
      description: `Exported ${selectedAssets.length} GIMA brand reference assets for Gemini input.`,
    });
  };

  // Process imported image file (from drop, file picker, or paste)
  const processImportedImageFile = (file: File) => {
    setImportError(null);
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setImportError('Invalid file format. Please upload a PNG, JPG, or WEBP image.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setImportError('File exceeds 15MB limit. Please upload a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        const newVar: GeneratedVariation = {
          id: `var-handoff-${Date.now()}`,
          variationNumber: generatedVariations.length + 1,
          previewImageUrl: dataUrl,
          compositionHeadline: headline || `${course} Promotional Creative`,
          compositionSubhead: extraPrompt
            ? `${course} — "${extraPrompt.slice(0, 65)}..."`
            : `Designed exclusively for Healthcare Professionals | ${course}`,
          ctaText: cta || 'Enroll Free Today',
          aspectRatio,
          style,
          isDeterministicDemo: false,
          isRealGemini: true,
          source: 'gemini-web-handoff',
          isWebHandoff: true,
          modelUsed: 'Google Gemini Pro (Web)',
          notes: `Generated via Google Gemini Pro Web Handoff (${aspectRatio}) | Style: ${style}`,
        };

        setGeneratedVariations((prev) => [newVar, ...prev]);
        setSlots((prev) => [
          {
            index: prev.length,
            variationNumber: prev.length + 1,
            status: 'ready',
            variation: newVar,
          },
          ...prev,
        ]);
        setActiveVariationIdx(0);
        setGenerationState('success');
        setImportSuccessMsg('Gemini image imported successfully!');
        setTimeout(() => setImportSuccessMsg(null), 4000);

        logActivity({
          type: 'gemini_result_imported',
          title: 'Gemini Result Imported',
          description: `Imported creative generated in Google Gemini Pro for ${course}.`,
          metadata: { course, style, format: aspectRatio }
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImportedImageFile(e.dataTransfer.files[0]);
    }
  };

  // ========================================================
  // PRIMARY ACTION: PREPARE IN GEMINI (Web Handoff Mode)
  // ========================================================
  const handlePrepareGeminiHandoff = async () => {
    setGenerationState('preparing');
    setProgressMsg('Preparing GIMA creative brief...');
    setProgressPercent(15);
    setSavedProjectSuccess(false);

    const req = buildCurrentRequest();

    await new Promise((r) => setTimeout(r, 450));
    setGenerationState('retrieving');
    setProgressMsg(`Retrieving relevant GIMA knowledge (${retrievedKnowledge.length} sources)...`);
    setProgressPercent(40);

    await new Promise((r) => setTimeout(r, 550));
    setGenerationState('building_brief');
    setProgressMsg(`Building verified creative brief & GIMA brand rules (${style})...`);
    setProgressPercent(65);

    await new Promise((r) => setTimeout(r, 450));
    setProgressMsg('Preparing structured Gemini Pro prompt...');
    setProgressPercent(85);

    const mainPrompt = buildGeminiWebPrompt(req, brandConfig, retrievedKnowledge);
    const varPrompts = buildGeminiVariationPrompts(req, brandConfig, retrievedKnowledge);

    setPreparedWebPrompt(mainPrompt);
    setPreparedVariationPrompts(varPrompts);
    setActiveVariationPromptTab(0);

    await new Promise((r) => setTimeout(r, 350));
    setProgressMsg('Preparing reference assets...');
    setProgressPercent(100);

    await new Promise((r) => setTimeout(r, 300));
    setGenerationState('handoff_ready');

    logActivity({
      type: 'handoff_prepared',
      title: `Gemini Handoff Prepared: ${req.title}`,
      description: `Structured creative prompt built with ${retrievedKnowledge.length} knowledge sources and ${selectedAssets.length} references.`,
      metadata: { course, style, format: aspectRatio }
    });
  };

  // Copy Gemini Prompt Action
  const handleCopyPrompt = async (promptText: string, label: string = 'Prompt copied') => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopiedPromptStatus(label);
      setTimeout(() => setCopiedPromptStatus(null), 3500);

      logActivity({
        type: 'prompt_copied',
        title: 'Gemini Prompt Copied',
        description: `Prompt copied to clipboard for ${course}.`,
      });
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  // Copy All Variation Prompts
  const handleCopyAllVariations = async () => {
    const allText = preparedVariationPrompts
      .map((v) => `=== VARIATION ${v.variationNumber}: ${v.title.toUpperCase()} ===\n${v.prompt}\n\n`)
      .join('\n');
    await handleCopyPrompt(allText, `All ${preparedVariationPrompts.length} variation prompts copied!`);
  };

  // Open Gemini Action
  const handleOpenGemini = () => {
    window.open('https://gemini.google.com/app', '_blank', 'noopener,noreferrer');
    setGenerationState('waiting_gemini');
    logActivity({
      type: 'gemini_tab_opened',
      title: 'Google Gemini Opened',
      description: 'Navigated to gemini.google.com/app in new tab.',
    });
  };

  // Refine in Gemini Action
  const handleGenerateRefinementPrompt = () => {
    if (!refinementInput.trim()) return;
    const currentPrompt = preparedWebPrompt || buildGeminiWebPrompt(buildCurrentRequest(), brandConfig, retrievedKnowledge);
    const refinedText = buildGeminiRefinementPrompt(currentPrompt, refinementInput, `Current Headline: ${headline}`);
    navigator.clipboard.writeText(refinedText);
    setCopiedRefinementStatus(true);
    setTimeout(() => setCopiedRefinementStatus(false), 3500);
  };

  // Aspect ratio class helper for clean visual slots
  const getAspectClass = (ratio: AspectRatioType) => {
    switch (ratio) {
      case '1:1':
        return 'aspect-square';
      case '4:5':
        return 'aspect-[4/5]';
      case '16:9':
        return 'aspect-video';
      case '9:16':
        return 'aspect-[9/16]';
      case 'A4':
        return 'aspect-[1/1.414]';
      default:
        return 'aspect-[4/5]';
    }
  };

  // Retry a single failed slot independently
  const handleRetrySlot = async (slotIndex: number) => {
    const slot = slots[slotIndex];
    if (!slot || isGenerating) return;

    const retryStart = Date.now();
    setSlots((prev) =>
      prev.map((s) =>
        s.index === slotIndex
          ? { ...s, status: 'generating', error: undefined, startTime: retryStart }
          : s
      )
    );

    try {
      const provider = new PollinationsImageProvider(selectedPollinationsModel);
      const req = buildCurrentRequest();
      const resultVar = await provider.generateSingleVariation(req, slotIndex);

      setSlots((prev) =>
        prev.map((s) =>
          s.index === slotIndex
            ? {
                ...s,
                status: 'ready',
                variation: resultVar,
                durationMs: Date.now() - retryStart,
              }
            : s
        )
      );

      setGeneratedVariations((prev) => {
        const filtered = prev.filter((v) => v.id !== resultVar.id);
        return [...filtered, resultVar].sort((a, b) => a.variationNumber - b.variationNumber);
      });
    } catch (err: any) {
      setSlots((prev) =>
        prev.map((s) =>
          s.index === slotIndex
            ? {
                ...s,
                status: 'error',
                error: err.message || 'Retry failed',
              }
            : s
        )
      );
    }
  };

  // Save single slot variation to projects
  const handleSaveSlotToProjects = (slot: GenerationSlot) => {
    if (!slot.variation) return;
    const projectRecord: ProjectRecord = {
      id: `proj-${Date.now()}-${slot.variationNumber}`,
      name: `${headline || course} (Var ${slot.variationNumber})`,
      course,
      campaignType,
      creativeType,
      format: aspectRatio,
      platforms: selectedPlatforms,
      status: 'Draft',
      lastEdited: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      thumbnail: slot.variation.previewImageUrl,
      request: buildCurrentRequest(),
      variations: [slot.variation],
      provider: generationMode,
      prompt: slot.variation.promptSummary || headline,
      extraPrompt,
      knowledgeSources: knowledgeSourcesUsed,
      referenceAssets: selectedAssets.map((a) => a.name),
      generatedAt: new Date().toISOString(),
    };
    saveProject(projectRecord);
    setSavedProjectSuccess(true);
    setTimeout(() => setSavedProjectSuccess(false), 3000);
    logActivity({
      type: 'project_saved',
      title: `Saved Project: ${projectRecord.name}`,
      description: `Saved Variation ${slot.variationNumber} (${generationMode}).`,
    });
  };

  // ========================================================
  // REAL GENERATION ACTION: PROGRESSIVE POLLINATIONS / DEMO
  // ========================================================
  const handleDirectGeneration = async (customInstruction?: string) => {
    if (isGenerating) return;

    const req = buildCurrentRequest();
    if (customInstruction) {
      req.extraPrompt = `${req.extraPrompt} ${customInstruction}`.trim();
    }

    setSavedProjectSuccess(false);

    // ========================================================
    // POLLINATIONS TRUE PROGRESSIVE GENERATION (PHASE 3.1)
    // ========================================================
    if (generationMode === 'pollinations') {
      const targetCount = Math.max(1, Math.min(4, variationsCount));
      const sessionStart = Date.now();
      setTimeToFirstImage(null);
      setTotalGenerationTime(null);
      setIsGenerating(true);
      setGenerationState('generating');
      setProgressMsg(`Starting ${targetCount} visual variation${targetCount > 1 ? 's' : ''} in parallel...`);

      // 1. Immediately create N skeletons!
      const initialSlots: GenerationSlot[] = Array.from({ length: targetCount }, (_, i) => ({
        index: i,
        variationNumber: i + 1,
        status: 'generating',
        startTime: sessionStart,
      }));
      setSlots(initialSlots);

      const provider = new PollinationsImageProvider(selectedPollinationsModel);
      let firstCompleted = false;

      // 2. Fire concurrent independent requests!
      const promises = initialSlots.map(async (slot) => {
        try {
          const resultVar = await provider.generateSingleVariation(req, slot.index);
          const finishedAt = Date.now();

          // Time to First Image metric
          if (!firstCompleted) {
            firstCompleted = true;
            setTimeToFirstImage(finishedAt - sessionStart);
          }

          // Replace ONLY this slot's skeleton immediately!
          setSlots((prev) =>
            prev.map((s) =>
              s.index === slot.index
                ? {
                    ...s,
                    status: 'ready',
                    variation: resultVar,
                    durationMs: finishedAt - slot.startTime!,
                  }
                : s
            )
          );

          // Update generatedVariations preserving fixed order
          setGeneratedVariations((prev) => {
            const filtered = prev.filter((v) => v.id !== resultVar.id);
            return [...filtered, resultVar].sort((a, b) => a.variationNumber - b.variationNumber);
          });

          return resultVar;
        } catch (err: any) {
          console.error(`[Slot ${slot.variationNumber} Error]:`, err);
          let errMsg = err.message || 'Generation failed.';
          if (errMsg.includes('401') || errMsg.includes('INVALID_API_KEY')) {
            errMsg = 'API key rejected.';
          } else if (errMsg.includes('402') || errMsg.includes('INSUFFICIENT_BALANCE')) {
            errMsg = 'Insufficient Pollen balance.';
          } else if (errMsg.includes('429') || errMsg.includes('RATE_LIMITED')) {
            errMsg = 'Rate limit reached.';
          } else if (errMsg.includes('404') || errMsg.includes('MODEL_NOT_FOUND')) {
            errMsg = 'Model unavailable.';
          }

          setSlots((prev) =>
            prev.map((s) =>
              s.index === slot.index
                ? {
                    ...s,
                    status: 'error',
                    error: errMsg,
                  }
                : s
            )
          );
          throw err;
        }
      });

      const settled = await Promise.allSettled(promises);
      const totalTime = Date.now() - sessionStart;
      setTotalGenerationTime(totalTime);
      setIsGenerating(false);

      const successCount = settled.filter((s) => s.status === 'fulfilled').length;
      if (successCount > 0) {
        setGenerationState('success');
        setProgressMsg(`${successCount} of ${targetCount} ready`);
        logActivity({
          type: 'creative_draft',
          title: `Generated Creatives: ${req.title}`,
          description: `Produced ${successCount} of ${targetCount} variations using Pollinations AI (${selectedPollinationsModel}) in ${(totalTime / 1000).toFixed(1)}s.`,
          metadata: {
            course,
            style,
            count: successCount,
            model: selectedPollinationsModel,
            provider: 'pollinations',
          },
        });
      } else {
        setGenerationState('error');
        setProgressMsg('All variation requests failed. Check Settings to verify Pollen balance.');
      }
      return;
    }

    // ========================================================
    // GEMINI API OR DEMO PREVIEW (Legacy fallback)
    // ========================================================
    setIsGenerating(true);
    setGenerationState('preparing');
    setProgressMsg('Preparing generation engine...');
    setProgressPercent(15);

    const targetCount = Math.max(1, Math.min(4, variationsCount));
    const initialSlots: GenerationSlot[] = Array.from({ length: targetCount }, (_, i) => ({
      index: i,
      variationNumber: i + 1,
      status: 'generating',
      startTime: Date.now(),
    }));
    setSlots(initialSlots);

    try {
      const provider = generationMode === 'gemini-api'
        ? new GeminiImageProvider()
        : new DeterministicDemoProvider();

      setImageProvider(provider);

      const results = await provider.generate(req, (step: any, message: string, pct: number) => {
        setGenerationState(step as GenerationState);
        setProgressMsg(message);
        setProgressPercent(pct);
      });

      const newSlots: GenerationSlot[] = results.map((v, idx) => ({
        index: idx,
        variationNumber: idx + 1,
        status: 'ready',
        variation: v,
        durationMs: v.generationTimeMs,
      }));

      setSlots(newSlots);
      setGeneratedVariations(results);
      setActiveVariationIdx(0);
      setGenerationState('success');
      setIsGenerating(false);
    } catch (err: any) {
      console.error(err);
      setGenerationState('error');
      setIsGenerating(false);
      setProgressMsg(err.message || 'Generation failed.');
    }
  };

  // Primary Button Trigger
  const handlePrimaryAction = () => {
    if (generationMode === 'gemini-web-handoff') {
      handlePrepareGeminiHandoff();
    } else {
      handleDirectGeneration();
    }
  };

  // Save to Projects
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
      request: buildCurrentRequest(),
      variations: generatedVariations,
      provider: generationMode,
      prompt: preparedWebPrompt,
      extraPrompt,
      knowledgeSources: knowledgeSourcesUsed,
      referenceAssets: selectedAssets.map((a) => a.name),
      generatedAt: new Date().toISOString(),
    };

    saveProject(projectRecord);
    setSavedProjectSuccess(true);
    logActivity({
      type: 'project_saved',
      title: `Saved Project: ${projectRecord.name}`,
      description: `Project archived with ${generatedVariations.length} variation(s) (${generationMode}).`,
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
            {generationMode === 'pollinations' ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                Pollinations AI ({selectedPollinationsModel.split('/')[1] || selectedPollinationsModel}) — Ready
                {pollinationsStatus?.balanceText ? ` • ${pollinationsStatus.balanceText}` : ''}
              </span>
            ) : generationMode === 'gemini-web-handoff' ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                Gemini Pro Web Handoff (Ready)
              </span>
            ) : generationMode === 'gemini-api' ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Gemini API — Quota Limit: 0 (Free Tier)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                Deterministic Demo Mode
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Creative Generation Studio
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {generationMode === 'pollinations'
              ? 'Real AI image generation powered by Pollinations multi-model developer catalog and authoritative GIMA clinical sources.'
              : generationMode === 'gemini-web-handoff'
              ? 'GIMA AI Studio prepares verified clinical briefs; your signed-in Gemini Pro subscription generates the real creative.'
              : 'Generate promotional campaigns powered by Google Gemini and authoritative GIMA clinical sources.'}
          </p>
        </div>

        {/* Header Preset & Quick Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCourse('Theories of Aging');
              setCampaignType('Free Course Promotion');
              setCreativeType('Poster');
              setAspectRatio('4:5');
              setStyle('Clinical Editorial');
              setHeadline('Theories of Aging: Cellular Mechanisms & Longevity Science');
              setCta('Enroll Free Today');
              setAudience('Integrative Practitioners, Nutritionists, Healthcare Students');
              setExtraPrompt(
                'Create a premium, professional promotional poster for GIMA\'s Theories of Aging free course. Use a sophisticated clinical editorial aesthetic, clear visual hierarchy, refined healthcare imagery, accurate readable typography, and the supplied GIMA identity. Focus on the educational theme of healthy aging and cellular mechanisms using only the supplied GIMA information. Make it look like a professionally art-directed human marketing campaign, not a generic AI image.'
              );
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-subtle"
          >
            Load Verified Preset
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Left Configuration (7 Cols) & Right Preview/Handoff (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* LEFT COLUMN: CREATIVE SPECIFICATIONS (7 COLS)            */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Creative Specifications</h3>
              <span className="text-xs text-slate-500">GIMA Clinical Campaign Brief</span>
            </div>

            {/* A. Campaign Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                A. Campaign Type
              </label>
              <select
                value={campaignType}
                onChange={(e) => setCampaignType(e.target.value as CampaignType)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-gima-navy focus:outline-none"
              >
                {campaignOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* B. Course Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                B. GIMA Target Curriculum Course
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-gima-navy focus:outline-none"
              >
                {allCourses.map((c) => (
                  <option key={c.label} value={c.label}>
                    {c.label} {c.code ? `(${c.code})` : ''} — {c.type}
                  </option>
                ))}
              </select>
            </div>

            {/* C. Target Platform */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                C. Deployment Platform(s)
              </label>
              <div className="flex flex-wrap gap-2">
                {platformOptions.map((p) => {
                  const active = selectedPlatforms.includes(p);
                  return (
                    <button
                      type="button"
                      key={p}
                      onClick={() => togglePlatform(p)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        active
                          ? 'bg-gima-navy text-white shadow-subtle'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* D. Creative Type & Aspect Ratio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  D. Creative Format
                </label>
                <select
                  value={creativeType}
                  onChange={(e) => setCreativeType(e.target.value as CreativeType)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-gima-navy focus:outline-none"
                >
                  {creativeTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  E. Target Aspect Ratio
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as AspectRatioType)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-gima-navy focus:outline-none"
                >
                  {aspectRatioOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} ({opt.desc})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* F. Visual Style Direction */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                F. Visual Style Directives
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {visualStyles.map((vs) => {
                  const active = style === vs.title;
                  return (
                    <div
                      key={vs.title}
                      onClick={() => setStyle(vs.title)}
                      className={`cursor-pointer rounded-xl border p-3 transition-all ${
                        active
                          ? 'border-gima-navy bg-blue-50/40 ring-1 ring-gima-navy'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">{vs.title}</span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
                          {vs.previewBadge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{vs.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* G. Reference Assets */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  G. GIMA Reference Assets ({selectedAssets.length} active)
                </label>
                <button
                  type="button"
                  onClick={() => setIsAssetModalOpen(true)}
                  className="text-xs font-bold text-gima-navy hover:text-gima-navy-light"
                >
                  Manage Assets +
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700"
                  >
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="h-6 w-6 rounded object-cover border border-slate-200"
                    />
                    <span className="font-medium truncate max-w-[140px]">{asset.name}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleAsset(asset)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* H. Copy Requirements */}
            <div className="space-y-3 pt-1">
              <span className="text-xs font-semibold text-slate-700 block">
                H. Mandatory Copy & Messaging
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

              {/* Extra Prompt Guidance */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-slate-700">
                    Custom Creative Direction (Admin Prompt)
                  </label>
                  <span className="text-[10px] text-slate-400">Incorporated into Gemini prompt</span>
                </div>
                <textarea
                  rows={3}
                  value={extraPrompt}
                  onChange={(e) => setExtraPrompt(e.target.value)}
                  placeholder="Specify composition accents, lighting, background medical textures, or focal layout..."
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-gima-navy focus:outline-none"
                />
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {examplePrompts.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setExtraPrompt(p)}
                      className="text-[10px] text-slate-500 hover:text-gima-navy bg-slate-100 px-2 py-0.5 rounded-full hover:bg-slate-200 transition-colors truncate max-w-[220px]"
                    >
                      {p}
                    </button>
                  ))}
                </div>
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

            {/* Mode Selector & Primary Trigger Action */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              {/* Generation Mode Selector */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-gima-navy" />
                    Generation Workflow Mode
                  </span>
                  <div className="grid grid-cols-2 sm:flex sm:items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-lg text-[11px]">
                    <button
                      type="button"
                      onClick={() => setGenerationMode('pollinations')}
                      className={`px-2.5 py-1 rounded font-semibold transition-all ${
                        generationMode === 'pollinations'
                          ? 'bg-gima-navy text-white shadow-subtle'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Pollinations AI
                    </button>
                    <button
                      type="button"
                      onClick={() => setGenerationMode('gemini-web-handoff')}
                      className={`px-2 py-1 rounded font-semibold transition-all ${
                        generationMode === 'gemini-web-handoff'
                          ? 'bg-gima-navy text-white shadow-subtle'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Gemini Handoff
                    </button>
                    <button
                      type="button"
                      onClick={() => setGenerationMode('gemini-api')}
                      className={`px-2 py-1 rounded font-semibold transition-all ${
                        generationMode === 'gemini-api'
                          ? 'bg-gima-navy text-white shadow-subtle'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Gemini API
                    </button>
                    <button
                      type="button"
                      onClick={() => setGenerationMode('demo-preview')}
                      className={`px-2 py-1 rounded font-semibold transition-all ${
                        generationMode === 'demo-preview'
                          ? 'bg-gima-navy text-white shadow-subtle'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Demo Preview
                    </button>
                  </div>
                </div>

                {/* Pollinations Model Selection Card */}
                {generationMode === 'pollinations' && (
                  <div className="rounded-lg border border-emerald-200 bg-white p-3 space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                        <Cpu className="h-3 w-3 text-emerald-700" />
                        Active Pollinations Model
                      </label>
                      <div className="flex items-center gap-1.5">
                        {pollinationsStatus?.balanceText && (
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {pollinationsStatus.balanceText}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 font-medium">
                          {pollinationsModels.length > 0 ? `${pollinationsModels.length} models live` : 'Catalog ready'}
                        </span>
                      </div>
                    </div>

                    <select
                      value={selectedPollinationsModel}
                      onChange={(e) => setSelectedPollinationsModel(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:border-gima-navy focus:outline-none"
                    >
                      {pollinationsModels.length > 0 ? (
                        pollinationsModels.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name || m.id} ({m.publisher}) {m.supportsReferenceImages ? '— [Supports Image Input]' : ''}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="openai/gpt-image-2">GPT Image 2 (OpenAI) — Multimodal</option>
                          <option value="tongyi-mai/z-image-turbo">Z-Image Turbo (Alibaba) — Ultra Fast</option>
                          <option value="microsoft/mai-image-2.6-flash">MAI Image 2.6 Flash (Microsoft)</option>
                          <option value="black-forest-labs/flux.1-schnell">FLUX.1 Schnell (Black Forest Labs)</option>
                        </>
                      )}
                    </select>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                      <span>
                        {pollinationsModels.find((m) => m.id === selectedPollinationsModel)?.supportsReferenceImages
                          ? '✓ Model supports image conditioning with selected GIMA assets.'
                          : 'Model uses text-to-image synthesis grounded in GIMA knowledge.'}
                      </span>
                      <span className="text-emerald-700 font-semibold">Real AI Generation</span>
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {generationMode === 'pollinations' && (
                    <>
                      <strong className="text-slate-700">Phase 3 Primary Provider:</strong> Real AI image generation using the authenticated Pollinations API catalog. Directly creates clinical campaign visuals grounded in GIMA knowledge.
                    </>
                  )}
                  {generationMode === 'gemini-web-handoff' && (
                    <>
                      <strong className="text-slate-700">₹0 Pro Alternative:</strong> Uses your logged-in Gemini Pro experience. GIMA AI Studio prepares the verified brief and returns the generated asset to the studio.
                    </>
                  )}
                  {generationMode === 'gemini-api' && (
                    <>
                      Calls Google Gemini API directly. <span className="text-amber-700 font-semibold">Note: Google Free Tier projects have image quota limit: 0.</span>
                    </>
                  )}
                  {generationMode === 'demo-preview' && (
                    <>
                      Generates local deterministic previews with official GIMA branding and curriculum typography. Not AI-generated.
                    </>
                  )}
                </p>
              </div>

              {/* Main Action Button */}
              <button
                type="button"
                onClick={handlePrimaryAction}
                disabled={
                  generationState === 'preparing' ||
                  generationState === 'retrieving' ||
                  generationState === 'building_brief' ||
                  generationState === 'generating' ||
                  generationState === 'review'
                }
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gima-navy to-gima-navy-dark px-6 py-3.5 text-sm font-bold text-white shadow-elevated hover:from-gima-navy-light hover:to-gima-navy transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4 text-gima-gold-light" />
                <span>
                  {generationMode === 'pollinations'
                    ? generationState === 'preparing' || generationState === 'retrieving' || generationState === 'building_brief' || generationState === 'generating'
                      ? 'Generating with Pollinations AI...'
                      : `GENERATE CREATIVE (${selectedPollinationsModel.split('/')[1] || selectedPollinationsModel} • ${variationsCount} Var)`
                    : generationMode === 'gemini-web-handoff'
                    ? generationState === 'preparing' || generationState === 'retrieving' || generationState === 'building_brief'
                      ? 'Preparing Creative Brief...'
                      : `PREPARE IN GEMINI (${variationsCount} Variation${variationsCount > 1 ? 's' : ''})`
                    : generationMode === 'gemini-api'
                    ? 'Generate with Gemini API'
                    : 'Generate Demo Preview'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* ======================================================== */}
        {/* RIGHT COLUMN: CREATIVE STUDIO RESULTS & HANDOFF (5 COLS)  */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. COMPACT COLLAPSIBLE BRIEF & CLINICAL SOURCES (Visual Dominance) */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-subtle transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs truncate max-w-[68%]">
                <FileText className="h-4 w-4 text-gima-navy shrink-0" />
                <span className="font-bold text-slate-800 truncate">{course}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 text-[11px] truncate">{style} ({aspectRatio})</span>
              </div>
              <button
                type="button"
                onClick={() => setIsBriefExpanded(!isBriefExpanded)}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-gima-navy hover:text-gima-navy-light bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors"
              >
                <span>{isBriefExpanded ? 'Hide Brief' : `Brief & Sources (${retrievedKnowledge.length})`}</span>
                {isBriefExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>

            {/* Expandable Brief & Sources Panel */}
            {isBriefExpanded && (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 text-xs animate-fade-in">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-medium">Campaign:</span>
                    <span className="font-semibold text-slate-800">{campaignType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Format:</span>
                    <span className="font-semibold text-slate-800">{creativeType} ({aspectRatio})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Platforms:</span>
                    <span className="font-semibold text-slate-800">{selectedPlatforms.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Target Audience:</span>
                    <span className="font-semibold text-slate-800 truncate block">{audience}</span>
                  </div>
                </div>

                {extraPrompt && (
                  <div className="rounded-lg bg-amber-50/60 border border-amber-200/50 p-2 text-[11px] text-slate-700">
                    <span className="font-bold text-amber-900 block mb-0.5">Admin Direction:</span>
                    &ldquo;{extraPrompt}&rdquo;
                  </div>
                )}

                {/* Retrieved GIMA Sources */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <BookOpen className="h-3 w-3 text-gima-gold-dark" />
                      Retrieved Clinical Sources ({retrievedKnowledge.length}):
                    </span>
                    <span className="text-[10px] text-slate-400">12 Free-Course PDFs Foundation</span>
                  </div>
                  <div className="space-y-1">
                    {knowledgeSourcesUsed.map((src, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded bg-slate-50 px-2 py-1 text-[10px]"
                      >
                        <span className="text-slate-700 truncate max-w-[240px] font-medium">{src}</span>
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded">VERIFIED</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. GEMINI PRO WEB HANDOFF PANEL (When in Web Handoff mode & ready/waiting) */}
          {generationMode === 'gemini-web-handoff' && (generationState === 'handoff_ready' || generationState === 'waiting_gemini' || generationState === 'success') && (
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50/40 to-white p-5 shadow-subtle space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                  <h3 className="text-xs font-bold text-slate-900 tracking-wide uppercase">GEMINI PRO HANDOFF</h3>
                </div>
                <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                  Ready
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyPrompt(preparedWebPrompt, 'Prompt copied!')}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gima-navy px-3 py-2 text-xs font-bold text-white hover:bg-gima-navy-light transition-all shadow-subtle"
                >
                  <Copy className="h-3.5 w-3.5 text-gima-gold" />
                  <span>{copiedPromptStatus || 'COPY GEMINI PROMPT'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenGemini}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-all shadow-subtle"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-emerald-600" />
                  <span>OPEN GEMINI</span>
                </button>
              </div>

              {selectedAssets.length > 0 && (
                <button
                  type="button"
                  onClick={handleDownloadAllReferences}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <FileDown className="h-3.5 w-3.5 text-gima-navy" />
                  <span>Download {selectedAssets.length} Selected Reference Assets</span>
                </button>
              )}

              {/* Dropzone container */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`rounded-xl border-2 border-dashed p-4 text-center transition-all ${
                  isDragOver
                    ? 'border-gima-navy bg-blue-50/80 scale-[1.01]'
                    : 'border-slate-300 bg-white hover:border-slate-400'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      processImportedImageFile(e.target.files[0]);
                    }
                  }}
                />

                <div className="flex flex-col items-center justify-center space-y-1.5">
                  <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <ImageIcon className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    Drop Gemini image here or press <kbd className="px-1 py-0.5 rounded bg-slate-100 text-[10px]">Ctrl+V</kbd>
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200"
                  >
                    Choose Image File
                  </button>
                </div>
              </div>

              {importError && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-2 text-xs text-red-700 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}
              {importSuccessMsg && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-xs text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span>{importSuccessMsg}</span>
                </div>
              )}
            </div>
          )}

          {/* 3. DEDICATED GENERATED CREATIVES SECTION (PHASE 3.1 PROGRESSIVE GRID) */}
          {(slots.length > 0 || isGenerating) && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-subtle space-y-4 animate-fade-in">
              {/* Header with Status and TTFI Metrics */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-gima-gold-dark" />
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    GENERATED CREATIVES
                  </h3>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status badge */}
                  {isGenerating ? (
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 animate-pulse">
                      <RefreshCw className="h-3 w-3 animate-spin text-amber-700" />
                      Generating {slots.filter((s) => s.status === 'ready').length} of {slots.length}...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      {slots.filter((s) => s.status === 'ready').length} of {slots.length} ready
                    </span>
                  )}

                  {/* TTFI (Time to First Image) Metric Badge */}
                  {timeToFirstImage && (
                    <span
                      className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1"
                      title="First image visible latency (Time to First Image)"
                    >
                      ⚡ TTFI: {(timeToFirstImage / 1000).toFixed(1)}s
                    </span>
                  )}

                  {totalGenerationTime && (
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Total: {(totalGenerationTime / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>
              </div>

              {/* VERTICAL RESULT STACK: 1 column, all cards 100% width, same ratio, same height, exact vertical spacing */}
              <div className="flex flex-col space-y-4 w-full">
                {slots.map((slot) => {
                  // SKELETON SLOT: Stationary card, aspect ratio locked, internal shimmer clipped inside
                  if (slot.status === 'generating' || slot.status === 'pending') {
                    return (
                      <div
                        key={`slot-${slot.index}`}
                        id={`slot-card-${slot.index}`}
                        role="status"
                        aria-label={`Generating variation ${slot.variationNumber}`}
                        className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 ${getAspectClass(
                          aspectRatio
                        )} shadow-card select-none`}
                      >
                        {/* 1. Base dark background */}
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950" />

                        {/* 2. Soft internal light sweep / shimmer (CLIPPED strictly by parent overflow-hidden) */}
                        <div
                          className="absolute inset-0 -translate-x-full animate-internal-shimmer pointer-events-none"
                          aria-hidden="true"
                        >
                          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                        </div>

                        {/* 3. Subtle ambient radial highlight */}
                        <div
                          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800/25 via-transparent to-transparent pointer-events-none"
                          aria-hidden="true"
                        />

                        {/* 4. Stationary, centered creation indicator */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none z-10">
                          <div className="h-10 w-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-gima-gold shadow-subtle mb-3 backdrop-blur-sm">
                            <Sparkles className="h-4 w-4 text-gima-gold-light opacity-90" />
                          </div>
                          <span className="rounded-full bg-black/60 border border-white/10 px-3 py-0.5 text-[10px] font-bold text-white tracking-wide uppercase">
                            Variation {slot.variationNumber}
                          </span>
                          <p className="text-xs font-semibold text-slate-200 mt-2">
                            Creating visual...
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Applying GIMA clinical aesthetics
                          </p>
                        </div>
                      </div>
                    );
                  }

                  // ERROR SLOT: Stationary card, isolated error state with Retry button
                  if (slot.status === 'error') {
                    return (
                      <div
                        key={`slot-${slot.index}`}
                        id={`slot-card-${slot.index}`}
                        role="alert"
                        className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 ${getAspectClass(
                          aspectRatio
                        )} shadow-card text-white`}
                      >
                        {/* 1. Base dark error background */}
                        <div className="absolute inset-0 bg-gradient-to-b from-red-950/80 to-slate-950" />

                        {/* 2. Stationary, centered error indicator */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none z-10 text-white">
                          <div className="h-10 w-10 rounded-full bg-red-900/60 border border-red-500/30 flex items-center justify-center text-red-400 mb-2">
                            <AlertCircle className="h-5 w-5" />
                          </div>
                          <span className="rounded-full bg-black/60 border border-red-400/30 px-3 py-0.5 text-[10px] font-bold text-red-200">
                            Variation {slot.variationNumber}
                          </span>
                          <p className="text-xs font-bold text-white mt-2">Generation Failed</p>
                          <p className="text-[10px] text-red-200/90 mt-1 max-w-[240px] leading-snug">
                            {slot.error || 'Request timed out or failed'}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleRetrySlot(slot.index)}
                            disabled={isGenerating}
                            className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 px-3 py-1.5 text-xs font-bold text-white transition-colors shadow-sm"
                          >
                            <RefreshCw className="h-3 w-3" />
                            <span>Retry Slot</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // READY SLOT: Stationary card, creative visually dominating, floating glass action overlays
                  if (slot.status === 'ready' && slot.variation) {
                    const currentVar = slot.variation;
                    return (
                      <div
                        key={`slot-${slot.index}`}
                        id={`slot-card-${slot.index}`}
                        className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 ${getAspectClass(
                          aspectRatio
                        )} group shadow-card`}
                      >
                        {/* Dominant Image with smooth internal fade-in (pure opacity, zero translation) */}
                        <img
                          src={currentVar.previewImageUrl}
                          alt={`GIMA Creative — ${course} (Variation ${slot.variationNumber})`}
                          className="h-full w-full object-cover cursor-pointer transition-opacity duration-200"
                          onClick={() => setSelectedLightboxSlot(slot)}
                        />

                        {/* Top Overlay Badge Bar */}
                        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
                          <span className="rounded-full bg-black/65 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white border border-white/15">
                            Variation {slot.variationNumber}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="rounded-full bg-black/65 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-semibold text-gima-gold-light border border-white/15">
                              {currentVar.source === 'pollinations'
                                ? (currentVar.modelUsed || selectedPollinationsModel).split('/')[1] || currentVar.modelUsed
                                : currentVar.source}
                            </span>
                            {slot.durationMs && (
                              <span className="rounded-full bg-black/65 backdrop-blur-md px-2 py-0.5 text-[9px] font-medium text-slate-300 border border-white/15">
                                {(slot.durationMs / 1000).toFixed(1)}s
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Subtle dark gradient overlay for bottom actions */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent pointer-events-none opacity-85 group-hover:opacity-100 transition-opacity" />

                        {/* Bottom Floating Glass Action Bar */}
                        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-1.5 z-10">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDownload(currentVar.previewImageUrl, slot.variationNumber)}
                              className="rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur-md p-1.5 text-white transition-colors border border-white/15"
                              title="Download Image"
                              aria-label={`Download Variation ${slot.variationNumber}`}
                            >
                              <Download className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedLightboxSlot(slot)}
                              className="rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur-md p-1.5 text-white transition-colors border border-white/15"
                              title="Fullscreen Preview"
                              aria-label={`Fullscreen Variation ${slot.variationNumber}`}
                            >
                              <Maximize2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveSlotToProjects(slot)}
                              className="rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur-md p-1.5 text-white transition-colors border border-white/15"
                              title="Save to Projects"
                              aria-label={`Save Variation ${slot.variationNumber} to Projects`}
                            >
                              <FolderPlus className="h-3.5 w-3.5 text-gima-gold" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUseAsReference(currentVar.previewImageUrl)}
                              className="rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur-md p-1.5 text-white transition-colors border border-white/15"
                              title="Use as Reference Asset"
                              aria-label={`Use Variation ${slot.variationNumber} as Reference`}
                            >
                              <PlusCircle className="h-3.5 w-3.5 text-emerald-400" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsRefining(true)}
                            className="rounded-lg bg-gima-navy/90 hover:bg-gima-navy backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white transition-colors border border-white/15 flex items-center gap-1.5 shadow-subtle"
                          >
                            <MessageSquare className="h-3 w-3" />
                            <span>Refine</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>

              {/* Refinement Drawer */}
              {isRefining && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 space-y-2.5 animate-fade-in mt-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
                      {generationMode === 'pollinations'
                        ? 'Refine Creative with Pollinations AI:'
                        : 'Refine in Gemini:'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsRefining(false)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {[
                      'Make it more premium.',
                      'Keep the portrait but change the background.',
                      'Make the headline more dominant.',
                      'Create a cleaner healthcare layout.',
                    ].map((chip) => (
                      <button
                        type="button"
                        key={chip}
                        onClick={() => setRefinementInput(chip)}
                        className="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="e.g. Keep the clinical look but enhance contrast and use a cleaner scientific layout..."
                    value={refinementInput}
                    onChange={(e) => setRefinementInput(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-gima-navy focus:outline-none"
                  />

                  <div className="flex items-center justify-between gap-2 pt-1">
                    {generationMode === 'pollinations' ? (
                      <button
                        type="button"
                        disabled={isGenerating}
                        onClick={() => {
                          if (refinementInput.trim()) {
                            handleDirectGeneration(`Refinement: ${refinementInput}`);
                            setIsRefining(false);
                          }
                        }}
                        className="flex-1 rounded-lg bg-gima-navy px-3 py-1.5 text-xs font-bold text-white hover:bg-gima-navy-light flex items-center justify-center gap-1.5 shadow-subtle disabled:opacity-50"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-gima-gold-light" />
                        <span>RE-GENERATE WITH POLLINATIONS AI</span>
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={handleGenerateRefinementPrompt}
                          className="flex-1 rounded-lg bg-gima-navy px-3 py-1.5 text-xs font-bold text-white hover:bg-gima-navy-light flex items-center justify-center gap-1.5"
                        >
                          <Copy className="h-3 w-3" />
                          <span>
                            {copiedRefinementStatus ? 'Refinement Copied!' : 'COPY UPDATED GEMINI PROMPT'}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={handleOpenGemini}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>OPEN GEMINI</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. IDLE STUDIO PLACEHOLDER (When no slots and not generating) */}
          {slots.length === 0 && !isGenerating && generationState === 'idle' && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-10 text-center bg-white shadow-subtle space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 text-gima-gold-dark flex items-center justify-center border border-amber-100">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Awaiting Creative Generation</p>
                <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                  Configure campaign specifications on the left and click{' '}
                  <strong className="text-slate-700">
                    {generationMode === 'pollinations'
                      ? 'GENERATE CREATIVE'
                      : 'PREPARE IN GEMINI'}
                  </strong>
                  . The studio will progressively generate and render matching creative slots.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Asset Picker Modal */}
      <AssetPickerModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        selectedAssets={selectedAssets}
        onToggleAsset={handleToggleAsset}
      />

      {/* FULLSCREEN CREATIVE VIEWER LIGHTBOX (Supports ESC key to close) */}
      {(selectedLightboxSlot || isLightboxOpen) && (
        (() => {
          const activeSlot = selectedLightboxSlot || (slots.find((s) => s.status === 'ready') ?? null);
          const activeVar = activeSlot?.variation || generatedVariations[activeVariationIdx];
          if (!activeVar) return null;

          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in"
              onClick={() => {
                setSelectedLightboxSlot(null);
                setIsLightboxOpen(false);
              }}
            >
              <div
                className="relative max-h-[94vh] max-w-5xl w-full overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Lightbox Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/80 bg-slate-900/60 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-gima-gold/20 text-gima-gold-light border border-gima-gold/30 px-2.5 py-0.5 text-[10px] font-bold">
                      Variation {activeSlot?.variationNumber || activeVariationIdx + 1}
                    </span>
                    <span className="text-slate-400 font-medium truncate max-w-sm">
                      {course} • {activeVar.modelUsed || selectedPollinationsModel}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedLightboxSlot(null);
                      setIsLightboxOpen(false);
                    }}
                    className="rounded-full bg-white/10 hover:bg-white/20 p-1.5 text-white transition-colors"
                    title="Close (or press ESC)"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Lightbox Image Preview */}
                <div className="p-4 flex items-center justify-center bg-black/70 flex-1 overflow-auto max-h-[75vh]">
                  <img
                    src={activeVar.previewImageUrl}
                    alt="Full Resolution Creative Preview"
                    className="max-h-[70vh] w-auto object-contain mx-auto rounded-lg shadow-2xl"
                  />
                </div>

                {/* Lightbox Actions Footer */}
                <div className="p-4 bg-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 border-t border-slate-800">
                  <div className="text-[11px] text-slate-400">
                    Format: <strong className="text-white">{activeVar.aspectRatio}</strong> • Provider:{' '}
                    <strong className="text-white">{activeVar.source}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownload(activeVar.previewImageUrl, activeSlot?.variationNumber || 1)}
                      className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 font-bold text-white text-xs transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download</span>
                    </button>

                    {activeSlot && (
                      <button
                        type="button"
                        onClick={() => handleSaveSlotToProjects(activeSlot)}
                        className="flex items-center gap-1.5 rounded-lg bg-gima-navy hover:bg-gima-navy-light px-3 py-1.5 font-bold text-white text-xs transition-colors"
                      >
                        <FolderPlus className="h-3.5 w-3.5 text-gima-gold" />
                        <span>Save to Projects</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        handleUseAsReference(activeVar.previewImageUrl);
                        setSelectedLightboxSlot(null);
                        setIsLightboxOpen(false);
                      }}
                      className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 font-semibold text-white text-xs transition-colors"
                    >
                      <PlusCircle className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Use As Reference</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
}

export default function CreateCreativePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Creative Studio...</div>}>
      <CreateCreativeContent />
    </Suspense>
  );
}
