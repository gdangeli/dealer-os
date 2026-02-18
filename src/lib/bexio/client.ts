/**
 * Bexio API Client
 * 
 * Provides typed access to Bexio API endpoints with automatic token refresh
 * and rate limiting.
 * 
 * API Documentation: https://docs.bexio.com/
 * Base URL: https://api.bexio.com
 */

import { decryptToken, encryptToken } from './crypto';
import { refreshAccessToken } from './oauth';

const BEXIO_API_BASE = 'https://api.bexio.com';

// Rate limiting: Bexio allows ~100 requests per minute
const RATE_LIMIT_DELAY_MS = 100;
let lastRequestTime = 0;

// Types for Bexio API responses
export interface BexioContact {
  id: number;
  nr: string;
  contact_type_id: number; // 1 = Company, 2 = Person
  name_1: string; // Company name or Last name
  name_2?: string; // First name (for persons)
  salutation_id?: number;
  title_id?: number;
  birthday?: string;
  address?: string;
  postcode?: string;
  city?: string;
  country_id?: number;
  mail?: string;
  mail_second?: string;
  phone_fixed?: string;
  phone_fixed_second?: string;
  phone_mobile?: string;
  fax?: string;
  url?: string;
  skype_name?: string;
  remarks?: string;
  language_id?: number;
  contact_group_ids?: number[];
  contact_branch_ids?: number[];
  user_id: number;
  owner_id: number;
  updated_at: string;
}

export interface BexioContactCreate {
  contact_type_id: number;
  name_1: string;
  name_2?: string;
  salutation_id?: number;
  address?: string;
  postcode?: string;
  city?: string;
  country_id?: number;
  mail?: string;
  phone_fixed?: string;
  phone_mobile?: string;
  remarks?: string;
}

export interface BexioInvoice {
  id: number;
  document_nr: string;
  title?: string;
  contact_id: number;
  contact_sub_id?: number;
  user_id: number;
  logopaper_id?: number;
  language_id?: number;
  bank_account_id?: number;
  currency_id: number;
  payment_type_id?: number;
  header?: string;
  footer?: string;
  mwst_type: number; // 0 = exclusive, 1 = inclusive, 2 = no VAT
  mwst_is_net: boolean;
  show_position_taxes: boolean;
  is_valid_from: string;
  is_valid_to?: string;
  contact_address?: string;
  kb_item_status_id: number;
  api_reference?: string;
  viewed_by_client_at?: string;
  updated_at: string;
  template_slug?: string;
  taxs?: BexioTax[];
  positions?: BexioPosition[];
  total_gross?: string;
  total_net?: string;
  total_taxes?: string;
  total?: string;
}

export interface BexioInvoiceCreate {
  title?: string;
  contact_id: number;
  contact_sub_id?: number;
  user_id?: number;
  currency_id?: number;
  payment_type_id?: number;
  header?: string;
  footer?: string;
  mwst_type?: number;
  mwst_is_net?: boolean;
  show_position_taxes?: boolean;
  is_valid_from: string;
  is_valid_to?: string;
  api_reference?: string;
  positions: BexioPositionCreate[];
}

export interface BexioPosition {
  id: number;
  type: string;
  amount: string;
  unit_id?: number;
  account_id?: number;
  unit_name?: string;
  tax_id?: number;
  tax_value?: string;
  text: string;
  unit_price?: string;
  discount_in_percent?: string;
  position_total?: string;
  pos?: number;
  internal_pos?: number;
  is_optional?: boolean;
  article_id?: number;
}

export interface BexioPositionCreate {
  type: 'KbPositionArticle' | 'KbPositionCustom' | 'KbPositionText' | 'KbPositionSubtotal' | 'KbPositionPagebreak' | 'KbPositionDiscount';
  amount?: string;
  unit_id?: number;
  account_id?: number;
  tax_id?: number;
  text?: string;
  unit_price?: string;
  discount_in_percent?: string;
  article_id?: number;
}

export interface BexioTax {
  percentage: string;
  value: string;
}

