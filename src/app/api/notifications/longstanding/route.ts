import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';
import { longstandingWarningEmail, LongstandingWarningEmailData } from '@/lib/email/templates';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all dealers (we'll check their thresholds individually)
    const { data: dealers, error: dealersError } = await getSupabase()
      .from('dealers')
      .select('*');

    if (dealersError) {
      console.error('Error fetching dealers:', dealersError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!dealers || dealers.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No dealers found',
        sent: 0 
      });
    }

    const results: { dealer: string; success: boolean; vehicleCount: number; error?: string }[] = [];

    for (const dealer of dealers) {
      try {
        const thresholdDays = dealer.notification_longstanding_days || 60;
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - thresholdDays);

        // Get vehicles that exceed the threshold
        const { data: longstandingVehicles } = await getSupabase()
          .from('vehicles')
          .select('id, make, model, acquired_at, asking_price, purchase_price')
          .eq('dealer_id', dealer.id)
          .eq('status', 'in_stock')
          .lte('acquired_at', thresholdDate.toISOString())
          .order('acquired_at', { ascending: true });

        if (!longstandingVehicles || longstandingVehicles.length === 0) {
          results.push({ 
            dealer: dealer.company_name, 
            success: true, 
            vehicleCount: 0 
          });
          continue;
        }

        // Check if we've sent a warning for these vehicles recently (within 7 days)
        // This prevents spamming - only send once per week per dealer
        const lastWarningKey = `longstanding_warning_${dealer.id}`;
        // In a real implementation, you'd track this in the database
        // For now, we'll send the warning

        // Build email data
        const emailData: LongstandingWarningEmailData = {
          dealerName: dealer.contact_name || dealer.company_name,
          vehicles: longstandingVehicles.map(v => {
            const acquiredDate = new Date(v.acquired_at);
            const daysInStock = Math.floor((Date.now() - acquiredDate.getTime()) / (1000 * 60 * 60 * 24));
            return {
              id: v.id,
              make: v.make,
              model: v.model,
              daysInStock,
              askingPrice: v.asking_price,
              purchasePrice: v.purchase_price,
            };
          }),
          thresholdDays,
          dashboardUrl: `${APP_URL}/dashboard/vehicles`,
          settingsUrl: `${APP_URL}/dashboard/settings`,
          unsubscribeUrl: dealer.notification_unsubscribe_token
            ? `${APP_URL}/api/notifications/unsubscribe?token=${dealer.notification_unsubscribe_token}&type=longstanding`
            : undefined,
        };

        // Send email
        const result = await sendEmail({
          to: dealer.email,
          subject: `⚠️ Langsteher-Warnung: ${longstandingVehicles.length} Fahrzeuge über ${thresholdDays} Tage`,
          html: longstandingWarningEmail(emailData),
        });

        results.push({ 
          dealer: dealer.company_name, 
          success: result.success,
          vehicleCount: longstandingVehicles.length,
          error: result.success ? undefined : String(result.error)
        });

      } catch (error) {
        console.error(`Error processing dealer ${dealer.company_name}:`, error);
        results.push({ 
          dealer: dealer.company_name, 
          success: false, 
          vehicleCount: 0,
          error: String(error) 
        });
      }
    }

    const successCount = results.filter(r => r.success && r.vehicleCount > 0).length;

    return NextResponse.json({ 
      success: true, 
      sent: successCount,
      total: dealers.length,
      results 
    });

  } catch (error) {
    console.error('Error sending longstanding warnings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Also support GET for Vercel Cron
export async function GET(request: NextRequest) {
  return POST(request);
}
