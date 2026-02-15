import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  // Mock data - später aus Supabase
  const stats = {
    totalVehicles: 24,
    activeListings: 18,
    newLeads: 5,
    avgDaysOnLot: 23,
  };

  const recentLeads = [
    { id: 1, name: "Peter Meier", vehicle: "BMW 320d", time: "vor 2 Stunden" },
    { id: 2, name: "Sandra Keller", vehicle: "VW Golf", time: "vor 5 Stunden" },
    { id: 3, name: "Thomas Brunner", vehicle: "Audi A4", time: "gestern" },
  ];

  const longStanding = [
    { id: 1, name: "Opel Astra 2019", days: 67, price: "CHF 14'900" },
    { id: 2, name: "Fiat 500 2018", days: 45, price: "CHF 9'800" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-slate-600">Willkommen zurück! Hier ist Ihr Überblick.</p>
        </div>
        <Link href="/dashboard/vehicles/new">
          <Button>+ Neues Fahrzeug</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Fahrzeuge gesamt</CardDescription>
            <CardTitle className="text-3xl">{stats.totalVehicles}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Aktive Inserate</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.activeListings}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Neue Anfragen</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.newLeads}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ø Standzeit (Tage)</CardDescription>
            <CardTitle className="text-3xl">{stats.avgDaysOnLot}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <CardTitle>Neue Anfragen</CardTitle>
            <CardDescription>Die letzten Kundenanfragen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium">{lead.name}</div>
                    <div className="text-sm text-slate-600">{lead.vehicle}</div>
                  </div>
                  <div className="text-sm text-slate-500">{lead.time}</div>
                </div>
              ))}
            </div>
            <Link href="/dashboard/leads">
              <Button variant="outline" className="w-full mt-4">
                Alle Anfragen anzeigen
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Long Standing Vehicles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">⚠️ Lange Standzeit</CardTitle>
            <CardDescription>Diese Fahrzeuge brauchen Aufmerksamkeit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {longStanding.map((vehicle) => (
                <div key={vehicle.id} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div>
                    <div className="font-medium">{vehicle.name}</div>
                    <div className="text-sm text-slate-600">{vehicle.price}</div>
                  </div>
                  <div className="text-sm font-medium text-orange-600">{vehicle.days} Tage</div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              Preisempfehlung anfordern
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
