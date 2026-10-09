/**
 * Production Cryptographic Security Utilities
 * Implements industry-standard bcrypt password hashing (cost factor 10)
 * and enforces strict password and Admin ID validation policies.
 */
import bcrypt from 'bcryptjs';

export const INITIAL_ADMIN_ID = 'ADM-7X4Q9M2K';
// Bcrypt hash (cost 10) for temporary initial Admin password: V9!rK7#pL2@Xq8$N
export const INITIAL_ADMIN_HASH =
  '$2b$10$A0PrsQoWdZx1LWviICeIu.Zbo80n0sh9kMANeTiqNS8DspaQmZ1Oq';

export const INITIAL_ADMIN_CONFIG = {
  adminId: INITIAL_ADMIN_ID,
  passwordHash: INITIAL_ADMIN_HASH,
  mustChangePassword: true,
  createdAt: '2026-10-08 09:00 AM',
};

const COMMON_WEAK_PASSWORDS = [
  'password1234',
  'administrator',
  'admin1234567',
  '123456789012',
  'qwertyuiop12',
  'welcome12345',
  'letmein12345',
  'company12345',
];

/**
 * Validates password strength according to enterprise production requirements:
 * - Minimum 12 characters
 * - Uppercase letter (A-Z)
 * - Lowercase letter (a-z)
 * - Number (0-9)
 * - Special character
 * - Disallow common dictionary passwords
 */
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 12) {
    return {
      valid: false,
      message: 'Password must be at least 12 characters long.',
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one uppercase letter (A-Z).',
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one lowercase letter (a-z).',
    };
  }
  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one numeric digit (0-9).',
    };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one special character (e.g. !@#$%^&*).',
    };
  }

  const lower = password.toLowerCase();
  for (const weak of COMMON_WEAK_PASSWORDS) {
    if (lower.includes(weak)) {
      return {
        valid: false,
        message: 'Password contains common dictionary patterns. Please choose a stronger unique password.',
      };
    }
  }

  return { valid: true };
}

/**
 * Validates Admin Login ID according to production security specifications:
 * - Required
 * - Length between 4 and 32 characters
 * - Only letters, numbers, hyphen (-), and underscore (_)
 * - Trimmed of surrounding whitespace
 */
export function validateAdminId(adminId: string): { valid: boolean; message?: string } {
  const trimmed = adminId.trim();
  if (!trimmed) {
    return { valid: false, message: 'Admin ID is required.' };
  }
  if (trimmed.length < 4) {
    return { valid: false, message: 'Admin ID must be at least 4 characters long.' };
  }
  if (trimmed.length > 32) {
    return { valid: false, message: 'Admin ID cannot exceed 32 characters.' };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return {
      valid: false,
      message: 'Admin ID may only contain letters, numbers, hyphens (-), and underscores (_).',
    };
  }
  return { valid: true };
}

/**
 * Computes secure bcrypt hash with cost factor 10.
 * Synchronous execution ensures seamless React state flow and offline capability.
 */
export function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

/**
 * Verifies password against expected bcrypt hash.
 */
export function verifyPassword(password: string, expectedHash: string): boolean {
  try {
    if (!password || !expectedHash) return false;
    if (expectedHash.startsWith('$2a$') || expectedHash.startsWith('$2b$')) {
      return bcrypt.compareSync(password, expectedHash);
    }
    return false;
  } catch {
    return false;
  }
}

