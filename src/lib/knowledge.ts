import { KnowledgeItem, BrandConfig } from './types';
import masterIndexData from '../../data/knowledge/master-knowledge-index.json';
import brandConfigData from '../../data/metadata/gima-brand.json';
import pdfIndexData from '../../data/free-courses/theories-of-aging-index.json';

const masterKnowledge: KnowledgeItem[] = masterIndexData as unknown as KnowledgeItem[];
const brandConfig: BrandConfig = brandConfigData as unknown as BrandConfig;
const pdfKnowledge: any[] = pdfIndexData;

export interface KnowledgeFilters {
  course?: string;
  contentType?: string;
  sourceType?: 'pdf' | 'website';
  category?: string;
  topic?: string;
}

export function getBrandConfig(): BrandConfig {
  return brandConfig;
}

export function getAllKnowledge(): KnowledgeItem[] {
  return masterKnowledge;
}

export function getPdfDocuments(): any[] {
  return pdfKnowledge;
}

export function getKnowledgeStats() {
  const total = masterKnowledge.length;
  const pdfCount = masterKnowledge.filter((k) => k.sourceType === 'pdf').length;
  const webCount = masterKnowledge.filter((k) => k.sourceType === 'website').length;
  const coursesCount = brandConfig.curriculumCourses.length + brandConfig.freeCourses.length;
  
  // Count unique extracted topics
  const topicsSet = new Set<string>();
  masterKnowledge.forEach((k) => {
    k.topics?.forEach((t) => topicsSet.add(t));
  });

  return {
    totalItems: total,
    pdfSourcesCount: pdfCount,
    webSourcesCount: webCount,
    totalCourses: coursesCount,
    uniqueTopicsCount: topicsSet.size,
    lastUpdated: 'Live Index Synced'
  };
}

export function searchKnowledge(query: string = '', filters: KnowledgeFilters = {}): KnowledgeItem[] {
  const cleanQuery = query.toLowerCase().trim();
  
  return masterKnowledge.filter((item) => {
    // Filter by course
    if (filters.course && filters.course !== 'All') {
      const itemCourse = (item.course || '').toLowerCase();
      const targetCourse = filters.course.toLowerCase();
      if (!itemCourse.includes(targetCourse) && !targetCourse.includes(itemCourse)) {
        return false;
      }
    }

    // Filter by Source Type
    if (filters.sourceType && item.sourceType !== filters.sourceType) {
      return false;
    }

    // Filter by Category
    if (filters.category && filters.category !== 'All') {
      if (item.category !== filters.category) {
        return false;
      }
    }

    // Filter by Content Type
    if (filters.contentType && filters.contentType !== 'All') {
      if (item.contentType !== filters.contentType) {
        return false;
      }
    }

    // Filter by Topic
    if (filters.topic) {
      const hasTopic = (item.topics || []).some(
        (t) => t.toLowerCase() === filters.topic?.toLowerCase()
      );
      if (!hasTopic) return false;
    }

    // Text Query search
    if (cleanQuery) {
      const matchTitle = (item.sourceTitle || '').toLowerCase().includes(cleanQuery);
      const matchSummary = (item.summary || '').toLowerCase().includes(cleanQuery);
      const matchDocName = (item.documentName || '').toLowerCase().includes(cleanQuery);
      const matchSubject = (item.subject || '').toLowerCase().includes(cleanQuery);
      const matchTopics = (item.topics || []).some((t) => t.toLowerCase().includes(cleanQuery));

      if (!matchTitle && !matchSummary && !matchDocName && !matchSubject && !matchTopics) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    // If Free Course is related, give higher priority to PDFs
    const prioA = (a.priority || 50) + (filters.course?.toLowerCase().includes('theories') && a.sourceType === 'pdf' ? 50 : 0);
    const prioB = (b.priority || 50) + (filters.course?.toLowerCase().includes('theories') && b.sourceType === 'pdf' ? 50 : 0);
    return prioB - prioA;
  });
}

export function getKnowledgeForCourse(courseName: string): KnowledgeItem[] {
  if (!courseName) return [];
  return searchKnowledge('', { course: courseName });
}
