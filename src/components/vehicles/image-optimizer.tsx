"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

interface ImageOptimizerProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  onOptimized: (newImageUrl: string) => void;
}

export function ImageOptimizer({ open, onClose, imageUrl, onOptimized }: ImageOptimizerProps) {
  const t = useTranslations("photoAI");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState("showroom-modern");
  const [operations, setOperations] = useState({
    removeBackground: true,
    blurPlates: true,
    enhance: true,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Guard against invalid imageUrl
  if (!imageUrl || imageUrl.startsWith('blob:')) {
    console.warn('[ImageOptimizer] Invalid imageUrl:', imageUrl?.substring(0, 50));
    return null;
  }

  const BACKGROUND_TEMPLATES = [
    { id: "showroom-modern", name: t("backgrounds.showroomModern"), preview: "🏢" },
    { id: "showroom-classic", name: t("backgrounds.showroomClassic"), preview: "🏛️" },
    { id: "showroom-outdoor", name: t("backgrounds.showroomOutdoor"), preview: "🌳" },
    { id: "showroom-minimal", name: t("backgrounds.showroomMinimal"), preview: "⬜" },
    { id: "none", name: t("backgrounds.transparent"), preview: "🔲" },
  ];

  const handleOptimize = async () => {
    setIsProcessing(true);
    try {
      const ops: string[] = [];
      if (operations.enhance) ops.push("enhance");
      if (operations.blurPlates) ops.push("blur_plates");
      if (operations.removeBackground) ops.push("remove_background");

      const response = await fetch("/api/images/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          operations: ops,
          backgroundTemplate: operations.removeBackground ? selectedBackground : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Optimization failed");
      }

      const result = await response.json();
      
      // Show preview
      setPreviewUrl(`data:image/png;base64,${result.final}`);
      
      toast.success(t("success"));
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : t("error"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = async () => {
    if (!previewUrl) return;
    
    setIsProcessing(true);
    try {
      // Convert base64 to blob
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      
      // Create a File object
      const timestamp = Date.now();
      const filename = `optimized-${timestamp}.png`;
      const file = new File([blob], filename, { type: 'image/png' });
      
      // Upload to our API which handles Supabase storage
      const formData = new FormData();
      formData.append('file', file);
      formData.append('originalUrl', imageUrl);
      
      const uploadResponse = await fetch('/api/images/upload-optimized', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || 'Upload failed');
      }
      
      const { url: newUrl } = await uploadResponse.json();
      
      toast.success(t("applied"));
      onOptimized(newUrl);
      onClose();
    } catch (error) {
      console.error('Error applying optimized image:', error);
      toast.error(error instanceof Error ? error.message : t("error"));
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleOperation = (key: keyof typeof operations) => {
    setOperations(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>🎨 {t("title")}</DialogTitle>
          <DialogDescription>
            {t("subtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Preview */}
          <div className="space-y-4">
            <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden relative">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Optimized preview"
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={imageUrl}
                  alt="Original"
                  className="w-full h-full object-contain"
                />
              )}
              {isProcessing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
              )}
            </div>
            <p className="text-sm text-slate-500 text-center">
              {previewUrl ? t("previewOptimized") : t("previewOriginal")}
            </p>
          </div>

          {/* Right: Options */}
          <div className="space-y-6">
            {/* Operations */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">{t("operations")}</Label>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={operations.enhance}
                    onCheckedChange={() => toggleOperation("enhance")}
                  />
                  <div>
                    <span className="font-medium">✨ {t("enhance")}</span>
                    <p className="text-sm text-slate-500">{t("enhanceDesc")}</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={operations.blurPlates}
                    onCheckedChange={() => toggleOperation("blurPlates")}
                  />
                  <div>
                    <span className="font-medium">🔒 {t("blurPlates")}</span>
                    <p className="text-sm text-slate-500">{t("blurPlatesDesc")}</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <Checkbox
                    checked={operations.removeBackground}
                    onCheckedChange={() => toggleOperation("removeBackground")}
                  />
                  <div>
                    <span className="font-medium">🎨 {t("removeBackground")}</span>
                    <p className="text-sm text-slate-500">{t("removeBackgroundDesc")}</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Background Selection */}
            {operations.removeBackground && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">{t("selectBackground")}</Label>
                <RadioGroup
                  value={selectedBackground}
                  onValueChange={setSelectedBackground}
                  className="grid grid-cols-2 gap-2"
                >
                  {BACKGROUND_TEMPLATES.map((bg) => (
                    <label
                      key={bg.id}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedBackground === bg.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <RadioGroupItem value={bg.id} className="sr-only" />
                      <span className="text-2xl">{bg.preview}</span>
                      <span className="text-sm font-medium">{bg.name}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              {!previewUrl ? (
                <Button
                  type="button"
                  onClick={handleOptimize}
                  disabled={isProcessing || (!operations.enhance && !operations.blurPlates && !operations.removeBackground)}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("processing")}
                    </>
                  ) : (
                    <>🚀 {t("optimize")}</>
                  )}
                </Button>
              ) : (
                <>
                  <Button type="button" variant="outline" onClick={() => setPreviewUrl(null)} className="flex-1">
                    ↩️ {t("back")}
                  </Button>
                  <Button type="button" onClick={handleApply} className="flex-1">
                    ✅ {t("apply")}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
