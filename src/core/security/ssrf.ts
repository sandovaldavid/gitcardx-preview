const MAX_IMAGE_URL_LENGTH = 2048;
const MAX_IMAGE_DATA_URI_LENGTH = 700_000;
const SAFE_BASE64_IMAGE_DATA_URI_REGEX =
  /^data:image\/(?:png|jpeg|webp|svg\+xml);base64,[A-Za-z0-9+/=]+$/;

const ALLOWED_IMAGE_HOSTS = new Set([
  'avatars.githubusercontent.com',
  'raw.githubusercontent.com',
  'opengraph.githubassets.com',
  'github.com',
  'user-images.githubusercontent.com',
]);

function hasUnsafeUrlChars(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code <= 32 || code === 127) {
      return true;
    }
  }
  return /["'\\()<>`]/.test(value);
}

function isSafeImageDataUri(trimmed: string, maxLength: number): boolean {
  return trimmed.length <= maxLength && SAFE_BASE64_IMAGE_DATA_URI_REGEX.test(trimmed);
}

function isSafeHttpsUrl(trimmed: string): URL | null {
  if (trimmed.length > MAX_IMAGE_URL_LENGTH || hasUnsafeUrlChars(trimmed)) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    if (
      parsed.protocol !== 'https:' ||
      parsed.username ||
      parsed.password ||
      (parsed.port && parsed.port !== '443') ||
      isPrivateOrLocalHostname(parsed.hostname)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

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

  if (isSafeImageDataUri(trimmed, MAX_IMAGE_DATA_URI_LENGTH)) {
    return trimmed;
  }

  const parsed = isSafeHttpsUrl(trimmed);
  if (!parsed) {
    return fallbackUrl;
  }

  return ALLOWED_IMAGE_HOSTS.has(parsed.hostname.toLowerCase()) ? trimmed : fallbackUrl;
}

/**
 * Validates user-supplied image URLs in the client Studio canvas and local Vaults.
 * Allows any public HTTPS URL (without credentials or CSS/HTML breakout chars) or
 * strict base64 image data URIs up to the Studio upload budget.
 */
export function sanitizeClientImageUrl(rawUrl?: string | null, fallbackUrl = ''): string {
  if (!rawUrl) return fallbackUrl;

  const trimmed = rawUrl.trim();

  if (isSafeImageDataUri(trimmed, MAX_IMAGE_DATA_URI_LENGTH)) {
    return trimmed;
  }

  return isSafeHttpsUrl(trimmed) ? trimmed : fallbackUrl;
}

/**
 * Formats a client-sanitized image URL for inline CSS `backgroundImage: url("...")`
 * so untrusted strings cannot break out of CSS url() context.
 */
export function formatSafeCssUrl(rawUrl?: string | null): string | undefined {
  const safe = sanitizeClientImageUrl(rawUrl);
  return safe ? `url("${safe}")` : undefined;
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
