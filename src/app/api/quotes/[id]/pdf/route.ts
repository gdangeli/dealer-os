import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { QuotePDF } from '@/components/pdf/QuotePDF';

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

    // Fetch quote with customer and items
    const { data: quote, error } = await supabase
      .from('quotes')
      .select(`
        *,
        customer:customers(*),
        items:quote_items(*)
      `)
      .eq('id', id)
      .eq('dealer_id', user.id)
      .single();

    if (error || !quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Fetch dealer info for company name
    const { data: dealer } = await supabase
      .from('dealers')
      .select('company_name, address, city, postal_code')
      .eq('id', user.id)
      .single();

    const companyAddress = dealer?.address 
      ? `${dealer.address}\n${dealer.postal_code || ''} ${dealer.city || ''}`
      : undefined;

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      QuotePDF({ 
        quote, 
        companyName: dealer?.company_name || 'Ihre Garage',
        companyAddress 
      })
    );

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${quote.quote_number}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
