/**
 * Bexio Token Encryption Utilities
 * 
 * Encrypts and decrypts OAuth tokens for secure storage in the database.
 * Uses AES-256-GCM for authenticated encryption.
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

/**
 * Get encryption key from environment variable
 * Falls back to a derived key from SUPABASE_SERVICE_ROLE_KEY if BEXIO_ENCRYPTION_KEY is not set
 */
function getEncryptionKey(): Buffer {
  const key = process.env.BEXIO_ENCRYPTION_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!key) {
    throw new Error('No encryption key available. Set BEXIO_ENCRYPTION_KEY or SUPABASE_SERVICE_ROLE_KEY.');
  }
  
  // Derive a 32-byte key using scrypt
  return scryptSync(key, 'bexio-token-salt', 32);
}

/**
 * Encrypt a string for secure storage
 * @param plaintext - The text to encrypt
 * @returns Base64-encoded encrypted string (format: iv:authTag:ciphertext)
 */
export function encryptToken(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const authTag = cipher.getAuthTag();
  
  // Combine IV, auth tag, and ciphertext
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/**
 * Decrypt a string from secure storage
 * @param encryptedData - The encrypted string (format: iv:authTag:ciphertext)
 * @returns The decrypted plaintext
 */
export function decryptToken(encryptedData: string): string {
  const key = getEncryptionKey();
  
  const [ivBase64, authTagBase64, ciphertext] = encryptedData.split(':');
  
  if (!ivBase64 || !authTagBase64 || !ciphertext) {
    throw new Error('Invalid encrypted data format');
  }
  
  const iv = Buffer.from(ivBase64, 'base64');
  const authTag = Buffer.from(authTagBase64, 'base64');
  
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Check if a string is encrypted (has the expected format)
 */
export function isEncrypted(value: string): boolean {
  const parts = value.split(':');
  return parts.length === 3;
}
