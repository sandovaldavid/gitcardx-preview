export type SubscriptionTier = 'free' | 'pro' | 'team';

export interface EntitlementPort {
  getTier(): SubscriptionTier;
  canAccessFeature(featureKey: string): boolean;
  maxStoredBrandKits(): number;
  hasWatermark(): boolean;
}
