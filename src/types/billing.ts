// Types for Customers, Quotes, Invoices Module

export type CustomerType = 'private' | 'company';
export type Salutation = 'Herr' | 'Frau' | 'Firma' | null;

export interface Customer {
  id: string;
  dealer_id: string;
  customer_type: CustomerType;
  company_name: string | null;
  salutation: Salutation;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  street: string | null;
  postal_code: string | null;
  city: string | null;
  country: string;
  location_id: string | null;
  bexio_contact_id: number | null;
  bexio_synced_at: string | null;
  lead_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerFormData {
  customer_type: CustomerType;
  company_name?: string;
  salutation?: Salutation;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  street?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  location_id?: string;
  lead_id?: string;
}

// Quote Types
export type QuoteStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'invoiced';

export type QuoteItemType = 'vehicle' | 'accessory' | 'service' | 'warranty' | 'discount' | 'other';

export interface QuoteItem {
  id: string;
  quote_id: string;
  position: number;
  item_type: QuoteItemType;
  title: string;
  description: string | null;
  quantity: number;
  unit_price: number; // in Rappen
  discount_percent: number;
  total: number; // in Rappen
  vehicle_id: string | null;
  created_at: string;
}

export interface QuoteItemFormData {
  item_type: QuoteItemType;
  title: string;
  description?: string;
  quantity: number;
  unit_price: number; // in CHF (will be converted to Rappen)
  discount_percent?: number;
  vehicle_id?: string;
}

export interface Quote {
  id: string;
  dealer_id: string;
  customer_id: string;
  lead_id: string | null;
  quote_number: string;
  version: number;
  status: QuoteStatus;
  valid_until: string | null;
  subtotal: number;
  discount_percent: number;
  discount_amount: number;
  vat_rate: number;
  vat_amount: number;
  total: number;
  trade_in_value: number;
  trade_in_vehicle_id: string | null;
  trade_in_description: string | null;
  internal_notes: string | null;
  customer_notes: string | null;
  terms: string | null;
  bexio_offer_id: number | null;
  bexio_synced_at: string | null;
  sent_at: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  created_at: string;
  updated_at: string;
  // Relations (when joined)
  customer?: Customer;
  items?: QuoteItem[];
}

export interface QuoteFormData {
  customer_id: string;
  lead_id?: string;
  valid_until?: string;
  discount_percent?: number;
  trade_in_value?: number; // in CHF
  trade_in_vehicle_id?: string;
  trade_in_description?: string;
  internal_notes?: string;
  customer_notes?: string;
  terms?: string;
  items: QuoteItemFormData[];
}

// Invoice Types
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  position: number;
  item_type: QuoteItemType;
  title: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  total: number;
  vehicle_id: string | null;
  created_at: string;
}

export interface Invoice {
  id: string;
  dealer_id: string;
  customer_id: string;
  quote_id: string | null;
  invoice_number: string;
  status: InvoiceStatus;
  invoice_date: string;
  due_date: string | null;
  subtotal: number;
  discount_amount: number;
  trade_in_value: number;
  vat_rate: number;
  vat_amount: number;
  total: number;
  paid_amount: number;
  payment_terms: string | null;
  payment_reference: string | null;
  bexio_invoice_id: number | null;
  bexio_synced_at: string | null;
  bexio_pdf_url: string | null;
  sent_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  customer?: Customer;
  items?: InvoiceItem[];
  payments?: Payment[];
}

export interface InvoiceFormData {
  customer_id: string;
  quote_id?: string;
  invoice_date?: string;
  due_date?: string;
  discount_amount?: number;
  trade_in_value?: number;
  payment_terms?: string;
  items: QuoteItemFormData[];
}

// Payment Types
export type PaymentMethod = 'bank_transfer' | 'cash' | 'card' | 'twint' | 'other';

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod | null;
  reference: string | null;
  notes: string | null;
  created_at: string;
}

export interface PaymentFormData {
  amount: number; // in CHF
  payment_date?: string;
  payment_method?: PaymentMethod;
  reference?: string;
  notes?: string;
}

// Bexio Connection
export interface BexioConnection {
  id: string;
  dealer_id: string;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  bexio_company_id: number | null;
  bexio_company_name: string | null;
  auto_sync_customers: boolean;
  auto_sync_quotes: boolean;
  auto_sync_invoices: boolean;
  default_vat_rate: number;
  is_connected: boolean;
  last_sync_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

// Helper functions
export function formatCHF(rappen: number): string {
  return (rappen / 100).toLocaleString('de-CH', {
    style: 'currency',
    currency: 'CHF',
  });
}

export function toCHF(rappen: number): number {
  return rappen / 100;
}

export function toRappen(chf: number): number {
  return Math.round(chf * 100);
}

export function getCustomerDisplayName(customer: Customer): string {
  if (customer.customer_type === 'company' && customer.company_name) {
    return customer.company_name;
  }
  return `${customer.first_name} ${customer.last_name}`;
}

export function getQuoteStatusLabel(status: QuoteStatus): string {
  const labels: Record<QuoteStatus, string> = {
    draft: 'Entwurf',
    sent: 'Gesendet',
    viewed: 'Angesehen',
    accepted: 'Angenommen',
    rejected: 'Abgelehnt',
    expired: 'Abgelaufen',
    invoiced: 'Verrechnet',
  };
  return labels[status];
}

export function getInvoiceStatusLabel(status: InvoiceStatus): string {
  const labels: Record<InvoiceStatus, string> = {
    draft: 'Entwurf',
    sent: 'Gesendet',
    paid: 'Bezahlt',
    partial: 'Teilbezahlt',
    overdue: 'Überfällig',
    cancelled: 'Storniert',
  };
  return labels[status];
}

export function getQuoteStatusColor(status: QuoteStatus): string {
  const colors: Record<QuoteStatus, string> = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    viewed: 'bg-purple-100 text-purple-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    expired: 'bg-orange-100 text-orange-800',
    invoiced: 'bg-emerald-100 text-emerald-800',
  };
  return colors[status];
}

export function getInvoiceStatusColor(status: InvoiceStatus): string {
  const colors: Record<InvoiceStatus, string> = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    partial: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-500',
  };
  return colors[status];
}