export interface BexioCompanyProfile {
  id: number;
  name: string;
  address: string;
  address_nr: string;
  postcode: string;
  city: string;
  country_id: number;
  legal_form: string;
  country_name: string;
  mail: string;
  phone_fixed: string;
  phone_mobile: string;
  fax: string;
  url: string;
  skype_name: string;
  facebook_name: string;
  twitter_name: string;
  ust_id_nr: string;
  mwst_nr: string;
  trade_register_nr: string;
  own_logo_file_id?: number;
  timezone: string;
  logo_base64?: string;
}

export interface BexioCountry {
  id: number;
  name: string;
  name_short: string;
  iso_3166_alpha2: string;
}

export interface BexioSalutation {
  id: number;
  name: string;
}

export interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface BexioClientConfig {
  dealerId: string;
  encryptedAccessToken: string;
  encryptedRefreshToken: string;
  tokenExpiresAt: Date;
  onTokenRefresh?: (newTokens: { accessToken: string; refreshToken: string; expiresAt: Date }) => Promise<void>;
}

/**
 * Bexio API Client with automatic token refresh
 */
export class BexioClient {
  private dealerId: string;
  private accessToken: string;
  private refreshToken: string;
  private expiresAt: Date;
  private onTokenRefresh?: (newTokens: { accessToken: string; refreshToken: string; expiresAt: Date }) => Promise<void>;

  constructor(config: BexioClientConfig) {
    this.dealerId = config.dealerId;
    this.accessToken = decryptToken(config.encryptedAccessToken);
    this.refreshToken = decryptToken(config.encryptedRefreshToken);
    this.expiresAt = config.tokenExpiresAt;
    this.onTokenRefresh = config.onTokenRefresh;
  }

  /**
   * Check if the token is expired (with 5 minute buffer)
   */
  private isTokenExpired(): boolean {
    const bufferMs = 5 * 60 * 1000; // 5 minutes
    return Date.now() > this.expiresAt.getTime() - bufferMs;
  }

  /**
   * Refresh the access token if needed
   */
  private async ensureValidToken(): Promise<void> {
    if (!this.isTokenExpired()) {
      return;
    }

    console.log(`[Bexio] Refreshing token for dealer ${this.dealerId}`);
    
    try {
      const tokens = await refreshAccessToken(this.refreshToken);
      
      this.accessToken = tokens.access_token;
      this.refreshToken = tokens.refresh_token;
      this.expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

      // Notify callback to persist new tokens
      if (this.onTokenRefresh) {
        await this.onTokenRefresh({
          accessToken: encryptToken(tokens.access_token),
          refreshToken: encryptToken(tokens.refresh_token),
          expiresAt: this.expiresAt,
        });
      }
    } catch (error) {
      console.error('[Bexio] Token refresh failed:', error);
      throw new Error('Bexio token refresh failed. Please reconnect your Bexio account.');
    }
  }

  /**
   * Apply rate limiting
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < RATE_LIMIT_DELAY_MS) {
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY_MS - timeSinceLastRequest));
    }
    
    lastRequestTime = Date.now();
  }

  /**
   * Make an authenticated request to Bexio API
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: unknown
  ): Promise<T> {
    await this.ensureValidToken();
    await this.rateLimit();

    const url = `${BEXIO_API_BASE}${endpoint}`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
      console.warn(`[Bexio] Rate limited. Retry after ${retryAfter}s`);
      throw new Error(`Rate limited. Please try again in ${retryAfter} seconds.`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Bexio] API error ${response.status}:`, errorText);
      throw new Error(`Bexio API error: ${response.status} - ${errorText}`);
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // ============================================================================
  // Company / Info Endpoints
  // ============================================================================

  /**
   * Get company profile
   */
  async getCompanyProfile(): Promise<BexioCompanyProfile> {
    return this.request<BexioCompanyProfile>('GET', '/2.0/company_profile');
  }

  /**
   * Get list of countries
   */
  async getCountries(): Promise<BexioCountry[]> {
    return this.request<BexioCountry[]>('GET', '/2.0/country');
  }

