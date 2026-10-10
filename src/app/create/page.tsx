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

  // 1. Initial Load: Load live model catalog & check balance
  useEffect(() => {
    loadModelCatalog();
    refreshPollenBalance();
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
      setCta('Enroll Free Today');
      setCampaignType('Free Course Promotion');
    } else if (selectedTitle.includes('Brain Development')) {
      setTopic('Neurodevelopment, Pediatric Nutrition & Cognitive Pathways');
      setHeadline('Nutritional Medicine in Brain Development');
      setCta('Explore Free Course');
      setCampaignType('Free Course Promotion');
    } else if (selectedTitle.includes('ROHP')) {
      setTopic('Registered Orthomolecular Health Practitioner Designation');
      setHeadline('Accredited ROHP™ Clinical Certification');
      setCta('Apply for Accreditation');
      setCampaignType('Course Promotion');
    } else {
      setTopic('Integrative Clinical Practice & Functional Protocols');
      setHeadline(`${selectedTitle} — Clinical Curriculum`);
      setCta('Enroll Today');
      setCampaignType('Course Promotion');
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
      const provider = new PollinationsImageProvider(selectedModelId);
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
      const provider = new PollinationsImageProvider(selectedModelId);
      const req = buildCurrentRequest();
      req.extraPrompt = `${req.extraPrompt} [Refinement: ${refinementInput.trim()}]`;
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

      const provider = new PollinationsImageProvider(targetModelId);
      let firstCompleted = false;

      // 2. Fire independent concurrent requests for progressive replacement
      const promises = initialSlots.map(async (slot) => {
        try {
          const resultVar = await provider.generateSingleVariation(req, slot.index);
          const finishedAt = Date.now();

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
    <div className="space-y-6 pb-20 animate-fade-in max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>GIMA AI Creative Studio</span>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full uppercase">
              Production
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create brand-compliant, clinical marketing posters and social campaigns grounded in accredited GIMA knowledge.
          </p>
        </div>

        {/* Balance Badge with Live Refresh */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white border border-slate-200 shadow-xs px-3 py-1.5 rounded-xl text-xs">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span>Balance:</span>
            </span>
            <span className="font-extrabold text-slate-900 font-mono">
              {typeof pollinationsStatus?.balance === 'number'
                ? `${pollinationsStatus.balance.toFixed(4)} Pollen`
                : 'Pollen loading...'}
            </span>
            <button
              type="button"
              onClick={refreshPollenBalance}
              disabled={isRefreshingBalance}
              title="Refresh Pollen balance"
              className="p-1 text-slate-400 hover:text-slate-800 rounded transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshingBalance ? 'animate-spin text-gima-navy' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Creation Flow (Simplified 6 Sections) | Right Real-Time Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================
            LEFT COLUMN: STREAMLINED CREATIVE WORKFLOW (SECTIONS 1 - 6)
            ======================================================== */}
        <div className="lg:col-span-7 space-y-6">

          {/* SECTION 1: WHAT ARE WE PROMOTING? */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gima-navy text-white text-[10px]">
                  1
                </span>
                <span>What are we promoting?</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">GIMA Curriculum & Clinical Content</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Campaign Type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Campaign Objective
                </label>
                <select
                  value={campaignType}
                  onChange={(e) => setCampaignType(e.target.value as CampaignType)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-800 focus:border-gima-navy focus:bg-white focus:outline-none transition-all"
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
                <label className="block text-xs font-semibold text-slate-700">
                  Target Course / Program
                </label>
                <select
                  value={course}
                  onChange={(e) => handleSelectCourse(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-800 focus:border-gima-navy focus:bg-white focus:outline-none transition-all"
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
              <label className="block text-xs font-semibold text-slate-700">
                Core Clinical Topic & Highlights
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Cellular Senescence, Free Radicals & Glycation"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-800 focus:border-gima-navy focus:bg-white focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* SECTION 2: WHERE WILL IT BE PUBLISHED? */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gima-navy text-white text-[10px]">
                  2
                </span>
                <span>Where will it be published?</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Channel, Format & Dimensions</span>
            </div>

            {/* Platform Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Platform</label>
              <div className="flex flex-wrap gap-1.5">
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
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-gima-navy text-white shadow-xs'
                          : 'border border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{p.icon}</span>
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Creative Type */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Creative Type</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {creativeTypes.slice(0, 4).map((c) => (
                    <button
                      type="button"
                      key={c.label}
                      onClick={() => setCreativeType(c.label)}
                      className={`text-left px-2.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                        creativeType === c.label
                          ? 'border-gima-navy bg-navy-50/40 text-gima-navy font-bold'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div>{c.label}</div>
                      <div className="text-[10px] text-slate-400 font-normal leading-tight">{c.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Aspect Ratio</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {aspectRatioOptions.slice(0, 3).map((r) => (
                    <button
                      type="button"
                      key={r.value}
                      onClick={() => setAspectRatio(r.value)}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                        aspectRatio === r.value
                          ? 'border-gima-navy bg-navy-50/40 text-gima-navy font-bold'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{r.label}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{r.value}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: VISUAL DIRECTION */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gima-navy text-white text-[10px]">
                  3
                </span>
                <span>Visual Direction</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">GIMA Brand Styles</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {visualStyles.map((vs) => {
                const isSelected = style === vs.title;
                return (
                  <button
                    type="button"
                    key={vs.title}
                    onClick={() => setStyle(vs.title)}
                    className={`text-left p-3 rounded-xl border transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-gima-navy bg-navy-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">{vs.title}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {vs.previewBadge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                        {vs.desc}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-gima-navy">
                        <Check className="h-3 w-3" />
                        <span>Active</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: REFERENCE IMAGES */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gima-navy text-white text-[10px]">
                  4
                </span>
                <span>Reference Images</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssetModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-gima-navy hover:bg-slate-50 transition-colors"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Add GIMA Asset</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload</span>
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
            <div className="flex flex-wrap gap-2">
              {selectedAssets.length === 0 ? (
                <div className="text-xs text-slate-400 italic py-1">
                  No reference assets attached. Text-only visual generation will be used.
                </div>
              ) : (
                selectedAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs group"
                  >
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="h-6 w-6 rounded object-cover border border-slate-200 bg-white"
                    />
                    <span className="font-semibold text-slate-800 text-[11px] max-w-[140px] truncate">
                      {asset.name}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedAssets((prev) => prev.filter((a) => a.id !== asset.id))
                      }
                      className="text-slate-400 hover:text-red-600 rounded p-0.5 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Model reference capability notice */}
            <div className="rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-500 flex items-center gap-2 border border-slate-100">
              <Info className="h-4 w-4 text-slate-400 shrink-0" />
              <span>
                {activeModel?.supportsReferenceImages
                  ? `Active model (${activeModel.name}) supports direct reference image conditioning.`
                  : `Active model (${activeModel?.name || 'Selected'}) generates text-to-image. Reference assets are used to enrich the clinical prompt.`}
              </span>
            </div>
          </div>

          {/* SECTION 5: CONTENT AND INSTRUCTIONS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gima-navy text-white text-[10px]">
                  5
                </span>
                <span>Content & Creative Brief</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="text-[11px] font-bold text-gima-navy hover:underline flex items-center gap-1"
              >
                <span>{showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options</span>
                {showAdvancedOptions ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Primary Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-800 focus:border-gima-navy focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Call to Action (CTA)</label>
                <input
                  type="text"
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-800 focus:border-gima-navy focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Target Audience</label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-800 focus:border-gima-navy focus:bg-white focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Extra Art Direction & Composition</label>
              <textarea
                value={extraPrompt}
                onChange={(e) => setExtraPrompt(e.target.value)}
                rows={2}
                placeholder="e.g. Create a premium clinical editorial poster with the headline on the left, a clean scientific background and the instructor on the right."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-800 focus:border-gima-navy focus:bg-white focus:outline-none transition-all resize-none"
              />
            </div>

            {/* Collapsible Advanced Options */}
            {showAdvancedOptions && (
              <div className="pt-3 border-t border-slate-100 space-y-3 animate-fade-in text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="font-semibold text-slate-700 block mb-1">Language</span>
                    <span className="text-slate-500 text-xs">English (Default)</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block mb-1">Brand Emphasis</span>
                    <span className="text-slate-500 text-xs">Clinical Authority & BOIM Accreditation</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 6: VARIATIONS, MODEL, POLLEN COST & GENERATION */}
          <div className="rounded-2xl border-2 border-gima-navy/20 bg-white p-5 shadow-sm space-y-5">
            {/* Generation Mode Selector (Exactly 3 Approved Modes) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-gima-navy" />
                  <span>Generation Engine Mode</span>
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Approved Marketing Modes</span>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl text-xs">
                {/* 1. Pollinations AI */}
                <button
                  type="button"
                  onClick={() => setGenerationMode('pollinations')}
                  className={`py-2 px-3 rounded-lg font-bold transition-all text-center ${
                    generationMode === 'pollinations'
                      ? 'bg-gima-navy text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pollinations AI
                </button>

                {/* 2. Free Models */}
                <button
                  type="button"
                  onClick={() => setGenerationMode('free-models')}
                  className={`py-2 px-3 rounded-lg font-bold transition-all text-center flex items-center justify-center gap-1 ${
                    generationMode === 'free-models'
                      ? 'bg-gima-navy text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Free Models</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono font-bold">
                    0 Pollen
                  </span>
                </button>

                {/* 3. Demo Preview */}
                <button
                  type="button"
                  onClick={() => setGenerationMode('demo-preview')}
                  className={`py-2 px-3 rounded-lg font-bold transition-all text-center ${
                    generationMode === 'demo-preview'
                      ? 'bg-gima-navy text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
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
                <div className="space-y-1.5 relative">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Cpu className="h-3.5 w-3.5 text-gima-gold-dark" />
                      <span>Model Selector — GIMA Recommended Image Quality</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Ranked High to Low Quality</span>
                  </div>

                  {/* Active Selected Model Card / Toggle */}
                  <div
                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                    className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 p-3 flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gima-navy text-white font-extrabold text-xs">
                        #{activeModel?.rank || 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">
                            {activeModel?.name || 'Selected Model'}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              activeModel?.qualityCategory === 'Premium'
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : activeModel?.qualityCategory === 'High Quality'
                                ? 'bg-sky-100 text-sky-900 border border-sky-200'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            }`}
                          >
                            {activeModel?.qualityCategory || 'High Quality'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium flex items-center gap-2">
                          <span>By {activeModel?.publisher || 'Community'}</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-700">
                            Est: {activeModel?.costEstimateText || 'Variable'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {/* Expandable Model Catalog List */}
                  {isModelDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 z-40 mt-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-elevated max-h-80 overflow-y-auto space-y-1.5">
                      {/* Search Bar */}
                      <div className="relative sticky top-0 bg-white pb-2 z-10 border-b border-slate-100">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search live models (OpenAI, FLUX, Ideogram, Gemini)..."
                          value={modelSearchQuery}
                          onChange={(e) => setModelSearchQuery(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                        />
                      </div>

                      {filteredRankedModels.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => {
                            setSelectedModelId(m.id);
                            setIsModelDropdownOpen(false);
                          }}
                          className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                            selectedModelId === m.id
                              ? 'bg-navy-50/70 border border-gima-navy text-gima-navy'
                              : 'hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-200 text-slate-700 text-[10px] font-bold">
                              #{m.rank}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs">{m.name}</span>
                                <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                                  {m.qualityCategory}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500">{m.referenceSupportText}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] font-mono font-bold text-slate-800 block">
                              {m.costEstimateText}
                            </span>
                            <span className="text-[9px] text-slate-400">{m.publisher}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pre-Generation Pollen Cost Estimation Breakdown */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                    <span className="flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5 text-amber-600" />
                      <span>Estimated Pollen Usage Before Generation</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-600">
                      {variationsCount} variation{variationsCount > 1 ? 's' : ''} requested
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-amber-200/60 text-xs">
                    <div className="bg-white/80 p-1.5 rounded-lg border border-amber-100">
                      <div className="text-[10px] text-slate-500 font-medium">Per Image</div>
                      <div className="font-bold text-slate-900 font-mono text-[11px]">{costCalculation.perImageText}</div>
                    </div>
                    <div className="bg-white/80 p-1.5 rounded-lg border border-amber-100">
                      <div className="text-[10px] text-slate-500 font-medium">Total ({variationsCount}x)</div>
                      <div className="font-bold text-amber-900 font-mono text-[11px]">{costCalculation.totalText}</div>
                    </div>
                    <div className="bg-white/80 p-1.5 rounded-lg border border-amber-100">
                      <div className="text-[10px] text-slate-500 font-medium">Remaining Bal.</div>
                      <div className="font-bold text-slate-900 font-mono text-[11px]">{costCalculation.remainingText}</div>
                    </div>
                  </div>

                  {!costCalculation.isSufficientBalance && (
                    <div className="text-[11px] text-red-700 font-semibold flex items-center gap-1 pt-1">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>Insufficient Pollen balance. Consider selecting Z-Image Turbo (~0.004 Pollen) or Demo Preview.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MODE CONTENT: FREE MODELS */}
            {generationMode === 'free-models' && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3 animate-fade-in text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-700" />
                    <span>Verified Zero-Cost Image Models</span>
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                    0 Pollen Cost
                  </span>
                </div>

                {verifiedFreeModels.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-slate-600 text-xs">
                      The following model is verified to have 0 listed Pollen image tokens under current live catalog rules:
                    </p>
                    {verifiedFreeModels.map((fm) => (
                      <div key={fm.id} className="p-2.5 rounded-lg bg-white border border-emerald-200 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{fm.name}</div>
                          <div className="text-[10px] text-slate-500">{fm.publisher} • Subject to community provider rate limits</div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                          Active Free Model
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-3 border border-emerald-100 space-y-2">
                    <p className="text-slate-700 font-semibold">
                      No verified zero-cost image models are currently available in the live catalog. Free-provider evaluation is pending.
                    </p>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      External free providers (e.g. HuggingFace, local Stable Diffusion) will be evaluated in the next phase. For minimal cost right now, use Pollinations AI with budget-friendly models like <strong>Z-Image Turbo (~0.004 Pollen)</strong> or switch to Demo Preview.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setGenerationMode('pollinations');
                          setSelectedModelId('tongyi-mai/z-image-turbo');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-gima-navy text-white text-[11px] font-bold"
                      >
                        Use Z-Image Turbo (~0.004 Pollen)
                      </button>
                      <button
                        type="button"
                        onClick={() => setGenerationMode('demo-preview')}
                        className="px-2.5 py-1 rounded-lg border border-slate-300 text-slate-700 text-[11px] font-bold"
                      >
                        Use Demo Preview
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MODE CONTENT: DEMO PREVIEW */}
            {generationMode === 'demo-preview' && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2 animate-fade-in text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-gima-navy" />
                  <span>Deterministic Offline Demo Preview</span>
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Generates deterministic high-fidelity previews using authentic GIMA identity, Dr. Meschino portraits, and clinical citations without consuming Pollen balance. Transparently marked as a preview, not AI-generated.
                </p>
              </div>
            )}

            {/* Variations Count Segmented Selector */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-700">Variations to Generate</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setVariationsCount(num)}
                    className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                      variationsCount === num
                        ? 'bg-gima-navy text-white shadow-xs'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
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
              className={`w-full py-3.5 px-4 rounded-xl text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 ${
                isGenerating || (generationMode === 'pollinations' && !costCalculation.isSufficientBalance)
                  ? 'bg-slate-400 cursor-not-allowed opacity-75'
                  : 'bg-gima-navy hover:bg-navy-900 active:scale-[0.99] cursor-pointer'
              }`}
            >
              <Sparkles className={`h-4 w-4 text-gima-gold-light ${isGenerating ? 'animate-spin' : ''}`} />
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
        <div className="lg:col-span-5 space-y-4">
          {/* Collapsible Knowledge Sources & Clinical Brief */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-gima-navy" />
                <span>Live GIMA Clinical Brief</span>
              </span>
              <button
                type="button"
                onClick={() => setShowKnowledgeBrief(!showKnowledgeBrief)}
                className="text-[11px] font-bold text-gima-navy hover:underline"
              >
                {showKnowledgeBrief ? 'Collapse' : 'Expand'}
              </button>
            </div>

            {showKnowledgeBrief && (
              <div className="space-y-2 text-xs animate-fade-in pt-1 border-t border-slate-100">
                <div className="text-[11px] text-slate-600">
                  <strong className="text-slate-800">Target:</strong> {course} ({campaignType})
                </div>
                <div className="text-[11px] text-slate-600">
                  <strong className="text-slate-800">Style:</strong> {style} ({aspectRatio})
                </div>
                <div className="text-[11px] text-slate-500">
                  <strong className="text-slate-700">Verified Sources ({retrievedKnowledge.length}):</strong>
                  <ul className="list-disc pl-4 space-y-0.5 mt-1 text-[10px]">
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
            <div className="rounded-xl bg-slate-900 text-white px-3 py-2 text-[11px] flex items-center justify-between font-mono">
              <span className="text-slate-400">Generation Performance:</span>
              <div className="flex items-center gap-3">
                {timeToFirstImage !== null && (
                  <span className="text-emerald-400 font-bold">
                    TTFI: {(timeToFirstImage / 1000).toFixed(2)}s
                  </span>
                )}
                {totalGenerationTime !== null && (
                  <span className="text-slate-300">
                    Total: {(totalGenerationTime / 1000).toFixed(2)}s
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Fixed Vertical Result Cards Stack */}
          <div className="flex flex-col space-y-4 w-full">
            {slots.length === 0 ? (
              /* Idle Empty State */
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-10 text-center space-y-3">
                <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <Sparkles className="h-6 w-6 text-slate-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Studio Ready for Generation</h4>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-0.5">
                    Select your course, style directives and click <strong>Generate Creative</strong>.
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
                    <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span>Variation {slot.variationNumber}</span>
                        {slot.status === 'ready' && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            Ready
                          </span>
                        )}
                        {slot.status === 'generating' && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 animate-pulse">
                            Generating...
                          </span>
                        )}
                      </span>
                      {slot.durationMs && (
                        <span className="text-[10px] font-mono text-slate-500">
                          {(slot.durationMs / 1000).toFixed(1)}s
                        </span>
                      )}
                    </div>

                    {/* Stationary Media Frame with Strict Aspect Ratio */}
                    <div className={`w-full ${aspectClass} relative bg-slate-900 overflow-hidden flex items-center justify-center`}>
                      {slot.status === 'generating' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 text-white overflow-hidden">
                          {/* Inner Shimmer Animation */}
                          <div className="skeleton-card-inner-shimmer" />
                          <Sparkles className="h-6 w-6 text-gima-gold-light animate-spin" />
                          <span className="text-xs font-semibold text-slate-200 tracking-wide">
                            Synthesizing Variation {slot.variationNumber}...
                          </span>
                        </div>
                      )}

                      {slot.status === 'error' && (
                        <div className="p-6 text-center space-y-3 text-white">
                          <AlertCircle className="h-7 w-7 text-red-400 mx-auto" />
                          <div className="text-xs font-bold text-red-200">Generation Failed</div>
                          <div className="text-[11px] text-slate-300 max-w-xs">{slot.error || 'Server error occurred'}</div>
                          <button
                            type="button"
                            onClick={() => handleRetrySlot(slot.index)}
                            className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-xs"
                          >
                            Retry This Slot
                          </button>
                        </div>
                      )}

                      {slot.status === 'ready' && currentVar && (
                        <div className="relative w-full h-full group">
                          <img
                            src={currentVar.previewImageUrl}
                            alt={`Variation ${slot.variationNumber}`}
                            className="w-full h-full object-cover"
                          />

                          {/* Floating Glass Action Bar on Hover */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                            <button
                              type="button"
                              onClick={() => handleDownload(currentVar.previewImageUrl, slot.variationNumber)}
                              title="Download Image"
                              className="p-2 rounded-xl bg-white/90 text-slate-800 hover:bg-white shadow-md transition-all"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setLightboxIndex(slot.index)}
                              title="Fullscreen"
                              className="p-2 rounded-xl bg-white/90 text-slate-800 hover:bg-white shadow-md transition-all"
                            >
                              <Maximize2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveSlotToProjects(slot)}
                              title="Save to Projects"
                              className="p-2 rounded-xl bg-white/90 text-slate-800 hover:bg-white shadow-md transition-all"
                            >
                              <FolderPlus className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUseAsReference(currentVar.previewImageUrl)}
                              title="Use as Reference"
                              className="p-2 rounded-xl bg-white/90 text-slate-800 hover:bg-white shadow-md transition-all"
                            >
                              <ImageIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Inline Refinement Drawer */}
                    {slot.status === 'ready' && currentVar && (
                      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Quick refine instruction for this image..."
                          value={refiningSlotIndex === slot.index ? refinementInput : ''}
                          onFocus={() => setRefiningSlotIndex(slot.index)}
                          onChange={(e) => setRefinementInput(e.target.value)}
                          className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-800 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRefineVariation(slot.index)}
                          className="px-2.5 py-1 rounded-lg bg-gima-navy text-white text-xs font-bold hover:bg-navy-900"
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
        >
          <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <img
              src={slots[lightboxIndex].variation!.previewImageUrl}
              alt="Fullscreen preview"
              className="max-h-[85vh] max-w-[85vw] object-contain rounded-xl shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="absolute top-2 right-2 p-2 rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X className="h-5 w-5" />
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
