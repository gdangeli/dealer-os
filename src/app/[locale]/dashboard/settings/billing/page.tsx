import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BillingClient } from './billing-client';
import { getCurrentDealer, hasPermission } from '@/lib/auth/get-current-dealer';

export default async function BillingPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const dealer = await getCurrentDealer();

  if (!dealer) redirect('/onboarding');
  
  // Only owners can access billing
  if (!hasPermission(dealer.role, 'manage_billing')) {
    redirect('/dashboard/settings');
  }

  return <BillingClient dealer={dealer} />;
}
