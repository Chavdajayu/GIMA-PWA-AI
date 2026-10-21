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
  PlusCircle,
  Cpu,
  Search,
  Zap,
  HelpCircle,
  ShieldCheck,
  ExternalLink,
  ImageIcon,
  Trash2,
  ArrowRight
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
  DeterministicDemoProvider,
  PollinationsImageProvider,
  checkServerProviderStatus,
  fetchLivePollinationsModels,
  checkPollinationsStatus
} from '@/lib/imageProvider';
import {
  composeGenerationPrompt,
  getKnowledgeSourcesSummary
} from '@/lib/promptComposer';
import {
  RankedModelItem,
  rankPollinationsModels,
  calculatePreGenerationCost,
  isVerifiedZeroCostModel
} from '@/lib/modelRanking';
import { saveProject } from '@/lib/projects';
import { logActivity } from '@/lib/activity';
import { AssetPickerModal } from '@/components/AssetPickerModal';
import { composePoster } from '@/lib/posterComposer';

const campaignOptions: { label: CampaignType; desc: string }[] = [
  { label: 'Free Course Promotion', desc: 'Promote 12 clinical PDFs & open access courses' },
  { label: 'Course Promotion', desc: 'Drive enrollment into ROHP accredited curriculum' },
  { label: 'Educational Awareness', desc: 'Highlight metabolic & clinical research findings' },
  { label: 'Event Promotion', desc: 'Webinars, faculty lectures & academic orientations' },
  { label: 'Social Media Campaign', desc: 'Professional healthcare thought-leadership feed posts' },
  { label: 'Brand Awareness', desc: 'Establish GIMA institutional authority & BOIM recognition' },
];

const platformOptions: { label: PlatformType; icon: string }[] = [
  { label: 'Instagram', icon: '📸' },
  { label: 'LinkedIn', icon: '💼' },
  { label: 'Facebook', icon: '🌐' },
  { label: 'Website', icon: '🖥️' },
  { label: 'Email', icon: '✉️' },
  { label: 'Print', icon: '📄' },
  { label: 'Story', icon: '📱' },
];

const creativeTypes: { label: CreativeType; desc: string }[] = [
  { label: 'Poster', desc: 'Flagship promotional poster' },
  { label: 'Social Post', desc: 'Standard feed announcement' },
  { label: 'Carousel Cover', desc: 'Multi-slide title hook' },
  { label: 'Banner', desc: 'Header for web & portal' },
  { label: 'Advertisement', desc: 'High-conversion campaign ad' },
  { label: 'Course Promotion', desc: 'Curriculum enrollment visual' },
  { label: 'Story', desc: 'Full-bleed mobile vertical' },
];

const aspectRatioOptions: { label: string; value: AspectRatioType; desc: string; iconRatio: string }[] = [
  { label: '4:5 Portrait', value: '4:5', desc: 'Instagram Feed Optimized', iconRatio: 'w-4 h-5' },
  { label: '1:1 Square', value: '1:1', desc: 'Multi-platform Feed', iconRatio: 'w-4 h-4' },
  { label: '16:9 Landscape', value: '16:9', desc: 'Website Banner & Slide', iconRatio: 'w-5 h-3' },
  { label: '9:16 Vertical', value: '9:16', desc: 'Stories & Reels', iconRatio: 'w-3 h-5' },
  { label: 'A4 Document', value: 'A4', desc: 'Clinical Poster & Handout', iconRatio: 'w-3.5 h-5' },
];

const visualStyles: { title: VisualStyleType; desc: string; previewBadge: string; previewColor: string }[] = [
  {
    title: 'Clinical Editorial',
    desc: 'Deep navy foundation, restrained gold accents, peer-reviewed clinical authority.',
    previewBadge: 'Flagship ROHP',
    previewColor: 'from-[#0B1B3D] to-[#1E3A8A]',
  },
  {
    title: 'Premium Academic',
    desc: 'Structured serif typography, balanced hierarchy, academic medical institution feel.',
    previewBadge: 'Curriculum',
    previewColor: 'from-slate-900 to-indigo-950',
  },
  {
    title: 'Modern Healthcare',
    desc: 'Crisp clinical teal accents, clean white surfaces, contemporary functional medicine.',
    previewBadge: 'High Contrast',
    previewColor: 'from-teal-900 to-slate-900',
  },
  {
    title: 'Minimal Luxury',
    desc: 'Generous whitespace, refined gold micro-borders, executive clinical prestige.',
    previewBadge: 'Executive',
    previewColor: 'from-stone-900 to-amber-950',
  },
  {
    title: 'Educational Infographic',
    desc: 'Focal callouts, metabolic pathway diagrams, evidence-based graphics.',
    previewBadge: 'Research',
    previewColor: 'from-blue-950 to-slate-900',
  },
  {
    title: 'Bold Campaign',
    desc: 'Dominant headline contrast, high urgency, primary registration emphasis.',
    previewBadge: 'Conversion',
    previewColor: 'from-navy-950 to-sky-950',
  },
];

