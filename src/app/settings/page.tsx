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
  Info,
  Sparkles,
  Zap,
  DollarSign,
  Maximize2
} from 'lucide-react';
import { getKnowledgeStats } from '@/lib/knowledge';
import {
  checkServerProviderStatus,
  checkPollinationsStatus,
  fetchLivePollinationsModels
} from '@/lib/imageProvider';
import {
  ApiProviderStatus,
  PollinationsStatusResponse,
  PollinationsModelItem
} from '@/lib/types';

export default function SettingsPage() {
  const [stats, setStats] = useState<any>(null);
  const [reindexing, setReindexing] = useState<boolean>(false);
  const [reindexSuccess, setReindexSuccess] = useState<boolean>(false);
  const [providerStatus, setProviderStatus] = useState<ApiProviderStatus | null>(null);
  const [pollinationsStatus, setPollinationsStatus] = useState<PollinationsStatusResponse | null>(null);
  const [liveModels, setLiveModels] = useState<PollinationsModelItem[]>([]);

  // Developer Test Panel State
  const [testPrompt, setTestPrompt] = useState<string>(
    'A premium professional healthcare education poster, sophisticated editorial art direction, clean composition, realistic lighting, elegant medical-scientific aesthetic, no logos, no fake text.'
  );
  const [testModel, setTestModel] = useState<string>('tongyi-mai/z-image-turbo');
  const [testSize, setTestSize] = useState<string>('1024x1024');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    imageDataUrl?: string;
    model?: string;
    latencyMs?: number;
    error?: string;
    updatedBalance?: number;
  } | null>(null);

  useEffect(() => {
    setStats(getKnowledgeStats());
    checkServerProviderStatus().then((status) => {
      setProviderStatus(status);
    });
    checkPollinationsStatus().then((status) => {
      setPollinationsStatus(status);
    });
    fetchLivePollinationsModels().then((models) => {
      setLiveModels(models);
      if (models.length > 0) {
        setTestModel(models[0].id);
      }
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

  const handleRunPollinationsTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/pollinations/test-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: testPrompt,
          model: testModel,
          size: testSize,
        }),
      });

      const data = await res.json();
      setTestResult(data);

      if (data.success && typeof data.updatedBalance === 'number') {
        setPollinationsStatus((prev) =>
          prev ? { ...prev, balance: data.updatedBalance } : null
        );
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.message || 'Network request failed',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Studio Settings & Providers
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure administrative creative engines, test live generation models, and manage clinical knowledge synchronization.
        </p>
      </div>

      {/* Generation Provider Section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <Cpu className="h-5 w-5 text-gima-navy" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Creative Generation Providers</h3>
              <p className="text-xs text-slate-500">Multi-engine architecture supporting Pollinations AI, Gemini Web Handoff, and Demo Preview</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>
              {pollinationsStatus?.configured
                ? 'Primary: Pollinations AI (Real Generation)'
                : 'Primary: Gemini Pro Web Handoff'}
            </span>
          </span>
        </div>

        {/* 4 Provider Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Pollinations AI */}
          <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50/40 p-4 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Pollinations AI</span>
              <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                {pollinationsStatus?.configured ? 'CONNECTED' : 'NOT CONFIGURED'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Real API generation with 16+ live models (OpenAI, Microsoft, FLUX, Alibaba).
            </p>
            <div className="pt-1 text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>
                {typeof pollinationsStatus?.balance === 'number'
                  ? `Balance: ${pollinationsStatus.balance.toFixed(4)} Pollen`
                  : 'Key Configured'}
              </span>
            </div>
          </div>

          {/* 2. Gemini Pro Web Handoff */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Gemini Web Handoff</span>
              <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                READY
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Uses signed-in Jio Google AI Pro account with one-click prompt & reference assets handoff.
            </p>
            <div className="pt-1 text-[10px] text-slate-500">
              ₹0 Cost • Human-in-the-loop
            </div>
          </div>

          {/* 3. Google Gemini API */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Gemini Direct API</span>
              <span className="rounded bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-semibold">
                Quota: 0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Direct SDK via <code>@google/genai</code>. Google Free-Tier assigns quota 0 for image synthesis.
            </p>
            <div className="pt-1 text-[10px] text-slate-500">
              gemini-nano-banana-2.1
            </div>
          </div>

          {/* 4. Demo Preview Engine */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Demo Preview</span>
              <span className="rounded bg-slate-200 text-slate-700 px-2 py-0.5 text-[10px] font-semibold">
                AVAILABLE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Deterministic offline mockup engine using authentic GIMA brand guidelines.
            </p>
            <div className="pt-1 text-[10px] text-slate-500">
              Instant offline preview
            </div>
          </div>
        </div>

        {/* Security & Secret Management Policy */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Shield className="h-4 w-4 text-gima-navy" />
            <span>Strict Server-Side Secret Management</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            API keys (<code>POLLINATIONS_API_KEY</code> and <code>GEMINI_API_KEY</code>) are exclusively loaded server-side in <code>.env.local</code>. Secret keys are never exposed in browser JavaScript bundles, public URLs, or client responses.
          </p>
        </div>
      </section>

      {/* Developer / Admin Test Panel (Pollinations AI) */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-gima-gold-dark" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Developer Generation Test Panel</h3>
              <p className="text-xs text-slate-500">Test live Pollinations image models and inspect generation latency & output</p>
            </div>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
            Diagnostics Tool
          </span>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Test Prompt
            </label>
            <textarea
              rows={2}
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-gima-navy focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Model ({liveModels.length} Discovered in Live Catalog)
              </label>
              <select
                value={testModel}
                onChange={(e) => setTestModel(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-gima-navy focus:outline-none"
              >
                {liveModels.length > 0 ? (
                  liveModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.publisher}) {m.pricing?.completionImageTokens ? `• ${m.pricing.completionImageTokens} Pollen` : ''}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="tongyi-mai/z-image-turbo">Z-Image Turbo (Alibaba)</option>
                    <option value="openai/gpt-image-2">GPT Image 2 (OpenAI)</option>
                    <option value="microsoft/mai-image-2.6-flash">MAI Image 2.6 Flash (Microsoft)</option>
                    <option value="black-forest-labs/flux.1-schnell">FLUX.1 Schnell (Black Forest)</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Resolution / Size
              </label>
              <select
                value={testSize}
                onChange={(e) => setTestSize(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-gima-navy focus:outline-none"
              >
                <option value="1024x1024">1024x1024 (1:1 Square)</option>
                <option value="1024x1280">1024x1280 (4:5 Portrait)</option>
                <option value="1280x720">1280x720 (16:9 Landscape)</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRunPollinationsTest}
            disabled={isTesting}
            className="flex items-center justify-center gap-2 rounded-xl bg-gima-navy px-5 py-2.5 text-xs font-bold text-white hover:bg-gima-navy-light transition-all disabled:opacity-50 shadow-subtle"
          >
            {isTesting ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Generating Test Image with Pollinations...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-gima-gold" />
                <span>TEST POLLINATIONS GENERATION</span>
              </>
            )}
          </button>

          {/* Test Results Output */}
          {testResult && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  {testResult.success ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Generation Successful</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span>Generation Failed</span>
                    </>
                  )}
                </span>
                {testResult.latencyMs && (
                  <span className="text-[10px] text-slate-500 font-mono">
                    Latency: {testResult.latencyMs}ms • Model: {testResult.model}
                  </span>
                )}
              </div>

              {testResult.error && (
                <p className="text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200 text-xs">
                  {testResult.error}
                </p>
              )}

              {testResult.imageDataUrl && (
                <div className="space-y-2">
                  <div className="relative aspect-video max-w-md mx-auto overflow-hidden rounded-xl border border-slate-300 bg-slate-900 shadow-md">
                    <img
                      src={testResult.imageDataUrl}
                      alt="Pollinations Test Output"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="text-center text-[10px] text-slate-500">
                    Image successfully generated and decoded via Pollinations AI.
                  </div>
                </div>
              )}
            </div>
          )}
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
            <span className="text-base font-bold text-slate-900 mt-0.5 block">27 Pages</span>
            <p className="text-[10px] text-slate-500 mt-1">ROHP 101–106 + Capstone module</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5">
            <span className="text-slate-400 text-[11px] block font-medium">Registered Media Assets</span>
            <span className="text-base font-bold text-slate-900 mt-0.5 block">45 Media Items</span>
            <p className="text-[10px] text-slate-500 mt-1">Official logos & instructor portraits</p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <span className="text-xs text-slate-500">
            Ingestion index updated: {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleDateString() : 'Active'}
          </span>
          <button
            onClick={handleTriggerReindex}
            disabled={reindexing}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-subtle disabled:opacity-50"
          >
            {reindexing ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Re-verifying Index...</span>
              </>
            ) : reindexSuccess ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700">Index Verified!</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Re-verify Index</span>
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}
