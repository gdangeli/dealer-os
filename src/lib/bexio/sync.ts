/**
 * Bexio Sync Utilities
 * 
 * Handles synchronization of Customers and Invoices between DealerOS and Bexio.
 */

import { createClient } from '@/lib/supabase/server';
import { BexioClient, BexioContactCreate, BexioInvoiceCreate, createBexioClient } from './client';
import { encryptToken } from './crypto';
import { Customer, Invoice } from '@/types/billing';

// Country ID mapping (Bexio uses numeric IDs)
const COUNTRY_MAP: Record<string, number> = {
  'CH': 1,
  'DE': 2,
  'AT': 3,
  'FR': 4,
  'IT': 5,
  // Add more as needed
};

// Salutation ID mapping
const SALUTATION_MAP: Record<string, number> = {
  'Herr': 1,
  'Frau': 2,
  'Firma': 3,
};

export interface SyncResult {
  success: boolean;
  customersCreated: number;
  customersUpdated: number;
  invoicesCreated: number;
  invoicesUpdated: number;
  errors: string[];
}

/**
 * Get Bexio client for a dealer with automatic token persistence
 */
export async function getBexioClientForDealer(dealerId: string): Promise<BexioClient | null> {
  const supabase = await createClient();
  
  const { data: dealer, error } = await supabase
    .from('dealers')
    .select('id, bexio_access_token, bexio_refresh_token, bexio_token_expires_at')
    .eq('id', dealerId)
    .single();

  if (error || !dealer?.bexio_access_token) {
    console.error('[Bexio] Dealer not connected:', error?.message || 'No tokens');
    return null;
  }

  // Create client with token refresh callback
  return createBexioClient(dealer, async (newTokens) => {
    // Persist refreshed tokens to database
    await supabase
      .from('dealers')
      .update({
        bexio_access_token: newTokens.accessToken,
        bexio_refresh_token: newTokens.refreshToken,
        bexio_token_expires_at: newTokens.expiresAt.toISOString(),
      })
      .eq('id', dealerId);
  });
}

/**
 * Convert DealerOS customer to Bexio contact format
 */
function customerToBexioContact(customer: Customer): BexioContactCreate {
  const isCompany = customer.customer_type === 'company';
  
  return {
    contact_type_id: isCompany ? 1 : 2, // 1 = Company, 2 = Person
    name_1: isCompany ? (customer.company_name || customer.last_name) : customer.last_name,
    name_2: isCompany ? undefined : customer.first_name,
    salutation_id: customer.salutation ? SALUTATION_MAP[customer.salutation] : undefined,
    address: customer.street || undefined,
    postcode: customer.postal_code || undefined,
    city: customer.city || undefined,
    country_id: COUNTRY_MAP[customer.country] || 1, // Default to Switzerland
    mail: customer.email || undefined,
    phone_fixed: customer.phone || undefined,
    phone_mobile: customer.mobile || undefined,
  };
}

/**
 * Sync a single customer to Bexio
 */
export async function syncCustomerToBexio(
  client: BexioClient,
  customer: Customer
): Promise<{ bexioId: number; created: boolean }> {
  const bexioContact = customerToBexioContact(customer);

  if (customer.bexio_contact_id) {
    // Update existing contact
    const updated = await client.updateContact(customer.bexio_contact_id, bexioContact);
    return { bexioId: updated.id, created: false };
  } else {
    // Create new contact
    const created = await client.createContact(bexioContact);
    return { bexioId: created.id, created: true };
  }
}

/**
 * Sync all customers for a dealer to Bexio
 */
