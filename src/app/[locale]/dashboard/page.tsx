import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { WidgetGrid } from "@/components/dashboard/widget-grid";
import { saveDashboardConfig } from "./actions";
import { DEFAULT_WIDGETS } from "@/components/dashboard/types";
import { getCurrentDealer, getImpersonationInfo } from "@/lib/auth/get-current-dealer";

export default async function DashboardPage() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get dealer profile via team_members
  const dealer = await getCurrentDealer();

  // Check if impersonating (skip onboarding redirect when impersonating)
  const impersonation = await getImpersonationInfo();

  // Redirect to onboarding if not completed (skip if impersonating)
  if (dealer && !dealer.onboarding_completed && !impersonation) {
    redirect('/onboarding');
  }

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

  // Get dashboard config from dealer profile or use defaults
  const dashboardConfig = dealer?.dashboard_config?.widgets || DEFAULT_WIDGETS;

  return (
    <div data-testid="dashboard">
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

      <WidgetGrid
        initialConfig={dashboardConfig}
        stats={stats}
        dealer={dealer}
        recentLeads={recentLeads || []}
        longStanding={longStanding || []}
        onSaveConfig={saveDashboardConfig}
      />
    </div>
  );
}
