'use client';

import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  FileText,
  Globe,
  Search,
  Filter,
  ExternalLink,
  ChevronRight,
  X,
  FileCheck,
  GraduationCap,
  Sparkles,
  Layers,
  Database
} from 'lucide-react';
import { getAllKnowledge, getBrandConfig, getPdfDocuments, getKnowledgeStats } from '@/lib/knowledge';
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
  const brandConfig = useMemo(() => getBrandConfig(), []);
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
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-900 uppercase tracking-wide">
              Verified Pipeline
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-gima-navy">
              No Fabricated Content
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            GIMA Clinical Knowledge Foundation
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Authoritative source index encompassing live website routes, ROHP 101–106 curriculum, and local Free-Course PDFs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-right">
            <span className="text-[10px] font-medium text-slate-400 block">Total Records</span>
            <span className="text-sm font-bold text-slate-900">{stats.totalItems} Sources</span>
          </div>
        </div>
      </div>

      {/* Prominent Free-Course PDF Highlight Card */}
      <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/60 to-amber-100/30 p-6 shadow-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="rounded bg-amber-200/80 px-2 py-0.5 text-[10px] font-bold text-amber-950 uppercase tracking-wide">
                Authoritative PDF Ingestion
              </span>
              <span className="text-xs text-amber-900 font-semibold">
                High Priority Retrieval
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Theories of Aging — Free Online Course Collection
            </h3>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              12 primary source PDF documents parsed and preserved with exact document structure: PowerPoint slides, Glutathione reviews, Melatonin reviews, Telomeres & Omega-3, Heavy Metal Chelation, and Skin Anti-Aging by <strong>Dr. James Meschino</strong>.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('pdf')}
            className="rounded-xl bg-amber-900 px-4 py-2 text-xs font-semibold text-white shadow-subtle hover:bg-amber-950 transition-colors shrink-0"
          >
            Inspect 12 PDFs
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-subtle">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === tab.value
                  ? 'bg-gima-navy text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search clinical topics, titles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-gima-navy focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Knowledge Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredKnowledge.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-subtle hover:border-gima-navy/40 hover:shadow-card transition-all flex flex-col justify-between"
          >
            <div>
              {/* Card Meta */}
              <div className="flex items-center justify-between">
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                    item.sourceType === 'pdf'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-blue-100 text-blue-900'
                  }`}
                >
                  {item.sourceType === 'pdf' ? 'FREE COURSE PDF' : 'WEBSITE ROUTE'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {item.pageCount ? `${item.pageCount} Pages` : 'Web Page'}
                </span>
              </div>

              {/* Title & Course */}
              <h4 className="mt-2.5 text-sm font-bold text-slate-900 group-hover:text-gima-navy transition-colors line-clamp-2">
                {item.sourceTitle}
              </h4>

              {item.course && (
                <span className="mt-1 inline-block text-[11px] font-semibold text-gima-gold-dark">
                  {item.course}
                </span>
              )}

              {/* Summary */}
              <p className="mt-2 text-xs text-slate-500 line-clamp-3 leading-relaxed">
                {item.summary}
              </p>

              {/* Topics */}
              {item.topics && item.topics.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {item.topics.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600"
                    >
                      {t}
                    </span>
                  ))}
                  {item.topics.length > 3 && (
                    <span className="text-[9px] text-slate-400 self-center">
                      +{item.topics.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[10px]">
                {item.sourceType === 'pdf' ? item.documentName : 'gim-academy.com'}
              </span>
              <span className="font-semibold text-gima-navy flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Inspect <ChevronRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Source Detail Drawer / Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-elevated animate-fade-in overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      selectedItem.sourceType === 'pdf'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-blue-100 text-blue-900'
                    }`}
                  >
                    {selectedItem.sourceType.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-500">{selectedItem.category}</span>
                </div>
                <h3 className="mt-1 text-base font-bold text-slate-900">{selectedItem.sourceTitle}</h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Metadata attributes */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <span className="text-[10px] text-slate-400 block font-medium">Source Type</span>
                  <span className="font-bold text-slate-900 capitalize">{selectedItem.sourceType}</span>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <span className="text-[10px] text-slate-400 block font-medium">Course Association</span>
                  <span className="font-bold text-slate-900 truncate block">{selectedItem.course || 'General'}</span>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <span className="text-[10px] text-slate-400 block font-medium">Document / URL</span>
                  <span className="font-bold text-slate-900 truncate block">
                    {selectedItem.documentName || selectedItem.sourceUrl}
                  </span>
                </div>
              </div>

              {/* Topics list */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-2">Identified Clinical Topics</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedItem.topics.map((t) => (
                    <span
                      key={t}
                      className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-800"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Content Summary */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-900">Extracted Content Preview</h4>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedItem.summary}
                </p>
              </div>

              {/* Page Previews if PDF */}
              {selectedItem.pagePreviews && selectedItem.pagePreviews.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900">Sample Page Previews</h4>
                  <div className="space-y-2">
                    {selectedItem.pagePreviews.map((p) => (
                      <div key={p.pageNumber} className="rounded-lg border border-slate-100 p-2.5 text-xs bg-white">
                        <span className="font-bold text-slate-800 block text-[11px] mb-1">
                          Page {p.pageNumber}
                        </span>
                        <p className="text-slate-600 text-[11px]">{p.snippet}...</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3.5 bg-slate-50">
              <span className="text-xs text-slate-500">
                Hash: {selectedItem.id}
              </span>
              <button
                onClick={() => setSelectedItem(null)}
                className="rounded-xl bg-gima-navy px-4 py-2 text-xs font-semibold text-white hover:bg-gima-navy-light"
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
