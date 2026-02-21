import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { QuoteStatus } from '@/types/billing';
import { getCurrentDealer, getImpersonationInfo } from '@/lib/auth/get-current-dealer';

// GET /api/quotes/[id] - Get a single quote with items
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

    const { data: quote, error } = await queryClient
      .from('quotes')
      .select(`
        *,
        customer:customers(*),
        items:quote_items(*)
      `)
      .eq('id', id)
      .eq('dealer_id', dealer.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
      }
      console.error('Error fetching quote:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ quote });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/quotes/[id] - Update quote status or details
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
    const updateData: Record<string, unknown> = {};

    if (body.status) {
      updateData.status = body.status;
      
      // Set timestamps based on status
      if (body.status === 'sent') {
        updateData.sent_at = new Date().toISOString();
      } else if (body.status === 'accepted') {
        updateData.accepted_at = new Date().toISOString();
      } else if (body.status === 'rejected') {
        updateData.rejected_at = new Date().toISOString();
      }
    }

    if (body.valid_until !== undefined) updateData.valid_until = body.valid_until;
    if (body.internal_notes !== undefined) updateData.internal_notes = body.internal_notes;
    if (body.customer_notes !== undefined) updateData.customer_notes = body.customer_notes;
    if (body.terms !== undefined) updateData.terms = body.terms;
    if (body.discount_percent !== undefined) updateData.discount_percent = body.discount_percent;

    const { data: quote, error } = await queryClient
      .from('quotes')
      .update(updateData)
      .eq('id', id)
      .eq('dealer_id', dealer.id)
      .select(`
        *,
        customer:customers(*),
        items:quote_items(*)
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
      }
      console.error('Error updating quote:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ quote });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/quotes/[id] - Delete a quote (only drafts)
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

    // Check if quote is a draft
    const { data: existingQuote } = await queryClient
      .from('quotes')
      .select('status')
      .eq('id', id)
      .eq('dealer_id', dealer.id)
      .single();

    if (!existingQuote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    if (existingQuote.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft quotes can be deleted' },
        { status: 400 }
      );
    }

    // Delete quote (items will be cascade deleted)
    const { error } = await queryClient
      .from('quotes')
      .delete()
      .eq('id', id)
      .eq('dealer_id', dealer.id);

    if (error) {
      console.error('Error deleting quote:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
