"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
  objectFit?: "cover" | "contain" | "fill" | "none";
  blurDataURL?: string;
  onClick?: () => void;
}

/**
 * Optimized image component using Next.js Image
 * Features:
 * - Automatic lazy loading (unless priority is set)
 * - Blur-up placeholder effect
 * - Responsive sizing
 * - WebP/AVIF automatic conversion
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
  className,
  containerClassName,
  objectFit = "cover",
  blurDataURL,
  onClick,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Default blur placeholder (gray)
  const defaultBlur =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwYABQwC/7Tjf5YAAAAASUVORK5CYII=";

  // Guard against empty/invalid src
  if (!src || src === '') {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-slate-100",
          containerClassName
        )}
        style={fill ? undefined : { width, height }}
      >
        <div className="text-slate-400 text-center p-4">
          <span className="text-xs">Kein Bild</span>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-slate-100",
          containerClassName
        )}
        style={fill ? undefined : { width, height }}
      >
        <div className="text-slate-400 text-center p-4">
          <svg
            className="w-8 h-8 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xs">Bild nicht verfügbar</span>
        </div>
      </div>
    );
  }

  if (fill) {
    return (
      <div className={cn("relative overflow-hidden", containerClassName)}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          placeholder="blur"
          blurDataURL={blurDataURL || defaultBlur}
          className={cn(
            "transition-all duration-300",
            isLoading ? "scale-105 blur-sm" : "scale-100 blur-0",
            objectFit === "cover" && "object-cover",
            objectFit === "contain" && "object-contain",
            objectFit === "fill" && "object-fill",
            className
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => setHasError(true)}
          onClick={onClick}
        />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        placeholder="blur"
        blurDataURL={blurDataURL || defaultBlur}
        className={cn(
          "transition-all duration-300",
          isLoading ? "scale-105 blur-sm" : "scale-100 blur-0",
          objectFit === "cover" && "object-cover",
          objectFit === "contain" && "object-contain",
          objectFit === "fill" && "object-fill",
          className
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        onClick={onClick}
      />
    </div>
  );
}

/**
 * Vehicle thumbnail optimized for list views
 */
export function VehicleThumbnail({
  src,
  alt,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={96}
      height={72}
      sizes="96px"
      priority={priority}
      className={cn("rounded-lg", className)}
      containerClassName="w-12 h-12 rounded-lg"
      objectFit="cover"
    />
  );
}

/**
 * Vehicle card image optimized for grid views
 */
export function VehicleCardImage({
  src,
  alt,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      priority={priority}
      className={className}
      containerClassName="aspect-[4/3] w-full"
      objectFit="cover"
    />
  );
}

/**
 * Vehicle gallery image optimized for detail views
 */
export function VehicleGalleryImage({
  src,
  alt,
  priority = false,
  onClick,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  onClick?: () => void;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, 800px"
      priority={priority}
      containerClassName="aspect-[4/3] w-full cursor-pointer"
      objectFit="cover"
      onClick={onClick}
    />
  );
}
