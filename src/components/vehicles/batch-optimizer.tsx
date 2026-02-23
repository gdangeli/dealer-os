"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";

interface BatchImage {
  id: string;
  url: string;
}

interface BatchOptimizerProps {
  open: boolean;
  onClose: () => void;
  images: BatchImage[];
  onProcessingStart: () => void;
  onOptimized: (results: Array<{ id: string; newUrl: string }>) => void;
}

const BACKGROUND_TEMPLATES = [
  { id: "showroom-modern", name: "Moderner Showroom", preview: "🏢" },
  { id: "showroom-classic", name: "Klassischer Showroom", preview: "🏛️" },
  { id: "showroom-outdoor", name: "Outdoor Setting", preview: "🌳" },
  { id: "showroom-minimal", name: "Minimalistisch Weiss", preview: "⬜" },
];

export function BatchOptimizer({ open, onClose, images, onProcessingStart, onOptimized }: BatchOptimizerProps) {
  const [isStarting, setIsStarting] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState("showroom-modern");

  const handleStartProcessing = async () => {
    setIsStarting(true);
    
    // Notify parent that processing has started
    onProcessingStart();
    
    // Close dialog immediately
    onClose();
    
    // Show toast that processing started
    toast.info(`🎨 ${images.length} Bilder werden im Hintergrund optimiert...`, {
      duration: 3000,
    });

    // Process in background
    try {
      const response = await fetch("/api/images/optimize-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: images.map(img => ({ id: img.id, url: img.url })),
          backgroundTemplate: selectedBackground,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Batch optimization failed");
      }

      const data = await response.json();

      // Collect successful results
      const successfulResults = data.results
        .filter((r: any) => r.newUrl)
        .map((r: any) => ({ id: r.id, newUrl: r.newUrl }));

      // Notify completion
      if (successfulResults.length > 0) {
        toast.success(`✅ ${successfulResults.length} von ${images.length} Bildern optimiert!`, {
          duration: 5000,
          action: {
            label: "OK",
            onClick: () => {},
          },
        });
        // Update images
        onOptimized(successfulResults);
      }

      if (data.summary.failed > 0) {
        toast.error(`❌ ${data.summary.failed} Bilder konnten nicht verarbeitet werden`, {
          duration: 5000,
        });
      }

    } catch (error) {
      console.error(error);
      toast.error(`❌ Fehler: ${error instanceof Error ? error.message : "Verarbeitung fehlgeschlagen"}`, {
        duration: 5000,
      });
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>🎨 Batch KI-Optimierung</DialogTitle>
          <DialogDescription>
            {images.length} Bilder werden im Hintergrund optimiert. Sie können weiterarbeiten.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Preview Grid */}
          <div className="grid grid-cols-5 gap-2">
            {images.slice(0, 5).map((img, idx) => (
              <div key={img.id} className="aspect-square bg-slate-100 rounded-lg overflow-hidden">
                <img
                  src={img.url}
                  alt={`Bild ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {images.length > 5 && (
              <div className="aspect-square bg-slate-200 rounded-lg flex items-center justify-center">
                <span className="text-slate-500 text-sm font-medium">+{images.length - 5}</span>
              </div>
            )}
          </div>

          {/* Background Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Hintergrund wählen</Label>
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
                  <span className="text-xl">{bg.preview}</span>
                  <span className="text-sm font-medium">{bg.name}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
            💡 Die Verarbeitung läuft im Hintergrund. Sie erhalten eine Benachrichtigung, wenn die Bilder fertig sind.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button onClick={handleStartProcessing} disabled={isStarting}>
            {isStarting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starte...
              </>
            ) : (
              <>🚀 Verarbeitung starten</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
