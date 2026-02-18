/**
 * Centralized notification system for DealerOS
 * All notification functions check dealer preferences before sending
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';
import {
  newLeadEmail,
  NewLeadEmailData,
  longstandingWarningEmail,
  LongstandingWarningEmailData,
  quoteAcceptedEmail,
  QuoteAcceptedEmailData,
  invoiceOverdueEmail,
  InvoiceOverdueEmailData,
  leadStatusChangeEmail,
  LeadStatusChangeEmailData,
} from '@/lib/email/templates';

// Lazy initialization to avoid build-time errors
let _supabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabase;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://dealer-os.ch';

// ============================================================================
// Types
// ============================================================================

export type NotificationType = 
  | 'new_lead'
  | 'lead_status_change'
  | 'vehicle_standzeit_warning'
  | 'quote_accepted'
  | 'invoice_overdue'
  | 'quote_expiry'
  | 'daily_summary';

export interface NotificationResult {
  success: boolean;
  sent: boolean;
  message?: string;
  error?: string;
}

export interface Lead {
  id?: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  vehicle_id?: string | null;
  source?: string | null;
  status?: string | null;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  acquired_at: string;
  asking_price?: number | null;
  purchase_price?: number | null;
}

export interface Quote {
  id: string;
  quote_number: string;
  total: number;
  customer_id: string;
  customer_name?: string;
  vehicle_make?: string;
  vehicle_model?: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  total: number;
  due_date: string;
  customer_id: string;
  customer_name?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

async function getDealerPreferences(dealerId: string) {
  const { data: dealer, error } = await getSupabase()
    .from('dealers')
    .select('*')
    .eq('id', dealerId)
    .single();

  if (error || !dealer) {
    console.error('Dealer not found:', error);
    return null;
  }

  return dealer;
}

async function logNotification(
  dealerId: string,
  notificationType: NotificationType,
  referenceId: string | null,
  emailTo: string,
  subject: string
) {
  try {
    await getSupabase()
      .from('notification_log')
      .upsert({
        dealer_id: dealerId,
        notification_type: notificationType,
        reference_id: referenceId,
        email_to: emailTo,
        subject,
      }, { onConflict: 'dealer_id,notification_type,reference_id' });
  } catch (error) {
    console.error('Failed to log notification:', error);
  }
}

function getSettingsUrl(dealerId: string) {
  return `${APP_URL}/dashboard/settings`;
}

function getUnsubscribeUrl(token: string | null, type: NotificationType) {
  if (!token) return undefined;
  return `${APP_URL}/api/notifications/unsubscribe?token=${token}&type=${type}`;
}

// ============================================================================
// Notification Functions
// ============================================================================

/**
 * Send notification for a new lead
 * Checks: notification_new_lead preference
 */
export async function sendNewLeadNotification(
  dealerId: string,
  lead: Lead
): Promise<NotificationResult> {
  try {
    const dealer = await getDealerPreferences(dealerId);
    if (!dealer) {
      return { success: false, sent: false, error: 'Dealer not found' };
    }

    // Check if notification is enabled
    if (!dealer.notification_new_lead) {
      return { success: true, sent: false, message: 'Notification disabled by dealer' };
    }

    // Get vehicle info if available
    let vehicleMake: string | undefined;
    let vehicleModel: string | undefined;

    if (lead.vehicle_id) {
      const { data: vehicle } = await getSupabase()
        .from('vehicles')
        .select('make, model')
        .eq('id', lead.vehicle_id)
        .single();

      if (vehicle) {
        vehicleMake = vehicle.make;
        vehicleModel = vehicle.model;
      }
    }

    const emailData: NewLeadEmailData = {
      dealerName: dealer.contact_name || dealer.company_name,
      leadName: lead.name,
      leadEmail: lead.email || undefined,
      leadPhone: lead.phone || undefined,
      leadMessage: lead.message || undefined,
      vehicleMake,
      vehicleModel,
      vehicleId: lead.vehicle_id || undefined,
      source: lead.source || undefined,
      dashboardUrl: `${APP_URL}/dashboard/leads`,
      settingsUrl: getSettingsUrl(dealerId),
      unsubscribeUrl: getUnsubscribeUrl(dealer.notification_unsubscribe_token, 'new_lead'),
    };

    const subject = `🎉 Neue Anfrage von ${lead.name}`;
    const result = await sendEmail({
      to: dealer.email,
      subject,
      html: newLeadEmail(emailData),
    });

    if (result.success) {
      await logNotification(dealerId, 'new_lead', lead.id || null, dealer.email, subject);
    }

    return { success: true, sent: result.success, error: result.success ? undefined : String(result.error) };
  } catch (error) {
    console.error('Error sending new lead notification:', error);
    return { success: false, sent: false, error: String(error) };
  }
}

/**
 * Send notification for lead status change
 * Checks: notification_new_lead preference (same setting)
 */
