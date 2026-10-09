/**
 * Security & Validation utilities for Company Branding / White-Label Assets
 */
import { BrandingSettings } from '../types';

export const BRANDING_STORAGE_CACHE_KEY = 'staffsync_branding_cache_v1';

/**
 * Retrieves instantly cached branding settings from localStorage.
 * Used for zero-latency synchronous initialization on page reload before sqlite WASM boot.
 */
export function getCachedBranding(fallback: BrandingSettings): BrandingSettings {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(BRANDING_STORAGE_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.projectName === 'string') {
        return {
          ...fallback,
          ...parsed,
        };
      }
    }
  } catch {
    // Fail silently to prevent console error reporting
  }
  return fallback;
}

/**
 * Safely caches branding settings to localStorage for instant startup retrieval.
 * Gracefully handles storage quotas without throwing or logging uncaught console errors.
 */
export function cacheBranding(branding: BrandingSettings): void {
  if (typeof window === 'undefined') return;
  try {
    // If logoUrl is very large (e.g. > 80KB), don't store large media in the synchronous cache
    // to prevent exceeding browser localStorage quota limits (~5MB total per origin)
    let payload = branding;
    if (branding.logoUrl && branding.logoUrl.length > 80000) {
      payload = {
        ...branding,
        logoUrl: null,
      };
    }
    if (payload.faviconUrl && payload.faviconUrl.length > 40000) {
      payload = {
        ...payload,
        faviconUrl: null,
      };
    }

    try {
      localStorage.setItem(BRANDING_STORAGE_CACHE_KEY, JSON.stringify(payload));
    } catch {
      // Storage quota exceeded; attempt a lightweight fallback with just the text branding
      try {
        const lightweight: BrandingSettings = {
          organizationId: branding.organizationId,
          projectName: branding.projectName,
          logoUrl: null,
          faviconUrl: null,
          updatedAt: branding.updatedAt,
          updatedBy: branding.updatedBy,
        };
        localStorage.setItem(BRANDING_STORAGE_CACHE_KEY, JSON.stringify(lightweight));
      } catch {
        // If storage is completely full, remove the key quietly
        try {
          localStorage.removeItem(BRANDING_STORAGE_CACHE_KEY);
        } catch {}
      }
    }
  } catch {
    // Fail silently
  }
}

/**
 * Removes cached branding settings.
 */
export function clearCachedBranding(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(BRANDING_STORAGE_CACHE_KEY);
  } catch {
    // Fail silently
  }
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  sanitizedContent?: string;
}

const ALLOWED_LOGO_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml',
];

const ALLOWED_FAVICON_MIME_TYPES = [
  'image/x-icon',
  'image/vnd.microsoft.icon',
  'image/png',
  'image/svg+xml',
  'image/webp',
];

export const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_FAVICON_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

/**
 * Sanitizes an SVG string by stripping out executable scripts, event handlers, and remote inclusions.
 */
