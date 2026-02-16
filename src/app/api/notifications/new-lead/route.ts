import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';
import { newLeadEmail, NewLeadEmailData } from '@/lib/email/templates';

// Use service role for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://dealer-os.ch';

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret (for Supabase webhooks)
    const authHeader = request.headers.get('authorization');
    const webhookSecret = process.env.NOTIFICATION_WEBHOOK_SECRET;
    
    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Support both direct API calls and Supabase webhook format
    const lead = body.record || body;
    const { dealer_id, vehicle_id, name, email, phone, message, source } = lead;

    if (!dealer_id || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get dealer with notification preferences
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('*')
      .eq('id', dealer_id)
      .single();

    if (dealerError || !dealer) {
      console.error('Dealer not found:', dealerError);
      return NextResponse.json({ error: 'Dealer not found' }, { status: 404 });
    }

    // Check if notifications are enabled
    if (!dealer.notification_new_lead) {
      return NextResponse.json({ 
        success: true, 
        message: 'Notification disabled for this dealer',
        sent: false 
      });
    }

    // Get vehicle info if available
    let vehicleMake: string | undefined;
    let vehicleModel: string | undefined;

    if (vehicle_id) {
      const { data: vehicle } = await supabase
        .from('vehicles')
        .select('make, model')
        .eq('id', vehicle_id)
        .single();

      if (vehicle) {
        vehicleMake = vehicle.make;
        vehicleModel = vehicle.model;
      }
    }

    // Build email data
    const emailData: NewLeadEmailData = {
      dealerName: dealer.contact_name || dealer.company_name,
      leadName: name,
      leadEmail: email,
      leadPhone: phone,
      leadMessage: message,
      vehicleMake,
      vehicleModel,
      vehicleId: vehicle_id,
      source,
      dashboardUrl: `${APP_URL}/dashboard/leads`,
      settingsUrl: `${APP_URL}/dashboard/settings`,
    };

    // Send email
    const result = await sendEmail({
      to: dealer.email,
      subject: `🎉 Neue Anfrage von ${name}`,
      html: newLeadEmail(emailData),
    });

    return NextResponse.json({ 
      success: true, 
      sent: result.success,
      dealer_email: dealer.email 
    });

  } catch (error) {
    console.error('Error sending new lead notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
