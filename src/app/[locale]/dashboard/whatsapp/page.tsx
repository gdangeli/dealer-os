import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { WhatsAppConversationsClient } from './whatsapp-conversations-client';
import { getCurrentDealer } from '@/lib/auth/get-current-dealer';

export default async function WhatsAppPage() {
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

  // Check if WhatsApp is connected
  const { data: connection } = await supabase
    .from('whatsapp_connections')
    .select('id, status, phone_number')
    .eq('dealer_id', dealer.id)
    .eq('status', 'active')
    .single();

  if (!connection) {
    // WhatsApp not connected - show setup message
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">WhatsApp Business</h1>
          <p className="text-slate-600 mb-6">
            Sie haben WhatsApp Business noch nicht eingerichtet.
          </p>
          <a
            href="/dashboard/settings/whatsapp"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Jetzt einrichten
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <WhatsAppConversationsClient dealerId={dealer.id} />
    </div>
  );
}
