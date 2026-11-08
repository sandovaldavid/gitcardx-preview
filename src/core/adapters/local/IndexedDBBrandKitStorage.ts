import { get, set, del, keys } from 'idb-keyval';
import type { BrandKitStoragePort } from '../../ports/BrandKitStoragePort';
import type { BrandKit } from '../../domain/types';

const BRAND_KIT_KEY_PREFIX = 'gitcardx_brandkit_';

export class IndexedDBBrandKitStorage implements BrandKitStoragePort {
  async listBrandKits(): Promise<BrandKit[]> {
    if (typeof window === 'undefined') return [];
    try {
      const allKeys = await keys();
      const kitKeys = allKeys.filter(
        (key): key is string => typeof key === 'string' && key.startsWith(BRAND_KIT_KEY_PREFIX)
      );
      const kits: BrandKit[] = [];
      for (const k of kitKeys) {
        const item = await get<BrandKit>(k);
        if (item) kits.push(item);
      }
      return kits.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } catch {
      return [];
    }
  }

  async getBrandKit(id: string): Promise<BrandKit | null> {
    if (typeof window === 'undefined') return null;
    try {
      const item = await get<BrandKit>(`${BRAND_KIT_KEY_PREFIX}${id}`);
      return item || null;
    } catch {
      return null;
    }
  }

  async saveBrandKit(kit: BrandKit): Promise<void> {
    if (typeof window === 'undefined') return;
    await set(`${BRAND_KIT_KEY_PREFIX}${kit.id}`, kit);
  }

  async deleteBrandKit(id: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      await del(`${BRAND_KIT_KEY_PREFIX}${id}`);
      return true;
    } catch {
      return false;
    }
  }
}
