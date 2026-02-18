"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CompanyData } from "@/hooks/use-onboarding";
import { ArrowLeft, ArrowRight, Upload, X, Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CompanyStepProps {
  data: CompanyData;
  onChange: (data: Partial<CompanyData>) => void;
  onNext: () => void;
  onBack: () => void;
  saving: boolean;
  error: string | null;
}

export function CompanyStep({ data, onChange, onNext, onBack, saving, error }: CompanyStepProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(data.logo_url);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadingLogo(true);
    
    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
    
    // In a real implementation, you'd upload to Supabase here
    // For now, just store the preview
    onChange({ logo_url: previewUrl });
    setUploadingLogo(false);
    toast.success("Logo hochgeladen! 🎨");
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/svg+xml': ['.svg'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const removeLogo = () => {
    setLogoPreview(null);
    onChange({ logo_url: null });
  };

  const isValid = data.company_name.trim().length >= 2 && data.contact_name.trim().length >= 2;

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
          <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-fit">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Deine Garage einrichten</CardTitle>
          <CardDescription>
            Erzähl uns ein bisschen über dein Geschäft – so können wir alles persönlich gestalten.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Logo (optional)</Label>
              {logoPreview ? (
                <div className="relative w-32 h-32 mx-auto">
                  <img 
                    src={logoPreview} 
                    alt="Logo" 
                    className="w-full h-full object-contain rounded-lg border-2 border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`
                    border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'}
                  `}
                >
                  <input {...getInputProps()} />
                  {uploadingLogo ? (
                    <Loader2 className="w-8 h-8 mx-auto text-blue-500 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-600">
                        Logo hierher ziehen oder klicken
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        PNG, JPG oder SVG • Max. 5MB
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="company_name">
                Firmenname <span className="text-red-500">*</span>
              </Label>
              <Input
                id="company_name"
                value={data.company_name}
                onChange={(e) => onChange({ company_name: e.target.value })}
                placeholder="z.B. Autohaus Müller AG"
                className="h-12"
                required
              />
              {data.company_name && data.company_name.length < 2 && (
                <p className="text-xs text-amber-600">
                  Bitte gib mindestens 2 Zeichen ein
                </p>
              )}
            </div>

            {/* Contact Name */}
            <div className="space-y-2">
              <Label htmlFor="contact_name">
                Ansprechperson <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contact_name"
                value={data.contact_name}
                onChange={(e) => onChange({ contact_name: e.target.value })}
                placeholder="z.B. Hans Müller"
                className="h-12"
                required
              />
              <p className="text-xs text-slate-500">
                💡 Wird bei E-Mails und Anfragen angezeigt
              </p>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={data.phone}
                  onChange={(e) => onChange({ phone: e.target.value })}
                  placeholder="044 123 45 67"
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => onChange({ email: e.target.value })}
                  placeholder="info@garage.ch"
                  className="h-12"
                />
              </div>
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website">Webseite (optional)</Label>
              <Input
                id="website"
                type="url"
                value={data.website}
                onChange={(e) => onChange({ website: e.target.value })}
                placeholder="https://www.deine-garage.ch"
                className="h-12"
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
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
                    Weiter
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
