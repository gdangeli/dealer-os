import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { toRappen } from '@/types/billing';

// GET /api/invoices/[id] - Get a single invoice with items
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

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(*),
        items:invoice_items(*),
        payments(*)
      `)
      .eq('id', id)
      .eq('dealer_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }
      console.error('Error fetching invoice:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/invoices/[id] - Update invoice status or record payment
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

    const body = await request.json();

    // Handle payment recording
    if (body.payment) {
      const paymentAmount = toRappen(body.payment.amount);
      
      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          invoice_id: id,
          amount: paymentAmount,
          payment_date: body.payment.payment_date || new Date().toISOString().split('T')[0],
          payment_method: body.payment.payment_method || null,
          reference: body.payment.reference || null,
          notes: body.payment.notes || null,
        });

      if (paymentError) {
        console.error('Error recording payment:', paymentError);
        return NextResponse.json({ error: paymentError.message }, { status: 500 });
      }

      // Get invoice and calculate new paid amount
      const { data: invoice } = await supabase
        .from('invoices')
        .select('total, paid_amount')
        .eq('id', id)
        .single();

      if (invoice) {
        const newPaidAmount = (invoice.paid_amount || 0) + paymentAmount;
        const newStatus = newPaidAmount >= invoice.total ? 'paid' : 'partial';
        
        await supabase
          .from('invoices')
          .update({ 
            paid_amount: newPaidAmount,
            status: newStatus,
            paid_at: newStatus === 'paid' ? new Date().toISOString() : null,
          })
          .eq('id', id);
      }
    }

    // Handle status update
    if (body.status) {
      const updateData: Record<string, unknown> = { status: body.status };
      
      if (body.status === 'sent') {
        updateData.sent_at = new Date().toISOString();
      } else if (body.status === 'paid') {
        updateData.paid_at = new Date().toISOString();
        // Get invoice total and set paid_amount
        const { data: invoice } = await supabase
          .from('invoices')
          .select('total')
          .eq('id', id)
          .single();
        if (invoice) {
          updateData.paid_amount = invoice.total;
        }
      }

      await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', id)
        .eq('dealer_id', user.id);
    }

    // Fetch updated invoice
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(*),
        items:invoice_items(*),
        payments(*)
      `)
      .eq('id', id)
      .eq('dealer_id', user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/invoices/[id] - Delete an invoice (only drafts)
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

    // Check if invoice is a draft
    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('status')
      .eq('id', id)
      .eq('dealer_id', user.id)
      .single();

    if (!existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (existingInvoice.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft invoices can be deleted' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)
      .eq('dealer_id', user.id);

    if (error) {
      console.error('Error deleting invoice:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
