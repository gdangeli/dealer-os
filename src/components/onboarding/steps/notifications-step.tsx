"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NotificationSettings } from "@/hooks/use-onboarding";
import { ArrowLeft, ArrowRight, Bell, Loader2, Mail, Calendar, AlertTriangle, Sparkles } from "lucide-react";

interface NotificationsStepProps {
  data: NotificationSettings;
  onChange: (data: Partial<NotificationSettings>) => void;
  onNext: () => void;
  onBack: () => void;
  saving: boolean;
  error: string | null;
}

export function NotificationsStep({ data, onChange, onNext, onBack, saving, error }: NotificationsStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saving) {
      onNext();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 bg-amber-100 rounded-full w-fit">
            <Bell className="w-8 h-8 text-amber-600" />
          </div>
          <CardTitle className="text-2xl">Bleib auf dem Laufenden</CardTitle>
          <CardDescription>
            Wähle aus, worüber du informiert werden möchtest. Du kannst das später jederzeit ändern.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            {/* Recommended badge */}
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
              <Sparkles className="w-4 h-4" />
              <span>Empfohlene Einstellungen sind bereits aktiviert</span>
            </div>

            {/* Notification Options */}
            <div className="space-y-4">
              {/* New Lead Notification */}
              <div className="flex items-start justify-between p-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
                <div className="flex gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <Label className="text-base font-medium cursor-pointer">
                      Neue Anfragen
                    </Label>
                    <p className="text-sm text-slate-500 mt-1">
                      Du erhältst sofort eine E-Mail, wenn ein Kunde eine Anfrage stellt.
                      <span className="block text-green-600 font-medium mt-1">
                        ⭐ Empfohlen – verpasse keine heissen Leads!
                      </span>
                    </p>
                  </div>
                </div>
                <Switch
                  checked={data.notification_new_lead}
                  onCheckedChange={(checked) => onChange({ notification_new_lead: checked })}
                />
              </div>

              {/* Daily Summary */}
              <div className="flex items-start justify-between p-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
                <div className="flex gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg text-purple-600 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <Label className="text-base font-medium cursor-pointer">
                      Tägliche Zusammenfassung
                    </Label>
                    <p className="text-sm text-slate-500 mt-1">
                      Jeden Morgen um 7:00 Uhr eine Übersicht über neue Anfragen und Aktivitäten.
                      <span className="block text-slate-400 mt-1">
                        📅 Praktisch für den Tagesstart
                      </span>
                    </p>
                  </div>
                </div>
                <Switch
                  checked={data.notification_daily_summary}
                  onCheckedChange={(checked) => onChange({ notification_daily_summary: checked })}
                />
              </div>

              {/* Longstanding Warning */}
              <div className="flex items-start justify-between p-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
                <div className="flex gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg text-orange-600 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <Label className="text-base font-medium cursor-pointer">
                      Langsteher-Warnung
                    </Label>
                    <p className="text-sm text-slate-500 mt-1">
                      Wöchentliche E-Mail mit Fahrzeugen, die länger als gewünscht im Bestand stehen.
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-sm text-slate-600">Nach</span>
                      <Input
                        type="number"
                        min={1}
                        max={365}
                        value={data.notification_longstanding_days}
                        onChange={(e) => onChange({ notification_longstanding_days: parseInt(e.target.value) || 30 })}
                        className="w-20 h-8 text-center"
                      />
                      <span className="text-sm text-slate-600">Tagen</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                💡 <strong>Tipp:</strong> Du kannst alle Benachrichtigungen später unter 
                <span className="font-medium"> Einstellungen → Benachrichtigungen</span> anpassen.
              </p>
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
