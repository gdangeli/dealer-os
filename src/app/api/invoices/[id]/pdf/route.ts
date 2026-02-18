import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoicePDF } from '@/components/pdf/InvoicePDF';

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

    // Fetch invoice with customer and items
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(*),
        items:invoice_items(*)
      `)
      .eq('id', id)
      .eq('dealer_id', user.id)
      .single();

    if (error || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Fetch dealer info
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
      <InvoicePDF 
        invoice={invoice}
        companyName={dealer?.company_name || 'Ihre Garage'}
        companyAddress={companyAddress}
        bankInfo={undefined}
      />
    );

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.invoice_number}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
