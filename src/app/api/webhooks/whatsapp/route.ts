import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  MetaWebhookPayload,
  MetaMessage,
  MetaContact,
  MetaStatus,
  WhatsAppMessage,
  formatPhoneNumber,
} from '@/types/whatsapp';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Lazy initialization
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

// Environment variables
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'dealer-os-whatsapp-verify';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://dealer-os.ch';

/**
 * GET: Webhook Verification (Meta Challenge)
 * Meta sends this to verify the webhook URL
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  console.log('[WhatsApp Webhook] Verification request:', { mode, token: token ? '***' : null, challenge });

  if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
    console.log('[WhatsApp Webhook] Verification successful');
    return new NextResponse(challenge, { status: 200 });
  }

  console.error('[WhatsApp Webhook] Verification failed - token mismatch');
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

/**
 * POST: Process incoming webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const body: MetaWebhookPayload = await request.json();
    
    // Validate it's a WhatsApp webhook
    if (body.object !== 'whatsapp_business_account') {
      console.log('[WhatsApp Webhook] Ignoring non-WhatsApp payload');
      return NextResponse.json({ status: 'ignored' });
    }

    // Process each entry
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        if (change.field !== 'messages') continue;

        const value = change.value;
        const phoneNumberId = value.metadata.phone_number_id;
        const displayPhoneNumber = value.metadata.display_phone_number;

        // Process incoming messages
        if (value.messages && value.messages.length > 0) {
          const contacts = value.contacts || [];
          for (const message of value.messages) {
            await processIncomingMessage(
              phoneNumberId,
              displayPhoneNumber,
              message,
              contacts.find(c => c.wa_id === message.from)
            );
          }
        }

        // Process status updates
        if (value.statuses && value.statuses.length > 0) {
          for (const status of value.statuses) {
            await processStatusUpdate(status);
          }
        }
      }
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ status: 'ok' });

  } catch (error) {
    console.error('[WhatsApp Webhook] Error processing webhook:', error);
    // Still return 200 to prevent Meta from retrying
    return NextResponse.json({ status: 'error', error: 'Processing failed' });
  }
}

/**
 * Process incoming WhatsApp message
 */
