'use client';

import React, { useState } from 'react';
import { X, Search, Check } from 'lucide-react';
import { getRegisteredAssets, getAssetCategories } from '@/lib/assets';
import { AssetItem } from '@/lib/types';

interface AssetPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAssets: AssetItem[];
  onToggleAsset: (asset: AssetItem) => void;
}

export const AssetPickerModal: React.FC<AssetPickerModalProps> = ({
  isOpen,
  onClose,
  selectedAssets,
  onToggleAsset,
}) => {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const categories = getAssetCategories();
  const assets = getRegisteredAssets(category, search);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="asset-modal-title"
    >
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-300 bg-white shadow-elevated overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4.5 bg-slate-50/50">
          <div>
            <h3 id="asset-modal-title" className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Select GIMA Brand Assets
            </h3>
            <p className="text-sm text-slate-600 mt-0.5">
              Attach official logos, clinical instructor portraits, and course graphics
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-gima-navy min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            aria-label="Close asset selector"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 border-b border-slate-200 px-6 py-3.5 bg-white">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search assets by name or topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50/70 pl-10 pr-3 py-2 text-sm sm:text-base text-slate-900 placeholder:text-slate-500 focus:border-gima-navy focus:bg-white focus:outline-none focus:ring-2 focus:ring-gima-navy/20"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors min-h-[38px] ${
                  category === cat
                    ? 'bg-gima-navy text-white shadow-sm'
                    : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Assets Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {assets.map((asset) => {
              const isSelected = selectedAssets.some((a) => a.id === asset.id);
              return (
                <button
                  type="button"
                  key={asset.id}
                  onClick={() => onToggleAsset(asset)}
                  className={`group relative text-left rounded-xl border-2 p-2.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gima-navy ${
                    isSelected
                      ? 'border-gima-navy bg-blue-50/40 ring-1 ring-gima-navy shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-subtle'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200/60">
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="h-full w-full object-contain p-1.5 group-hover:scale-105 transition-transform duration-200"
                    />
                    {isSelected && (
                      <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gima-navy text-white shadow-md">
                        <Check className="h-4 w-4 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div className="mt-2.5">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate" title={asset.name}>
                      {asset.name}
                    </p>
                    <span className="text-xs text-slate-600 block truncate font-medium mt-0.5">
                      {asset.category}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-white">
          <span className="text-sm text-slate-700 font-semibold">
            {selectedAssets.length} asset{selectedAssets.length === 1 ? '' : 's'} selected
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-gima-navy px-5 py-2.5 text-sm font-bold text-white hover:bg-gima-navy-light shadow-subtle min-h-[44px] transition-colors"
          >
            Done Selecting
          </button>
        </div>
      </div>
    </div>
  );
};
