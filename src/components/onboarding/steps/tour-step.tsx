"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { TourProgress } from "@/hooks/use-onboarding";
import { ArrowLeft, ArrowRight, Compass, LayoutDashboard, Car, MessageCircle, Settings, Check, Loader2 } from "lucide-react";

interface TourStepProps {
  data: TourProgress;
  onChange: (data: Partial<TourProgress>) => void;
  onNext: () => void;
  onBack: () => void;
  saving: boolean;
  error: string | null;
}

const TOUR_SECTIONS = [
  {
    key: 'dashboard' as const,
    icon: LayoutDashboard,
    title: 'Dashboard',
    color: 'bg-blue-100 text-blue-600',
    description: 'Dein Cockpit für den Überblick',
    details: [
      '📊 Alle wichtigen Kennzahlen auf einen Blick',
      '📈 Verkaufsstatistiken und Trends',
      '🔔 Neue Anfragen und offene Aufgaben',
      '⚡ Schnellzugriff auf häufige Aktionen',
    ],
    tip: 'Das Dashboard ist dein Startpunkt – hier siehst du sofort, was heute ansteht.',
  },
  {
    key: 'vehicles' as const,
    icon: Car,
    title: 'Fahrzeuge',
    color: 'bg-purple-100 text-purple-600',
    description: 'Dein gesamter Bestand an einem Ort',
    details: [
      '🚗 Alle Fahrzeuge übersichtlich in einer Liste',
      '📸 Bilder hochladen per Drag & Drop',
      '💰 Preise und Margen verwalten',
      '📋 Status (An Lager, Reserviert, Verkauft)',
    ],
    tip: 'Tipp: Nutze die Filter, um schnell das richtige Fahrzeug zu finden.',
  },
  {
    key: 'leads' as const,
    icon: MessageCircle,
    title: 'Anfragen',
    color: 'bg-green-100 text-green-600',
    description: 'Kundenanfragen zentral verwalten',
    details: [
      '📩 Alle Anfragen von AutoScout24 & Co.',
      '📞 Kontakthistorie nachverfolgen',
      '📝 Notizen und Status pro Lead',
      '⏰ Erinnerungen für Follow-ups',
    ],
    tip: 'Schnelle Antworten = mehr Abschlüsse. Reagiere innerhalb von 30 Min!',
  },
  {
    key: 'settings' as const,
    icon: Settings,
    title: 'Einstellungen',
    color: 'bg-amber-100 text-amber-600',
    description: 'Dealer OS nach deinen Wünschen',
    details: [
      '🏢 Firmenprofil und Kontaktdaten',
      '📍 Mehrere Standorte verwalten',
      '🔔 Benachrichtigungen anpassen',
      '💳 Abo und Zahlungen',
    ],
    tip: 'Unter Einstellungen findest du auch die WhatsApp-Integration!',
  },
];

export function TourStep({ data, onChange, onNext, onBack, saving, error }: TourStepProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('dashboard');

  const allChecked = data.dashboard && data.vehicles && data.leads && data.settings;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saving) {
      onNext();
    }
  };

  const toggleSection = (key: string) => {
    setExpandedSection(expandedSection === key ? null : key);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 bg-teal-100 rounded-full w-fit">
            <Compass className="w-8 h-8 text-teal-600" />
          </div>
          <CardTitle className="text-2xl">Kurze Tour durch Dealer OS</CardTitle>
          <CardDescription>
            Klicke auf jeden Bereich, um mehr zu erfahren. Bestätige dann mit dem Häkchen.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            {/* Tour Sections */}
            <div className="space-y-3">
              {TOUR_SECTIONS.map((section) => {
                const Icon = section.icon;
                const isExpanded = expandedSection === section.key;
                const isChecked = data[section.key];

                return (
                  <div
                    key={section.key}
                    className={`
                      rounded-lg border-2 transition-all duration-300 overflow-hidden
                      ${isChecked ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-white'}
                    `}
                  >
                    {/* Header */}
                    <button
                      type="button"
                      onClick={() => toggleSection(section.key)}
                      className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${section.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-slate-900">{section.title}</div>
                          <div className="text-sm text-slate-500">{section.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {isChecked && (
                          <div className="p-1 bg-green-500 rounded-full text-white">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                        <span className="text-slate-400">
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="pl-14">
                          <ul className="space-y-2 text-sm text-slate-600 mb-4">
                            {section.details.map((detail, idx) => (
                              <li key={idx}>{detail}</li>
                            ))}
                          </ul>
                          
                          <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800 mb-4">
                            💡 <strong>Tipp:</strong> {section.tip}
                          </div>

                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`check-${section.key}`}
                              checked={isChecked}
                              onCheckedChange={(checked) => onChange({ [section.key]: !!checked })}
                            />
                            <label 
                              htmlFor={`check-${section.key}`}
                              className="text-sm font-medium text-slate-700 cursor-pointer"
                            >
                              Verstanden! ✓
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progress indicator */}
            <div className="text-center py-2">
              <span className={`text-sm font-medium ${allChecked ? 'text-green-600' : 'text-slate-500'}`}>
                {Object.values(data).filter(Boolean).length} von 4 Bereichen verstanden
                {allChecked && ' 🎉'}
              </span>
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
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Speichern...
                  </>
                ) : (
                  <>
                    {allChecked ? 'Abschliessen' : 'Weiter'}
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
