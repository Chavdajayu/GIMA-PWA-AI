'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronRight,
  X
} from 'lucide-react';
import { getAllKnowledge, getBrandConfig, getKnowledgeStats } from '@/lib/knowledge';
import { KnowledgeItem } from '@/lib/types';

const tabs = [
  { label: 'All Sources', value: 'all' },
  { label: 'Free Course PDFs (12)', value: 'pdf' },
  { label: 'Website Routes (27)', value: 'website' },
  { label: 'ROHP Curriculum', value: 'curriculum' },
  { label: 'Clinical Blog', value: 'blog' },
];

export default function KnowledgePage() {
  const masterKnowledge = useMemo(() => getAllKnowledge(), []);
  const stats = useMemo(() => getKnowledgeStats(), []);
  
  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);

  // Filter items
  const filteredKnowledge = useMemo(() => {
    return masterKnowledge.filter((item) => {
      // Tab filter
      if (activeTab === 'pdf' && item.sourceType !== 'pdf') return false;
      if (activeTab === 'website' && item.sourceType !== 'website') return false;
      if (activeTab === 'curriculum' && item.contentType !== 'course' && item.contentType !== 'program') return false;
      if (activeTab === 'blog' && item.contentType !== 'blog') return false;

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = item.sourceTitle.toLowerCase().includes(q);
        const matchCourse = (item.course || '').toLowerCase().includes(q);
        const matchTopics = item.topics.some((t) => t.toLowerCase().includes(q));
        const matchSummary = item.summary.toLowerCase().includes(q);
        if (!matchTitle && !matchCourse && !matchTopics && !matchSummary) return false;
      }
      return true;
    });
  }, [masterKnowledge, activeTab, search]);

  return (
    <div className="space-y-8 pb-16 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-950 uppercase tracking-wide">
              Verified Pipeline
            </span>
            <span className="text-slate-300 font-bold">•</span>
            <span className="text-xs sm:text-sm font-bold text-gima-navy">
              No Fabricated Content
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            GIMA Clinical Knowledge Foundation
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Authoritative source index encompassing live website routes, ROHP 101–106 curriculum, and local Free-Course PDFs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-right shadow-subtle">
            <span className="text-xs font-semibold text-slate-500 block">Total Records</span>
            <span className="text-base font-extrabold text-slate-900">{stats.totalItems} Sources</span>
          </div>
        </div>
      </div>

      {/* Prominent Free-Course PDF Highlight Card */}
      <div className="rounded-3xl border border-amber-300 bg-gradient-to-r from-amber-50/80 to-amber-100/40 p-7 shadow-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-200 text-amber-950 px-3 py-0.5 text-xs font-bold uppercase tracking-wide">
                Authoritative PDF Ingestion
              </span>
              <span className="text-xs sm:text-sm text-amber-950 font-bold">
                High Priority Retrieval
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Theories of Aging — Free Online Course Collection
            </h3>
            <p className="text-sm sm:text-base text-slate-700 max-w-3xl leading-relaxed font-medium">
              12 primary source PDF documents parsed and preserved with exact document structure: PowerPoint slides, Glutathione reviews, Melatonin reviews, Telomeres & Omega-3, Heavy Metal Chelation, and Skin Anti-Aging by <strong>Dr. James Meschino</strong>.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('pdf')}
            className="rounded-xl bg-amber-900 px-5 py-3 text-sm font-bold text-white shadow-card hover:bg-amber-950 transition-colors shrink-0 min-h-[44px]"
          >
            Inspect 12 PDFs
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-subtle">
        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto py-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors whitespace-nowrap min-h-[40px] ${
                activeTab === tab.value
                  ? 'bg-gima-navy text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search clinical topics, titles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50/70 pl-10 pr-4 py-2 text-sm sm:text-base text-slate-900 placeholder:text-slate-500 focus:border-gima-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-gima-navy/20"
          />
        </div>
      </div>

      {/* Knowledge Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredKnowledge.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle hover:border-gima-navy/50 hover:shadow-card transition-all flex flex-col justify-between"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedItem(item);
              }
            }}
            aria-label={`View clinical details for ${item.sourceTitle}`}
          >
            <div>
              {/* Card Meta */}
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    item.sourceType === 'pdf'
                      ? 'bg-amber-100 text-amber-950 border border-amber-300'
                      : 'bg-blue-100 text-blue-950 border border-blue-300'
                  }`}
                >
                  {item.sourceType === 'pdf' ? 'FREE COURSE PDF' : 'WEBSITE ROUTE'}
                </span>
                <span className="text-xs text-slate-600 font-semibold">
                  {item.pageCount ? `${item.pageCount} Pages` : 'Web Route'}
                </span>
              </div>

              {/* Title & Course */}
              <h4 className="mt-3 text-base sm:text-lg font-bold text-slate-900 group-hover:text-gima-navy transition-colors line-clamp-2">
                {item.sourceTitle}
              </h4>

              {item.course && (
                <span className="mt-1.5 inline-block text-xs sm:text-sm font-bold text-gima-gold-dark">
                  {item.course}
                </span>
              )}

              {/* Summary */}
              <p className="mt-2.5 text-sm text-slate-700 line-clamp-3 leading-relaxed">
                {item.summary}
              </p>

              {/* Topics */}
              {item.topics && item.topics.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {item.topics.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700"
                    >
                      {t}
                    </span>
                  ))}
                  {item.topics.length > 3 && (
                    <span className="text-xs text-slate-500 font-medium self-center">
                      +{item.topics.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-medium">
              <span className="text-slate-600 truncate max-w-[150px]">
                {item.sourceType === 'pdf' ? item.documentName : 'gim-academy.com'}
              </span>
              <span className="font-bold text-gima-navy flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Inspect <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Source Detail Drawer / Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="knowledge-detail-title"
        >
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-elevated overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4.5 bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      selectedItem.sourceType === 'pdf'
                        ? 'bg-amber-100 text-amber-950 border border-amber-300'
                        : 'bg-blue-100 text-blue-950 border border-blue-300'
                    }`}
                  >
                    {selectedItem.sourceType.toUpperCase()}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">{selectedItem.category}</span>
                </div>
                <h3 id="knowledge-detail-title" className="mt-1.5 text-lg sm:text-xl font-extrabold text-slate-900">
                  {selectedItem.sourceTitle}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                aria-label="Close document details"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Metadata attributes */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3">
                  <span className="text-xs text-slate-500 block font-bold uppercase tracking-wider">Source Type</span>
                  <span className="font-bold text-slate-900 capitalize block mt-1">{selectedItem.sourceType}</span>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3">
                  <span className="text-xs text-slate-500 block font-bold uppercase tracking-wider">Course Association</span>
                  <span className="font-bold text-slate-900 truncate block mt-1">{selectedItem.course || 'General'}</span>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3">
                  <span className="text-xs text-slate-500 block font-bold uppercase tracking-wider">Document / URL</span>
                  <span className="font-bold text-slate-900 truncate block mt-1 font-mono text-xs">
                    {selectedItem.documentName || selectedItem.sourceUrl}
                  </span>
                </div>
              </div>

              {/* Topics list */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2">Identified Clinical Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedItem.topics.map((t) => (
                    <span
                      key={t}
                      className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-1 text-xs sm:text-sm font-semibold text-blue-900"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Content Summary */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-2.5">
                <h4 className="text-sm font-bold text-slate-900">Extracted Content Preview</h4>
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                  {selectedItem.summary}
                </p>
              </div>

              {/* Page Previews if PDF */}
              {selectedItem.pagePreviews && selectedItem.pagePreviews.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900">Sample Page Previews</h4>
                  <div className="space-y-2.5">
                    {selectedItem.pagePreviews.map((p) => (
                      <div key={p.pageNumber} className="rounded-xl border border-slate-200 p-3.5 text-sm bg-white shadow-2xs">
                        <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider mb-1 text-gima-navy">
                          Page {p.pageNumber}
                        </span>
                        <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">{p.snippet}...</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-slate-50">
              <span className="text-xs text-slate-500 font-mono">
                Source Hash: {selectedItem.id}
              </span>
              <button
                onClick={() => setSelectedItem(null)}
                className="rounded-xl bg-gima-navy px-5 py-2.5 text-sm font-bold text-white hover:bg-gima-navy-light min-h-[44px] transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
