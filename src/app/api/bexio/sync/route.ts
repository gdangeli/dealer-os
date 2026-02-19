/**
 * Bexio Sync Route
 * 
 * Triggers manual synchronization of customers and invoices to Bexio.
 * 
 * POST /api/bexio/sync
 * Body: { type: 'full' | 'customers' | 'invoices' }
 */

import { createClient } from '@/lib/supabase/server';
import { 
  fullBexioSync, 
  syncAllCustomersToBexio, 
  syncAllInvoicesToBexio,
  getBexioClientForDealer 
} from '@/lib/bexio/sync';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentDealer } from '@/lib/auth/get-current-dealer';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    // Get dealer via team_members
    const dealerWithRole = await getCurrentDealer();
    if (!dealerWithRole) {
      return NextResponse.json(
        { error: 'Händler nicht gefunden' },
        { status: 404 }
      );
    }
    
    // Get Bexio connection status
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('id, bexio_is_connected')
      .eq('id', dealerWithRole.id)
      .single();

    if (dealerError || !dealer) {
      return NextResponse.json(
        { error: 'Händler nicht gefunden' },
        { status: 404 }
      );
    }

    // Check if Bexio is connected
    if (!dealer.bexio_is_connected) {
      return NextResponse.json(
        { error: 'Bexio ist nicht verbunden' },
        { status: 400 }
      );
    }

    // Parse request body
    let syncType = 'full';
    try {
      const body = await request.json();
      syncType = body.type || 'full';
    } catch {
      // Default to full sync if no body
    }

    // Verify we can connect to Bexio
    const client = await getBexioClientForDealer(dealer.id);
    if (!client) {
      // Update dealer record to reflect disconnected state
      await supabase
        .from('dealers')
        .update({
          bexio_is_connected: false,
          bexio_last_error: 'Token ungültig oder abgelaufen',
        })
        .eq('id', dealer.id);

      return NextResponse.json(
        { error: 'Bexio-Verbindung ungültig. Bitte verbinden Sie sich erneut.' },
        { status: 400 }
      );
    }

    // Run sync based on type
    let result;
    
    switch (syncType) {
      case 'customers':
        const customerResult = await syncAllCustomersToBexio(dealer.id);
        result = {
          success: customerResult.errors.length === 0,
          customersCreated: customerResult.created,
          customersUpdated: customerResult.updated,
          invoicesCreated: 0,
          invoicesUpdated: 0,
          errors: customerResult.errors,
        };
        break;
        
      case 'invoices':
        const invoiceResult = await syncAllInvoicesToBexio(dealer.id);
        result = {
          success: invoiceResult.errors.length === 0,
          customersCreated: 0,
          customersUpdated: 0,
          invoicesCreated: invoiceResult.created,
          invoicesUpdated: invoiceResult.skipped,
          errors: invoiceResult.errors,
        };
        break;
        
      case 'full':
      default:
        result = await fullBexioSync(dealer.id);
        break;
    }

    // Update last sync timestamp and error status
    await supabase
      .from('dealers')
      .update({
        bexio_last_sync_at: new Date().toISOString(),
        bexio_last_error: result.errors.length > 0 ? result.errors.join('; ') : null,
      })
      .eq('id', dealer.id);

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Synchronisation erfolgreich' : 'Synchronisation mit Fehlern abgeschlossen',
      stats: {
        customersCreated: result.customersCreated,
        customersUpdated: result.customersUpdated,
        invoicesCreated: result.invoicesCreated,
        invoicesUpdated: result.invoicesUpdated,
      },
      errors: result.errors,
    });

  } catch (error) {
    console.error('[Bexio Sync] Error:', error);
    
    // Try to log the error to the dealer record
    try {
      const dealerForError = await getCurrentDealer();
      if (dealerForError) {
        const supabase = await createClient();
        await supabase
          .from('dealers')
          .update({
            bexio_last_error: error instanceof Error ? error.message : 'Unbekannter Fehler',
          })
          .eq('id', dealerForError.id);
      }
    } catch {
      // Ignore logging errors
    }

    return NextResponse.json(
      { 
        error: 'Synchronisation fehlgeschlagen',
        message: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bexio/sync - Get sync status
 */
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    // Get dealer via team_members
    const dealerWithRole = await getCurrentDealer();
    if (!dealerWithRole) {
      return NextResponse.json(
        { error: 'Händler nicht gefunden' },
        { status: 404 }
      );
    }

    // Get dealer with Bexio info
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('bexio_is_connected, bexio_company_name, bexio_connected_at, bexio_last_sync_at, bexio_last_error')
      .eq('id', dealerWithRole.id)
      .single();

    if (dealerError || !dealer) {
      return NextResponse.json(
        { error: 'Händler nicht gefunden' },
        { status: 404 }
      );
    }

    const dealerId = dealerWithRole.id;

    // Get sync statistics
    const { count: totalCustomers } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('dealer_id', dealerId);

    const { count: syncedCustomers } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('dealer_id', dealerId)
      .not('bexio_contact_id', 'is', null);

    const { count: totalInvoices } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('dealer_id', dealerId);

    const { count: syncedInvoices } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('dealer_id', dealerId)
      .not('bexio_invoice_id', 'is', null);

    return NextResponse.json({
      isConnected: dealer.bexio_is_connected || false,
      companyName: dealer.bexio_company_name,
      connectedAt: dealer.bexio_connected_at,
      lastSyncAt: dealer.bexio_last_sync_at,
      lastError: dealer.bexio_last_error,
      stats: {
        customers: {
          total: totalCustomers || 0,
          synced: syncedCustomers || 0,
        },
        invoices: {
          total: totalInvoices || 0,
          synced: syncedInvoices || 0,
        },
      },
    });

  } catch (error) {
    console.error('[Bexio Sync Status] Error:', error);
    return NextResponse.json(
      { error: 'Status konnte nicht abgerufen werden' },
      { status: 500 }
    );
  }
}
