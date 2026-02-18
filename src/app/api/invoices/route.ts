import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { toRappen } from '@/types/billing';

// GET /api/invoices - List all invoices
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const customerId = searchParams.get('customer_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(id, first_name, last_name, company_name, customer_type)
      `, { count: 'exact' })
      .eq('dealer_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }
    if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    const { data: invoices, error, count } = await query;

    if (error) {
      console.error('Error fetching invoices:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ invoices, total: count, limit, offset });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/invoices - Create a new invoice (or from quote)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // If creating from quote
    if (body.quote_id) {
      // Fetch quote with items
      const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .select(`*, items:quote_items(*)`)
        .eq('id', body.quote_id)
        .eq('dealer_id', user.id)
        .single();

      if (quoteError || !quote) {
        return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
      }

      if (quote.status !== 'accepted') {
        return NextResponse.json({ error: 'Quote must be accepted to convert to invoice' }, { status: 400 });
      }

      // Generate invoice number
      const { data: invoiceNumber } = await supabase
        .rpc('generate_invoice_number', { p_dealer_id: user.id });

      // Calculate due date (30 days from now)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      // Create invoice from quote
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          dealer_id: user.id,
          customer_id: quote.customer_id,
          quote_id: quote.id,
          invoice_number: invoiceNumber,
          status: 'draft',
          invoice_date: new Date().toISOString().split('T')[0],
          due_date: dueDate.toISOString().split('T')[0],
          subtotal: quote.subtotal,
          discount_amount: quote.discount_amount,
          trade_in_value: quote.trade_in_value,
          vat_rate: quote.vat_rate,
          vat_amount: quote.vat_amount,
          total: quote.total,
          payment_terms: '30 Tage netto',
        })
        .select()
        .single();

      if (invoiceError) {
        console.error('Error creating invoice:', invoiceError);
        return NextResponse.json({ error: invoiceError.message }, { status: 500 });
      }

      // Copy quote items to invoice items
      if (quote.items && quote.items.length > 0) {
        const invoiceItems = quote.items.map((item: any) => ({
          invoice_id: invoice.id,
          position: item.position,
          item_type: item.item_type,
          title: item.title,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percent: item.discount_percent,
          total: item.total,
          vehicle_id: item.vehicle_id,
        }));

        await supabase.from('invoice_items').insert(invoiceItems);
      }

      // Update quote status to invoiced
      await supabase
        .from('quotes')
        .update({ status: 'invoiced' })
        .eq('id', quote.id);

      // Fetch complete invoice
      const { data: completeInvoice } = await supabase
        .from('invoices')
        .select(`
          *,
          customer:customers(*),
          items:invoice_items(*)
        `)
        .eq('id', invoice.id)
        .single();

      return NextResponse.json({ invoice: completeInvoice }, { status: 201 });
    }

    // Manual invoice creation
    if (!body.customer_id) {
      return NextResponse.json({ error: 'Customer is required' }, { status: 400 });
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'At least one item is required' }, { status: 400 });
    }

    // Generate invoice number
    const { data: invoiceNumber } = await supabase
      .rpc('generate_invoice_number', { p_dealer_id: user.id });

    // Calculate totals
    let subtotal = 0;
    const items = body.items.map((item: any, index: number) => {
      const unitPriceRappen = toRappen(item.unit_price);
      const itemTotal = Math.round(unitPriceRappen * item.quantity * (1 - (item.discount_percent || 0) / 100));
      subtotal += itemTotal;
      return {
        position: index + 1,
        item_type: item.item_type,
        title: item.title,
        description: item.description || null,
        quantity: item.quantity,
        unit_price: unitPriceRappen,
        discount_percent: item.discount_percent || 0,
        total: itemTotal,
        vehicle_id: item.vehicle_id || null,
      };
    });

    const discountAmount = body.discount_amount ? toRappen(body.discount_amount) : 0;
    const tradeInValue = body.trade_in_value ? toRappen(body.trade_in_value) : 0;
    const netAmount = subtotal - discountAmount - tradeInValue;
    const vatRate = 8.1;
    const vatAmount = Math.round(netAmount * (vatRate / 100));
    const total = netAmount + vatAmount;

    // Default due date (30 days)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        dealer_id: user.id,
        customer_id: body.customer_id,
        invoice_number: invoiceNumber,
        status: 'draft',
        invoice_date: body.invoice_date || new Date().toISOString().split('T')[0],
        due_date: body.due_date || dueDate.toISOString().split('T')[0],
        subtotal,
        discount_amount: discountAmount,
        trade_in_value: tradeInValue,
        vat_rate: vatRate,
        vat_amount: vatAmount,
        total,
        payment_terms: body.payment_terms || '30 Tage netto',
      })
      .select()
      .single();

    if (invoiceError) {
      console.error('Error creating invoice:', invoiceError);
      return NextResponse.json({ error: invoiceError.message }, { status: 500 });
    }

    // Create invoice items
    const itemsWithInvoiceId = items.map((item: any) => ({
      ...item,
      invoice_id: invoice.id,
    }));

    await supabase.from('invoice_items').insert(itemsWithInvoiceId);

    // Fetch complete invoice
    const { data: completeInvoice } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(*),
        items:invoice_items(*)
      `)
      .eq('id', invoice.id)
      .single();

    return NextResponse.json({ invoice: completeInvoice }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
