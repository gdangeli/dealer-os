"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/lib/supabase/client";
import { 
  Upload, X, GripVertical, Star, Loader2, CheckCircle, 
  Maximize2, Wand2, MoreHorizontal, Trash2, ImageIcon,
  CheckSquare, Square, RotateCcw
} from "lucide-react";
import { ImageOptimizer } from "./image-optimizer";
import { BatchOptimizer } from "./batch-optimizer";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ImageLightbox } from "./image-lightbox";
import { 
  compressImage, 
  formatFileSize, 
  calculateSavings,
  type CompressedImage 
} from "@/lib/image-utils";

interface VehicleImage {
  id: string;
  url: string;
  original_url?: string | null;
  storage_path: string;
  position: number;
  is_main: boolean;
  isNew?: boolean;
  file?: File;
  compressionInfo?: {
    originalSize: number;
    compressedSize: number;
    savings: number;
  };
}

interface ImageUploadProps {
  vehicleId?: string;
  dealerId: string;
  onImagesChange?: (images: VehicleImage[]) => void;
  initialImages?: VehicleImage[];
}

// Sortable Image Component with selection checkbox
function SortableImage({
  image,
  dragVersion = 0,
  isSelected,
  onToggleSelect,
  onRemove,
  onSetMain,
  onViewFullscreen,
  onOptimize,
  onToggleOriginal,
  isUploading,
  showCheckbox,
  showingOriginal,
}: {
  image: VehicleImage;
  dragVersion?: number;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onSetMain: (id: string) => void;
  onViewFullscreen: () => void;
  onOptimize: (id: string) => void;
  onToggleOriginal: (id: string) => void;
  isUploading?: boolean;
  showCheckbox: boolean;
  showingOriginal: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group bg-white rounded-lg border-2 ${
        isSelected 
          ? "border-blue-500 ring-2 ring-blue-200" 
          : image.is_main 
            ? "border-blue-500" 
            : "border-slate-200"
      } overflow-hidden aspect-[4/3]`}
    >
      {/* Selection Checkbox */}
      <div 
        className={`absolute top-2 right-2 z-30 transition-opacity ${
          showCheckbox || isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(image.id);
          }}
          className={`p-1 rounded ${
            isSelected 
              ? 'bg-blue-500 text-white' 
              : 'bg-white/90 text-slate-600 hover:bg-white'
          }`}
        >
          {isSelected ? (
            <CheckSquare className="w-5 h-5" />
          ) : (
            <Square className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Optimized Image */}
      <div 
        className="absolute inset-0 cursor-pointer z-0"
        onClick={() => onViewFullscreen()}
      >
        <OptimizedImage
          key={`${image.id}-${image.position}-v${dragVersion}-${showingOriginal ? 'orig' : 'opt'}`}
          src={showingOriginal && image.original_url ? image.original_url : image.url}
          alt="Fahrzeugbild"
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 200px"
          priority={image.position === 0}
          className="object-cover pointer-events-none"
        />
      </div>

      {/* Before/After Toggle Button (only for optimized images) */}
      {image.original_url && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleOriginal(image.id);
          }}
          className={`absolute top-2 left-2 z-20 flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full transition-colors ${
            showingOriginal
              ? "bg-orange-500 text-white"
              : "bg-purple-500 text-white"
          }`}
          title={showingOriginal ? "Zeige optimiertes Bild" : "Zeige Original"}
        >
          <RotateCcw className="w-3 h-3" />
          {showingOriginal ? "Original" : "Optimiert"}
        </button>
      )}

      {/* Uploading Overlay */}
      {isUploading && (
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-20">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
          <span className="text-white text-xs mt-2">Komprimiere...</span>
        </div>
      )}

      {/* Compression Info Badge */}
      {image.compressionInfo && image.compressionInfo.savings > 0 && (
        <div className="absolute bottom-8 left-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 opacity-90 z-10">
          <CheckCircle className="w-3 h-3" />
          -{image.compressionInfo.savings}%
        </div>
      )}

      {/* Main Badge - position adjusts if there's an original toggle */}
      {image.is_main && (
        <div className={`absolute ${image.original_url ? 'top-9' : 'top-2'} left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 z-10`}>
          <Star className="w-3 h-3" /> Hauptbild
        </div>
      )}

      {/* Hover Controls Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors z-10 pointer-events-none">
        <div className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="p-3 bg-white/90 rounded-full shadow-lg">
            <Maximize2 className="w-5 h-5 text-slate-700" />
          </div>
        </div>
      </div>
      
      {/* Bottom Controls Row */}
      <div className="absolute bottom-2 left-2 right-2 z-20 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Position Number */}
        <div className="bg-black/60 text-white text-xs px-2 py-1 rounded">
          {image.position + 1}
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {!image.is_main && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSetMain(image.id);
              }}
              className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              title="Als Hauptbild setzen"
            >
              <Star className="w-3 h-3" />
            </button>
          )}
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOptimize(image.id);
            }}
            className="p-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            title="🎨 KI Bild-Optimierung"
          >
            <Wand2 className="w-3 h-3" />
          </button>

          <button
            type="button"
            {...attributes}
            {...listeners}
            className="p-1.5 bg-white/90 rounded-lg cursor-grab active:cursor-grabbing"
            title="Ziehen zum Sortieren"
          >
            <GripVertical className="w-3 h-3 text-slate-600" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(image.id);
            }}
            className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
            title="Bild löschen"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ImageUpload({
  vehicleId,
  dealerId,
  onImagesChange,
  initialImages = [],
}: ImageUploadProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<VehicleImage[]>(initialImages);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [uploadingIds, setUploadingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [compressionStats, setCompressionStats] = useState<{
    totalOriginal: number;
    totalCompressed: number;
  } | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [optimizerOpen, setOptimizerOpen] = useState(false);
  const [optimizingImage, setOptimizingImage] = useState<VehicleImage | null>(null);
  const [batchOptimizerOpen, setBatchOptimizerOpen] = useState(false);
  const [batchProcessingCount, setBatchProcessingCount] = useState(0);
  const [dragVersion, setDragVersion] = useState(0);
  const [showingOriginals, setShowingOriginals] = useState<Set<string>>(new Set());

  const MAX_IMAGES = 30;
  const MAX_SIZE_MB = 10;
  const TARGET_SIZE_MB = 2;
  const MAX_DIMENSION = 2400;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const hasSelection = selectedIds.size > 0;

  // Load existing images
  useEffect(() => {
    if (vehicleId) {
      loadImages();
    }
  }, [vehicleId]);
  
  useEffect(() => {
    if (initialImages.length > 0 && images.length === 0) {
      setImages(initialImages);
    }
  }, [initialImages]);

  const loadImages = async () => {
    if (!vehicleId) return;

    const { data, error } = await supabase
      .from("vehicle_images")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .order("position", { ascending: true });

    if (error) {
      console.error("Error loading images:", error);
      return;
    }

    setImages(data || []);
  };

  const uploadImage = async (
    file: File, 
    position: number,
    compressionInfo?: CompressedImage
  ): Promise<VehicleImage | null> => {
    if (!vehicleId) {
      setError("Bitte speichern Sie das Fahrzeug zuerst.");
      return null;
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase() || 'webp';
    const fileName = `${vehicleId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("vehicle-images")
      .upload(fileName, file, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload fehlgeschlagen: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from("vehicle-images")
      .getPublicUrl(fileName);

    const isMain = images.length === 0 && position === 0;
    const { data: imageRecord, error: dbError } = await supabase
      .from("vehicle_images")
      .insert({
        vehicle_id: vehicleId,
        storage_path: fileName,
        url: publicUrl,
        position: position,
        is_main: isMain,
      })
      .select()
      .single();

    if (dbError) {
      await supabase.storage.from("vehicle-images").remove([fileName]);
      throw new Error(`Datenbankfehler: ${dbError.message}`);
    }

    if (compressionInfo) {
      return {
        ...imageRecord,
        compressionInfo: {
          originalSize: compressionInfo.originalSize,
          compressedSize: compressionInfo.compressedSize,
          savings: calculateSavings(compressionInfo.originalSize, compressionInfo.compressedSize),
        },
      };
    }

    return imageRecord;
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    if (!vehicleId) {
      setError("Bitte speichern Sie das Fahrzeug zuerst.");
      return;
    }

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      setError(`Maximum von ${MAX_IMAGES} Bildern erreicht.`);
      return;
    }

    const acceptedFiles = Array.from(files).filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      return ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'].includes(ext || '');
    });

    const filesToUpload = acceptedFiles.slice(0, remainingSlots);
    if (filesToUpload.length < acceptedFiles.length) {
      setError(`Nur ${filesToUpload.length} von ${acceptedFiles.length} Bildern wurden hinzugefügt.`);
    }

    setUploading(true);
    setError(null);

    // Create temporary preview images
    const tempImages: VehicleImage[] = filesToUpload.map((file, index) => ({
      id: `temp-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      storage_path: "",
      position: images.length + index,
      is_main: images.length === 0 && index === 0,
      isNew: true,
      file,
    }));

    const tempIds = new Set(tempImages.map((img) => img.id));
    setUploadingIds(tempIds);
    setImages((prev) => [...prev, ...tempImages]);

    // Compress and upload
    const uploadedImages: VehicleImage[] = [];
    const errors: string[] = [];
    let totalOriginal = 0;
    let totalCompressed = 0;

    for (let i = 0; i < tempImages.length; i++) {
      const tempImage = tempImages[i];
      try {
        const compressed = await compressImage(
          tempImage.file!,
          TARGET_SIZE_MB,
          MAX_DIMENSION
        );
        
        totalOriginal += compressed.originalSize;
        totalCompressed += compressed.compressedSize;

        const uploaded = await uploadImage(
          compressed.file, 
          tempImage.position,
          compressed
        );
        if (uploaded) {
          uploadedImages.push(uploaded);
        }
      } catch (err) {
        errors.push(tempImage.file!.name);
        console.error(`Error uploading ${tempImage.file!.name}:`, err);
      }
    }

    // Replace temp images with uploaded ones
    setImages((prev) => {
      const filtered = prev.filter((img) => !img.isNew);
      return [...filtered, ...uploadedImages].sort((a, b) => a.position - b.position);
    });

    setUploadingIds(new Set());
    setUploading(false);

    if (totalOriginal > 0) {
      setCompressionStats({ totalOriginal, totalCompressed });
      setTimeout(() => setCompressionStats(null), 5000);
    }

    if (errors.length > 0) {
      setError(`Upload fehlgeschlagen für: ${errors.join(", ")}`);
    }

    if (onImagesChange) {
      const finalImages = images
        .filter((img) => !img.isNew)
        .concat(uploadedImages)
        .sort((a, b) => a.position - b.position);
      onImagesChange(finalImages);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);

      const newImages = arrayMove(images, oldIndex, newIndex).map((img, idx) => ({
        ...img,
        position: idx,
        is_main: idx === 0,
      }));

      setDragVersion(v => v + 1);
      setImages(newImages);

      if (vehicleId) {
        for (const img of newImages) {
          if (!img.isNew) {
            await supabase
              .from("vehicle_images")
              .update({ position: img.position, is_main: img.is_main })
              .eq("id", img.id);
          }
        }
      }

      if (onImagesChange) {
        onImagesChange(newImages);
      }
    }
  };

  const handleRemove = async (imageId: string) => {
    const imageToRemove = images.find((img) => img.id === imageId);
    if (!imageToRemove) return;

    const remainingImages = images
      .filter((img) => img.id !== imageId)
      .map((img, idx) => ({
        ...img,
        position: idx,
        is_main: idx === 0,
      }));

    setImages(remainingImages);
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(imageId);
      return next;
    });

    if (!imageToRemove.isNew && imageToRemove.storage_path) {
      await supabase.storage.from("vehicle-images").remove([imageToRemove.storage_path]);
      await supabase.from("vehicle_images").delete().eq("id", imageId);

      for (const img of remainingImages) {
        await supabase
          .from("vehicle_images")
          .update({ position: img.position, is_main: img.is_main })
          .eq("id", img.id);
      }
    }

    if (onImagesChange) {
      onImagesChange(remainingImages);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    
    const idsToDelete = Array.from(selectedIds);
    for (const id of idsToDelete) {
      await handleRemove(id);
    }
    setSelectedIds(new Set());
  };

  const handleOptimizeSelected = () => {
    if (selectedIds.size === 0) return;
    
    if (selectedIds.size === 1) {
      // Single image: use regular optimizer
      const firstSelectedId = Array.from(selectedIds)[0];
      if (firstSelectedId) {
        handleOptimize(firstSelectedId);
      }
    } else {
      // Multiple images: use batch optimizer
      setBatchOptimizerOpen(true);
    }
  };

  const handleBatchOptimized = async (results: Array<{ id: string; newUrl: string }>) => {
    // Update image URLs in state
    const updatedImages = images.map(img => {
      const result = results.find(r => r.id === img.id);
      if (result) {
        return { ...img, url: result.newUrl };
      }
      return img;
    });
    setImages(updatedImages);

    // Update in database
    if (vehicleId) {
      for (const result of results) {
        await supabase
          .from("vehicle_images")
          .update({ url: result.newUrl })
          .eq("id", result.id);
      }
    }

    // Clear selection
    setSelectedIds(new Set());

    if (onImagesChange) {
      onImagesChange(updatedImages);
    }
  };

  const getSelectedImages = () => {
    return images
      .filter(img => selectedIds.has(img.id) && !img.isNew)
      .map(img => ({ id: img.id, url: img.url }));
  };

  const handleSetMain = async (imageId: string) => {
    const updatedImages = images.map((img) => ({
      ...img,
      is_main: img.id === imageId,
    }));
    setImages(updatedImages);

    if (vehicleId) {
      for (const img of images) {
        if (!img.isNew) {
          await supabase
            .from("vehicle_images")
            .update({ is_main: img.id === imageId })
            .eq("id", img.id);
        }
      }
    }

    if (onImagesChange) {
      onImagesChange(updatedImages);
    }
  };

  const toggleSelect = (imageId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(imageId)) {
        next.delete(imageId);
      } else {
        next.add(imageId);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(images.filter(img => !img.isNew).map(img => img.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const openLightbox = (index: number) => {
    if (!images[index]?.isNew) {
      setLightboxIndex(index);
      setLightboxOpen(true);
    }
  };

  const handleOptimize = (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (image && !image.isNew && image.url && !image.url.startsWith('blob:')) {
      setOptimizingImage(image);
      setOptimizerOpen(true);
    }
  };

  const handleOptimized = async (newImageUrl: string, originalUrl: string) => {
    if (!optimizingImage) return;
    
    // Store original URL (only if not already set - first optimization)
    const originalToStore = optimizingImage.original_url || originalUrl;
    
    const updatedImages = images.map(img => 
      img.id === optimizingImage.id 
        ? { ...img, url: newImageUrl, original_url: originalToStore }
        : img
    );
    setImages(updatedImages);
    
    if (vehicleId && !optimizingImage.isNew) {
      await supabase
        .from("vehicle_images")
        .update({ 
          url: newImageUrl,
          original_url: originalToStore 
        })
        .eq("id", optimizingImage.id);
    }
    
    if (onImagesChange) {
      onImagesChange(updatedImages);
    }
    
    setOptimizingImage(null);
    setOptimizerOpen(false);
  };

  const toggleOriginalView = (imageId: string) => {
    setShowingOriginals(prev => {
      const next = new Set(prev);
      if (next.has(imageId)) {
        next.delete(imageId);
      } else {
        next.add(imageId);
      }
      return next;
    });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          {/* Left: Title + Batch Actions */}
          <div className="flex items-center gap-3">
            <CardTitle>Fahrzeugbilder</CardTitle>
            
            {/* Processing Indicator */}
            {batchProcessingCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Optimierung läuft...</span>
              </div>
            )}
            
            {/* Batch Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <MoreHorizontal className="w-4 h-4 mr-1" />
                  Aktionen
                  {hasSelection && (
                    <span className="ml-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {selectedIds.size}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={selectAll} disabled={images.length === 0}>
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Alle auswählen
                </DropdownMenuItem>
                <DropdownMenuItem onClick={deselectAll} disabled={!hasSelection}>
                  <Square className="w-4 h-4 mr-2" />
                  Auswahl aufheben
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleOptimizeSelected} 
                  disabled={!hasSelection}
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  KI-Optimierung ({selectedIds.size})
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDeleteSelected} 
                  disabled={!hasSelection}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Ausgewählte löschen ({selectedIds.size})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right: Upload Button + Counter */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">
              {images.length} / {MAX_IMAGES}
            </span>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,.heic,.heif"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
              disabled={uploading || !vehicleId}
            />
            
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || !vehicleId || images.length >= MAX_IMAGES}
              size="sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Compression Stats */}
        {compressionStats && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>
              Bilder optimiert: {formatFileSize(compressionStats.totalOriginal)} → {formatFileSize(compressionStats.totalCompressed)} 
              {" "}({calculateSavings(compressionStats.totalOriginal, compressionStats.totalCompressed)}% gespart)
            </span>
          </div>
        )}

        {/* Info when no vehicleId */}
        {!vehicleId && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
            💡 Speichern Sie das Fahrzeug zuerst, um Bilder hochzuladen.
          </div>
        )}

        {/* Empty State */}
        {images.length === 0 && vehicleId && (
          <div 
            className="border-2 border-dashed border-slate-200 rounded-lg p-12 text-center cursor-pointer hover:border-slate-300 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500 font-medium">Noch keine Bilder vorhanden</p>
            <p className="text-sm text-slate-400 mt-1">
              Klicken Sie hier oder auf "Upload" um Bilder hinzuzufügen
            </p>
          </div>
        )}

        {/* Image Grid */}
        {images.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={images.map((img) => img.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((image, index) => (
                  <SortableImage
                    key={image.id}
                    image={image}
                    dragVersion={dragVersion}
                    isSelected={selectedIds.has(image.id)}
                    onToggleSelect={toggleSelect}
                    onRemove={handleRemove}
                    onSetMain={handleSetMain}
                    onOptimize={handleOptimize}
                    onToggleOriginal={toggleOriginalView}
                    onViewFullscreen={() => openLightbox(index)}
                    isUploading={uploadingIds.has(image.id)}
                    showCheckbox={hasSelection}
                    showingOriginal={showingOriginals.has(image.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Helper Text */}
        {images.length > 0 && (
          <p className="text-sm text-slate-500">
            💡 Klick für Vollansicht • Ziehen zum Sortieren • ⭐ Hauptbild • 🪄 KI-Optimierung
          </p>
        )}
      </CardContent>

      {/* Lightbox */}
      <ImageLightbox
        images={images.filter((img) => !img.isNew)}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        onSetMain={handleSetMain}
      />

      {/* AI Image Optimizer (single image) */}
      {optimizingImage && (
        <ImageOptimizer
          open={optimizerOpen}
          onClose={() => {
            setOptimizerOpen(false);
            setOptimizingImage(null);
          }}
          imageUrl={optimizingImage.url}
          onOptimized={handleOptimized}
        />
      )}

      {/* Batch AI Optimizer (multiple images) */}
      <BatchOptimizer
        open={batchOptimizerOpen}
        onClose={() => setBatchOptimizerOpen(false)}
        images={getSelectedImages()}
        onProcessingStart={() => {
          setBatchProcessingCount(prev => prev + 1);
          setSelectedIds(new Set()); // Clear selection when processing starts
        }}
        onOptimized={(results) => {
          handleBatchOptimized(results);
          setBatchProcessingCount(prev => Math.max(0, prev - 1));
        }}
      />
    </Card>
  );
}