export async function sendLeadStatusChangeNotification(
  dealerId: string,
  lead: Lead,
  oldStatus: string,
  newStatus: string
): Promise<NotificationResult> {
  try {
    const dealer = await getDealerPreferences(dealerId);
    if (!dealer) {
      return { success: false, sent: false, error: 'Dealer not found' };
    }

    // Use the same preference as new_lead for now
    if (!dealer.notification_new_lead) {
      return { success: true, sent: false, message: 'Notification disabled by dealer' };
    }

    // Get vehicle info if available
    let vehicleInfo: string | undefined;
    if (lead.vehicle_id) {
      const { data: vehicle } = await getSupabase()
        .from('vehicles')
        .select('make, model')
        .eq('id', lead.vehicle_id)
        .single();

      if (vehicle) {
        vehicleInfo = `${vehicle.make} ${vehicle.model}`;
      }
    }

    const emailData: LeadStatusChangeEmailData = {
      dealerName: dealer.contact_name || dealer.company_name,
      leadName: lead.name,
      leadEmail: lead.email || undefined,
      leadPhone: lead.phone || undefined,
      oldStatus,
      newStatus,
      vehicleInfo,
      dashboardUrl: `${APP_URL}/dashboard/leads${lead.id ? `/${lead.id}` : ''}`,
      settingsUrl: getSettingsUrl(dealerId),
      unsubscribeUrl: getUnsubscribeUrl(dealer.notification_unsubscribe_token, 'lead_status_change'),
    };

    const subject = `📊 Lead Status geändert: ${lead.name} → ${newStatus}`;
    const result = await sendEmail({
      to: dealer.email,
      subject,
      html: leadStatusChangeEmail(emailData),
    });

    if (result.success) {
      await logNotification(dealerId, 'lead_status_change', lead.id || null, dealer.email, subject);
    }

    return { success: true, sent: result.success, error: result.success ? undefined : String(result.error) };
  } catch (error) {
    console.error('Error sending lead status change notification:', error);
    return { success: false, sent: false, error: String(error) };
  }
}

/**
 * Send warning for vehicles with long standzeit (30/60/90 days)
 * Checks: notification_longstanding_days preference
 */
export async function sendStandzeitWarning(
  dealerId: string,
  vehicle: Vehicle,
  days: number
): Promise<NotificationResult> {
  try {
    const dealer = await getDealerPreferences(dealerId);
    if (!dealer) {
      return { success: false, sent: false, error: 'Dealer not found' };
    }

    // Check threshold - if dealer threshold is higher than days, skip
    const thresholdDays = dealer.notification_longstanding_days || 60;
    if (days < thresholdDays) {
      return { success: true, sent: false, message: `Days (${days}) below threshold (${thresholdDays})` };
    }

    const emailData: LongstandingWarningEmailData = {
      dealerName: dealer.contact_name || dealer.company_name,
      vehicles: [{
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        daysInStock: days,
        askingPrice: vehicle.asking_price || undefined,
        purchasePrice: vehicle.purchase_price || undefined,
      }],
      thresholdDays: days,
      dashboardUrl: `${APP_URL}/dashboard/vehicles/${vehicle.id}`,
      settingsUrl: getSettingsUrl(dealerId),
      unsubscribeUrl: getUnsubscribeUrl(dealer.notification_unsubscribe_token, 'vehicle_standzeit_warning'),
    };

    const subject = `⚠️ Langsteher-Warnung: ${vehicle.make} ${vehicle.model} - ${days} Tage im Bestand`;
    const result = await sendEmail({
      to: dealer.email,
      subject,
      html: longstandingWarningEmail(emailData),
    });

    if (result.success) {
      await logNotification(dealerId, 'vehicle_standzeit_warning', vehicle.id, dealer.email, subject);
    }

    return { success: true, sent: result.success, error: result.success ? undefined : String(result.error) };
  } catch (error) {
    console.error('Error sending standzeit warning:', error);
    return { success: false, sent: false, error: String(error) };
  }
}

/**
 * Send notification when a quote is accepted
 * Checks: notification_quote_expiry preference
 */
export async function sendQuoteAccepted(
  dealerId: string,
  quote: Quote
): Promise<NotificationResult> {
  try {
    const dealer = await getDealerPreferences(dealerId);
    if (!dealer) {
      return { success: false, sent: false, error: 'Dealer not found' };
    }

    // Use quote_expiry preference for quote notifications
    if (!dealer.notification_quote_expiry) {
      return { success: true, sent: false, message: 'Notification disabled by dealer' };
    }

    // Get customer info if not provided
    let customerName = quote.customer_name;
    if (!customerName && quote.customer_id) {
      const { data: customer } = await getSupabase()
        .from('customers')
        .select('first_name, last_name, company_name, customer_type')
        .eq('id', quote.customer_id)
        .single();

      if (customer) {
        customerName = customer.customer_type === 'company' && customer.company_name
          ? customer.company_name
          : `${customer.first_name} ${customer.last_name}`;
      }
    }

    const emailData: QuoteAcceptedEmailData = {
      dealerName: dealer.contact_name || dealer.company_name,
      quoteNumber: quote.quote_number,
      customerName: customerName || 'Unbekannt',
      total: quote.total,
      vehicleMake: quote.vehicle_make,
      vehicleModel: quote.vehicle_model,
      dashboardUrl: `${APP_URL}/dashboard/quotes/${quote.id}`,
      settingsUrl: getSettingsUrl(dealerId),
      unsubscribeUrl: getUnsubscribeUrl(dealer.notification_unsubscribe_token, 'quote_accepted'),
    };

    const subject = `✅ Offerte ${quote.quote_number} wurde angenommen!`;
    const result = await sendEmail({
      to: dealer.email,
      subject,
      html: quoteAcceptedEmail(emailData),
    });

    if (result.success) {
      await logNotification(dealerId, 'quote_accepted', quote.id, dealer.email, subject);
    }

    return { success: true, sent: result.success, error: result.success ? undefined : String(result.error) };
  } catch (error) {
    console.error('Error sending quote accepted notification:', error);
    return { success: false, sent: false, error: String(error) };
  }
}

