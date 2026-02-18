import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';
import { invoiceOverdueEmail, InvoiceOverdueEmailData } from '@/lib/email/templates';

export const dynamic = 'force-dynamic';

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

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all dealers with invoice overdue notifications enabled
    const { data: dealers, error: dealersError } = await getSupabase()
      .from('dealers')
      .select('*')
      .eq('notification_invoice_overdue', true);

    if (dealersError) {
      console.error('Error fetching dealers:', dealersError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!dealers || dealers.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No dealers with invoice overdue notifications enabled',
        sent: 0 
      });
    }

    const results: { dealer: string; success: boolean; invoiceCount: number; error?: string }[] = [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    for (const dealer of dealers) {
      try {
        // Get invoices that are overdue (due_date < today, status = sent)
        const { data: overdueInvoices, error: invoicesError } = await getSupabase()
          .from('invoices')
          .select(`
            id,
            invoice_number,
            total,
            due_date,
            customers (
              first_name,
              last_name,
              company_name,
              customer_type
            )
          `)
          .eq('dealer_id', dealer.id)
          .eq('status', 'sent')
          .not('due_date', 'is', null)
          .lt('due_date', todayStr)
          .order('due_date', { ascending: true });

        if (invoicesError) {
          console.error(`Error fetching invoices for dealer ${dealer.id}:`, invoicesError);
          results.push({ 
            dealer: dealer.company_name, 
            success: false, 
            invoiceCount: 0,
            error: invoicesError.message 
          });
          continue;
        }

        if (!overdueInvoices || overdueInvoices.length === 0) {
          results.push({ 
            dealer: dealer.company_name, 
            success: true, 
            invoiceCount: 0 
          });
          continue;
        }

        // Rate limiting: Only send reminders weekly per invoice
        // Check if we sent a reminder for any of these invoices in the last 7 days
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { data: recentlySent } = await getSupabase()
          .from('notification_log')
          .select('reference_id')
          .eq('dealer_id', dealer.id)
          .eq('notification_type', 'invoice_overdue')
          .gte('sent_at', sevenDaysAgo.toISOString());

        const recentlySentIds = new Set((recentlySent || []).map(n => n.reference_id));
        const newOverdueInvoices = overdueInvoices.filter(inv => !recentlySentIds.has(inv.id));

        if (newOverdueInvoices.length === 0) {
          results.push({ 
            dealer: dealer.company_name, 
            success: true, 
            invoiceCount: 0,
            error: 'Already sent this week' 
          });
          continue;
        }

        // Build email data
        const emailData: InvoiceOverdueEmailData = {
          dealerName: dealer.contact_name || dealer.company_name,
          invoices: newOverdueInvoices.map(inv => {
            // Supabase may return single object or array depending on relation
            const customerData = inv.customers;
            const customer = Array.isArray(customerData) ? customerData[0] : customerData as { first_name: string; last_name: string; company_name: string | null; customer_type: string } | null;
            const customerName = customer?.customer_type === 'company' && customer?.company_name
              ? customer.company_name
              : customer ? `${customer.first_name} ${customer.last_name}` : 'Unbekannt';
            
            const dueDate = new Date(inv.due_date);
            const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
            
            return {
              id: inv.id,
              invoiceNumber: inv.invoice_number,
              customerName,
              total: inv.total,
              dueDate: inv.due_date,
              daysOverdue,
            };
          }),
          dashboardUrl: `${APP_URL}/dashboard/invoices`,
          settingsUrl: `${APP_URL}/dashboard/settings`,
          unsubscribeUrl: `${APP_URL}/api/notifications/unsubscribe?token=${dealer.notification_unsubscribe_token}&type=invoice_overdue`,
        };

        // Send email
        const result = await sendEmail({
          to: dealer.email,
          subject: `⚠️ ${newOverdueInvoices.length} Rechnung${newOverdueInvoices.length > 1 ? 'en' : ''} überfällig`,
          html: invoiceOverdueEmail(emailData),
        });

        // Log the notification
        if (result.success) {
          const logEntries = newOverdueInvoices.map(inv => ({
            dealer_id: dealer.id,
            notification_type: 'invoice_overdue',
            reference_id: inv.id,
            email_to: dealer.email,
            subject: `Invoice overdue reminder: ${inv.invoice_number}`,
          }));

          await getSupabase()
            .from('notification_log')
            .upsert(logEntries, { onConflict: 'dealer_id,notification_type,reference_id' });
        }

        results.push({ 
          dealer: dealer.company_name, 
          success: result.success,
          invoiceCount: newOverdueInvoices.length,
          error: result.success ? undefined : String(result.error)
        });

      } catch (error) {
        console.error(`Error processing dealer ${dealer.company_name}:`, error);
        results.push({ 
          dealer: dealer.company_name, 
          success: false, 
          invoiceCount: 0,
          error: String(error) 
        });
      }
    }

    const successCount = results.filter(r => r.success && r.invoiceCount > 0).length;
    const totalInvoices = results.reduce((sum, r) => sum + r.invoiceCount, 0);

    return NextResponse.json({ 
      success: true, 
      sent: successCount,
      totalInvoices,
      total: dealers.length,
      results 
    });

  } catch (error) {
    console.error('Error sending invoice overdue notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
