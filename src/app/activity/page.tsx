'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  FileText,
  Sparkles
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
    <div className="space-y-8 pb-16 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Operational Timeline
        </h2>
        <p className="text-sm sm:text-base text-slate-600 mt-1">
          Chronological record of local knowledge indexing, PDF extraction, and creative generations.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-3">
        <button
          onClick={() => setFilterType('all')}
          className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors min-h-[40px] ${
            filterType === 'all'
              ? 'bg-gima-navy text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
          }`}
        >
          All Events ({events.length})
        </button>
        <button
          onClick={() => setFilterType('pdf_processed')}
          className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors min-h-[40px] ${
            filterType === 'pdf_processed'
              ? 'bg-gima-navy text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
          }`}
        >
          PDF Ingestion
        </button>
        <button
          onClick={() => setFilterType('knowledge_indexed')}
          className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors min-h-[40px] ${
            filterType === 'knowledge_indexed'
              ? 'bg-gima-navy text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
          }`}
        >
          Knowledge Indexing
        </button>
        <button
          onClick={() => setFilterType('creative_draft')}
          className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors min-h-[40px] ${
            filterType === 'creative_draft'
              ? 'bg-gima-navy text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
          }`}
        >
          Creative Generations
        </button>
      </div>

      {/* Timeline List */}
      <div className="relative border-l-2 border-slate-200 ml-5 pl-7 space-y-7">
        {filteredEvents.map((evt) => (
          <div key={evt.id} className="relative group">
            {/* Timeline node */}
            <div className="absolute -left-[41px] top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white border-2 border-gima-navy text-gima-navy shadow-sm">
              {evt.type === 'pdf_processed' ? (
                <FileText className="h-3.5 w-3.5" />
              ) : evt.type === 'creative_draft' ? (
                <Sparkles className="h-3.5 w-3.5" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
            </div>

            {/* Event Box */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-subtle hover:border-gima-navy/40 hover:shadow-card transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-base font-bold text-slate-900">{evt.title}</span>
                <span className="text-xs font-semibold text-slate-500">
                  {new Date(evt.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed font-normal">
                {evt.description}
              </p>

              {evt.metadata && (
                <div className="mt-3.5 rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-xs text-slate-600 flex flex-wrap gap-x-5 gap-y-1.5 font-medium">
                  {Object.entries(evt.metadata).map(([k, v]) => (
                    <span key={k}>
                      <strong className="text-slate-900 capitalize font-bold">{k}:</strong> {String(v)}
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
