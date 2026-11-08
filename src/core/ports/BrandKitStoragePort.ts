import type { BrandKit } from '../domain/types';

export interface BrandKitStoragePort {
  listBrandKits(): Promise<BrandKit[]>;
  getBrandKit(id: string): Promise<BrandKit | null>;
  saveBrandKit(kit: BrandKit): Promise<void>;
  deleteBrandKit(id: string): Promise<boolean>;
}
