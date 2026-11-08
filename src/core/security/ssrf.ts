const ALLOWED_IMAGE_HOSTS = new Set([
  'avatars.githubusercontent.com',
  'raw.githubusercontent.com',
  'opengraph.githubassets.com',
  'github.com',
  'user-images.githubusercontent.com',
]);

/**
 * Validates and sanitizes image URLs to prevent Server-Side Request Forgery (SSRF).
 * Allows only HTTPS GitHub asset domains or safe base64 data URIs.
 */
export function sanitizeImageUrl(rawUrl?: string | null, fallbackUrl = ''): string {
  if (!rawUrl) return fallbackUrl;

  const trimmed = rawUrl.trim();

  // Allow safe inline data URIs for client-uploaded logos/icons
  if (
    trimmed.startsWith('data:image/png;base64,') ||
    trimmed.startsWith('data:image/svg+xml;base64,')
  ) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);

    // Reject non-HTTPS protocols
    if (parsed.protocol !== 'https:') {
      return fallbackUrl;
    }

    // Reject private / localhost IP addresses or hostnames
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local') ||
      /^127\./.test(hostname) ||
      /^10\./.test(hostname) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^169\.254\./.test(hostname)
    ) {
      return fallbackUrl;
    }

    // Verify against trusted GitHub domains whitelist
    if (ALLOWED_IMAGE_HOSTS.has(hostname)) {
      return trimmed;
    }

    return fallbackUrl;
  } catch {
    return fallbackUrl;
  }
}
