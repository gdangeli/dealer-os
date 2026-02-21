import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { CustomerFormData } from '@/types/billing';
import { getCurrentDealer, getImpersonationInfo } from '@/lib/auth/get-current-dealer';

// GET /api/customers/[id] - Get a single customer
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

    const { data: customer, error } = await queryClient
      .from('customers')
      .select('*')
      .eq('id', id)
      .eq('dealer_id', dealer.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }
      console.error('Error fetching customer:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ customer });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/customers/[id] - Update a customer
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

    const body: Partial<CustomerFormData> = await request.json();

    // Validate if company type
    if (body.customer_type === 'company' && !body.company_name) {
      return NextResponse.json(
        { error: 'Company name is required for company customers' },
        { status: 400 }
      );
    }

    const { data: customer, error } = await queryClient
      .from('customers')
      .update({
        customer_type: body.customer_type,
        company_name: body.company_name || null,
        salutation: body.salutation,
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email || null,
        phone: body.phone || null,
        mobile: body.mobile || null,
        street: body.street || null,
        postal_code: body.postal_code || null,
        city: body.city || null,
        country: body.country || 'CH',
        location_id: body.location_id || null,
      })
      .eq('id', id)
      .eq('dealer_id', dealer.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }
      console.error('Error updating customer:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ customer });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/customers/[id] - Delete a customer
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

    // Check if customer has quotes or invoices
    const { count: quoteCount } = await queryClient
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', id);

    const { count: invoiceCount } = await queryClient
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', id);

    if ((quoteCount && quoteCount > 0) || (invoiceCount && invoiceCount > 0)) {
      return NextResponse.json(
        { error: 'Cannot delete customer with existing quotes or invoices' },
        { status: 400 }
      );
    }

    const { error } = await queryClient
      .from('customers')
      .delete()
      .eq('id', id)
      .eq('dealer_id', dealer.id);

    if (error) {
      console.error('Error deleting customer:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
