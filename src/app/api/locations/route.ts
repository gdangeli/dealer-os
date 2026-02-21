import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentDealer, getImpersonationInfo } from '@/lib/auth/get-current-dealer';

// GET /api/locations - List all locations
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get dealer with impersonation support
    const dealer = await getCurrentDealer();
    if (!dealer) {
      return NextResponse.json({ error: 'Dealer not found' }, { status: 404 });
    }

    // Use admin client when impersonating to bypass RLS
    const impersonation = await getImpersonationInfo();
    const queryClient = impersonation ? createAdminClient() : supabase;

    const { data: locations, error } = await queryClient
      .from('locations')
      .select('*')
      .eq('dealer_id', dealer.id)
      .order('is_main', { ascending: false })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching locations:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ locations: locations || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
