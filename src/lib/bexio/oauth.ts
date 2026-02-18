/**
 * Bexio OAuth 2.0 Helpers
 * 
 * Implements OAuth 2.0 Authorization Code Flow for Bexio API.
 * 
 * Required ENV vars:
 * - BEXIO_CLIENT_ID: Your Bexio OAuth client ID
 * - BEXIO_CLIENT_SECRET: Your Bexio OAuth client secret
 * - BEXIO_REDIRECT_URI: OAuth callback URL (e.g., https://www.dealeros.ch/api/bexio/callback)
 */

// Bexio OAuth endpoints
const BEXIO_AUTH_BASE = 'https://idp.bexio.com/authorize';
const BEXIO_TOKEN_URL = 'https://idp.bexio.com/token';

// Scopes required for DealerOS integration
const BEXIO_SCOPES = [
  'openid',
  'profile',
  'contact_edit',
  'contact_show',
  'kb_invoice_edit',
  'kb_invoice_show',
  'kb_offer_edit',
  'kb_offer_show',
  'article_show',
].join(' ');

export interface BexioTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token?: string;
}

export interface BexioUserInfo {
  sub: string;
  company_id: string;
  company_name: string;
  user_id: string;
  email?: string;
}

/**
 * Get Bexio OAuth configuration
 */
export function getBexioConfig() {
  const clientId = process.env.BEXIO_CLIENT_ID;
  const clientSecret = process.env.BEXIO_CLIENT_SECRET;
  const redirectUri = process.env.BEXIO_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      'Bexio OAuth not configured. Please set BEXIO_CLIENT_ID, BEXIO_CLIENT_SECRET, and BEXIO_REDIRECT_URI environment variables.'
    );
  }

  return { clientId, clientSecret, redirectUri };
}

/**
 * Generate the Bexio OAuth authorization URL
 * @param state - State parameter for CSRF protection (should include dealer_id)
 */
export function generateAuthUrl(state: string): string {
  const { clientId, redirectUri } = getBexioConfig();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: BEXIO_SCOPES,
    state: state,
  });

  return `${BEXIO_AUTH_BASE}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 * @param code - Authorization code from callback
 */
export async function exchangeCodeForTokens(code: string): Promise<BexioTokenResponse> {
  const { clientId, clientSecret, redirectUri } = getBexioConfig();

  const response = await fetch(BEXIO_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Bexio token exchange failed:', errorText);
    throw new Error(`Token exchange failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Refresh an access token using a refresh token
 * @param refreshToken - The refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<BexioTokenResponse> {
  const { clientId, clientSecret } = getBexioConfig();

  const response = await fetch(BEXIO_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Bexio token refresh failed:', errorText);
    throw new Error(`Token refresh failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Revoke a token (for disconnect)
 * @param token - The token to revoke
 */
export async function revokeToken(token: string): Promise<void> {
  const { clientId, clientSecret } = getBexioConfig();

  const response = await fetch('https://idp.bexio.com/revoke', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      token: token,
    }),
  });

  // Revocation can fail silently - token may already be invalid
  if (!response.ok) {
    console.warn('Token revocation failed (may already be revoked)');
  }
}

/**
 * Decode the state parameter (base64 JSON)
 */
export function decodeState(state: string): { dealerId: string; returnUrl?: string } {
  try {
    const decoded = Buffer.from(state, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    throw new Error('Invalid state parameter');
  }
}

/**
 * Encode the state parameter (base64 JSON)
 */
export function encodeState(dealerId: string, returnUrl?: string): string {
  const state = { dealerId, returnUrl, timestamp: Date.now() };
  return Buffer.from(JSON.stringify(state)).toString('base64');
}
