"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
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
import { createClient } from "@/lib/supabase/client";
import { Upload, X, GripVertical, Star, Loader2, CheckCircle, Maximize2 } from "lucide-react";
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

// Sortable Image Component with next/image
function SortableImage({
  image,
  onRemove,
  isUploading,
}: {
  image: VehicleImage;
  onRemove: (id: string) => void;
  isUploading?: boolean;
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
        image.is_main ? "border-blue-500" : "border-slate-200"
      } overflow-hidden aspect-[4/3]`}
    >
      {/* Optimized Image with next/image */}
      <OptimizedImage
        src={image.url}
        alt="Fahrzeugbild"
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 200px"
        priority={image.position === 0}
        className="object-cover"
      />

      {/* Uploading Overlay */}
      {isUploading && (
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
          <span className="text-white text-xs mt-2">Komprimiere...</span>
        </div>
      )}

      {/* Compression Info Badge (show briefly after upload) */}
      {image.compressionInfo && image.compressionInfo.savings > 0 && (
        <div className="absolute bottom-8 left-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 opacity-90">
          <CheckCircle className="w-3 h-3" />
          -{image.compressionInfo.savings}%
        </div>
      )}

      {/* Main Badge */}
      {image.is_main && (
        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <Star className="w-3 h-3" /> Hauptbild
        </div>
      )}

      {/* Hover Controls */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="absolute top-2 right-10 p-1.5 bg-white/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4 text-slate-600" />
        </button>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(image.id)}
          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Position Number */}
      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
        {image.position + 1}
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
  const [images, setImages] = useState<VehicleImage[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [uploadingIds, setUploadingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [compressionStats, setCompressionStats] = useState<{
    totalOriginal: number;
    totalCompressed: number;
  } | null>(null);

  const MAX_IMAGES = 30;
  const MAX_SIZE_MB = 10; // Input max size
  const TARGET_SIZE_MB = 2; // Target compressed size
  const MAX_DIMENSION = 2400; // Max width/height

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load existing images when vehicleId changes
  useEffect(() => {
    if (vehicleId && initialImages.length === 0) {
      loadImages();
    }
  }, [vehicleId]);

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
      setError("Bitte speichern Sie das Fahrzeug zuerst, bevor Sie Bilder hochladen.");
      return null;
    }

    // Use .webp extension for compressed images
    const fileExt = file.name.split(".").pop()?.toLowerCase() || 'webp';
    const fileName = `${vehicleId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload to Supabase Storage with cache headers
    const { error: uploadError } = await supabase.storage
      .from("vehicle-images")
      .upload(fileName, file, {
        cacheControl: "31536000", // 1 year cache
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error(`Upload fehlgeschlagen: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("vehicle-images")
      .getPublicUrl(fileName);

    // Insert into database
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
      // Rollback: delete uploaded file
      await supabase.storage.from("vehicle-images").remove([fileName]);
      throw new Error(`Datenbankfehler: ${dbError.message}`);
    }

    // Add compression info to the record for display
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

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!vehicleId) {
        setError("Bitte speichern Sie das Fahrzeug zuerst, bevor Sie Bilder hochladen.");
        return;
      }

      const remainingSlots = MAX_IMAGES - images.length;
      if (remainingSlots <= 0) {
        setError(`Maximum von ${MAX_IMAGES} Bildern erreicht.`);
        return;
      }

      const filesToUpload = acceptedFiles.slice(0, remainingSlots);
      if (filesToUpload.length < acceptedFiles.length) {
        setError(`Nur ${filesToUpload.length} von ${acceptedFiles.length} Bildern wurden hinzugefügt (Maximum: ${MAX_IMAGES}).`);
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

      // Compress and upload each file
      const uploadedImages: VehicleImage[] = [];
      const errors: string[] = [];
      let totalOriginal = 0;
      let totalCompressed = 0;

      for (let i = 0; i < tempImages.length; i++) {
        const tempImage = tempImages[i];
        try {
          // Compress image before upload
          const compressed = await compressImage(
            tempImage.file!,
            TARGET_SIZE_MB,
            MAX_DIMENSION
          );
          
          totalOriginal += compressed.originalSize;
          totalCompressed += compressed.compressedSize;

          console.log(
            `Compressed ${tempImage.file!.name}: ${formatFileSize(compressed.originalSize)} → ${formatFileSize(compressed.compressedSize)} (${calculateSavings(compressed.originalSize, compressed.compressedSize)}% saved)`
          );

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

      // Show compression stats
      if (totalOriginal > 0) {
        setCompressionStats({ totalOriginal, totalCompressed });
        // Clear stats after 5 seconds
        setTimeout(() => setCompressionStats(null), 5000);
      }

      if (errors.length > 0) {
        setError(`Upload fehlgeschlagen für: ${errors.join(", ")}`);
      }

      // Notify parent
      if (onImagesChange) {
        const finalImages = images
          .filter((img) => !img.isNew)
          .concat(uploadedImages)
          .sort((a, b) => a.position - b.position);
        onImagesChange(finalImages);
      }
    },
    [images, vehicleId, onImagesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/heic": [".heic"],
      "image/heif": [".heif"],
    },
    maxSize: MAX_SIZE_MB * 1024 * 1024,
    disabled: uploading || !vehicleId,
  });

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

      setImages(newImages);

      // Update positions in database
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

    // Remove from state immediately
    const remainingImages = images
      .filter((img) => img.id !== imageId)
      .map((img, idx) => ({
        ...img,
        position: idx,
        is_main: idx === 0,
      }));

    setImages(remainingImages);

    // Delete from storage and database
    if (!imageToRemove.isNew && imageToRemove.storage_path) {
      await supabase.storage.from("vehicle-images").remove([imageToRemove.storage_path]);
      await supabase.from("vehicle_images").delete().eq("id", imageId);

      // Update positions of remaining images
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Fahrzeugbilder</span>
          <span className="text-sm font-normal text-slate-500">
            {images.length} / {MAX_IMAGES}
          </span>
        </CardTitle>
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

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : vehicleId
              ? "border-slate-300 hover:border-slate-400"
              : "border-slate-200 bg-slate-50 cursor-not-allowed"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className={`w-10 h-10 mx-auto mb-3 ${vehicleId ? "text-slate-400" : "text-slate-300"}`} />
          {isDragActive ? (
            <p className="text-blue-600 font-medium">Bilder hier ablegen...</p>
          ) : (
            <>
              <p className={`font-medium ${vehicleId ? "text-slate-700" : "text-slate-400"}`}>
                Bilder hierher ziehen oder klicken
              </p>
              <p className="text-sm text-slate-500 mt-1">
                JPG, PNG, WebP oder HEIC • Max. {MAX_SIZE_MB}MB pro Bild
              </p>
              <p className="text-xs text-slate-400 mt-1">
                ✨ Automatische Kompression & WebP-Konvertierung
              </p>
            </>
          )}
        </div>

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
                {images.map((image) => (
                  <SortableImage
                    key={image.id}
                    image={image}
                    onRemove={handleRemove}
                    isUploading={uploadingIds.has(image.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Helper Text */}
        {images.length > 0 && (
          <p className="text-sm text-slate-500">
            💡 Ziehen Sie Bilder um sie zu sortieren. Das erste Bild wird automatisch zum Hauptbild.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
