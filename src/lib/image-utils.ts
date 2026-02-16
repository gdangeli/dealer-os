/**
 * Image optimization utilities for DealerOS
 * Handles compression, resizing, and format conversion
 */

import imageCompression from 'browser-image-compression';

export interface ImageSize {
  name: 'thumbnail' | 'medium' | 'large' | 'original';
  maxWidth: number;
  maxHeight: number;
  quality: number;
}

export const IMAGE_SIZES: ImageSize[] = [
  { name: 'thumbnail', maxWidth: 200, maxHeight: 150, quality: 0.7 },
  { name: 'medium', maxWidth: 800, maxHeight: 600, quality: 0.8 },
  { name: 'large', maxWidth: 1600, maxHeight: 1200, quality: 0.85 },
  { name: 'original', maxWidth: 2400, maxHeight: 1800, quality: 0.9 },
];

export interface CompressedImage {
  file: File;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
}

/**
 * Compress an image file with optional WebP conversion
 * @param file - Original image file
 * @param maxSizeMB - Maximum file size in MB (default: 2)
 * @param maxWidthOrHeight - Maximum dimension (default: 2400)
 * @returns Compressed image file
 */
export async function compressImage(
  file: File,
  maxSizeMB: number = 2,
  maxWidthOrHeight: number = 2400
): Promise<CompressedImage> {
  const originalSize = file.size;

  // Get original dimensions
  const dimensions = await getImageDimensions(file);

  // If already small enough and not too large, skip compression
  if (
    file.size <= maxSizeMB * 1024 * 1024 &&
    dimensions.width <= maxWidthOrHeight &&
    dimensions.height <= maxWidthOrHeight
  ) {
    return {
      file,
      width: dimensions.width,
      height: dimensions.height,
      originalSize,
      compressedSize: file.size,
    };
  }

  const options = {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
    fileType: 'image/webp' as const,
    initialQuality: 0.85,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    const compressedDimensions = await getImageDimensions(compressedFile);

    // Ensure the file has a proper name with .webp extension
    const newFileName = file.name.replace(/\.[^/.]+$/, '.webp');
    const renamedFile = new File([compressedFile], newFileName, {
      type: 'image/webp',
    });

    return {
      file: renamedFile,
      width: compressedDimensions.width,
      height: compressedDimensions.height,
      originalSize,
      compressedSize: renamedFile.size,
    };
  } catch (error) {
    console.error('Image compression failed:', error);
    // Return original if compression fails
    return {
      file,
      width: dimensions.width,
      height: dimensions.height,
      originalSize,
      compressedSize: file.size,
    };
  }
}

/**
 * Get dimensions of an image file
 */
export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Generate a tiny blur placeholder (base64 data URL)
 * Creates a 10px wide version of the image for blur-up effect
 */
export async function generateBlurPlaceholder(file: File): Promise<string> {
  const options = {
    maxWidthOrHeight: 10,
    useWebWorker: true,
    initialQuality: 0.1,
  };

  try {
    const tinyImage = await imageCompression(file, options);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(tinyImage);
    });
  } catch {
    // Return a generic gray placeholder if generation fails
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwYABQwC/7Tjf5YAAAAASUVORK5CYII=';
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Calculate compression savings percentage
 */
export function calculateSavings(originalSize: number, compressedSize: number): number {
  if (originalSize === 0) return 0;
  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
}
