import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';
import { dailySummaryEmail, DailySummaryEmailData } from '@/lib/email/templates';

// Use service role for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://dealer-os.ch';

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (for Vercel Cron or external cron)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all dealers with daily summary enabled
    const { data: dealers, error: dealersError } = await supabase
      .from('dealers')
      .select('*')
      .eq('notification_daily_summary', true);

    if (dealersError) {
      console.error('Error fetching dealers:', dealersError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!dealers || dealers.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No dealers with daily summary enabled',
        sent: 0 
      });
    }

    const results: { dealer: string; success: boolean; error?: string }[] = [];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = new Date(yesterday.setHours(0, 0, 0, 0)).toISOString();
    const yesterdayEnd = new Date(yesterday.setHours(23, 59, 59, 999)).toISOString();

    for (const dealer of dealers) {
      try {
        // Get new leads from yesterday
        const { data: newLeads } = await supabase
          .from('leads')
          .select('name, source, vehicles(make, model)')
          .eq('dealer_id', dealer.id)
          .gte('created_at', yesterdayStart)
          .lte('created_at', yesterdayEnd);

        // Get total open leads
        const { count: openLeadsCount } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('dealer_id', dealer.id)
          .in('status', ['new', 'contacted', 'qualified']);

        // Get vehicles in stock
        const { count: vehiclesInStock } = await supabase
          .from('vehicles')
          .select('*', { count: 'exact', head: true })
          .eq('dealer_id', dealer.id)
          .eq('status', 'in_stock');

        // Get longstanding vehicles (using dealer's threshold)
        const thresholdDays = dealer.notification_longstanding_days || 30;
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - thresholdDays);

        const { data: longstandingVehicles } = await supabase
          .from('vehicles')
          .select('id, make, model, acquired_at')
          .eq('dealer_id', dealer.id)
          .eq('status', 'in_stock')
          .lte('acquired_at', thresholdDate.toISOString());

        // Get recent sales (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { count: recentSales } = await supabase
          .from('vehicles')
          .select('*', { count: 'exact', head: true })
          .eq('dealer_id', dealer.id)
          .eq('status', 'sold')
          .gte('sold_at', sevenDaysAgo.toISOString());

        // Format date for email
        const dateFormatter = new Intl.DateTimeFormat('de-CH', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        // Build email data
        const emailData: DailySummaryEmailData = {
          dealerName: dealer.contact_name || dealer.company_name,
          date: dateFormatter.format(new Date()),
          newLeadsCount: newLeads?.length || 0,
          newLeads: (newLeads || []).map(l => ({
            name: l.name,
            vehicle: l.vehicles ? `${l.vehicles.make} ${l.vehicles.model}` : undefined,
            source: l.source,
          })),
          openLeadsCount: openLeadsCount || 0,
          vehiclesInStock: vehiclesInStock || 0,
          longstandingVehicles: (longstandingVehicles || []).map(v => {
            const acquiredDate = new Date(v.acquired_at);
            const days = Math.floor((Date.now() - acquiredDate.getTime()) / (1000 * 60 * 60 * 24));
            return {
              make: v.make,
              model: v.model,
              days,
              id: v.id,
            };
          }).slice(0, 5), // Top 5 longstanding
          recentSales: recentSales || 0,
          dashboardUrl: `${APP_URL}/dashboard`,
          settingsUrl: `${APP_URL}/dashboard/settings`,
        };

        // Send email
        const result = await sendEmail({
          to: dealer.email,
          subject: `📊 Ihre tägliche Zusammenfassung - ${emailData.newLeadsCount} neue Anfragen`,
          html: dailySummaryEmail(emailData),
        });

        results.push({ 
          dealer: dealer.company_name, 
          success: result.success,
          error: result.success ? undefined : String(result.error)
        });

      } catch (error) {
        console.error(`Error processing dealer ${dealer.company_name}:`, error);
        results.push({ 
          dealer: dealer.company_name, 
          success: false, 
          error: String(error) 
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({ 
      success: true, 
      sent: successCount,
      total: dealers.length,
      results 
    });

  } catch (error) {
    console.error('Error sending daily summaries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Also support GET for Vercel Cron
export async function GET(request: NextRequest) {
  return POST(request);
}
