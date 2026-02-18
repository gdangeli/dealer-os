"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocationData } from "@/hooks/use-onboarding";
import { ArrowLeft, ArrowRight, MapPin, Clock, Loader2 } from "lucide-react";

interface LocationStepProps {
  data: LocationData;
  companyName: string;
  onChange: (data: Partial<LocationData>) => void;
  onNext: () => void;
  onBack: () => void;
  saving: boolean;
  error: string | null;
}

const DAYS = [
  { key: 'monday', label: 'Montag', short: 'Mo' },
  { key: 'tuesday', label: 'Dienstag', short: 'Di' },
  { key: 'wednesday', label: 'Mittwoch', short: 'Mi' },
  { key: 'thursday', label: 'Donnerstag', short: 'Do' },
  { key: 'friday', label: 'Freitag', short: 'Fr' },
  { key: 'saturday', label: 'Samstag', short: 'Sa' },
  { key: 'sunday', label: 'Sonntag', short: 'So' },
] as const;

const TIME_PRESETS = [
  { label: 'Standard', weekday: { open: '08:00', close: '18:00' }, saturday: { open: '09:00', close: '16:00' }, sundayClosed: true },
  { label: 'Durchgehend', weekday: { open: '08:00', close: '20:00' }, saturday: { open: '09:00', close: '18:00' }, sundayClosed: true },
  { label: 'Halbtags', weekday: { open: '08:00', close: '12:00' }, saturday: { open: '08:00', close: '12:00' }, sundayClosed: true },
];

export function LocationStep({ data, companyName, onChange, onNext, onBack, saving, error }: LocationStepProps) {
  const [showOpeningHours, setShowOpeningHours] = useState(false);

  const isValid = 
    data.address.trim().length >= 3 && 
    data.postal_code.trim().length >= 4 && 
    data.city.trim().length >= 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && !saving) {
      onNext();
    }
  };

  const applyPreset = (preset: typeof TIME_PRESETS[0]) => {
    const newHours = { ...data.opening_hours };
    
    DAYS.forEach(day => {
      if (day.key === 'sunday') {
        newHours.sunday = { 
          open: '00:00', 
          close: '00:00', 
          closed: preset.sundayClosed 
        };
      } else if (day.key === 'saturday') {
        newHours.saturday = { 
          ...preset.saturday, 
          closed: false 
        };
      } else {
        newHours[day.key] = { 
          ...preset.weekday, 
          closed: false 
        };
      }
    });

    onChange({ opening_hours: newHours });
  };

  const toggleDayClosed = (dayKey: string) => {
    const newHours = { ...data.opening_hours };
    const day = newHours[dayKey as keyof typeof newHours];
    newHours[dayKey as keyof typeof newHours] = {
      ...day,
      closed: !day.closed,
    };
    onChange({ opening_hours: newHours });
  };

  const updateDayTime = (dayKey: string, field: 'open' | 'close', value: string) => {
    const newHours = { ...data.opening_hours };
    newHours[dayKey as keyof typeof newHours] = {
      ...newHours[dayKey as keyof typeof newHours],
      [field]: value,
    };
    onChange({ opening_hours: newHours });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full w-fit">
            <MapPin className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Dein Standort</CardTitle>
          <CardDescription>
            Wo finden dich deine Kunden? Diese Angaben erscheinen auf deinem Profil.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            {/* Location Name (optional) */}
            <div className="space-y-2">
              <Label htmlFor="name">Standortname (optional)</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => onChange({ name: e.target.value })}
                placeholder={`z.B. ${companyName} Hauptstandort`}
                className="h-12"
              />
              <p className="text-xs text-slate-500">
                💡 Nützlich, wenn du mehrere Standorte hast
              </p>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">
                Strasse & Nr. <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address"
                value={data.address}
                onChange={(e) => onChange({ address: e.target.value })}
                placeholder="z.B. Hauptstrasse 42"
                className="h-12"
                required
              />
            </div>

            {/* PLZ & City */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postal_code">
                  PLZ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="postal_code"
                  value={data.postal_code}
                  onChange={(e) => onChange({ postal_code: e.target.value })}
                  placeholder="8000"
                  className="h-12"
                  maxLength={5}
                  required
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="city">
                  Ort <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  value={data.city}
                  onChange={(e) => onChange({ city: e.target.value })}
                  placeholder="Zürich"
                  className="h-12"
                  required
                />
              </div>
            </div>

            {/* Opening Hours Toggle */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setShowOpeningHours(!showOpeningHours)}
                className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
              >
                <Clock className="w-4 h-4" />
                Öffnungszeiten {showOpeningHours ? 'ausblenden' : 'hinzufügen'} (optional)
                <span className="text-xs text-slate-500">→</span>
              </button>

              {showOpeningHours && (
                <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300">
                  {/* Presets */}
                  <div className="flex flex-wrap gap-2">
                    {TIME_PRESETS.map(preset => (
                      <Button
                        key={preset.label}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => applyPreset(preset)}
                        className="text-xs"
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>

                  {/* Day-by-day */}
                  <div className="space-y-2">
                    {DAYS.map(day => (
                      <div key={day.key} className="flex items-center gap-2 text-sm">
                        <span className="w-8 font-medium text-slate-600">{day.short}</span>
                        <button
                          type="button"
                          onClick={() => toggleDayClosed(day.key)}
                          className={`
                            px-2 py-1 rounded text-xs font-medium transition-colors
                            ${data.opening_hours[day.key].closed 
                              ? 'bg-slate-200 text-slate-600' 
                              : 'bg-green-100 text-green-700'
                            }
                          `}
                        >
                          {data.opening_hours[day.key].closed ? 'Geschlossen' : 'Offen'}
                        </button>
                        {!data.opening_hours[day.key].closed && (
                          <>
                            <Input
                              type="time"
                              value={data.opening_hours[day.key].open}
                              onChange={(e) => updateDayTime(day.key, 'open', e.target.value)}
                              className="w-24 h-8 text-xs"
                            />
                            <span className="text-slate-400">–</span>
                            <Input
                              type="time"
                              value={data.opening_hours[day.key].close}
                              onChange={(e) => updateDayTime(day.key, 'close', e.target.value)}
                              className="w-24 h-8 text-xs"
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contact (optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location_phone">Telefon (Standort)</Label>
                <Input
                  id="location_phone"
                  type="tel"
                  value={data.phone}
                  onChange={(e) => onChange({ phone: e.target.value })}
                  placeholder="Falls anders als Firma"
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location_email">E-Mail (Standort)</Label>
                <Input
                  id="location_email"
                  type="email"
                  value={data.email}
                  onChange={(e) => onChange({ email: e.target.value })}
                  placeholder="Falls anders als Firma"
                  className="h-12"
                />
              </div>
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
