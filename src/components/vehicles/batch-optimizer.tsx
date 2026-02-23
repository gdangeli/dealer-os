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
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle, XCircle, ImageIcon } from "lucide-react";

interface BatchImage {
  id: string;
  url: string;
}

interface BatchOptimizerProps {
  open: boolean;
  onClose: () => void;
  images: BatchImage[];
  onOptimized: (results: Array<{ id: string; newUrl: string }>) => void;
}

const BACKGROUND_TEMPLATES = [
  { id: "showroom-modern", name: "Moderner Showroom", preview: "🏢" },
  { id: "showroom-classic", name: "Klassischer Showroom", preview: "🏛️" },
  { id: "showroom-outdoor", name: "Outdoor Setting", preview: "🌳" },
  { id: "showroom-minimal", name: "Minimalistisch Weiss", preview: "⬜" },
];

export function BatchOptimizer({ open, onClose, images, onOptimized }: BatchOptimizerProps) {
  const t = useTranslations("photoAI");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState("showroom-modern");
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Array<{
    id: string;
    originalUrl: string;
    newUrl?: string;
    error?: string;
  }> | null>(null);

  const handleOptimize = async () => {
    setIsProcessing(true);
    setProgress(10);
    setResults(null);

    try {
      const response = await fetch("/api/images/optimize-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: images.map(img => ({ id: img.id, url: img.url })),
          backgroundTemplate: selectedBackground,
        }),
      });

      setProgress(80);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Batch optimization failed");
      }

      const data = await response.json();
      setProgress(100);
      setResults(data.results);

      // Collect successful results
      const successfulResults = data.results
        .filter((r: any) => r.newUrl)
        .map((r: any) => ({ id: r.id, newUrl: r.newUrl }));

      if (successfulResults.length > 0) {
        toast.success(`${successfulResults.length} von ${images.length} Bildern optimiert`);
      }

      if (data.summary.failed > 0) {
        toast.error(`${data.summary.failed} Bilder konnten nicht verarbeitet werden`);
      }

    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Fehler bei der Batch-Verarbeitung");
      setResults(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    if (!results) return;
    
    const successfulResults = results
      .filter(r => r.newUrl)
      .map(r => ({ id: r.id, newUrl: r.newUrl! }));
    
    onOptimized(successfulResults);
    onClose();
  };

  const handleClose = () => {
    if (!isProcessing) {
      setResults(null);
      setProgress(0);
      onClose();
    }
  };

  const successCount = results?.filter(r => r.newUrl).length || 0;
  const failCount = results?.filter(r => r.error).length || 0;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>🎨 Batch KI-Optimierung</DialogTitle>
          <DialogDescription>
            {images.length} Bilder werden mit dem gleichen Hintergrund optimiert
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Preview Grid */}
          <div className="grid grid-cols-5 gap-2">
            {images.slice(0, 5).map((img, idx) => (
              <div key={img.id} className="aspect-square bg-slate-100 rounded-lg overflow-hidden relative">
                <img
                  src={img.url}
                  alt={`Bild ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {results && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    {results[idx]?.newUrl ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : results[idx]?.error ? (
                      <XCircle className="w-6 h-6 text-red-400" />
                    ) : null}
                  </div>
                )}
              </div>
            ))}
            {images.length > 5 && (
              <div className="aspect-square bg-slate-200 rounded-lg flex items-center justify-center">
                <span className="text-slate-500 text-sm font-medium">+{images.length - 5}</span>
              </div>
            )}
          </div>

          {/* Background Selection */}
          {!results && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Hintergrund wählen</Label>
              <RadioGroup
                value={selectedBackground}
                onValueChange={setSelectedBackground}
                className="grid grid-cols-2 gap-2"
                disabled={isProcessing}
              >
                {BACKGROUND_TEMPLATES.map((bg) => (
                  <label
                    key={bg.id}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedBackground === bg.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <RadioGroupItem value={bg.id} className="sr-only" />
                    <span className="text-xl">{bg.preview}</span>
                    <span className="text-sm font-medium">{bg.name}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Verarbeite Bilder...</span>
                <span className="text-slate-500">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Results Summary */}
          {results && (
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-sm">Ergebnis</h4>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  {successCount} erfolgreich
                </div>
                {failCount > 0 && (
                  <div className="flex items-center gap-1 text-red-600">
                    <XCircle className="w-4 h-4" />
                    {failCount} fehlgeschlagen
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {!results ? (
            <>
              <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
                Abbrechen
              </Button>
              <Button onClick={handleOptimize} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verarbeite...
                  </>
                ) : (
                  <>🚀 {images.length} Bilder optimieren</>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>
                Schliessen
              </Button>
              {successCount > 0 && (
                <Button onClick={handleApply}>
                  ✅ {successCount} Bilder übernehmen
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