export async function syncAllCustomersToBexio(dealerId: string): Promise<{
  created: number;
  updated: number;
  errors: string[];
}> {
  const client = await getBexioClientForDealer(dealerId);
  if (!client) {
    return { created: 0, updated: 0, errors: ['Bexio nicht verbunden'] };
  }

  const supabase = await createClient();
  
  // Get all customers for this dealer
  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .eq('dealer_id', dealerId);

  if (error || !customers) {
    return { created: 0, updated: 0, errors: [error?.message || 'Kunde nicht gefunden'] };
  }

  let created = 0;
  let updated = 0;
  const errors: string[] = [];

  for (const customer of customers) {
    try {
      const result = await syncCustomerToBexio(client, customer as Customer);
      
      // Update customer with Bexio ID
      await supabase
        .from('customers')
        .update({
          bexio_contact_id: result.bexioId,
          bexio_synced_at: new Date().toISOString(),
        })
        .eq('id', customer.id);

      if (result.created) {
        created++;
      } else {
        updated++;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Kunde ${customer.first_name} ${customer.last_name}: ${message}`);
    }
  }

  return { created, updated, errors };
}

/**
 * Convert DealerOS invoice to Bexio invoice format
 */
function invoiceToBexioInvoice(
  invoice: Invoice & { items: Array<{ title: string; quantity: number; unit_price: number; description?: string | null }> },
  bexioContactId: number
): BexioInvoiceCreate {
  return {
    title: `Rechnung ${invoice.invoice_number}`,
    contact_id: bexioContactId,
    is_valid_from: invoice.invoice_date,
    is_valid_to: invoice.due_date || undefined,
    mwst_type: 0, // VAT exclusive
    mwst_is_net: true,
    api_reference: invoice.id, // Store DealerOS ID for reference
    positions: invoice.items.map(item => ({
      type: 'KbPositionCustom' as const,
      amount: item.quantity.toString(),
      unit_price: (item.unit_price / 100).toFixed(2), // Convert from Rappen to CHF
      text: item.title,
      tax_id: 16, // Standard Swiss VAT (adjust as needed)
    })),
  };
}

/**
 * Sync a single invoice to Bexio
 */
export async function syncInvoiceToBexio(
  client: BexioClient,
  invoice: Invoice & { items: Array<{ title: string; quantity: number; unit_price: number; description?: string | null }> },
  bexioContactId: number
): Promise<{ bexioId: number; created: boolean }> {
  const bexioInvoice = invoiceToBexioInvoice(invoice, bexioContactId);

  if (invoice.bexio_invoice_id) {
    // Bexio doesn't allow updating invoices, return existing
    return { bexioId: invoice.bexio_invoice_id, created: false };
  } else {
    // Create new invoice
    const created = await client.createInvoice(bexioInvoice);
    return { bexioId: created.id, created: true };
  }
}

/**
 * Sync all invoices for a dealer to Bexio
 */
export async function syncAllInvoicesToBexio(dealerId: string): Promise<{
  created: number;
  skipped: number;
  errors: string[];
}> {
  const client = await getBexioClientForDealer(dealerId);
  if (!client) {
    return { created: 0, skipped: 0, errors: ['Bexio nicht verbunden'] };
  }

  const supabase = await createClient();
  
  // Get all invoices with items and customers for this dealer
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select(`
      *,
      items:invoice_items(*),
      customer:customers(*)
    `)
    .eq('dealer_id', dealerId)
    .is('bexio_invoice_id', null); // Only sync invoices not yet synced

  if (error || !invoices) {
    return { created: 0, skipped: 0, errors: [error?.message || 'Rechnungen nicht gefunden'] };
  }

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const invoice of invoices) {
    try {
      // Check if customer has Bexio contact ID
      const customer = invoice.customer as Customer;
      if (!customer?.bexio_contact_id) {
        // Try to sync customer first
        const customerResult = await syncCustomerToBexio(client, customer);
        await supabase
          .from('customers')
          .update({
            bexio_contact_id: customerResult.bexioId,
            bexio_synced_at: new Date().toISOString(),
          })
          .eq('id', customer.id);
        customer.bexio_contact_id = customerResult.bexioId;
      }

      const result = await syncInvoiceToBexio(
        client,
        invoice as Invoice & { items: Array<{ title: string; quantity: number; unit_price: number; description?: string | null }> },
        customer.bexio_contact_id
      );
      
      // Update invoice with Bexio ID
      await supabase
        .from('invoices')
        .update({
          bexio_invoice_id: result.bexioId,
          bexio_synced_at: new Date().toISOString(),
        })
        .eq('id', invoice.id);

      if (result.created) {
        created++;
      } else {
        skipped++;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Rechnung ${invoice.invoice_number}: ${message}`);
    }
  }

  return { created, skipped, errors };
}

/**
 * Full sync: Customers and Invoices
 */
export async function fullBexioSync(dealerId: string): Promise<SyncResult> {
  const errors: string[] = [];
  
  // Sync customers first
  const customerResult = await syncAllCustomersToBexio(dealerId);
  errors.push(...customerResult.errors);

  // Then sync invoices
  const invoiceResult = await syncAllInvoicesToBexio(dealerId);
  errors.push(...invoiceResult.errors);

  // Update last sync timestamp
  const supabase = await createClient();
  await supabase
    .from('dealers')
    .update({ bexio_last_sync_at: new Date().toISOString() })
    .eq('id', dealerId);

  return {
    success: errors.length === 0,
    customersCreated: customerResult.created,
    customersUpdated: customerResult.updated,
    invoicesCreated: invoiceResult.created,
    invoicesUpdated: invoiceResult.skipped,
    errors,
  };
}
