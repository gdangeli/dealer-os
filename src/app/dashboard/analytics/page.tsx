import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Auswertungen</h1>
        <p className="text-slate-600">Analysieren Sie Ihre Performance und identifizieren Sie Optimierungspotenzial.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Verkaufsstatistiken
            <Badge variant="secondary">Bald verfügbar</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            Verkäufe pro Monat, Durchschnittspreis, Margen und mehr.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Standzeit-Analyse
            <Badge variant="secondary">Bald verfügbar</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            Durchschnittliche Standzeiten nach Marke, Modell und Preissegment.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Lead-Performance
            <Badge variant="secondary">Bald verfügbar</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            Conversion-Raten, Response-Zeiten und Kanal-Vergleich.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
