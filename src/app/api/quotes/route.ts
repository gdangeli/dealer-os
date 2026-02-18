import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { QuoteFormData, toRappen } from '@/types/billing';

// GET /api/quotes - List all quotes
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
      .from('quotes')
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

    const { data: quotes, error, count } = await query;

    if (error) {
      console.error('Error fetching quotes:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ quotes, total: count, limit, offset });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/quotes - Create a new quote
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: QuoteFormData = await request.json();

    // Validate required fields
    if (!body.customer_id) {
      return NextResponse.json({ error: 'Customer is required' }, { status: 400 });
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'At least one item is required' }, { status: 400 });
    }

    // Generate quote number
    const { data: quoteNumberData, error: numError } = await supabase
      .rpc('generate_quote_number', { p_dealer_id: user.id });

    if (numError) {
      console.error('Error generating quote number:', numError);
      return NextResponse.json({ error: 'Failed to generate quote number' }, { status: 500 });
    }

    // Calculate totals
    let subtotal = 0;
    const items = body.items.map((item, index) => {
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

    const discountAmount = body.discount_percent 
      ? Math.round(subtotal * (body.discount_percent / 100))
      : 0;
    const tradeInValue = body.trade_in_value ? toRappen(body.trade_in_value) : 0;
    const netAmount = subtotal - discountAmount - tradeInValue;
    const vatRate = 8.1;
    const vatAmount = Math.round(netAmount * (vatRate / 100));
    const total = netAmount + vatAmount;

    // Create quote
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        dealer_id: user.id,
        customer_id: body.customer_id,
        lead_id: body.lead_id || null,
        quote_number: quoteNumberData,
        status: 'draft',
        valid_until: body.valid_until || null,
        subtotal,
        discount_percent: body.discount_percent || 0,
        discount_amount: discountAmount,
        vat_rate: vatRate,
        vat_amount: vatAmount,
        total,
        trade_in_value: tradeInValue,
        trade_in_vehicle_id: body.trade_in_vehicle_id || null,
        trade_in_description: body.trade_in_description || null,
        internal_notes: body.internal_notes || null,
        customer_notes: body.customer_notes || null,
        terms: body.terms || null,
      })
      .select()
      .single();

    if (quoteError) {
      console.error('Error creating quote:', quoteError);
      return NextResponse.json({ error: quoteError.message }, { status: 500 });
    }

    // Create quote items
    const itemsWithQuoteId = items.map(item => ({
      ...item,
      quote_id: quote.id,
    }));

    const { error: itemsError } = await supabase
      .from('quote_items')
      .insert(itemsWithQuoteId);

    if (itemsError) {
      console.error('Error creating quote items:', itemsError);
      // Rollback quote
      await supabase.from('quotes').delete().eq('id', quote.id);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // Fetch complete quote with items
    const { data: completeQuote } = await supabase
      .from('quotes')
      .select(`
        *,
        customer:customers(id, first_name, last_name, company_name, customer_type),
        items:quote_items(*)
      `)
      .eq('id', quote.id)
      .single();

    return NextResponse.json({ quote: completeQuote }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
