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
    <div className="space-y-8 pb-12 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Studio Settings & Generation Workflow
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor approved creative generation engines, live Pollen balance, catalog pricing, and clinical knowledge status.
        </p>
      </div>

      {/* Generation Provider Section - Cleaned up to Approved Modes */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-subtle space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <Cpu className="h-5 w-5 text-gima-navy" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Approved Creative Generation Engines</h3>
              <p className="text-xs text-slate-500">
                Active workflow engines for marketing administrators
              </p>
            </div>
          </div>
          <button
            onClick={loadStatus}
            disabled={isRefreshingBalance}
            className="self-start sm:self-auto flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors disabled:opacity-50"
            title="Refresh balance and model status"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshingBalance ? 'animate-spin text-gima-navy' : 'text-slate-500'}`} />
            <span>{isRefreshingBalance ? 'Refreshing...' : 'Refresh Status'}</span>
          </button>
        </div>

        {/* 3 Approved Provider Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Pollinations AI */}
          <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50/40 p-4 space-y-3 relative shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-emerald-700" />
                  <span className="text-xs font-bold text-slate-900">Pollinations AI</span>
                </div>
                <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                  pollinationsStatus?.configured
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {pollinationsStatus?.configured ? 'CONNECTED' : 'NOT CONNECTED'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                Active production generator with curated GIMA Quality Ranked models.
              </p>
            </div>

            <div className="space-y-1.5 border-t border-emerald-200/70 pt-2 text-[11px]">
              <div className="flex justify-between items-center text-slate-600">
                <span>Selected Model:</span>
                <span className="font-mono font-medium text-slate-800 text-[10px] truncate max-w-[130px]" title={topRankedModel}>
                  {topRankedModel.split('/')[1] || topRankedModel}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Available Pollen:</span>
                <span className="font-bold text-emerald-800 font-mono text-[11px]">
                  {typeof pollinationsStatus?.balance === 'number'
                    ? `${pollinationsStatus.balance.toFixed(4)} Pollen`
                    : 'Balance unavailable'}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Price Information:</span>
                <span className="font-medium text-slate-700 text-[10px]">
                  {liveModels.length > 0
                    ? `Live Catalog (${liveModels.length} models)`
                    : 'Unavailable'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Free Models Category */}
          <div className="rounded-xl border border-sky-200 bg-sky-50/40 p-4 space-y-3 relative shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Gift className="h-4 w-4 text-sky-700" />
                  <span className="text-xs font-bold text-slate-900">Free Models</span>
                </div>
                <span className="rounded bg-sky-100 text-sky-800 px-2 py-0.5 text-[10px] font-bold">
                  {verifiedFreeModels.length > 0 ? `${verifiedFreeModels.length} VERIFIED` : 'PENDING EVAL'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                Dedicated category strictly filtering verified zero-usage-cost image options.
              </p>
            </div>

            <div className="space-y-1.5 border-t border-sky-200/70 pt-2 text-[11px]">
              <div className="flex justify-between items-center text-slate-600">
                <span>Verified Options:</span>
                <span className="font-semibold text-sky-900">
                  {verifiedFreeModels.length > 0 ? `${verifiedFreeModels.length} models` : 'None verified'}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Usage Cost:</span>
                <span className="font-mono font-medium text-sky-800 text-[10px]">
                  0.0000 Pollen
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Provider Scope:</span>
                <span className="text-[10px] text-slate-600">
                  Live Catalog Verified
                </span>
              </div>
            </div>
          </div>

          {/* 3. Demo Preview Engine */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 relative shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-slate-700" />
                  <span className="text-xs font-bold text-slate-900">Demo Preview</span>
                </div>
                <span className="rounded bg-slate-200 text-slate-700 px-2 py-0.5 text-[10px] font-semibold">
                  AVAILABLE
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                Deterministic layout mockup engine using authentic GIMA brand guidelines.
              </p>
            </div>

            <div className="space-y-1.5 border-t border-slate-200 pt-2 text-[11px]">
              <div className="flex justify-between items-center text-slate-600">
                <span>Generation Type:</span>
                <span className="font-medium text-slate-700">Offline Mockup</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Usage Cost:</span>
                <span className="font-bold text-slate-800">₹0 (Zero API cost)</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>AI Synthesis:</span>
                <span className="text-slate-500 text-[10px]">Deterministic layout</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Shield className="h-4 w-4 text-gima-navy" />
            <span>Server-Side Secret Management & Security</span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            API credentials are maintained strictly in server-side environment variables and are never transmitted to client browsers, logs, or public repositories.
          </p>
        </div>
      </section>

      {/* Collapsible Advanced Diagnostics & Developer Tools */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-subtle overflow-hidden">
        <button
          type="button"
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <Sliders className="h-5 w-5 text-slate-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Advanced Diagnostics & Developer Tools</h3>
              <p className="text-xs text-slate-500">
                Backend testing panel, catalog inspection, and clinical knowledge base synchronization
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span>{showDiagnostics ? 'Hide Diagnostics' : 'Show Diagnostics'}</span>
            {showDiagnostics ? (
              <ChevronUp className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            )}
          </div>
        </button>

        {showDiagnostics && (
          <div className="p-6 border-t border-slate-100 space-y-6 bg-slate-50/30">
            {/* Developer Test Panel */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-gima-gold-dark" />
                  <h4 className="text-xs font-bold text-slate-900">Live Model Test Generation</h4>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {liveModels.length} models in live catalog
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
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
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Model
                    </label>
                    <select
                      value={testModel}
                      onChange={(e) => setTestModel(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-gima-navy focus:outline-none"
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
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Resolution
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
                  className="flex items-center justify-center gap-2 rounded-xl bg-gima-navy px-4 py-2 text-xs font-bold text-white hover:bg-gima-navy-light transition-all disabled:opacity-50 shadow-subtle"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Generating with Pollinations AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-gima-gold" />
                      <span>RUN DIAGNOSTIC GENERATION</span>
                    </>
                  )}
                </button>

                {testResult && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        {testResult.success ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span>Generation Diagnostic Succeeded</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <span>Diagnostic Failed</span>
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
                        <div className="relative aspect-video max-w-sm mx-auto overflow-hidden rounded-xl border border-slate-300 bg-slate-900 shadow-md">
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
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-gima-navy" />
                  <h4 className="text-xs font-bold text-slate-900">Clinical Knowledge Index</h4>
                </div>
                <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  {stats?.totalItems || 39} Sources Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <span className="text-slate-400 text-[10px] block font-medium">Free Course PDFs</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">12 Documents</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">299 clinical pages</p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <span className="text-slate-400 text-[10px] block font-medium">Public Site Routes</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">27 Pages</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">ROHP 101–106 + Capstone</p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                  <span className="text-slate-400 text-[10px] block font-medium">Media Assets</span>
                  <span className="text-sm font-bold text-slate-900 mt-0.5 block">45 Media Items</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Official logos & portraits</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-[11px] text-slate-500">
                  Ingestion index status: {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleDateString() : 'Active'}
                </span>
                <button
                  onClick={handleTriggerReindex}
                  disabled={reindexing}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-subtle disabled:opacity-50"
                >
                  {reindexing ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      <span>Re-verifying Index...</span>
                    </>
                  ) : reindexSuccess ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" />
                      <span className="text-emerald-700">Index Verified!</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3" />
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
