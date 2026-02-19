'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { WidgetConfig } from '@/components/dashboard/types';
import { getCurrentDealer } from '@/lib/auth/get-current-dealer';

export async function saveDashboardConfig(config: WidgetConfig[]) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Get dealer via team_members
  const dealer = await getCurrentDealer();

  if (!dealer) {
    throw new Error('Dealer not found');
  }

  const { error } = await supabase
    .from('dealers')
    .update({ dashboard_config: { widgets: config } })
    .eq('id', dealer.id);

  if (error) {
    console.error('Failed to save dashboard config:', error);
    throw new Error('Failed to save configuration');
  }

  revalidatePath('/[locale]/dashboard', 'page');
}
