/**
 * WhatsApp Business Integration Types
 */

// Database types
export interface WhatsAppConnection {
  id: string;
  dealer_id: string;
  phone_number_id: string;
  phone_number: string;
  waba_id: string;
  access_token: string;
  status: 'active' | 'disconnected' | 'pending';
  display_name: string | null;
  verify_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppMessage {
  id: string;
  dealer_id: string;
  lead_id: string | null;
  wamid: string | null;
  direction: 'inbound' | 'outbound';
  from_number: string;
  to_number: string;
  contact_name: string | null;
  message_type: WhatsAppMessageType;
  content: string | null;
  media_id: string | null;
  media_url: string | null;
  media_mime_type: string | null;
  media_filename: string | null;
  template_name: string | null;
  template_params: Record<string, unknown> | null;
  status: WhatsAppMessageStatus;
  error_code: string | null;
  error_message: string | null;
  timestamp: string;
  created_at: string;
}

export type WhatsAppMessageType = 
  | 'text' 
  | 'image' 
  | 'document' 
  | 'audio' 
  | 'video' 
  | 'template' 
  | 'interactive'
  | 'location'
  | 'contacts';

export type WhatsAppMessageStatus = 
  | 'pending' 
  | 'sent' 
  | 'delivered' 
  | 'read' 
  | 'failed';

// Meta Webhook Types
export interface MetaWebhookPayload {
  object: 'whatsapp_business_account';
  entry: MetaWebhookEntry[];
}

export interface MetaWebhookEntry {
  id: string; // WABA ID
  changes: MetaWebhookChange[];
}

export interface MetaWebhookChange {
  value: MetaWebhookValue;
  field: 'messages' | 'account_update' | 'message_template_status_update';
}

export interface MetaWebhookValue {
  messaging_product: 'whatsapp';
  metadata: {
    phone_number_id: string;
    display_phone_number: string;
  };
  contacts?: MetaContact[];
  messages?: MetaMessage[];
  statuses?: MetaStatus[];
  errors?: MetaError[];
}

export interface MetaContact {
  profile: {
    name: string;
  };
  wa_id: string; // WhatsApp ID (phone number without +)
}

export interface MetaMessage {
  id: string; // wamid
  from: string; // Sender phone (without +)
  timestamp: string; // Unix timestamp
  type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'location' | 'contacts' | 'interactive' | 'button' | 'reaction';
  text?: {
    body: string;
  };
  image?: MetaMedia;
  document?: MetaMedia & { filename?: string };
  audio?: MetaMedia;
  video?: MetaMedia;
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  contacts?: MetaContactCard[];
  interactive?: {
    type: string;
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string; description?: string };
  };
  button?: {
    text: string;
    payload: string;
  };
  reaction?: {
    message_id: string;
    emoji: string;
  };
  context?: {
    from: string;
    id: string; // Message being replied to
  };
}

export interface MetaMedia {
  id: string; // Media ID
  mime_type: string;
  sha256?: string;
  caption?: string;
}

export interface MetaContactCard {
  name: {
    formatted_name: string;
    first_name?: string;
    last_name?: string;
  };
  phones?: Array<{
    phone: string;
    type?: string;
  }>;
}

export interface MetaStatus {
  id: string; // wamid
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  errors?: MetaError[];
  conversation?: {
    id: string;
    expiration_timestamp?: string;
    origin: {
      type: 'business_initiated' | 'user_initiated' | 'referral_conversion';
    };
  };
  pricing?: {
    billable: boolean;
    pricing_model: string;
    category: string;
  };
}

export interface MetaError {
  code: number;
  title: string;
  message: string;
  error_data?: {
    details: string;
  };
}

// API Types
export interface SendMessageRequest {
  lead_id: string;
  message?: string;
  template_name?: string;
  template_params?: Record<string, string>;
}

export interface SendMessageResponse {
  success: boolean;
  message_id?: string;
  wamid?: string;
  error?: string;
}

// Meta API Send Types
export interface MetaSendMessageRequest {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'text' | 'template' | 'image' | 'document';
  text?: {
    body: string;
    preview_url?: boolean;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: Array<{
      type: 'body' | 'header';
      parameters: Array<{
        type: 'text' | 'image' | 'document';
        text?: string;
        image?: { link: string };
      }>;
    }>;
  };
}

export interface MetaSendMessageResponse {
  messaging_product: 'whatsapp';
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string; // wamid
  }>;
}

// Helper to format phone number
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits except leading +
  const cleaned = phone.replace(/[^\d+]/g, '');
  // Ensure it starts with country code
  if (cleaned.startsWith('+')) {
    return cleaned.slice(1); // Meta API expects without +
  }
  // Swiss numbers without country code
  if (cleaned.startsWith('0')) {
    return '41' + cleaned.slice(1);
  }
  return cleaned;
}

// Helper to display phone number
export function displayPhoneNumber(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/[^\d]/g, '');
  if (cleaned.startsWith('41')) {
    // Swiss format: +41 79 123 45 67
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
  }
  return `+${cleaned}`;
}
