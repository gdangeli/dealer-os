import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { WhatsAppSettingsClient } from './whatsapp-settings-client';
import { getCurrentDealer } from '@/lib/auth/get-current-dealer';

export default async function WhatsAppSettingsPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get dealer via team_members
  const dealer = await getCurrentDealer();

  if (!dealer) {
    redirect('/dashboard');
  }

  // Get WhatsApp connection
  const { data: connection } = await supabase
    .from('whatsapp_connections')
    .select('*')
    .eq('dealer_id', dealer.id)
    .single();

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">WhatsApp Business</h1>
        <p className="text-slate-600">
          Verwalten Sie Ihre WhatsApp Business Integration
        </p>
      </div>

      <WhatsAppSettingsClient
        dealerId={dealer.id}
        initialConnection={connection}
      />
    </div>
  );
}
