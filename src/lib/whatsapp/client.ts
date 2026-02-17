/**
 * WhatsApp Cloud API Client
 * Handles communication with Meta's WhatsApp Cloud API
 */

import {
  MetaSendMessageRequest,
  MetaSendMessageResponse,
  formatPhoneNumber,
} from '@/types/whatsapp';

const WHATSAPP_API_VERSION = 'v18.0';
const WHATSAPP_API_BASE = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;

export interface WhatsAppClientConfig {
  phoneNumberId: string;
  accessToken: string;
}

export class WhatsAppClient {
  private phoneNumberId: string;
  private accessToken: string;

  constructor(config: WhatsAppClientConfig) {
    this.phoneNumberId = config.phoneNumberId;
    this.accessToken = config.accessToken;
  }

  /**
   * Send a text message
   */
  async sendText(to: string, text: string): Promise<MetaSendMessageResponse> {
    const payload: MetaSendMessageRequest = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formatPhoneNumber(to),
      type: 'text',
      text: {
        body: text,
        preview_url: true,
      },
    };

    return this.sendMessage(payload);
  }

  /**
   * Send a template message
   */
  async sendTemplate(
    to: string,
    templateName: string,
    languageCode: string = 'de',
    parameters?: Array<{ type: 'text'; text: string }>
  ): Promise<MetaSendMessageResponse> {
    const payload: MetaSendMessageRequest = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formatPhoneNumber(to),
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode,
        },
        components: parameters
          ? [
              {
                type: 'body',
                parameters: parameters,
              },
            ]
          : undefined,
      },
    };

    return this.sendMessage(payload);
  }

  /**
   * Send a message using the Meta API
   */
  private async sendMessage(payload: MetaSendMessageRequest): Promise<MetaSendMessageResponse> {
    const url = `${WHATSAPP_API_BASE}/${this.phoneNumberId}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[WhatsApp Client] API Error:', error);
      throw new Error(error.error?.message || 'Failed to send message');
    }

    return response.json();
  }

  /**
   * Download media file from WhatsApp
   */
  async getMediaUrl(mediaId: string): Promise<string> {
    const url = `${WHATSAPP_API_BASE}/${mediaId}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get media URL');
    }

    const data = await response.json();
    return data.url;
  }

  /**
   * Download media content
   */
  async downloadMedia(mediaUrl: string): Promise<Buffer> {
    const response = await fetch(mediaUrl, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download media');
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<void> {
    const url = `${WHATSAPP_API_BASE}/${this.phoneNumberId}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[WhatsApp Client] Mark as read error:', error);
    }
  }
}

/** WhatsApp connection data from Supabase */
interface WhatsAppConnection {
  phone_number_id: string;
  access_token: string;
}

/**
 * Create WhatsApp client from dealer connection
 */
export async function createWhatsAppClient(
  supabase: ReturnType<typeof import('@supabase/supabase-js').createClient>,
  dealerId: string
): Promise<WhatsAppClient | null> {
  const { data: connection, error } = await supabase
    .from('whatsapp_connections')
    .select('phone_number_id, access_token')
    .eq('dealer_id', dealerId)
    .eq('status', 'active')
    .single() as { data: WhatsAppConnection | null; error: Error | null };

  if (error || !connection) {
    console.error('[WhatsApp] No active connection for dealer:', dealerId);
    return null;
  }

  return new WhatsAppClient({
    phoneNumberId: connection.phone_number_id,
    accessToken: connection.access_token,
  });
}
