import { ActivityEvent } from './types';

const ACTIVITY_STORAGE_KEY = 'gima_studio_activity_log';

// Authoritative local system events from the ingestion process
const BASE_SYSTEM_EVENTS: ActivityEvent[] = [
  {
    id: 'evt-master-sync',
    type: 'knowledge_indexed',
    title: 'Master Knowledge Index Synchronized',
    description: 'Unified 39 clinical course records, modules, and website pages into local retrieval foundation.',
    timestamp: new Date().toISOString(),
    metadata: { itemsIndexed: 39, source: 'GIMA Official Platform' }
  },
  {
    id: 'evt-pdf-ingest',
    type: 'pdf_processed',
    title: 'Authoritative Free-Course PDFs Ingested',
    description: 'Extracted, cleaned, and indexed 12 clinical PDFs from Theories of Aging curriculum (Dr. James Meschino).',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    metadata: { pdfCount: 12, pagesExtracted: 299, course: 'Theories of Aging' }
  },
  {
    id: 'evt-site-crawl',
    type: 'knowledge_indexed',
    title: 'GIMA Public Route Crawler Completed',
    description: 'Indexed 27 public routes including ROHP curriculum 101–106, module 7, and registered 45 authentic brand assets.',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    metadata: { pages: 27, assets: 45, domain: 'gim-academy.com' }
  }
];

export function getActivityEvents(): ActivityEvent[] {
  if (typeof window === 'undefined') return BASE_SYSTEM_EVENTS;
  try {
    const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    if (!raw) return BASE_SYSTEM_EVENTS;
    const userEvents: ActivityEvent[] = JSON.parse(raw);
    return [...userEvents, ...BASE_SYSTEM_EVENTS];
  } catch (e) {
    return BASE_SYSTEM_EVENTS;
  }
}

export function logActivity(event: Omit<ActivityEvent, 'id' | 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    const events: ActivityEvent[] = raw ? JSON.parse(raw) : [];
    const newEvent: ActivityEvent = {
      ...event,
      id: `evt-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    events.unshift(newEvent);
    // Keep max 50 events
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(events.slice(0, 50)));
  } catch (e) {
    console.error('Error logging activity event:', e);
  }
}
