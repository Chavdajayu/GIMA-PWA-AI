'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Image as ImageIcon,
  Search,
  Grid,
  List,
  Sparkles,
  X
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
    <div className="space-y-8 pb-16 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Creative Asset Registry
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Verified GIMA brand imagery, instructor portraits, and clinical course graphics ready for campaign generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/create"
            className="inline-flex items-center gap-2 rounded-xl bg-gima-navy px-5 py-2.5 text-sm font-bold text-white shadow-subtle hover:bg-gima-navy-light transition-all min-h-[44px]"
          >
            <Sparkles className="h-4 w-4 text-gima-gold-light" />
            <span>Use in New Creative</span>
          </Link>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-subtle">
        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-xl px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors min-h-[40px] ${
                activeCategory === cat
                  ? 'bg-gima-navy text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search and Grid/List view toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50/70 pl-10 pr-3.5 py-2 text-sm sm:text-base text-slate-900 placeholder:text-slate-500 focus:border-gima-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-gima-navy/20"
            />
          </div>

          <div className="flex items-center rounded-xl border border-slate-300 bg-slate-50 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg p-2 text-slate-600 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center ${
                viewMode === 'grid' ? 'bg-white shadow-sm text-gima-navy' : 'hover:text-slate-950'
              }`}
              title="Grid view"
              aria-label="Grid view"
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-lg p-2 text-slate-600 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center ${
                viewMode === 'list' ? 'bg-white shadow-sm text-gima-navy' : 'hover:text-slate-950'
              }`}
              title="List view"
              aria-label="List view"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Assets Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {assets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => setSelectedAsset(asset)}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-subtle hover:border-gima-navy/50 hover:shadow-card transition-all flex flex-col justify-between"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedAsset(asset);
                }
              }}
              aria-label={`View details for ${asset.name}`}
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-50 flex items-center justify-center p-3 border border-slate-100">
                <img
                  src={asset.url}
                  alt={asset.name}
                  className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 rounded-md bg-black/70 backdrop-blur-sm px-2 py-0.5 text-xs font-bold text-white">
                  {asset.category}
                </span>
              </div>

              <div className="mt-3 space-y-1">
                <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate" title={asset.name}>
                  {asset.name}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-1 font-medium">
                  {asset.description}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono truncate max-w-[110px]">
                  {asset.id}
                </span>
                <span className="font-bold text-gima-navy group-hover:underline">
                  Inspect &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-subtle">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 font-bold text-slate-800">
              <tr>
                <th className="px-5 py-3.5">Asset</th>
                <th className="px-5 py-3.5">Name</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Description</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {assets.map((asset) => (
                <tr
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3">
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="h-12 w-12 rounded-lg object-contain border border-slate-200 bg-white p-1"
                    />
                  </td>
                  <td className="px-5 py-3 font-bold text-slate-900 max-w-xs truncate">
                    {asset.name}
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800">
                      {asset.category}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600 max-w-sm truncate font-medium">
                    {asset.description}
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-gima-navy">
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="asset-preview-title"
        >
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-slate-200 bg-white shadow-elevated overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4.5 bg-slate-50/50">
              <div>
                <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-800">
                  {selectedAsset.category}
                </span>
                <h3 id="asset-preview-title" className="mt-1.5 text-lg sm:text-xl font-extrabold text-slate-900">
                  {selectedAsset.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                aria-label="Close asset preview"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 p-5 max-h-72 overflow-hidden">
                <img
                  src={selectedAsset.url}
                  alt={selectedAsset.name}
                  className="max-h-64 object-contain"
                />
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block font-bold uppercase tracking-wider">Description</span>
                  <p className="text-slate-800 mt-1 leading-relaxed font-medium">{selectedAsset.description}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block font-bold uppercase tracking-wider">Source URL</span>
                  <p className="text-slate-600 break-all text-xs font-mono mt-1 bg-slate-50 p-2 rounded-lg border border-slate-200">{selectedAsset.url}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-slate-50">
              <Link
                href={`/create?asset=${selectedAsset.id}`}
                className="rounded-xl bg-gima-navy px-5 py-2.5 text-sm font-bold text-white hover:bg-gima-navy-light min-h-[44px] inline-flex items-center"
              >
                Use in Creative Studio &rarr;
              </Link>
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 min-h-[44px] px-3 flex items-center"
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
