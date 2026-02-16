"use client";

import { useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Star,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface LightboxImage {
  id: string;
  url: string;
  position: number;
  is_main: boolean;
}

interface ImageLightboxProps {
  images: LightboxImage[];
  initialIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetMain?: (imageId: string) => void;
}

export function ImageLightbox({
  images,
  initialIndex,
  open,
  onOpenChange,
  onSetMain,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  // Reset index when opening
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
      setIsZoomed(false);
    }
  }, [open, initialIndex]);

  const currentImage = images[currentIndex];
  const hasNext = currentIndex < images.length - 1;
  const hasPrev = currentIndex > 0;

  const goNext = useCallback(() => {
    if (hasNext) {
      setCurrentIndex((prev) => prev + 1);
      setIsZoomed(false);
    }
  }, [hasNext]);

  const goPrev = useCallback(() => {
    if (hasPrev) {
      setCurrentIndex((prev) => prev - 1);
      setIsZoomed(false);
    }
  }, [hasPrev]);

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsZoomed(false);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
          goNext();
          break;
        case "ArrowLeft":
          goPrev();
          break;
        case "Escape":
          onOpenChange(false);
          break;
        case " ":
          e.preventDefault();
          setIsZoomed((prev) => !prev);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, goNext, goPrev, onOpenChange]);

  if (!currentImage) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95 border-none overflow-hidden"
        showCloseButton={false}
      >
        <VisuallyHidden>
          <DialogTitle>Bildergalerie</DialogTitle>
        </VisuallyHidden>
        
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center gap-3">
            <span className="text-white/90 text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </span>
            {currentImage.is_main && (
              <span className="flex items-center gap-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                <Star className="w-3 h-3" /> Hauptbild
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Set as Main Button */}
            {onSetMain && !currentImage.is_main && (
              <button
                onClick={() => onSetMain(currentImage.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
              >
                <Star className="w-4 h-4" />
                Als Hauptbild
              </button>
            )}
            
            {/* Zoom Toggle */}
            <button
              onClick={() => setIsZoomed((prev) => !prev)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title={isZoomed ? "Verkleinern" : "Vergrössern"}
            >
              {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
            </button>
            
            {/* Close Button */}
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Schliessen (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Image Area */}
        <div 
          className="relative w-full h-full flex items-center justify-center"
          onClick={() => !isZoomed && setIsZoomed(true)}
        >
          {/* Navigation Arrows */}
          {hasPrev && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Vorheriges Bild (←)"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}
          
          {hasNext && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Nächstes Bild (→)"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          {/* Image */}
          <div 
            className={cn(
              "relative transition-all duration-300",
              isZoomed 
                ? "w-full h-full cursor-zoom-out" 
                : "w-[85%] h-[75%] cursor-zoom-in"
            )}
          >
            <OptimizedImage
              src={currentImage.url}
              alt={`Bild ${currentIndex + 1}`}
              fill
              sizes="100vw"
              priority
              objectFit={isZoomed ? "contain" : "contain"}
              className="select-none"
            />
          </div>
        </div>

        {/* Thumbnail Navigation */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 px-4 max-w-full">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => goToIndex(index)}
                className={cn(
                  "relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden transition-all",
                  index === currentIndex
                    ? "ring-2 ring-white ring-offset-2 ring-offset-black/50 scale-110"
                    : "opacity-60 hover:opacity-100"
                )}
              >
                <OptimizedImage
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
                {image.is_main && (
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-500/30">
                    <Star className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
          
          {/* Keyboard hints */}
          <div className="text-center text-white/50 text-xs mt-2">
            ← → Navigation • Leertaste Zoom • Esc Schliessen
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