  /**
   * Get salutations
   */
  async getSalutations(): Promise<BexioSalutation[]> {
    return this.request<BexioSalutation[]>('GET', '/2.0/salutation');
  }

  // ============================================================================
  // Contact Endpoints
  // ============================================================================

  /**
   * Get all contacts
   */
  async getContacts(options?: { offset?: number; limit?: number }): Promise<BexioContact[]> {
    const params = new URLSearchParams();
    if (options?.offset) params.set('offset', options.offset.toString());
    if (options?.limit) params.set('limit', options.limit.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<BexioContact[]>('GET', `/2.0/contact${query}`);
  }

  /**
   * Get a single contact by ID
   */
  async getContact(id: number): Promise<BexioContact> {
    return this.request<BexioContact>('GET', `/2.0/contact/${id}`);
  }

  /**
   * Create a new contact
   */
  async createContact(contact: BexioContactCreate): Promise<BexioContact> {
    return this.request<BexioContact>('POST', '/2.0/contact', contact);
  }

  /**
   * Update an existing contact
   */
  async updateContact(id: number, contact: Partial<BexioContactCreate>): Promise<BexioContact> {
    return this.request<BexioContact>('PUT', `/2.0/contact/${id}`, contact);
  }

  /**
   * Search contacts by criteria
   */
  async searchContacts(criteria: Array<{ field: string; value: string; criteria?: string }>): Promise<BexioContact[]> {
    return this.request<BexioContact[]>('POST', '/2.0/contact/search', criteria);
  }

  // ============================================================================
  // Invoice Endpoints
  // ============================================================================

  /**
   * Get all invoices
   */
  async getInvoices(options?: { offset?: number; limit?: number }): Promise<BexioInvoice[]> {
    const params = new URLSearchParams();
    if (options?.offset) params.set('offset', options.offset.toString());
    if (options?.limit) params.set('limit', options.limit.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<BexioInvoice[]>('GET', `/2.0/kb_invoice${query}`);
  }

  /**
   * Get a single invoice by ID
   */
  async getInvoice(id: number): Promise<BexioInvoice> {
    return this.request<BexioInvoice>('GET', `/2.0/kb_invoice/${id}`);
  }

  /**
   * Create a new invoice
   */
  async createInvoice(invoice: BexioInvoiceCreate): Promise<BexioInvoice> {
    return this.request<BexioInvoice>('POST', '/2.0/kb_invoice', invoice);
  }

  /**
   * Issue an invoice (change status to issued)
   */
  async issueInvoice(id: number): Promise<BexioInvoice> {
    return this.request<BexioInvoice>('POST', `/2.0/kb_invoice/${id}/issue`, {});
  }

  /**
   * Get invoice PDF
   */
  async getInvoicePdf(id: number): Promise<{ name: string; size: number; mime: string; content: string }> {
    return this.request('GET', `/2.0/kb_invoice/${id}/pdf`);
  }

  /**
   * Send invoice by email
   */
  async sendInvoiceEmail(
    id: number,
    options: {
      recipient_email: string;
      subject: string;
      message: string;
      mark_as_open?: boolean;
    }
  ): Promise<{ success: boolean }> {
    return this.request('POST', `/2.0/kb_invoice/${id}/send`, options);
  }
}

/**
 * Create a Bexio client from database dealer record
 */
export function createBexioClient(dealer: {
  id: string;
  bexio_access_token: string;
  bexio_refresh_token: string;
  bexio_token_expires_at: string;
}, onTokenRefresh?: (tokens: { accessToken: string; refreshToken: string; expiresAt: Date }) => Promise<void>): BexioClient {
  return new BexioClient({
    dealerId: dealer.id,
    encryptedAccessToken: dealer.bexio_access_token,
    encryptedRefreshToken: dealer.bexio_refresh_token,
    tokenExpiresAt: new Date(dealer.bexio_token_expires_at),
    onTokenRefresh,
  });
}
