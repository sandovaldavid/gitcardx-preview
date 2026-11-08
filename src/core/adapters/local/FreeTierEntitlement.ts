import type { EntitlementPort, SubscriptionTier } from '../../ports/EntitlementPort';

export class FreeTierEntitlement implements EntitlementPort {
  getTier(): SubscriptionTier {
    return 'free';
  }

  canAccessFeature(_featureKey: string): boolean {
    // In Phase 1 Stateless MVP, all core studio features are accessible without login
    return true;
  }

  maxStoredBrandKits(): number {
    // Generous local storage limit for Phase 1
    return 10;
  }

  hasWatermark(): boolean {
    // Phase 1 viral strategy: 0 watermarks on downloaded cards
    return false;
  }
}
