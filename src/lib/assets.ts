import { AssetItem } from './types';
import registryData from '../../data/assets/asset-registry.json';

const baseAssets: AssetItem[] = registryData as unknown as AssetItem[];

export function getRegisteredAssets(category?: string, query?: string): AssetItem[] {
  let list = [...baseAssets];

  if (category && category !== 'All') {
    list = list.filter((a) => a.category === category);
  }

  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    list = list.filter((a) => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
  }

  return list;
}

export function getAssetCategories(): string[] {
  const cats = new Set<string>();
  baseAssets.forEach((a) => cats.add(a.category));
  return ['All', ...Array.from(cats)];
}
