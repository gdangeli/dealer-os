import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StockLineChart, SalesBarChart } from "@/components/analytics/charts";

// Hilfsfunktion für Standzeit-Berechnung
function calculateDaysInStock(acquiredAt: string | null): number {
  if (!acquiredAt) return 0;
  const acquired = new Date(acquiredAt);
  const now = new Date();
  return Math.floor((now.getTime() - acquired.getTime()) / (1000 * 60 * 60 * 24));
}

// Empfehlung basierend auf Standzeit
function getRecommendation(days: number): { text: string; urgency: "low" | "medium" | "high" } {
  if (days > 90) {
    return { text: "Dringend: Aggressive Preisanpassung empfohlen", urgency: "high" };
  } else if (days > 60) {
    return { text: "Preisanpassung um 5-10% empfohlen", urgency: "medium" };
  } else if (days > 30) {
    return { text: "Marketing verstärken", urgency: "low" };
  }
  return { text: "Normal", urgency: "low" };
}

export default async function AnalyticsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: dealer } = await supabase
    .from("dealers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!dealer?.id) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-red-600">Kein Konto gefunden</h2>
      </div>
    );
  }

  // Alle Fahrzeuge laden
  const { data: allVehicles } = await supabase
    .from("vehicles")
    .select("*")
    .eq("dealer_id", dealer.id);

  const vehicles = allVehicles || [];

  // === KPIs berechnen ===
  const inStockVehicles = vehicles.filter(v => v.status === "in_stock");
  const soldVehicles = vehicles.filter(v => v.status === "sold");
  
  // Verkäufe diesen Monat
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const soldThisMonth = soldVehicles.filter(v => 
    v.sold_at && new Date(v.sold_at) >= firstDayOfMonth
  );

  // Durchschnittliche Standzeit (nur verkaufte mit sold_at und acquired_at)
  const soldWithDates = soldVehicles.filter(v => v.sold_at && v.acquired_at);
  const avgStandingTime = soldWithDates.length > 0
    ? Math.round(soldWithDates.reduce((sum, v) => {
        const acquired = new Date(v.acquired_at!);
        const sold = new Date(v.sold_at!);
        return sum + Math.floor((sold.getTime() - acquired.getTime()) / (1000 * 60 * 60 * 24));
      }, 0) / soldWithDates.length)
    : null;

  // Durchschnittliche Marge (nur wenn beide Preise vorhanden)
  const vehiclesWithMargin = soldVehicles.filter(v => 
    v.purchase_price && v.asking_price && v.purchase_price > 0
  );
  const avgMargin = vehiclesWithMargin.length > 0
    ? Math.round(vehiclesWithMargin.reduce((sum, v) => 
        sum + (v.asking_price! - v.purchase_price!), 0) / vehiclesWithMargin.length)
    : null;
  
  const avgMarginPercent = vehiclesWithMargin.length > 0
    ? Math.round(vehiclesWithMargin.reduce((sum, v) => 
        sum + ((v.asking_price! - v.purchase_price!) / v.purchase_price! * 100), 0) / vehiclesWithMargin.length)
    : null;

  // === Langsteher-Analyse ===
  const longStanders = inStockVehicles
    .filter(v => v.acquired_at)
    .map(v => ({
      ...v,
      daysInStock: calculateDaysInStock(v.acquired_at),
    }))
    .filter(v => v.daysInStock > 30)
    .sort((a, b) => b.daysInStock - a.daysInStock);

  const over30Days = longStanders.filter(v => v.daysInStock > 30 && v.daysInStock <= 60).length;
  const over60Days = longStanders.filter(v => v.daysInStock > 60 && v.daysInStock <= 90).length;
  const over90Days = longStanders.filter(v => v.daysInStock > 90).length;

  // === Charts-Daten ===
  // Bestand über Zeit (letzte 6 Monate simuliert basierend auf created_at)
  const stockOverTime: { date: string; bestand: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStr = date.toLocaleDateString("de-CH", { month: "short", year: "2-digit" });
    
    // Zähle Fahrzeuge die zu diesem Zeitpunkt im Bestand waren
    const cutoff = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const count = vehicles.filter(v => {
      const created = new Date(v.created_at);
      const sold = v.sold_at ? new Date(v.sold_at) : null;
      return created <= cutoff && (!sold || sold > cutoff);
    }).length;
    
    stockOverTime.push({ date: monthStr, bestand: count });
  }

  // Verkäufe pro Monat (letzte 6 Monate)
  const salesByMonth: { month: string; verkäufe: number; umsatz: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStr = date.toLocaleDateString("de-CH", { month: "short" });
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const monthSales = soldVehicles.filter(v => {
      if (!v.sold_at) return false;
      const soldDate = new Date(v.sold_at);
      return soldDate >= monthStart && soldDate <= monthEnd;
    });
    
    const umsatz = monthSales.reduce((sum, v) => sum + (v.asking_price || 0), 0);
    
    salesByMonth.push({ 
      month: monthStr, 
      verkäufe: monthSales.length,
      umsatz 
    });
  }

  // === Top-Performer ===
  // Schnellste Verkäufe
  const fastestSales = soldWithDates
    .map(v => ({
      ...v,
      daysToSell: Math.floor(
        (new Date(v.sold_at!).getTime() - new Date(v.acquired_at!).getTime()) / (1000 * 60 * 60 * 24)
      ),
    }))
    .sort((a, b) => a.daysToSell - b.daysToSell)
    .slice(0, 5);

  // Beste Margen
  const bestMargins = vehiclesWithMargin
    .map(v => ({
      ...v,
      margin: v.asking_price! - v.purchase_price!,
      marginPercent: Math.round((v.asking_price! - v.purchase_price!) / v.purchase_price! * 100),
    }))
    .sort((a, b) => b.margin - a.margin)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Auswertungen</h1>
        <p className="text-slate-600">
          Analysieren Sie Ihre Performance und identifizieren Sie Optimierungspotenzial.
        </p>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Im Bestand</CardDescription>
            <CardTitle className="text-3xl">{inStockVehicles.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              {vehicles.length} Fahrzeuge total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Verkauft (Monat)</CardDescription>
            <CardTitle className="text-3xl text-green-600">{soldThisMonth.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              {soldVehicles.length} Verkäufe total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>⌀ Standzeit</CardDescription>
            <CardTitle className="text-3xl">
              {avgStandingTime !== null ? `${avgStandingTime}d` : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              {avgStandingTime !== null ? "bei verkauften Fzg." : "Noch keine Daten"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>⌀ Marge</CardDescription>
            <CardTitle className="text-3xl">
              {avgMargin !== null ? (
                <span className={avgMargin >= 0 ? "text-green-600" : "text-red-600"}>
                  CHF {avgMargin.toLocaleString("de-CH")}
                </span>
              ) : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">
              {avgMarginPercent !== null 
                ? `${avgMarginPercent}% Durchschnitt` 
                : "Einkaufspreise erfassen"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Bestandsentwicklung</CardTitle>
            <CardDescription>Fahrzeuge im Bestand (letzte 6 Monate)</CardDescription>
          </CardHeader>
          <CardContent>
            <StockLineChart data={stockOverTime} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verkäufe pro Monat</CardTitle>
            <CardDescription>Anzahl & Umsatz (letzte 6 Monate)</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesBarChart data={salesByMonth} />
          </CardContent>
        </Card>
      </div>

      {/* Standzeit-Analyse */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⏱️ Standzeit-Analyse
            {over90Days > 0 && (
              <Badge variant="destructive">{over90Days} kritisch</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Fahrzeuge die länger als 30 Tage im Bestand sind
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Summary */}
          <div className="flex gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="text-sm">30-60 Tage: <strong>{over30Days}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-sm">60-90 Tage: <strong>{over60Days}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm">&gt;90 Tage: <strong>{over90Days}</strong></span>
            </div>
          </div>

          {longStanders.length > 0 ? (
            <div className="space-y-3">
              {longStanders.slice(0, 10).map((vehicle) => {
                const rec = getRecommendation(vehicle.daysInStock);
                return (
                  <Link key={vehicle.id} href={`/dashboard/vehicles/${vehicle.id}`}>
                    <div className={`flex justify-between items-center p-4 rounded-lg border transition-colors hover:bg-slate-50 ${
                      vehicle.daysInStock > 90 
                        ? "border-red-200 bg-red-50" 
                        : vehicle.daysInStock > 60 
                          ? "border-orange-200 bg-orange-50"
                          : "border-yellow-200 bg-yellow-50"
                    }`}>
                      <div>
                        <div className="font-medium">
                          {vehicle.make} {vehicle.model}
                          {vehicle.variant && <span className="text-slate-500"> {vehicle.variant}</span>}
                        </div>
                        <div className="text-sm text-slate-600">
                          CHF {vehicle.asking_price?.toLocaleString("de-CH") || "—"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${
                          vehicle.daysInStock > 90 
                            ? "text-red-600" 
                            : vehicle.daysInStock > 60 
                              ? "text-orange-600"
                              : "text-yellow-600"
                        }`}>
                          {vehicle.daysInStock} Tage
                        </div>
                        <div className={`text-xs ${
                          rec.urgency === "high" 
                            ? "text-red-600 font-medium" 
                            : rec.urgency === "medium"
                              ? "text-orange-600"
                              : "text-slate-500"
                        }`}>
                          {rec.text}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
              {longStanders.length > 10 && (
                <p className="text-center text-sm text-slate-500 pt-2">
                  ... und {longStanders.length - 10} weitere
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <div className="text-4xl mb-2">🎉</div>
              Alle Fahrzeuge unter 30 Tagen Standzeit — ausgezeichnet!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top-Performer */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>🚀 Schnellste Verkäufe</CardTitle>
            <CardDescription>Diese Fahrzeuge gingen am schnellsten weg</CardDescription>
          </CardHeader>
          <CardContent>
            {fastestSales.length > 0 ? (
              <div className="space-y-3">
                {fastestSales.map((vehicle, i) => (
                  <div key={vehicle.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-slate-400">#{i + 1}</span>
                      <div>
                        <div className="font-medium">{vehicle.make} {vehicle.model}</div>
                        <div className="text-sm text-slate-500">
                          CHF {vehicle.asking_price?.toLocaleString("de-CH")}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-green-700 bg-green-100">
                      {vehicle.daysToSell} Tage
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-6">
                Noch keine Verkaufsdaten mit Einkaufs- und Verkaufsdatum
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>💰 Beste Margen</CardTitle>
            <CardDescription>Die profitabelsten Fahrzeuge</CardDescription>
          </CardHeader>
          <CardContent>
            {bestMargins.length > 0 ? (
              <div className="space-y-3">
                {bestMargins.map((vehicle, i) => (
                  <div key={vehicle.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-slate-400">#{i + 1}</span>
                      <div>
                        <div className="font-medium">{vehicle.make} {vehicle.model}</div>
                        <div className="text-sm text-slate-500">
                          EK: CHF {vehicle.purchase_price?.toLocaleString("de-CH")} → VK: CHF {vehicle.asking_price?.toLocaleString("de-CH")}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        +CHF {vehicle.margin.toLocaleString("de-CH")}
                      </div>
                      <div className="text-xs text-slate-500">{vehicle.marginPercent}%</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-slate-500">Noch keine Margen-Daten</p>
                <p className="text-sm text-slate-400 mt-1">
                  Erfassen Sie Einkaufspreise für Margen-Tracking
                </p>
                <Link href="/dashboard/vehicles">
                  <Button variant="outline" className="mt-3" size="sm">
                    Zu den Fahrzeugen
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
