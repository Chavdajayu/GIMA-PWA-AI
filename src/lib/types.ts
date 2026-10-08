export type SourceType = 'pdf' | 'website';

export interface PagePreview {
  pageNumber: number;
  snippet: string;
}

export interface KnowledgeItem {
  id: string;
  sourceType: SourceType;
  sourceUrl: string;
  sourceTitle: string;
  contentType: string;
  course?: string | null;
  subject?: string;
  category: string;
  pageNumber?: number | null;
  pageCount?: number;
  documentName?: string | null;
  imageUrl?: string;
  topics: string[];
  summary: string;
  headings?: string[];
  pagePreviews?: PagePreview[];
  createdAt: string;
  updatedAt: string;
  priority?: number;
}

export interface AssetItem {
  id: string;
  name: string;
  category: 'Logos' | 'Course imagery' | 'Instructor imagery' | 'Website imagery' | 'Free-course imagery' | 'Uploaded references';
  url: string;
  sourceUrl?: string;
  aspectRatio?: string;
  description: string;
}

export interface BrandConfig {
  brandName: string;
  acronym: string;
  tagline: string;
  accreditationDesignations: string[];
  corePrograms: {
    id: string;
    name: string;
    description: string;
    totalModules: number;
    capstoneModule: string;
  }[];
  curriculumCourses: {
    code: string;
    title: string;
    focus: string;
  }[];
  freeCourses: {
    id: string;
    title: string;
    description: string;
    associatedPdfCount?: number;
    instructor: string;
  }[];
  keyPersonnel: {
    name: string;
    credentials: string;
    role: string;
    bio: string;
  }[];
  colorPalette: Record<string, string>;
  typography: Record<string, string>;
  complianceRules: string[];
  approvedCTAs: string[];
}

export type CampaignType =
  | 'Course Promotion'
  | 'Free Course Promotion'
  | 'Educational Awareness'
  | 'Event Promotion'
  | 'Social Media Campaign'
  | 'Brand Awareness'
  | 'Custom';

export type PlatformType =
  | 'Instagram'
  | 'Facebook'
  | 'LinkedIn'
  | 'Website'
  | 'Email'
  | 'Print'
  | 'Story';

export type CreativeType =
  | 'Poster'
  | 'Social Post'
  | 'Carousel Cover'
  | 'Banner'
  | 'Advertisement'
  | 'Story'
  | 'Course Promotion'
  | 'Event Graphic'
  | 'Educational Graphic';

export type AspectRatioType = '1:1' | '4:5' | '16:9' | '9:16' | 'A4' | 'Custom';

export type VisualStyleType =
  | 'Clinical Editorial'
  | 'Premium Academic'
  | 'Modern Healthcare'
  | 'Minimal Luxury'
  | 'Educational Infographic'
  | 'Bold Campaign';

export interface GenerationRequest {
  id: string;
  title: string;
  campaignType: CampaignType;
  course: string;
  topic: string;
  platforms: PlatformType[];
  creativeType: CreativeType;
  aspectRatio: AspectRatioType;
  style: VisualStyleType;
  headline: string;
  cta: string;
  date?: string;
  location?: string;
  audience: string;
  offer?: string;
  language: string;
  brandEmphasis: string;
  variationsCount: number;
  referenceImages: AssetItem[];
  extraPrompt: string;
  retrievedKnowledge: KnowledgeItem[];
  brandInstructions: string[];
  createdAt: string;
}

export type ProjectStatus = 'Draft' | 'In Review' | 'Approved' | 'Archived';

export interface GeneratedVariation {
  id: string;
  variationNumber: number;
  previewImageUrl: string;
  compositionHeadline: string;
  compositionSubhead: string;
  ctaText: string;
  aspectRatio: AspectRatioType;
  style: VisualStyleType;
  isDeterministicDemo: boolean;
  notes: string;
  modelUsed?: string;
  generationTimeMs?: number;
  promptSummary?: string;
  isRealGemini?: boolean;
}

export interface ApiGenerationResponse {
  success: boolean;
  provider?: {
    id: string;
    model: string;
  };
  variations?: {
    id: string;
    imageDataUrl: string;
    mimeType: string;
    width?: number;
    height?: number;
    promptSummary?: string;
  }[];
  metadata?: {
    course: string;
    creativeType: string;
    aspectRatio: string;
    generationTimeMs?: number;
  };
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}

export interface ApiProviderStatus {
  configured: boolean;
  provider: string;
  model: string;
  size: string;
  mode: 'real' | 'demo';
  message: string;
}

export interface ProjectRecord {
  id: string;
  name: string;
  course: string;
  campaignType: CampaignType;
  creativeType: CreativeType;
  format: AspectRatioType;
  platforms: PlatformType[];
  status: ProjectStatus;
  lastEdited: string;
  createdAt: string;
  thumbnail: string;
  request: GenerationRequest;
  variations: GeneratedVariation[];
}

export type GenerationState =
  | 'idle'
  | 'preparing'
  | 'retrieving'
  | 'building_brief'
  | 'generating'
  | 'review'
  | 'success'
  | 'error';

export interface ActivityEvent {
  id: string;
  type: 'knowledge_indexed' | 'pdf_processed' | 'project_created' | 'creative_draft' | 'asset_selected' | 'generation_demo';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
