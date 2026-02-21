import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentDealer, getImpersonationInfo } from '@/lib/auth/get-current-dealer';

// GET /api/leads/[id] - Get a single lead
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const { data: lead, error } = await queryClient
      .from('leads')
      .select(`
        *,
        vehicle:vehicles(id, make, model, first_registration, asking_price)
      `)
      .eq('id', id)
      .eq('dealer_id', dealer.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      }
      console.error('Error fetching lead:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch activities
    const { data: activities } = await queryClient
      .from('lead_activities')
      .select('id, lead_id, type, created_at')
      .eq('lead_id', id);

    return NextResponse.json({ lead, activities: activities || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/leads/[id] - Update a lead
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.status !== undefined) updateData.status = body.status;
    if (body.first_name !== undefined) updateData.first_name = body.first_name;
    if (body.last_name !== undefined) updateData.last_name = body.last_name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.next_followup !== undefined) updateData.next_followup = body.next_followup;

    const { data: lead, error } = await queryClient
      .from('leads')
      .update(updateData)
      .eq('id', id)
      .eq('dealer_id', dealer.id)
      .select(`
        *,
        vehicle:vehicles(id, make, model, first_registration, asking_price)
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      }
      console.error('Error updating lead:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/leads/[id] - Delete a lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const { error } = await queryClient
      .from('leads')
      .delete()
      .eq('id', id)
      .eq('dealer_id', dealer.id);

    if (error) {
      console.error('Error deleting lead:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
