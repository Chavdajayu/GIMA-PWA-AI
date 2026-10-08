'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Image as ImageIcon,
  Search,
  Filter,
  Grid,
  List,
  Sparkles,
  ExternalLink,
  Check,
  X,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { getRegisteredAssets, getAssetCategories } from '@/lib/assets';
import { AssetItem } from '@/lib/types';

export default function AssetsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAsset, setSelectedAsset] = useState<AssetItem | null>(null);

  const categories = useMemo(() => getAssetCategories(), []);
  const assets = useMemo(
    () => getRegisteredAssets(activeCategory, search),
    [activeCategory, search]
  );

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Creative Asset Registry
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Verified GIMA brand imagery, instructor portraits, and clinical course graphics ready for campaign generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/create"
            className="inline-flex items-center gap-2 rounded-xl bg-gima-navy px-4 py-2.5 text-xs font-semibold text-white shadow-subtle hover:bg-gima-navy-light transition-all"
          >
            <Sparkles className="h-4 w-4 text-gima-gold-light" />
            <span>Use in New Creative</span>
          </Link>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-subtle">
        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-gima-navy text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search and Grid/List view toggle */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-gima-navy focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded p-1 text-slate-600 transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-sm text-gima-navy' : 'hover:text-slate-900'
              }`}
              title="Grid view"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded p-1 text-slate-600 transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm text-gima-navy' : 'hover:text-slate-900'
              }`}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Assets Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {assets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => setSelectedAsset(asset)}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white p-2.5 shadow-subtle hover:border-gima-navy/40 hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-50 flex items-center justify-center p-2 border border-slate-100">
                <img
                  src={asset.url}
                  alt={asset.name}
                  className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 rounded bg-black/60 backdrop-blur-sm px-1.5 py-0.5 text-[9px] font-semibold text-white">
                  {asset.category}
                </span>
              </div>

              <div className="mt-2.5 space-y-1">
                <h4 className="text-xs font-bold text-slate-900 truncate" title={asset.name}>
                  {asset.name}
                </h4>
                <p className="text-[10px] text-slate-500 line-clamp-1">
                  {asset.description}
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 truncate max-w-[100px]">
                  {asset.id}
                </span>
                <span className="font-semibold text-gima-navy group-hover:underline">
                  Inspect
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-subtle">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 font-bold text-slate-700">
              <tr>
                <th className="px-4 py-3">Asset</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {assets.map((asset) => (
                <tr
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="h-10 w-10 rounded object-contain border border-slate-200 bg-white p-1"
                    />
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900 max-w-xs truncate">
                    {asset.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      {asset.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 max-w-sm truncate">
                    {asset.description}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gima-navy">
                    Inspect
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Asset Preview Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-slate-200 bg-white shadow-elevated animate-fade-in overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                  {selectedAsset.category}
                </span>
                <h3 className="mt-1 text-base font-bold text-slate-900">{selectedAsset.name}</h3>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 p-4 max-h-72 overflow-hidden">
                <img
                  src={selectedAsset.url}
                  alt={selectedAsset.name}
                  className="max-h-64 object-contain"
                />
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Description</span>
                  <p className="text-slate-700">{selectedAsset.description}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Source URL</span>
                  <p className="text-slate-500 break-all text-[11px]">{selectedAsset.url}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3.5 bg-slate-50">
              <Link
                href={`/create?asset=${selectedAsset.id}`}
                className="rounded-xl bg-gima-navy px-4 py-2 text-xs font-semibold text-white hover:bg-gima-navy-light"
              >
                Use in Creative Studio &rarr;
              </Link>
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
