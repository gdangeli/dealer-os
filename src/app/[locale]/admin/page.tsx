import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { AdminDashboardClient } from './admin-dashboard-client';

export const metadata = {
  title: 'Admin Dashboard - DealerOS',
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Check if user is platform admin
  const { data: isAdmin } = await supabase
    .from('platform_admins')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!isAdmin) {
    redirect('/dashboard');
  }

  // Get all dealers with stats using admin client
  const adminClient = createAdminClient();
  
  const { data: dealers, error: dealersError } = await adminClient
    .from('dealers')
    .select(`
      id,
      company_name,
      contact_name,
      email,
      subscription_plan,
      subscription_status,
      status,
      created_at,
      onboarding_completed
    `)
    .order('created_at', { ascending: false });

  if (dealersError) {
    console.error('Error fetching dealers:', dealersError);
  }

  // Get team member counts per dealer
  const { data: teamCounts } = await adminClient
    .from('team_members')
    .select('dealer_id');

  const teamCountMap: Record<string, number> = {};
  teamCounts?.forEach(tm => {
    teamCountMap[tm.dealer_id] = (teamCountMap[tm.dealer_id] || 0) + 1;
  });

  // Get vehicle counts per dealer
  const { data: vehicleCounts } = await adminClient
    .from('vehicles')
    .select('dealer_id');

  const vehicleCountMap: Record<string, number> = {};
  vehicleCounts?.forEach(v => {
    vehicleCountMap[v.dealer_id] = (vehicleCountMap[v.dealer_id] || 0) + 1;
  });

  // Enrich dealers with counts
  const dealersWithStats = (dealers || []).map(dealer => ({
    ...dealer,
    teamCount: teamCountMap[dealer.id] || 0,
    vehicleCount: vehicleCountMap[dealer.id] || 0,
  }));

  // Calculate summary stats
  const stats = {
    totalDealers: dealers?.length || 0,
    activeDealers: dealers?.filter(d => d.status === 'active').length || 0,
    totalVehicles: vehicleCounts?.length || 0,
    planBreakdown: {
      beta: dealers?.filter(d => d.subscription_plan === 'beta').length || 0,
      starter: dealers?.filter(d => d.subscription_plan === 'starter').length || 0,
      pro: dealers?.filter(d => d.subscription_plan === 'pro').length || 0,
      business: dealers?.filter(d => d.subscription_plan === 'business').length || 0,
      enterprise: dealers?.filter(d => d.subscription_plan === 'enterprise').length || 0,
    },
  };

  return (
    <AdminDashboardClient 
      dealers={dealersWithStats} 
      stats={stats}
      currentUserId={user.id}
    />
  );
}
