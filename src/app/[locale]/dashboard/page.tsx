import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

  // Get dealer profile via team_members (handles impersonation)
  const dealer = await getCurrentDealer();

  // Check if impersonating
  const impersonation = await getImpersonationInfo();
  const isImpersonating = !!impersonation;

  // Use admin client when impersonating to bypass RLS
  const queryClient = isImpersonating ? createAdminClient() : supabase;

  // Redirect to onboarding if not completed (skip if impersonating)
  if (dealer && !dealer.onboarding_completed && !impersonation) {
    redirect('/onboarding');
  }

  // Get vehicle stats
  const { count: totalVehicles } = await queryClient
    .from('vehicles')
    .select('*', { count: 'exact', head: true })
    .eq('dealer_id', dealer?.id);

  const { count: inStockVehicles } = await queryClient
    .from('vehicles')
    .select('*', { count: 'exact', head: true })
    .eq('dealer_id', dealer?.id)
    .eq('status', 'in_stock');

  // Get new leads count
  const { count: newLeads } = await queryClient
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('dealer_id', dealer?.id)
    .eq('status', 'new');

  // Get recent leads
  const { data: recentLeads } = await queryClient
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
  
  const { data: longStanding } = await queryClient
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Guten Tag{dealer?.contact_name ? `, ${dealer.contact_name}` : ''}!</h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Hier ist Ihre Übersicht für heute.
          </p>
        </div>
        <Button size="sm" className="sm:size-default self-start sm:self-auto" asChild>
          <Link href="/dashboard/vehicles/new">+ Fahrzeug erfassen</Link>
        </Button>
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
