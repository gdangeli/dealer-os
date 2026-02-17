import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createWhatsAppClient } from '@/lib/whatsapp/client';
import { formatPhoneNumber } from '@/types/whatsapp';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Lazy initialization
let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabase;
}

interface SendMessageRequest {
  lead_id: string;
  message: string;
}

/**
 * POST: Send WhatsApp message to a lead
 */
export async function POST(request: NextRequest) {
  try {
    const body: SendMessageRequest = await request.json();
    const { lead_id, message } = body;

    if (!lead_id || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing lead_id or message' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // 1. Get lead with dealer info
    const { data: lead, error: leadError } = await (supabase as any)
      .from('leads')
      .select('id, dealer_id, first_name, last_name, phone, whatsapp_number')
      .eq('id', lead_id)
      .single() as {
        data: {
          id: string;
          dealer_id: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          whatsapp_number: string | null;
        } | null;
        error: Error | null;
      };

    if (leadError || !lead) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }

    // 2. Get WhatsApp connection for dealer
    const { data: connection, error: connError } = await (supabase as any)
      .from('whatsapp_connections')
      .select('phone_number_id, phone_number, access_token, status')
      .eq('dealer_id', lead.dealer_id)
      .eq('status', 'active')
      .single() as {
        data: {
          phone_number_id: string;
          phone_number: string;
          access_token: string;
          status: string;
        } | null;
        error: Error | null;
      };

    if (connError || !connection) {
      return NextResponse.json(
        { success: false, error: 'WhatsApp not connected for this dealer' },
        { status: 400 }
      );
    }

    // 3. Determine recipient phone number
    const recipientPhone = lead.whatsapp_number || lead.phone;
    if (!recipientPhone) {
      return NextResponse.json(
        { success: false, error: 'Lead has no phone number' },
        { status: 400 }
      );
    }

    // 4. Create WhatsApp client and send message
    const client = await createWhatsAppClient(supabase, lead.dealer_id);
    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Failed to initialize WhatsApp client' },
        { status: 500 }
      );
    }

    const response = await client.sendText(recipientPhone, message);
    const wamid = response.messages[0].id;

    // 5. Save message to database (using any until Supabase types are regenerated)
    const { error: msgError } = await (supabase as any)
      .from('whatsapp_messages')
      .insert({
        dealer_id: lead.dealer_id,
        lead_id: lead.id,
        wamid: wamid,
        direction: 'outbound',
        from_number: formatPhoneNumber(connection.phone_number),
        to_number: formatPhoneNumber(recipientPhone),
        message_type: 'text',
        content: message,
        status: 'sent',
        timestamp: new Date().toISOString(),
      });

    if (msgError) {
      console.error('[WhatsApp Send] Error saving message:', msgError);
    }

    // 6. Update lead's last WhatsApp activity
    await (supabase as any)
      .from('leads')
      .update({
        whatsapp_number: formatPhoneNumber(recipientPhone),
        whatsapp_last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', lead.id);

    // 7. Create activity record
    // @ts-ignore - Supabase type inference issue
    await (supabase as any)
      .from('lead_activities')
      .insert({
        lead_id: lead.id,
        dealer_id: lead.dealer_id,
        type: 'whatsapp_outbound',
        content: message,
        metadata: {
          wamid: wamid,
        },
      });

    return NextResponse.json({
      success: true,
      message_id: wamid,
      wamid: wamid,
    });

  } catch (error) {
    console.error('[WhatsApp Send] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
