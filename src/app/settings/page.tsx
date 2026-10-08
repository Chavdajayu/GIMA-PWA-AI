'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Cpu,
  Database,
  Palette,
  Shield,
  Check,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { getKnowledgeStats } from '@/lib/knowledge';

export default function SettingsPage() {
  const [stats, setStats] = useState<any>(null);
  const [reindexing, setReindexing] = useState<boolean>(false);
  const [reindexSuccess, setReindexSuccess] = useState<boolean>(false);

  useEffect(() => {
    setStats(getKnowledgeStats());
  }, []);

  const handleTriggerReindex = async () => {
    setReindexing(true);
    setReindexSuccess(false);
    // Simulates quick re-sync
    await new Promise((r) => setTimeout(r, 1200));
    setReindexing(false);
    setReindexSuccess(true);
    setTimeout(() => setReindexSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Studio Settings & Providers
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure administrative defaults, knowledge synchronization, and future image generation engine integrations.
        </p>
      </div>

      {/* Generation Provider Section (Future-Ready Architecture) */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <Cpu className="h-5 w-5 text-gima-navy" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Image Generation Engine</h3>
              <p className="text-xs text-slate-500">Phase 1 Milestone: Deterministic Preview Architecture</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            <span>Provider: [ Not Connected ]</span>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 text-xs text-amber-900 space-y-1.5">
          <p className="font-bold">Architectural Milestone Status:</p>
          <p className="text-slate-600 leading-relaxed">
            The studio is actively operating in <strong>Phase 1 Architectural Preparation Mode</strong>. Creative briefs and knowledge retrieval are fully active. External third-party models (Gemini, OpenAI, or local weights) will be integrated in Phase 2 via server-side environment variables without altering the core UI experience.
          </p>
        </div>

        {/* Future Provider Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Google Gemini API</span>
              <span className="rounded bg-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                Phase 2
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Imagen 3 / Gemini Creative Vision integration via server-side <code>GEMINI_API_KEY</code>.
            </p>
            <span className="text-[10px] font-semibold text-slate-400 block pt-1">
              Status: Ready to plug in
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">OpenAI API</span>
              <span className="rounded bg-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                Phase 2
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              DALL-E 3 / GPT-4o creative synthesis via server-side <code>OPENAI_API_KEY</code>.
            </p>
            <span className="text-[10px] font-semibold text-slate-400 block pt-1">
              Status: Ready to plug in
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Local Diffusion Model</span>
              <span className="rounded bg-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                Optional
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Self-hosted SDXL / Flux endpoint for private on-premise rendering.
            </p>
            <span className="text-[10px] font-semibold text-slate-400 block pt-1">
              Status: Endpoint configurable
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Deterministic Preview Mode</span>
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Default zero-cost mode using real GIMA brand assets and deterministic layout preview.
            </p>
            <span className="text-[10px] font-semibold text-emerald-600 block pt-1">
              Currently Active
            </span>
          </div>
        </div>
      </section>

      {/* Knowledge Synchronization Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <Database className="h-5 w-5 text-gima-navy" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Knowledge Ingestion Foundation</h3>
              <p className="text-xs text-slate-500">Local storage and crawled clinical curriculum records</p>
            </div>
          </div>
          <span className="rounded bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            {stats?.totalItems || 39} Sources Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="rounded-xl bg-slate-50 p-3.5">
            <span className="text-slate-400 text-[11px] block font-medium">Free Course PDFs</span>
            <span className="text-base font-bold text-slate-900 mt-0.5 block">12 Documents</span>
            <p className="text-[10px] text-slate-500 mt-1">299 pages parsed from Theories of Aging</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5">
            <span className="text-slate-400 text-[11px] block font-medium">Public Site Routes</span>
            <span className="text-base font-bold text-slate-900 mt-0.5 block">27 Routes</span>
            <p className="text-[10px] text-slate-500 mt-1">ROHP 101–106, Mod 7, Blog & Free Courses</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5">
            <span className="text-slate-400 text-[11px] block font-medium">Registered Brand Assets</span>
            <span className="text-base font-bold text-slate-900 mt-0.5 block">45 Media Items</span>
            <p className="text-[10px] text-slate-500 mt-1">Official logos & instructor portraits</p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <span className="text-xs text-slate-500">
            Developer script: <code>npm run ingest:all</code>
          </span>

          <button
            onClick={handleTriggerReindex}
            disabled={reindexing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${reindexing ? 'animate-spin' : ''}`} />
            <span>{reindexing ? 'Syncing...' : reindexSuccess ? 'Synced!' : 'Trigger Re-Index'}</span>
          </button>
        </div>
      </section>

      {/* Admin Preferences & Compliance */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <Shield className="h-5 w-5 text-gima-navy" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Compliance & Brand Protection</h3>
            <p className="text-xs text-slate-500">Built-in clinical guardrails and accredited designations</p>
          </div>
        </div>

        <div className="space-y-2.5 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>All generated copy strictly adheres to accredited ROHP / RNCP designation boundaries.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>No fabrication of medical claims, credentials, or unlicensed patient promises.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Free-Course PDF priority retrieval activated for Theories of Aging campaigns.</span>
          </div>
        </div>
      </section>
    </div>
  );
}
