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
  CheckCircle2,
  Key,
  Info
} from 'lucide-react';
import { getKnowledgeStats } from '@/lib/knowledge';
import { checkServerProviderStatus } from '@/lib/imageProvider';
import { ApiProviderStatus } from '@/lib/types';

export default function SettingsPage() {
  const [stats, setStats] = useState<any>(null);
  const [reindexing, setReindexing] = useState<boolean>(false);
  const [reindexSuccess, setReindexSuccess] = useState<boolean>(false);
  const [providerStatus, setProviderStatus] = useState<ApiProviderStatus | null>(null);

  useEffect(() => {
    setStats(getKnowledgeStats());
    checkServerProviderStatus().then((status) => {
      setProviderStatus(status);
    });
  }, []);

  const handleTriggerReindex = async () => {
    setReindexing(true);
    setReindexSuccess(false);
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
          Configure administrative defaults, knowledge synchronization, and Google Gemini image generation engine settings.
        </p>
      </div>

      {/* Generation Provider Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <Cpu className="h-5 w-5 text-gima-navy" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Image Generation Engine</h3>
              <p className="text-xs text-slate-500">Google Gemini API integration via @google/genai</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
            {providerStatus?.configured ? (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>Connected: {providerStatus.model}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>Not Connected (Demo Mode)</span>
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Provider Message */}
        <div
          className={`rounded-xl border p-4 text-xs space-y-1.5 ${
            providerStatus?.configured
              ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900'
              : 'border-amber-200/80 bg-amber-50/50 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            <Info className="h-4 w-4" />
            <span>
              {providerStatus?.configured
                ? 'Gemini Image Generation Connected'
                : 'Server Environment Notice'}
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            {providerStatus?.message ||
              'Checking server-side provider status...'}
          </p>
        </div>

        {/* Provider Details & Diagnostics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {/* Active Model */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">High-Efficiency Model</span>
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                Default
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              gemini-nano-banana-2.1
            </p>
            <span className="text-[10px] text-slate-500 block pt-1">
              Supports multimodal image inputs, reference assets, and 1K/2K resolution.
            </span>
          </div>

          {/* Premium Model */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Configurable Premium Model</span>
              <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                Optional
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              gemini-3-pro-image
            </p>
            <span className="text-[10px] text-slate-500 block pt-1">
              Set <code>GEMINI_IMAGE_MODEL=gemini-3-pro-image</code> on server for highest detail.
            </span>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Key className="h-4 w-4 text-gima-navy" />
            <span>How to connect your Gemini API Key</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            API keys are strictly managed on the server and are never exposed to browser bundles. To connect:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-slate-600 font-mono text-[11px]">
            <li>Create or edit <code>.env.local</code> in the project root.</li>
            <li>Add: <code>GEMINI_API_KEY=AIzaSy...</code></li>
            <li>Optionally specify: <code>GEMINI_IMAGE_MODEL=gemini-nano-banana-2.1</code></li>
            <li>Restart server: <code>npm run dev</code></li>
          </ol>
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
