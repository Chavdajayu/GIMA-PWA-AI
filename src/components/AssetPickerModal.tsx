'use client';

import React, { useState } from 'react';
import { X, Search, Check, Image as ImageIcon } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white shadow-elevated animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Select GIMA Brand Assets</h3>
            <p className="text-xs text-slate-500">Attach official logos, clinical instructor photos, and course graphics</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 border-b border-slate-100 px-6 py-3 bg-slate-50/50">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:border-gima-navy focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                  category === cat
                    ? 'bg-gima-navy text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Assets Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {assets.map((asset) => {
              const isSelected = selectedAssets.some((a) => a.id === asset.id);
              return (
                <div
                  key={asset.id}
                  onClick={() => onToggleAsset(asset)}
                  className={`group relative cursor-pointer overflow-hidden rounded-xl border p-2 transition-all ${
                    isSelected
                      ? 'border-gima-navy bg-slate-50 ring-2 ring-gima-navy/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-subtle'
                  }`}
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-100 flex items-center justify-center">
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="h-full w-full object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                    />
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gima-navy text-white shadow">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-bold text-slate-800 truncate" title={asset.name}>
                      {asset.name}
                    </p>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {asset.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3.5 bg-slate-50">
          <span className="text-xs text-slate-600 font-medium">
            {selectedAssets.length} asset{selectedAssets.length === 1 ? '' : 's'} selected
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-gima-navy px-4 py-2 text-xs font-semibold text-white hover:bg-gima-navy-light"
          >
            Done Selecting
          </button>
        </div>
      </div>
    </div>
  );
};