function CreateCreativeContent() {
  const searchParams = useSearchParams();
  const brandConfig = useMemo(() => getBrandConfig(), []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ========================================================
  // APPROVED FRONTEND GENERATION MODES ONLY:
  // 1. Pollinations AI (Real generation with live ranked catalog & Pollen balance)
  // 2. Free Models (Verified zero-cost image models)
  // 3. Demo Preview (Deterministic offline mockup engine)
  // ========================================================
  const [generationMode, setGenerationMode] = useState<GenerationMode>('pollinations');
  
  // Model catalog & Pollen balance states
  const [rankedModels, setRankedModels] = useState<RankedModelItem[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>('openai/gpt-image-2.5-sunburst');
  const [modelSearchQuery, setModelSearchQuery] = useState<string>('');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState<boolean>(false);
  const [pollinationsStatus, setPollinationsStatus] = useState<PollinationsStatusResponse | null>(null);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState<boolean>(true);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState<boolean>(false);

  // Form State
  const [campaignType, setCampaignType] = useState<CampaignType>(
    (searchParams.get('campaignType') as CampaignType) || 'Free Course Promotion'
  );
  const [course, setCourse] = useState<string>(
    searchParams.get('course') || 'Theories of Aging'
  );
  const [topic, setTopic] = useState<string>('Cellular Senescence, Free Radicals & Glycation');
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>(['Instagram']);
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
    'Create a premium clinical editorial poster with the headline on the left, a clean scientific background and the instructor on the right.'
  );
  const [variationsCount, setVariationsCount] = useState<number>(1);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const [showKnowledgeBrief, setShowKnowledgeBrief] = useState<boolean>(true);

  // Reference Assets
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

  // Results & Generation State
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  const [isGenerating, setIsGenerating] = useState(false);
  const [slots, setSlots] = useState<GenerationSlot[]>([]);
  const [generatedVariations, setGeneratedVariations] = useState<GeneratedVariation[]>([]);
  const [timeToFirstImage, setTimeToFirstImage] = useState<number | null>(null);
  const [totalGenerationTime, setTotalGenerationTime] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [savedProjectSuccess, setSavedProjectSuccess] = useState(false);
  const [refinementInput, setRefinementInput] = useState<string>('');
  const [refiningSlotIndex, setRefiningSlotIndex] = useState<number | null>(null);
  const [showRawBg, setShowRawBg] = useState<Record<number, boolean>>({});
  const [serverProviderStatus, setServerProviderStatus] = useState<ApiProviderStatus | null>(null);

  // 1. Initial Load: Load live model catalog & check balance
  useEffect(() => {
    loadModelCatalog();
    refreshPollenBalance();
    checkServerProviderStatus().then((st) => setServerProviderStatus(st)).catch(() => {});
  }, []);

  const loadModelCatalog = async () => {
    setIsLoadingCatalog(true);
    try {
      const models = await fetchLivePollinationsModels();
      if (models && models.length > 0) {
        // Models are pre-ranked by api/pollinations/models
        const casted = models as RankedModelItem[];
        setRankedModels(casted);
        // Default to #1 ranked model if current is not in list
        const exists = casted.some((m) => m.id === selectedModelId);
        if (!exists && casted[0]) {
          setSelectedModelId(casted[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load models:', err);
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  const refreshPollenBalance = async () => {
    setIsRefreshingBalance(true);
    try {
      const status = await checkPollinationsStatus();
      setPollinationsStatus(status);
    } catch (err) {
      console.error('Failed to refresh balance:', err);
    } finally {
      setIsRefreshingBalance(false);
    }
  };

  // Find currently active model
  const activeModel = useMemo<RankedModelItem | null>(() => {
    if (rankedModels.length === 0) return null;
    return rankedModels.find((m) => m.id === selectedModelId) || rankedModels[0] || null;
  }, [rankedModels, selectedModelId]);

  // Filter models for Free Models category
  const verifiedFreeModels = useMemo<RankedModelItem[]>(() => {
    return rankedModels.filter((m) => m.isZeroPrice);
  }, [rankedModels]);

  // Filter models for Search in dropdown
  const filteredRankedModels = useMemo<RankedModelItem[]>(() => {
    if (!modelSearchQuery.trim()) return rankedModels;
    const q = modelSearchQuery.toLowerCase();
    return rankedModels.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.publisher.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q)
    );
  }, [rankedModels, modelSearchQuery]);

  // Cost estimation calculations
  const costCalculation = useMemo(() => {
    const bal = typeof pollinationsStatus?.balance === 'number' ? pollinationsStatus.balance : null;
    if (generationMode === 'free-models' || generationMode === 'demo-preview') {
      return {
        perImagePollen: 0,
        perImageText: '0.00 Pollen (Free)',
        totalPollen: 0,
        totalText: '0.00 Pollen (Free)',
        remainingPollen: bal,
        remainingText: bal !== null ? `${bal.toFixed(4)} Pollen` : '0.00 Pollen',
        isSufficientBalance: true,
        isVariable: false,
      };
    }
    return calculatePreGenerationCost(activeModel, variationsCount, bal);
  }, [activeModel, variationsCount, pollinationsStatus, generationMode]);

  // Course Knowledge retrieval
  const retrievedKnowledge = useMemo(() => {
    if (!course) return [];
    if (course.toLowerCase().includes('theories') || campaignType === 'Free Course Promotion') {
      return searchKnowledge(topic || '', { course: 'Theories of Aging' }).slice(0, 5);
    }
    return getKnowledgeForCourse(course).slice(0, 5);
  }, [course, topic, campaignType]);

  const knowledgeSourcesUsed = useMemo(() => {
    return retrievedKnowledge.map((k) => k.sourceTitle || k.documentName || k.subject || 'GIMA Clinical Source');
  }, [retrievedKnowledge]);

  // Handle Course Change with auto-defaults
  const handleSelectCourse = (selectedTitle: string) => {
    setCourse(selectedTitle);
    if (selectedTitle.includes('Theories of Aging')) {
      setTopic('Cellular Senescence, Free Radicals & Glycation');
      setHeadline('Theories of Aging: Cellular Mechanisms & Longevity Science');
      setCta('Access Free Course');
      setCampaignType('Free Course Promotion');
      setAudience('Integrative Practitioners, Nutritionists, Healthcare Students');
    } else if (selectedTitle.includes('Brain Development')) {
      setTopic('Neurodevelopment, Pediatric Nutrition & Cognitive Pathways');
      setHeadline('Nutritional Medicine in Brain Development');
      setCta('Access Free Course');
      setCampaignType('Free Course Promotion');
      setAudience('Integrative Practitioners, Neurologists, Healthcare Students');
    } else if (selectedTitle.includes('ROHP')) {
      setTopic('Registered Orthomolecular Health Practitioner Designation');
      setHeadline('Accredited ROHP™ Clinical Certification');
      setCta('Apply for Accreditation');
      setCampaignType('Course Promotion');
      setAudience('Licensed Healthcare Professionals, DCs, NDs, MDs');
    } else {
      setTopic('Integrative Clinical Practice & Functional Protocols');
      setHeadline(`${selectedTitle} — Clinical Curriculum`);
      setCta('Enroll Today');
      setCampaignType('Course Promotion');
      setAudience('Regulated Healthcare Professionals');
    }
  };

  // Helper to build generation request
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

  // Aspect ratio helper
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

  // Upload user reference image
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('Reference image must be under 10MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const customAsset: AssetItem = {
          id: `ref-upload-${Date.now()}`,
          name: file.name.slice(0, 24),
          category: 'Uploaded references',
          url: dataUrl,
          description: 'Custom user reference image',
        };
        setSelectedAssets((prev) => [...prev, customAsset]);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Download Generated Image
  const handleDownload = async (imageUrl: string, varNum: number) => {
    const filename = `GIMA-${course.replace(/[^a-zA-Z0-9]/g, '_')}-var${varNum}.png`;
    if (imageUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    try {
      const res = await fetch(imageUrl);
      if (res.ok) {
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        return;
      }
    } catch {}

    const proxyUrl = `/api/download-asset?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(filename)}`;
    const link = document.createElement('a');
    link.href = proxyUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add generated image to reference assets
  const handleUseAsReference = (dataUrl: string) => {
    const newAsset: AssetItem = {
      id: `asset-gen-${Date.now()}`,
      name: `Generated: ${headline.slice(0, 20)}...`,
      category: 'Uploaded references',
      url: dataUrl,
      description: `Generated creative for ${course}`,
    };
    setSelectedAssets((prev) => [...prev, newAsset]);
    alert('Added creative to Reference Assets for subsequent variations!');
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
      const targetModelId = generationMode === 'free-models' && verifiedFreeModels[0]
        ? verifiedFreeModels[0].id
        : selectedModelId;
      const provider = new PollinationsImageProvider(
        targetModelId,
        generationMode === 'free-models' ? 'free-models' : 'pollinations'
      );
      const req = buildCurrentRequest();
      const resultVar = await provider.generateSingleVariation(req, slotIndex);

      if (generationMode === 'free-models' && resultVar.previewImageUrl) {
        try {
          const brandConfig = getBrandConfig();
          const composedPosterDataUrl = await composePoster({
            backgroundUrl: resultVar.previewImageUrl,
            request: req,
            brandConfig,
          });
          resultVar.rawBackgroundUrl = resultVar.previewImageUrl;
          resultVar.previewImageUrl = composedPosterDataUrl;
          resultVar.isHybridPoster = true;
          resultVar.notes = `GIMA Hybrid Poster Engine • ${resultVar.modelUsed || 'Free Diffusion'} Visual Artwork + Studio Poster Composition`;
        } catch (composeErr) {
          console.warn('[Hybrid Poster Engine] Retry composition fallback:', composeErr);
        }
      }

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
      refreshPollenBalance();
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

  // Refine Variation
  const handleRefineVariation = async (slotIndex: number) => {
    if (!refinementInput.trim() || isGenerating) return;
    setRefiningSlotIndex(slotIndex);
    const retryStart = Date.now();
    setSlots((prev) =>
      prev.map((s) =>
        s.index === slotIndex
          ? { ...s, status: 'generating', error: undefined, startTime: retryStart }
          : s
      )
    );

    try {
      const targetModelId = generationMode === 'free-models' && verifiedFreeModels[0]
        ? verifiedFreeModels[0].id
        : selectedModelId;
      const provider = new PollinationsImageProvider(
        targetModelId,
        generationMode === 'free-models' ? 'free-models' : 'pollinations'
      );
      const req = buildCurrentRequest();
      req.extraPrompt = `${req.extraPrompt} [Refinement: ${refinementInput.trim()}]`;
      const resultVar = await provider.generateSingleVariation(req, slotIndex);

      if (generationMode === 'free-models' && resultVar.previewImageUrl) {
        try {
          const brandConfig = getBrandConfig();
          const composedPosterDataUrl = await composePoster({
            backgroundUrl: resultVar.previewImageUrl,
            request: req,
            brandConfig,
          });
          resultVar.rawBackgroundUrl = resultVar.previewImageUrl;
          resultVar.previewImageUrl = composedPosterDataUrl;
          resultVar.isHybridPoster = true;
          resultVar.notes = `GIMA Hybrid Poster Engine • ${resultVar.modelUsed || 'Free Diffusion'} Visual Artwork + Studio Poster Composition`;
        } catch (composeErr) {
          console.warn('[Hybrid Poster Engine] Refine composition fallback:', composeErr);
        }
      }

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
      setRefinementInput('');
      setRefiningSlotIndex(null);
      refreshPollenBalance();
    } catch (err: any) {
      setSlots((prev) =>
        prev.map((s) =>
          s.index === slotIndex
            ? {
                ...s,
                status: 'error',
                error: err.message || 'Refinement generation failed',
              }
            : s
        )
      );
      setRefiningSlotIndex(null);
    }
  };

  // ========================================================
  // PRIMARY ACTION: GENERATE CREATIVE
  // ========================================================
  const handleGenerateCreative = async () => {
    if (isGenerating) return;

    // Balance check
    if (
      generationMode === 'pollinations' &&
      !costCalculation.isSufficientBalance &&
      pollinationsStatus?.balance !== undefined
    ) {
      alert(`Insufficient Pollen balance. Required ~${costCalculation.totalText}, but current balance is ${pollinationsStatus.balance.toFixed(4)} Pollen.`);
      return;
    }

    const req = buildCurrentRequest();
    setSavedProjectSuccess(false);

    // ========================================================
    // PATH 1: POLLINATIONS AI / FREE MODELS PROGRESSIVE GENERATION
    // ========================================================
    if (generationMode === 'pollinations' || generationMode === 'free-models') {
      const targetCount = Math.max(1, Math.min(4, variationsCount));
      const sessionStart = Date.now();
      setTimeToFirstImage(null);
      setTotalGenerationTime(null);
      setIsGenerating(true);
      setGenerationState('generating');

      // 1. Immediately create N stationary skeleton slots
      const initialSlots: GenerationSlot[] = Array.from({ length: targetCount }, (_, i) => ({
        index: i,
        variationNumber: i + 1,
        status: 'generating',
        startTime: sessionStart,
      }));
      setSlots(initialSlots);

      const targetModelId = generationMode === 'free-models' && verifiedFreeModels[0]
        ? verifiedFreeModels[0].id
        : selectedModelId;

      const provider = new PollinationsImageProvider(
        targetModelId,
        generationMode === 'free-models' ? 'free-models' : 'pollinations'
      );
      let firstCompleted = false;

      // 2. Fire independent concurrent requests for progressive replacement
      const promises = initialSlots.map(async (slot) => {
        try {
          const resultVar = await provider.generateSingleVariation(req, slot.index);
          const finishedAt = Date.now();

          // HYBRID POSTER COMPOSITION FOR FREE MODELS MODE
          if (generationMode === 'free-models' && resultVar.previewImageUrl) {
            try {
              const brandConfig = getBrandConfig();
              const composedPosterDataUrl = await composePoster({
                backgroundUrl: resultVar.previewImageUrl,
                request: req,
                brandConfig,
              });
              resultVar.rawBackgroundUrl = resultVar.previewImageUrl;
              resultVar.previewImageUrl = composedPosterDataUrl;
              resultVar.isHybridPoster = true;
              resultVar.notes = `GIMA Hybrid Poster Engine • ${resultVar.modelUsed || 'Free Diffusion'} Visual Artwork + Studio Poster Composition`;
            } catch (composeErr) {
              console.warn('[Hybrid Poster Engine] Progressive composition fallback:', composeErr);
            }
          }

          if (!firstCompleted) {
            firstCompleted = true;
            setTimeToFirstImage(finishedAt - sessionStart);
          }

          // Replace ONLY this specific slot immediately!
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

          setGeneratedVariations((prev) => {
            const filtered = prev.filter((v) => v.id !== resultVar.id);
            return [...filtered, resultVar].sort((a, b) => a.variationNumber - b.variationNumber);
          });

          return resultVar;
        } catch (err: any) {
          console.error(`[Slot ${slot.variationNumber} Error]:`, err);
          let errMsg = err.message || 'Generation failed.';
          if (errMsg.includes('401') || errMsg.includes('INVALID_API_KEY')) {
            errMsg = 'API key rejected by provider.';
          } else if (errMsg.includes('402') || errMsg.includes('INSUFFICIENT_BALANCE')) {
            errMsg = 'Insufficient Pollen balance.';
          } else if (errMsg.includes('429') || errMsg.includes('RATE_LIMITED')) {
            errMsg = 'Rate limit reached. Please wait.';
          } else if (errMsg.includes('404') || errMsg.includes('MODEL_NOT_FOUND')) {
            errMsg = 'Model currently unavailable.';
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

      try {
        await Promise.allSettled(promises);
        setTotalGenerationTime(Date.now() - sessionStart);
        setGenerationState('success');
      } finally {
        setIsGenerating(false);
        refreshPollenBalance();
      }
      return;
    }

    // ========================================================
    // PATH 2: DEMO PREVIEW (Deterministic Mockup Engine)
    // ========================================================
    if (generationMode === 'demo-preview') {
      setIsGenerating(true);
      setGenerationState('generating');
      const start = Date.now();

      const initialSlots: GenerationSlot[] = Array.from({ length: variationsCount }, (_, i) => ({
        index: i,
        variationNumber: i + 1,
        status: 'generating',
        startTime: start,
      }));
      setSlots(initialSlots);

      await new Promise((r) => setTimeout(r, 650));

      const demoProvider = new DeterministicDemoProvider();
      const demoVariations = await demoProvider.generate(req);

      setSlots(
        demoVariations.map((v, i) => ({
          index: i,
          variationNumber: i + 1,
          status: 'ready',
          variation: v,
          durationMs: Date.now() - start,
        }))
      );
      setGeneratedVariations(demoVariations);
      setTimeToFirstImage(Date.now() - start);
      setTotalGenerationTime(Date.now() - start);
      setGenerationState('success');
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-fade-in max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>GIMA AI Creative Studio</span>
            <span className="text-xs font-bold bg-amber-100 text-amber-950 border border-amber-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Production
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Create brand-compliant, clinical marketing posters and social campaigns grounded in accredited GIMA knowledge.
          </p>
        </div>

        {/* Balance Badge with Live Refresh */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2.5 bg-white border border-slate-300 shadow-subtle px-3.5 py-2 rounded-xl text-sm">
            <span className="flex items-center gap-1.5 font-bold text-slate-800">
              <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span>Balance:</span>
            </span>
            <span className="font-extrabold text-slate-900 font-mono text-sm">
              {typeof pollinationsStatus?.balance === 'number'
                ? `${pollinationsStatus.balance.toFixed(4)} Pollen`
                : 'Loading...'}
            </span>
            <button
              type="button"
              onClick={refreshPollenBalance}
              disabled={isRefreshingBalance}
              title="Refresh Pollen balance"
              aria-label="Refresh Pollen balance"
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshingBalance ? 'animate-spin text-gima-navy' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Creation Flow (Streamlined 6 Sections) | Right Real-Time Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================
            LEFT COLUMN: STREAMLINED CREATIVE WORKFLOW (SECTIONS 1 - 6)
            ======================================================== */}
        <div className="lg:col-span-7 space-y-6">

          {/* SECTION 1: WHAT ARE WE PROMOTING? */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 font-bold text-slate-900 text-base sm:text-lg">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gima-navy text-white text-xs font-extrabold">
                  1
                </span>
                <span>What are we promoting?</span>
              </div>
              <span className="text-xs sm:text-sm text-slate-600 font-medium">GIMA Curriculum & Clinical Content</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Campaign Type */}
              <div className="space-y-1.5">
                <label className="block text-sm sm:text-base font-semibold text-slate-900">
                  Campaign Objective
                </label>
                <select
                  value={campaignType}
                  onChange={(e) => setCampaignType(e.target.value as CampaignType)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm sm:text-base font-medium text-slate-900 focus:border-gima-navy focus:outline-none focus:ring-2 focus:ring-gima-navy/20 transition-all"
                >
                  {campaignOptions.map((c) => (
                    <option key={c.label} value={c.label}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Selection */}
              <div className="space-y-1.5">
                <label className="block text-sm sm:text-base font-semibold text-slate-900">
                  Target Course / Program
                </label>
                <select
                  value={course}
                  onChange={(e) => handleSelectCourse(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm sm:text-base font-medium text-slate-900 focus:border-gima-navy focus:outline-none focus:ring-2 focus:ring-gima-navy/20 transition-all"
                >
                  <optgroup label="Free Courses (Authoritative PDF Sources)">
                    <option value="Theories of Aging">Theories of Aging (12 Clinical PDFs)</option>
                    <option value="Nutritional Medicine in Brain Development">Nutritional Medicine in Brain Development</option>
                  </optgroup>
                  <optgroup label="ROHP™ Board Qualifying Modules">
                    <option value="ROHP / RNCP Qualifying Program">ROHP / RNCP Qualifying Program (Full Diploma)</option>
                    {brandConfig.curriculumCourses.map((c) => (
                      <option key={c.code} value={c.title}>
                        {c.code}: {c.title}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Topic Specification */}
            <div className="space-y-1.5">
              <label className="block text-sm sm:text-base font-semibold text-slate-900">
                Core Clinical Topic & Highlights
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Cellular Senescence, Free Radicals & Glycation"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:border-gima-navy focus:outline-none focus:ring-2 focus:ring-gima-navy/20 transition-all"
              />
            </div>
          </div>

          {/* SECTION 2: WHERE WILL IT BE PUBLISHED? */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 font-bold text-slate-900 text-base sm:text-lg">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gima-navy text-white text-xs font-extrabold">
                  2
                </span>
                <span>Where will it be published?</span>
              </div>
              <span className="text-xs sm:text-sm text-slate-600 font-medium">Channel, Format & Dimensions</span>
            </div>

            {/* Platform Selection */}
            <div className="space-y-2">
              <label className="block text-sm sm:text-base font-semibold text-slate-900">Target Platforms</label>
              <div className="flex flex-wrap gap-2">
                {platformOptions.map((p) => {
                  const isSelected = selectedPlatforms.includes(p.label);
                  return (
                    <button
                      type="button"
                      key={p.label}
                      onClick={() =>
                        setSelectedPlatforms((prev) =>
                          prev.includes(p.label)
                            ? prev.filter((item) => item !== p.label)
                            : [...prev, p.label]
                        )
                      }
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all min-h-[40px] ${
                        isSelected
                          ? 'bg-gima-navy text-white shadow-sm ring-1 ring-gima-navy-dark'
                          : 'border border-slate-300 bg-slate-50/70 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-base">{p.icon}</span>
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Creative Type */}
              <div className="space-y-2">
                <label className="block text-sm sm:text-base font-semibold text-slate-900">Creative Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {creativeTypes.slice(0, 4).map((c) => (
                    <button
                      type="button"
                      key={c.label}
                      onClick={() => setCreativeType(c.label)}
                      className={`text-left px-3 py-2.5 rounded-xl text-sm font-bold transition-all border-2 min-h-[58px] ${
                        creativeType === c.label
                          ? 'border-gima-navy bg-blue-50/50 text-gima-navy shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div>{c.label}</div>
                      <div className="text-xs text-slate-600 font-normal leading-tight mt-0.5">{c.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-2">
                <label className="block text-sm sm:text-base font-semibold text-slate-900">Aspect Ratio</label>
                <div className="grid grid-cols-1 gap-2">
                  {aspectRatioOptions.slice(0, 3).map((r) => (
                    <button
                      type="button"
                      key={r.value}
                      onClick={() => setAspectRatio(r.value)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all border-2 min-h-[44px] ${
                        aspectRatio === r.value
                          ? 'border-gima-navy bg-blue-50/50 text-gima-navy shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{r.label}</span>
                      <span className="text-xs text-slate-600 font-mono font-semibold">{r.value}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: VISUAL DIRECTION */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 font-bold text-slate-900 text-base sm:text-lg">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gima-navy text-white text-xs font-extrabold">
                  3
                </span>
                <span>Visual Direction</span>
              </div>
              <span className="text-xs sm:text-sm text-slate-600 font-medium">GIMA Brand Art Direction</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {visualStyles.map((vs) => {
                const isSelected = style === vs.title;
                return (
                  <button
                    type="button"
                    key={vs.title}
                    onClick={() => setStyle(vs.title)}
                    className={`text-left p-3.5 rounded-xl border-2 transition-all relative flex flex-col justify-between min-h-[115px] ${
                      isSelected
                        ? 'border-gima-navy bg-blue-50/40 shadow-subtle ring-1 ring-gima-navy'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-bold text-slate-900">{vs.title}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                          {vs.previewBadge}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                        {vs.desc}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-gima-navy">
                        <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span>Selected Direction</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: REFERENCE IMAGES */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 font-bold text-slate-900 text-base sm:text-lg">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gima-navy text-white text-xs font-extrabold">
                  4
                </span>
                <span>Reference Images</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssetModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-gima-navy hover:bg-slate-50 transition-colors min-h-[38px]"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Add GIMA Asset</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors min-h-[38px]"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Custom</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />
              </div>
            </div>

            {/* Asset chips display */}
            <div className="flex flex-wrap gap-2.5">
              {selectedAssets.length === 0 ? (
                <div className="text-sm text-slate-600 italic py-1">
                  No reference assets attached. Text-only visual generation will be used.
                </div>
              ) : (
                selectedAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center gap-2.5 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm group"
                  >
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="h-8 w-8 rounded-lg object-contain border border-slate-200 bg-white"
                    />
                    <span className="font-bold text-slate-900 text-xs sm:text-sm max-w-[160px] truncate">
                      {asset.name}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedAssets((prev) => prev.filter((a) => a.id !== asset.id))
                      }
                      className="text-slate-400 hover:text-red-600 rounded-lg p-1 transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center"
                      aria-label={`Remove ${asset.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Model reference capability notice */}
            <div className="rounded-xl bg-slate-50 p-3 text-xs sm:text-sm text-slate-700 flex items-center gap-2.5 border border-slate-200">
              <Info className="h-4 w-4 text-gima-navy shrink-0" />
              <span>
                {activeModel?.supportsReferenceImages
                  ? `Active model (${activeModel.name}) supports direct reference image conditioning.`
                  : `Active model (${activeModel?.name || 'Selected'}) generates text-to-image. Reference assets are used to enrich the clinical prompt.`}
              </span>
            </div>
          </div>

          {/* SECTION 5: CONTENT AND INSTRUCTIONS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 font-bold text-slate-900 text-base sm:text-lg">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gima-navy text-white text-xs font-extrabold">
                  5
                </span>
                <span>Content & Creative Brief</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="text-xs sm:text-sm font-bold text-gima-navy hover:underline flex items-center gap-1 min-h-[36px]"
              >
                <span>{showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options</span>
                {showAdvancedOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm sm:text-base font-semibold text-slate-900">Primary Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm sm:text-base font-medium text-slate-900 focus:border-gima-navy focus:outline-none focus:ring-2 focus:ring-gima-navy/20 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm sm:text-base font-semibold text-slate-900">Call to Action (CTA)</label>
                <input
                  type="text"
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm sm:text-base font-medium text-slate-900 focus:border-gima-navy focus:outline-none focus:ring-2 focus:ring-gima-navy/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm sm:text-base font-semibold text-slate-900">Target Audience</label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm sm:text-base font-medium text-slate-900 focus:border-gima-navy focus:outline-none focus:ring-2 focus:ring-gima-navy/20 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm sm:text-base font-semibold text-slate-900">Extra Art Direction & Composition</label>
              <textarea
                value={extraPrompt}
                onChange={(e) => setExtraPrompt(e.target.value)}
                rows={3}
                placeholder="e.g. Create a premium clinical editorial poster with the headline on the left, a clean scientific background and the instructor on the right."
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:border-gima-navy focus:outline-none focus:ring-2 focus:ring-gima-navy/20 transition-all resize-none"
              />
            </div>

            {/* Collapsible Advanced Options */}
            {showAdvancedOptions && (
              <div className="pt-3 border-t border-slate-200 space-y-3 animate-fade-in text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="font-semibold text-slate-800 block mb-1">Language</span>
                    <span className="text-slate-600 text-sm">English (Default)</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block mb-1">Brand Emphasis</span>
                    <span className="text-slate-600 text-sm">Clinical Authority & BOIM Accreditation</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 6: VARIATIONS, MODEL, POLLEN COST & GENERATION */}
          <div className="rounded-2xl border-2 border-gima-navy/30 bg-white p-6 shadow-subtle space-y-6">
            {/* Generation Mode Selector (Exactly 3 Approved Modes) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-gima-navy" />
                  <span>Generation Engine Mode</span>
                </label>
                <span className="text-xs text-slate-600 font-semibold">Approved Marketing Modes</span>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl text-sm">
                {/* 1. Pollinations AI */}
                <button
                  type="button"
                  onClick={() => setGenerationMode('pollinations')}
                  className={`py-2.5 px-3 rounded-xl font-bold transition-all text-center min-h-[44px] ${
                    generationMode === 'pollinations'
                      ? 'bg-gima-navy text-white shadow-sm'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  Pollinations AI
                </button>

                {/* 2. Free Models */}
                <button
                  type="button"
                  onClick={() => setGenerationMode('free-models')}
                  className={`py-2.5 px-3 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1.5 min-h-[44px] ${
                    generationMode === 'free-models'
                      ? 'bg-gima-navy text-white shadow-sm'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  <span>Free Models</span>
                  <span className="text-xs bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md font-mono font-bold">
                    {serverProviderStatus?.cloudflareConfigured ? 'FLUX.2' : 'Zero Cost'}
                  </span>
                </button>

                {/* 3. Demo Preview */}
                <button
                  type="button"
                  onClick={() => setGenerationMode('demo-preview')}
                  className={`py-2.5 px-3 rounded-xl font-bold transition-all text-center min-h-[44px] ${
                    generationMode === 'demo-preview'
                      ? 'bg-gima-navy text-white shadow-sm'
                      : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  Demo Preview
                </button>
              </div>
            </div>

            {/* MODE CONTENT: POLLINATIONS AI (Live Quality Ranked Model Selector) */}
            {generationMode === 'pollinations' && (
              <div className="space-y-4 pt-1 animate-fade-in">
                {/* Searchable Model Selector */}
                <div className="space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-gima-gold-dark" />
                      <span>Model Selector — GIMA Recommended Image Quality</span>
                    </label>
                    <span className="text-xs text-slate-600 font-semibold">Ranked by Quality</span>
                  </div>

                  {/* Active Selected Model Card / Toggle */}
                  <div
                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isModelDropdownOpen}
                    className="w-full cursor-pointer rounded-xl border-2 border-slate-300 bg-slate-50 hover:bg-slate-100 p-3.5 flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-gima-navy"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gima-navy text-white font-extrabold text-xs">
                        #{activeModel?.rank || 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm sm:text-base text-slate-900">
                            {activeModel?.name || 'Selected Model'}
                          </span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded ${
                              activeModel?.qualityCategory === 'Premium'
                                ? 'bg-amber-100 text-amber-950 border border-amber-300'
                                : activeModel?.qualityCategory === 'High Quality'
                                ? 'bg-sky-100 text-sky-950 border border-sky-300'
                                : 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                            }`}
                          >
                            {activeModel?.qualityCategory || 'High Quality'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 font-medium flex items-center gap-2 mt-0.5">
                          <span>By {activeModel?.publisher || 'Community'}</span>
                          <span>•</span>
                          <span className="font-bold text-slate-800">
                            Est: {activeModel?.costEstimateText || 'Variable'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-slate-500 transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {/* Expandable Model Catalog List */}
                  {isModelDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 z-40 mt-1.5 rounded-2xl border border-slate-300 bg-white p-2.5 shadow-elevated max-h-80 overflow-y-auto space-y-1.5">
                      {/* Search Bar */}
                      <div className="relative sticky top-0 bg-white pb-2.5 z-10 border-b border-slate-200">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search live models (OpenAI, FLUX, Ideogram, Gemini)..."
                          value={modelSearchQuery}
                          onChange={(e) => setModelSearchQuery(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-gima-navy"
                        />
                      </div>

                      {filteredRankedModels.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => {
                            setSelectedModelId(m.id);
                            setIsModelDropdownOpen(false);
                          }}
                          className={`p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between min-h-[46px] ${
                            selectedModelId === m.id
                              ? 'bg-blue-50 border border-gima-navy text-gima-navy'
                              : 'hover:bg-slate-100 text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-200 text-slate-800 text-xs font-bold">
                              #{m.rank}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm">{m.name}</span>
                                <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                                  {m.qualityCategory}
                                </span>
                              </div>
                              <div className="text-xs text-slate-600">{m.referenceSupportText}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs sm:text-sm font-mono font-bold text-slate-900 block">
                              {m.costEstimateText}
                            </span>
                            <span className="text-xs text-slate-500">{m.publisher}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pre-Generation Pollen Cost Estimation Breakdown */}
                <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-amber-950">
                    <span className="flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-amber-600" />
                      <span>Estimated Pollen Usage Before Generation</span>
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-700">
                      {variationsCount} variation{variationsCount > 1 ? 's' : ''} requested
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 text-center pt-1.5 border-t border-amber-200 text-sm">
                    <div className="bg-white p-2 rounded-xl border border-amber-200">
                      <div className="text-xs text-slate-600 font-medium">Per Image</div>
                      <div className="font-bold text-slate-900 font-mono text-xs sm:text-sm">{costCalculation.perImageText}</div>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-amber-200">
                      <div className="text-xs text-slate-600 font-medium">Total ({variationsCount}x)</div>
                      <div className="font-bold text-amber-950 font-mono text-xs sm:text-sm">{costCalculation.totalText}</div>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-amber-200">
                      <div className="text-xs text-slate-600 font-medium">Remaining Bal.</div>
                      <div className="font-bold text-slate-900 font-mono text-xs sm:text-sm">{costCalculation.remainingText}</div>
                    </div>
                  </div>

                  {!costCalculation.isSufficientBalance && (
                    <div className="text-xs sm:text-sm text-red-800 font-bold flex items-center gap-1.5 pt-1">
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                      <span>Insufficient Pollen balance. Consider selecting Z-Image Turbo (~0.004 Pollen) or Demo Preview.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MODE CONTENT: FREE MODELS */}
            {generationMode === 'free-models' && (
              <div className="rounded-xl border border-emerald-300 bg-emerald-50/60 p-4.5 space-y-3.5 animate-fade-in text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-700" />
                    <span>Hybrid Free Poster Engine</span>
                  </span>
                  <span className="text-xs font-bold bg-emerald-200 text-emerald-950 px-2.5 py-0.5 rounded-full">
                    {serverProviderStatus?.cloudflareConfigured
                      ? 'Free Daily Cloudflare Allowance'
                      : 'Verified Zero Cost'}
                  </span>
                </div>

                {serverProviderStatus?.cloudflareConfigured ? (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-white border border-emerald-300 shadow-subtle space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 text-base">
                            FLUX.2 Klein 9B
                          </span>
                          <span className="text-xs text-slate-600 font-mono ml-2 font-medium">
                            {serverProviderStatus?.cloudflareModel || '@cf/black-forest-labs/flux-2-klein-9b'}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300">
                          Active Provider
                        </span>
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        Photorealistic healthcare visual plate generated on Cloudflare Workers AI using the FLUX.2 Klein 9B model. Finished by GIMA Studio Poster Engine with authoritative typography, verified official branding, and course-specific curriculum points.
                      </p>
                      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-700 pt-2 border-t border-slate-100 font-medium">
                        <span>Free Allowance: <strong>10,000 Neurons/day (~7 images/day)</strong></span>
                        <span className="text-emerald-800 font-bold">Resets daily at 00:00 UTC</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-slate-700 text-sm leading-relaxed">
                      Generates authentic healthcare visual artwork via the verified zero-cost free model, then composes publication-grade GIMA marketing posters with vector branding, official logo, clean typography, structured highlight cards, and high-impact CTA.
                    </p>
                    {verifiedFreeModels.length > 0 ? (
                      verifiedFreeModels.map((fm) => (
                        <div key={fm.id} className="p-3 rounded-xl bg-white border border-emerald-300 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-slate-900 text-sm sm:text-base">{fm.name}</div>
                            <div className="text-xs text-slate-600 font-medium mt-0.5">
                              {fm.publisher} • Visual Plate Generator (0 Pollen) + Studio Poster Composer
                            </div>
                          </div>
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-300">
                            Active Free Model
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 rounded-xl bg-white border border-emerald-300 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-sm sm:text-base">SDXL Lightning Free</div>
                          <div className="text-xs text-slate-600 font-medium mt-0.5">
                            Community Zero-Cost Diffusion + Studio Poster Composer
                          </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-300">
                          Active Free Model
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* MODE CONTENT: DEMO PREVIEW */}
            {generationMode === 'demo-preview' && (
              <div className="rounded-xl border border-slate-300 bg-slate-50 p-4 space-y-2 animate-fade-in text-sm">
                <span className="font-bold text-slate-900 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gima-navy" />
                  <span>Deterministic Offline Demo Preview</span>
                </span>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  Generates deterministic high-fidelity previews using authentic GIMA identity, Dr. Meschino portraits, and clinical citations without consuming Pollen balance. Transparently marked as a preview, not AI-generated.
                </p>
              </div>
            )}

            {/* Variations Count Segmented Selector */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <span className="text-sm sm:text-base font-semibold text-slate-900">Variations to Generate</span>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setVariationsCount(num)}
                    className={`h-10 w-10 rounded-xl text-sm font-bold transition-all min-h-[40px] min-w-[40px] flex items-center justify-center ${
                      variationsCount === num
                        ? 'bg-gima-navy text-white shadow-sm ring-1 ring-gima-navy-dark'
                        : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* PRIMARY ACTION BUTTON */}
            <button
              type="button"
              disabled={isGenerating || (generationMode === 'pollinations' && !costCalculation.isSufficientBalance)}
              onClick={handleGenerateCreative}
              className={`w-full py-4 px-6 rounded-2xl text-white font-extrabold text-sm sm:text-base tracking-wide shadow-card transition-all flex items-center justify-center gap-2.5 min-h-[54px] ${
                isGenerating || (generationMode === 'pollinations' && !costCalculation.isSufficientBalance)
                  ? 'bg-slate-400 cursor-not-allowed opacity-75'
                  : 'bg-gima-navy hover:bg-gima-navy-light active:scale-[0.99] cursor-pointer'
              }`}
            >
              <Sparkles className={`h-5 w-5 text-gima-gold-light ${isGenerating ? 'animate-spin' : ''}`} />
              <span>
                {isGenerating
                  ? `GENERATING ${variationsCount} VARIATION${variationsCount > 1 ? 'S' : ''}...`
                  : generationMode === 'demo-preview'
                  ? `GENERATE DEMO PREVIEW (${variationsCount} Var • Instant)`
                  : generationMode === 'free-models'
                  ? `GENERATE FREE CREATIVE (${variationsCount} Var • 0 Pollen)`
                  : `GENERATE CREATIVE (${activeModel?.name.split(' ')[0] || 'AI'} • ${variationsCount} Var • Est. ${costCalculation.totalText})`}
              </span>
            </button>
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN: RESULTS, FIXED VERTICAL CARDS & BRIEF
            ======================================================== */}
        <div className="lg:col-span-5 space-y-5">
          {/* Collapsible Knowledge Sources & Clinical Brief */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-gima-navy" />
                <span>Live GIMA Clinical Brief</span>
              </span>
              <button
                type="button"
                onClick={() => setShowKnowledgeBrief(!showKnowledgeBrief)}
                className="text-xs sm:text-sm font-bold text-gima-navy hover:underline min-h-[36px] flex items-center"
              >
                {showKnowledgeBrief ? 'Collapse' : 'Expand'}
              </button>
            </div>

            {showKnowledgeBrief && (
              <div className="space-y-2 text-sm animate-fade-in pt-2 border-t border-slate-100">
                <div className="text-xs sm:text-sm text-slate-700">
                  <strong className="text-slate-900 font-bold">Target:</strong> {course} ({campaignType})
                </div>
                <div className="text-xs sm:text-sm text-slate-700">
                  <strong className="text-slate-900 font-bold">Style:</strong> {style} ({aspectRatio})
                </div>
                <div className="text-xs sm:text-sm text-slate-600">
                  <strong className="text-slate-900 font-bold">Verified Sources ({retrievedKnowledge.length}):</strong>
                  <ul className="list-disc pl-5 space-y-1 mt-1 text-xs text-slate-600">
                    {retrievedKnowledge.slice(0, 3).map((k, i) => (
                      <li key={i} className="truncate">
                        {k.sourceTitle || k.documentName || k.subject || 'GIMA Clinical Document'}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Performance & Latency Bar */}
          {(timeToFirstImage !== null || totalGenerationTime !== null) && (
            <div className="rounded-xl bg-slate-900 text-white px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between font-mono">
              <span className="text-slate-400">Generation Performance:</span>
              <div className="flex items-center gap-3">
                {timeToFirstImage !== null && (
                  <span className="text-emerald-400 font-bold">
                    TTFI: {(timeToFirstImage / 1000).toFixed(2)}s
                  </span>
                )}
                {totalGenerationTime !== null && (
                  <span className="text-slate-300 font-semibold">
                    Total: {(totalGenerationTime / 1000).toFixed(2)}s
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Fixed Vertical Result Cards Stack */}
          <div className="flex flex-col space-y-5 w-full">
            {slots.length === 0 ? (
              /* Idle Empty State */
              <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-10 text-center space-y-3">
                <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-subtle">
                  <Sparkles className="h-7 w-7 text-slate-400" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Studio Ready for Generation</h4>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto mt-1 leading-relaxed">
                    Select your course, style directives and click <strong>Generate Creative</strong> to preview results here.
                  </p>
                </div>
              </div>
            ) : (
              /* Mounted Stationary Slots */
              slots.map((slot) => {
                const aspectClass = getAspectClass(aspectRatio);
                const currentVar = slot.variation;

                return (
                  <div
                    key={slot.index}
                    className="w-full rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-subtle relative"
                  >
                    {/* Slot Header */}
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-900 flex items-center gap-2">
                        <span>Variation {slot.variationNumber}</span>
                        {slot.status === 'ready' && (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                            currentVar?.isHybridPoster
                              ? 'text-teal-900 bg-teal-50 border-teal-300'
                              : 'text-emerald-950 bg-emerald-50 border-emerald-300'
                          }`}>
                            {currentVar?.isHybridPoster ? '★ Hybrid Poster (0 Pollen)' : 'Ready'}
                          </span>
                        )}
                        {slot.status === 'generating' && (
                          <span className="text-xs font-bold text-amber-950 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 animate-pulse">
                            Synthesizing & Composing...
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        {currentVar?.isHybridPoster && currentVar.rawBackgroundUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              setShowRawBg((prev) => ({
                                ...prev,
                                [slot.index]: !prev[slot.index],
                              }))
                            }
                            className="text-xs font-bold text-gima-navy hover:underline bg-white px-2.5 py-1 rounded-lg border border-slate-300 shadow-2xs"
                          >
                            {showRawBg[slot.index] ? 'Show Poster' : 'Show Visual Artwork'}
                          </button>
                        )}
                        {slot.durationMs && (
                          <span className="text-xs font-mono text-slate-600 font-semibold">
                            {(slot.durationMs / 1000).toFixed(1)}s
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stationary Media Frame with Strict Aspect Ratio */}
                    <div className={`w-full ${aspectClass} relative bg-slate-900 overflow-hidden flex items-center justify-center`}>
                      {slot.status === 'generating' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 text-white overflow-hidden">
                          {/* Inner Shimmer Animation */}
                          <div className="animate-internal-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                          <Sparkles className="h-7 w-7 text-gima-gold-light animate-spin" />
                          <span className="text-sm font-semibold text-slate-200 tracking-wide">
                            {generationMode === 'free-models'
                              ? `Synthesizing Visual Plate & Composing Poster...`
                              : `Synthesizing Variation ${slot.variationNumber}...`}
                          </span>
                        </div>
                      )}

                      {slot.status === 'error' && (
                        <div className="p-6 text-center space-y-3 text-white">
                          <AlertCircle className="h-8 w-8 text-red-400 mx-auto" />
                          <div className="text-sm font-bold text-red-200">Generation Failed</div>
                          <div className="text-xs text-slate-300 max-w-xs">{slot.error || 'Server error occurred'}</div>
                          <button
                            type="button"
                            onClick={() => handleRetrySlot(slot.index)}
                            className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm min-h-[38px]"
                          >
                            Retry This Slot
                          </button>
                        </div>
                      )}

                      {slot.status === 'ready' && currentVar && (
                        <div className="relative w-full h-full">
                          <img
                            src={
                              currentVar.isHybridPoster && showRawBg[slot.index] && currentVar.rawBackgroundUrl
                                ? currentVar.rawBackgroundUrl
                                : currentVar.previewImageUrl
                            }
                            alt={`Variation ${slot.variationNumber}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    {/* ALWAYS VISIBLE TOUCH-FRIENDLY ACTION TOOLBAR (Accessible on mobile & desktop) */}
                    {slot.status === 'ready' && currentVar && (
                      <div className="p-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const dlUrl =
                                currentVar.isHybridPoster && showRawBg[slot.index] && currentVar.rawBackgroundUrl
                                  ? currentVar.rawBackgroundUrl
                                  : currentVar.previewImageUrl;
                              handleDownload(dlUrl, slot.variationNumber);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition-colors min-h-[38px]"
                            title="Download PNG image"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setLightboxIndex(slot.index)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition-colors min-h-[38px]"
                            title="View Fullscreen"
                          >
                            <Maximize2 className="h-4 w-4" />
                            <span>Fullscreen</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSaveSlotToProjects(slot)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs sm:text-sm font-bold transition-colors min-h-[38px]"
                            title="Save to Projects"
                          >
                            <FolderPlus className="h-4 w-4 text-gima-navy" />
                            <span>Save</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUseAsReference(currentVar.previewImageUrl)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs sm:text-sm font-bold transition-colors min-h-[38px]"
                            title="Use as reference image"
                          >
                            <ImageIcon className="h-4 w-4 text-gima-navy" />
                            <span className="hidden sm:inline">Reference</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Inline Refinement Drawer */}
                    {slot.status === 'ready' && currentVar && (
                      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Quick refine instruction for this image..."
                          value={refiningSlotIndex === slot.index ? refinementInput : ''}
                          onFocus={() => setRefiningSlotIndex(slot.index)}
                          onChange={(e) => setRefinementInput(e.target.value)}
                          className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gima-navy"
                        />
                        <button
                          type="button"
                          onClick={() => handleRefineVariation(slot.index)}
                          className="px-3.5 py-2 rounded-xl bg-gima-navy text-white text-xs sm:text-sm font-bold hover:bg-gima-navy-light min-h-[38px]"
                        >
                          Refine
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Asset Picker Modal */}
      <AssetPickerModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        selectedAssets={selectedAssets}
        onToggleAsset={(asset) => {
          setSelectedAssets((prev) => {
            const exists = prev.some((a) => a.id === asset.id);
            return exists ? prev.filter((a) => a.id !== asset.id) : [...prev, asset];
          });
        }}
      />

      {/* Fullscreen Lightbox */}
      {lightboxIndex !== null && slots[lightboxIndex]?.variation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setLightboxIndex(null)}
          role="dialog"
          aria-label="Image fullscreen lightbox"
        >
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <img
              src={slots[lightboxIndex].variation!.previewImageUrl}
              alt="Fullscreen preview"
              className="max-h-[85vh] max-w-[85vw] object-contain rounded-2xl shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="absolute top-3 right-3 p-2.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close fullscreen"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateCreativePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading creative studio...</div>}>
      <CreateCreativeContent />
    </Suspense>
  );
}
