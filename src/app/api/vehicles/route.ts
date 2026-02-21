import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentDealer, getImpersonationInfo } from '@/lib/auth/get-current-dealer';

// GET /api/vehicles - List all vehicles
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

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const location = searchParams.get('location');

    let query = queryClient
      .from('vehicles')
      .select('id, make, model, first_registration, asking_price, status')
      .eq('dealer_id', dealer.id)
      .order('make', { ascending: true });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (location && location !== 'all') {
      query = query.eq('location_id', location);
    }

    const { data: vehicles, error } = await query;

    if (error) {
      console.error('Error fetching vehicles:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ vehicles: vehicles || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
