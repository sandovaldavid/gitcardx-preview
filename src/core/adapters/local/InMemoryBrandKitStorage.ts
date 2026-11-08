import type { BrandKitStoragePort } from '../../ports/BrandKitStoragePort';
import type { BrandKit } from '../../domain/types';

export class InMemoryBrandKitStorage implements BrandKitStoragePort {
  private store = new Map<string, BrandKit>();

  async listBrandKits(): Promise<BrandKit[]> {
    return Array.from(this.store.values()).sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt)
    );
  }

  async getBrandKit(id: string): Promise<BrandKit | null> {
    return this.store.get(id) || null;
  }

  async saveBrandKit(kit: BrandKit): Promise<void> {
    this.store.set(kit.id, kit);
  }

  async deleteBrandKit(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}
