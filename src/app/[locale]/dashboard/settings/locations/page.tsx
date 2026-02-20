import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LocationsSettingsClient } from './locations-settings-client';
import { getCurrentDealer } from '@/lib/auth/get-current-dealer';

export const metadata = {
  title: 'Standorte verwalten',
};

export default async function LocationsSettingsPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get dealer via team_members
  const dealer = await getCurrentDealer();

  if (!dealer) {
    redirect('/dashboard');
  }

  // Get locations
  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .eq('dealer_id', dealer.id)
    .order('is_main', { ascending: false })
    .order('name', { ascending: true });

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">📍 Standorte verwalten</h1>
        <p className="text-slate-600">
          Verwalten Sie Ihre Filialstandorte für Fahrzeuge, Leads und Kunden.
        </p>
      </div>

      <LocationsSettingsClient
        dealerId={dealer.id}
        dealer={dealer}
        initialLocations={locations || []}
      />
    </div>
  );
}
