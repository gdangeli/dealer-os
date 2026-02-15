import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get dealer profile
  const { data: dealer } = await supabase
    .from('dealers')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Get vehicle stats
  const { count: totalVehicles } = await supabase
    .from('vehicles')
    .select('*', { count: 'exact', head: true })
    .eq('dealer_id', dealer?.id);

  const { count: inStockVehicles } = await supabase
    .from('vehicles')
    .select('*', { count: 'exact', head: true })
    .eq('dealer_id', dealer?.id)
    .eq('status', 'in_stock');

  // Get new leads count
  const { count: newLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('dealer_id', dealer?.id)
    .eq('status', 'new');

  // Get recent leads
  const { data: recentLeads } = await supabase
    .from('leads')
    .select(`
      *,
      vehicles (make, model)
    `)
    .eq('dealer_id', dealer?.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Get vehicles with long standing time (>30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: longStanding } = await supabase
    .from('vehicles')
    .select('*')
    .eq('dealer_id', dealer?.id)
    .eq('status', 'in_stock')
    .lt('acquired_at', thirtyDaysAgo.toISOString().split('T')[0])
    .order('acquired_at', { ascending: true })
    .limit(5);

  const stats = {
    totalVehicles: totalVehicles || 0,
    inStockVehicles: inStockVehicles || 0,
    newLeads: newLeads || 0,
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Guten Tag{dealer?.contact_name ? `, ${dealer.contact_name}` : ''}!</h1>
          <p className="text-slate-600">
            Hier ist Ihre Übersicht für heute.
          </p>
        </div>
        <Link href="/dashboard/vehicles/new">
          <Button>+ Fahrzeug erfassen</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Am Lager</CardDescription>
            <CardTitle className="text-3xl">{stats.inStockVehicles}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">{stats.totalVehicles} Fahrzeuge insgesamt</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Offene Anfragen</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.newLeads}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/leads?status=new">
              <Button variant="link" className="p-0 h-auto text-sm">Jetzt bearbeiten →</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ihr Konto</CardDescription>
            <CardTitle className="text-xl text-green-600">
              {dealer?.status === 'active' ? '✅ Aktiv' : '⏳ Wird geprüft'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">Abo: {dealer?.subscription_plan || 'Gratis Beta'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <CardTitle>Neue Anfragen</CardTitle>
            <CardDescription>Diese Kunden warten auf Ihre Antwort</CardDescription>
          </CardHeader>
          <CardContent>
            {recentLeads && recentLeads.length > 0 ? (
              <div className="space-y-4">
                {recentLeads.map((lead) => (
                  <Link key={lead.id} href={`/dashboard/leads/${lead.id}`}>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div>
                        <div className="font-medium">{lead.name}</div>
                        <div className="text-sm text-slate-600">
                          {lead.vehicles ? `${lead.vehicles.make} ${lead.vehicles.model}` : 'Allgemeine Anfrage'}
                        </div>
                      </div>
                      <div className="text-sm text-slate-500">
                        {new Date(lead.created_at).toLocaleDateString('de-CH')}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">Keine neuen Anfragen – Zeit für eine Pause ☕</p>
            )}
            <Link href="/dashboard/leads">
              <Button variant="outline" className="w-full mt-4">
                Alle Anfragen
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Long Standing Vehicles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">⚠️ Brauchen Aufmerksamkeit</CardTitle>
            <CardDescription>Diese Fahrzeuge stehen über 30 Tage</CardDescription>
          </CardHeader>
          <CardContent>
            {longStanding && longStanding.length > 0 ? (
              <div className="space-y-4">
                {longStanding.map((vehicle) => {
                  const days = Math.floor((Date.now() - new Date(vehicle.acquired_at).getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <Link key={vehicle.id} href={`/dashboard/vehicles/${vehicle.id}`}>
                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors">
                        <div>
                          <div className="font-medium">{vehicle.make} {vehicle.model}</div>
                          <div className="text-sm text-slate-600">
                            CHF {vehicle.asking_price?.toLocaleString('de-CH')}
                          </div>
                        </div>
                        <div className="text-sm font-medium text-orange-600">{days} Tage</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">Alles im grünen Bereich! 🎉</p>
            )}
            <Link href="/dashboard/vehicles">
              <Button variant="outline" className="w-full mt-4">
                Zum Bestand
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {stats.totalVehicles === 0 && (
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>🚀 Los geht&apos;s!</CardTitle>
            <CardDescription>Erfassen Sie Ihr erstes Fahrzeug – dauert nur 2 Minuten.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/vehicles/new">
              <Button>Erstes Fahrzeug erfassen</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
