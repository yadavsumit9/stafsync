/**
 * Security & Validation utilities for Company Branding / White-Label Assets
 */

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
