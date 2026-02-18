import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';
import { quoteExpiryEmail, QuoteExpiryEmailData } from '@/lib/email/templates';

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

    // Get all dealers with quote expiry notifications enabled
    const { data: dealers, error: dealersError } = await getSupabase()
      .from('dealers')
      .select('*')
      .eq('notification_quote_expiry', true);

    if (dealersError) {
      console.error('Error fetching dealers:', dealersError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!dealers || dealers.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No dealers with quote expiry notifications enabled',
        sent: 0 
      });
    }

    const results: { dealer: string; success: boolean; quoteCount: number; error?: string }[] = [];
    const now = new Date();

    for (const dealer of dealers) {
      try {
        const expiryDays = dealer.notification_quote_expiry_days || 3;
        
        // Calculate the date range for quotes expiring soon
        const targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() + expiryDays);
        const targetDateStr = targetDate.toISOString().split('T')[0];
        
        // Get quotes that expire within the threshold
        // Status must be 'sent' or 'viewed' (not already accepted/rejected/expired)
        const { data: expiringQuotes, error: quotesError } = await getSupabase()
          .from('quotes')
          .select(`
            id,
            quote_number,
            total,
            valid_until,
            customers (
              first_name,
              last_name,
              company_name,
              customer_type
            )
          `)
          .eq('dealer_id', dealer.id)
          .in('status', ['sent', 'viewed'])
          .not('valid_until', 'is', null)
          .lte('valid_until', targetDateStr)
          .gte('valid_until', now.toISOString().split('T')[0])
          .order('valid_until', { ascending: true });

        if (quotesError) {
          console.error(`Error fetching quotes for dealer ${dealer.id}:`, quotesError);
          results.push({ 
            dealer: dealer.company_name, 
            success: false, 
            quoteCount: 0,
            error: quotesError.message 
          });
          continue;
        }

        if (!expiringQuotes || expiringQuotes.length === 0) {
          results.push({ 
            dealer: dealer.company_name, 
            success: true, 
            quoteCount: 0 
          });
          continue;
        }

        // Check rate limiting - don't send if we already sent for these quotes today
        const today = now.toISOString().split('T')[0];
        const { data: alreadySent } = await getSupabase()
          .from('notification_log')
          .select('reference_id')
          .eq('dealer_id', dealer.id)
          .eq('notification_type', 'quote_expiry')
          .gte('sent_at', `${today}T00:00:00Z`);

        const alreadySentIds = new Set((alreadySent || []).map(n => n.reference_id));
        const newQuotes = expiringQuotes.filter(q => !alreadySentIds.has(q.id));

        if (newQuotes.length === 0) {
          results.push({ 
            dealer: dealer.company_name, 
            success: true, 
            quoteCount: 0,
            error: 'Already sent today' 
          });
          continue;
        }

        // Build email data
        const emailData: QuoteExpiryEmailData = {
          dealerName: dealer.contact_name || dealer.company_name,
          quotes: newQuotes.map(q => {
            const customer = q.customers as { first_name: string; last_name: string; company_name: string | null; customer_type: string } | null;
            const customerName = customer?.customer_type === 'company' && customer?.company_name
              ? customer.company_name
              : customer ? `${customer.first_name} ${customer.last_name}` : 'Unbekannt';
            
            const validUntil = new Date(q.valid_until);
            const daysLeft = Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            return {
              id: q.id,
              quoteNumber: q.quote_number,
              customerName,
              total: q.total,
              validUntil: q.valid_until,
              daysLeft: Math.max(0, daysLeft),
            };
          }),
          dashboardUrl: `${APP_URL}/dashboard/quotes`,
          settingsUrl: `${APP_URL}/dashboard/settings`,
          unsubscribeUrl: `${APP_URL}/api/notifications/unsubscribe?token=${dealer.notification_unsubscribe_token}&type=quote_expiry`,
        };

        // Send email
        const result = await sendEmail({
          to: dealer.email,
          subject: `⏰ ${newQuotes.length} Offerte${newQuotes.length > 1 ? 'n' : ''} läuft bald ab`,
          html: quoteExpiryEmail(emailData),
        });

        // Log the notification
        if (result.success) {
          const logEntries = newQuotes.map(q => ({
            dealer_id: dealer.id,
            notification_type: 'quote_expiry',
            reference_id: q.id,
            email_to: dealer.email,
            subject: `Quote expiry reminder: ${q.quote_number}`,
          }));

          await getSupabase()
            .from('notification_log')
            .upsert(logEntries, { onConflict: 'dealer_id,notification_type,reference_id' });
        }

        results.push({ 
          dealer: dealer.company_name, 
          success: result.success,
          quoteCount: newQuotes.length,
          error: result.success ? undefined : String(result.error)
        });

      } catch (error) {
        console.error(`Error processing dealer ${dealer.company_name}:`, error);
        results.push({ 
          dealer: dealer.company_name, 
          success: false, 
          quoteCount: 0,
          error: String(error) 
        });
      }
    }

    const successCount = results.filter(r => r.success && r.quoteCount > 0).length;
    const totalQuotes = results.reduce((sum, r) => sum + r.quoteCount, 0);

    return NextResponse.json({ 
      success: true, 
      sent: successCount,
      totalQuotes,
      total: dealers.length,
      results 
    });

  } catch (error) {
    console.error('Error sending quote expiry notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
