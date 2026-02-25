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
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface LightboxImage {
  id: string;
  url: string;
  original_url?: string | null;
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
  const [showOriginal, setShowOriginal] = useState(false);

  // Reset index when opening
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
      setIsZoomed(false);
      setShowOriginal(false);
    }
  }, [open, initialIndex]);

  const currentImage = images[currentIndex];
  const hasNext = currentIndex < images.length - 1;
  const hasPrev = currentIndex > 0;

  const goNext = useCallback(() => {
    if (hasNext) {
      setCurrentIndex((prev) => prev + 1);
      setIsZoomed(false);
      setShowOriginal(false);
    }
  }, [hasNext]);

  const goPrev = useCallback(() => {
    if (hasPrev) {
      setCurrentIndex((prev) => prev - 1);
      setIsZoomed(false);
      setShowOriginal(false);
    }
  }, [hasPrev]);

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsZoomed(false);
    setShowOriginal(false);
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
        case "o":
        case "O":
          if (currentImage?.original_url) {
            setShowOriginal((prev) => !prev);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, goNext, goPrev, onOpenChange, currentImage?.original_url]);

  console.log('[ImageLightbox] Render:', { open, currentIndex, imagesLength: images.length, currentImage: currentImage?.url?.substring(0, 60) });
  
  if (!currentImage) {
    console.warn('[ImageLightbox] No current image! Index:', currentIndex, 'Images:', images.length);
    return null;
  }

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
            {/* Original/Optimized Toggle */}
            {currentImage.original_url && (
              <button
                onClick={() => setShowOriginal((prev) => !prev)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-sm transition-colors",
                  showOriginal 
                    ? "bg-blue-500 hover:bg-blue-600" 
                    : "bg-purple-500 hover:bg-purple-600"
                )}
                title="Original/Optimiert umschalten (O)"
              >
                <RotateCcw className="w-4 h-4" />
                {showOriginal ? "Original" : "Optimiert"}
              </button>
            )}
            
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
              src={showOriginal && currentImage.original_url ? currentImage.original_url : currentImage.url}
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
            ← → Navigation • Leertaste Zoom • O Original/Optimiert • Esc Schliessen
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
