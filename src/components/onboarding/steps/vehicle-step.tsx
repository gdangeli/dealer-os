"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VehicleData } from "@/hooks/use-onboarding";
import { ArrowLeft, ArrowRight, Car, Upload, X, Loader2, HelpCircle } from "lucide-react";
import { toast } from "sonner";

interface VehicleStepProps {
  data: VehicleData | null;
  onChange: (data: Partial<VehicleData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  saving: boolean;
  error: string | null;
}

const FUEL_TYPES = [
  { value: 'petrol', label: '⛽ Benzin' },
  { value: 'diesel', label: '🛢️ Diesel' },
  { value: 'electric', label: '⚡ Elektro' },
  { value: 'hybrid', label: '🔋 Hybrid' },
];

const TRANSMISSIONS = [
  { value: 'manual', label: '🔧 Schaltgetriebe' },
  { value: 'automatic', label: '🅰️ Automat' },
];

interface TooltipProps {
  text: string;
}

function Tooltip({ text }: TooltipProps) {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="text-slate-400 hover:text-slate-600 ml-1"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      {show && (
        <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs text-white bg-slate-800 rounded-lg shadow-lg whitespace-nowrap">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </div>
      )}
    </div>
  );
}

export function VehicleStep({ data, onChange, onNext, onBack, onSkip, saving, error }: VehicleStepProps) {
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 5));
    onChange({ images: [...(data?.images || []), ...acceptedFiles].slice(0, 5) });
    toast.success(`${acceptedFiles.length} Bild${acceptedFiles.length > 1 ? 'er' : ''} hinzugefügt! 📸`);
  }, [data?.images, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    onChange({ images: data?.images?.filter((_, i) => i !== index) || [] });
  };

  const vehicleData = data || {
    make: '',
    model: '',
    first_registration: '',
    mileage: '',
    asking_price: '',
    fuel_type: 'petrol',
    transmission: 'manual',
    images: [],
  };

  const isValid = vehicleData.make.trim().length >= 2 && vehicleData.model.trim().length >= 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && !saving) {
      onNext();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 bg-purple-100 rounded-full w-fit">
            <Car className="w-8 h-8 text-purple-600" />
          </div>
          <CardTitle className="text-2xl">Dein erstes Fahrzeug</CardTitle>
          <CardDescription>
            Erfasse jetzt ein Fahrzeug – oder mach das später im Dashboard.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            {/* Make & Model */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">
                  Marke
                  <Tooltip text="z.B. VW, BMW, Mercedes" />
                </Label>
                <Input
                  id="make"
                  value={vehicleData.make}
                  onChange={(e) => onChange({ make: e.target.value })}
                  placeholder="VW"
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">
                  Modell
                  <Tooltip text="z.B. Golf, 3er, C-Klasse" />
                </Label>
                <Input
                  id="model"
                  value={vehicleData.model}
                  onChange={(e) => onChange({ model: e.target.value })}
                  placeholder="Golf"
                  className="h-12"
                />
              </div>
            </div>

            {/* Registration & Mileage */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_registration">
                  Erstzulassung
                  <Tooltip text="Monat und Jahr der Erstregistrierung" />
                </Label>
                <Input
                  id="first_registration"
                  type="month"
                  value={vehicleData.first_registration}
                  onChange={(e) => onChange({ first_registration: e.target.value })}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileage">
                  Kilometerstand
                  <Tooltip text="Aktueller KM-Stand des Fahrzeugs" />
                </Label>
                <Input
                  id="mileage"
                  type="number"
                  value={vehicleData.mileage}
                  onChange={(e) => onChange({ mileage: e.target.value })}
                  placeholder="85'000"
                  className="h-12"
                />
              </div>
            </div>

            {/* Fuel & Transmission */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fuel_type">Antrieb</Label>
                <Select
                  value={vehicleData.fuel_type}
                  onValueChange={(value) => onChange({ fuel_type: value })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FUEL_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transmission">Getriebe</Label>
                <Select
                  value={vehicleData.transmission}
                  onValueChange={(value) => onChange({ transmission: value })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSMISSIONS.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="asking_price">
                Verkaufspreis (CHF)
                <Tooltip text="Der Preis, zu dem du das Fahrzeug verkaufen möchtest" />
              </Label>
              <Input
                id="asking_price"
                type="number"
                value={vehicleData.asking_price}
                onChange={(e) => onChange({ asking_price: e.target.value })}
                placeholder="22'900"
                className="h-12"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <Label>
                Fotos (optional)
                <Tooltip text="Bis zu 5 Bilder, max. 10MB pro Bild" />
              </Label>
              
              {imagePreviews.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative w-20 h-20">
                      <img 
                        src={preview} 
                        alt={`Bild ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg border-2 border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {imagePreviews.length < 5 && (
                <div
                  {...getRootProps()}
                  className={`
                    border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-purple-500 bg-purple-50' : 'border-slate-300 hover:border-slate-400'}
                  `}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-6 h-6 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600">
                    Fotos hierher ziehen oder klicken
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    JPG, PNG oder WebP • Max. 10MB
                  </p>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <div className="flex gap-3">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={onBack} 
                  className="flex-1 h-12"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Zurück
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
                  disabled={!isValid || saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Speichern...
                    </>
                  ) : (
                    <>
                      Speichern
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
              
              <Button 
                type="button"
                variant="ghost" 
                onClick={onSkip}
                className="text-slate-500 hover:text-slate-700"
              >
                ⏭️ Später hinzufügen
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
