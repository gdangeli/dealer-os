import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getCurrentDealer } from '@/lib/auth/get-current-dealer';
import LeadsClient from './leads-client';

export default async function LeadsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Get dealer with impersonation support
  const dealer = await getCurrentDealer();
  if (!dealer) {
    redirect('/dashboard');
  }

  // Render the client component - it will fetch data via API
  return <LeadsClient />;
}
