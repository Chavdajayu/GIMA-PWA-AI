'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  CheckCircle2,
  FileText,
  Sparkles,
  FolderPlus,
  RefreshCw,
  Clock,
  Filter
} from 'lucide-react';
import { getActivityEvents } from '@/lib/activity';
import { ActivityEvent } from '@/lib/types';

export default function ActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    setEvents(getActivityEvents());
  }, []);

  const filteredEvents = events.filter((e) => {
    if (filterType !== 'all' && e.type !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Operational Timeline
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Chronological record of local knowledge indexing, PDF extraction, and creative generations.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-100 pb-2">
        <button
          onClick={() => setFilterType('all')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            filterType === 'all'
              ? 'bg-gima-navy text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          All Events ({events.length})
        </button>
        <button
          onClick={() => setFilterType('pdf_processed')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            filterType === 'pdf_processed'
              ? 'bg-gima-navy text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          PDF Ingestion
        </button>
        <button
          onClick={() => setFilterType('knowledge_indexed')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            filterType === 'knowledge_indexed'
              ? 'bg-gima-navy text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Knowledge Indexing
        </button>
        <button
          onClick={() => setFilterType('creative_draft')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            filterType === 'creative_draft'
              ? 'bg-gima-navy text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Creative Generations
        </button>
      </div>

      {/* Timeline List */}
      <div className="relative border-l border-slate-200 ml-4 pl-6 space-y-6">
        {filteredEvents.map((evt) => (
          <div key={evt.id} className="relative group">
            {/* Timeline node */}
            <div className="absolute -left-[31px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-gima-navy text-gima-navy shadow-sm">
              {evt.type === 'pdf_processed' ? (
                <FileText className="h-3 w-3" />
              ) : evt.type === 'creative_draft' ? (
                <Sparkles className="h-3 w-3" />
              ) : (
                <CheckCircle2 className="h-3 w-3" />
              )}
            </div>

            {/* Event Box */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-subtle hover:border-slate-300 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-sm font-bold text-slate-900">{evt.title}</span>
                <span className="text-[10px] font-medium text-slate-400">
                  {new Date(evt.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                {evt.description}
              </p>

              {evt.metadata && (
                <div className="mt-3 rounded-lg bg-slate-50 p-2 text-[10px] text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                  {Object.entries(evt.metadata).map(([k, v]) => (
                    <span key={k}>
                      <strong className="text-slate-700 capitalize">{k}:</strong> {String(v)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
