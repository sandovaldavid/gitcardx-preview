const ALLOWED_IMAGE_HOSTS = new Set([
  'avatars.githubusercontent.com',
  'raw.githubusercontent.com',
  'opengraph.githubassets.com',
  'github.com',
  'user-images.githubusercontent.com',
]);

function isPrivateOrLocalHostname(rawHostname: string): boolean {
  const hostname = rawHostname.toLowerCase();
  return (
    hostname === 'localhost' ||
    hostname === '0.0.0.0' ||
    hostname === '::1' ||
    hostname === '[::1]' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.local') ||
    /^127\./.test(hostname) ||
    /^10\./.test(hostname) ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^169\.254\./.test(hostname)
  );
}

/**
 * Validates and sanitizes image URLs to prevent Server-Side Request Forgery (SSRF).
 * Allows only HTTPS GitHub asset domains or safe base64 data URIs.
 */
export function sanitizeImageUrl(rawUrl?: string | null, fallbackUrl = ''): string {
  if (!rawUrl) return fallbackUrl;

  const trimmed = rawUrl.trim();

  // Allow safe inline data URIs for client-uploaded logos/icons/textures
  if (
    trimmed.startsWith('data:image/png;base64,') ||
    trimmed.startsWith('data:image/jpeg;base64,') ||
    trimmed.startsWith('data:image/webp;base64,') ||
    trimmed.startsWith('data:image/svg+xml;base64,')
  ) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);

    // Reject non-HTTPS protocols or custom ports
    if (parsed.protocol !== 'https:' || (parsed.port && parsed.port !== '443')) {
      return fallbackUrl;
    }

    if (isPrivateOrLocalHostname(parsed.hostname)) {
      return fallbackUrl;
    }

    // Verify against trusted GitHub domains whitelist
    if (ALLOWED_IMAGE_HOSTS.has(parsed.hostname.toLowerCase())) {
      return trimmed;
    }

    return fallbackUrl;
  } catch {
    return fallbackUrl;
  }
}

/**
 * Validates server-side Fontsource metadata and binary asset URLs against SSRF.
 * Restricts outbound requests strictly to HTTPS Fontsource API and jsDelivr Fontsource CDN paths.
 */
export function isAllowedFontUrl(rawUrl?: string | null): boolean {
  if (!rawUrl) return false;

  try {
    const parsed = new URL(rawUrl.trim());
    if (
      parsed.protocol !== 'https:' ||
      parsed.username ||
      parsed.password ||
      (parsed.port && parsed.port !== '443')
    ) {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();
    if (isPrivateOrLocalHostname(hostname)) {
      return false;
    }

    const pathname = parsed.pathname;
    if (pathname.includes('..') || pathname.includes('//')) {
      return false;
    }

    if (hostname === 'api.fontsource.org') {
      return /^\/v1\/fonts(\/[a-z0-9-]+)?$/.test(pathname);
    }

    if (hostname === 'cdn.jsdelivr.net') {
      return /^\/fontsource\/fonts\/[a-z0-9-]+@[a-z0-9.-]+\/[a-z0-9-]+-\d+-normal\.(ttf|woff|woff2)$/.test(
        pathname
      );
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Validates server-side Twemoji SVG asset URLs against SSRF.
 * Restricts outbound requests strictly to HTTPS jsDelivr Twemoji SVG codepoint paths.
 */
export function isAllowedEmojiUrl(rawUrl?: string | null): boolean {
  if (!rawUrl) return false;

  try {
    const parsed = new URL(rawUrl.trim());
    if (
      parsed.protocol !== 'https:' ||
      parsed.username ||
      parsed.password ||
      (parsed.port && parsed.port !== '443') ||
      parsed.search ||
      parsed.hash
    ) {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();
    if (isPrivateOrLocalHostname(hostname) || hostname !== 'cdn.jsdelivr.net') {
      return false;
    }

    const pathname = parsed.pathname;
    if (pathname.includes('..') || pathname.includes('//')) {
      return false;
    }

    return /^\/gh\/jdecked\/twemoji@15\.1\.0\/assets\/svg\/[0-9a-f]+(?:-[0-9a-f]+)*\.svg$/.test(
      pathname
    );
  } catch {
    return false;
  }
}