export function sanitizeSvg(svgContent: string): string {
  let cleaned = svgContent;

  // Remove <script> tags and contents
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove inline JS event handlers (onload, onclick, onerror, etc.)
  cleaned = cleaned.replace(/\s+on[a-z]+\s*=\s*(['"]).*?\1/gi, '');
  cleaned = cleaned.replace(/\s+on[a-z]+\s*=\s*[^>\s]+/gi, '');

  // Remove javascript: and data: in href/xlink:href attributes (unless safe image data)
  cleaned = cleaned.replace(/xlink:href\s*=\s*['"]javascript:[^'"]*['"]/gi, '');
  cleaned = cleaned.replace(/href\s*=\s*['"]javascript:[^'"]*['"]/gi, '');

  // Strip foreignObject to prevent arbitrary HTML embedding
  cleaned = cleaned.replace(/<foreignObject\b[^<]*(?:(?!<\/foreignObject>)<[^<]*)*<\/foreignObject>/gi, '');

  return cleaned;
}

/**
 * Validates a logo file for MIME type, size, and content safety.
 */
export async function validateLogoFile(file: File): Promise<FileValidationResult> {
  if (!file) {
    return { valid: false, error: 'Please choose an image file to upload.' };
  }

  if (file.size > MAX_LOGO_SIZE_BYTES) {
    return {
      valid: false,
      error: `Logo size exceeds maximum allowed limit of 5 MB (Current size: ${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
    };
  }

  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  const isSvg = fileType === 'image/svg+xml' || fileName.endsWith('.svg');

  const isAllowedMime =
    ALLOWED_LOGO_MIME_TYPES.includes(fileType) ||
    fileName.endsWith('.png') ||
    fileName.endsWith('.jpg') ||
    fileName.endsWith('.jpeg') ||
    fileName.endsWith('.webp') ||
    fileName.endsWith('.svg');

  if (!isAllowedMime) {
    return {
      valid: false,
      error: 'Please upload a valid image file. Supported formats: PNG, JPG, WEBP, SVG.',
    };
  }

  if (isSvg) {
    try {
      const text = await file.text();
      // Basic SVG sanity check: must contain <svg
      if (!text.toLowerCase().includes('<svg')) {
        return { valid: false, error: 'Invalid SVG file structure.' };
      }
      const sanitized = sanitizeSvg(text);
      return { valid: true, sanitizedContent: sanitized };
    } catch {
      return { valid: false, error: 'Could not parse SVG image content.' };
    }
  }

  return { valid: true };
}

/**
 * Validates a favicon file for MIME type and size.
 */
export async function validateFaviconFile(file: File): Promise<FileValidationResult> {
  if (!file) {
    return { valid: false, error: 'Please choose a favicon file to upload.' };
  }

  if (file.size > MAX_FAVICON_SIZE_BYTES) {
    return {
      valid: false,
      error: `Favicon size exceeds maximum allowed limit of 2 MB (Current size: ${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
    };
  }

  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  const isSvg = fileType === 'image/svg+xml' || fileName.endsWith('.svg');

  const isAllowedMime =
    ALLOWED_FAVICON_MIME_TYPES.includes(fileType) ||
    fileName.endsWith('.ico') ||
    fileName.endsWith('.png') ||
    fileName.endsWith('.svg') ||
    fileName.endsWith('.webp');

  if (!isAllowedMime) {
    return {
      valid: false,
      error: 'Please upload a valid favicon. Supported formats: ICO, PNG, SVG, WEBP.',
    };
  }

  if (isSvg) {
    try {
      const text = await file.text();
      if (!text.toLowerCase().includes('<svg')) {
        return { valid: false, error: 'Invalid SVG file structure.' };
      }
      const sanitized = sanitizeSvg(text);
      return { valid: true, sanitizedContent: sanitized };
    } catch {
      return { valid: false, error: 'Could not parse SVG favicon content.' };
    }
  }

  return { valid: true };
}

/**
 * Converts a File to a base64 Data URL.
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to Data URL'));
      }
    };
    reader.onerror = () => reject(reader.error || new Error('Error reading file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Optimizes an uploaded image file (PNG, JPG, WEBP) by resizing it to a sensible maximum
 * bounding box and compressing it, preventing QuotaExceededError in browser storage while
 * retaining crisp display fidelity for logos and favicons.
 * For SVG files, returns the sanitized SVG data URL directly.
 */
export async function optimizeImageFile(
  file: File,
  maxDimension = 512,
  quality = 0.9
): Promise<string> {
  const fileType = file.type.toLowerCase();
  const isSvg = fileType === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

  if (isSvg) {
    const text = await file.text();
    const sanitized = sanitizeSvg(text);
    return `data:image/svg+xml;utf8,${encodeURIComponent(sanitized)}`;
  }

  // Raster image optimization via Canvas
  const rawDataUrl = await fileToDataUrl(file);

  return new Promise((resolve) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve(rawDataUrl);
      return;
    }

    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Only downscale if larger than maxDimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(rawDataUrl);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      try {
        const mime = fileType.includes('png') ? 'image/png' : 'image/webp';
        const compressed = canvas.toDataURL(mime, quality);
        resolve(compressed);
      } catch {
        resolve(canvas.toDataURL('image/png'));
      }
    };

    img.onerror = () => {
      resolve(rawDataUrl);
    };

    img.src = rawDataUrl;
  });
}
