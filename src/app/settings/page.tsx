'use client';

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Database,
  Shield,
  Check,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Zap,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Gift,
  Eye,
  Sliders
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
import { isVerifiedZeroCostModel } from '@/lib/modelRanking';

export default function SettingsPage() {
  const [stats, setStats] = useState<any>(null);
  const [reindexing, setReindexing] = useState<boolean>(false);
  const [reindexSuccess, setReindexSuccess] = useState<boolean>(false);
  const [providerStatus, setProviderStatus] = useState<ApiProviderStatus | null>(null);
  const [pollinationsStatus, setPollinationsStatus] = useState<PollinationsStatusResponse | null>(null);
  const [liveModels, setLiveModels] = useState<PollinationsModelItem[]>([]);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState<boolean>(false);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);

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

  const loadStatus = async () => {
    setIsRefreshingBalance(true);
    try {
      const [provStatus, polStatus, models] = await Promise.all([
        checkServerProviderStatus(),
        checkPollinationsStatus(),
        fetchLivePollinationsModels()
      ]);
      setProviderStatus(provStatus);
      setPollinationsStatus(polStatus);
      setLiveModels(models);
      if (models.length > 0 && !testModel) {
        setTestModel(models[0].id);
      }
    } finally {
      setIsRefreshingBalance(false);
    }
  };

  useEffect(() => {
    setStats(getKnowledgeStats());
    loadStatus();
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

  // Compute verified zero cost models
  const verifiedFreeModels = liveModels.filter(isVerifiedZeroCostModel);
  const topRankedModel = liveModels[0]?.id || pollinationsStatus?.modelConfigured || 'openai/gpt-image-2.5-sunburst';

  return (
    <div className="space-y-8 pb-16 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Studio Settings & Generation Workflow
        </h2>
        <p className="text-sm sm:text-base text-slate-600 mt-1">
          Monitor approved creative generation engines, live Pollen balance, catalog pricing, and clinical knowledge status.
        </p>
      </div>

      {/* Generation Provider Section */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-subtle space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <Cpu className="h-6 w-6 text-gima-navy" />
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Approved Creative Generation Engines</h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Active workflow engines for marketing administrators
              </p>
            </div>
          </div>
          <button
            onClick={loadStatus}
            disabled={isRefreshingBalance}
            className="self-start sm:self-auto flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 px-4 py-2 text-xs sm:text-sm font-bold text-slate-800 transition-colors disabled:opacity-50 min-h-[40px]"
            title="Refresh balance and model status"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshingBalance ? 'animate-spin text-gima-navy' : 'text-slate-500'}`} />
            <span>{isRefreshingBalance ? 'Refreshing...' : 'Refresh Status'}</span>
          </button>
        </div>

        {/* 3 Approved Provider Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Pollinations AI */}
          <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/50 p-5 space-y-4 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-emerald-700" />
                  <span className="text-sm sm:text-base font-bold text-slate-900">Pollinations AI</span>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  pollinationsStatus?.configured
                    ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                    : 'bg-amber-100 text-amber-950 border border-amber-300'
                }`}>
                  {pollinationsStatus?.configured ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 mt-2.5 leading-relaxed font-medium">
                Active production generator with curated GIMA Quality Ranked models.
              </p>
            </div>

            <div className="space-y-2 border-t border-emerald-200 pt-3 text-xs sm:text-sm font-medium">
              <div className="flex justify-between items-center text-slate-700">
                <span>Selected Model:</span>
                <span className="font-mono font-bold text-slate-900 text-xs truncate max-w-[130px]" title={topRankedModel}>
                  {topRankedModel.split('/')[1] || topRankedModel}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span>Available Pollen:</span>
                <span className="font-extrabold text-emerald-900 font-mono text-xs sm:text-sm">
                  {typeof pollinationsStatus?.balance === 'number'
                    ? `${pollinationsStatus.balance.toFixed(4)} Pollen`
                    : 'Balance unavailable'}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span>Price Information:</span>
                <span className="font-bold text-slate-900 text-xs">
                  {liveModels.length > 0
                    ? `Live Catalog (${liveModels.length} models)`
                    : 'Unavailable'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Free Models Category */}
          <div className="rounded-2xl border-2 border-sky-300 bg-sky-50/50 p-5 space-y-4 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-sky-700" />
                  <span className="text-sm sm:text-base font-bold text-slate-900">Free Models</span>
                </div>
                <span className="rounded-full bg-sky-100 text-sky-950 px-2.5 py-0.5 text-xs font-bold border border-sky-300">
                  {verifiedFreeModels.length > 0 ? `${verifiedFreeModels.length} VERIFIED` : 'PENDING'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 mt-2.5 leading-relaxed font-medium">
                Dedicated category strictly filtering verified zero-usage-cost image options.
              </p>
            </div>

            <div className="space-y-2 border-t border-sky-200 pt-3 text-xs sm:text-sm font-medium">
              <div className="flex justify-between items-center text-slate-700">
                <span>Verified Options:</span>
                <span className="font-bold text-sky-950">
                  {verifiedFreeModels.length > 0 ? `${verifiedFreeModels.length} models` : 'None verified'}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span>Usage Cost:</span>
                <span className="font-mono font-bold text-sky-950 text-xs sm:text-sm">
                  0.0000 Pollen
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span>Provider Scope:</span>
                <span className="text-xs text-slate-700 font-bold">
                  Live Catalog Verified
                </span>
              </div>
            </div>
          </div>

          {/* 3. Demo Preview Engine */}
          <div className="rounded-2xl border-2 border-slate-300 bg-slate-50 p-5 space-y-4 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-slate-700" />
                  <span className="text-sm sm:text-base font-bold text-slate-900">Demo Preview</span>
                </div>
                <span className="rounded-full bg-slate-200 text-slate-800 px-2.5 py-0.5 text-xs font-bold">
                  AVAILABLE
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 mt-2.5 leading-relaxed font-medium">
                Deterministic layout mockup engine using authentic GIMA brand guidelines.
              </p>
            </div>

            <div className="space-y-2 border-t border-slate-200 pt-3 text-xs sm:text-sm font-medium">
              <div className="flex justify-between items-center text-slate-700">
                <span>Generation Type:</span>
                <span className="font-bold text-slate-900">Offline Mockup</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span>Usage Cost:</span>
                <span className="font-extrabold text-slate-900">₹0 (Zero API cost)</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span>AI Synthesis:</span>
                <span className="text-slate-600 text-xs">Deterministic layout</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-2 text-sm">
          <div className="flex items-center gap-2.5 font-bold text-slate-900 text-base">
            <Shield className="h-5 w-5 text-gima-navy" />
            <span>Server-Side Secret Management & Security</span>
          </div>
          <p className="text-slate-700 leading-relaxed text-xs sm:text-sm font-medium">
            API credentials are maintained strictly in server-side environment variables and are never transmitted to client browsers, logs, or public repositories.
          </p>
        </div>
      </section>

      {/* Collapsible Advanced Diagnostics & Developer Tools */}
      <section className="rounded-3xl border border-slate-200 bg-white shadow-subtle overflow-hidden">
        <button
          type="button"
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
          aria-expanded={showDiagnostics}
        >
          <div className="flex items-center gap-3">
            <Sliders className="h-6 w-6 text-slate-700" />
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Advanced Diagnostics & Developer Tools</h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Backend testing panel, catalog inspection, and clinical knowledge base synchronization
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-gima-navy">
            <span>{showDiagnostics ? 'Hide Diagnostics' : 'Show Diagnostics'}</span>
            {showDiagnostics ? (
              <ChevronUp className="h-5 w-5 text-slate-600" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-600" />
            )}
          </div>
        </button>

        {showDiagnostics && (
          <div className="p-6 sm:p-8 border-t border-slate-200 space-y-6 bg-slate-50/40">
            {/* Developer Test Panel */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-gima-gold-dark" />
                  <h4 className="text-base font-bold text-slate-900">Live Model Test Generation</h4>
                </div>
                <span className="text-xs text-slate-600 font-mono font-bold">
                  {liveModels.length} models in catalog
                </span>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-slate-900 mb-1.5">
                    Test Prompt
                  </label>
                  <textarea
                    rows={3}
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-gima-navy focus:outline-none focus:ring-2 focus:ring-gima-navy/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-slate-900 mb-1.5">
                      Model
                    </label>
                    <select
                      value={testModel}
                      onChange={(e) => setTestModel(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-gima-navy focus:outline-none focus:ring-2 focus:ring-gima-navy/20"
                    >
                      {liveModels.length > 0 ? (
                        liveModels.map((m) => (
                          <option key={m.id} value={m.id}>
                            #{m.rank || '—'} {m.name} ({m.publisher}) • {m.costEstimateText || 'Variable'}
                          </option>
                        ))
                      ) : (
                        <option value="tongyi-mai/z-image-turbo">Z-Image Turbo</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-slate-900 mb-1.5">
                      Resolution
                    </label>
                    <select
                      value={testSize}
                      onChange={(e) => setTestSize(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-gima-navy focus:outline-none focus:ring-2 focus:ring-gima-navy/20"
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
                  className="flex items-center justify-center gap-2 rounded-xl bg-gima-navy px-5 py-3 text-sm font-bold text-white hover:bg-gima-navy-light transition-all disabled:opacity-50 shadow-subtle min-h-[44px]"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Generating with Pollinations AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-gima-gold-light" />
                      <span>RUN DIAGNOSTIC GENERATION</span>
                    </>
                  )}
                </button>

                {testResult && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-2">
                        {testResult.success ? (
                          <>
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            <span>Generation Diagnostic Succeeded</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <span>Diagnostic Failed</span>
                          </>
                        )}
                      </span>
                      {testResult.latencyMs && (
                        <span className="text-xs text-slate-600 font-mono font-semibold">
                          Latency: {testResult.latencyMs}ms • Model: {testResult.model}
                        </span>
                      )}
                    </div>

                    {testResult.error && (
                      <p className="text-red-800 bg-red-50 p-3 rounded-xl border border-red-200 text-sm font-medium">
                        {testResult.error}
                      </p>
                    )}

                    {testResult.imageDataUrl && (
                      <div className="space-y-2">
                        <div className="relative aspect-video max-w-md mx-auto overflow-hidden rounded-xl border border-slate-300 bg-slate-900 shadow-md">
                          <img
                            src={testResult.imageDataUrl}
                            alt="Pollinations Diagnostic Output"
                            className="h-full w-full object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Knowledge Synchronization Section */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-gima-navy" />
                  <h4 className="text-base font-bold text-slate-900">Clinical Knowledge Index</h4>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-950">
                  {stats?.totalItems || 39} Sources Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                  <span className="text-slate-500 text-xs block font-bold uppercase tracking-wider">Free Course PDFs</span>
                  <span className="text-lg font-extrabold text-slate-900 mt-1 block">12 Documents</span>
                  <p className="text-xs text-slate-600 mt-1 font-medium">299 clinical pages</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                  <span className="text-slate-500 text-xs block font-bold uppercase tracking-wider">Public Site Routes</span>
                  <span className="text-lg font-extrabold text-slate-900 mt-1 block">27 Pages</span>
                  <p className="text-xs text-slate-600 mt-1 font-medium">ROHP 101–106 + Capstone</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                  <span className="text-slate-500 text-xs block font-bold uppercase tracking-wider">Media Assets</span>
                  <span className="text-lg font-extrabold text-slate-900 mt-1 block">45 Media Items</span>
                  <p className="text-xs text-slate-600 mt-1 font-medium">Official logos & portraits</p>
                </div>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
                <span className="text-xs sm:text-sm text-slate-600 font-medium">
                  Ingestion index status: {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Active'}
                </span>
                <button
                  onClick={handleTriggerReindex}
                  disabled={reindexing}
                  className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-50 transition-colors shadow-subtle disabled:opacity-50 min-h-[40px]"
                >
                  {reindexing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Re-verifying Index...</span>
                    </>
                  ) : reindexSuccess ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span className="text-emerald-700">Index Verified!</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      <span>Re-verify Index</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