/**
 * Send notification for overdue invoices
 * Checks: notification_invoice_overdue preference
 */
export async function sendInvoiceOverdue(
  dealerId: string,
  invoice: Invoice
): Promise<NotificationResult> {
  try {
    const dealer = await getDealerPreferences(dealerId);
    if (!dealer) {
      return { success: false, sent: false, error: 'Dealer not found' };
    }

    if (!dealer.notification_invoice_overdue) {
      return { success: true, sent: false, message: 'Notification disabled by dealer' };
    }

    // Calculate days overdue
    const dueDate = new Date(invoice.due_date);
    const now = new Date();
    const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysOverdue <= 0) {
      return { success: true, sent: false, message: 'Invoice not yet overdue' };
    }

    // Get customer info if not provided
    let customerName = invoice.customer_name;
    if (!customerName && invoice.customer_id) {
      const { data: customer } = await getSupabase()
        .from('customers')
        .select('first_name, last_name, company_name, customer_type')
        .eq('id', invoice.customer_id)
        .single();

      if (customer) {
        customerName = customer.customer_type === 'company' && customer.company_name
          ? customer.company_name
          : `${customer.first_name} ${customer.last_name}`;
      }
    }

    const emailData: InvoiceOverdueEmailData = {
      dealerName: dealer.contact_name || dealer.company_name,
      invoices: [{
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        customerName: customerName || 'Unbekannt',
        total: invoice.total,
        dueDate: invoice.due_date,
        daysOverdue,
      }],
      dashboardUrl: `${APP_URL}/dashboard/invoices/${invoice.id}`,
      settingsUrl: getSettingsUrl(dealerId),
      unsubscribeUrl: getUnsubscribeUrl(dealer.notification_unsubscribe_token, 'invoice_overdue') || '',
    };

    const subject = `⚠️ Rechnung ${invoice.invoice_number} ist ${daysOverdue} Tage überfällig`;
    const result = await sendEmail({
      to: dealer.email,
      subject,
      html: invoiceOverdueEmail(emailData),
    });

    if (result.success) {
      await logNotification(dealerId, 'invoice_overdue', invoice.id, dealer.email, subject);
    }

    return { success: true, sent: result.success, error: result.success ? undefined : String(result.error) };
  } catch (error) {
    console.error('Error sending invoice overdue notification:', error);
    return { success: false, sent: false, error: String(error) };
  }
}

// ============================================================================
// Batch Operations (for cron jobs)
// ============================================================================

/**
 * Check all dealers for vehicles with standzeit warnings
 * Use thresholds: 30, 60, 90 days
 */
export async function checkAllStandzeitWarnings(): Promise<{
  success: boolean;
  results: Array<{ dealerId: string; vehicleId: string; days: number; sent: boolean }>;
}> {
  const results: Array<{ dealerId: string; vehicleId: string; days: number; sent: boolean }> = [];
  const thresholds = [30, 60, 90];

  try {
    const { data: dealers } = await getSupabase()
      .from('dealers')
      .select('id, notification_longstanding_days');

    if (!dealers) return { success: true, results };

    for (const dealer of dealers) {
      const thresholdDays = dealer.notification_longstanding_days || 60;
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() - thresholdDays);

      const { data: vehicles } = await getSupabase()
        .from('vehicles')
        .select('id, make, model, acquired_at, asking_price, purchase_price')
        .eq('dealer_id', dealer.id)
        .eq('status', 'in_stock')
        .lte('acquired_at', thresholdDate.toISOString());

      if (!vehicles) continue;

      for (const vehicle of vehicles) {
        const acquiredDate = new Date(vehicle.acquired_at);
        const days = Math.floor((Date.now() - acquiredDate.getTime()) / (1000 * 60 * 60 * 24));

        // Check if days matches any threshold
        const matchingThreshold = thresholds.find(t => days >= t && days < t + 7);
        if (matchingThreshold) {
          const result = await sendStandzeitWarning(dealer.id, vehicle, days);
          results.push({
            dealerId: dealer.id,
            vehicleId: vehicle.id,
            days,
            sent: result.sent,
          });
        }
      }
    }

    return { success: true, results };
  } catch (error) {
    console.error('Error in batch standzeit check:', error);
    return { success: false, results };
  }
}

// Re-export for convenience
export { triggerNewLeadNotification } from './trigger';
