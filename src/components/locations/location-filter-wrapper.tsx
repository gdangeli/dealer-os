import { createClient } from '@/lib/supabase/server';
import { LocationFilter } from './location-filter';

interface LocationFilterWrapperProps {
  dealerId: string;
  className?: string;
}

export async function LocationFilterWrapper({ dealerId, className }: LocationFilterWrapperProps) {
  const supabase = await createClient();

  // Get locations for this dealer
  const { data: locations } = await supabase
    .from('locations')
    .select('id, name, city, is_main')
    .eq('dealer_id', dealerId)
    .order('is_main', { ascending: false })
    .order('name', { ascending: true });

  // Only render if there are locations
  if (!locations || locations.length === 0) {
    return null;
  }

  // Cast to expected type (Supabase returns the correct shape)
  const typedLocations = locations as { id: string; name: string; city: string | null; is_main: boolean }[];

  return <LocationFilter locations={typedLocations} className={className} />;
}
