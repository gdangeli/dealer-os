import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentDealer, getImpersonationInfo } from '@/lib/auth/get-current-dealer';

// GET /api/leads - List all leads
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
    const locationFilter = searchParams.get('location');

    // Fetch leads with vehicles
    let query = queryClient
      .from('leads')
      .select(`
        *,
        vehicle:vehicles(id, make, model, first_registration, asking_price)
      `)
      .eq('dealer_id', dealer.id)
      .order('created_at', { ascending: false });
    
    if (locationFilter && locationFilter !== 'all') {
      query = query.eq('location_id', locationFilter);
    }
    
    const { data: leads, error } = await query;

    if (error) {
      console.error('Error fetching leads:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch activities for scoring
    const leadIds = leads?.map(l => l.id) || [];
    let activities: any[] = [];
    
    if (leadIds.length > 0) {
      const { data: activitiesData } = await queryClient
        .from('lead_activities')
        .select('id, lead_id, type, created_at')
        .in('lead_id', leadIds);
      activities = activitiesData || [];
    }

    return NextResponse.json({ 
      leads: leads || [],
      activities,
      dealerId: dealer.id
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/leads - Create a new lead
export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Validate required fields
    if (!body.first_name || !body.last_name) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    const { data: lead, error } = await queryClient
      .from('leads')
      .insert({
        dealer_id: dealer.id,
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email || null,
        phone: body.phone || null,
        source: body.source || 'other',
        vehicle_id: body.vehicle_id || null,
        location_id: body.location_id || null,
        message: body.message || null,
        notes: body.notes || null,
        status: 'new',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating lead:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
