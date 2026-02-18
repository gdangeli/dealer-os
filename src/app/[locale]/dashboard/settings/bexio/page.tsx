import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BexioSettingsClient } from "./bexio-settings-client";

export const metadata = {
  title: "Bexio-Integration",
};

export default async function BexioSettingsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get dealer profile with Bexio settings
  const { data: dealer } = await supabase
    .from('dealers')
    .select(`
      id,
      bexio_is_connected,
      bexio_company_name,
      bexio_company_id,
      bexio_connected_at,
      bexio_last_sync_at,
      bexio_last_error
    `)
    .eq('user_id', user.id)
    .single();

  if (!dealer) {
    redirect('/dashboard');
  }

  // Get sync stats
  const { count: totalCustomers } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('dealer_id', dealer.id);

  const { count: syncedCustomers } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('dealer_id', dealer.id)
    .not('bexio_contact_id', 'is', null);

  const { count: totalInvoices } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('dealer_id', dealer.id);

  const { count: syncedInvoices } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('dealer_id', dealer.id)
    .not('bexio_invoice_id', 'is', null);

  return (
    <BexioSettingsClient 
      dealer={{
        id: dealer.id,
        isConnected: dealer.bexio_is_connected || false,
        companyName: dealer.bexio_company_name,
        companyId: dealer.bexio_company_id,
        connectedAt: dealer.bexio_connected_at,
        lastSyncAt: dealer.bexio_last_sync_at,
        lastError: dealer.bexio_last_error,
      }}
      stats={{
        customers: {
          total: totalCustomers || 0,
          synced: syncedCustomers || 0,
        },
        invoices: {
          total: totalInvoices || 0,
          synced: syncedInvoices || 0,
        },
      }}
    />
  );
}
