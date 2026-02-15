import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Einstellungen</h1>
        <p className="text-slate-600">Verwalten Sie Ihr Konto und Ihre Präferenzen.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Kontoverwaltung
            <Badge variant="secondary">Bald verfügbar</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            Hier können Sie bald Ihre Firmendaten, Benutzer und Integrationen verwalten.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Inserate-Kanäle
            <Badge variant="secondary">Bald verfügbar</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            Verbinden Sie AutoScout24, mobile.de und andere Plattformen für automatisches Publishing.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Benachrichtigungen
            <Badge variant="secondary">Bald verfügbar</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            Konfigurieren Sie E-Mail-Benachrichtigungen für neue Anfragen und Langsteher.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