async function processIncomingMessage(
  phoneNumberId: string,
  dealerPhoneNumber: string,
  message: MetaMessage,
  contact?: MetaContact
) {
  console.log('[WhatsApp] Processing incoming message:', {
    wamid: message.id,
    from: message.from,
    type: message.type,
    contact: contact?.profile?.name,
  });

  const supabase = getSupabase();

  // 1. Find dealer by phone_number_id (including auto-reply config)
  const { data: connection, error: connError } = await supabase
    .from('whatsapp_connections')
    .select('dealer_id, auto_reply_enabled, auto_reply_message, access_token')
    .eq('phone_number_id', phoneNumberId)
    .single();

  if (connError || !connection) {
    console.error('[WhatsApp] No dealer found for phone_number_id:', phoneNumberId);
    // For MVP: Create a default connection or log for manual setup
    return;
  }

  const dealerId = connection.dealer_id;
  const senderPhone = formatPhoneNumber(message.from);
  const contactName = contact?.profile?.name || null;

  // 2. Extract message content
  const { content, messageType, mediaId, mediaMimeType, mediaFilename } = extractMessageContent(message);

  // 3. Find or create lead
  const lead = await findOrCreateLead(dealerId, senderPhone, contactName, content);

  // 4. Save WhatsApp message
  const waMessage: Partial<WhatsAppMessage> = {
    dealer_id: dealerId,
    lead_id: lead?.id || null,
    wamid: message.id,
    direction: 'inbound',
    from_number: senderPhone,
    to_number: formatPhoneNumber(dealerPhoneNumber),
    contact_name: contactName,
    message_type: messageType,
    content: content,
    media_id: mediaId,
    media_mime_type: mediaMimeType,
    media_filename: mediaFilename,
    status: 'delivered',
    timestamp: new Date(parseInt(message.timestamp) * 1000).toISOString(),
  };

  const { error: msgError } = await supabase
    .from('whatsapp_messages')
    .insert(waMessage);

  if (msgError) {
    console.error('[WhatsApp] Error saving message:', msgError);
  }

  // 5. Update lead's last WhatsApp activity
  if (lead?.id) {
    await supabase
      .from('leads')
      .update({ 
        whatsapp_last_message_at: waMessage.timestamp,
        updated_at: new Date().toISOString(),
      })
      .eq('id', lead.id);

    // 6. Create activity record
    await supabase
      .from('lead_activities')
      .insert({
        lead_id: lead.id,
        dealer_id: dealerId,
        type: 'whatsapp_inbound',
        content: content || `[${messageType}]`,
        metadata: {
          wamid: message.id,
          contact_name: contactName,
          message_type: messageType,
        },
      });
  }

  // 7. Trigger notification for new leads
  if (lead?.isNew) {
    try {
      await fetch(`${APP_URL}/api/notifications/new-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealer_id: dealerId,
          name: contactName || senderPhone,
          phone: senderPhone,
          message: content,
          source: 'whatsapp',
        }),
      });
    } catch (notifError) {
      console.error('[WhatsApp] Error sending notification:', notifError);
    }
  }

  // 8. Send auto-reply if enabled (only for new conversations)
  if (connection.auto_reply_enabled && lead?.isNew && connection.auto_reply_message) {
    try {
      // Import WhatsAppClient
      const { WhatsAppClient } = await import('@/lib/whatsapp/client');
      
      const client = new WhatsAppClient({
        phoneNumberId: phoneNumberId,
        accessToken: connection.access_token,
      });

      // Send auto-reply
      const response = await client.sendText(senderPhone, connection.auto_reply_message);

      // Save auto-reply message
      await supabase
        .from('whatsapp_messages')
        .insert({
          dealer_id: dealerId,
          lead_id: lead.id,
          wamid: response.messages[0].id,
          direction: 'outbound',
          from_number: formatPhoneNumber(dealerPhoneNumber),
          to_number: senderPhone,
          message_type: 'text',
          content: connection.auto_reply_message,
          status: 'sent',
          timestamp: new Date().toISOString(),
        });

      // Create activity for auto-reply
      await supabase
        .from('lead_activities')
        .insert({
          lead_id: lead.id,
          dealer_id: dealerId,
          type: 'whatsapp_outbound',
          content: `[Auto-Reply] ${connection.auto_reply_message}`,
          metadata: {
            auto_reply: true,
            wamid: response.messages[0].id,
          },
        });

      console.log('[WhatsApp] Auto-reply sent:', response.messages[0].id);
    } catch (autoReplyError) {
      console.error('[WhatsApp] Auto-reply failed:', autoReplyError);
      // Don't fail the whole webhook if auto-reply fails
    }
  }

  console.log('[WhatsApp] Message processed successfully:', {
    lead_id: lead?.id,
    is_new: lead?.isNew,
    auto_reply_sent: connection.auto_reply_enabled && lead?.isNew,
  });
}

/**
 * Process message status update (sent, delivered, read)
 */
async function processStatusUpdate(status: MetaStatus) {
  console.log('[WhatsApp] Status update:', {
    wamid: status.id,
    status: status.status,
    recipient: status.recipient_id,
  });

  const supabase = getSupabase();

  // Update message status
  const { error } = await supabase
    .from('whatsapp_messages')
    .update({ 
      status: status.status,
      error_code: status.errors?.[0]?.code?.toString() || null,
      error_message: status.errors?.[0]?.message || null,
    })
    .eq('wamid', status.id);

  if (error) {
    console.error('[WhatsApp] Error updating status:', error);
  }
}

/**
 * Extract message content based on type
 */
function extractMessageContent(message: MetaMessage): {
  content: string | null;
  messageType: WhatsAppMessage['message_type'];
  mediaId: string | null;
  mediaMimeType: string | null;
  mediaFilename: string | null;
} {
  switch (message.type) {
    case 'text':
      return {
        content: message.text?.body || null,
        messageType: 'text',
        mediaId: null,
        mediaMimeType: null,
        mediaFilename: null,
      };

    case 'image':
      return {
        content: message.image?.caption || null,
        messageType: 'image',
        mediaId: message.image?.id || null,
        mediaMimeType: message.image?.mime_type || null,
        mediaFilename: null,
      };

    case 'document':
      return {
        content: message.document?.caption || null,
        messageType: 'document',
        mediaId: message.document?.id || null,
        mediaMimeType: message.document?.mime_type || null,
        mediaFilename: message.document?.filename || null,
      };

    case 'audio':
      return {
        content: null,
        messageType: 'audio',
        mediaId: message.audio?.id || null,
        mediaMimeType: message.audio?.mime_type || null,
        mediaFilename: null,
      };

    case 'video':
      return {
        content: message.video?.caption || null,
        messageType: 'video',
        mediaId: message.video?.id || null,
        mediaMimeType: message.video?.mime_type || null,
        mediaFilename: null,
      };

    case 'location':
      return {
        content: message.location
          ? `📍 ${message.location.name || 'Location'}: ${message.location.latitude}, ${message.location.longitude}`
          : null,
        messageType: 'location',
        mediaId: null,
        mediaMimeType: null,
        mediaFilename: null,
      };

    case 'interactive':
      return {
        content: message.interactive?.button_reply?.title 
          || message.interactive?.list_reply?.title 
          || null,
        messageType: 'interactive',
        mediaId: null,
        mediaMimeType: null,
        mediaFilename: null,
      };

    case 'button':
      return {
        content: message.button?.text || null,
        messageType: 'interactive',
        mediaId: null,
        mediaMimeType: null,
        mediaFilename: null,
      };

    default:
      return {
        content: `[${message.type}]`,
        messageType: 'text',
        mediaId: null,
        mediaMimeType: null,
        mediaFilename: null,
      };
  }
}

/**
 * Find existing lead by phone or create new one
 */
async function findOrCreateLead(
  dealerId: string,
  phone: string,
  contactName: string | null,
  message: string | null
): Promise<{ id: string; isNew: boolean } | null> {
  const supabase = getSupabase();

  // Format phone for search (try multiple formats)
  const phoneVariants = [
    phone,
    `+${phone}`,
    phone.startsWith('41') ? `0${phone.slice(2)}` : phone,
  ];

  // Search by phone number
  const { data: existingLead } = await supabase
    .from('leads')
    .select('id')
    .eq('dealer_id', dealerId)
    .or(phoneVariants.map(p => `phone.eq.${p}`).join(','))
    .limit(1)
    .single();

  if (existingLead) {
    return { id: existingLead.id, isNew: false };
  }

  // Also check by whatsapp_number
  const { data: existingByWa } = await supabase
    .from('leads')
    .select('id')
    .eq('dealer_id', dealerId)
    .eq('whatsapp_number', phone)
    .limit(1)
    .single();

  if (existingByWa) {
    return { id: existingByWa.id, isNew: false };
  }

  // Create new lead
  const nameParts = (contactName || 'WhatsApp').split(' ');
  const firstName = nameParts[0] || 'WhatsApp';
  const lastName = nameParts.slice(1).join(' ') || 'Kontakt';

  const { data: newLead, error } = await supabase
    .from('leads')
    .insert({
      dealer_id: dealerId,
      first_name: firstName,
      last_name: lastName,
      phone: `+${phone}`,
      whatsapp_number: phone,
      source: 'whatsapp',
      status: 'new',
      message: message,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[WhatsApp] Error creating lead:', error);
    return null;
  }

  return { id: newLead.id, isNew: true };
}
